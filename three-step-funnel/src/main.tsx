import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Debug API calls in development
if (import.meta.env.DEV) {
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const [url, options] = args;
    console.log('🌐 API Request:', {
      url: typeof url === 'string' ? url : url.toString(),
      method: options?.method || 'GET',
      timestamp: new Date().toISOString()
    });
    
    return originalFetch.apply(this, args)
      .then(response => {
        console.log('✅ API Response:', {
          url: typeof url === 'string' ? url : url.toString(),
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          timestamp: new Date().toISOString()
        });
        return response;
      })
      .catch(error => {
        console.error('❌ API Error:', {
          url: typeof url === 'string' ? url : url.toString(),
          error: error.message,
          timestamp: new Date().toISOString()
        });
        throw error;
      });
  };
}

// Update document title and description
document.title = 'NutraVital Pro - Advanced Joint Support';
const metaDescription = document.querySelector('meta[name="description"]');
if (metaDescription) {
  metaDescription.setAttribute(
    'content',
    'Experience our three-step funnel for NutraVital Pro. Simple, fast, and secure checkout process for advanced joint support.',
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
); 