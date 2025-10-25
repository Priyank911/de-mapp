import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import avaxTransactionService from '../services/avaxTransactionService';
import pushChainTransactionService from '../services/pushChainTransactionService';
import './TransactionStatusIndicator.css';

const TransactionStatusIndicator = ({ cid, email, uuid, onStatusChange }) => {
  const [status, setStatus] = useState('loading');
  const [_transaction, setTransaction] = useState(null);
  const [_error, setError] = useState(null);
  const [_successMessage, setSuccessMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showNetworkSelector, setShowNetworkSelector] = useState(false);



  // Check transaction status from both AVAX and Push Chain
  useEffect(() => {
    const checkStatus = async () => {
      try {
        setError(null);
        
        // Import Firebase services
        const { collection, query, where, getDocs } = await import('firebase/firestore');
        const { db } = await import('../firebase');
        
        console.log('🔍 Checking Firebase collections for CID:', cid);
        
        // Check Push Chain collection first
        const pushChainQuery = query(
          collection(db, 'pushChainTransactions'),
          where('cid', '==', cid)
        );
        const pushChainSnapshot = await getDocs(pushChainQuery);
        
        if (!pushChainSnapshot.empty) {
          // Found in Push Chain
          console.log('✅ CID found in Push Chain collection');
          const pushChainDoc = pushChainSnapshot.docs[0];
          const pushChainData = pushChainDoc.data();
          
          const transactionData = {
            status: 'completed',
            transactionHash: pushChainData.transactionHash,
            explorerUrl: pushChainData.explorerUrl || `https://donut.push.network/tx/${pushChainData.transactionHash}`,
            blockNumber: pushChainData.blockNumber,
            contractAddress: pushChainData.contractAddress,
            network: 'Push Chain Testnet'
          };
          
          setStatus('completed');
          setTransaction(transactionData);
          
          if (onStatusChange) {
            onStatusChange(transactionData);
          }
          return;
        }
        
        // Check AVAX collection
        const avaxQuery = query(
          collection(db, 'avaxTransactions'),
          where('cid', '==', cid)
        );
        const avaxSnapshot = await getDocs(avaxQuery);
        
        if (!avaxSnapshot.empty) {
          // Found in AVAX
          console.log('✅ CID found in AVAX collection');
          const avaxDoc = avaxSnapshot.docs[0];
          const avaxData = avaxDoc.data();
          
          const transactionData = {
            status: 'completed',
            transactionHash: avaxData.transactionHash,
            explorerUrl: avaxData.explorerUrl || `https://testnet.snowtrace.io/tx/${avaxData.transactionHash}`,
            blockNumber: avaxData.blockNumber,
            network: 'Avalanche Fuji Testnet'
          };
          
          setStatus('completed');
          setTransaction(transactionData);
          
          if (onStatusChange) {
            onStatusChange(transactionData);
          }
          return;
        }
        
        // Not found in either collection
        console.log('ℹ️ Transaction not found in any network');
        setStatus('not-found');
        setTransaction(null);
        
      } catch (error) {
        console.error('❌ Error checking transaction status:', error);
        setError(error.message);
        setStatus('error');
      }
    };

    if (cid) {
      checkStatus();
    }
  }, [cid, onStatusChange]);

  // Handle store to vault action
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

  // Handle network selection popup
  const handleStoreToVault = () => {
    setShowNetworkSelector(true);
  };

  // Handle Avax network selection (existing logic)
  const handleAvaxNetwork = async () => {
    setShowNetworkSelector(false);
    await handleStoreToAvax();
  };

  // Handle Push Chain network selection
  const handlePushChainNetwork = async () => {
    setShowNetworkSelector(false);
    
    try {
      setIsProcessing(true);
      setError(null);
      setSuccessMessage(null);

      console.log('🚀 Starting Push Chain transaction...');
      console.log('📧 Email:', email);
      console.log('🆔 UUID:', uuid);
      console.log('📝 CID:', cid);

      // Initialize Push Chain service (will request MetaMask access)
      console.log('🔐 Connecting to MetaMask...');
      await pushChainTransactionService.initialize();
      console.log('✅ MetaMask connected successfully');

      // Store data on Push Chain blockchain
      const result = await pushChainTransactionService.storeDataOnBlockchain(email, uuid, cid);
      
      console.log('✅ Push Chain Result:', result);

      if (result.success) {
        if (result.existing) {
          // CID already exists on blockchain
          setStatus('completed');
          setTransaction({
            status: 'completed',
            transactionHash: result.transactionHash,
            explorerUrl: result.transactionHash !== 'imported-from-blockchain' 
              ? (result.explorerUrl || `${pushChainTransactionService.explorerUrl}/tx/${result.transactionHash}`)
              : null,
            blockNumber: result.blockNumber,
            contractAddress: result.contractAddress,
            imported: result.imported,
            network: 'Push Chain Testnet'
          });
          
          if (result.imported) {
            setSuccessMessage(`${result.message} - Record synced with local database`);
          } else {
            setSuccessMessage(result.message);
          }
          setError(null);
        } else {
          // New transaction confirmed
          setStatus('completed');
          setTransaction({
            status: 'completed',
            transactionHash: result.transactionHash,
            explorerUrl: result.explorerUrl,
            blockNumber: result.blockNumber,
            contractAddress: result.contractAddress,
            network: 'Push Chain Testnet'
          });
          setSuccessMessage('Data successfully stored on Push Chain Donut blockchain!');
          
          console.log('📍 Contract Address:', result.contractAddress);
          console.log('🔗 Transaction Hash:', result.transactionHash);
          console.log('📦 Block Number:', result.blockNumber);
          console.log('🌐 Explorer URL:', result.explorerUrl);
          
          if (onStatusChange) {
            onStatusChange({
              status: 'completed',
              transactionHash: result.transactionHash,
              explorerUrl: result.explorerUrl,
              blockNumber: result.blockNumber,
              contractAddress: result.contractAddress,
              network: 'Push Chain Testnet'
            });
          }
        }
      }
    } catch (error) {
      console.error('❌ Error storing to Push Chain Donut:', error);
      
      // Handle specific error types
      let errorMessage = 'Failed to store data on Push Chain';
      
      if (error.code === 4001) {
        errorMessage = 'Transaction rejected by user';
      } else if (error.code === 4100) {
        errorMessage = 'Please connect your MetaMask wallet';
      } else if (error.code === -32002) {
        errorMessage = 'Please check MetaMask - connection request pending';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setStatus('failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Don't render if no CID
  if (!cid) {
    return null;
  }

  return (
    <div className="avax-button-container">
      {/* Network Selection Popup - Portal to body to escape parent constraints */}
      {showNetworkSelector && (
        <>
          {/* Create portal to document.body to ensure true overlay */}
          {typeof document !== 'undefined' && 
            ReactDOM.createPortal(
              <div className="network-selector-overlay" onClick={() => setShowNetworkSelector(false)}>
                <div className="network-selector-popup" onClick={(e) => e.stopPropagation()}>
                  <div className="network-selector-header">
                    <h3>Choose Network</h3>
                    <button 
                      className="network-selector-close"
                      onClick={() => setShowNetworkSelector(false)}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="network-selector-options">
                    <button 
                      className="network-option avax-option"
                      onClick={handleAvaxNetwork}
                      disabled={isProcessing}
                    >
                      <div className="network-icon avax-icon">
                        <img src="/network/avax-logo.png" alt="Avalanche" className="network-logo" />
                      </div>
                    </button>
                    <button 
                      className="network-option push-option"
                      onClick={handlePushChainNetwork}
                      disabled={isProcessing}
                    >
                      <div className="network-icon push-icon">
                        <img src="/network/ChainLogo.svg" alt="Push Chain" className="network-logo" />
                      </div>
                    </button>
                  </div>
                </div>
              </div>,
              document.body
            )
          }
        </>
      )}

      {(status === 'not-found' || status === 'pending' || status === 'failed') && (
        <button
          onClick={handleStoreToVault}
          disabled={isProcessing}
          className={`avax-theme-button ${isProcessing ? 'processing' : ''}`}
        >
          <svg className="avax-button-icon" viewBox="0 0 24 24" fill="none">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="avax-button-text">
            {isProcessing ? 'Processing...' : 'Store to vault'}
          </span>
          {isProcessing && (
            <div className="avax-spinner">
              <div className="avax-spinner-dot"></div>
            </div>
          )}
        </button>
      )}

      {status === 'completed' && _transaction && (
        <div className="transaction-success-badge">
          <svg className="success-icon" viewBox="0 0 24 24" fill="none">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="success-text">
            Stored on {_transaction.network || 'blockchain'}
          </span>
          {_transaction.explorerUrl && (
            <a 
              href={_transaction.explorerUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="explorer-link"
              title="View on Explorer"
            >
              <svg viewBox="0 0 24 24" fill="none" className="external-icon">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6m4-3h6v6m-11 5L21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default TransactionStatusIndicator;