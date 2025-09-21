import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: ['af9aca1f752f.ngrok-free.app'],
    https: {
      key: '192.168.1.16+1-key.pem',
      cert: '192.168.1.16+1.pem'
    },
    host: '0.0.0.0',
    port: 3000
  }
})
