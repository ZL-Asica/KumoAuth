module.exports = {
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
  plugins: [require.resolve('prettier-plugin-organize-imports')],
}
