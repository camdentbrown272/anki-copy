import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Card, Deck, Rating } from '../types';
import { storage } from '../utils/storage';
import { createCard, createDeck } from '../utils/factory';
import { scheduleCard, isDue } from '../utils/sm2';

export interface ImportPayload {
  name: string;
  cards: { front: string; back: string }[];
}

export interface ImportResult {
  decksCreated: number;
  cardsAdded: number;
  duplicatesSkipped: number;
}

interface StoreValue {
  decks: Deck[];
  cards: Card[];
  reviewLog: string[];
  addDeck: (name: string) => Deck;
  renameDeck: (id: string, name: string) => void;
  deleteDeck: (id: string) => void;
  addCard: (deckId: string, front: string, back: string) => void;
  updateCard: (id: string, front: string, back: string) => void;
  deleteCard: (id: string) => void;
  reviewCard: (id: string, rating: Rating) => void;
  importDecks: (payloads: ImportPayload[]) => ImportResult;
  cardsForDeck: (deckId: string) => Card[];
  dueCardsForDeck: (deckId: string) => Card[];
  newCardsForDeck: (deckId: string) => Card[];
}

const StoreContext = createContext<StoreValue | null>(null);

const normalize = (text: string) => text.trim().toLowerCase();

export function StoreProvider({ children }: { children: ReactNode }) {
  const [decks, setDecks] = useState<Deck[]>(() => storage.loadDecks());
  const [cards, setCards] = useState<Card[]>(() => storage.loadCards());
  const [reviewLog, setReviewLog] = useState<string[]>(() => storage.loadReviewLog());

  // Updates go through functional setters so rapid actions (double clicks,
  // fast key presses) never overwrite each other with a stale copy.
  const updateDecks = (fn: (prev: Deck[]) => Deck[]) =>
    setDecks((prev) => {
      const next = fn(prev);
      storage.saveDecks(next);
      return next;
    });
  const updateCards = (fn: (prev: Card[]) => Card[]) =>
    setCards((prev) => {
      const next = fn(prev);
      storage.saveCards(next);
      return next;
    });
  const updateLog = (fn: (prev: string[]) => string[]) =>
    setReviewLog((prev) => {
      const next = fn(prev);
      storage.saveReviewLog(next);
      return next;
    });

  // Keep multiple open tabs in sync instead of letting one tab overwrite the other.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.storageArea !== localStorage) return;
      setDecks(storage.loadDecks());
      setCards(storage.loadCards());
      setReviewLog(storage.loadReviewLog());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const addDeck = (name: string): Deck => {
    const deck = createDeck(name);
    updateDecks((prev) => [...prev, deck]);
    return deck;
  };

  const renameDeck = (id: string, name: string) => {
    updateDecks((prev) => prev.map((d) => (d.id === id ? { ...d, name } : d)));
  };

  const deleteDeck = (id: string) => {
    updateDecks((prev) => prev.filter((d) => d.id !== id));
    updateCards((prev) => prev.filter((c) => c.deckId !== id));
  };

  const addCard = (deckId: string, front: string, back: string) => {
    const card = createCard(deckId, front, back);
    updateCards((prev) => [...prev, card]);
  };

  const updateCard = (id: string, front: string, back: string) => {
    updateCards((prev) => prev.map((c) => (c.id === id ? { ...c, front, back } : c)));
  };

  const deleteCard = (id: string) => {
    updateCards((prev) => prev.filter((c) => c.id !== id));
  };

  const reviewCard = (id: string, rating: Rating) => {
    const now = new Date();
    updateCards((prev) => prev.map((c) => (c.id === id ? scheduleCard(c, rating, now) : c)));
    updateLog((prev) => [...prev, now.toISOString()]);
  };

  /**
   * Imports decks, merging into an existing deck with the same name and
   * skipping cards whose front already exists there, so re-importing a file
   * never creates duplicates or resets progress.
   */
  const importDecks = (payloads: ImportPayload[]): ImportResult => {
    const result: ImportResult = { decksCreated: 0, cardsAdded: 0, duplicatesSkipped: 0 };
    const nextDecks = [...decks];
    const newCards: Card[] = [];
    const frontsByDeck = new Map<string, Set<string>>();
    for (const card of cards) {
      if (!frontsByDeck.has(card.deckId)) frontsByDeck.set(card.deckId, new Set());
      frontsByDeck.get(card.deckId)!.add(normalize(card.front));
    }

    for (const payload of payloads) {
      let deck = nextDecks.find((d) => normalize(d.name) === normalize(payload.name));
      if (!deck) {
        deck = createDeck(payload.name);
        nextDecks.push(deck);
        result.decksCreated += 1;
      }
      const fronts = frontsByDeck.get(deck.id) ?? new Set<string>();
      frontsByDeck.set(deck.id, fronts);
      for (const { front, back } of payload.cards) {
        if (fronts.has(normalize(front))) {
          result.duplicatesSkipped += 1;
          continue;
        }
        fronts.add(normalize(front));
        newCards.push(createCard(deck.id, front, back));
        result.cardsAdded += 1;
      }
    }

    updateDecks(() => nextDecks);
    updateCards((prev) => [...prev, ...newCards]);
    return result;
  };

  const cardsForDeck = (deckId: string) => cards.filter((c) => c.deckId === deckId);
  const dueCardsForDeck = (deckId: string) =>
    cards.filter((c) => c.deckId === deckId && isDue(c));
  const newCardsForDeck = (deckId: string) =>
    cards.filter((c) => c.deckId === deckId && c.state === 'new');

  const value: StoreValue = {
    decks,
    cards,
    reviewLog,
    addDeck,
    renameDeck,
    deleteDeck,
    addCard,
    updateCard,
    deleteCard,
    reviewCard,
    importDecks,
    cardsForDeck,
    dueCardsForDeck,
    newCardsForDeck,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
