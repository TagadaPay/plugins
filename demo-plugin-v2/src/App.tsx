import React from 'react';
import { TagadaProvider, usePluginConfig } from "@tagadapay/plugin-sdk/react";
import { Routes, Route, BrowserRouter } from "react-router-dom";

function ConfigPage() {
  const { storeId, accountId, basePath, config, loading } = usePluginConfig();

  // Debug: Log the current hostname and config
  console.log('🔍 ConfigPage Debug:', {
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'SSR',
    isLocalhost: typeof window !== 'undefined' && window.location.hostname === 'localhost',
    storeId,
    accountId,
    basePath,
    config
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-4 text-lg font-medium text-blue-900">Loading configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Plugin Configuration</h1>
          <p className="mt-2 text-xl text-gray-600">Live configuration via usePluginConfig hook</p>
          <a 
            href="/" 
            className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            ← Back to Home
          </a>
        </div>
        
        {/* Configuration Display */}
        <div className="rounded-xl bg-white p-8 shadow-xl">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Live Plugin Configuration</h2>
            <button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify({ storeId, accountId, basePath, config }, null, 2));
                alert('Configuration copied to clipboard!');
              }}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy JSON
            </button>
          </div>
          
          <div className="rounded-lg border-2 border-gray-200 bg-gray-50">
            <pre className="overflow-auto p-6 text-sm text-gray-800 font-mono">
              {JSON.stringify({ storeId, accountId, basePath, config }, null, 2)}
            </pre>
          </div>
          
          {/* Quick Stats */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-blue-50 p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {config ? Object.keys(config).length : 0}
              </div>
              <div className="text-sm text-blue-800">Config Keys</div>
            </div>
            <div className="rounded-lg bg-green-50 p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {loading ? 'Loading...' : 'Loaded'}
              </div>
              <div className="text-sm text-green-800">Status</div>
            </div>
            <div className="rounded-lg bg-purple-50 p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {new Date().toLocaleTimeString()}
              </div>
              <div className="text-sm text-purple-800">Last Updated</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WelcomePage() {
  const { config, loading } = usePluginConfig();
  
  // Use primary color from config, fallback to blue if not loaded
  const primaryColor = config?.branding?.primaryColor || "#3b82f6";
  const secondaryColor = config?.branding?.secondaryColor || "#1d4ed8";
  const companyName = config?.branding?.companyName || "TagadaPay Demo";
  const configName = config?.configName;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100">
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="text-center max-w-2xl">
          {/* Hero Icon with dynamic color */}
          <div 
            className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full text-white shadow-lg"
            style={{
              background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`
            }}
          >
            <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          
          {/* Main Content with dynamic colors */}
          <h1 
            className="text-6xl font-bold bg-clip-text text-transparent mb-6"
            style={{
              backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`
            }}
          >
            Welcome to V2! 🚀
          </h1>
          
          {/* Config info display */}
          <div className="mb-6 p-4 bg-white/80 rounded-lg shadow-sm">
            <p className="text-lg font-semibold text-gray-800">
              {loading ? 'Loading...' : companyName}
            </p>
            {configName && (
              <p className="text-sm text-gray-600">
                Config: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{configName}</span>
              </p>
            )}
          </div>
          <p className="text-xl text-gray-700 mb-8 leading-relaxed">
            This is the TagadaPay V2 demonstration plugin showcasing advanced routing, live configuration, and multi-deployment capabilities.
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/config" 
              className="inline-flex items-center gap-2 rounded-xl px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all transform hover:scale-105"
              style={{
                background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
                boxShadow: `0 10px 25px ${primaryColor}30`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = 'brightness(0.9)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = 'brightness(1)';
              }}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              View Configuration
            </a>
            <button 
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-gray-600 to-gray-700 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:from-gray-700 hover:to-gray-800 transition-all transform hover:scale-105"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Plugin
            </button>
          </div>
          


          {/* Feature Highlights */}
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl bg-white p-6 shadow-md">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">V2 Routing</h3>
              <p className="text-sm text-gray-600">Advanced pattern matching with multi-deployment support</p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-md">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Live Config</h3>
              <p className="text-sm text-gray-600">Real-time configuration via React hooks</p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-md">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Demo Plugin</h3>
              <p className="text-sm text-gray-600">Showcasing V2 capabilities and best practices</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <TagadaProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/config" element={<ConfigPage />} />
          <Route path="*" element={<WelcomePage />} />
        </Routes>
      </BrowserRouter>
    </TagadaProvider>
  );
}

export default App;
