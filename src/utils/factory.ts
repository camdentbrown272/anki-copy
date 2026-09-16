import type { Card, Deck } from '../types';
import { generateId } from './id';

export function createDeck(name: string): Deck {
  return { id: generateId(), name, createdAt: new Date().toISOString() };
}

export function createCard(deckId: string, front: string, back: string): Card {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    deckId,
    front,
    back,
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    dueDate: now,
    state: 'new',
    createdAt: now,
  };
}
