import { defineConfig } from 'vite';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    federation({
      name: 'gamehub-shell',
      filename: 'remoteEntry.js',
      shared: {
        // Share nothing for now - LÖVE games load independently
      }
    })
  ],
  build: {
    target: 'esnext',
    minify: true,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'supabase': ['@supabase/supabase-js']
        }
      }
    }
  },
  server: {
    port: 3000,
    cors: true
  },
  preview: {
    port: 3000,
    cors: true
  }
});
