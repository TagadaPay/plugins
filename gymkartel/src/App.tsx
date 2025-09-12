import GymkartelLandingPage from './components/pages/Landing';
import { Providers } from './components/providers';
import { DevConfigSwitcher } from './components/DevConfigSwitcher';
import { useConfigContext } from './contexts/ConfigProvider';

function AppContent() {
  const { config, loading, error } = useConfigContext();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading configuration...</div>;
  }
  
  if (error) {
    return <div className="flex items-center justify-center min-h-screen text-red-600">Config Error: {error}</div>;
  }
  
  if (!config) {
    return <div className="flex items-center justify-center min-h-screen">No configuration loaded</div>;
  }
  
  return (
    <>
      <DevConfigSwitcher />
      <GymkartelLandingPage />
    </>
  );
}

function App() {
  return (
    <Providers>
      <AppContent />
    </Providers>
  );
}

export default App;
