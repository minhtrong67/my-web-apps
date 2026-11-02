import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base './' → chạy được ở mọi đường dẫn (GitHub Pages, Netlify, thư mục con…)
// 2 trang: / (landing page giới thiệu) và /app/ (ứng dụng React)
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      input: { main: resolve(import.meta.dirname, 'index.html'), app: resolve(import.meta.dirname, 'app/index.html') },
    },
  },
})
