import { useRef, useState } from 'react';
import { useStore, type ImportPayload } from '../context/StoreContext';
import { Modal } from './Modal';
import { EmptyState } from './EmptyState';

interface DashboardProps {
  onOpenDeck: (deckId: string) => void;
}

export function Dashboard({ onOpenDeck }: DashboardProps) {
  const { decks, cardsForDeck, dueCardsForDeck, newCardsForDeck, addDeck, deleteDeck, importDecks } =
    useStore();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreate = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    addDeck(trimmed);
    setName('');
    setCreating(false);
  };

  const confirmDelete = (id: string, deckName: string) => {
    if (confirm(`Delete "${deckName}" and all its cards?`)) deleteDeck(id);
  };

  const handleImportFile = async (file: File) => {
    let payloads: ImportPayload[];
    try {
      const parsed: unknown = JSON.parse(await file.text());
      const list = Array.isArray(parsed) ? parsed : [parsed];
      payloads = list.map((item) => {
        const entry = item as { deck?: { name?: unknown }; cards?: unknown };
        if (!Array.isArray(entry.cards)) throw new Error('missing cards');
        const cards = entry.cards
          .filter(
            (c): c is { front: string; back: string } =>
              typeof c?.front === 'string' && typeof c?.back === 'string'
          )
          .map((c) => ({ front: c.front, back: c.back }))
          .filter((c) => c.front.trim() && c.back.trim());
        const name = typeof entry.deck?.name === 'string' ? entry.deck.name.trim() : '';
        return { name: name || 'Imported deck', cards };
      });
    } catch {
      alert('Could not import this file. Make sure it is a valid exported deck.');
      return;
    }
    const { decksCreated, cardsAdded, duplicatesSkipped } = importDecks(payloads);
    alert(
      `Imported ${cardsAdded} card${cardsAdded === 1 ? '' : 's'}` +
        (decksCreated ? ` into ${decksCreated} new deck${decksCreated === 1 ? '' : 's'}` : '') +
        (duplicatesSkipped ? `. Skipped ${duplicatesSkipped} you already had.` : '.')
    );
  };

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Your decks</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Pick up where you left off, or start something new.
          </p>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleImportFile(file);
              e.target.value = '';
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800"
          >
            Import
          </button>
          <button
            onClick={() => setCreating(true)}
            className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600"
          >
            New deck
          </button>
        </div>
      </div>

      {decks.length === 0 ? (
        <EmptyState
          title="No decks yet"
          description="Create your first deck to start building a spaced-repetition habit."
          action={{ label: 'Create a deck', onClick: () => setCreating(true) }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {decks.map((deck) => {
            const total = cardsForDeck(deck.id).length;
            const due = dueCardsForDeck(deck.id).length;
            const fresh = newCardsForDeck(deck.id).length;
            return (
              <button
                key={deck.id}
                onClick={() => onOpenDeck(deck.id)}
                className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="mb-4 flex items-start justify-between">
                  <h2 className="text-lg font-semibold">{deck.name}</h2>
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label={`Delete ${deck.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmDelete(deck.id, deck.name);
                    }}
                    onKeyDown={(e) => {
                      if (e.key !== 'Enter' && e.key !== ' ') return;
                      e.preventDefault();
                      e.stopPropagation();
                      confirmDelete(deck.id, deck.name);
                    }}
                    className="rounded-md p-1 text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 dark:hover:bg-red-950"
                  >
                    ✕
                  </span>
                </div>
                <div className="flex gap-4 text-sm">
                  <Stat label="Total" value={total} />
                  <Stat label="Due" value={due} accent />
                  <Stat label="New" value={fresh} />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {creating && (
        <Modal title="New deck" onClose={() => setCreating(false)}>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="Deck name"
            className="mb-4 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-700"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setCreating(false)}
              className="rounded-lg px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600"
            >
              Create
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div>
      <div className={accent ? 'font-semibold text-indigo-500' : 'font-semibold'}>{value}</div>
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
    </div>
  );
}
