// Contract Integration Test - New SimpleVaultFactory
import React, { useState } from 'react';
import simpleVaultService from '../services/simpleVaultService.js';

const ContractIntegrationTest = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testNewContract = async () => {
    setLoading(true);
    setResult(null);

    try {
      console.log('🧪 Testing new SimpleVaultFactory contract...');
      
      // Test data
      const testData = {
        name: 'Test User',
        email: 'test@example.com',
        hashId: 'test123',
        cid: 'QmTestCID123',
        walletAddress: 'Connected via Core Wallet'
      };

      // Attempt to create a vault
      const result = await simpleVaultService.performAvaxUpload(testData);
      
      setResult(result);
      
      if (result.success) {
        console.log('✅ Contract test successful!');
        console.log('🔗 Transaction:', `https://testnet.snowtrace.io/tx/${result.transactionHash}`);
      } else {
        console.log('❌ Contract test failed:', result.error);
      }
      
    } catch (error) {
      console.error('❌ Test error:', error);
      setResult({ 
        success: false, 
        error: error.message,
        contractAddress: '0x21a88b9f2aac6c7b51927035178b3b8a43119aeb'
      });
    } finally {
      setLoading(false);
    }
  };

  const testContractRead = async () => {
    setLoading(true);
    try {
      console.log('📖 Testing contract read operations...');
      
      // Test getting total vault count
      const totalCount = await simpleVaultService.getTotalVaultCount();
      console.log('📊 Total vaults:', totalCount);
      
      setResult({
        success: true,
        type: 'read',
        totalVaults: totalCount
      });
      
    } catch (error) {
      console.error('❌ Read test error:', error);
      setResult({ 
        success: false, 
        error: error.message,
        type: 'read'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">
        🧪 SimpleVaultFactory Contract Test
      </h2>
      
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h3 className="font-semibold text-blue-800">Contract Details:</h3>
        <p className="text-sm text-blue-600">
          <strong>Address:</strong> 0x21a88b9f2aac6c7b51927035178b3b8a43119aeb
        </p>
        <p className="text-sm text-blue-600">
          <strong>Network:</strong> Avalanche Fuji Testnet
        </p>
        <p className="text-sm text-blue-600">
          <strong>Block:</strong> 45986138
        </p>
      </div>

      <div className="space-y-4">
        <button
          onClick={testContractRead}
          disabled={loading}
          className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? '🔄 Testing...' : '📖 Test Read Operations'}
        </button>

        <button
          onClick={testNewContract}
          disabled={loading}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? '🔄 Testing...' : '🚀 Test Create Vault'}
        </button>
      </div>

      {result && (
        <div className={`mt-6 p-4 rounded-lg ${
          result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <h3 className={`font-semibold ${result.success ? 'text-green-800' : 'text-red-800'}`}>
            {result.success ? '✅ Test Result: SUCCESS' : '❌ Test Result: FAILED'}
          </h3>
          
          {result.success ? (
            <div className="mt-2 space-y-2">
              {result.type === 'read' ? (
                <div>
                  <p className="text-green-700">📊 Total Vaults: {result.totalVaults?.count || 'Unknown'}</p>
                </div>
              ) : (
                <div>
                  <p className="text-green-700">🔗 Transaction Hash: {result.transactionHash}</p>
                  <p className="text-green-700">🆔 Vault ID: {result.vaultId}</p>
                  <p className="text-green-700">📦 Block: {result.blockNumber}</p>
                  <a
                    href={`https://testnet.snowtrace.io/tx/${result.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View on Snowtrace →
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-2">
              <p className="text-red-700 text-sm">❌ Error: {result.error}</p>
              <p className="text-red-600 text-xs mt-1">Contract: {result.contractAddress}</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">📋 Test Instructions:</h4>
        <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
          <li>Make sure Core Wallet is installed and connected to Fuji Testnet</li>
          <li>Ensure you have some AVAX for gas fees</li>
          <li>Click "Test Read Operations" first (no gas required)</li>
          <li>Then try "Test Create Vault" (requires gas)</li>
          <li>Check Snowtrace link to verify transaction</li>
        </ol>
      </div>
    </div>
  );
};

export default ContractIntegrationTest;