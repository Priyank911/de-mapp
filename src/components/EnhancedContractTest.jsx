// Enhanced Contract Test with Complete ABI Support
import React, { useState, useEffect } from 'react';
import ultraSimpleVaultService from '../services/ultraSimpleVaultService';

const EnhancedContractTest = () => {
  const [contractData, setContractData] = useState({
    totalVaults: 0,
    userVaultCount: 0,
    userAddress: null
  });
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [vaultDetails, setVaultDetails] = useState(null);

  const CONTRACT_ADDRESS = '0x034f890f4bb9fae35ae601bf49671816a9e0eb8a';

  useEffect(() => {
    loadContractData();
  }, []);

  const loadContractData = async () => {
    try {
      const totalVaults = await ultraSimpleVaultService.getTotalVaults();
      setContractData(prev => ({ ...prev, totalVaults }));

      // Try to get user address
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const userAddress = accounts[0];
          const userVaultCount = await ultraSimpleVaultService.getUserVaultCount(userAddress);
          setContractData(prev => ({ 
            ...prev, 
            userAddress, 
            userVaultCount 
          }));
        }
      }
    } catch (error) {
      console.error('Error loading contract data:', error);
    }
  };

  const testCreateVault = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      const userData = {
        name: 'Enhanced Test User',
        email: 'enhanced@test.com',
        hashId: `hash_${Date.now()}`,
        cid: `QmTest${Date.now()}`,
        timestamp: new Date().toISOString()
      };

      console.log('🚀 Testing enhanced vault creation...');
      const result = await ultraSimpleVaultService.createVault(userData);
      
      setTestResult(result);

      if (result.success) {
        // Refresh contract data after successful creation
        setTimeout(() => {
          loadContractData();
        }, 5000);
      }

    } catch (error) {
      setTestResult({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const testGetVault = async () => {
    if (contractData.totalVaults === 0) {
      setTestResult({
        success: false,
        error: 'No vaults exist yet. Create a vault first.'
      });
      return;
    }

    try {
      setLoading(true);
      const vaultId = contractData.totalVaults; // Get the latest vault
      const vaultData = await ultraSimpleVaultService.getVault(vaultId);
      
      setVaultDetails(vaultData);
      setTestResult({
        success: true,
        type: 'vault-details',
        message: `Retrieved vault ${vaultId} details successfully`
      });
    } catch (error) {
      setTestResult({
        success: false,
        error: `Failed to get vault details: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('No wallet found');
      }

      await window.ethereum.request({ method: 'eth_requestAccounts' });
      loadContractData();
      
      setTestResult({
        success: true,
        type: 'wallet-connect',
        message: 'Wallet connected successfully'
      });
    } catch (error) {
      setTestResult({
        success: false,
        error: `Wallet connection failed: ${error.message}`
      });
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-800">
        🔧 Enhanced Contract Test - Complete ABI Support
      </h2>
      
      {/* Contract Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 border border-blue-200 rounded">
          <h3 className="font-semibold text-blue-800 mb-2">📊 Contract Stats</h3>
          <p className="text-sm"><strong>Total Vaults:</strong> {contractData.totalVaults}</p>
          <p className="text-sm"><strong>Contract:</strong> {CONTRACT_ADDRESS}</p>
          <p className="text-sm"><strong>Network:</strong> Fuji Testnet</p>
        </div>

        <div className="bg-green-50 p-4 border border-green-200 rounded">
          <h3 className="font-semibold text-green-800 mb-2">👤 User Info</h3>
          {contractData.userAddress ? (
            <>
              <p className="text-sm break-all"><strong>Address:</strong> {contractData.userAddress}</p>
              <p className="text-sm"><strong>My Vaults:</strong> {contractData.userVaultCount}</p>
            </>
          ) : (
            <p className="text-sm text-gray-600">Wallet not connected</p>
          )}
        </div>

        <div className="bg-yellow-50 p-4 border border-yellow-200 rounded">
          <h3 className="font-semibold text-yellow-800 mb-2">🛠️ Available Functions</h3>
          <ul className="text-xs space-y-1">
            <li>✅ createVault()</li>
            <li>✅ createVaultWithData()</li>
            <li>✅ getTotalVaultCount()</li>
            <li>✅ getUserVaultCount()</li>
            <li>✅ getVault()</li>
          </ul>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {!contractData.userAddress && (
          <button
            onClick={connectWallet}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            🔗 Connect Wallet
          </button>
        )}

        <button
          onClick={loadContractData}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          🔄 Refresh Data
        </button>

        <button
          onClick={testCreateVault}
          disabled={loading || !contractData.userAddress}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? '🔄 Creating...' : '🚀 Create Vault'}
        </button>

        <button
          onClick={testGetVault}
          disabled={loading || contractData.totalVaults === 0}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
        >
          {loading ? '🔄 Loading...' : '📄 Get Vault Details'}
        </button>
      </div>

      {/* Test Results */}
      {testResult && (
        <div className={`p-4 rounded border mb-6 ${
          testResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}>
          <h3 className={`font-semibold mb-2 ${
            testResult.success ? 'text-green-800' : 'text-red-800'
          }`}>
            {testResult.success ? '✅ Success!' : '❌ Failed'}
          </h3>
          
          {testResult.success ? (
            <div className="text-sm space-y-1">
              {testResult.type === 'vault-details' || testResult.type === 'wallet-connect' ? (
                <p className="text-green-700">{testResult.message}</p>
              ) : (
                <>
                  <p><strong>Transaction:</strong> {testResult.transactionHash}</p>
                  <p><strong>Contract:</strong> {testResult.contractAddress}</p>
                  {testResult.userAddress && <p><strong>User:</strong> {testResult.userAddress}</p>}
                  {testResult.explorerUrl && (
                    <a
                      href={testResult.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline block"
                    >
                      View on Snowtrace →
                    </a>
                  )}
                  <p className="text-green-700 mt-2">🎯 {testResult.message}</p>
                </>
              )}
            </div>
          ) : (
            <p className="text-red-700 text-sm">❌ {testResult.error}</p>
          )}
        </div>
      )}

      {/* Vault Details */}
      {vaultDetails && (
        <div className="bg-purple-50 p-4 border border-purple-200 rounded mb-6">
          <h3 className="font-semibold text-purple-800 mb-2">📄 Vault Details</h3>
          <div className="text-sm space-y-1">
            <p><strong>Vault ID:</strong> {vaultDetails.vaultId}</p>
            <p><strong>Raw Data:</strong> {vaultDetails.rawData}</p>
            <p className="text-purple-600">Note: Data decoding can be enhanced with proper ABI decoder</p>
          </div>
        </div>
      )}

      {/* ABI Features */}
      <div className="bg-gray-50 p-4 rounded border">
        <h4 className="font-semibold mb-2">📋 Complete ABI Features Available:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="font-medium text-green-700">✅ Write Functions:</h5>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>createVault() - Basic vault creation</li>
              <li>createVaultWithData() - Vault with metadata</li>
              <li>updateVault() - Update existing vault</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-blue-700">📖 Read Functions:</h5>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>getTotalVaultCount() - Total vault count</li>
              <li>getUserVaultCount() - User's vault count</li>
              <li>getUserVaults() - List user's vaults</li>
              <li>getVault() - Get vault details</li>
              <li>getDeployedVaults() - All vault IDs</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4 text-xs text-gray-600">
          <p><strong>Error Handling:</strong> InvalidInput, MaxVaultsReached, NotVaultOwner, VaultDoesNotExist</p>
          <p><strong>Events:</strong> VaultCreated, DataStored, VaultUpdated</p>
        </div>
      </div>
    </div>
  );
};

export default EnhancedContractTest;