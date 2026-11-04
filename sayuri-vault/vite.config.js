import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [react(), tailwind(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
    manifest: { name: 'Sayuri Vault', short_name: 'Sayuri Vault', theme_color: '#6750a4', background_color: '#141218',
      display: 'standalone', lang: 'vi', start_url: '/',
      icons: [{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }] },
    workbox: { globPatterns: ['**/*.{js,css,html,ico,png,svg}'], maximumFileSizeToCacheInBytes: 8e6 },
  })],
})
