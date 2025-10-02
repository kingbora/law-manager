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
    react: { version: '18.3.1' },
    'import/core-modules': ['react-native'],
    'import/resolver': {
      node: {
        extensions: ['.js', '.cjs', '.mjs', '.ts', '.tsx'],
      },
      typescript: {
        project: [
          './projects/server-project/tsconfig.json',
          './projects/web-project/tsconfig.json',
          './projects/mobile-project/tsconfig.json',
          './packages/tsconfig/base.json',
        ],
      },
    },
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'import',
    'unused-imports',
    'simple-import-sort',
    'react-native',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
  ],
  rules: {
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
    semi: ['error', 'always'],
    quotes: ['error', 'single', { avoidEscape: true }],
    'arrow-parens': ['error', 'always'],
    'object-curly-spacing': ['error', 'always'],
    'comma-dangle': ['error', 'always-multiline'],
    'space-before-function-paren': [
      'error',
      { anonymous: 'never', named: 'never', asyncArrow: 'always' },
    ],
    'max-len': [
      'warn',
      {
        code: 100,
        ignoreComments: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreUrls: true,
      },
    ],
  },
  overrides: [
    {
      files: ['projects/web-project/**/*.{ts,tsx}'],
      extends: ['next/core-web-vitals'],
      settings: {
        next: {
          rootDir: ['projects/web-project'],
        },
      },
      rules: {
        // Next.js already handles image alt warnings etc.
        'next/no-html-link-for-pages': 'off',
      },
    },
    {
      files: ['projects/mobile-project/**/*.{ts,tsx}'],
      extends: ['plugin:react-native/all'],
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
