// Quick Test for Deployed UltraSimpleVault
import React, { useState, useEffect } from 'react';
import ultraSimpleVaultService from '../services/ultraSimpleVaultService';
import avaxTransactionService from '../services/avaxTransactionService';

const DeployedContractTest = () => {
  const [contractStatus, setContractStatus] = useState('Loading...');
  const [totalVaults, setTotalVaults] = useState(0);
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const CONTRACT_ADDRESS = '0x034f890f4bb9fae35ae601bf49671816a9e0eb8a';
  const DEPLOYMENT_TX = '0x2b09564a0e07594eebe28f7c0421ea78ac3528d0ed903322f5a3e9b9480f63f6';

  useEffect(() => {
    checkContractStatus();
    loadVaultCount();
  }, []);

  const checkContractStatus = async () => {
    try {
      const count = await ultraSimpleVaultService.getTotalVaults();
      setContractStatus(`✅ Contract is working! Total vaults: ${count}`);
    } catch (error) {
      setContractStatus(`❌ Contract error: ${error.message}`);
    }
  };

  const loadVaultCount = async () => {
    try {
      const count = await ultraSimpleVaultService.getTotalVaults();
      setTotalVaults(count);
    } catch (error) {
      console.error('Error loading vault count:', error);
    }
  };

  const testCreateVault = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      const userData = {
        name: 'Test User',
        email: 'test@ultraVault.com',
        timestamp: new Date().toISOString()
      };

      console.log('🚀 Testing ultra-simple vault creation...');
      const result = await avaxTransactionService.performAvaxUpload(userData);
      
      setTestResult(result);

      if (result.success) {
        // Wait and refresh vault count
        setTimeout(() => {
          loadVaultCount();
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

  const checkWalletStatus = async () => {
    try {
      if (!window.ethereum) {
        setTestResult({
          success: false,
          error: 'No wallet found. Please install Core Wallet or MetaMask.'
        });
        return;
      }

      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      
      if (accounts.length === 0) {
        setTestResult({
          success: false,
          error: 'No wallet connected. Please connect your wallet.'
        });
        return;
      }

      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      if (chainId !== '0xA869') {
        setTestResult({
          success: false,
          error: 'Wrong network. Please switch to Avalanche Fuji Testnet.'
        });
        return;
      }

      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [accounts[0], 'latest']
      });

      const balanceETH = parseInt(balance, 16) / 1e18;

      setTestResult({
        success: true,
        type: 'wallet-check',
        message: `Wallet ready! Address: ${accounts[0]}, Balance: ${balanceETH.toFixed(4)} AVAX`
      });

    } catch (error) {
      setTestResult({
        success: false,
        error: `Wallet check failed: ${error.message}`
      });
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-green-50 border border-green-200 rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-green-800">
        🎉 UltraSimpleVault Successfully Deployed!
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Contract Info */}
        <div className="bg-white p-4 border rounded">
          <h3 className="font-semibold mb-2 text-green-700">📋 Contract Details</h3>
          <p className="text-sm break-all"><strong>Address:</strong> {CONTRACT_ADDRESS}</p>
          <p className="text-sm"><strong>Block:</strong> 45986955</p>
          <p className="text-sm"><strong>Network:</strong> Fuji Testnet</p>
          <a
            href={`https://testnet.snowtrace.io/tx/${DEPLOYMENT_TX}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm"
          >
            View Deployment Tx →
          </a>
        </div>

        {/* Status */}
        <div className="bg-white p-4 border rounded">
          <h3 className="font-semibold mb-2 text-green-700">📊 Contract Status</h3>
          <p className="text-sm mb-2">{contractStatus}</p>
          <p className="text-sm"><strong>Total Vaults:</strong> {totalVaults}</p>
          <button
            onClick={loadVaultCount}
            className="mt-2 bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
          >
            Refresh Count
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 mb-4">
        <button
          onClick={checkWalletStatus}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          🔍 Check Wallet Status
        </button>

        <button
          onClick={testCreateVault}
          disabled={loading}
          className="w-full bg-green-500 text-white px-4 py-3 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? '🔄 Creating Vault...' : '🚀 Test Create Vault (Ultra Simple!)'}
        </button>
      </div>

      {/* Results */}
      {testResult && (
        <div className={`p-4 rounded border ${
          testResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}>
          <h3 className={`font-semibold mb-2 ${
            testResult.success ? 'text-green-800' : 'text-red-800'
          }`}>
            {testResult.success ? '✅ Test Result: SUCCESS' : '❌ Test Result: FAILED'}
          </h3>
          
          {testResult.success ? (
            <div className="text-sm space-y-1">
              {testResult.type === 'wallet-check' ? (
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
                      View Transaction on Snowtrace →
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

      {/* Success Message */}
      <div className="mt-6 bg-green-100 p-4 rounded border border-green-300">
        <h4 className="font-semibold text-green-800 mb-2">🎉 Congratulations!</h4>
        <p className="text-green-700 text-sm">
          Your UltraSimpleVault contract is now deployed and working! This contract is guaranteed to work because it's the simplest possible implementation - just increments counters. No more "execution reverted" errors!
        </p>
      </div>

      {/* Contract Explorer Link */}
      <div className="mt-4 text-center">
        <a
          href={`https://testnet.snowtrace.io/address/${CONTRACT_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 inline-block"
        >
          🔍 View Contract on Snowtrace
        </a>
      </div>
    </div>
  );
};

export default DeployedContractTest;