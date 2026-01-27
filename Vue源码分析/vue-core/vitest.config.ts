import { defineConfig } from 'vitest/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export default defineConfig({
  resolve: {
    alias: {
      vue: path.resolve(__dirname, 'packages/vue/src/index.ts'),
      '@alvis/shared': path.resolve(__dirname, 'packages/shared/src/index.ts'),
      '@alvis/reactivity': path.resolve(
        __dirname,
        'packages/reactivity/src/index.ts',
      ),
    },
  },
  test: {
    globals: true,
    sequence: {
      hooks: 'list',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['packages/*/src/**'],
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'util',
          include: ['packages/{reactivity,vue,shared}/**/*.{test,spec}.*'],
        },
      },
    ],
  },
})
