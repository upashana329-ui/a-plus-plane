import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './services/auth';
import { ToastProvider } from './context/ToastContext';
import App from './App';
import './index.css';

// Register Service Worker for PWA (Android Add to Home Screen)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[PWA] ServiceWorker registered with scope:', registration.scope);
      })
      .catch((err) => {
        console.warn('[PWA] ServiceWorker registration warning:', err);
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
