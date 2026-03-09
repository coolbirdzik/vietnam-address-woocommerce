import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: '../assets/dist',
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: {
        checkout: path.resolve(__dirname, 'src/main-checkout.tsx'),
        'admin-order': path.resolve(__dirname, 'src/main-admin-order.tsx'),
        'admin-shipping': path.resolve(__dirname, 'src/main-admin-shipping.tsx'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return '[name].css'
          }
          return 'assets/[name]-[hash][extname]'
        },
      },
    },
    sourcemap: false,
  },
})
