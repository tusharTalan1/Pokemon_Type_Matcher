# PokéQuiz – Pokémon Type Matcher

A browser-based quiz game that tests how well you know your Pokémon types. A random Pokémon is pulled live from [PokéAPI](https://pokeapi.co/), and you have to guess its primary type before your lives run out.

## Features

- **Live Pokémon data** — Fetches real Pokémon names, artwork, and types from PokéAPI on every round.
- **Type-matching quiz** — Choose the correct type (Electric, Fire, Water, Grass) from 4 answer options.
- **Scoring & streaks** — Earn points per correct answer, with bonus points for consecutive streaks.
- **XP & leveling** — Gain XP for correct answers and level up, with XP requirements increasing per level.
- **Lives system** — Start with 3 lives; lose one on a wrong answer. Run out and it's Game Over.
- **Result feedback card** — A unified success/failure result card shows after each answer, with a quick type-matchup tip.
- **Responsive design** — Separate optimized stat-bar layouts for desktop and mobile, kept in sync.
- **Persistent state** — Your score, level, streak, lives, and current round are saved to `localStorage`, so a page refresh won't reset your progress.
- **Font Awesome icons** — Type icons rendered with Font Awesome instead of emoji for a more polished look.

## Tech Stack

- **HTML5 / CSS3** — Structure and responsive styling (no CSS framework, custom design system)
- **Vanilla JavaScript** — No frameworks or build tools required
- **[PokéAPI](https://pokeapi.co/)** — Public REST API for Pokémon data
- **Font Awesome** — Icon set for type indicators
- **Google Fonts (Nunito)** — Primary typeface

## Project Structure

```
PokimonType_Matcher/
├── index.html      # Page structure and markup
├── style.css       # All styling, including responsive breakpoints
├── script.js       # Game logic, state management, and PokéAPI integration
└── Assests/        # Images and static assets (Pokédex frame, result card background, etc.)
```

## How to Run

This is a static site with no build step or backend required.

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd PokimonType_Matcher
   ```
2. Open `index.html` directly in a browser, **or** serve it locally (recommended, to avoid any CORS/local-file quirks):
   ```bash
   npx serve .
   ```
   or use the VS Code "Live Server" extension.
3. Play! Guess the type shown for each Pokémon before your lives run out.

## How It Works

- On load, the game fetches and caches a pool of Pokémon for each type from PokéAPI (`/type/{type}`).
- Each round picks a random type, then a random Pokémon from that type's pool, verifying its **actual primary type** (not just the type it was searched under) before showing it.
- Answer choices are shuffled, always including the correct type plus 3 random distractors.
- Correct answers award score + XP and build your streak; wrong answers reset your streak and cost a life.
- Game state (score, level, XP, lives, and the in-progress round) is saved to `localStorage` after every update, so refreshing the page resumes where you left off.

## Known Limitations / Possible Improvements

- No sound effects or music.
- No difficulty settings (all 4 base types are always in the answer pool).
- No online leaderboard — scores are local only.
- Could add more Pokémon types (currently limited to Electric, Fire, Water, Grass).

## Credits

- Pokémon data and artwork via [PokéAPI](https://pokeapi.co/) (fan-made, not affiliated with Nintendo/Game Freak/The Pokémon Company).
- Icons by [Font Awesome](https://fontawesome.com/).
- Font: [Nunito](https://fonts.google.com/specimen/Nunito) via Google Fonts.

## License

This project is for educational/personal use. Pokémon and Pokémon character names are trademarks of Nintendo.