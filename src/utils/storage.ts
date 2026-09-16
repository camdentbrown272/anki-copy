import type { Card, Deck } from '../types';

const DECKS_KEY = 'flashcards:decks';
const CARDS_KEY = 'flashcards:cards';
const LOG_KEY = 'flashcards:reviewLog';
const THEME_KEY = 'flashcards:theme';

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage quota exceeded or unavailable — fail silently
  }
}

export const storage = {
  loadDecks(): Deck[] {
    return loadJSON<Deck[]>(DECKS_KEY, []);
  },
  saveDecks(decks: Deck[]): void {
    saveJSON(DECKS_KEY, decks);
  },
  loadCards(): Card[] {
    return loadJSON<Card[]>(CARDS_KEY, []);
  },
  saveCards(cards: Card[]): void {
    saveJSON(CARDS_KEY, cards);
  },
  loadReviewLog(): string[] {
    return loadJSON<string[]>(LOG_KEY, []);
  },
  saveReviewLog(log: string[]): void {
    saveJSON(LOG_KEY, log);
  },
  loadTheme(): 'dark' | 'light' | null {
    return loadJSON<'dark' | 'light' | null>(THEME_KEY, null);
  },
  saveTheme(theme: 'dark' | 'light'): void {
    saveJSON(THEME_KEY, theme);
  },
};
