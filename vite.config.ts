import { loadEnv } from 'vite'
 import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { fileURLToPath, URL } from 'node:url'

const DRIVER_SAH = ['mock', 'supabase', 'rest'] as const

export default defineConfig(({ mode }) => {
  // Driver data dipilih saat build, jadi hanya SATU berkas driver yang ikut
  // ke dalam bundle. Memakai `mock` berarti kode Supabase tidak pernah
  // terkirim ke browser.
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const driver = (DRIVER_SAH as readonly string[]).includes(env['VITE_DATA_DRIVER'] ?? '')
    ? env['VITE_DATA_DRIVER']!
    : 'mock'

  return {
    plugins: [
      // Harus sebelum plugin react — plugin ini yang membangkitkan routeTree.gen.ts
      tanstackRouter({
        target: 'react',
        routesDirectory: './src/routes',
        generatedRouteTree: './src/routeTree.gen.ts',
        autoCodeSplitting: true,
      }),
      react(),
      tailwindcss(),
    ],

    resolve: {
      alias: {
        '@driver': fileURLToPath(new URL(`./src/lib/adapter/${driver}.ts`, import.meta.url)),
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },

    server: { port: 5180, host: true },
    preview: { port: 5181 },

    build: {
      target: 'es2022',
      sourcemap: false,
      // ApexCharts memang besar, tapi selalu dimuat malas — bukan bagian
      // dari bundle awal, jadi ambang peringatan dinaikkan dengan sadar.
      chunkSizeWarningLimit: 950,
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (!id.includes('node_modules')) return
            // Pola harus tepat: '/react/' yang longgar ikut menyapu
            // @radix-ui/react-* dan membuat chunk react membengkak.
            if (id.includes('apexcharts')) return 'vendor-charts'
            if (id.includes('@supabase')) return 'vendor-supabase'
            if (/node_modules\/(\.pnpm\/)?(react|react-dom|scheduler)[@/]/.test(id)) return 'vendor-react'
            if (id.includes('@tanstack')) return 'vendor-tanstack'
            if (id.includes('@radix-ui')) return 'vendor-radix'
            return
          },
        },
      },
    },

    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      globals: true,
      css: false,
    },
  }
})
