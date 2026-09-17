# Recall

A clean, minimal flashcard app with spaced repetition, built with React, TypeScript, and Tailwind CSS. No backend, no account — everything is stored locally in your browser.

## Features

- **SM-2 spaced repetition** — cards are scheduled using the SM-2 algorithm (`src/utils/sm2.ts`), rated Again / Hard / Good / Easy after each review
- **Deck management** — create, rename, and delete decks; each shows total, due, and new card counts
- **Markdown card faces** — write fronts/backs in Markdown, with a live preview in the editor
- **Review sessions** — flip-card UI with a 3D CSS animation and keyboard shortcuts (Space to flip, 1–4 to rate). Any rating except Easy sends the card to the back of the queue; the session ends once every card is Easy
- **Study any time** — "Study all" drills a whole deck as often as you like; only your first rating of a card per session affects its schedule
- **Mastery mode** — Blooket-style multiple choice using the deck's other answers. Right answer moves a card up a level (Needs review → Familiar → Proficient → Mastered), wrong moves it down, S skips. Finish when every card is mastered. Practice only; it doesn't change review scheduling
- **Shuffle** — toggle on the deck page to randomize review order
- **Stats dashboard** — current streak, cards reviewed today, and a 7-day due forecast
- **Import / export** — export a deck (or import a file containing multiple decks) as JSON. Re-importing merges into decks with the same name and skips cards you already have
- **Dark mode by default**, with a light mode toggle, fully responsive

## Getting started

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

To just use the app (faster and more stable than the dev server):

```bash
npm start
```

This builds the app and serves it on the same port, so your decks are still there. After you open it once, it keeps loading even if the server stops.

## Tests

```bash
npm test
```

Runs the study-logic checks in `scripts/check-study.ts` (needs Node 23.6+ for built-in TypeScript).

## Troubleshooting

- **Decks disappeared:** decks live in the browser's storage for `localhost:5173`. The app always uses port 5173 and won't start on another one, so if you see "port in use", another copy is already running.
- **Server is slow or keeps stopping:** don't keep the project in an iCloud-synced folder (Desktop/Documents with iCloud Drive on). iCloud offloads `node_modules` files, and the dev server stalls while they download again.

## Build

```bash
npm run build
```

Type-checks with `tsc` and produces a production build in `dist/`.

## Project structure

```
src/
  types/       # shared TypeScript types
  utils/       # sm2.ts (scheduling), storage.ts (localStorage), factory.ts, date.ts
  hooks/       # useTheme
  context/     # StoreContext (decks/cards/review state)
  components/  # Dashboard, DeckDetail, ReviewSession, StatsPage, CardEditorModal, etc.
```
