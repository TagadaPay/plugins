import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { pluginConfig } from './data/config';

// Debug API calls - especially the looping anonymous session call
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

// Update document title and description based on config, matching Next.js metadata behavior
document.title = `${pluginConfig.branding.storeName} - Premium Joint Support Supplement`;
const metaDescription = document.querySelector('meta[name="description"]');
if (metaDescription) {
  metaDescription.setAttribute(
    'content',
    `Order ${pluginConfig.branding.storeName}, featuring premium joint support supplements with multiple bundle options. 90-day money back guarantee.`,
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
