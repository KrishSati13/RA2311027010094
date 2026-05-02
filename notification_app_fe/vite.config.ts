import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/evaluation-service': {
        target: 'http://20.207.122.201',
        changeOrigin: true
      }
    }
  }
})
