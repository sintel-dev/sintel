module.exports = {
  semi: true,
  trailingComma: 'all',
  singleQuote: true,
  printWidth: 120,
  tabWidth: 4,
  overrides: [
    //   js
    {
      files: ['*.js', '*.ts', '*.jsx', '*.tsx'],
      options: {
        tabWidth: 2,
      },
    },
    //   css
    {
      files: ['*.scss', '*.css'],
      options: {
        tabWidth: 4,
      },
    },
    // html
    {
      files: '*.html',
      options: {
        tabWidth: 2,
        singleQuote: false,
      },
    },
    {
      files: ['*.yml'],
      options: {
        tabWidth: 2,
      },
    },
  ],
};
