import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Redireciona chamadas /api para o backend Spring Boot
    proxy: {
      '/api': 'http://localhost:8080'
    }
  }
})
