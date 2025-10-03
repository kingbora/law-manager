import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import jsoncPlugin from 'eslint-plugin-jsonc';
import jsoncParser from 'jsonc-eslint-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  resolvePluginsRelativeTo: __dirname,
  recommendedConfig: js.configs.recommended,
});

const [compatConfig, ...compatRest] = compat.config({
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
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
        caughtErrorsIgnorePattern: '^_',
      },
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
        'next/no-html-link-for-pages': 'off',
      },
    },
    {
      files: ['projects/mobile-project/**/*.{ts,tsx}'],
      extends: ['plugin:react-native/all'],
      env: { 'react-native/react-native': true },
      rules: {
        'react-native/no-inline-styles': 'off',
        'import/no-unresolved': 'off',
        'import/namespace': 'off',
        '@typescript-eslint/no-require-imports': 'off',
      },
    },
    {
      files: ['projects/server-project/**/*.ts'],
      env: { node: true },
      rules: {
        'import/no-nodejs-modules': 'off',
      },
    },
    {
      files: ['projects/web-project/next-env.d.ts'],
      rules: {
        '@typescript-eslint/triple-slash-reference': 'off',
      },
    },
  ],
});

const { ignores: _compatIgnores, ...baseCompatConfig } = compatConfig ?? {};

export default [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      '.next/**',
      'coverage/**',
      'expo/**',
      'projects/mobile-project/node_modules/**',
      '**/build/**',
      '*.config.js',
    ],
  },
  {
    ...baseCompatConfig,
    files: ['**/*.{js,jsx,ts,tsx,cjs,mjs,mts,cts}'],
  },
  ...compatRest,
  {
    files: ['**/*.json', '**/*.json5', '**/*.jsonc'],
    languageOptions: {
      parser: jsoncParser,
    },
    plugins: {
      jsonc: jsoncPlugin,
    },
  },
];
