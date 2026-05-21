import { defineConfig } from 'vite'
import { wasp } from 'wasp/client/vite'

export default defineConfig({
  plugins: [wasp()],
  server: {
    open: true,
  },
  resolve: {
    alias: {
      "@": new URL('./src', import.meta.url).pathname,
    },
  },
})
