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
    "@typescript-eslint/no-unused-vars": 1
  }
};
