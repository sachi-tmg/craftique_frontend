// vite.config.ts
import react from '@vitejs/plugin-react';
import path from 'path'; // <-- ADD THIS LINE
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: { // <-- ADD THIS BLOCK
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})