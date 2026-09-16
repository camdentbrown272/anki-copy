import type { Card, CardState, Rating } from '../types';
import { toDateKey } from './date';

/**
 * A card is due once its scheduled day has arrived (compared by calendar day,
 * not exact timestamp, so cards reviewed at any time today stay due today).
 */
export function isDue(card: Card, now: Date = new Date()): boolean {
  return toDateKey(new Date(card.dueDate)) <= toDateKey(now);
}

/**
 * Pure SM-2 scheduling step. Given a card and a 0/3/4/5 rating, returns the
 * next card state. Never mutates the input.
 */
export function scheduleCard(card: Card, rating: Rating, now: Date = new Date()): Card {
  const easeFactor = Math.max(
    1.3,
    card.easeFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02))
  );

  let interval: number;
  let repetitions: number;

  if (rating >= 3) {
    if (card.repetitions === 0) {
      interval = 1;
    } else if (card.repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(card.interval * easeFactor);
    }
    repetitions = card.repetitions + 1;
  } else {
    repetitions = 0;
    interval = 1;
  }

  const dueDate = new Date(now);
  dueDate.setDate(dueDate.getDate() + interval);

  const state: CardState = rating < 3 ? 'learning' : repetitions < 3 ? 'learning' : 'review';

  return {
    ...card,
    interval,
    repetitions,
    easeFactor,
    dueDate: dueDate.toISOString(),
    state,
  };
}
