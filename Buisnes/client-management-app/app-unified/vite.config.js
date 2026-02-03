import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '127.0.0.1', // use IPv4 so Chrome/localhost connects reliably
    open: true
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.test.{jsx,js}', 'src/**/*.a11y.test.{jsx,js}', 'src/**/*.spec.{jsx,js}'],
    css: true,
  },
})
