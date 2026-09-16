import { useCallback, useEffect, useState } from 'react';
import { storage } from '../utils/storage';

export type Theme = 'dark' | 'light';

export function useTheme(): { theme: Theme; toggleTheme: () => void } {
  const [theme, setTheme] = useState<Theme>(() => storage.loadTheme() ?? 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    storage.saveTheme(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, toggleTheme };
}
