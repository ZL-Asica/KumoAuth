import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    reporters: process.env.GITHUB_ACTIONS ? ['dot', 'github-actions'] : ['dot'],
    globals: true,
  },
  resolve: {
    alias: {
      hono: path.resolve(__dirname, '.yarn/$$virtual/hono-virtual-hono/jsx.js'),
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
