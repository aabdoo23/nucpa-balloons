import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig({
  base: '/nucpa-balloons.github.io/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://nucpa-balloons.runasp.net',
        changeOrigin: true,
      },
      '/api/balloonHub': {
        target: 'https://nucpa-balloons.runasp.net',
        ws: true,
      },
    },
  },
}) 