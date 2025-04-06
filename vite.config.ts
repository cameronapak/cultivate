import { defineConfig } from 'vite'
import { resolveProjectPath } from 'wasp/dev'

export default defineConfig({
  server: {
    open: true,
  },
  resolve: {
    alias: {
      "@": resolveProjectPath('./src'),
    },
  },
})
