import React from 'react'
import { Providers } from '@/src/components/providers'
import { KlaviyoScript } from '@/src/components/klaviyo-script'
import Home from './pages/home/Home'
import './styles/globals.css'

export default function App() {
  return (
    <Providers>
      <KlaviyoScript />
      <Home />
    </Providers>
  )
}
