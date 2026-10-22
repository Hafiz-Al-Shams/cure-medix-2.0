import js from '@eslint/js';
// Adjusted Import Statement for 'globals' (UPDATED)
// Changed: import globals, { node } from 'globals';
// To:
import globals from 'globals'; // Import the CommonJS module
const { node } = globals; // Destructure the 'node' export

import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: { ...globals.browser, ...node }, // Add Node.js globals here
      parserOptions: {
        ecmaVersion: 'latest',
        node: true,
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: '18.3' } }, // Ensure this version matches your actual React version
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      "react/prop-types": "off",

      // Custom rules (NEW LINES ADDED)
      'no-unused-vars': 'warn', // Warn about unused variables
      'react-hooks/rules-of-hooks': 'error', // Enforce correct usage of hooks
      'react-hooks/exhaustive-deps': 'warn', // Warn about missing dependencies in hooks

      'react/jsx-no-target-blank': 'off', // Already in your original file
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
];
