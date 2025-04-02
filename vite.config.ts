import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/nucpa-balloons.github.io/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
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