// Transaction Error Display Component
import React, { useState } from 'react';

const TransactionErrorDisplay = ({ error, onRetry, onClose }) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!error || error.success !== false) return null;

  const getErrorIcon = (category) => {
    switch (category) {
      case 'User Action': return '🚫';
      case 'Balance': return '💰';
      case 'Gas': return '⛽';
      case 'Contract': return '📋';
      case 'Network': return '🌐';
      case 'Wallet': return '👛';
      case 'Input': return '❌';
      case 'Transaction': return '🔄';
      default: return '❓';
    }
  };

  const getErrorColor = (category) => {
    switch (category) {
      case 'User Action': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'Balance': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'Gas': return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'Contract': return 'bg-red-50 border-red-200 text-red-800';
      case 'Network': return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'Wallet': return 'bg-indigo-50 border-indigo-200 text-indigo-800';
      case 'Input': return 'bg-pink-50 border-pink-200 text-pink-800';
      case 'Transaction': return 'bg-gray-50 border-gray-200 text-gray-800';
      default: return 'bg-red-50 border-red-200 text-red-800';
    }
  };

  const getSolutionSteps = (errorCode) => {
    switch (errorCode) {
      case 'USER_DENIED':
        return [
          'Click "Try Again" below',
          'Approve the transaction in your wallet when prompted',
          'Make sure you want to proceed with the transaction'
        ];
      
      case 'INSUFFICIENT_FUNDS':
        return [
          'Add AVAX to your wallet (minimum 0.01 AVAX needed)',
          'Visit Avalanche Fuji Faucet for free testnet AVAX',
          'Wait for funds to arrive, then try again'
        ];
      
      case 'GAS_ERROR':
        return [
          'Wait 2-3 minutes for network congestion to clear',
          'Try again with a higher gas price',
          'Check if the network is experiencing issues'
        ];
      
      case 'EXECUTION_REVERTED':
        return [
          'Check that your CID format is correct',
          'Verify your email address is valid',
          'Ensure the contract is not paused or restricted'
        ];
      
      case 'NETWORK_ERROR':
        return [
          'Check your internet connection',
          'Try refreshing the page',
          'Switch to a different RPC endpoint if available'
        ];
      
      case 'WALLET_ERROR':
        return [
          'Unlock your wallet (Core/MetaMask)',
          'Refresh the page and reconnect wallet',
          'Check if wallet extension is enabled'
        ];
      
      case 'WRONG_NETWORK':
        return [
          'Open your wallet settings',
          'Switch to Avalanche Fuji Testnet',
          'Confirm network change and try again'
        ];
      
      default:
        return [
          'Try refreshing the page',
          'Check your wallet connection',
          'Contact support if the issue persists'
        ];
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`p-6 border-b border-gray-200 ${getErrorColor(error.errorCategory)}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getErrorIcon(error.errorCategory)}</span>
              <div>
                <h3 className="text-lg font-semibold">Transaction Failed</h3>
                <p className="text-sm opacity-75">{error.errorCategory} • {error.errorCode}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Error Message */}
        <div className="p-6">
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-2">What happened?</h4>
            <p className="text-gray-700 text-sm leading-relaxed">
              {error.error}
            </p>
          </div>

          {/* Solution Steps */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">How to fix this:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              {getSolutionSteps(error.errorCode).map((step, index) => (
                <li key={index} className="leading-relaxed">{step}</li>
              ))}
            </ol>
          </div>

          {/* Contract Information */}
          {error.contractAddress && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h5 className="font-medium text-gray-900 mb-2">Contract Information:</h5>
              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>Address:</strong> {error.contractAddress}</p>
                <p><strong>Network:</strong> Avalanche Fuji Testnet</p>
                {error.explorerUrl && (
                  <p>
                    <strong>Explorer:</strong>{' '}
                    <a 
                      href={error.explorerUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View on Snowtrace
                    </a>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Debug Information (Expandable) */}
          <div className="mb-6">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
            >
              {showDetails ? '▼' : '▶'} Technical Details
            </button>
            
            {showDetails && (
              <div className="mt-3 p-3 bg-gray-100 rounded text-xs text-gray-600 font-mono">
                <p><strong>Error Code:</strong> {error.errorCode}</p>
                <p><strong>Category:</strong> {error.errorCategory}</p>
                {error.debugInfo && <p><strong>Debug Info:</strong> {error.debugInfo}</p>}
                {error.originalError && <p><strong>Original Error:</strong> {error.originalError}</p>}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionErrorDisplay;