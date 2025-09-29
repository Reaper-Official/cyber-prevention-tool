import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  define: {
    'import.meta.env.VITE_REQUIRE_APPROVAL': JSON.stringify(process.env.VITE_REQUIRE_APPROVAL || 'true')
  }
});