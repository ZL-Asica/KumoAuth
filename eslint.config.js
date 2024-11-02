import pluginJs from '@eslint/js'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import prettier from 'eslint-config-prettier'
import globals from 'globals'

export default [
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...pluginJs.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      // Custom rules
      'no-debugger': 'warn',
      eqeqeq: ['error', 'always'], // Require === and !==
      curly: ['error', 'all'], // Require curly braces for all control statements
      'no-implicit-coercion': 'error', // Disallow shorthand type conversions
      'no-var': 'error', // Disallow var
      'prefer-const': 'error', // Prefer const

      // TypeScript rules
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ], // Warn on unused variables, except for variables starting with _
      '@typescript-eslint/no-explicit-any': 'warn', // Disallow explicit any
      '@typescript-eslint/ban-ts-comment': 'warn', // Disallow @ts-ignore comments
      '@typescript-eslint/consistent-type-imports': 'error', // Require consistent import of types
    },
    ignores: [
      'node_modules',
      'dist',
      'build',
      '.pnp.*',
      '.yarn',
      '.vscode',
      '.wrangler',
      '*.md',
    ],
  },
  prettier, // Prettier Config, disable all rules that conflict with Prettier
]
