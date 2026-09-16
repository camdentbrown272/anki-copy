import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { DeckDetail } from './components/DeckDetail';
import { ReviewSession } from './components/ReviewSession';
import { StatsPage } from './components/StatsPage';
import type { ReviewMode } from './components/ReviewSession';
import { useTheme } from './hooks/useTheme';

type View =
  | { name: 'dashboard' }
  | { name: 'deck'; deckId: string }
  | { name: 'review'; deckId: string; mode: ReviewMode }
  | { name: 'stats' };

export default function App() {
  const [view, setView] = useState<View>({ name: 'dashboard' });
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex h-screen flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 md:flex-row">
      <Sidebar
        active={view.name}
        onNavigateDashboard={() => setView({ name: 'dashboard' })}
        onNavigateStats={() => setView({ name: 'stats' })}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <main className="min-w-0 flex-1 overflow-y-auto">
        {view.name === 'dashboard' && (
          <Dashboard onOpenDeck={(deckId) => setView({ name: 'deck', deckId })} />
        )}
        {view.name === 'deck' && (
          <DeckDetail
            deckId={view.deckId}
            onBack={() => setView({ name: 'dashboard' })}
            onStartReview={(mode) => setView({ name: 'review', deckId: view.deckId, mode })}
          />
        )}
        {view.name === 'review' && (
          <ReviewSession
            key={`${view.deckId}-${view.mode}`}
            deckId={view.deckId}
            mode={view.mode}
            onExit={() => setView({ name: 'deck', deckId: view.deckId })}
          />
        )}
        {view.name === 'stats' && <StatsPage />}
      </main>
    </div>
  );
}
