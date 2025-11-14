import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app';
import './styles/globals.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

// Prevent multiple root instances
if (rootElement.hasChildNodes()) {
  rootElement.innerHTML = '';
}

// Store root instance on window to prevent cleanup and ensure singleton
declare global {
  interface Window {
    __REACT_ROOT__?: ReactDOM.Root;
  }
}

if (!window.__REACT_ROOT__) {
  window.__REACT_ROOT__ = ReactDOM.createRoot(rootElement);

  window.__REACT_ROOT__.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
