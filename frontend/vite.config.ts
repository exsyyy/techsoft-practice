import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',      // ← обязательно для Amvera
    port: 3000,           // ← порт должен совпадать с containerPort
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: [
      'techsoftfrtd-denisdenisdenis.amvera.io',
      '.amvera.io',
    ],
  },
})