import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Chỉ precache các icon cần thiết; các kích thước còn lại trình duyệt tự tải theo nhu cầu
      includeAssets: ['favicon.ico', 'favicon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon-180.png'],
      manifest: {
        id: '/',
        name: 'Calendar Pro',
        short_name: 'Calendar Pro',
        description: 'Calendar Pro — lịch âm dương, lịch vạn niên, đếm ngược ngày lễ, ngày chay, ngày rằm.',
        categories: ['productivity', 'utilities', 'lifestyle'],
        // Nền splash của hệ điều hành lấy từ đây (tĩnh, đọc lúc cài đặt/khởi chạy): mặc định = nền sáng.
        // `color_scheme_dark` là thành phần mới trong đặc tả Web App Manifest cho bản tối; trình duyệt chưa hỗ trợ sẽ bỏ qua
        // (không gây lỗi). Màn hình chờ trong index.html đảm nhiệm phần còn lại ngay khi trang mở.
        theme_color: '#FFF8F7',
        background_color: '#FFF8F7',
        color_scheme_dark: { theme_color: '#1D1011', background_color: '#1D1011' },
        display: 'standalone',
        orientation: 'any',
        scope: '/',
        start_url: '/',
        lang: 'vi',
        icons: [
          { src: '/icons/icon-48.png', sizes: '48x48', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-72.png', sizes: '72x72', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-96.png', sizes: '96x96', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-128.png', sizes: '128x128', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-144.png', sizes: '144x144', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-256.png', sizes: '256x256', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-384.png', sizes: '384x384', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/icons/icon-maskable-384.png', sizes: '384x384', type: 'image/png', purpose: 'maskable' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: '/icons/icon-monochrome-512.png', sizes: '512x512', type: 'image/png', purpose: 'monochrome' }
        ],
        shortcuts: [
          { name: 'Lịch âm dương', short_name: 'Lịch', url: '/#/lich', icons: [{ src: '/icons/icon-96.png', sizes: '96x96' }] },
          { name: 'Đếm ngược ngày lễ', short_name: 'Đếm ngược', url: '/#/dem-nguoc', icons: [{ src: '/icons/icon-96.png', sizes: '96x96' }] }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,ico}'],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            // Font chữ tự host (Google Sans Flex, Roboto Flex, Inter...): chỉ tải khi người dùng chọn, rồi cache lâu dài để dùng offline
            urlPattern: /\/assets\/.*\.woff2$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'app-fonts',
              expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            // Stylesheet font icon: dùng bản cache ngay, cập nhật ngầm
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-css', expiration: { maxEntries: 4, maxAgeSeconds: 60 * 60 * 24 * 365 } }
          },
          {
            // File font: bất biến → cache lâu dài, mở app offline vẫn có icon
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-files',
              expiration: { maxEntries: 8, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      }
    })
  ],
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        // Tách thư viện React ra chunk riêng: cache được lâu dài, không phải tải lại mỗi lần sửa code
        manualChunks: { react: ['react', 'react-dom', 'react-router-dom'] }
      }
    }
  },
  server: {
    host: true,
    port: 5173
  }
})
