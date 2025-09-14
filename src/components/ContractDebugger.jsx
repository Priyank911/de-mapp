// src/components/ContractDebugger.jsx
import React, { useState } from 'react';
import { ContractDebugger } from '../utils/contractDebugger';

const ContractDebuggerComponent = () => {
  const [debugResults, setDebugResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [contractAddress, setContractAddress] = useState('0x6afd10e0b2e11784aabb298105e23d2e68add687');

  const runDiagnostics = async () => {
    if (!window.ethereum) {
      alert('Please install Core Wallet or MetaMask');
      return;
    }

    setLoading(true);
    try {
      // Connect wallet
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Run diagnostics
      const results = await ContractDebugger.debugContractCall(
        window.ethereum,
        contractAddress,
        '0x7a8962c3', // createVault()
        accounts[0]
      );

      setDebugResults(results);

    } catch (error) {
      setDebugResults({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Contract Debugger</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Contract Address:
        </label>
        <input
          type="text"
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md font-mono text-sm"
          placeholder="0x..."
        />
      </div>

      <button
        onClick={runDiagnostics}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Running Diagnostics...' : 'Run Contract Diagnostics'}
      </button>

      {debugResults && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Diagnostic Results:</h3>
          
          {debugResults.error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <strong>Error:</strong> {debugResults.error}
            </div>
          ) : (
            <div className="space-y-4">
              <div className={`p-4 rounded-md ${debugResults.contractExists ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <strong>Contract Exists:</strong> {debugResults.contractExists ? '✅ Yes' : '❌ No'}
              </div>
              
              <div className="p-4 bg-blue-100 rounded-md">
                <strong>Account Balance:</strong> {debugResults.balance?.toFixed(4)} AVAX
              </div>
              
              <div className={`p-4 rounded-md ${debugResults.callSucceeds ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                <strong>Contract Call Test:</strong> {debugResults.callSucceeds ? '✅ Success' : '⚠️ May fail'}
              </div>
              
              <div className="p-4 bg-gray-100 rounded-md">
                <strong>Gas Estimate:</strong> {debugResults.gasEstimate?.toLocaleString()} gas
              </div>
              
              <div className="p-4 bg-gray-100 rounded-md">
                <strong>Gas Price:</strong> {(debugResults.gasPrice / Math.pow(10, 9))?.toFixed(2)} gwei
              </div>
              
              <div className="p-4 bg-gray-100 rounded-md">
                <strong>Transaction Cost:</strong> {debugResults.txCost?.toFixed(6)} AVAX
              </div>
              
              <div className={`p-4 rounded-md ${debugResults.canAfford ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <strong>Can Afford Transaction:</strong> {debugResults.canAfford ? '✅ Yes' : '❌ No'}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <h4 className="font-semibold text-yellow-800 mb-2">Common Issues:</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• <strong>Insufficient funds:</strong> Need at least 0.1 AVAX for transaction</li>
          <li>• <strong>Wrong network:</strong> Ensure you're on Avalanche Fuji Testnet</li>
          <li>• <strong>Contract not found:</strong> Verify the contract address is correct</li>
          <li>• <strong>Execution reverted:</strong> Contract may have restrictions or be paused</li>
        </ul>
      </div>
    </div>
  );
};

export default ContractDebuggerComponent;