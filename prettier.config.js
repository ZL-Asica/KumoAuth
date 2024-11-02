import organizeImports from 'prettier-plugin-organize-imports'

const config = {
  trailingComma: 'es5',
  tabWidth: 2,
  semi: false,
  singleQuote: true,
  jsxSingleQuote: true,
  bracketSpacing: true,
  arrowParens: 'always',
  printWidth: 80,
  useTabs: false,
  endOfLine: 'lf',
  plugins: [organizeImports],
}

export default config
