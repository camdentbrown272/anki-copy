import type { Theme } from '../hooks/useTheme';

interface SidebarProps {
  active: string;
  onNavigateDashboard: () => void;
  onNavigateStats: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export function Sidebar({
  active,
  onNavigateDashboard,
  onNavigateStats,
  theme,
  onToggleTheme,
}: SidebarProps) {
  return (
    <aside className="flex w-full flex-row items-center gap-2 border-b border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/40 md:w-56 md:flex-col md:items-stretch md:border-b-0 md:border-r md:p-4">
      <div className="mb-0 flex items-center gap-2 px-1 md:mb-8 md:px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 font-bold text-white">
          R
        </div>
        <span className="text-lg font-semibold">Recall</span>
      </div>
      <nav className="flex flex-1 flex-row gap-1 md:flex-col">
        <button
          onClick={onNavigateDashboard}
          className={navClass(active !== 'stats')}
        >
          Decks
        </button>
        <button onClick={onNavigateStats} className={navClass(active === 'stats')}>
          Stats
        </button>
      </nav>
      <button
        onClick={onToggleTheme}
        className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 md:mt-4"
      >
        {theme === 'dark' ? 'Light mode' : 'Dark mode'}
      </button>
    </aside>
  );
}

function navClass(isActive: boolean): string {
  return [
    'rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors',
    isActive
      ? 'bg-indigo-500 text-white'
      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
  ].join(' ');
}
