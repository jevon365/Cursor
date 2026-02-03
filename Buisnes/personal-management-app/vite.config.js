import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// For GitHub Pages: base path must match the URL path (e.g. /personal-management-app/)
export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES === 'true' ? '/personal-management-app/' : '/',
  server: {
    port: 5174,
    host: true,
    open: true,
  },
});
