/* eslint-disable import/no-extraneous-dependencies */
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from '@tailwindcss/vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  define: {
    global: "globalThis",
  },
});