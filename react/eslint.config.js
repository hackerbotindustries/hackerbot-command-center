//################################################################################
// Copyright (c) 2025 Hackerbot Industries LLC
//
// This source code is licensed under the MIT license found in the
// LICENSE file in the root directory of this source tree.
//
// Created By: Allen Chien
// Created:    April 2025
// Updated:    2025.04.01
//
// This script configures the ESLint for the Hackerbot Command Center React
// Frontend.
//
// Special thanks to the following for their code contributions to this codebase:
// Allen Chien - https://github.com/AllenChienXXX
//
//################################################################################


import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
]
