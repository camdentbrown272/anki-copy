import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Decks live in localStorage, which is tied to the exact origin (host + port).
// If Vite silently moved to 5174 your decks would look like they vanished, so
// always use 5173 and fail loudly if it's taken.
const port = 5173;

export default defineConfig({
  plugins: [react()],
  server: { host: 'localhost', port, strictPort: true },
  preview: { host: 'localhost', port, strictPort: true },
});
