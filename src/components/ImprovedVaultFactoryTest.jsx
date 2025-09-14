// Improved Vault Factory Test Component
import React, { useState, useEffect } from 'react';
import improvedVaultFactoryService from '../services/improvedVaultFactoryService.js';

const ImprovedVaultFactoryTest = () => {
  const [testState, setTestState] = useState({
    connected: false,
    userAddress: '',
    loading: false,
    results: []
  });

  const [vaultData, setVaultData] = useState({
    name: 'Test User',
    email: 'test@example.com',
    hashId: `hash_${Date.now()}`,
    cid: 'test_cid_123'
  });

  const [contractStats, setContractStats] = useState({
    totalVaults: 0,
    userVaults: 0,
    maxVaultsPerUser: 0
  });

  const [userVaultsList, setUserVaultsList] = useState([]);

  // Connect wallet
  const connectWallet = async () => {
    try {
      setTestState(prev => ({ ...prev, loading: true }));
      
      if (!window.ethereum) {
        addResult('❌ No wallet found. Please install Core Wallet or MetaMask.', 'error');
        return;
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      if (accounts.length > 0) {
        const userAddress = accounts[0];
        setTestState(prev => ({ 
          ...prev, 
          connected: true, 
          userAddress: userAddress,
          loading: false 
        }));
        addResult(`✅ Wallet connected: ${userAddress}`, 'success');
        
        // Load contract stats
        await loadContractStats(userAddress);
      }
    } catch (error) {
      addResult(`❌ Wallet connection failed: ${error.message}`, 'error');
      setTestState(prev => ({ ...prev, loading: false }));
    }
  };

  // Load contract statistics
  const loadContractStats = async (userAddress) => {
    try {
      const totalVaults = await improvedVaultFactoryService.getTotalVaultCount();
      const userVaultCount = await improvedVaultFactoryService.getUserVaultCount(userAddress);
      const maxVaults = await improvedVaultFactoryService.getMaxVaultsPerUser();
      
      setContractStats({
        totalVaults,
        userVaults: userVaultCount,
        maxVaultsPerUser: maxVaults
      });

      addResult(`📊 Contract Stats - Total: ${totalVaults}, User: ${userVaultCount}/${maxVaults}`, 'info');
      
      // Load user vaults
      await loadUserVaults(userAddress);
    } catch (error) {
      addResult(`❌ Failed to load contract stats: ${error.message}`, 'error');
    }
  };

  // Load user vaults
  const loadUserVaults = async (userAddress) => {
    try {
      const vaultIds = await improvedVaultFactoryService.getUserVaults(userAddress);
      const vaultDetails = [];
      
      for (const vaultId of vaultIds) {
        const details = await improvedVaultFactoryService.getVault(vaultId);
        if (details) {
          vaultDetails.push({ id: vaultId, ...details });
        }
      }
      
      setUserVaultsList(vaultDetails);
      addResult(`📁 Loaded ${vaultDetails.length} user vaults`, 'info');
    } catch (error) {
      addResult(`❌ Failed to load user vaults: ${error.message}`, 'error');
    }
  };

  // Test create vault with data
  const testCreateVaultWithData = async () => {
    if (!testState.connected) {
      addResult('❌ Please connect wallet first', 'error');
      return;
    }

    try {
      setTestState(prev => ({ ...prev, loading: true }));
      addResult('🚀 Creating vault with data...', 'info');
      
      const result = await improvedVaultFactoryService.createVaultWithData(vaultData);
      
      if (result.success) {
        addResult(`✅ Vault created! TX: ${result.transactionHash}`, 'success');
        addResult(`🔗 Explorer: ${result.explorerUrl}`, 'success');
        
        // Refresh stats
        setTimeout(() => loadContractStats(testState.userAddress), 3000);
      } else {
        addResult(`❌ Vault creation failed: ${result.error}`, 'error');
      }
    } catch (error) {
      addResult(`❌ Test failed: ${error.message}`, 'error');
    } finally {
      setTestState(prev => ({ ...prev, loading: false }));
    }
  };

  // Test create simple vault
  const testCreateSimpleVault = async () => {
    if (!testState.connected) {
      addResult('❌ Please connect wallet first', 'error');
      return;
    }

    try {
      setTestState(prev => ({ ...prev, loading: true }));
      addResult('🚀 Creating simple vault...', 'info');
      
      const result = await improvedVaultFactoryService.createVault();
      
      if (result.success) {
        addResult(`✅ Simple vault created! TX: ${result.transactionHash}`, 'success');
        addResult(`🔗 Explorer: ${result.explorerUrl}`, 'success');
        
        // Refresh stats
        setTimeout(() => loadContractStats(testState.userAddress), 3000);
      } else {
        addResult(`❌ Simple vault creation failed: ${result.error}`, 'error');
      }
    } catch (error) {
      addResult(`❌ Test failed: ${error.message}`, 'error');
    } finally {
      setTestState(prev => ({ ...prev, loading: false }));
    }
  };

  // Test update vault
  const testUpdateVault = async (vaultId) => {
    if (!testState.connected) {
      addResult('❌ Please connect wallet first', 'error');
      return;
    }

    try {
      setTestState(prev => ({ ...prev, loading: true }));
      addResult(`🚀 Updating vault ${vaultId}...`, 'info');
      
      const newHashId = `updated_hash_${Date.now()}`;
      const newCid = `updated_cid_${Date.now()}`;
      
      const result = await improvedVaultFactoryService.updateVault(vaultId, newHashId, newCid);
      
      if (result.success) {
        addResult(`✅ Vault ${vaultId} updated! TX: ${result.transactionHash}`, 'success');
        addResult(`🔗 Explorer: ${result.explorerUrl}`, 'success');
        
        // Refresh user vaults
        setTimeout(() => loadUserVaults(testState.userAddress), 3000);
      } else {
        addResult(`❌ Vault update failed: ${result.error}`, 'error');
      }
    } catch (error) {
      addResult(`❌ Update test failed: ${error.message}`, 'error');
    } finally {
      setTestState(prev => ({ ...prev, loading: false }));
    }
  };

  // Add result to display
  const addResult = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setTestState(prev => ({
      ...prev,
      results: [...prev.results, { message, type, timestamp }].slice(-20) // Keep last 20
    }));
  };

  // Clear results
  const clearResults = () => {
    setTestState(prev => ({ ...prev, results: [] }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        🔬 Improved Vault Factory Test Suite
      </h2>
      
      {/* Contract Info */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-2">Contract Information</h3>
        <div className="text-sm text-blue-700">
          <p><strong>Address:</strong> 0x84ee8d0a2b72eafb6af8bbd0516c08cf1fe08045</p>
          <p><strong>Network:</strong> Avalanche Fuji Testnet (Chain ID: 43113)</p>
          <p><strong>Type:</strong> ImprovedVaultFactory with enhanced features</p>
        </div>
      </div>

      {/* Wallet Connection */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={connectWallet}
            disabled={testState.loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {testState.connected ? '✅ Connected' : '🔗 Connect Wallet'}
          </button>
          
          {testState.connected && (
            <div className="text-sm text-gray-600">
              <p><strong>Address:</strong> {testState.userAddress.slice(0, 10)}...{testState.userAddress.slice(-8)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Contract Statistics */}
      {testState.connected && (
        <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-semibold text-green-800 mb-2">📊 Contract Statistics</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium">Total Vaults</p>
              <p className="text-2xl font-bold text-green-600">{contractStats.totalVaults}</p>
            </div>
            <div>
              <p className="font-medium">Your Vaults</p>
              <p className="text-2xl font-bold text-green-600">{contractStats.userVaults}</p>
            </div>
            <div>
              <p className="font-medium">Max Per User</p>
              <p className="text-2xl font-bold text-green-600">{contractStats.maxVaultsPerUser}</p>
            </div>
          </div>
        </div>
      )}

      {/* Vault Data Form */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-3">🗂️ Vault Data</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={vaultData.name}
              onChange={(e) => setVaultData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={vaultData.email}
              onChange={(e) => setVaultData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hash ID</label>
            <input
              type="text"
              value={vaultData.hashId}
              onChange={(e) => setVaultData(prev => ({ ...prev, hashId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CID</label>
            <input
              type="text"
              value={vaultData.cid}
              onChange={(e) => setVaultData(prev => ({ ...prev, cid: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </div>
      </div>

      {/* Test Actions */}
      <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <h3 className="font-semibold text-yellow-800 mb-3">🧪 Test Actions</h3>
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={testCreateVaultWithData}
            disabled={testState.loading || !testState.connected}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
          >
            🗂️ Create Vault With Data
          </button>
          
          <button
            onClick={testCreateSimpleVault}
            disabled={testState.loading || !testState.connected}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
          >
            📁 Create Simple Vault
          </button>
          
          <button
            onClick={() => loadContractStats(testState.userAddress)}
            disabled={testState.loading || !testState.connected}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            🔄 Refresh Stats
          </button>
        </div>
      </div>

      {/* User Vaults */}
      {testState.connected && userVaultsList.length > 0 && (
        <div className="mb-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
          <h3 className="font-semibold text-indigo-800 mb-3">📁 Your Vaults</h3>
          <div className="space-y-3">
            {userVaultsList.map((vault, index) => (
              <div key={vault.id} className="p-3 bg-white rounded border border-indigo-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium">Vault #{vault.id}</p>
                    <p className="text-sm text-gray-600">Name: {vault.name}</p>
                    <p className="text-sm text-gray-600">Email: {vault.email}</p>
                    <p className="text-sm text-gray-600">Hash ID: {vault.hashId}</p>
                    <p className="text-sm text-gray-600">CID: {vault.cid}</p>
                    <p className="text-sm text-gray-600">Created: {new Date(vault.createdAt * 1000).toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => testUpdateVault(vault.id)}
                    disabled={testState.loading}
                    className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 disabled:opacity-50"
                  >
                    🔄 Update
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results Display */}
      <div className="p-4 bg-gray-900 text-white rounded-lg">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold">🔍 Test Results</h3>
          <button
            onClick={clearResults}
            className="px-3 py-1 bg-gray-700 text-white rounded text-sm hover:bg-gray-600"
          >
            Clear
          </button>
        </div>
        
        <div className="max-h-96 overflow-y-auto space-y-1">
          {testState.results.length === 0 ? (
            <p className="text-gray-400 text-sm">No results yet. Run some tests!</p>
          ) : (
            testState.results.map((result, index) => (
              <div key={index} className="text-sm">
                <span className="text-gray-400">[{result.timestamp}]</span>{' '}
                <span className={
                  result.type === 'success' ? 'text-green-400' :
                  result.type === 'error' ? 'text-red-400' :
                  result.type === 'warning' ? 'text-yellow-400' :
                  'text-blue-400'
                }>
                  {result.message}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Loading Indicator */}
      {testState.loading && (
        <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            <span>Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImprovedVaultFactoryTest;