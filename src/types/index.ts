export type CardState = 'new' | 'learning' | 'review';

export interface Card {
  id: string;
  deckId: string;
  front: string;
  back: string;
  interval: number;
  repetitions: number;
  easeFactor: number;
  dueDate: string;
  state: CardState;
  createdAt: string;
}

export interface Deck {
  id: string;
  name: string;
  createdAt: string;
}

export type Rating = 0 | 3 | 4 | 5;
