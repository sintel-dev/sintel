module.exports = {
  semi: true,
  trailingComma: "all",
  singleQuote: true,
  printWidth: 120,
  tabWidth: 2,
  overrides: [
    {
      files: ["*.scss", "*.css"],
      options: {
        tabWidth: 4
      }
    },
    {
      files: "*.html",
      options: {
        tabWidth: 2,
        singleQuote: false
      }
    }
  ]
};