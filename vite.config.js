import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Static export config:
// - `base: './'` makes the bundle path-relative so it works under any
//   Vercel subpath (project root, /led-experience, etc.) without 404s on assets.
// - No SSR plugins, no server functions. Output is a static dist/ suitable
//   for Vercel Hobby free tier.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    target: 'es2020',
    chunkSizeWarningLimit: 1200,
  },
  server: {
    port: 5173,
    open: false,
  },
});
