import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/DataOrg/', // GitHub Pages serves from nksteve.github.io/DataOrg/
  plugins: [react()],
  server: {
    port: 3010,
    open: false
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
