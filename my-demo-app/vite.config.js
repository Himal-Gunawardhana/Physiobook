import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://physiobook-api-jvye.onrender.com',
        changeOrigin: true,
        secure: true,
      },
      '/health': {
        target: 'https://physiobook-api-jvye.onrender.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
