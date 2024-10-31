module.exports = {
  trailingComma: 'es5',
  tabWidth: 2,
  semi: false,
  singleQuote: true,
  jsxSingleQuote: true,
  bracketSpacing: true,
  jsxBracketSameLine: false,
  arrowParens: 'always',
  printWidth: 80,
  useTabs: false,
  endOfLine: 'lf',
  plugins: [require.resolve('prettier-plugin-organize-imports')],
}
