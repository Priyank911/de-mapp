// Push Chain Transaction Service
import { ethers } from 'ethers';
import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';

class PushChainTransactionService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.metamaskProvider = null; // Store MetaMask provider reference
    this.collectionName = 'pushChainTransactions';
    
    // Push Chain Donut Testnet Configuration
    this.chainId = 42101; // Push Chain Donut Testnet chain ID
    this.rpcUrl = 'https://evm.rpc-testnet-donut-node2.push.org/'; // Push Chain Donut Testnet RPC
    this.explorerUrl = 'https://donut.push.network';
    
    // Contract Configuration
    this.contractAddress = '0xf95f7a45dedd071c53a75f1589cba79c1de0df2e';
    this.storagePrice = '10000000000000000'; // 0.01 PUSH (10000000000000000 Wei)
    
    // Contract ABI
    this.contractABI = [
      {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "user",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "string",
            "name": "cid",
            "type": "string"
          },
          {
            "indexed": false,
            "internalType": "string",
            "name": "email",
            "type": "string"
          },
          {
            "indexed": false,
            "internalType": "string",
            "name": "uuid",
            "type": "string"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          }
        ],
        "name": "DataStored",
        "type": "event"
      },
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "email",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "uuid",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "cid",
            "type": "string"
          }
        ],
        "name": "storeData",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "cid",
            "type": "string"
          }
        ],
        "name": "checkCidExists",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "cid",
            "type": "string"
          }
        ],
        "name": "getDataByCid",
        "outputs": [
          {
            "components": [
              {
                "internalType": "string",
                "name": "email",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "uuid",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "cid",
                "type": "string"
              },
              {
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
              },
              {
                "internalType": "address",
                "name": "user",
                "type": "address"
              },
              {
                "internalType": "bool",
                "name": "exists",
                "type": "bool"
              }
            ],
            "internalType": "struct DataStorageLight.UserData",
            "name": "",
            "type": "tuple"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ];
  }

  /**
   * Debug wallet detection
   */
  detectWallets() {
    console.log('🔍 Detecting wallets for Push Chain...');
    
    if (!window.ethereum) {
      console.log('❌ No window.ethereum found');
      return null;
    }

    console.log('✅ window.ethereum exists');
    console.log('   isMetaMask:', window.ethereum.isMetaMask);
    console.log('   isCoreWallet:', window.ethereum.isCoreWallet);
    console.log('   isAvalanche:', window.ethereum.isAvalanche);
    
    // Try multiple methods to find MetaMask provider (same as walletService)
    let metamaskProvider = null;

    if (window.ethereum.providers && Array.isArray(window.ethereum.providers)) {
      console.log(`✅ Multiple providers detected (${window.ethereum.providers.length})`);
      window.ethereum.providers.forEach((provider, index) => {
        console.log(`   Provider ${index}:`, {
          isMetaMask: provider.isMetaMask,
          isCoreWallet: provider.isCoreWallet,
          isAvalanche: provider.isAvalanche
        });
      });
      
      // Find MetaMask provider (exclude Core Wallet and Avalanche)
      metamaskProvider = window.ethereum.providers.find(provider => 
        provider && provider.isMetaMask && !provider.isAvalanche && !provider.isCoreWallet
      );
      
      if (metamaskProvider) {
        console.log('✅ MetaMask found in providers array (filtered from Core Wallet)');
        return metamaskProvider;
      }
    }

    // Fallback: Single provider check
    if (!metamaskProvider && window.ethereum && window.ethereum.isMetaMask && !window.ethereum.isAvalanche) {
      console.log('✅ Single MetaMask provider detected');
      return window.ethereum;
    }
    
    console.log('❌ MetaMask not found - Core Wallet may be intercepting');
    return null;
  }

  /**
   * Initialize Push Chain connection
   */
  async initialize() {
    try {
      // Debug wallet detection
      console.log('🔍 Starting wallet detection...');
      const detectedProvider = this.detectWallets();
      
      if (!detectedProvider) {
        throw new Error('MetaMask not found. Please install MetaMask extension or disable other wallet extensions temporarily.');
      }

      // Use the detected MetaMask provider
      this.metamaskProvider = detectedProvider;
      console.log('✅ Using MetaMask provider');

      // Request account access from MetaMask specifically
      console.log('🔓 Requesting MetaMask account access...');
      await this.metamaskProvider.request({ method: 'eth_requestAccounts' });

      // Create provider with the specific MetaMask provider
      this.provider = new ethers.BrowserProvider(this.metamaskProvider);
      
      // Get current chain ID
      const network = await this.provider.getNetwork();
      const currentChainId = Number(network.chainId);

      console.log('🔗 Current Chain ID:', currentChainId);
      console.log('🔗 Target Chain ID:', this.chainId);

      // Switch to Push Chain Testnet if not already connected
      if (currentChainId !== this.chainId) {
        await this.switchToPushChain(this.metamaskProvider);
      }

      // Get signer
      this.signer = await this.provider.getSigner();
      
      // Initialize contract
      this.contract = new ethers.Contract(
        this.contractAddress,
        this.contractABI,
        this.signer
      );

      console.log('✅ Push Chain service initialized with MetaMask');
      console.log('📝 Contract Address:', this.contractAddress);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Push Chain service:', error);
      throw error;
    }
  }

  /**
   * Switch to Push Chain Testnet
   */
  async switchToPushChain(provider) {
    // Use the specific provider passed in, or fall back to window.ethereum
    const ethereumProvider = provider || window.ethereum;
    
    try {
      await ethereumProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${this.chainId.toString(16)}` }],
      });
      console.log('✅ Switched to Push Chain Donut Testnet');
    } catch (switchError) {
      // Chain not added to MetaMask
      if (switchError.code === 4902) {
        try {
          await ethereumProvider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${this.chainId.toString(16)}`,
                chainName: 'Push Chain Donut Testnet',
                nativeCurrency: {
                  name: 'PC',
                  symbol: 'PC',
                  decimals: 18,
                },
                rpcUrls: [this.rpcUrl],
                blockExplorerUrls: [this.explorerUrl],
              },
            ],
          });
          console.log('✅ Push Chain Donut Testnet added to MetaMask');
        } catch (addError) {
          console.error('❌ Failed to add Push Chain Donut Testnet:', addError);
          throw addError;
        }
      } else {
        throw switchError;
      }
    }
  }

  /**
   * Check if CID exists on blockchain
   */
  async checkCidExists(cid) {
    try {
      if (!this.contract) {
        await this.initialize();
      }

      const exists = await this.contract.checkCidExists(cid);
      console.log(`🔍 CID ${cid} exists on Push Chain Donut:`, exists);
      return exists;
    } catch (error) {
      console.error('❌ Error checking CID existence:', error);
      return false;
    }
  }

  /**
   * Store data on Push Chain blockchain
   */
  async storeDataOnBlockchain(email, uuid, cid) {
    try {
      console.log('📤 Storing data on Push Chain Donut Testnet...');
      console.log('Email:', email);
      console.log('UUID:', uuid);
      console.log('CID:', cid);

      // Initialize if not already done
      if (!this.contract) {
        await this.initialize();
      }

      // Check if CID already exists on blockchain
      const cidExists = await this.checkCidExists(cid);
      
      if (cidExists) {
        console.log('ℹ️ CID already exists on Push Chain Donut blockchain');
        
        // Get existing data from blockchain
        const blockchainData = await this.contract.getDataByCid(cid);
        console.log('📊 Existing blockchain data:', blockchainData);

        // Check if record exists in Firebase
        const existingRecord = await this.getTransactionStatus(cid);
        
        if (existingRecord.status === 'not-found') {
          // Import from blockchain to Firebase
          const address = await this.signer.getAddress();
          await addDoc(collection(db, this.collectionName), {
            cid,
            email,
            uuid,
            status: 'completed',
            transactionHash: 'imported-from-blockchain',
            walletAddress: address,
            timestamp: new Date().toISOString(),
            blockNumber: null,
            imported: true
          });
          
          return {
            success: true,
            existing: true,
            imported: true,
            message: 'CID already exists on Push Chain Donut blockchain',
            transactionHash: 'imported-from-blockchain'
          };
        }

        return {
          success: true,
          existing: true,
          message: 'CID already exists on Push Chain Donut blockchain',
          transactionHash: existingRecord.transactionHash,
          explorerUrl: `${this.explorerUrl}/tx/${existingRecord.transactionHash}`
        };
      }

      // Store new data on blockchain
      const tx = await this.contract.storeData(email, uuid, cid, {
        value: this.storagePrice // 0.01 PUSH as gas fee
      });

      console.log('📝 Transaction submitted:', tx.hash);
      console.log('⏳ Waiting for confirmation...');

      // Save to Firebase
      const address = await this.signer.getAddress();
      await addDoc(collection(db, this.collectionName), {
        cid,
        email,
        uuid,
        status: 'pending',
        transactionHash: tx.hash,
        walletAddress: address,
        timestamp: new Date().toISOString(),
        blockNumber: null
      });

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      console.log('✅ Transaction confirmed!');
      console.log('Block Number:', receipt.blockNumber);
      console.log('Transaction Hash:', receipt.hash);
      console.log('Contract Address:', this.contractAddress);

      // Update Firebase with confirmed status
      const q = query(
        collection(db, this.collectionName),
        where('transactionHash', '==', tx.hash)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, {
          status: 'completed',
          blockNumber: receipt.blockNumber,
          confirmedAt: new Date().toISOString()
        });
      }

      return {
        success: true,
        existing: false,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        explorerUrl: `${this.explorerUrl}/tx/${receipt.hash}`,
        contractAddress: this.contractAddress
      };

    } catch (error) {
      console.error('❌ Error storing data on Push Chain Donut:', error);
      
      // Update Firebase with error status if transaction was started
      if (error.transactionHash) {
        const q = query(
          collection(db, this.collectionName),
          where('transactionHash', '==', error.transactionHash)
        );
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const docRef = querySnapshot.docs[0].ref;
          await updateDoc(docRef, {
            status: 'failed',
            error: error.message
          });
        }
      }
      
      throw error;
    }
  }

  /**
   * Get transaction status from Firebase
   */
  async getTransactionStatus(cid) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('cid', '==', cid)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return { status: 'not-found' };
      }

      const doc = querySnapshot.docs[0];
      return { ...doc.data(), id: doc.id };
    } catch (error) {
      console.error('❌ Failed to get transaction status:', error);
      throw error;
    }
  }

  /**
   * Get all transactions for a user
   */
  async getUserTransactions(email) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('email', '==', email)
      );
      
      const querySnapshot = await getDocs(q);
      const transactions = [];
      
      querySnapshot.forEach((doc) => {
        transactions.push({ id: doc.id, ...doc.data() });
      });
      
      return transactions;
    } catch (error) {
      console.error('❌ Failed to get user transactions:', error);
      throw error;
    }
  }
}

// Export singleton instance
const pushChainTransactionService = new PushChainTransactionService();
export default pushChainTransactionService;
