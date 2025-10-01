/* Monorepo ESLint configuration */
module.exports = {
  root: true,
  ignorePatterns: [
    'node_modules/',
    'dist/',
    '.next/',
    'coverage/',
    'expo/',
    'projects/mobile-project/node_modules/',
    '**/build/',
    '*.config.js',
  ],
  env: {
    es2021: true,
    browser: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  settings: {
    react: { version: 'detect' },
    'import/core-modules': ['react-native'],
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'import',
    'unused-imports',
    'simple-import-sort',
    'prettier',
    'react-native',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  rules: {
    'prettier/prettier': ['error'],
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'unused-imports/no-unused-imports': 'error',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
    ],
    'simple-import-sort/imports': 'off',
    'simple-import-sort/exports': 'off',
    'import/order': 'off',
    'import/no-unresolved': 'error',
  },
  overrides: [
    {
      files: ['projects/web-project/**/*.{ts,tsx}'],
      extends: ['next/core-web-vitals', 'prettier'],
      rules: {
        // Next.js already handles image alt warnings etc.
        'next/no-html-link-for-pages': 'off',
      },
    },
    {
      files: ['projects/mobile-project/**/*.{ts,tsx}'],
      extends: ['plugin:react-native/all', 'prettier'],
      env: { 'react-native/react-native': true },
      rules: {
        'react-native/no-inline-styles': 'off', // allow simple inline styles initially
        'import/no-unresolved': 'off',
        'import/namespace': 'off',
      },
    },
    {
      files: ['projects/server-project/**/*.ts'],
      env: { node: true },
      rules: {
        'import/no-nodejs-modules': 'off',
      },
    },
  ],
};
