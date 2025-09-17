// src/services/avaxTransactionService.js - Data Storage Service for Avalanche C-Chain
import { ethers } from 'ethers';
import { db } from '../firebase';
import { collection, doc, setDoc, getDoc, updateDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { CONTRACT_DETAILS, validateContractConfig, getTransactionExplorerUrl } from '../config/contractConfig';

// Contract ABI for DataStorage contract
const DATA_STORAGE_ABI = [
  {
    "inputs": [
      {"internalType": "string", "name": "email", "type": "string"},
      {"internalType": "string", "name": "uuid", "type": "string"},
      {"internalType": "string", "name": "cid", "type": "string"}
    ],
    "name": "storeData",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "cid", "type": "string"}],
    "name": "getDataByCid",
    "outputs": [
      {
        "components": [
          {"internalType": "string", "name": "email", "type": "string"},
          {"internalType": "string", "name": "uuid", "type": "string"},
          {"internalType": "string", "name": "cid", "type": "string"},
          {"internalType": "address", "name": "userAddress", "type": "address"},
          {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
          {"internalType": "uint256", "name": "blockNumber", "type": "uint256"},
          {"internalType": "bool", "name": "isActive", "type": "bool"}
        ],
        "internalType": "struct DataStorage.DataEntry",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "cid", "type": "string"}],
    "name": "checkCidExists",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "storageFee",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getContractStats",
    "outputs": [
      {"internalType": "uint256", "name": "totalEntries", "type": "uint256"},
      {"internalType": "uint256", "name": "totalFees", "type": "uint256"},
      {"internalType": "uint256", "name": "currentFee", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
      {"indexed": true, "internalType": "uint256", "name": "entryId", "type": "uint256"},
      {"indexed": false, "internalType": "string", "name": "email", "type": "string"},
      {"indexed": false, "internalType": "string", "name": "uuid", "type": "string"},
      {"indexed": false, "internalType": "string", "name": "cid", "type": "string"},
      {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "fee", "type": "uint256"}
    ],
    "name": "DataStored",
    "type": "event"
  }
];

// Contract ABI will be loaded from contract configuration
// Update contractConfig.js with your deployed contract details

class AvaxTransactionService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.collectionName = 'avaxTransactions';
    
    // Validate contract configuration
    const validation = validateContractConfig();
    if (!validation.isValid) {
      console.warn('⚠️ Contract configuration incomplete:', validation.errors);
      console.log('📝 Please update src/config/contractConfig.js with your deployment details');
    }
  }

  /**
   * Initialize the service with wallet connection
   */
  async initialize() {
    try {
      // Validate contract configuration first
      const validation = validateContractConfig();
      if (!validation.isValid) {
        if (validation.isTemporary) {
          console.warn('⚠️ Using temporary contract configuration for testing');
          console.log('📝 Please deploy the contract and update src/config/contractConfig.js');
          // Allow initialization with temporary config for testing
        } else {
          throw new Error(`Contract not configured: ${validation.errors.join(', ')}`);
        }
      }
      
      console.log(`🔗 Initializing AVAX service for ${CONTRACT_DETAILS.NETWORK.NAME}`);
      
      // Check if MetaMask or Core Wallet is available
      if (typeof window.ethereum !== 'undefined') {
        this.provider = new ethers.BrowserProvider(window.ethereum);
        
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Switch to correct network if needed
        await this.switchNetwork();
        
        this.signer = await this.provider.getSigner();
        
        // Initialize contract with deployed address and ABI (skip if temporary)
        if (!validation.isTemporary) {
          this.contract = new ethers.Contract(
            CONTRACT_DETAILS.ADDRESS,
            CONTRACT_DETAILS.ABI,
            this.signer
          );
        }
        
        console.log('✅ AVAX service initialized successfully');
        return true;
      } else {
        throw new Error('No wallet found. Please install Core Wallet or MetaMask.');
      }
    } catch (error) {
      console.error('❌ Failed to initialize AVAX service:', error);
      throw error;
    }
  }

  /**
   * Switch to the correct Avalanche network
   */
  async switchNetwork() {
    try {
      const chainIdHex = `0x${CONTRACT_DETAILS.NETWORK.CHAIN_ID.toString(16)}`;
      
      try {
        // Try to switch to the network
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainIdHex }],
        });
      } catch (switchError) {
        // Network doesn't exist, add it
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: chainIdHex,
              chainName: CONTRACT_DETAILS.NETWORK.NAME,
              nativeCurrency: {
                name: 'AVAX',
                symbol: 'AVAX',
                decimals: 18,
              },
              rpcUrls: [CONTRACT_DETAILS.NETWORK.RPC_URL],
              blockExplorerUrls: [CONTRACT_DETAILS.NETWORK.EXPLORER],
            }],
          });
        } else {
          throw switchError;
        }
      }
    } catch (error) {
      console.error('❌ Failed to switch network:', error);
      throw error;
    }
  }

  /**
   * Check if CID already exists on blockchain
   */
  async checkCidExists(cid) {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }
      
      console.log(`🔍 Checking if CID exists: ${cid}`);
      const exists = await this.contract.checkCidExists(cid);
      console.log(`CID exists: ${exists}`);
      
      return exists;
    } catch (error) {
      console.error('❌ Failed to check CID existence:', error);
      throw error;
    }
  }

  /**
   * Get current storage fee from contract
   */
  async getStorageFee() {
    try {
      if (!this.contract) {
        // Use configured fee as fallback
        const feeEther = CONTRACT_DETAILS.STORAGE_FEE;
        const feeWei = ethers.parseEther(feeEther);
        
        console.log(`💰 Using configured storage fee: ${feeEther} AVAX`);
        return {
          wei: feeWei,  // Keep as BigInt
          weiString: feeWei.toString(),
          ether: feeEther,
          display: `${parseFloat(feeEther).toFixed(4)} AVAX`
        };
      }
      
      const feeWei = await this.contract.storagePrice();
      const feeEther = ethers.formatEther(feeWei);
      
      console.log(`💰 Current storage fee: ${feeEther} AVAX`);
      return {
        wei: feeWei,  // Keep as BigInt
        weiString: feeWei.toString(),
        ether: feeEther,
        display: `${parseFloat(feeEther).toFixed(4)} AVAX`
      };
    } catch (error) {
      console.error('❌ Failed to get storage fee:', error);
      throw error;
    }
  }

  /**
   * Store data on blockchain
   */
  async storeDataOnBlockchain(email, uuid, cid) {
    try {
      if (!this.contract) {
        // For testing purposes, simulate the transaction
        console.warn('⚠️ Contract not deployed yet - simulating transaction for testing');
        
        // Create a mock transaction record
        const transactionId = await this.createTransactionRecord({
          email,
          uuid,
          cid,
          status: 'simulated',
          fee: '0.01',
          network: 'fuji-testnet'
        });

        // Simulate transaction delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Update to completed
        await this.updateTransactionRecord(transactionId, {
          status: 'completed',
          blockNumber: 999999,
          transactionHash: '0xsimulated_transaction_hash',
          confirmedAt: new Date().toISOString()
        });

        return {
          success: true,
          transactionHash: '0xsimulated_transaction_hash',
          blockNumber: 999999,
          explorerUrl: `${CONTRACT_DETAILS.NETWORK.EXPLORER}/tx/0xsimulated_transaction_hash`,
          isSimulated: true
        };
      }
      
      console.log(`🚀 Storing data on blockchain for CID: ${cid}`);
      
      // Validate inputs
      if (!email || !uuid || !cid) {
        throw new Error('Missing required parameters: email, uuid, or cid');
      }
      
      console.log(`🔍 Input validation:`, {
        email: email.substring(0, 20) + '...',
        uuid: uuid.substring(0, 20) + '...',
        cid: cid.substring(0, 20) + '...',
        emailLength: email.length,
        uuidLength: uuid.length,
        cidLength: cid.length
      });

      // Check if CID already exists on blockchain
      const exists = await this.checkCidExists(cid);
      if (exists) {
        console.log('🔍 CID already exists on blockchain, checking our records...');
        
        // Check if we have a transaction record for this CID
        try {
          const existingRecord = await this.getTransactionStatus(cid);
          if (existingRecord && existingRecord.status === 'completed') {
            console.log('✅ Found existing completed transaction for this CID');
            return {
              success: true,
              transactionId: cid,
              transactionHash: existingRecord.transactionHash,
              blockNumber: existingRecord.blockNumber,
              entryId: existingRecord.entryId,
              message: 'CID already stored on blockchain',
              existing: true
            };
          }
        } catch (error) {
          console.log('No existing transaction record found, will create one...');
        }
        
        // CID exists on blockchain but no Firestore record
        // Create a record from blockchain data
        console.log('📝 Creating Firestore record for existing blockchain CID...');
        try {
          // Create a transaction record for the existing blockchain entry
          const transactionId = await this.createTransactionRecord({
            email,
            uuid,
            cid,
            status: 'completed',
            transactionHash: 'imported-from-blockchain',
            blockNumber: 'unknown',
            entryId: cid,
            timestamp: new Date(),
            fee: { wei: '0', avax: '0' },
            imported: true
          });
          
          console.log('✅ Created Firestore record for existing blockchain CID');
          return {
            success: true,
            transactionId: cid,
            transactionHash: 'imported-from-blockchain',
            blockNumber: 'unknown',
            entryId: cid,
            message: 'CID already stored on blockchain (record created)',
            existing: true,
            imported: true
          };
        } catch (createError) {
          console.error('Failed to create record for existing CID:', createError);
          // Fall back to informative error
          throw new Error('This CID has already been stored on the blockchain. Unable to sync with local records.');
        }
      }
      
      // Get storage fee
      const fee = await this.getStorageFee();
      
      // Create transaction record in Firestore first
      const transactionId = await this.createTransactionRecord({
        email,
        uuid,
        cid,
        status: 'pending',
        fee: fee.ether,
        network: CONTRACT_DETAILS.NETWORK.NAME
      });
      
      // Prepare transaction (let ethers estimate gas limit)
      console.log(`💰 Transaction details:`, {
        email,
        uuid, 
        cid,
        feeWei: fee.wei.toString(),
        feeEther: fee.ether
      });
      
      const tx = await this.contract.storeData(email, uuid, cid, {
        value: fee.wei
        // Remove gasLimit to let ethers estimate
      });
      
      console.log(`⏳ Transaction submitted: ${tx.hash}`);
      
      // Update Firestore with transaction hash
      await this.updateTransactionRecord(transactionId, {
        transactionHash: tx.hash,
        status: 'processing',
        submittedAt: new Date().toISOString()
      });
      
      // Wait for confirmation
      const receipt = await tx.wait();
      
      console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
      
      // Parse events to get entry ID
      const dataStoredEvent = receipt.logs.find(log => {
        try {
          const parsedLog = this.contract.interface.parseLog(log);
          return parsedLog.name === 'DataStored';
        } catch {
          return false;
        }
      });
      
      let entryId = null;
      if (dataStoredEvent) {
        const parsedEvent = this.contract.interface.parseLog(dataStoredEvent);
        console.log('📋 Parsed event:', parsedEvent);
        console.log('📋 Event args:', parsedEvent.args);
        
        // Use the CID parameter we already have instead of parsing from event
        // This avoids issues with Indexed objects in events
        entryId = cid;
      } else {
        console.warn('⚠️ DataStored event not found in transaction logs');
        // Use CID as fallback since we have it as a parameter
        entryId = cid;
      }
      
      // Update Firestore with success
      await this.updateTransactionRecord(transactionId, {
        status: 'completed',
        blockNumber: receipt.blockNumber,
        entryId,
        gasUsed: receipt.gasUsed.toString(),
        confirmedAt: new Date().toISOString()
      });
      
      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        entryId,
        explorerUrl: getTransactionExplorerUrl(tx.hash)
      };
      
    } catch (error) {
      console.error('❌ Failed to store data on blockchain:', error);
      
      // Update Firestore with failure if transaction was created
      if (error.transactionId) {
        await this.updateTransactionRecord(error.transactionId, {
          status: 'failed',
          error: error.message,
          failedAt: new Date().toISOString()
        });
      }
      
      throw error;
    }
  }

  /**
   * Get data from blockchain by CID
   */
  async getDataFromBlockchain(cid) {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }
      
      console.log(`📖 Getting data from blockchain for CID: ${cid}`);
      
      const dataEntry = await this.contract.getDataByCid(cid);
      
      return {
        email: dataEntry.email,
        uuid: dataEntry.uuid,
        cid: dataEntry.cid,
        userAddress: dataEntry.userAddress,
        timestamp: Number(dataEntry.timestamp),
        blockNumber: Number(dataEntry.blockNumber),
        isActive: dataEntry.isActive,
        explorerUrl: `${CONTRACT_DETAILS.NETWORK.EXPLORER}/address/${dataEntry.userAddress}`
      };
    } catch (error) {
      console.error('❌ Failed to get data from blockchain:', error);
      throw error;
    }
  }

  /**
   * Create transaction record in Firestore
   */
  async createTransactionRecord(data) {
    try {
      // Use CID as document ID for simple retrieval
      const transactionId = data.cid;
      const transactionRef = doc(db, this.collectionName, transactionId);
      
      // Clean data to avoid undefined values
      const cleanData = {};
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
          cleanData[key] = data[key];
        }
      });
      
      const transactionData = {
        ...cleanData,
        transactionId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(transactionRef, transactionData);
      
      console.log(`📝 Created transaction record: ${transactionId}`);
      return transactionId;
    } catch (error) {
      console.error('❌ Failed to create transaction record:', error);
      throw error;
    }
  }

  /**
   * Update transaction record in Firestore
   */
  async updateTransactionRecord(transactionId, updates) {
    try {
      const transactionRef = doc(db, this.collectionName, transactionId);
      
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(transactionRef, updateData);
      
      console.log(`📝 Updated transaction record: ${transactionId}`);
    } catch (error) {
      console.error('❌ Failed to update transaction record:', error);
      throw error;
    }
  }

  /**
   * Get transaction status by CID
   */
  async getTransactionStatus(cid) {
    try {
      // Simple document retrieval using CID as document ID
      const docRef = doc(db, this.collectionName, cid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return { status: 'not-found' };
      }

      return { ...docSnap.data(), id: docSnap.id };
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
      // Simplified query without ordering to avoid index requirement
      const q = query(
        collection(db, this.collectionName),
        where('email', '==', email)
      );
      
      const querySnapshot = await getDocs(q);
      const transactions = [];
      
      querySnapshot.forEach((doc) => {
        transactions.push({ ...doc.data(), id: doc.id });
      });

      // Sort manually by createdAt in descending order
      transactions.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt);
        return bTime - aTime;
      });
      
      return transactions;
    } catch (error) {
      console.error('❌ Failed to get user transactions:', error);
      throw error;
    }
  }

  /**
   * Set contract address (legacy function - now uses CONTRACT_DETAILS)
   */
  setContractAddress(address) {
    console.log(`🏗️ Contract address is configured in CONTRACT_DETAILS: ${CONTRACT_DETAILS.ADDRESS}`);
    console.log(`📝 To change address, update src/config/contractConfig.js`);
  }

  /**
   * Get current network configuration
   */
  getNetworkConfig() {
    return CONTRACT_DETAILS.NETWORK;
  }

  /**
   * Get contract statistics
   */
  async getContractStats() {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }
      
      const stats = await this.contract.getContractStats();
      
      return {
        totalEntries: Number(stats[0]),
        totalFees: ethers.formatEther(stats[1]),
        currentFee: ethers.formatEther(stats[2]),
        network: CONTRACT_DETAILS.NETWORK.NAME,
        contractAddress: CONTRACT_DETAILS.ADDRESS
      };
    } catch (error) {
      console.error('❌ Failed to get contract stats:', error);
      throw error;
    }
  }
}

// Export singleton instance
const avaxTransactionService = new AvaxTransactionService();
export default avaxTransactionService;