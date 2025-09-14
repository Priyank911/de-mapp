// src/services/avaxTransactionService.js - Updated for ImprovedVaultFactory
import { db } from '../firebase';
import { collection, doc, addDoc, getDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import firestoreTransactionService from './firestoreTransactionService';
import improvedVaultFactoryService from './improvedVaultFactoryService.js';
import ultraSimpleVaultService from './ultraSimpleVaultService.js';

// PRIMARY CONTRACT - IMPROVED VAULT FACTORY
const CONTRACT_CONFIG = {
  address: '0x84ee8d0a2b72eafb6af8bbd0516c08cf1fe08045', // NEW IMPROVED CONTRACT!
  type: 'ImprovedVaultFactory',
  network: 'fuji-testnet'
};

// FALLBACK CONTRACT - ULTRA SIMPLE (working)
const FALLBACK_CONFIG = {
  address: '0x034f890f4bb9fae35ae601bf49671816a9e0eb8a',
  type: 'UltraSimpleVault',
  network: 'fuji-testnet'
};

// Network configuration
const NETWORK_CONFIG = {
  chainId: 43113,
  name: 'Avalanche Fuji Testnet',
  rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
  explorerUrl: 'https://testnet.snowtrace.io'
};

class AvaxTransactionService {
  constructor() {
    this.contractAddress = CONTRACT_CONFIG.address; // Now using improved contract!
    this.fallbackAddress = FALLBACK_CONFIG.address;
    this.chainId = 43113;
    this.explorerBaseUrl = 'https://testnet.snowtrace.io';
  }

  /**
   * Main method to upload data to AVAX blockchain using ImprovedVaultFactory
   */
  async performAvaxUpload(userData, sessionData = null) {
    try {
      console.log('🚀 Starting AVAX upload with ImprovedVaultFactory...');
      
      // Use the improved vault factory service (primary)
      const result = await improvedVaultFactoryService.createVaultWithData(userData);
      
      if (result.success) {
        console.log('✅ AVAX upload successful with improved contract:', result);
        
        return {
          success: true,
          transactionHash: result.transactionHash,
          contractAddress: result.contractAddress,
          userAddress: result.userAddress,
          explorerUrl: result.explorerUrl,
          message: 'Improved vault created successfully with your data!'
        };
      } else {
        console.log('⚠️ Improved vault failed, trying fallback...');
        
        // Fallback to ultra simple vault if improved fails
        const fallbackResult = await ultraSimpleVaultService.createVault();
        
        if (fallbackResult.success) {
          console.log('✅ Fallback successful:', fallbackResult.transactionHash);
          
          const firestoreData = {
            ...fallbackResult,
            userData: userData,
            timestamp: new Date(),
            status: 'success',
            service: 'ultraSimpleVault-fallback'
          };
          
          await firestoreTransactionService.storeTransaction(firestoreData);
          
          return {
            success: true,
            transactionHash: fallbackResult.transactionHash,
            explorerUrl: fallbackResult.explorerUrl,
            message: 'Upload successful! Transaction submitted to AVAX blockchain (fallback mode).'
          };
        } else {
          console.error('❌ Both contract attempts failed');
          throw new Error(`Primary: ${result.error}. Fallback: ${fallbackResult.error}`);
        }
      }
    } catch (error) {
      console.error('❌ AVAX upload failed:', error);
      return {
        success: false,
        error: error.message,
        contractAddress: this.contractAddress
      };
    }
  }

  /**
   * Store transaction details in Firestore
   */
  async storeTransactionInFirestore(transactionData) {
    try {
      const firestoreData = {
        transactionHash: transactionData.transactionHash,
        contractAddress: this.contractAddress,
        vaultId: transactionData.vaultId,
        blockNumber: transactionData.blockNumber,
        status: 'confirmed',
        timestamp: new Date(),
        userData: transactionData.userData,
        explorerUrl: `${this.explorerBaseUrl}/tx/${transactionData.transactionHash}`,
        network: 'fuji-testnet',
        contractType: 'SimpleVaultFactory'
      };

      await firestoreTransactionService.storeTransaction(firestoreData);
      console.log('✅ Transaction stored in Firestore');
    } catch (error) {
      console.error('❌ Failed to store in Firestore:', error);
    }
  }

  /**
   * Get user's vaults from the improved contract
   */
  async getUserVaults(userAddress) {
    try {
      return await improvedVaultFactoryService.getUserVaults(userAddress);
    } catch (error) {
      console.error('❌ Failed to get user vaults:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get vault details by ID
   */
  async getVaultById(vaultId) {
    try {
      return await improvedVaultFactoryService.getVault(vaultId);
    } catch (error) {
      console.error('❌ Failed to get vault details:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update vault with new data
   */
  async updateVault(vaultId, hashId, cid) {
    try {
      return await improvedVaultFactoryService.updateVault(vaultId, hashId, cid);
    } catch (error) {
      console.error('❌ Failed to update vault:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get total vault count
   */
  async getTotalVaultCount() {
    try {
      return await improvedVaultFactoryService.getTotalVaultCount();
    } catch (error) {
      console.error('❌ Failed to get total vault count:', error);
      return 0;
    }
  }

  /**
   * Get user vault count
   */
  async getUserVaultCount(userAddress) {
    try {
      return await improvedVaultFactoryService.getUserVaultCount(userAddress);
    } catch (error) {
      console.error('❌ Failed to get user vault count:', error);
      return 0;
    }
  }

  /**
   * Get transaction explorer URL
   */
  getExplorerUrl(transactionHash) {
    return `${this.explorerBaseUrl}/tx/${transactionHash}`;
  }

  /**
   * Get contract explorer URL
   */
  getContractExplorerUrl() {
    return `${this.explorerBaseUrl}/address/${this.contractAddress}`;
  }

  /**
   * Legacy method support - redirect to new improved service
   */
  async uploadToBlockchain(userData) {
    console.log('⚠️ Using legacy method - redirecting to new ImprovedVaultFactory');
    return await this.performAvaxUpload(userData);
  }

  /**
   * Get transaction by hash - utility method
   */
  async getTransactionByHash(txHash) {
    try {
      const transactionsRef = collection(db, 'avaxTransactions');
      const q = query(
        transactionsRef, 
        where('transactionHash', '==', txHash),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { success: true, data: { id: doc.id, ...doc.data() } };
      } else {
        return { success: false, error: 'Transaction not found' };
      }
    } catch (error) {
      console.error('❌ Error fetching transaction:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all transactions for a user
   */
  async getUserTransactions(userAddress, limitCount = 10) {
    try {
      const transactionsRef = collection(db, 'avaxTransactions');
      const q = query(
        transactionsRef,
        where('userData.walletAddress', '==', userAddress),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const transactions = [];
      
      querySnapshot.forEach((doc) => {
        transactions.push({ id: doc.id, ...doc.data() });
      });
      
      return { success: true, transactions };
    } catch (error) {
      console.error('❌ Error fetching user transactions:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
const avaxTransactionService = new AvaxTransactionService();
export default avaxTransactionService;