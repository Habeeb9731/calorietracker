import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'CalorieTracker',
        short_name: 'CalorieAI',
        description: 'AI-powered meal and calorie tracking',
        theme_color: '#10b981',
        background_color: '#f9fafb',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
    }),
  ],
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
