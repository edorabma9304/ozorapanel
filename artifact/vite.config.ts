/**
 * Build statis permainan Jelajah Dunia — satu folder tanpa server.
 * Berbeda dari `vite.config.ts` utama: tanpa TanStack Router, `base` relatif
 * supaya hasilnya bisa dibuka dari subfolder atau berkas mana pun.
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@driver': fileURLToPath(new URL('../src/lib/adapter/mock.ts', import.meta.url)),
      '@': fileURLToPath(new URL('../src', import.meta.url)),
    },
  },
  build: {
    target: 'es2022',
    outDir: fileURLToPath(new URL('../dist-game', import.meta.url)),
    emptyOutDir: true,
    sourcemap: false,
  },
})
