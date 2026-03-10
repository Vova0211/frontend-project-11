import js from '@eslint/js'
import path from 'node:path'
import globals from 'globals'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'eslint/config'
import stylistic from '@stylistic/eslint-plugin'
import { includeIgnoreFile } from '@eslint/compat'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const gitignorePath = path.resolve(__dirname, '.gitignore')

export default defineConfig([
  stylistic.configs.recommended,
  includeIgnoreFile(gitignorePath),
  {
    files: ['**/*.{js,mjs,cjs}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: { globals: globals.node },
    ignores: ['dist/assets/*.js'],
  },
])
