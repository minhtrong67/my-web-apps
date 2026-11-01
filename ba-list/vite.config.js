import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base './' → chạy được ở mọi đường dẫn (GitHub Pages, Netlify, thư mục con…)
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: { target: 'es2022', chunkSizeWarningLimit: 900 },
})
