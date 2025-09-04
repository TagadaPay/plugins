import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { TagadaProvider } from '@tagadapay/plugin-sdk/react'
import './index.css'
import App from './App.tsx'

const root = createRoot(document.getElementById('root')!)

root.render(
  <StrictMode>
    <TagadaProvider 
      environment="production" 
      localConfig="default"
      debugMode={false}
      blockUntilSessionReady={true}
    >
      <App />
    </TagadaProvider>
  </StrictMode>,
)
