import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode`. Use '' as the third argument to load all environment variables.
  // Fix: use type assertion to access process.cwd() in environments where Node types might be missing or restricted.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Replaces 'process.env.API_KEY' in the code with the actual string from the environment.
      // This is crucial for Gemini API initialization.
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
    },
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
    }
  };
});