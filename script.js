"use strict";

const TYPE_COLORS = {
  Electric: "type-electric",
  Fire: "type-fire",
  Water: "type-water",
  Grass: "type-grass",
};

const TYPE_ICONS = {
  Electric: '<i class="fa-solid fa-bolt"></i>',
  Fire: '<i class="fa-solid fa-fire"></i>',
  Water: '<i class="fa-solid fa-droplet"></i>',
  Grass: '<i class="fa-solid fa-leaf"></i>',
};

const ALL_TYPES = Object.keys(TYPE_COLORS);
const POKEAPI_BASE = "https://pokeapi.co/api/v2";

function getXPPerLevel(level) {
  if (level === 1) return 300;
  if (level === 2) return 600;
  return 1000;
}

const state = {
  totalScore: 0,
  streak: 0,
  level: 1,
  currentXP: 0,
  lives: 3,
  xpPerLevel: 300,
  xpPerCorrect: 100,
  scorePerCorrect: 50,
  currentPokemon: null,
  choices: null,
  answered: false,
  typePools: {},
};

function saveState() {
  localStorage.setItem("pokeQuizState", JSON.stringify({
    totalScore: state.totalScore,
    streak: state.streak,
    level: state.level,
    currentXP: state.currentXP,
    lives: state.lives,
    currentPokemon: state.currentPokemon,
    choices: state.choices,
    answered: state.answered,
  }));
}

function loadState() {
  const saved = localStorage.getItem("pokeQuizState");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      state.totalScore = parsed.totalScore ?? 0;
      state.streak = parsed.streak ?? 0;
      state.level = parsed.level ?? 1;
      state.currentXP = parsed.currentXP ?? 0;
      state.lives = parsed.lives ?? 3;
      state.xpPerLevel = getXPPerLevel(state.level);
      if (parsed.currentPokemon && parsed.choices && !parsed.answered) {
        state.currentPokemon = parsed.currentPokemon;
        state.choices = parsed.choices;
        state.answered = false;
      } else {
        state.currentPokemon = null;
        state.choices = null;
        state.answered = false;
      }
    } catch (e) {
    }
  }
}

const dom = {
  levelNums: document.querySelectorAll(".level-num-val"),
  xpTexts: document.querySelectorAll(".xp-text-val"),
  xpBarFills: document.querySelectorAll(".xp-bar-fill-val"),
  totalScores: document.querySelectorAll(".total-score-val"),
  streakCounts: document.querySelectorAll(".streak-count-val"),
  streakBadges: document.querySelectorAll(".streak-badge-val"),
  livesDisplays: document.querySelectorAll(".lives-display, .lives-display2"),
  pokemonArtwork: document.getElementById("pokemon-artwork"),
  nameDisplay: document.getElementById("pokemon-name-display"),
  questionText: document.getElementById("question-text"),
  buttons: Array.from(document.querySelectorAll(".answer-btn")),
  loadingOverlay: document.getElementById("pokedex-loading"),
  errorOverlay: document.getElementById("pokedex-error"),
  errorMessage: document.getElementById("error-message"),
  retryBtn: document.getElementById("retry-btn"),
  resultOverlay: document.getElementById("result-overlay"),
  resultCard: document.getElementById("result-card"),
  resultLevel: document.getElementById("result-level"),
  resultIconContainer: document.getElementById("result-icon-container"),
  resultHeading: document.getElementById("result-heading"),
  resultSub: document.getElementById("result-sub"),
  resultTip: document.getElementById("result-tip"),
  resultNextBtn: document.getElementById("result-next-btn"),
};

const TYPE_TIPS = {
  Electric: "Electric types are strong against Water and Flying!",
  Fire: "Fire types are strong against Grass, Ice, Bug, and Steel!",
  Water: "Water types are strong against Fire, Ground, and Rock!",
  Grass: "Grass types are strong against Water, Ground, and Rock!",
};
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildChoices(correctType) {
  const wrong = shuffle(ALL_TYPES.filter((t) => t !== correctType));
  return shuffle([correctType, ...wrong.slice(0, 3)]);
}



async function fetchTypePool(type) {
  const res = await fetch(`${POKEAPI_BASE}/type/${type.toLowerCase()}`);
  if (!res.ok) throw new Error(`Failed to load ${type} Pokémon list`);
  const data = await res.json();
  return data.pokemon.map((p) => p.pokemon);
}

async function ensureTypePools() {
  const missing = ALL_TYPES.filter((t) => !state.typePools[t]);
  if (missing.length === 0) return;
  const results = await Promise.all(missing.map(fetchTypePool));
  missing.forEach((type, i) => {
    state.typePools[type] = results[i];
  });
}

async function fetchRandomPokemonOfType(type, attemptsLeft = 8) {
  if (attemptsLeft <= 0) {
    throw new Error(`Could not find a valid ${type}-primary Pokémon`);
  }

  const pool = state.typePools[type];
  const entry = pool[Math.floor(Math.random() * pool.length)];
  const res = await fetch(entry.url);
  if (!res.ok) throw new Error(`Failed to load ${entry.name}`);
  const data = await res.json();

  const primaryTypeEntry = data.types.find((t) => t.slot === 1);
  const primaryType = primaryTypeEntry
    ? capitalize(primaryTypeEntry.type.name)
    : null;

  if (!primaryType || !ALL_TYPES.includes(primaryType)) {
    return fetchRandomPokemonOfType(type, attemptsLeft - 1);
  }

  const artwork =
    data.sprites?.other?.["official-artwork"]?.front_default ||
    data.sprites?.front_default;
  if (!artwork) {
    return fetchRandomPokemonOfType(type, attemptsLeft - 1);
  }

  return { name: data.name, img: artwork, type: primaryType };
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function preloadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Image failed to load"));
    img.src = src;
  });
}

function showLoading() {
  dom.loadingOverlay.classList.add("show");
  dom.errorOverlay.classList.remove("show");
}

function hideLoading() {
  dom.loadingOverlay.classList.remove("show");
}

function showError(message) {
  dom.errorMessage.textContent = message;
  dom.errorOverlay.classList.add("show");
  dom.loadingOverlay.classList.remove("show");
}

function hideError() {
  dom.errorOverlay.classList.remove("show");
}

async function renderRound() {
  if (state.currentPokemon && state.choices) {
    state.answered = true;
    dom.buttons.forEach((b) => (b.disabled = true));
    try {
      await preloadImage(state.currentPokemon.img);
      dom.pokemonArtwork.src = state.currentPokemon.img;
      dom.pokemonArtwork.alt = state.currentPokemon.name;
      dom.nameDisplay.querySelector("#poke-name-text").textContent = state.currentPokemon.name;
      dom.questionText.textContent = "What type is this Pokémon?";
      dom.buttons.forEach((btn, i) => {
        const type = state.choices[i];
        btn.className = `answer-btn ${TYPE_COLORS[type]}`;
        btn.dataset.type = type;
        btn.disabled = false;
        btn.innerHTML = `
          <span class="type-icon">${TYPE_ICONS[type]}</span>
          <span class="type-label">${type}</span>
        `;
      });
      state.answered = false;
      return;
    } catch (err) {
    }
  }

  state.answered = true;
  showLoading();
  hideError();
  dom.buttons.forEach((b) => (b.disabled = true));

  try {
    await ensureTypePools();

    const correctType = ALL_TYPES[Math.floor(Math.random() * ALL_TYPES.length)];
    const pokemon = await fetchRandomPokemonOfType(correctType);
    await preloadImage(pokemon.img);

    state.currentPokemon = pokemon;
    state.choices = buildChoices(pokemon.type);

    dom.pokemonArtwork.src = pokemon.img;
    dom.pokemonArtwork.alt = pokemon.name;
    dom.nameDisplay.querySelector("#poke-name-text").textContent = pokemon.name;
    dom.questionText.textContent = "What type is this Pokémon?";

    dom.buttons.forEach((btn, i) => {
      const type = state.choices[i];
      btn.className = `answer-btn ${TYPE_COLORS[type]}`;
      btn.dataset.type = type;
      btn.disabled = false;
      btn.innerHTML = `
        <span class="type-icon">${TYPE_ICONS[type]}</span>
        <span class="type-label">${type}</span>
      `;
    });

    state.answered = false;
    saveState();
    hideLoading();
  } catch (err) {
    console.error(err);
    showError("Could not load Pokémon. Check your connection and try again.");
  }
}

function handleAnswer(btn) {
  if (state.answered) return;
  state.answered = true;

  const chosen = btn.dataset.type;
  const correct = state.currentPokemon.type;
  const isRight = chosen === correct;

  dom.buttons.forEach((b) => (b.disabled = true));

  if (isRight) {
    btn.classList.add("correct");
    state.streak++;
    state.totalScore +=
      state.scorePerCorrect + (state.streak > 1 ? (state.streak - 1) * 10 : 0);
    awardXP(state.xpPerCorrect);
    dom.streakBadges.forEach((badge) => badge.classList.add("pulse"));
    setTimeout(() => dom.streakBadges.forEach((badge) => badge.classList.remove("pulse")), 500);
    setTimeout(() => showResultCard(true, correct), 600);
  } else {
    btn.classList.add("wrong");
    dom.buttons.forEach((b) => {
      if (b.dataset.type === correct) b.classList.add("correct");
    });
    state.streak = 0;
    state.lives--;
    saveState();
    updateStats();
    if (state.lives <= 0) {
      setTimeout(() => showGameOver(correct), 600);
    } else {
      setTimeout(() => showResultCard(false, correct), 600);
    }
  }
}



dom.buttons.forEach((btn) => {
  btn.addEventListener("click", () => handleAnswer(btn));
  btn.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      handleAnswer(btn);
    }
  });
});




renderRound();