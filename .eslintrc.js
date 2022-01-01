// eslint-disable-next-line no-undef
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    "no-unused-vars": ["warn"],
    "@typescript-eslint/explicit-function-return-type": "error",
    "semi": ["error"],
    "indent": ["error", 2]
  }
};