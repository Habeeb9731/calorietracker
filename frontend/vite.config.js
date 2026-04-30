import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth': 'http://localhost:5001',
      '/meals': 'http://localhost:5001',
      '/analyze-food': 'http://localhost:5001',
      '/foods': 'http://localhost:5001',
      '/uploads': 'http://localhost:5001',
    },
  },
});
