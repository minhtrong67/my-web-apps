import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'ZZZ Agents',
        short_name: 'ZZZ Agents',
        description: 'Zenless Zone Zero agent database',
        theme_color: '#0b0b0d',
        background_color: '#0b0b0d',
        display: 'standalone',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png}'],
        runtimeCaching: [{
          urlPattern: /^https:\/\/static\.nanoka\.cc\/.*\.json$/i,
          handler: 'StaleWhileRevalidate',
          options: { cacheName: 'zzz-data' }
        }, {
          urlPattern: /^https:\/\/static\.nanoka\.cc\/assets\/.*/i,
          handler: 'CacheFirst',
          options: { cacheName: 'zzz-images', expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 30 }, cacheableResponse: { statuses: [0, 200] } }
        }, {
          urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
          handler: 'StaleWhileRevalidate',
          options: { cacheName: 'google-fonts' }
        }]
      }
    })
  ]
})
