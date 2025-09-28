import React, { useState, useEffect } from 'react';
import avaxTransactionService from '../services/avaxTransactionService';
import './TransactionStatusIndicator.css';

const TransactionStatusIndicator = ({ cid, email, uuid, onStatusChange }) => {
  const [status, setStatus] = useState('loading');
  const [_transaction, setTransaction] = useState(null);
  const [_error, setError] = useState(null);
  const [_successMessage, setSuccessMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);



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
          pollForConfirmation();
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
  const pollForConfirmation = async () => {
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

  // Don't render if no CID
  if (!cid) {
    return null;
  }

  return (
    <div className="avax-button-container">
      {(status === 'not-found' || status === 'pending' || status === 'failed') && (
        <button
          onClick={handleStoreToAvax}
          disabled={isProcessing}
          className={`avax-theme-button ${isProcessing ? 'processing' : ''}`}
        >
          <svg className="avax-button-icon" viewBox="0 0 24 24" fill="none">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="avax-button-text">
            {isProcessing ? 'Processing...' : 'Store to AVAX'}
          </span>
          {isProcessing && (
            <div className="avax-spinner">
              <div className="avax-spinner-dot"></div>
            </div>
          )}
        </button>
      )}
    </div>
  );
};

export default TransactionStatusIndicator;