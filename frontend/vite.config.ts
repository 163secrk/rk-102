import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3102,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8102',
        changeOrigin: true,
      },
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          '@brand-color': '#d4af37',
          '@brand-color-hover': '#e8c547',
          '@brand-color-focus': '#b8962e',
          '@bg-color-container': 'rgba(30, 41, 59, 0.7)',
          '@bg-color-page': '#0a0f1f',
          '@font-color-placeholder': 'rgba(148, 163, 184, 0.6)',
          '@border-level-1-color': 'rgba(212, 175, 55, 0.2)',
        },
        javascriptEnabled: true,
      },
    },
  },
});
