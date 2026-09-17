import type { Card } from '../types';

type Random = () => number;

/** Fisher–Yates shuffle. Returns a new array. */
export function shuffle<T>(items: T[], random: Random = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Mastery mode (like Blooket's): each correct answer moves a card up one
// level, each wrong answer moves it down one. Level 3 = mastered.
export const MASTERY_LEVELS = ['Needs review', 'Familiar', 'Proficient', 'Mastered'] as const;
export const MASTERED = MASTERY_LEVELS.length - 1;

export function nextLevel(level: number, correct: boolean): number {
  return Math.min(MASTERED, Math.max(0, level + (correct ? 1 : -1)));
}

/**
 * Picks the next unmastered card at random, weighting lower levels so missed
 * cards come up more often, and avoiding an immediate repeat when possible.
 */
export function pickNext(
  cards: Card[],
  levels: Record<string, number>,
  lastId: string | undefined,
  random: Random = Math.random
): Card | undefined {
  const open = cards.filter((c) => (levels[c.id] ?? 0) < MASTERED);
  const pool = open.length > 1 ? open.filter((c) => c.id !== lastId) : open;
  const weights = pool.map((c) => MASTERED - (levels[c.id] ?? 0));
  let roll = random() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < pool.length; i++) {
    roll -= weights[i];
    if (roll < 0) return pool[i];
  }
  return pool[pool.length - 1];
}

/** The card's answer plus up to 3 different answers from the same deck, shuffled. */
export function answerOptions(card: Card, deckCards: Card[], random: Random = Math.random): string[] {
  const others = [...new Set(deckCards.map((c) => c.back))].filter((b) => b !== card.back);
  return shuffle([card.back, ...shuffle(others, random).slice(0, 3)], random);
}
