import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Card, Deck, Rating } from '../types';
import { storage } from '../utils/storage';
import { createCard, createDeck } from '../utils/factory';
import { scheduleCard, isDue } from '../utils/sm2';

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
  importDeck: (deck: Deck, cards: Card[]) => void;
  importDecks: (items: { deck: Deck; cards: Card[] }[]) => void;
  cardsForDeck: (deckId: string) => Card[];
  dueCardsForDeck: (deckId: string) => Card[];
  newCardsForDeck: (deckId: string) => Card[];
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [decks, setDecks] = useState<Deck[]>(() => storage.loadDecks());
  const [cards, setCards] = useState<Card[]>(() => storage.loadCards());
  const [reviewLog, setReviewLog] = useState<string[]>(() => storage.loadReviewLog());

  const persistDecks = (next: Deck[]) => {
    setDecks(next);
    storage.saveDecks(next);
  };
  const persistCards = (next: Card[]) => {
    setCards(next);
    storage.saveCards(next);
  };
  const persistLog = (next: string[]) => {
    setReviewLog(next);
    storage.saveReviewLog(next);
  };

  const addDeck = (name: string): Deck => {
    const deck = createDeck(name);
    persistDecks([...decks, deck]);
    return deck;
  };

  const renameDeck = (id: string, name: string) => {
    persistDecks(decks.map((d) => (d.id === id ? { ...d, name } : d)));
  };

  const deleteDeck = (id: string) => {
    persistDecks(decks.filter((d) => d.id !== id));
    persistCards(cards.filter((c) => c.deckId !== id));
  };

  const addCard = (deckId: string, front: string, back: string) => {
    persistCards([...cards, createCard(deckId, front, back)]);
  };

  const updateCard = (id: string, front: string, back: string) => {
    persistCards(cards.map((c) => (c.id === id ? { ...c, front, back } : c)));
  };

  const deleteCard = (id: string) => {
    persistCards(cards.filter((c) => c.id !== id));
  };

  const reviewCard = (id: string, rating: Rating) => {
    const card = cards.find((c) => c.id === id);
    if (!card) return;
    const updated = scheduleCard(card, rating);
    persistCards(cards.map((c) => (c.id === id ? updated : c)));
    persistLog([...reviewLog, new Date().toISOString()]);
  };

  const importDeck = (deck: Deck, importedCards: Card[]) => {
    persistDecks([...decks, deck]);
    persistCards([...cards, ...importedCards]);
  };

  const importDecks = (items: { deck: Deck; cards: Card[] }[]) => {
    persistDecks([...decks, ...items.map((item) => item.deck)]);
    persistCards([...cards, ...items.flatMap((item) => item.cards)]);
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
    importDeck,
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
