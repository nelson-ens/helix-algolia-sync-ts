module.exports = {
  "extends": [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    "@typescript-eslint/no-unused-vars": 1,
    "import/no-unresolved": 0,
    "no-console": 0,
    "@typescript-eslint/no-unused-vars": 0,
  }
};
