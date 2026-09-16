import { useEffect, useRef, useState } from 'react';
import { useStore } from '../context/StoreContext';
import type { Card, Rating } from '../types';
import { isDue } from '../utils/sm2';
import { MarkdownContent } from './MarkdownContent';
import { EmptyState } from './EmptyState';

export type ReviewMode = 'due' | 'all';

interface ReviewSessionProps {
  deckId: string;
  mode: ReviewMode;
  onExit: () => void;
}

const RATINGS: { rating: Rating; label: string; hint: string; className: string }[] = [
  { rating: 0, label: 'Again', hint: '1', className: 'bg-red-500 hover:bg-red-600' },
  { rating: 3, label: 'Hard', hint: '2', className: 'bg-amber-500 hover:bg-amber-600' },
  { rating: 4, label: 'Good', hint: '3', className: 'bg-emerald-500 hover:bg-emerald-600' },
  { rating: 5, label: 'Easy', hint: '4', className: 'bg-sky-500 hover:bg-sky-600' },
];

const KEY_RATINGS: Record<string, Rating> = { '1': 0, '2': 3, '3': 4, '4': 5 };

export function ReviewSession({ deckId, mode, onExit }: ReviewSessionProps) {
  const { decks, cardsForDeck, dueCardsForDeck, reviewCard } = useStore();
  const deck = decks.find((d) => d.id === deckId);
  const [sessionMode, setSessionMode] = useState<ReviewMode>(mode);
  // Cards still to master this session. Only "Easy" removes a card; any other
  // rating sends it to the back of the queue so it comes around again.
  const [queue, setQueue] = useState<Card[]>(() =>
    mode === 'all' ? cardsForDeck(deckId) : dueCardsForDeck(deckId)
  );
  const [total, setTotal] = useState(queue.length);
  const [flipped, setFlipped] = useState(false);
  // Increments on every rating. Used as the card's React key so the next card
  // mounts already face-down instead of animating back and exposing its answer,
  // and to ignore a second rating of the same turn (double click / key repeat).
  const [turn, setTurn] = useState(0);
  const ratedTurn = useRef(-1);
  // Only the first rating of each card in a session feeds the SM-2 schedule;
  // repeats are practice. Early (not-due) cards only reschedule on "Again".
  const recorded = useRef(new Set<string>());

  const current = queue[0];
  const done = total > 0 && queue.length === 0;

  const rate = (rating: Rating) => {
    if (!current || !flipped || ratedTurn.current === turn) return;
    ratedTurn.current = turn;
    if (!recorded.current.has(current.id)) {
      recorded.current.add(current.id);
      if (isDue(current) || rating === 0) reviewCard(current.id, rating);
    }
    setQueue((q) => (rating === 5 ? q.slice(1) : [...q.slice(1), q[0]]));
    setFlipped(false);
    setTurn((t) => t + 1);
  };

  const restart = (nextMode: ReviewMode) => {
    const next = nextMode === 'all' ? cardsForDeck(deckId) : dueCardsForDeck(deckId);
    recorded.current = new Set();
    setSessionMode(nextMode);
    setQueue(next);
    setTotal(next.length);
    setFlipped(false);
    setTurn((t) => t + 1);
  };

  // Re-bound every render so the handler always sees the current card and turn.
  const rateRef = useRef(rate);
  rateRef.current = rate;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest('input, textarea, [contenteditable="true"]')) return;
      if (e.key === ' ' || e.code === 'Space') {
        // Stop a focused button from also being "clicked" by the space bar.
        e.preventDefault();
        (document.activeElement as HTMLElement | null)?.blur();
        setFlipped((f) => !f);
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        setFlipped(true);
        return;
      }
      if (e.key in KEY_RATINGS) rateRef.current(KEY_RATINGS[e.key]);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (!deck) return null;

  if (total === 0) {
    const hasCards = cardsForDeck(deckId).length > 0;
    return (
      <div className="p-6 md:p-10">
        <EmptyState
          title={sessionMode === 'due' && hasCards ? 'Nothing due right now' : 'This deck is empty'}
          description={
            hasCards
              ? 'Nothing is scheduled yet, but you can study the whole deck anyway.'
              : 'Add some cards to start studying.'
          }
          action={
            hasCards
              ? { label: 'Study all cards', onClick: () => restart('all') }
              : { label: 'Back to deck', onClick: onExit }
          }
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
          You got all {total} card{total === 1 ? '' : 's'} in &ldquo;{deck.name}&rdquo; to Easy.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => restart('all')}
            className="rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-600"
          >
            Study deck again
          </button>
          <button
            onClick={onExit}
            className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800"
          >
            Back to deck
          </button>
        </div>
      </div>
    );
  }

  const mastered = total - queue.length;
  const progress = (mastered / total) * 100;

  return (
    <div className="flex min-h-full flex-col p-6 md:p-10">
      <div className="mb-8 flex items-center justify-between">
        <button onClick={onExit} className="text-sm text-slate-500 hover:text-indigo-500">
          ← Exit
        </button>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {mastered} / {total} easy · {queue.length} left
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
          key={turn}
          className="flip-card h-[min(60vh,520px)] min-h-[280px] w-full max-w-2xl cursor-pointer"
          onClick={() => setFlipped((f) => !f)}
        >
          <div className={`flip-card-inner ${flipped ? 'flipped' : ''}`}>
            <CardFace content={current.front} />
            <CardFace content={current.back} back />
          </div>
        </div>
        <p className="mt-4 text-xs text-slate-400">Tap the card or press Space to flip</p>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
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

function CardFace({ content, back }: { content: string; back?: boolean }) {
  return (
    <div
      className={`flip-card-face flex rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 ${
        back ? 'flip-card-back' : ''
      }`}
    >
      {/* m-auto centers short content but lets long content scroll from the top;
          flex centering would clip the top of an overflowing answer. */}
      <div className="m-auto w-full">
        <MarkdownContent content={content} />
      </div>
    </div>
  );
}
