// Ultra Simple Contract Test Component
import React, { useState } from 'react';
import ultraSimpleVaultService from '../services/ultraSimpleVaultService';

const UltraSimpleContractTest = () => {
  const [contractAddress, setContractAddress] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [totalVaults, setTotalVaults] = useState(0);

  const updateContractAddress = () => {
    if (!contractAddress) {
      alert('Please enter a contract address');
      return;
    }
    
    ultraSimpleVaultService.updateContractAddress(contractAddress);
    setResult({
      success: true,
      message: `Contract address updated to: ${contractAddress}`,
      type: 'address-update'
    });
  };

  const testCreateVault = async () => {
    setLoading(true);
    setResult(null);

    try {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        timestamp: new Date().toISOString()
      };

      const result = await ultraSimpleVaultService.createVault(userData);
      setResult(result);

      if (result.success) {
        // Refresh vault count
        setTimeout(() => {
          loadVaultCount();
        }, 5000); // Wait 5 seconds for transaction to be mined
      }

    } catch (error) {
      setResult({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
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

  React.useEffect(() => {
    loadVaultCount();
  }, []);

  return (
    <div className="p-6 max-w-2xl mx-auto bg-green-50 border border-green-200 rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-green-800">
        🛡️ Ultra Simple Vault - GUARANTEED TO WORK
      </h2>
      
      <div className="space-y-4">
        {/* Contract Address Input */}
        <div className="bg-white p-4 rounded border">
          <h3 className="font-semibold mb-2">1. Deploy & Set Contract Address</h3>
          <p className="text-sm text-gray-600 mb-2">
            Deploy UltraSimpleVault.sol in Remix, then paste the address here:
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              placeholder="0x..."
              className="flex-1 p-2 border rounded text-sm"
            />
            <button
              onClick={updateContractAddress}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Set Address
            </button>
          </div>
        </div>

        {/* Contract Info */}
        <div className="bg-white p-4 rounded border">
          <h3 className="font-semibold mb-2">📊 Contract Status</h3>
          <p className="text-sm">
            <strong>Current Address:</strong> {ultraSimpleVaultService.contractAddress || 'Not set'}
          </p>
          <p className="text-sm">
            <strong>Total Vaults:</strong> {totalVaults}
          </p>
          <button
            onClick={loadVaultCount}
            className="mt-2 bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
          >
            Refresh Count
          </button>
        </div>

        {/* Test Button */}
        <div className="bg-white p-4 rounded border">
          <h3 className="font-semibold mb-2">2. Test Ultra Simple Vault Creation</h3>
          <button
            onClick={testCreateVault}
            disabled={loading || ultraSimpleVaultService.contractAddress === 'UPDATE_AFTER_DEPLOYMENT'}
            className="w-full bg-green-500 text-white px-4 py-3 rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '🔄 Creating Vault...' : '🚀 Create Ultra Simple Vault'}
          </button>
          
          {ultraSimpleVaultService.contractAddress === 'UPDATE_AFTER_DEPLOYMENT' && (
            <p className="text-red-600 text-sm mt-2">
              ⚠️ Please deploy the contract and set the address first
            </p>
          )}
        </div>

        {/* Results */}
        {result && (
          <div className={`p-4 rounded border ${
            result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <h3 className={`font-semibold mb-2 ${
              result.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {result.success ? '✅ Success!' : '❌ Failed'}
            </h3>
            
            {result.success ? (
              <div className="text-sm space-y-1">
                {result.type === 'address-update' ? (
                  <p className="text-green-700">{result.message}</p>
                ) : (
                  <>
                    <p><strong>Transaction:</strong> {result.transactionHash}</p>
                    <p><strong>Contract:</strong> {result.contractAddress}</p>
                    <p><strong>User:</strong> {result.userAddress}</p>
                    <a
                      href={result.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline block"
                    >
                      View on Snowtrace →
                    </a>
                  </>
                )}
              </div>
            ) : (
              <p className="text-red-700 text-sm">❌ {result.error}</p>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 p-4 rounded border border-blue-200">
          <h4 className="font-semibold mb-2">📋 Deployment Instructions:</h4>
          <ol className="list-decimal list-inside text-sm space-y-1">
            <li>Copy UltraSimpleVault.sol to <a href="https://remix.ethereum.org" target="_blank" className="text-blue-600 hover:underline">Remix IDE</a></li>
            <li>Compile with Solidity 0.8.19+</li>
            <li>Deploy to Avalanche Fuji Testnet</li>
            <li>Copy the deployed contract address</li>
            <li>Paste it in the input above and click "Set Address"</li>
            <li>Test the ultra-simple vault creation</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default UltraSimpleContractTest;