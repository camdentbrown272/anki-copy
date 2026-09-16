# Recall

A clean, minimal flashcard app with spaced repetition, built with React, TypeScript, and Tailwind CSS. No backend, no account — everything is stored locally in your browser.

## Features

- **SM-2 spaced repetition** — cards are scheduled using the SM-2 algorithm (`src/utils/sm2.ts`), rated Again / Hard / Good / Easy after each review
- **Deck management** — create, rename, and delete decks; each shows total, due, and new card counts
- **Markdown card faces** — write fronts/backs in Markdown, with a live preview in the editor
- **Review sessions** — flip-card UI with a 3D CSS animation, a progress bar, and keyboard shortcuts (Space to flip, 1–4 to rate)
- **Stats dashboard** — current streak, cards reviewed today, and a 7-day due forecast
- **Import / export** — export a deck (or import a file containing multiple decks) as JSON
- **Dark mode by default**, with a light mode toggle, fully responsive

## Getting started

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

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
