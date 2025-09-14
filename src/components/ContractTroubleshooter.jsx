// src/components/ContractTroubleshooter.jsx
import React, { useState } from 'react';
import directContractService from '../services/directContractService';
import { ContractDebugger } from '../utils/contractDebugger';

const ContractTroubleshooter = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const runFullDiagnostics = async () => {
    setLoading(true);
    const diagnostics = {};

    try {
      console.log('🔍 Starting comprehensive contract diagnostics...');
      
      // 1. Test direct RPC interaction
      console.log('📡 Testing direct RPC interaction...');
      diagnostics.directRpc = await directContractService.testContractInteraction();
      
      // 2. Test wallet interaction (if available)
      if (window.ethereum) {
        console.log('👛 Testing wallet interaction...');
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          
          if (accounts.length > 0) {
            diagnostics.walletDebug = await ContractDebugger.debugContractCall(
              window.ethereum,
              '0x6afd10e0b2e11784aabb298105e23d2e68add687',
              '0x7a8962c3',
              accounts[0]
            );
          }
        } catch (walletError) {
          diagnostics.walletDebug = { error: walletError.message };
        }
      } else {
        diagnostics.walletDebug = { error: 'No wallet detected' };
      }
      
      // 3. Check network details
      console.log('🌐 Checking network details...');
      if (window.ethereum) {
        try {
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          const networkVersion = await window.ethereum.request({ method: 'net_version' });
          
          diagnostics.network = {
            chainId,
            networkVersion,
            expectedChainId: '0xA869', // Fuji testnet
            isCorrectNetwork: chainId === '0xA869'
          };
        } catch (networkError) {
          diagnostics.network = { error: networkError.message };
        }
      }
      
      // 4. Check if this is a multicall issue
      console.log('🔄 Checking for multicall interference...');
      diagnostics.multicallCheck = {
        walletType: window.ethereum?.isMetaMask ? 'MetaMask' : 
                   window.ethereum?.isCoreWallet ? 'Core Wallet' : 'Unknown',
        hasMulticall: window.ethereum?.request ? true : false,
        recommendation: 'Try using Core Wallet directly or refresh page'
      };
      
      setResults(diagnostics);
      
    } catch (error) {
      setResults({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const tryAlternativeTransaction = async () => {
    if (!window.ethereum) {
      alert('No wallet detected');
      return;
    }

    try {
      setLoading(true);
      
      // Try a simplified transaction approach
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Ultra-simple transaction parameters
      const txParams = {
        from: accounts[0],
        to: '0x6afd10e0b2e11784aabb298105e23d2e68add687',
        data: '0x7a8962c3', // createVault()
        gas: '0x7A120', // 500,000
        gasPrice: '0x5D21DBA00' // 25 gwei
      };
      
      console.log('🚀 Attempting simplified transaction...');
      console.log('📝 Parameters:', txParams);
      
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [txParams],
      });
      
      alert(`✅ Transaction sent: ${txHash}`);
      
    } catch (error) {
      console.error('❌ Alternative transaction failed:', error);
      alert(`Transaction failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Contract Troubleshooter</h2>
      
      <div className="space-y-4 mb-6">
        <button
          onClick={runFullDiagnostics}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Running Diagnostics...' : 'Run Full Diagnostics'}
        </button>
        
        <button
          onClick={tryAlternativeTransaction}
          disabled={loading}
          className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 disabled:opacity-50 ml-4"
        >
          {loading ? 'Sending...' : 'Try Alternative Transaction'}
        </button>
      </div>

      {results && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Diagnostic Results:</h3>
          
          {/* Direct RPC Results */}
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-green-700 mb-2">🔗 Direct RPC Test</h4>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
              {JSON.stringify(results.directRpc, null, 2)}
            </pre>
          </div>
          
          {/* Wallet Debug Results */}
          {results.walletDebug && (
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-blue-700 mb-2">👛 Wallet Debug</h4>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(results.walletDebug, null, 2)}
              </pre>
            </div>
          )}
          
          {/* Network Check */}
          {results.network && (
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-purple-700 mb-2">🌐 Network Status</h4>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(results.network, null, 2)}
              </pre>
            </div>
          )}
          
          {/* Multicall Check */}
          {results.multicallCheck && (
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-orange-700 mb-2">🔄 Multicall Analysis</h4>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(results.multicallCheck, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <h4 className="font-semibold text-yellow-800 mb-2">🛠️ Troubleshooting Tips:</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• <strong>Multicall Error:</strong> This usually happens when the wallet uses middleware that batches calls</li>
          <li>• <strong>Solution 1:</strong> Try using Core Wallet instead of MetaMask</li>
          <li>• <strong>Solution 2:</strong> Refresh the page and try again</li>
          <li>• <strong>Solution 3:</strong> Disable any wallet middleware or extensions</li>
          <li>• <strong>Solution 4:</strong> Use the "Try Alternative Transaction" button above</li>
          <li>• <strong>Network:</strong> Ensure you're on Avalanche Fuji Testnet (Chain ID: 43113)</li>
          <li>• <strong>Balance:</strong> Make sure you have at least 0.1 AVAX for gas</li>
        </ul>
      </div>
    </div>
  );
};

export default ContractTroubleshooter;