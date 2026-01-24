import { defineConfig } from 'eslint/config'
import importX from 'eslint-plugin-import-x'
import tsEslint from 'typescript-eslint'

export default defineConfig([
  {
    extends: [tsEslint.configs.base],
    plugins: {
      'import-x': importX,
    },
  },
])
