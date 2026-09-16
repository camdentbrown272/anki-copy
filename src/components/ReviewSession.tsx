import { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import type { Card, Rating } from '../types';
import { MarkdownContent } from './MarkdownContent';
import { EmptyState } from './EmptyState';

interface ReviewSessionProps {
  deckId: string;
  onExit: () => void;
}

const RATINGS: { rating: Rating; label: string; hint: string; className: string }[] = [
  { rating: 0, label: 'Again', hint: '1', className: 'bg-red-500 hover:bg-red-600' },
  { rating: 3, label: 'Hard', hint: '2', className: 'bg-amber-500 hover:bg-amber-600' },
  { rating: 4, label: 'Good', hint: '3', className: 'bg-emerald-500 hover:bg-emerald-600' },
  { rating: 5, label: 'Easy', hint: '4', className: 'bg-sky-500 hover:bg-sky-600' },
];

export function ReviewSession({ deckId, onExit }: ReviewSessionProps) {
  const { decks, dueCardsForDeck, reviewCard } = useStore();
  const deck = decks.find((d) => d.id === deckId);
  const [queue] = useState<Card[]>(() => dueCardsForDeck(deckId));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const current = queue[index];
  const done = index >= queue.length;

  const rate = (rating: Rating) => {
    if (!current) return;
    reviewCard(current.id, rating);
    setFlipped(false);
    setIndex((i) => i + 1);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (done) return;
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setFlipped((f) => !f);
        return;
      }
      if (!flipped) return;
      const map: Record<string, Rating> = { '1': 0, '2': 3, '3': 4, '4': 5 };
      if (e.key in map) {
        rate(map[e.key]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flipped, index, done]);

  if (!deck) return null;

  if (queue.length === 0) {
    return (
      <div className="p-6 md:p-10">
        <EmptyState
          title="Nothing due right now"
          description="Great job staying on top of your reviews. Check back later or add more cards."
          action={{ label: 'Back to deck', onClick: onExit }}
        />
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center p-10 text-center">
        <div className="mb-4 text-4xl">🎉</div>
        <h2 className="text-xl font-semibold">Session complete</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          You reviewed {queue.length} card{queue.length === 1 ? '' : 's'} in &ldquo;{deck.name}
          &rdquo;.
        </p>
        <button
          onClick={onExit}
          className="mt-6 rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-600"
        >
          Back to deck
        </button>
      </div>
    );
  }

  const progress = (index / queue.length) * 100;

  return (
    <div className="flex min-h-full flex-col p-6 md:p-10">
      <div className="mb-8 flex items-center justify-between">
        <button onClick={onExit} className="text-sm text-slate-500 hover:text-indigo-500">
          ← Exit
        </button>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {index + 1} / {queue.length}
        </span>
      </div>

      <div className="mb-8 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center">
        <div
          className="flip-card w-full max-w-xl cursor-pointer"
          style={{ height: 320 }}
          onClick={() => setFlipped((f) => !f)}
        >
          <div className={`flip-card-inner ${flipped ? 'flipped' : ''}`}>
            <div className="flip-card-face flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <MarkdownContent content={current.front} />
            </div>
            <div className="flip-card-face flip-card-back flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <MarkdownContent content={current.back} />
            </div>
          </div>
        </div>
        <p className="mt-4 text-xs text-slate-400">Tap the card or press Space to flip</p>
      </div>

      <div className="mt-8 flex justify-center gap-3">
        {flipped ? (
          RATINGS.map((r) => (
            <button
              key={r.rating}
              onClick={() => rate(r.rating)}
              className={`flex min-w-[84px] flex-col items-center rounded-lg px-4 py-2.5 text-sm font-medium text-white ${r.className}`}
            >
              {r.label}
              <span className="text-[10px] opacity-75">{r.hint}</span>
            </button>
          ))
        ) : (
          <button
            onClick={() => setFlipped(true)}
            className="rounded-lg bg-indigo-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-600"
          >
            Show answer
          </button>
        )}
      </div>
    </div>
  );
}
