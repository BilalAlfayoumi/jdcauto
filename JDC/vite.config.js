import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react({
      // Désactiver certaines optimisations qui peuvent causer des blocages
      jsxRuntime: 'automatic',
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    open: true,
  },
  build: {
    // Optimisations pour éviter les blocages
    minify: 'esbuild',
    target: 'es2015',
    // Désactiver le chunking pour simplifier
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: undefined,
        // Simplifier la sortie
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
  // Optimiser pour iCloud Drive
  optimizeDeps: {
    force: false,
  },
})
