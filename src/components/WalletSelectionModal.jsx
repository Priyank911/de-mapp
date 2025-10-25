// src/components/WalletSelectionModal.jsx
import React, { useState, useEffect } from "react";
import walletService from '../services/walletService';

const WalletSelectionModal = ({ isOpen, onClose, onWalletSelect, isConnecting, user }) => {
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [error, setError] = useState("");
  const [connectionAttempts, setConnectionAttempts] = useState({});
  const [walletInstallStatus, setWalletInstallStatus] = useState({});
  const [pendingRequest, setPendingRequest] = useState(false);

  // Reset state when modal opens/closes and check wallet installation
  useEffect(() => {
    if (isOpen) {
      setSelectedWallet(null);
      setError("");
      setPendingRequest(false);
      checkWalletInstallation();
    } else {
      // Clean up any pending timeouts when modal closes
      if (window.metamaskTimeout) {
        clearTimeout(window.metamaskTimeout);
        delete window.metamaskTimeout;
      }
      if (window.coreTimeout) {
        clearTimeout(window.coreTimeout);
        delete window.coreTimeout;
      }
    }
  }, [isOpen]);

  // Check which wallets are installed
  const checkWalletInstallation = () => {
    const coreInstalled = walletService.isCoreWalletInstalled();
    const metamaskInstalled = walletService.isMetaMaskInstalled();
    
    setWalletInstallStatus({
      core: coreInstalled,
      metamask: metamaskInstalled
    });
    
    console.log("Wallet installation status:", {
      core: coreInstalled,
      metamask: metamaskInstalled
    });
  };

  // Handle wallet connection cancellation
  useEffect(() => {
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0 && selectedWallet) {
        // User disconnected or cancelled
        handleConnectionCancel();
      }
    };

    const handleChainChanged = () => {
      // Reset on chain change
      if (selectedWallet) {
        handleConnectionCancel();
      }
    };

    // Listen for wallet events
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [selectedWallet]);

  // Detect available wallets
  const detectWallets = () => {
    const availableWallets = [];
    
    // Check for Core Wallet
    if (window.avalanche) {
      availableWallets.push('core');
    }
    
    // Check for MetaMask specifically
    if (window.ethereum) {
      if (window.ethereum.isMetaMask) {
        availableWallets.push('metamask');
      } else if (window.ethereum.providers?.some(provider => provider.isMetaMask)) {
        availableWallets.push('metamask');
      }
    }
    
    return availableWallets;
  };

  const wallets = [
    {
      id: "core",
      name: "Core Wallet",
      icon: (
        <div className="core-logo-container">
          <span className="core-text">core</span>
        </div>
      ),
      description: "Official Avalanche wallet",
      downloadUrl: "https://core.app/",
      recommended: true,
      isAvailable: detectWallets().includes('core')
    },
    {
      id: "metamask", 
      name: "MetaMask",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
          <path fill="#FF5C16" d="m19.821 19.918-3.877-1.131-2.924 1.712h-2.04l-2.926-1.712-3.875 1.13L3 16.02l1.179-4.327L3 8.034 4.179 3.5l6.056 3.544h3.53L19.821 3.5 21 8.034l-1.179 3.658L21 16.02z"/>
          <path fill="#FF5C16" d="m4.18 3.5 6.055 3.547-.24 2.434zm3.875 12.52 2.665 1.99-2.665.777zm2.452-3.286-.512-3.251-3.278 2.21h-.002v.001l.01 2.275 1.33-1.235zM19.82 3.5l-6.056 3.547.24 2.434zm-3.875 12.52-2.665 1.99 2.665.777zm1.339-4.326v-.002zl-3.279-2.21-.512 3.25h2.451l1.33 1.236z"/>
          <path fill="#E34807" d="m8.054 18.787-3.875 1.13L3 16.022h5.054zm2.452-6.054.74 4.7-1.026-2.614-3.497-.85 1.33-1.236zm5.44 6.054 3.875 1.13L21 16.022h-5.055zm-2.452-6.054-.74 4.7 1.026-2.614 3.497-.85-1.331-1.236z"/>
          <path fill="#FF8D5D" d="m3 16.02 1.179-4.328h2.535l.01 2.276 3.496.85 1.026 2.613-.527.576-2.665-1.989H3zm18 0-1.179-4.328h-2.535l-.01 2.276-3.496.85-1.026 2.613.527.576 2.665-1.989H21zm-7.235-8.976h-3.53l-.24 2.435 1.251 7.95h1.508l1.252-7.95z"/>
          <path fill="#661800" d="M4.179 3.5 3 8.034l1.179 3.658h2.535l3.28-2.211zm5.594 10.177H8.625l-.626.6 2.222.54zM19.821 3.5 21 8.034l-1.179 3.658h-2.535l-3.28-2.211zm-5.593 10.177h1.15l.626.6-2.224.541zm-1.209 5.271.262-.94-.527-.575h-1.509l-.527.575.262.94"/>
          <path fill="#C0C4CD" d="M13.02 18.948V20.5h-2.04v-1.552z"/>
          <path fill="#E7EBF6" d="m8.055 18.785 2.927 1.714v-1.552l-.262-.94zm7.89 0L13.02 20.5v-1.552l.262-.94z"/>
        </svg>
      ),
      description: "Popular browser extension",
      downloadUrl: "https://metamask.io/",
      recommended: false,
      isAvailable: detectWallets().includes('metamask')
    }
  ];

  // Force wallet-specific connections
  const forceWalletConnection = async (walletType) => {
    if (walletType === 'core') {
      // Always use avalanche provider for Core Wallet
      if (!window.avalanche) {
        throw new Error("Core Wallet not installed");
      }
      
      return await window.avalanche.request({
        method: "eth_requestAccounts",
      });
    } 
    
    if (walletType === 'metamask') {
      // Force MetaMask connection by bypassing Core Wallet interference
      let metamaskProvider = null;
      
      console.log("Searching for MetaMask provider...");
      console.log("window.ethereum:", window.ethereum);
      console.log("window.ethereum.providers:", window.ethereum?.providers);
      
      // Method 1: Check providers array first (most reliable when multiple wallets installed)
      if (window.ethereum?.providers && Array.isArray(window.ethereum.providers)) {
        console.log("Checking providers array...");
        
        // Look for MetaMask provider specifically
        metamaskProvider = window.ethereum.providers.find(provider => {
          // Safety check to ensure provider exists and has properties
          if (!provider) return false;
          
          console.log("Provider check:", {
            isMetaMask: provider.isMetaMask || false,
            isAvalanche: provider.isAvalanche || false,
            isCoreWallet: provider.isCoreWallet || false,
            constructor: provider.constructor?.name || 'unknown'
          });
          
          return provider.isMetaMask && 
                 !provider.isAvalanche && 
                 !provider.isCoreWallet;
        });
        
        // If not found, try broader search
        if (!metamaskProvider) {
          metamaskProvider = window.ethereum.providers.find(provider => 
            provider && provider.isMetaMask
          );
        }
      }
      
      // Method 2: Check if main ethereum object is MetaMask (when only MetaMask installed)
      if (!metamaskProvider && window.ethereum) {
        console.log("Checking main ethereum object...");
        
        if (window.ethereum.isMetaMask && !window.ethereum.isAvalanche) {
          metamaskProvider = window.ethereum;
        }
      }
      
      // Method 3: Try to access MetaMask through extension ID (Chrome specific)
      if (!metamaskProvider && typeof chrome !== 'undefined' && chrome.runtime) {
        try {
          console.log("Trying Chrome extension access...");
          // This is a more advanced method but might work
          const metamaskExtension = window.ethereum?.providers?.find(p => 
            p._metamask || (p.constructor && p.constructor.name === 'MetamaskInpageProvider')
          );
          if (metamaskExtension) {
            metamaskProvider = metamaskExtension;
          }
        } catch (e) {
          console.log("Chrome extension access failed:", e);
        }
      }
      
      // Method 4: Force MetaMask by temporarily disabling Core Wallet
      if (!metamaskProvider && window.ethereum && window.avalanche) {
        console.log("Trying to isolate MetaMask from Core Wallet...");
        
        // Temporarily backup and remove avalanche
        const tempAvalanche = window.avalanche;
        try {
          // Temporarily hide Core Wallet
          delete window.avalanche;
          
          // Check if MetaMask becomes accessible
          if (window.ethereum && window.ethereum.isMetaMask) {
            metamaskProvider = window.ethereum;
          }
        } finally {
          // Restore avalanche
          window.avalanche = tempAvalanche;
        }
      }
      
      if (!metamaskProvider) {
        console.error("MetaMask provider not found. Available providers:", window.ethereum?.providers);
        throw new Error("MetaMask not found. Please ensure MetaMask is installed and enabled, and try disabling other wallets temporarily.");
      }
      
      console.log("Using MetaMask provider:", metamaskProvider);
      
      // Force MetaMask popup by using its specific provider
      const accounts = await metamaskProvider.request({
        method: "eth_requestAccounts",
      });
      
      if (!accounts || accounts.length === 0) {
        throw new Error("MetaMask connection failed - no accounts returned");
      }
      
      return { accounts, provider: metamaskProvider };
    }
  };

  const handleConnectionCancel = () => {
    setSelectedWallet(null);
    setError("");
    setPendingRequest(false);
    // Stop any loading animations immediately
    const loadingElements = document.querySelectorAll('.wallet-spinner-compact');
    loadingElements.forEach(element => {
      element.style.animation = 'none';
    });
  };

  const handleWalletClick = async (wallet) => {
    // Prevent multiple simultaneous requests
    if (selectedWallet || connectionAttempts[wallet.id] || pendingRequest) {
      console.log("Request blocked - already processing:", {
        selectedWallet,
        attemptInProgress: connectionAttempts[wallet.id],
        pendingRequest
      });
      return;
    }
    
    // Clear any existing timeouts before starting new connection
    if (window.metamaskTimeout) {
      clearTimeout(window.metamaskTimeout);
      delete window.metamaskTimeout;
    }
    if (window.coreTimeout) {
      clearTimeout(window.coreTimeout);
      delete window.coreTimeout;
    }
    
    setSelectedWallet(wallet.id);
    setError("");
    setPendingRequest(true);
    setConnectionAttempts(prev => ({ ...prev, [wallet.id]: true }));
    
    try {
      // Add a delay to prevent rapid requests and ensure cleanup
      await new Promise(resolve => setTimeout(resolve, 200));
      
      if (wallet.id === "core") {
        await connectCoreWallet();
      } else if (wallet.id === "metamask") {
        await connectMetaMask();
      }
      
      // Success - notify parent and close modal
      onWalletSelect && onWalletSelect(wallet);
      handleClose();
    } catch (error) {
      console.error(`Failed to connect ${wallet.name}:`, error);
      
      // Handle specific error types
      if (error.code === 4001 || error.message.includes('User rejected')) {
        setError(`Connection cancelled by user`);
      } else if (error.message.includes('not installed')) {
        setError(`${wallet.name} is not installed. Please install it first.`);
      } else if (error.message.includes('Extension context invalidated')) {
        setError(`${wallet.name} extension error. Please refresh the page and try again.`);
      } else if (error.message.includes('not detected')) {
        setError(`${wallet.name} not detected. Please make sure it's enabled.`);
      } else if (error.message.includes('timeout')) {
        setError(`Connection timeout. Please try again.`);
      } else if (error.message.includes('blocked by another wallet')) {
        setError(`${wallet.name} is blocked by another wallet. Please disable other wallets first.`);
      } else if (error.message.includes('Request of type eth_requestAccounts already pending')) {
        setError(`A wallet connection is already in progress. Please wait and try again.`);
      } else {
        setError(`Failed to connect ${wallet.name}. ${error.message || 'Please try again.'}`);
      }
      
      handleConnectionCancel();
    } finally {
      setConnectionAttempts(prev => ({ ...prev, [wallet.id]: false }));
      setPendingRequest(false);
    }
  };

  const connectCoreWallet = async () => {
    try {
      console.log("🔶 Connecting to Core Wallet via walletService...");
      
      // Get user information
      const userId = user?.id || 'anonymous-user';
      const userEmail = user?.primaryEmailAddress?.emailAddress || 'anonymous@example.com';
      
      console.log("Using user data:", { userId, userEmail });
      
      // Use walletService for proper Core Wallet connection
      const result = await walletService.connectCoreWalletSpecific(userId, userEmail);
      
      if (result && result.success) {
        console.log("✅ Core Wallet connected successfully:", result.walletAddress);
        return result.walletAddress;
      } else {
        throw new Error("Core Wallet connection failed");
      }
    } catch (error) {
      console.error("❌ Core Wallet connection error:", error);
      throw error;
    }
  };

  const connectMetaMask = async () => {
    try {
      console.log("🦊 Connecting to MetaMask via walletService...");
      
      // Get user information
      const userId = user?.id || 'anonymous-user';
      const userEmail = user?.primaryEmailAddress?.emailAddress || 'anonymous@example.com';
      
      console.log("Using user data:", { userId, userEmail });
      
      // Use walletService for proper MetaMask connection
      const result = await walletService.connectMetaMaskWallet(userId, userEmail);
      
      if (result && result.success) {
        console.log("✅ MetaMask connected successfully:", result.walletAddress);
        return result.walletAddress;
      } else {
        throw new Error("MetaMask connection failed");
      }
    } catch (error) {
      console.error("❌ MetaMask connection error:", error);
      throw error;
    }
  };

  const handleClose = () => {
    if (!selectedWallet) {
      setError("");
      onClose();
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !selectedWallet) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="wallet-modal-overlay" onClick={handleOverlayClick}>
      <div className="wallet-modal-compact" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="wallet-modal-header-compact">
          <div className="wallet-modal-title-compact">
            <span style={{fontSize: '18px'}}>💼</span>
            <span>Connect Wallet</span>
          </div>
          <button 
            className="wallet-modal-close-compact"
            onClick={handleClose}
            disabled={selectedWallet}
          >
            <span style={{fontSize: '14px'}}>✕</span>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="wallet-error-message">
            <span style={{fontSize: '14px', color: '#ef4444'}}>⚠️</span>
            <span>{error}</span>
            {error.includes('refresh') && (
              <button 
                className="refresh-page-btn"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </button>
            )}
            <button 
              className="error-dismiss-btn"
              onClick={() => setError("")}
            >
              ×
            </button>
          </div>
        )}

        {/* Wallet Options */}
        <div className="wallet-options-compact">
          {wallets.map((wallet) => (
            <div
              key={wallet.id}
              className={`wallet-option-compact ${
                selectedWallet === wallet.id ? 'connecting' : ''
              } ${error && selectedWallet === wallet.id ? 'error' : ''} ${
                !wallet.isAvailable ? 'unavailable' : ''
              }`}
              onClick={() => wallet.isAvailable && !pendingRequest && !selectedWallet && handleWalletClick(wallet)}
            >
              <div className="wallet-info-compact">
                <div className="wallet-icon-compact">{wallet.icon}</div>
                <div className="wallet-details-compact">
                  <div className="wallet-name-compact">
                    {wallet.name}
                    {!wallet.isAvailable && (
                      <span className="wallet-not-installed"> (Not Installed)</span>
                    )}
                  </div>
                  <div className="wallet-description-compact">{wallet.description}</div>
                </div>
              </div>
              
              <div className="wallet-status-compact">
                {!wallet.isAvailable ? (
                  <a 
                    href={wallet.downloadUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="wallet-install-link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Install
                  </a>
                ) : selectedWallet === wallet.id ? (
                  <div className="wallet-connecting-compact">
                    <div className="wallet-spinner-compact"></div>
                  </div>
                ) : (
                  <div className="wallet-connect-arrow">→</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="wallet-modal-footer-compact">
          <span>Choose your preferred wallet to continue</span>
          {selectedWallet && (
            <div className="connection-status">
              <span>Connecting... You can cancel in your wallet</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletSelectionModal;