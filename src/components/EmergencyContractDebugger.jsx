// Emergency Contract Debugger for SimpleVaultFactory
import React, { useState } from 'react';

const EmergencyContractDebugger = () => {
  const [debugResult, setDebugResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const CONTRACT_ADDRESS = '0x21A88B9F2aaC6C7b51927035178B3b8A43119AeB';
  const FUJI_RPC = 'https://api.avax-test.network/ext/bc/C/rpc';

  const debugBasicCall = async () => {
    setLoading(true);
    setDebugResult(null);

    try {
      console.log('🔍 Testing basic contract call...');

      // Test 1: Check if contract exists
      const response = await fetch(FUJI_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getCode',
          params: [CONTRACT_ADDRESS, 'latest'],
          id: 1
        })
      });

      const codeResult = await response.json();
      const contractCode = codeResult.result;

      if (contractCode === '0x' || contractCode === '0x0') {
        setDebugResult({
          error: 'Contract not found at this address',
          address: CONTRACT_ADDRESS,
          recommendation: 'Contract may not be deployed or address is incorrect'
        });
        return;
      }

      console.log('✅ Contract exists at address');

      // Test 2: Try getTotalVaultCount() - should be a safe read-only call
      const countResponse = await fetch(FUJI_RPC, {
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

      const countResult = await countResponse.json();
      
      if (countResult.error) {
        setDebugResult({
          error: 'Read function failed',
          details: countResult.error,
          recommendation: 'Contract may have compilation issues'
        });
        return;
      }

      const vaultCount = parseInt(countResult.result, 16);
      console.log('📊 Current vault count:', vaultCount);

      // Test 3: Estimate gas for createVault()
      const gasResponse = await fetch(FUJI_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_estimateGas',
          params: [{
            to: CONTRACT_ADDRESS,
            data: '0x7a8962c3', // createVault()
            from: '0x0000000000000000000000000000000000000001' // Dummy address
          }],
          id: 3
        })
      });

      const gasResult = await gasResponse.json();
      
      if (gasResult.error) {
        setDebugResult({
          error: 'Gas estimation failed for createVault()',
          details: gasResult.error.message,
          gasError: gasResult.error,
          recommendation: 'Function may revert due to logic error or requirements not met',
          contractWorks: true,
          vaultCount: vaultCount
        });
        return;
      }

      const estimatedGas = parseInt(gasResult.result, 16);

      setDebugResult({
        success: true,
        contractExists: true,
        vaultCount: vaultCount,
        estimatedGas: estimatedGas,
        gasInHex: gasResult.result,
        recommendation: estimatedGas > 1000000 ? 'Gas usage is very high - contract may be complex' : 'Gas usage looks normal'
      });

    } catch (error) {
      setDebugResult({
        error: 'Network or RPC error',
        details: error.message,
        recommendation: 'Check network connection or try again'
      });
    } finally {
      setLoading(false);
    }
  };

  const testWithWallet = async () => {
    setLoading(true);
    try {
      if (!window.ethereum) {
        throw new Error('No wallet found');
      }

      // Connect to wallet
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const userAddress = accounts[0];
      console.log('👤 Using account:', userAddress);

      // Check network
      const chainId = await window.ethereum.request({ 
        method: 'eth_chainId' 
      });

      if (chainId !== '0xA869') { // 43113 in hex
        throw new Error('Please switch to Avalanche Fuji Testnet');
      }

      // Check balance
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [userAddress, 'latest']
      });

      const balanceInEther = parseInt(balance, 16) / 1e18;

      if (balanceInEther < 0.01) {
        setDebugResult({
          error: 'Insufficient AVAX balance',
          balance: balanceInEther,
          recommendation: 'Get AVAX from Fuji faucet: https://faucet.avax.network/'
        });
        return;
      }

      // Try to estimate gas with real user address
      const response = await fetch(FUJI_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_estimateGas',
          params: [{
            to: CONTRACT_ADDRESS,
            data: '0x7a8962c3', // createVault()
            from: userAddress
          }],
          id: 4
        })
      });

      const gasResult = await response.json();

      if (gasResult.error) {
        setDebugResult({
          error: 'Transaction would fail',
          userAddress: userAddress,
          balance: balanceInEther,
          gasError: gasResult.error,
          recommendation: 'Contract function will revert - check contract requirements'
        });
        return;
      }

      setDebugResult({
        success: true,
        userAddress: userAddress,
        balance: balanceInEther,
        estimatedGas: parseInt(gasResult.result, 16),
        recommendation: 'Ready to transact - gas estimation successful'
      });

    } catch (error) {
      setDebugResult({
        error: 'Wallet test failed',
        details: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-red-800">
        🚨 Contract Execution Reverted - Emergency Debugger
      </h2>
      
      <div className="bg-white p-4 rounded mb-4">
        <h3 className="font-semibold text-gray-800 mb-2">Contract Details:</h3>
        <p className="text-sm"><strong>Address:</strong> {CONTRACT_ADDRESS}</p>
        <p className="text-sm"><strong>Network:</strong> Avalanche Fuji Testnet</p>
        <p className="text-sm"><strong>Issue:</strong> Execution Reverted</p>
      </div>

      <div className="space-y-3 mb-4">
        <button
          onClick={debugBasicCall}
          disabled={loading}
          className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
        >
          {loading ? '🔄 Testing...' : '🔍 Test Basic Contract Functions'}
        </button>

        <button
          onClick={testWithWallet}
          disabled={loading}
          className="w-full bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
        >
          {loading ? '🔄 Testing...' : '👤 Test With Connected Wallet'}
        </button>
      </div>

      {debugResult && (
        <div className={`p-4 rounded-lg ${
          debugResult.success 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <h3 className={`font-semibold mb-2 ${
            debugResult.success ? 'text-green-800' : 'text-red-800'
          }`}>
            {debugResult.success ? '✅ Debug Results' : '❌ Issues Found'}
          </h3>
          
          {debugResult.success ? (
            <div className="text-sm space-y-1">
              {debugResult.contractExists && <p>✅ Contract exists at address</p>}
              {debugResult.vaultCount !== undefined && <p>📊 Current vaults: {debugResult.vaultCount}</p>}
              {debugResult.estimatedGas && <p>⛽ Estimated gas: {debugResult.estimatedGas.toLocaleString()}</p>}
              {debugResult.balance && <p>💰 Balance: {debugResult.balance.toFixed(4)} AVAX</p>}
              {debugResult.userAddress && <p>👤 Address: {debugResult.userAddress}</p>}
              <p className="text-green-700 mt-2">🎯 {debugResult.recommendation}</p>
            </div>
          ) : (
            <div className="text-sm space-y-1">
              <p className="text-red-700">❌ Error: {debugResult.error}</p>
              {debugResult.details && <p className="text-red-600">Details: {debugResult.details}</p>}
              {debugResult.gasError && (
                <div className="mt-2 p-2 bg-red-100 rounded">
                  <p className="text-red-800 font-semibold">Gas Estimation Error:</p>
                  <p className="text-red-700 text-xs">{JSON.stringify(debugResult.gasError, null, 2)}</p>
                </div>
              )}
              <p className="text-red-800 mt-2">💡 {debugResult.recommendation}</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
        <h4 className="font-semibold mb-2">🔧 Quick Fixes to Try:</h4>
        <ol className="list-decimal list-inside space-y-1 text-gray-700">
          <li>Check if you have enough AVAX for gas fees</li>
          <li>Ensure you're connected to Fuji Testnet (Chain ID: 43113)</li>
          <li>Try with a lower gas limit (100,000 instead of 300,000)</li>
          <li>Test the contract on Snowtrace to see detailed error</li>
          <li>Consider using the simpler createVault() function</li>
        </ol>
      </div>
    </div>
  );
};

export default EmergencyContractDebugger;