import { useMemo, useState } from 'react';
import { useStore } from '../context/StoreContext';
import type { Card } from '../types';
import { Modal } from './Modal';
import { EmptyState } from './EmptyState';
import { CardEditorModal } from './CardEditorModal';
import type { ReviewMode } from './ReviewSession';

interface DeckDetailProps {
  deckId: string;
  onBack: () => void;
  onStartReview: (mode: ReviewMode) => void;
}

export function DeckDetail({ deckId, onBack, onStartReview }: DeckDetailProps) {
  const { decks, cardsForDeck, dueCardsForDeck, addCard, updateCard, deleteCard, renameDeck } =
    useStore();
  const deck = decks.find((d) => d.id === deckId);
  const [search, setSearch] = useState('');
  const [editingCard, setEditingCard] = useState<Card | 'new' | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState(deck?.name ?? '');

  const cards = cardsForDeck(deckId);
  const dueCount = dueCardsForDeck(deckId).length;

  const filtered = useMemo(
    () =>
      cards.filter(
        (c) =>
          c.front.toLowerCase().includes(search.toLowerCase()) ||
          c.back.toLowerCase().includes(search.toLowerCase())
      ),
    [cards, search]
  );

  if (!deck) {
    return (
      <div className="p-10">
        <p className="text-slate-500">Deck not found.</p>
        <button onClick={onBack} className="mt-4 text-indigo-500 hover:underline">
          Back to decks
        </button>
      </div>
    );
  }

  const handleExport = () => {
    const payload = {
      deck: { name: deck.name },
      cards: cards.map((c) => ({ front: c.front, back: c.back })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${deck.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    // Revoking immediately can cancel the download in some browsers.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const commitRename = () => {
    const trimmed = nameDraft.trim();
    if (trimmed) {
      renameDeck(deckId, trimmed);
      setRenaming(false);
    }
  };

  return (
    <div className="p-6 md:p-10">
      <button onClick={onBack} className="mb-4 text-sm text-slate-500 hover:text-indigo-500">
        ← All decks
      </button>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">{deck.name}</h1>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setNameDraft(deck.name);
              setRenaming(true);
            }}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800"
          >
            Rename
          </button>
          <button
            onClick={handleExport}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800"
          >
            Export
          </button>
          <button
            onClick={() => setEditingCard('new')}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800"
          >
            Add card
          </button>
          <button
            onClick={() => onStartReview('all')}
            disabled={cards.length === 0}
            className="rounded-lg border border-indigo-500 px-4 py-2 text-sm font-medium text-indigo-500 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-indigo-950"
          >
            Study all ({cards.length})
          </button>
          <button
            onClick={() => onStartReview('due')}
            disabled={dueCount === 0}
            className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Review ({dueCount} due)
          </button>
        </div>
      </div>

      {cards.length === 0 ? (
        <EmptyState
          title="This deck is empty"
          description="Add your first card to start reviewing."
          action={{ label: 'Add a card', onClick: () => setEditingCard('new') }}
        />
      ) : (
        <>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cards..."
            className="mb-4 w-full max-w-sm rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-700"
          />
          <div className="flex flex-col gap-2">
            {filtered.map((card) => (
              <div
                key={card.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{card.front || '(empty)'}</div>
                  <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {card.back || '(empty)'}
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  {card.state}
                </span>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => setEditingCard(card)}
                    className="text-xs text-slate-500 hover:text-indigo-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => confirm('Delete this card?') && deleteCard(card.id)}
                    className="text-xs text-slate-500 hover:text-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {renaming && (
        <Modal title="Rename deck" onClose={() => setRenaming(false)}>
          <input
            autoFocus
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && commitRename()}
            className="mb-4 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-700"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setRenaming(false)}
              className="rounded-lg px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={commitRename}
              className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600"
            >
              Save
            </button>
          </div>
        </Modal>
      )}

      {editingCard && (
        <CardEditorModal
          card={editingCard === 'new' ? null : editingCard}
          onClose={() => setEditingCard(null)}
          onSave={(front, back) => {
            if (editingCard === 'new') addCard(deckId, front, back);
            else updateCard(editingCard.id, front, back);
            setEditingCard(null);
          }}
        />
      )}
    </div>
  );
}
