import { useEffect, useRef, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { MASTERED, MASTERY_LEVELS, answerOptions, nextLevel, pickNext } from '../utils/study';
import { MarkdownContent } from './MarkdownContent';
import { EmptyState } from './EmptyState';

interface MasterySessionProps {
  deckId: string;
  onExit: () => void;
}

// Practice only: mastery answers don't change the SM-2 review schedule.
export function MasterySession({ deckId, onExit }: MasterySessionProps) {
  const { decks, cardsForDeck } = useStore();
  const deck = decks.find((d) => d.id === deckId);
  const [cards] = useState(() => cardsForDeck(deckId));
  const [levels, setLevels] = useState<Record<string, number>>({});
  const [current, setCurrent] = useState(() => pickNext(cards, {}, undefined));
  const [options, setOptions] = useState(() => (current ? answerOptions(current, cards) : []));
  const [picked, setPicked] = useState<string | null>(null);

  const mastered = cards.filter((c) => (levels[c.id] ?? 0) >= MASTERED).length;
  const level = current ? levels[current.id] ?? 0 : 0;

  const goNext = (nextLevels: Record<string, number>) => {
    const next = pickNext(cards, nextLevels, current?.id);
    setCurrent(next);
    setOptions(next ? answerOptions(next, cards) : []);
    setPicked(null);
  };

  const choose = (option: string) => {
    if (!current || picked !== null) return;
    setPicked(option);
    setLevels((l) => ({ ...l, [current.id]: nextLevel(l[current.id] ?? 0, option === current.back) }));
  };

  const restart = () => {
    setLevels({});
    goNext({});
  };

  const actions = useRef({ choose, goNext, skip: () => goNext(levels), options, picked, levels });
  actions.current = { choose, goNext, skip: () => goNext(levels), options, picked, levels };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
      const a = actions.current;
      if (a.picked === null) {
        const option = a.options[Number(e.key) - 1];
        if (option !== undefined) a.choose(option);
        else if (e.key.toLowerCase() === 's') a.skip();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        a.goNext(a.levels);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (!deck) return null;

  if (cards.length === 0) {
    return (
      <div className="p-6 md:p-10">
        <EmptyState
          title="This deck is empty"
          description="Add some cards to start mastering them."
          action={{ label: 'Back to deck', onClick: onExit }}
        />
      </div>
    );
  }

  if (!current) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center p-10 text-center">
        <div className="mb-4 text-4xl">🏆</div>
        <h2 className="text-xl font-semibold">Deck mastered</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          All {cards.length} cards in &ldquo;{deck.name}&rdquo; answered right 3 times.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={restart}
            className="rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-600"
          >
            Play again
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

  const correct = picked === current.back;

  return (
    <div className="flex min-h-full flex-col p-6 md:p-10">
      <div className="mb-8 flex items-center justify-between">
        <button onClick={onExit} className="text-sm text-slate-500 hover:text-indigo-500">
          ← Exit
        </button>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {mastered} / {cards.length} mastered
        </span>
      </div>

      <div className="mb-8 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${(mastered / cards.length) * 100}%` }}
        />
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
        <div className="mb-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex gap-1" aria-hidden>
            {[1, 2, 3].map((i) => (
              <span
                key={i}
                className={`h-2 w-6 rounded-full ${i <= level ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}
              />
            ))}
          </span>
          {MASTERY_LEVELS[level]}
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 text-lg shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <MarkdownContent content={current.front} />
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {options.map((option, i) => {
            const state =
              picked === null
                ? 'border-slate-200 hover:border-indigo-500 dark:border-slate-800'
                : option === current.back
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10'
                  : option === picked
                    ? 'border-red-500 bg-red-50 dark:bg-red-500/10'
                    : 'border-slate-200 opacity-50 dark:border-slate-800';
            return (
              <button
                key={option}
                onClick={() => choose(option)}
                disabled={picked !== null}
                className={`flex max-h-64 gap-3 overflow-y-auto rounded-xl border-2 bg-white p-4 text-left text-sm transition dark:bg-slate-900 ${state}`}
              >
                <span className="font-semibold text-slate-400">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <MarkdownContent content={option} />
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {picked === null ? (
            <button
              onClick={() => goNext(levels)}
              className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800"
            >
              Skip <span className="text-[10px] opacity-60">S</span>
            </button>
          ) : (
            <>
              <span className={`text-sm font-semibold ${correct ? 'text-emerald-500' : 'text-red-500'}`}>
                {correct ? 'Correct! Up one level' : 'Not quite. Right answer in green'}
              </span>
              <button
                onClick={() => goNext(levels)}
                className="rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-600"
              >
                Next <span className="text-[10px] opacity-75">Enter</span>
              </button>
            </>
          )}
        </div>
        <p className="mt-4 text-center text-xs text-slate-400">
          Press 1–4 to answer · S to skip · Enter for next
        </p>
      </div>
    </div>
  );
}
