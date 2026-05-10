module.exports = {
  createOldCatalogs: false, 
  indentation: 2,
  lexers: {
    ts: ['JavascriptLexer'],
    tsx: ['JsxLexer'],
    js: ['JavascriptLexer'],
    jsx: ['JsxLexer'],
    default: ['JavascriptLexer'],
  },
  locales: ['en', 'fr', 'ar'],
  output: 'public/locales/$LOCALE.json',
  input: ['src/**/*.{js,jsx,ts,tsx}'],
  sort: true,
  keepRemoved: true, 
  keySeparator: false,
  namespaceSeparator: false,
};
