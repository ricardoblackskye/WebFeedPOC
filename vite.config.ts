/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  ssr: {
    // Bundle these packages during SSR (they're ESM but detected as CJS)
    noExternal: ['react-helmet-async', 'react-router-dom', 'react-router']
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
    exclude: [
      'e2e/**',
      'node_modules/**'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test-setup.ts',
        '**/*.test.{js,jsx}',
        '**/*.config.js',
        '**/main.jsx'
      ]
    }
  }
})