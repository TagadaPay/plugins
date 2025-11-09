#!/usr/bin/env node

console.log('🔍 Debugging BasisTheory import resolution...\n');

try {
  // Test direct import
  console.log('1. Testing direct import from @basis-theory/basis-theory-react:');
  const btReact = require('@basis-theory/basis-theory-react');
  console.log('   ✅ Package loaded successfully');
  console.log('   📦 Available exports:', Object.keys(btReact));
  console.log('   🔧 useBasisTheory available:', typeof btReact.useBasisTheory === 'function' ? '✅ YES' : '❌ NO');
  
  console.log('\n2. Testing SDK import:');
  const sdk = require('@tagadapay/plugin-sdk');
  console.log('   ✅ SDK loaded successfully');
  console.log('   📦 Available exports:', Object.keys(sdk));
  
} catch (error) {
  console.error('❌ Import failed:', error.message);
  console.error('   🔍 Error type:', error.constructor.name);
  console.error('   📍 Error code:', error.code);
  
  if (error.message.includes('Cannot resolve')) {
    console.log('\n💡 Suggestions:');
    console.log('   1. Run: pnpm install --force');
    console.log('   2. Clear cache: rm -rf node_modules/.vite');
    console.log('   3. Check if SDK is built: cd ../../../tagadapay/examples/plugin-sdk && npm run build');
  }
}

console.log('\n🔧 Environment Info:');
console.log('   📂 Working directory:', process.cwd());
console.log('   🟢 Node version:', process.version);
console.log('   📦 Package manager: pnpm'); 