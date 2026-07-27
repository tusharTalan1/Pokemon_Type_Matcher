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

function updateStats() {
  dom.levelNums.forEach((el) => (el.textContent = state.level));
  dom.xpTexts.forEach((el) => (el.textContent = `${state.currentXP} / ${state.xpPerLevel} XP`));
  dom.xpBarFills.forEach((el) => (el.style.width = `${(state.currentXP / state.xpPerLevel) * 100}%`));
  dom.totalScores.forEach((el) => (el.textContent = state.totalScore));
  dom.streakCounts.forEach((el) => (el.textContent = state.streak));

  const hearts = "❤️".repeat(Math.max(0, state.lives)) + "🖤".repeat(Math.max(0, 3 - state.lives));
  dom.livesDisplays.forEach((el) => (el.textContent = hearts));
}

dom.streakBadges.forEach((badge) => badge.classList.add("pulse"));
setTimeout(() => dom.streakBadges.forEach((badge) => badge.classList.remove("pulse")), 500);

