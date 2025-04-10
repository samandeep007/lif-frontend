module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    'react-native/react-native': true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-native/all',
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['react', 'react-native', 'prettier'],
  rules: {
    'prettier/prettier': 'error',
    'react-native/no-unused-styles': 'off',
    'react-native/no-inline-styles': 'warn',
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react-native/no-color-literals': 'off',
    'react-native/no-raw-text': 'off',
    'no-shadow': 'off',
    // Suppress pointerEvents warning
    'react-native/no-unused-props': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
