import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react({
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
    watch: {
      ignored: ['**/node_modules/**', '**/dist/**', '**/.git/**', '**/src/backend/**'],
    },
  },
  build: {
    // Configuration optimisée pour éviter les blocages
    minify: 'esbuild',
    target: 'es2015',
    chunkSizeWarningLimit: 1000,
    // Désactiver le sourcemap en production pour accélérer
    sourcemap: false,
    // Réduire la taille des chunks
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        // Simplifier la sortie pour éviter les blocages
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // Limiter le nombre de chunks
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
        },
      },
    },
    // Limiter les workers pour éviter les blocages avec iCloud
    reportCompressedSize: false,
  },
  // Optimiser pour iCloud Drive
  optimizeDeps: {
    force: false,
    include: ['react', 'react-dom', 'react-router-dom'],
  },
})
