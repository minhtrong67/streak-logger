import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Manifest được viết tay trong public/ (bản sáng và bản tối) để màn hình
      // chờ của PWA khớp với giao diện, nên không để plugin tự sinh manifest.
      manifest: false,
      includeAssets: ['favicon.svg', 'favicon.ico', 'icons/*.png'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest,ttf}'],
        // Ảnh splash của iOS do hệ điều hành tự đọc, không cần precache.
        globIgnores: ['splash/**'],
        navigateFallback: '/index.html',
        // Các đường dẫn của Firebase Auth (đăng nhập redirect) không được cache bởi service worker.
        navigateFallbackDenylist: [/^\/__\//, /^\/api\//],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      },
    }),
  ],
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        // Tách các thư viện lớn thành chunk riêng để cache tốt hơn và tải song song.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('firebase') || id.includes('@firebase')) return 'firebase'
          if (id.includes('recharts') || id.includes('d3-') || id.includes('victory-vendor')) return 'charts'
          if (id.includes('react-router') || id.includes('react-dom') || id.includes('/react/')) return 'react'
          return undefined
        },
      },
    },
  },
})
