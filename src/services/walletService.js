// Core Wallet Integration Service
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

class WalletService {
  constructor() {
    this.isConnecting = false;
    this.connectedWallet = null;
    this.provider = null;
  }

  // Check if Core Wallet is installed
  isCoreWalletInstalled() {
    return typeof window !== 'undefined' && 
           window.ethereum && 
           window.ethereum.isAvalanche;
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
  async signMessage(message, walletAddress) {
    // Method 1: Try with hex encoding (Core Wallet preferred)
    try {
      console.log('🔐 Method 1: Trying personal_sign with hex encoding...');
      const messageHex = this.stringToHex(message);
      console.log('📝 Original message:', message);
      console.log('📝 Message in hex:', messageHex);
      
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [messageHex, walletAddress]
      });
      console.log('✅ Hex encoding successful!');
      return signature;
    } catch (error1) {
      console.log('❌ Hex encoding failed:', error1.message);
      
      // Method 2: Try with plain text (fallback)
      try {
        console.log('🔐 Method 2: Trying personal_sign with plain text...');
        const signature = await window.ethereum.request({
          method: 'personal_sign',
          params: [message, walletAddress]
        });
        console.log('✅ Plain text successful!');
        return signature;
      } catch (error2) {
        console.log('❌ Plain text failed:', error2.message);
        
        // Method 3: Try with UTF-8 bytes as hex
        try {
          console.log('� Method 3: Trying with UTF-8 bytes as hex...');
          const encoder = new TextEncoder();
          const messageBytes = encoder.encode(message);
          const messageHex = '0x' + Array.from(messageBytes)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
          
          const signature = await window.ethereum.request({
            method: 'personal_sign',
            params: [messageHex, walletAddress]
          });
          console.log('✅ UTF-8 bytes successful!');
          return signature;
        } catch (error3) {
          console.error('❌ All signing methods failed');
          throw new Error('Unable to sign message. Please check your Core Wallet version and try again.');
        }
      }
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

  // Store wallet information in Firebase
  async storeWalletInfo(userId, walletData) {
    try {
      const userDocRef = doc(db, 'users', userId);
      
      // Extract email from wallet data
      const userEmail = walletData.userEmail;
      
      // Create comprehensive structured format
      const cleanData = {
        [userEmail]: {
          profile: {
            email: userEmail,
            userId: userId,
            lastActive: new Date().toISOString()
          },
          wallet: {
            address: walletData.walletAddress,
            type: walletData.walletType,
            chainId: walletData.chainId,
            authentication: {
              signature: walletData.signature,
              message: walletData.message,
              nonce: walletData.nonce,
              timestamp: walletData.timestamp
            },
            connection: {
              connectedAt: walletData.connectedAt,
              lastConnected: new Date().toISOString(),
              status: 'connected'
            }
          },
          metadata: {
            createdAt: new Date().toISOString(),
            version: '2.0'
          }
        }
      };

      // Set the document with the comprehensive structure
      await setDoc(userDocRef, cleanData, { merge: false });
      
      console.log(`💾 Comprehensive wallet structure created for ${userEmail}`);
      
    } catch (error) {
      console.error('❌ Failed to store wallet info in Firebase:', error);
      throw new Error('Failed to save wallet information. Please try again.');
    }
  }

  // Get stored wallet info from Firebase
  async getStoredWalletInfo(userId, userEmail) {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Access wallet data from the new clean structure
        if (userData[userEmail] && userData[userEmail].wallet) {
          const walletData = userData[userEmail].wallet;
          
          // Return in the expected format for backwards compatibility
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
        
        // Fallback to old structure for backwards compatibility
        if (userData.wallet) {
          return userData.wallet;
        }
      }
      
      return null;
    } catch (error) {
      console.error('❌ Failed to get wallet info from Firebase:', error);
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

  // Generate and store secret key (only if it doesn't exist)
  async generateAndStoreSecretKey(userId, userEmail) {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Check if secret key already exists in the email-based structure
        if (userData[userEmail] && 
            userData[userEmail].wallet && 
            userData[userEmail].wallet.secretKey) {
          console.log('🔐 Secret key already exists, returning existing key');
          return userData[userEmail].wallet.secretKey.code;
        }
      }
      
      // Generate new 5-digit secret key
      const secretCode = Math.floor(10000 + Math.random() * 90000).toString();
      
      // Add secret key to the existing email-based wallet structure
      const secretKeyUpdate = {
        [userEmail]: {
          wallet: {
            secretKey: {
              code: secretCode,
              generatedAt: new Date().toISOString(),
              status: 'active'
            }
          }
        }
      };
      
      // Merge with existing structure (don't overwrite other wallet data)
      await setDoc(userDocRef, secretKeyUpdate, { merge: true });
      
      console.log('🔐 Secret key added to existing wallet structure');
      return secretCode;
      
    } catch (error) {
      console.error('❌ Failed to generate/store secret key:', error);
      throw new Error('Failed to generate secret key. Please try again.');
    }
  }

  // Get existing secret key from the email-based wallet structure
  async getSecretKey(userId, userEmail) {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Look for secret key in the email-based structure
        if (userData[userEmail] && 
            userData[userEmail].wallet && 
            userData[userEmail].wallet.secretKey) {
          return userData[userEmail].wallet.secretKey.code;
        }
      }
      
      return null;
    } catch (error) {
      console.error('❌ Failed to get secret key:', error);
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