import React, { useState, useEffect } from 'react';
import avaxTransactionService from '../services/avaxTransactionService';

const TransactionStatusIndicator = ({ cid, email, uuid, onStatusChange }) => {
  const [status, setStatus] = useState('loading');
  const [transaction, setTransaction] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Status icons and colors
  const getStatusDisplay = (status) => {
    switch (status) {
      case 'completed':
        return {
          icon: '✅',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          message: 'Stored on AVAX'
        };
      case 'processing':
        return {
          icon: '⏳',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          message: 'Processing...'
        };
      case 'pending':
        return {
          icon: '📤',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          message: 'Ready to store'
        };
      case 'failed':
        return {
          icon: '❌',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          message: 'Failed - retry'
        };
      case 'not-found':
        return {
          icon: '📤',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          message: 'Store to AVAX'
        };
      default:
        return {
          icon: '⏸️',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          message: 'Loading...'
        };
    }
  };

  // Check transaction status
  useEffect(() => {
    const checkStatus = async () => {
      try {
        setError(null);
        const transactionStatus = await avaxTransactionService.getTransactionStatus(cid);
        
        setStatus(transactionStatus.status);
        setTransaction(transactionStatus);
        
        // Notify parent component of status change
        if (onStatusChange) {
          onStatusChange(transactionStatus);
        }
      } catch (error) {
        console.error('Error checking transaction status:', error);
        setError(error.message);
        setStatus('error');
      }
    };

    if (cid) {
      checkStatus();
    }
  }, [cid, onStatusChange]);

  // Handle store to AVAX action
  const handleStoreToAvax = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      setSuccessMessage(null);

      // Initialize the AVAX service
      await avaxTransactionService.initialize(false); // Use testnet

      // Store data on blockchain
      const result = await avaxTransactionService.storeDataOnBlockchain(email, uuid, cid);
      
      if (result.success) {
        if (result.existing) {
          // CID already exists and we found the existing transaction
          setStatus('completed');
          setTransaction({
            status: 'completed',
            transactionHash: result.transactionHash,
            explorerUrl: result.transactionHash !== 'imported-from-blockchain' 
              ? (result.explorerUrl || `https://testnet.snowtrace.io/tx/${result.transactionHash}`)
              : null,
            blockNumber: result.blockNumber,
            entryId: result.entryId,
            imported: result.imported
          });
          
          if (result.imported) {
            setSuccessMessage(`${result.message} - Record synced with local database`);
          } else {
            setSuccessMessage(result.message);
          }
          setError(null);
        } else {
          // New transaction started
          setStatus('processing');
          setTransaction({
            status: 'processing',
            transactionHash: result.transactionHash,
            explorerUrl: result.explorerUrl
          });
          setSuccessMessage(null);
          setError(null);
          
          // Start polling for confirmation
          pollForConfirmation(result.transactionHash);
        }
      }
    } catch (error) {
      console.error('Error storing to AVAX:', error);
      setError(error.message);
      setStatus('failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Poll for transaction confirmation
  const pollForConfirmation = async (txHash) => {
    let attempts = 0;
    const maxAttempts = 30; // 5 minutes with 10-second intervals
    
    const poll = async () => {
      try {
        if (attempts >= maxAttempts) {
          setStatus('timeout');
          return;
        }
        
        const transactionStatus = await avaxTransactionService.getTransactionStatus(cid);
        
        if (transactionStatus.status === 'completed') {
          setStatus('completed');
          setTransaction(transactionStatus);
          if (onStatusChange) {
            onStatusChange(transactionStatus);
          }
          return;
        }
        
        if (transactionStatus.status === 'failed') {
          setStatus('failed');
          setTransaction(transactionStatus);
          return;
        }
        
        attempts++;
        setTimeout(poll, 10000); // Poll every 10 seconds
      } catch (error) {
        console.error('Error polling for confirmation:', error);
        attempts++;
        setTimeout(poll, 10000);
      }
    };
    
    poll();
  };

  const statusDisplay = getStatusDisplay(status);

  // Don't render if no CID
  if (!cid) {
    return null;
  }

  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg border ${statusDisplay.bgColor} ${statusDisplay.borderColor}`}>
      <span className="text-lg">{statusDisplay.icon}</span>
      
      <div className="flex flex-col">
        <span className={`text-sm font-medium ${statusDisplay.color}`}>
          {statusDisplay.message}
        </span>
        
        {/* Show transaction hash for processing/completed states */}
        {transaction && transaction.transactionHash && 
         transaction.transactionHash !== 'imported-from-blockchain' && 
         transaction.explorerUrl && (
          <a
            href={transaction.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-500 hover:text-blue-700 underline"
          >
            View Transaction
          </a>
        )}
        
        {/* Show info for imported transactions */}
        {transaction && transaction.imported && (
          <span className="text-xs text-gray-500">
            Synced from blockchain
          </span>
        )}
        
        {/* Show error message */}
        {error && (
          <span className="text-xs text-red-500">
            {error}
          </span>
        )}
        
        {/* Show success message */}
        {successMessage && (
          <span className="text-xs text-green-600">
            ✅ {successMessage}
          </span>
        )}
      </div>
      
      {/* Action button for pending/failed states */}
      {(status === 'not-found' || status === 'pending' || status === 'failed') && (
        <button
          onClick={handleStoreToAvax}
          disabled={isProcessing}
          className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
            isProcessing
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isProcessing ? 'Processing...' : 'Store to AVAX'}
        </button>
      )}
    </div>
  );
};

export default TransactionStatusIndicator;