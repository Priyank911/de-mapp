// Manual Contract Test - Direct RPC Calls
import React, { useState } from 'react';

const ManualContractTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const CONTRACT_ADDRESS = '0x21A88B9F2aaC6C7b51927035178B3b8A43119AeB';
  const FUJI_RPC = 'https://api.avax-test.network/ext/bc/C/rpc';

  const addResult = (test, result) => {
    setTestResults(prev => [...prev, { test, result, timestamp: new Date() }]);
  };

  const runFullDiagnostic = async () => {
    setLoading(true);
    setTestResults([]);

    try {
      // Test 1: Contract Code Check
      addResult('Checking contract exists...', 'Running');
      
      const codeResponse = await fetch(FUJI_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getCode',
          params: [CONTRACT_ADDRESS, 'latest'],
          id: 1
        })
      });

      const codeResult = await codeResponse.json();
      const contractCode = codeResult.result;

      if (contractCode === '0x' || contractCode === '0x0') {
        addResult('Contract Code Check', '❌ FAILED: No contract at this address');
        return;
      } else {
        addResult('Contract Code Check', `✅ PASSED: Contract exists (${contractCode.length} bytes)`);
      }

      // Test 2: Read Function - getTotalVaultCount
      addResult('Testing read function...', 'Running');
      
      const readResponse = await fetch(FUJI_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{
            to: CONTRACT_ADDRESS,
            data: '0x18160ddd' // getTotalVaultCount()
          }, 'latest'],
          id: 2
        })
      });

      const readResult = await readResponse.json();
      
      if (readResult.error) {
        addResult('Read Function Test', `❌ FAILED: ${readResult.error.message}`);
      } else {
        const count = parseInt(readResult.result, 16);
        addResult('Read Function Test', `✅ PASSED: Total vaults = ${count}`);
      }

      // Test 3: Gas Estimation
      addResult('Testing gas estimation...', 'Running');
      
      const gasResponse = await fetch(FUJI_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_estimateGas',
          params: [{
            to: CONTRACT_ADDRESS,
            data: '0x7a8962c3', // createVault()
            from: '0x1234567890123456789012345678901234567890' // Dummy address
          }],
          id: 3
        })
      });

      const gasResult = await gasResponse.json();
      
      if (gasResult.error) {
        addResult('Gas Estimation Test', `❌ FAILED: ${gasResult.error.message}`);
        addResult('Error Analysis', `This suggests the createVault() function will revert`);
      } else {
        const gas = parseInt(gasResult.result, 16);
        addResult('Gas Estimation Test', `✅ PASSED: Estimated gas = ${gas.toLocaleString()}`);
      }

      // Test 4: Alternative Function - getDeployedVaults
      addResult('Testing alternative read function...', 'Running');
      
      const altResponse = await fetch(FUJI_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{
            to: CONTRACT_ADDRESS,
            data: '0x3b3bff0f' // getDeployedVaults()
          }, 'latest'],
          id: 4
        })
      });

      const altResult = await altResponse.json();
      
      if (altResult.error) {
        addResult('Alternative Function Test', `❌ FAILED: ${altResult.error.message}`);
      } else {
        addResult('Alternative Function Test', `✅ PASSED: getDeployedVaults() works`);
      }

    } catch (error) {
      addResult('Network Error', `❌ FAILED: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testWithWalletConnection = async () => {
    if (!window.ethereum) {
      addResult('Wallet Test', '❌ FAILED: No wallet found');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      if (accounts.length === 0) {
        addResult('Wallet Test', '❌ FAILED: No accounts');
        return;
      }

      addResult('Wallet Connection', `✅ PASSED: Connected to ${accounts[0]}`);

      // Check balance
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [accounts[0], 'latest']
      });

      const balanceETH = parseInt(balance, 16) / 1e18;
      addResult('Balance Check', `💰 Balance: ${balanceETH.toFixed(4)} AVAX`);

      if (balanceETH < 0.01) {
        addResult('Balance Warning', '⚠️ Low balance - may not have enough for gas');
      }

      // Test gas estimation with real address
      const gasResponse = await fetch(FUJI_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_estimateGas',
          params: [{
            to: CONTRACT_ADDRESS,
            data: '0x7a8962c3', // createVault()
            from: accounts[0]
          }],
          id: 5
        })
      });

      const gasResult = await gasResponse.json();
      
      if (gasResult.error) {
        addResult('Real Gas Test', `❌ FAILED: ${gasResult.error.message}`);
        addResult('Root Cause', 'Transaction will revert with this wallet address');
      } else {
        const gas = parseInt(gasResult.result, 16);
        addResult('Real Gas Test', `✅ PASSED: Gas needed = ${gas.toLocaleString()}`);
      }

    } catch (error) {
      addResult('Wallet Test Error', `❌ ${error.message}`);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🔧 Manual Contract Diagnostic</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 border rounded">
          <h3 className="font-semibold mb-2">Contract Info:</h3>
          <p className="text-sm break-all"><strong>Address:</strong> {CONTRACT_ADDRESS}</p>
          <p className="text-sm"><strong>Network:</strong> Fuji Testnet</p>
          <p className="text-sm"><strong>Issue:</strong> Execution Reverted</p>
        </div>
        
        <div className="bg-blue-50 p-4 border rounded">
          <h3 className="font-semibold mb-2">Quick Actions:</h3>
          <button
            onClick={runFullDiagnostic}
            disabled={loading}
            className="w-full bg-blue-500 text-white px-3 py-2 rounded mb-2 disabled:opacity-50"
          >
            {loading ? '🔄 Running...' : '🔍 Run Full Diagnostic'}
          </button>
          <button
            onClick={testWithWalletConnection}
            className="w-full bg-green-500 text-white px-3 py-2 rounded"
          >
            👤 Test With Wallet
          </button>
        </div>
      </div>

      {testResults.length > 0 && (
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="font-semibold mb-3">📋 Test Results:</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-2 rounded text-sm ${
                  result.result.includes('✅') 
                    ? 'bg-green-100 border-l-4 border-green-500'
                    : result.result.includes('❌')
                    ? 'bg-red-100 border-l-4 border-red-500'
                    : result.result.includes('⚠️')
                    ? 'bg-yellow-100 border-l-4 border-yellow-500'
                    : 'bg-blue-100 border-l-4 border-blue-500'
                }`}
              >
                <div className="font-medium">{result.test}</div>
                <div className="text-xs text-gray-600 mt-1">{result.result}</div>
                <div className="text-xs text-gray-400">
                  {result.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 bg-yellow-50 p-4 rounded border">
        <h4 className="font-semibold mb-2">🚨 Common Causes of "Execution Reverted":</h4>
        <ul className="text-sm space-y-1 list-disc list-inside">
          <li>Contract requires specific conditions that aren't met</li>
          <li>Gas limit too low for complex operations</li>
          <li>Contract has a bug in the logic</li>
          <li>Function parameters are invalid</li>
          <li>Contract state doesn't allow the operation</li>
        </ul>
      </div>
    </div>
  );
};

export default ManualContractTest;