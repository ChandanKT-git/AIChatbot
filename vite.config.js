import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@apollo')) return 'vendor-apollo'
            if (id.includes('graphql')) return 'vendor-graphql'
            if (id.includes('react-router')) return 'vendor-router'
            if (id.includes('@nhost')) return 'vendor-nhost'
            return 'vendor'
          }
        }
      }
    },
    chunkSizeWarningLimit: 700
  }
})
