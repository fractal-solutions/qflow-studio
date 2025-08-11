import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'playwright-core': 'empty-module', // Alias playwright-core to an empty module
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'], // Keep other exclusions if necessary
  },
});