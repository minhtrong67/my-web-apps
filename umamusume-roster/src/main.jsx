import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import './index.css';
import App from './App';
import { SettingsProvider } from './lib/settings';
import { ToastProvider } from './components/Toast';

window.__updateSW = registerSW({
  onNeedRefresh() { window.dispatchEvent(new Event('pwa-need-refresh')); },
  onOfflineReady() { window.dispatchEvent(new Event('pwa-offline-ready')); }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SettingsProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </SettingsProvider>
  </StrictMode>
);
