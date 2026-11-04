import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  build: {
    // Tách thư viện lớn thành chunk riêng để cache lâu dài và tải song song.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (/node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)\//.test(id)) return 'react'
          if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')) return 'firebase'
          if (/node_modules\/(recharts|d3-|victory-vendor|recharts-scale)/.test(id)) return 'charts'
        }
      }
    },
    chunkSizeWarningLimit: 600
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // Font tuỳ chọn chỉ tải khi người dùng chọn → không precache, lưu cache lần đầu dùng.
        globIgnores: ['**/{roboto,roboto-flex,inter,be-vietnam-pro}-*.woff*'],
        runtimeCaching: [
          {
            urlPattern: /\/assets\/(roboto|roboto-flex|inter|be-vietnam-pro)-.*\.woff2?$/,
            handler: 'CacheFirst',
            options: { cacheName: 'optional-fonts', expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 365 } }
          }
        ]
      },
      includeAssets: ['favicon.ico', 'favicon.svg', 'apple-touch-icon.png', 'icons/*.png'],
      manifest: {
        id: '/',
        name: 'Moody — Nhật ký tâm trạng',
        short_name: 'Moody',
        description: 'Theo dõi tâm trạng mỗi ngày, xem xu hướng và xuất báo cáo',
        lang: 'vi',
        dir: 'ltr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#80CBC4',
        background_color: '#80CBC4',
        categories: ['health', 'lifestyle', 'productivity'],
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      }
    })
  ]
})
