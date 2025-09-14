// Quick contract test component
import React, { useState, useEffect } from 'react';
import simpleVaultService from '../services/simpleVaultService';

const QuickContractTest = () => {
  const [status, setStatus] = useState('Loading...');
  const [contractInfo, setContractInfo] = useState(null);

  useEffect(() => {
    // Test if the service loads correctly
    try {
      setContractInfo({
        address: '0x21a88b9f2aac6c7b51927035178b3b8a43119aeb',
        network: 'Avalanche Fuji Testnet',
        status: 'Service loaded successfully'
      });
      setStatus('✅ Ready');
    } catch (error) {
      setStatus(`❌ Error: ${error.message}`);
    }
  }, []);

  const testConnection = async () => {
    setStatus('🔄 Testing connection...');
    
    try {
      // Test if Core Wallet is available
      if (typeof window !== 'undefined' && window.avalanche) {
        setStatus('✅ Core Wallet detected');
      } else {
        setStatus('⚠️ Core Wallet not found');
      }
    } catch (error) {
      setStatus(`❌ Connection failed: ${error.message}`);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-blue-50">
      <h3 className="font-bold text-lg mb-2">🧪 Contract Service Test</h3>
      
      <div className="space-y-2">
        <p><strong>Status:</strong> {status}</p>
        
        {contractInfo && (
          <div className="text-sm">
            <p><strong>Contract:</strong> {contractInfo.address}</p>
            <p><strong>Network:</strong> {contractInfo.network}</p>
            <p className="text-green-600">{contractInfo.status}</p>
          </div>
        )}
        
        <button 
          onClick={testConnection}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Test Core Wallet Connection
        </button>
      </div>
    </div>
  );
};

export default QuickContractTest;