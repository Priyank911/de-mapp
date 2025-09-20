import React, { useState, useEffect } from 'react';
import avaxTransactionService from '../services/avaxTransactionService';
import './TransactionStatusIndicator.css';

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
          <div className="avax-sync-container">
            <svg className="avax-sync-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
            </svg>
            <span className="avax-sync-text">
              Synced
            </span>
          </div>
        )}
        
        {/* Show error message */}
        {error && (
          <span className="text-xs text-red-500">
            {error}
          </span>
        )}
        
        {/* Show success message - Magical Interface */}
        {successMessage && (
          <div className="avax-main-container">
            <div className="avax-success-container">
              <div className="avax-success-icon">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              </div>
              
              <div className="avax-text-content">
                <p className="avax-text-title">
                  Stored on AVAX
                </p>
                <p className="avax-text-subtitle">
                  {successMessage.includes('synced') || successMessage.includes('Record synced') 
                    ? 'Blockchain synchronized' 
                    : 'Network verified & secured'
                  }
                </p>
              </div>
              
              <div className="avax-live-badge">
                <div className="avax-live-dot"></div>
                <span style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.02em' }}>
                  {successMessage.includes('synced') || successMessage.includes('Record synced') 
                    ? 'Synced' 
                    : 'Live'
                  }
                </span>
              </div>
            </div>
          </div>
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