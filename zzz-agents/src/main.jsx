import React from 'react'
import { createRoot } from 'react-dom/client'
import { SettingsProvider } from './settings.jsx'
import { ToastProvider } from './components/Toast.jsx'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <SettingsProvider><ToastProvider><App /></ToastProvider></SettingsProvider>
)
