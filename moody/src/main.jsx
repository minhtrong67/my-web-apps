import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
// Google Sans Flex (font của M3 Expressive): bản wght + wdth cho chữ thường; bản ROND (chữ bo tròn) khai báo trong index.css cho tiêu đề.
import '@fontsource-variable/google-sans-flex/wdth.css'
import './styles/theme.css' // bảng màu Material 3 (seed teal) — nguồn màu duy nhất
import './index.css'
import { initTheme } from './lib/theme'

initTheme()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
