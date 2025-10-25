// Enhanced Wallet Integration Service with proper SDKs
import { MetaMaskSDK } from '@metamask/sdk';
import { ethers } from 'ethers';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import userProfileService from './userProfileService';
import userSecurityService from './userSecurityService';
import userMetadataService from './userMetadataService';


class WalletService {
  constructor() {
    this.isConnecting = false;
    this.connectedWallet = null;
    this.provider = null;
    this.metamaskSDK = null;
    this.activeWalletType = null; // Track which wallet is currently active
    this.lockedProvider = null; // Lock to specific provider during operations
    this.initializeWallets();
  }

  // Initialize wallet SDKs
  initializeWallets() {
    try {
      // Initialize MetaMask SDK with proper configuration
      this.metamaskSDK = new MetaMaskSDK({
        dappMetadata: {
          name: "De-MAPP Protocol",
          description: "Decentralized Multi-Agent Persistent Protocol",
          url: typeof window !== 'undefined' ? window.location.href : '',
          iconUrl: typeof window !== 'undefined' ? window.location.origin + "/logo.png" : '',
        },
        // Enhanced options for better UX
        useDeeplink: false,
        preferDesktop: true,
        openDeeplink: (link) => {
          console.log("MetaMask deeplink:", link);
          window.open(link, '_blank');
        },
        wakeLockType: 'screen',
        checkInstallationImmediately: false,
      });
      
      console.log("✅ MetaMask SDK initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize MetaMask SDK:", error);
    }
  }

  // Check if Core Wallet is installed
  isCoreWalletInstalled() {
    return typeof window !== 'undefined' && 
           (window.avalanche || (window.ethereum && window.ethereum.isAvalanche));
  }

  // Check if MetaMask is installed
  isMetaMaskInstalled() {
    return typeof window !== 'undefined' && 
           (window.ethereum || this.metamaskSDK?.getProvider());
  }

  // Lock wallet provider to prevent interference
  lockWalletProvider(provider, walletType) {
    this.lockedProvider = provider;
    this.activeWalletType = walletType;
    console.log(`🔒 Locked to ${walletType} provider:`, provider);
  }

  // Unlock wallet provider
  unlockWalletProvider() {
    this.lockedProvider = null;
    this.activeWalletType = null;
    console.log('🔓 Unlocked wallet provider');
  }

  // Get the correct provider (locked provider takes precedence)
  getActiveProvider() {
    if (this.lockedProvider) {
      console.log(`🔒 Using locked ${this.activeWalletType} provider`);
      return this.lockedProvider;
    }
    return window.ethereum;
  }

  // Enhanced Core Wallet connection with proper detection
  async connectCoreWalletEnhanced() {
    return new Promise(async (resolve, reject) => {
      try {
        console.log("🔶 Attempting to connect Core Wallet with enhanced detection...");
        
        let provider = null;
        
        // Try multiple detection methods for Core Wallet
        if (window.avalanche) {
          provider = window.avalanche;
          console.log("✅ Core Wallet detected via window.avalanche");
        } else if (window.ethereum && window.ethereum.isAvalanche) {
          provider = window.ethereum;
          console.log("✅ Core Wallet detected via window.ethereum.isAvalanche");
        } else if (window.ethereum && window.ethereum.isCore) {
          provider = window.ethereum;
          console.log("✅ Core Wallet detected via window.ethereum.isCore");
        } else {
          reject(new Error('Core Wallet not installed. Please install Core Wallet from https://core.app/'));
          return;
        }

        // Request account access
        const accounts = await provider.request({
          method: 'eth_requestAccounts'
        });

        if (!accounts || accounts.length === 0) {
          reject(new Error('No accounts found in Core Wallet'));
          return;
        }

        // Get network info
        const chainId = await provider.request({
          method: 'eth_chainId'
        });

        // Try to switch to Push Network
        try {
          await this.switchToPushNetwork(provider);
        } catch (switchError) {
          console.log("Network switch optional:", switchError.message);
        }

        console.log("✅ Core Wallet connected successfully!");
        console.log("Account:", accounts[0]);
        console.log("Chain ID:", chainId);

        resolve({
          address: accounts[0],
          chainId: chainId,
          wallet: 'core',
          provider: provider
        });

      } catch (error) {
        console.error("❌ Core Wallet connection failed:", error);
        reject(error);
      }
    });
  }

  // Enhanced MetaMask connection using SDK
  async connectMetaMaskEnhanced() {
    return new Promise(async (resolve, reject) => {
      try {
        console.log("🦊 Attempting to connect MetaMask using SDK...");
        
        if (!this.metamaskSDK) {
          reject(new Error('MetaMask SDK not initialized'));
          return;
        }

        // Get provider from SDK
        const provider = this.metamaskSDK.getProvider();
        
        if (!provider) {
          // Try to connect and get provider
          await this.metamaskSDK.connect();
          const newProvider = this.metamaskSDK.getProvider();
          
          if (!newProvider) {
            reject(new Error('MetaMask not available. Please install MetaMask from https://metamask.io/'));
            return;
          }
        }

        // Request account access
        const accounts = await provider.request({
          method: 'eth_requestAccounts'
        });

        if (!accounts || accounts.length === 0) {
          reject(new Error('No accounts found in MetaMask'));
          return;
        }

        // Switch or add Push Network
        await this.addPushNetworkToMetaMask(provider);

        console.log("✅ MetaMask connected successfully!");
        console.log("Account:", accounts[0]);

        resolve({
          address: accounts[0],
          chainId: '0x6A85F38', // Push Network
          wallet: 'metamask',
          provider: provider
        });

      } catch (error) {
        console.error("❌ MetaMask connection failed:", error);
        reject(error);
      }
    });
  }

  // Switch to Push Network for Core Wallet
  async switchToPushNetwork(provider) {
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x6A85F38' }], // Push Network Chain ID
      });
      console.log("✅ Switched to Push Network");
    } catch (switchError) {
      if (switchError.code === 4902) {
        // Add Push Network if it doesn't exist
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x6A85F38',
            chainName: 'Push Protocol Testnet',
            nativeCurrency: {
              name: 'PUSH',
              symbol: 'PUSH',
              decimals: 18,
            },
            rpcUrls: ['https://rpc.push.org/'],
            blockExplorerUrls: ['https://scan.push.org/'],
            iconUrls: ['https://push.org/favicon.ico']
          }]
        });
        console.log("✅ Push Network added and switched");
      } else {
        throw switchError;
      }
    }
  }

  // Add Push Network to MetaMask with enhanced error handling
  async addPushNetworkToMetaMask(provider) {
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x6A85F38' }],
      });
      console.log("✅ Already on Push Network");
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x6A85F38',
              chainName: 'Push Protocol Testnet',
              nativeCurrency: {
                name: 'PUSH',
                symbol: 'PUSH',
                decimals: 18,
              },
              rpcUrls: ['https://rpc.push.org/'],
              blockExplorerUrls: ['https://scan.push.org/'],
              iconUrls: ['https://push.org/favicon.ico']
            }]
          });
          console.log("✅ Push Network added to MetaMask successfully");
        } catch (addError) {
          console.error("❌ Failed to add Push Network:", addError);
          throw addError;
        }
      } else {
        console.log("Network switch error:", switchError.message);
        throw switchError;
      }
    }
  }

  // Generate a simple, compatible welcome message
  generateWelcomeMessage(userEmail) {
    const timestamp = Date.now();
    const nonce = Math.floor(Math.random() * 1000000);
    
    // Very simple message format that wallets handle well
    const message = `Welcome to De-MAPP Memory Hub!\n\nSign this message to verify your identity.\n\nUser: ${userEmail}\nNonce: ${nonce}\nTimestamp: ${timestamp}`;

    return {
      message,
      nonce: nonce.toString(),
      timestamp: timestamp.toString()
    };
  }

  // Convert string to hex (browser-compatible)
  stringToHex(str) {
    let hex = '';
    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i);
      hex += charCode.toString(16).padStart(2, '0');
    }
    return '0x' + hex;
  }

  // Simplified signing method with multiple fallback approaches
  // Wallet-specific signing method with provider separation
  async signMessage(message, walletAddress, provider = null, walletType = 'core') {
    // Use the specific provider if provided, otherwise fallback to window.ethereum
    const signingProvider = provider || window.ethereum;
    
    if (!signingProvider) {
      throw new Error(`${walletType} provider not available for signing`);
    }
    
    console.log(`🔐 Signing with ${walletType} provider:`, signingProvider);
    
    if (walletType === 'metamask') {
      // MetaMask signing - use plain text (MetaMask handles encoding automatically)
      try {
        console.log('🦊 MetaMask signing with plain text...');
        console.log('📝 Message:', message);
        
        const signature = await signingProvider.request({
          method: 'personal_sign',
          params: [message, walletAddress]
        });
        console.log('✅ MetaMask signing successful!');
        return signature;
      } catch (error) {
        console.error('❌ MetaMask signing failed:', error);
        throw new Error(`MetaMask signing failed: ${error.message}`);
      }
    } else {
      // Core Wallet signing - try multiple encoding methods
      // Method 1: Try with hex encoding (Core Wallet preferred)
      try {
        console.log('� Method 1: Core Wallet with hex encoding...');
        const messageHex = this.stringToHex(message);
        console.log('📝 Original message:', message);
        console.log('📝 Message in hex:', messageHex);
      
        const signature = await signingProvider.request({
          method: 'personal_sign',
          params: [messageHex, walletAddress]
        });
        console.log('✅ Core Wallet hex encoding successful!');
        return signature;
    } catch (error1) {
      console.log('❌ Hex encoding failed:', error1.message);
      
        // Method 2: Try with plain text (fallback)
        try {
          console.log('� Method 2: Core Wallet with plain text...');
          const signature = await signingProvider.request({
            method: 'personal_sign',
            params: [message, walletAddress]
          });
          console.log('✅ Core Wallet plain text successful!');
          return signature;
      } catch (error2) {
        console.log('❌ Plain text failed:', error2.message);
        
          // Method 3: Try with UTF-8 bytes as hex
          try {
            console.log('🔶 Method 3: Core Wallet with UTF-8 bytes as hex...');
            const encoder = new TextEncoder();
            const messageBytes = encoder.encode(message);
            const messageHex = '0x' + Array.from(messageBytes)
              .map(b => b.toString(16).padStart(2, '0'))
              .join('');
            
            const signature = await signingProvider.request({
              method: 'personal_sign',
              params: [messageHex, walletAddress]
            });
            console.log('✅ Core Wallet UTF-8 bytes successful!');
            return signature;
          } catch (error3) {
            console.error('❌ All Core Wallet signing methods failed');
            throw new Error('Unable to sign message with Core Wallet. Please check your Core Wallet version and try again.');
          }
        }
      }
    }
  }

  // Specific MetaMask connection with proper provider isolation
  async connectMetaMaskWallet(userId, userEmail) {
    if (this.isConnecting) {
      throw new Error('Wallet connection already in progress');
    }

    try {
      this.isConnecting = true;
      console.log('🦊 Starting MetaMask wallet connection process...');
      console.log('👤 User ID:', userId);
      console.log('📧 User Email:', userEmail);

      // Get MetaMask provider specifically
      let metamaskProvider = null;

      // Try multiple methods to find MetaMask provider
      if (window.ethereum?.providers && Array.isArray(window.ethereum.providers)) {
        metamaskProvider = window.ethereum.providers.find(provider => 
          provider && provider.isMetaMask && !provider.isAvalanche && !provider.isCoreWallet
        );
      }

      if (!metamaskProvider && window.ethereum && window.ethereum.isMetaMask && !window.ethereum.isAvalanche) {
        metamaskProvider = window.ethereum;
      }

      if (!metamaskProvider) {
        throw new Error('MetaMask not found. Please ensure MetaMask is installed and enabled.');
      }

      console.log('✅ MetaMask provider found:', metamaskProvider);

      // LOCK the MetaMask provider to prevent Core Wallet interference
      this.lockWalletProvider(metamaskProvider, 'MetaMask');

      // Request account access using MetaMask provider
      const accounts = await metamaskProvider.request({
        method: 'eth_requestAccounts'
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock your MetaMask wallet.');
      }

      const walletAddress = accounts[0];
      console.log('💼 MetaMask Wallet Address:', walletAddress);

      // Generate welcome message for signing
      const { message, nonce, timestamp } = this.generateWelcomeMessage(userEmail);

      console.log('🎯 Requesting MetaMask signature for welcome message...');

      // IMPORTANT: Store the provider BEFORE signing to prevent Core Wallet interference
      this.connectedWallet = {
        address: walletAddress,
        provider: metamaskProvider,
        type: 'MetaMask',
        connectedAt: new Date().toISOString()
      };

      // Use MetaMask-specific signing with the isolated provider
      const signature = await this.signMessage(message, walletAddress, metamaskProvider, 'metamask');

      console.log('✅ MetaMask message signed successfully!');

      // Store wallet info in Firebase with MetaMask type
      await this.storeWalletInfo(userId, {
        walletAddress,
        signature,
        message,
        nonce,
        timestamp,
        userEmail,
        connectedAt: new Date().toISOString(),
        chainId: await metamaskProvider.request({ method: 'eth_chainId' }),
        walletType: 'MetaMask'
      });

      // Update stored wallet info with signature
      this.connectedWallet.signature = signature;
      this.connectedWallet.timestamp = timestamp;

      console.log('🎉 MetaMask wallet connected and stored successfully!');

      return {
        success: true,
        walletAddress,
        signature,
        walletType: 'MetaMask',
        message: 'MetaMask wallet connected successfully!'
      };

    } catch (error) {
      console.error('❌ MetaMask wallet connection failed:', error);
      throw error;
    } finally {
      this.isConnecting = false;
      // ALWAYS unlock provider when done
      this.unlockWalletProvider();
    }
  }

  // Specific Core Wallet connection with proper provider isolation
  async connectCoreWalletSpecific(userId, userEmail) {
    if (this.isConnecting) {
      throw new Error('Wallet connection already in progress');
    }

    try {
      this.isConnecting = true;
      console.log('🔶 Starting Core Wallet connection process...');
      console.log('👤 User ID:', userId);
      console.log('📧 User Email:', userEmail);

      // Get Core Wallet provider specifically
      let coreProvider = null;

      // Try multiple detection methods for Core Wallet
      if (window.avalanche) {
        coreProvider = window.avalanche;
        console.log('✅ Core Wallet detected via window.avalanche');
      } else if (window.ethereum && window.ethereum.isAvalanche) {
        coreProvider = window.ethereum;
        console.log('✅ Core Wallet detected via window.ethereum.isAvalanche');
      } else if (window.ethereum && window.ethereum.isCore) {
        coreProvider = window.ethereum;
        console.log('✅ Core Wallet detected via window.ethereum.isCore');
      }

      if (!coreProvider) {
        throw new Error('Core Wallet not found. Please install Core Wallet from https://core.app/');
      }

      console.log('✅ Core Wallet provider found:', coreProvider);

      // LOCK the Core Wallet provider to prevent MetaMask interference
      this.lockWalletProvider(coreProvider, 'Core Wallet');

      // Request account access using Core Wallet provider
      const accounts = await coreProvider.request({
        method: 'eth_requestAccounts'
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock your Core Wallet.');
      }

      const walletAddress = accounts[0];
      console.log('💼 Core Wallet Address:', walletAddress);

      // Generate welcome message for signing
      const { message, nonce, timestamp } = this.generateWelcomeMessage(userEmail);

      console.log('🎯 Requesting Core Wallet signature for welcome message...');

      // IMPORTANT: Store the provider BEFORE signing to prevent interference
      this.connectedWallet = {
        address: walletAddress,
        provider: coreProvider,
        type: 'Core Wallet',
        connectedAt: new Date().toISOString()
      };

      // Use Core Wallet-specific signing with the isolated provider
      const signature = await this.signMessage(message, walletAddress, coreProvider, 'core');

      console.log('✅ Core Wallet message signed successfully!');

      // Store wallet info in Firebase with Core Wallet type
      await this.storeWalletInfo(userId, {
        walletAddress,
        signature,
        message,
        nonce,
        timestamp,
        userEmail,
        connectedAt: new Date().toISOString(),
        chainId: await coreProvider.request({ method: 'eth_chainId' }),
        walletType: 'Core Wallet'
      });

      // Update stored wallet info with signature
      this.connectedWallet.signature = signature;
      this.connectedWallet.timestamp = timestamp;

      console.log('🎉 Core Wallet connected and stored successfully!');

      return {
        success: true,
        walletAddress,
        signature,
        walletType: 'Core Wallet',
        message: 'Core Wallet connected successfully!'
      };

    } catch (error) {
      console.error('❌ Core Wallet connection failed:', error);
      throw error;
    } finally {
      this.isConnecting = false;
      // ALWAYS unlock provider when done
      this.unlockWalletProvider();
    }
  }

  async connectWallet(userId, userEmail) {
    if (this.isConnecting) {
      throw new Error('Wallet connection already in progress');
    }

    if (!this.isCoreWalletInstalled()) {
      throw new Error('Core Wallet not detected. Please install Core Wallet extension.');
    }

    try {
      this.isConnecting = true;
      console.log('🔗 Starting wallet connection process...');
      console.log('👤 User ID:', userId);
      console.log('📧 User Email:', userEmail);

      // Add a small delay to prevent session conflicts
      await new Promise(resolve => setTimeout(resolve, 500));

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock your Core Wallet.');
      }

      const walletAddress = accounts[0];
      console.log('💼 Wallet Address:', walletAddress);
      
      // Generate welcome message for signing
      const { message, nonce, timestamp } = this.generateWelcomeMessage(userEmail);
      
      console.log('🎯 Requesting signature for welcome message...');
      console.log('📝 Message:', message);
      
      // Use the improved signing method with fallbacks
      const signature = await this.signMessage(message, walletAddress);

      console.log('✅ Message signed successfully!');

      // Store wallet info in Firebase
      await this.storeWalletInfo(userId, {
        walletAddress,
        signature,
        message,
        nonce,
        timestamp,
        userEmail,
        connectedAt: new Date().toISOString(),
        chainId: await this.getChainId(),
        walletType: 'Core Wallet'
      });

      this.connectedWallet = {
        address: walletAddress,
        signature,
        connectedAt: timestamp
      };

      console.log('🎉 Wallet connected and stored successfully!');
      
      return {
        success: true,
        walletAddress,
        signature,
        message: 'Wallet connected successfully!'
      };

    } catch (error) {
      console.error('❌ Wallet connection failed:', error);
      
      if (error.code === 4001) {
        throw new Error('User rejected the wallet connection request.');
      }
      
      if (error.code === -32002) {
        throw new Error('Wallet connection request is pending. Please check your Core Wallet.');
      }
      
      if (error.code === -32602) {
        throw new Error('Invalid request format. Please try refreshing the page.');
      }
      
      if (error.code === -32603) {
        throw new Error('Internal wallet error. Please restart Core Wallet and try again.');
      }
      
      if (error.message && error.message.includes('hex')) {
        throw new Error('Message format error. Please ensure Core Wallet is updated to the latest version.');
      }
      
      if (error.message && error.message.includes('parse')) {
        throw new Error('Communication error with wallet. Please refresh the page and try again.');
      }
      
      // Generic error with helpful message
      throw new Error(`Wallet connection failed: ${error.message}. Please try refreshing the page or restarting Core Wallet.`);
    } finally {
      this.isConnecting = false;
    }
  }

  // Get current chain ID
  async getChainId() {
    try {
      return await window.ethereum.request({ method: 'eth_chainId' });
    } catch (error) {
      console.error('Failed to get chain ID:', error);
      return null;
    }
  }

  // Switch to Avalanche network if needed
  async switchToAvalanche() {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xa86a' }], // Avalanche C-Chain
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to Core
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0xa86a',
                chainName: 'Avalanche Network',
                nativeCurrency: {
                  name: 'AVAX',
                  symbol: 'AVAX',
                  decimals: 18,
                },
                rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
                blockExplorerUrls: ['https://snowtrace.io/'],
              },
            ],
          });
        } catch (addError) {
          throw new Error('Failed to add Avalanche network to wallet');
        }
      } else {
        throw new Error('Failed to switch to Avalanche network');
      }
    }
  }

  // Store wallet information using new separated structure
  async storeWalletInfo(userId, walletData) {
    try {
      console.log('💾 Storing wallet info in new separated structure...');
      
      const userEmail = walletData.userEmail;
      
      // 1. Create/Update Profile in userProfiles collection
      const profileData = {
        email: userEmail,
        uuid: userId,
        userId: userId,
        displayName: walletData.displayName || null,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        status: 'active',
        profileVersion: '2.0'
      };
      
      await userProfileService.createUserProfile(profileData);
      console.log('✅ Profile stored in userProfiles collection');
      
      // 2. Create/Update Security in userSecurity collection
      const securityData = {
        email: userEmail,
        userId: userId,
        wallet: {
          address: walletData.walletAddress,
          type: walletData.walletType || 'Core Wallet',
          chainId: walletData.chainId,
          connectedAt: walletData.connectedAt,
          lastConnected: new Date().toISOString(),
          status: 'connected'
        },
        authentication: {
          signature: walletData.signature,
          message: walletData.message,
          nonce: walletData.nonce,
          timestamp: walletData.timestamp,
          verified: true
        },
        security: {
          encryptionLevel: 'standard',
          lastSecurityUpdate: new Date().toISOString(),
          securityVersion: '2.0'
        },
        createdAt: new Date().toISOString()
      };
      
      await userSecurityService.createUserSecurity(securityData);
      console.log('✅ Security data stored in userSecurity collection');
      
      // 3. Create/Update Metadata in userMetadata collection
      const metadataData = {
        uuid: userId,
        email: userEmail,
        userId: userId,
        walletActivity: {
          connectedAt: walletData.connectedAt,
          walletType: walletData.walletType || 'Core Wallet',
          chainId: walletData.chainId
        },
        createdAt: new Date().toISOString()
      };
      
      await userMetadataService.createUserMetadata(metadataData);
      console.log('✅ Metadata stored in userMetadata collection');
      
      console.log(`🎉 Complete wallet structure created for ${userEmail} across all collections!`);
      
    } catch (error) {
      console.error('❌ Failed to store wallet info in new structure:', error);
      throw new Error('Failed to save wallet information. Please try again.');
    }
  }

  // Get stored wallet info using new separated structure
  async getStoredWalletInfo(userId, userEmail) {
    try {
      // Get security data from userSecurity collection
      const securityData = await userSecurityService.getUserSecurity(userEmail);
      
      if (securityData && securityData.wallet) {
        const walletData = securityData.wallet;
        const authData = securityData.authentication;
        
        // Return in the expected format for backwards compatibility
        return {
          walletAddress: walletData.address,
          walletType: walletData.type,
          chainId: walletData.chainId,
          signature: authData?.signature,
          message: authData?.message,
          nonce: authData?.nonce,
          timestamp: authData?.timestamp,
          connectedAt: walletData.connectedAt,
          lastConnected: walletData.lastConnected,
          status: walletData.status
        };
      }
      
      // Fallback: Check old structure for backwards compatibility
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Access wallet data from the old structure if it exists
        if (userData[userEmail] && userData[userEmail].wallet) {
          const walletData = userData[userEmail].wallet;
          
          return {
            walletAddress: walletData.address,
            walletType: walletData.type,
            chainId: walletData.chainId,
            signature: walletData.authentication?.signature,
            message: walletData.authentication?.message,
            nonce: walletData.authentication?.nonce,
            timestamp: walletData.authentication?.timestamp,
            connectedAt: walletData.connection?.connectedAt,
            lastConnected: walletData.connection?.lastConnected,
            status: walletData.connection?.status
          };
        }
        
        // Fallback to very old structure
        if (userData.wallet) {
          return userData.wallet;
        }
      }
      
      return null;
    } catch (error) {
      console.error('❌ Failed to get wallet info from new structure:', error);
      return null;
    }
  }

  // Check if user's wallet is already connected
  async isWalletConnected(userId, userEmail) {
    try {
      if (!this.isCoreWalletInstalled()) {
        return false;
      }

      // Check if wallet is connected in browser
      const accounts = await window.ethereum.request({
        method: 'eth_accounts'
      });

      if (!accounts || accounts.length === 0) {
        return false;
      }

      // Check if we have stored wallet info in Firebase
      const storedWallet = await this.getStoredWalletInfo(userId, userEmail);
      
      if (storedWallet && storedWallet.walletAddress === accounts[0]) {
        this.connectedWallet = {
          address: accounts[0],
          connectedAt: storedWallet.connectedAt
        };
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Error checking wallet connection:', error);
      return false;
    }
  }

  // Disconnect wallet
  async disconnectWallet() {
    this.connectedWallet = null;
    this.provider = null;
    console.log('🔌 Wallet disconnected');
  }

  // Get connected wallet address
  getConnectedWallet() {
    return this.connectedWallet;
  }

  // Listen for account changes
  setupWalletListeners(onAccountChange, onChainChange) {
    if (!this.isCoreWalletInstalled()) return;

    window.ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length === 0) {
        this.disconnectWallet();
      } else if (this.connectedWallet && accounts[0] !== this.connectedWallet.address) {
        this.connectedWallet.address = accounts[0];
      }
      if (onAccountChange) onAccountChange(accounts);
    });

    window.ethereum.on('chainChanged', (chainId) => {
      console.log('Chain changed to:', chainId);
      if (onChainChange) onChainChange(chainId);
    });
  }

  // Clean up and migrate old Firebase structure to new format
  async cleanupAndMigrateUserData(userId, userEmail) {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        console.log('No existing data to migrate');
        return;
      }
      
      const userData = userDoc.data();
      
      // Check if we have old scattered data that needs migration
      if (userData.wallet && !userData[userEmail]) {
        console.log('🔄 Migrating old wallet data to comprehensive structure...');
        
        const oldWallet = userData.wallet;
        
        // Create comprehensive structured format with migration info
        const cleanData = {
          [userEmail]: {
            profile: {
              email: userEmail,
              userId: userId,
              lastActive: new Date().toISOString()
            },
            wallet: {
              address: oldWallet.walletAddress,
              type: oldWallet.walletType || 'Core Wallet',
              chainId: oldWallet.chainId,
              authentication: {
                signature: oldWallet.signature,
                message: oldWallet.message,
                nonce: oldWallet.nonce,
                timestamp: oldWallet.timestamp
              },
              connection: {
                connectedAt: oldWallet.connectedAt,
                lastConnected: oldWallet.lastConnected || new Date().toISOString(),
                status: 'connected'
              }
            },
            metadata: {
              createdAt: new Date().toISOString(),
              version: '2.0',
              migratedAt: new Date().toISOString()
            }
          }
        };
        
        // Replace the entire document with comprehensive structure
        await setDoc(userDocRef, cleanData, { merge: false });
        
        console.log('✅ Successfully migrated to comprehensive structure');
      } else if (userData.email || userData.uuid || userData.createdAt) {
        // If we have unwanted root fields, clean them up
        console.log('🧹 Cleaning up unwanted root fields...');
        
        if (userData[userEmail]) {
          // Ensure the structure has all required sections
          const existingData = userData[userEmail];
          const cleanData = {
            [userEmail]: {
              profile: existingData.profile || {
                email: userEmail,
                userId: userId,
                lastActive: new Date().toISOString()
              },
              wallet: existingData.wallet,
              metadata: existingData.metadata || {
                createdAt: new Date().toISOString(),
                version: '2.0'
              }
            }
          };
          
          await setDoc(userDocRef, cleanData, { merge: false });
          console.log('✅ Cleaned up and ensured comprehensive structure');
        }
      } else if (userData[userEmail]) {
        // Ensure existing structure has all required sections
        const existingData = userData[userEmail];
        if (!existingData.profile || !existingData.metadata) {
          console.log('🔧 Adding missing sections to existing structure...');
          
          const enhancedData = {
            [userEmail]: {
              profile: existingData.profile || {
                email: userEmail,
                userId: userId,
                lastActive: new Date().toISOString()
              },
              wallet: existingData.wallet,
              metadata: existingData.metadata || {
                createdAt: new Date().toISOString(),
                version: '2.0'
              }
            }
          };
          
          await setDoc(userDocRef, enhancedData, { merge: false });
          console.log('✅ Enhanced existing structure with missing sections');
        } else {
          console.log('✅ Data already in correct comprehensive format');
        }
      }
      
    } catch (error) {
      console.error('❌ Failed to cleanup/migrate user data:', error);
    }
  }

  // Secret Key Management Methods

  // Generate and store secret key using new userSecurity collection
  async generateAndStoreSecretKey(userId, userEmail) {
    try {
      // Check if secret key already exists in userSecurity collection
      const existingSecurity = await userSecurityService.getUserSecurity(userEmail);
      
      if (existingSecurity && existingSecurity.secretKey) {
        console.log('🔐 Secret key already exists in userSecurity collection');
        return existingSecurity.secretKey.code;
      }
      
      // Generate new 5-digit secret key
      const secretCode = Math.floor(10000 + Math.random() * 90000).toString();
      
      // Create or update security data with secret key
      const secretKeyData = {
        code: secretCode,
        generatedAt: new Date().toISOString(),
        status: 'active',
        usageCount: 0,
        lastUsed: null
      };
      
      if (existingSecurity) {
        // Update existing security data with secret key
        await userSecurityService.updateUserSecurity(userEmail, { secretKey: secretKeyData });
      } else {
        // Create new security entry with secret key
        const securityData = {
          email: userEmail,
          userId: userId,
          secretKey: secretKeyData,
          security: {
            encryptionLevel: 'standard',
            lastSecurityUpdate: new Date().toISOString(),
            securityVersion: '2.0'
          },
          createdAt: new Date().toISOString()
        };
        
        await userSecurityService.createUserSecurity(securityData);
      }
      
      console.log('🔐 Secret key stored in userSecurity collection');
      return secretCode;
      
    } catch (error) {
      console.error('❌ Failed to generate/store secret key in new structure:', error);
      throw new Error('Failed to generate secret key. Please try again.');
    }
  }

  // Get existing secret key from userSecurity collection
  async getSecretKey(userId, userEmail) {
    try {
      // Get from userSecurity collection first
      const securityData = await userSecurityService.getUserSecurity(userEmail);
      
      if (securityData && securityData.secretKey) {
        return securityData.secretKey.code;
      }
      
      // Fallback: Check old structure for backwards compatibility
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Look for secret key in the old email-based structure
        if (userData[userEmail] && 
            userData[userEmail].wallet && 
            userData[userEmail].wallet.secretKey) {
          return userData[userEmail].wallet.secretKey.code;
        }
      }
      
      return null;
    } catch (error) {
      console.error('❌ Failed to get secret key from new structure:', error);
      return null;
    }
  }

  // Check if secret key exists in the email-based wallet structure
  async hasSecretKey(userId, userEmail) {
    try {
      const secretKey = await this.getSecretKey(userId, userEmail);
      return secretKey !== null;
    } catch (error) {
      console.error('❌ Failed to check secret key existence:', error);
      return false;
    }
  }

  // Clean up any incorrect separate secret key documents
  async cleanupIncorrectSecretKeyStructure(userId) {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Check if there are any root-level fields that shouldn't be there
        const unwantedFields = ['wallet', 'secretKey', 'metadata', 'profile'];
        let hasUnwantedFields = false;
        
        for (const field of unwantedFields) {
          if (userData[field] && !userData[field].email) { // If it's not an email-based structure
            hasUnwantedFields = true;
            break;
          }
        }
        
        if (hasUnwantedFields) {
          console.log('🧹 Cleaning up incorrect document structure...');
          // Keep only email-based structures
          const cleanData = {};
          for (const key in userData) {
            if (key.includes('@')) { // Email-based structure
              cleanData[key] = userData[key];
            }
          }
          
          // Replace the document with only the correct email-based structure
          await setDoc(userDocRef, cleanData, { merge: false });
          console.log('✅ Cleaned up document structure');
        }
      }
      
    } catch (error) {
      console.error('❌ Failed to cleanup incorrect structure:', error);
    }
  }

  // Remove wallet listeners
  removeWalletListeners() {
    if (!this.isCoreWalletInstalled()) return;
    
    window.ethereum.removeAllListeners('accountsChanged');
    window.ethereum.removeAllListeners('chainChanged');
  }
}

// Export singleton instance
export const walletService = new WalletService();
export default walletService;