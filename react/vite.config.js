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
// This script configures the Vite build for the Hackerbot Command Center React
// Frontend.
//
// Special thanks to the following for their code contributions to this codebase:
// Allen Chien - https://github.com/AllenChienXXX
//
//################################################################################


import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  server: {
    proxy: { "/api":  {
                      target: 'http://127.0.0.1:5000',
                      changeOrigin: true,
                      secure: false      
                      }
             }
  },

})
