import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base '/' so that the static `/assets/...` paths used by the original
// site (CSS, images) resolve correctly on every route.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5501,
    open: true
  }
})
