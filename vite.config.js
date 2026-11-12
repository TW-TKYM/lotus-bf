import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import process from 'node:process'

export default defineConfig({
  base: '/lotus-bf/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    allowedHosts: ['hpc.psy.ntu.edu.tw'],
    host: "0.0.0.0",
    port: 3000,
    // Override with LOTUS_API_URL when the Flask API is not running locally.
    proxy: {
      '/terms': { target: process.env.LOTUS_API_URL || 'http://127.0.0.1:5000', changeOrigin: true },
      '/query': { target: process.env.LOTUS_API_URL || 'http://127.0.0.1:5000', changeOrigin: true },
      '/help': { target: process.env.LOTUS_API_URL || 'http://127.0.0.1:5000', changeOrigin: true },
      '/debug': { target: process.env.LOTUS_API_URL || 'http://127.0.0.1:5000', changeOrigin: true }
    }
  }
})

