module.exports = {
  extends: ['plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'import/no-unresolved': 0,
    'no-console': 0,
    '@typescript-eslint/no-unused-vars': 0,
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'error',
  },
};
