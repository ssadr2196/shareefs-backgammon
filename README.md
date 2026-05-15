# Shareefs Backgammon

A mobile-first backgammon game for **Shareefs — The Shawarma Social Club** (Sydney). Built with React 18 + Vite + TypeScript + Tailwind CSS + Framer Motion.

## Quick start

```bash
pnpm install
pnpm dev          # http://localhost:5173
```

## Stack

| Layer | Choice |
|-------|--------|
| Framework | React 18 + Vite 8 + TypeScript |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| State | Zustand (persisted to localStorage) |
| Tests | Vitest |

## Project structure

```
src/
├── game/           # Pure backgammon engine — no React, multiplayer-ready
│   ├── types.ts    # All shared types
│   ├── board.ts    # Board state, queries, pip counts
│   ├── moves.ts    # Legal move generation, applyMove, allLegalTurns
│   ├── dice.ts     # Dice rolling and state
│   ├── win.ts      # Win/gammon/backgammon detection
│   └── __tests__/  # Vitest tests (41 tests)
├── ai/             # AI players — depends only on game/
│   ├── easy.ts     # Random with slight safety preference
│   ├── medium.ts   # Heuristic: hitting, making points, pip count
│   └── hard.ts     # Deep eval: blot exposure, priming, race detection
├── store/
│   └── gameStore.ts  # Zustand store — bridges engine to UI
├── components/
│   ├── Board/      # Board, Point, BarArea, CheckerPiece
│   ├── Dice/       # Die, DiceArea
│   ├── Lobby/      # Lobby screen, ProfileModal
│   ├── GameScreen/ # In-game screen
│   ├── EndGame/    # Result screen
│   ├── HowToPlay/  # Rules modal
│   └── common/     # ArabesquePattern decorator
├── hooks/
│   ├── useSound.ts   # Web Audio API sound effects
│   └── useHaptic.ts  # Navigator vibrate API
└── assets/         # SVG assets (swap for production artwork)
```

## Rules implemented

- Standard 15-checker starting position
- White moves 24 to 1 (direction -1), home board 1-6
- Black moves 1 to 24 (direction +1), home board 19-24
- Doubles: 4 moves
- Must use both dice if legally possible; if only one die can be played, must use the higher
- Bar: must re-enter before any other move; entry blocked on opponent's made points
- Bearing off: allowed when all checkers in home board; overshoot rules correctly handled
- Win detection: normal (1pt), gammon (2pt), backgammon (3pt)

## AI difficulty

| Level | Strategy |
|-------|----------|
| Easy | Random legal move, slight preference for not leaving blots |
| Medium | Heuristic scoring: hit blots, make points, pip count, avoid blots in danger zone |
| Hard | Deep eval: blot exposure probability, prime detection, race vs. contact awareness, anchor play |

## Commands

```bash
pnpm dev          # Dev server
pnpm build        # Production build -> dist/
pnpm preview      # Preview production build locally
pnpm test         # Run Vitest tests
```

## Swapping assets

- `src/assets/logo.svg` — Shareefs wordmark
- `public/favicon.svg` — Tab icon
- Checker colours: `--color-checker-light` / `--color-checker-dark` in `src/index.css`
- Board colours: `--color-point-dark` / `--color-point-light` in `src/index.css`

See [DEPLOY.md](./DEPLOY.md) for hosting instructions.
