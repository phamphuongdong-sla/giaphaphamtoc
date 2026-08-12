import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      selfDestroying: true,
      manifest: false,
    }),
  ],
  base: '/giaphaphamtoc/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-core': ['react', 'react-dom'],
          'vendor-tree': ['@xyflow/react', '@dagrejs/dagre'],
          'vendor-charts': ['recharts'],
        },
      },
    },
  },
})
