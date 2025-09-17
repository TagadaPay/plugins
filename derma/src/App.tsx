import { TagadaProvider } from '@tagadapay/plugin-sdk/react'
import { DermaPenLanding } from './components/DermaPenLanding'

function App() {
  return (
    <TagadaProvider 
      environment="production" 
      debugMode={true}
      blockUntilSessionReady={true}
    >
      <DermaPenLanding />
    </TagadaProvider>
  )
}

export default App