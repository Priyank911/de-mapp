// Example: How to use the enhanced error handling in your components

import React, { useState } from 'react';
import simpleCIDStorageService from '../services/simpleCIDStorageService';
import TransactionErrorDisplay from './TransactionErrorDisplay';

const ExampleUploadComponent = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    cid: '',
    email: ''
  });

  const handleUpload = async () => {
    setIsUploading(true);
    setError(null);
    setResult(null);

    try {
      const uploadResult = await simpleCIDStorageService.storeRecord(
        formData.cid, 
        formData.email
      );

      if (uploadResult.success) {
        setResult(uploadResult);
        console.log('✅ Upload successful:', uploadResult);
      } else {
        // Enhanced error object with detailed analysis
        setError(uploadResult);
        console.error('❌ Upload failed with detailed error:', uploadResult);
      }

    } catch (catchError) {
      // Fallback error handling
      setError({
        success: false,
        error: 'Unexpected error occurred',
        errorCode: 'CATCH_ERROR',
        errorCategory: 'Unknown',
        debugInfo: catchError.message
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    handleUpload();
  };

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Upload to Blockchain</h2>
      
      {/* Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CID (Content Identifier)
          </label>
          <input
            type="text"
            value={formData.cid}
            onChange={(e) => setFormData(prev => ({ ...prev, cid: e.target.value }))}
            className="w-full p-2 border border-gray-300 rounded-lg"
            placeholder="QmxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxX"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full p-2 border border-gray-300 rounded-lg"
            placeholder="user@example.com"
          />
        </div>

        <button
          onClick={handleUpload}
          disabled={isUploading || !formData.cid || !formData.email}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isUploading ? '⏳ Uploading...' : '🚀 Upload to Blockchain'}
        </button>
      </div>

      {/* Success Result */}
      {result && result.success && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">✅ Upload Successful!</h3>
          <div className="text-sm text-green-700 space-y-1">
            <p><strong>Transaction:</strong> {result.transactionHash}</p>
            <p><strong>Contract:</strong> {result.contractAddress}</p>
            <a 
              href={result.explorerUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline block"
            >
              View on Explorer →
            </a>
          </div>
        </div>
      )}

      {/* Error Display Modal */}
      <TransactionErrorDisplay
        error={error}
        onRetry={handleRetry}
        onClose={handleCloseError}
      />
    </div>
  );
};

export default ExampleUploadComponent;

/* 
ERROR EXAMPLES YOU'LL NOW SEE:

1. USER DENIED:
   ❌ "🚫 Transaction cancelled by user. Please try again and approve the transaction in your wallet."

2. INSUFFICIENT FUNDS:
   ❌ "💰 Insufficient AVAX balance. You need at least 0.01 AVAX for gas fees. Please add funds to your wallet."

3. GAS ERROR:
   ❌ "⛽ Gas estimation failed. The network might be congested. Try again in a few minutes."

4. EXECUTION REVERTED:
   ❌ "🔄 Contract execution failed. This might be due to invalid data or contract restrictions. Please check your inputs."

5. NETWORK ERROR:
   ❌ "🌐 Network connection issue. Please check your internet connection and try again."

6. WALLET ERROR:
   ❌ "👛 Wallet connection issue. Please ensure your wallet (Core/MetaMask) is connected and unlocked."

7. WRONG NETWORK:
   ❌ "🔗 Wrong network detected. Please switch to Avalanche Fuji Testnet in your wallet."

Each error comes with:
- Clear user-friendly message
- Specific error category and code
- Step-by-step solution instructions
- Technical details for debugging
- Retry functionality
*/