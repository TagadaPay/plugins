import { useState, useEffect } from 'react'
import { useConfigContext } from '../contexts/ConfigProvider'
import { Settings, RefreshCw } from 'lucide-react'

/**
 * Development-only config switcher component
 * Shows available configs and allows hot-switching via URL params
 */
export function DevConfigSwitcher() {
  const { configName, loadConfig, reloadConfig } = useConfigContext()
  const [availableConfigs, setAvailableConfigs] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)

  // Only show in development
  if (!import.meta.env.DEV) return null

  // Get available config names from /config/ directory (not /configs/)
  useEffect(() => {
    const configs = ['default', 'skincare-demo'] // Available in /config/ directory
    setAvailableConfigs(configs)
  }, [])

  const switchToConfig = (newConfigName: string) => {
    if (newConfigName !== configName) {
      // Update URL without reload - the useConfig hook will pick it up
      const url = new URL(window.location.href)
      url.searchParams.set('config', newConfigName)
      window.history.pushState({}, '', url.toString())
      
      // Trigger config reload
      loadConfig(newConfigName)
      setIsOpen(false)
    }
  }

  const handleReloadConfig = async () => {
    await reloadConfig()
    setIsOpen(false)
  }

  return (
    <div className="fixed top-4 left-4 z-50">
      {isOpen ? (
        <div className="bg-black text-white p-4 rounded-lg shadow-lg border border-gray-600 min-w-64">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">🔧 Dev Config Switcher</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
          
          <div className="text-xs text-gray-400 mb-3">
            Current: <span className="text-yellow-400">{configName || 'loading...'}</span>
          </div>
          
          <div className="space-y-2">
            {availableConfigs.map(config => (
              <button
                key={config}
                onClick={() => switchToConfig(config)}
                className={`w-full text-left px-3 py-2 text-xs rounded transition-colors ${
                  config === configName 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                {config}
                {config === configName && ' (active)'}
              </button>
            ))}
            
            <div className="border-t border-gray-600 pt-2">
              <button
                onClick={handleReloadConfig}
                className="w-full text-left px-3 py-2 text-xs rounded bg-gray-700 hover:bg-gray-600 text-gray-300 flex items-center space-x-2"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reload Current Config</span>
              </button>
            </div>
          </div>
          
          <div className="mt-3 text-xs text-gray-500">
            💡 URL: ?config=&lt;name&gt;
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-black/80 text-white p-2 rounded-full shadow-lg hover:bg-black transition-colors"
          title="Config Switcher (Dev Only)"
        >
          <Settings className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}