import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    allowedHosts: [
      '3000-icmsarcraz9y3bljxdtx8-6532622b.e2b.dev',
      'localhost',
      '127.0.0.1',
      '0.0.0.0'
    ],
    cors: true,
    hmr: {
      clientPort: 3000
    }
  }
})
