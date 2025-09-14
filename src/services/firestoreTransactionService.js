// src/services/firestoreTransactionService.js
import { db } from '../firebase';
import { collection, doc, addDoc, getDoc, getDocs, query, where, orderBy, limit, updateDoc } from 'firebase/firestore';

class FirestoreTransactionService {
  constructor() {
    this.avaxTransactionsCollection = 'avaxTransactions';
    this.avaxVaultCollection = 'avaxvault';
  }

  // Replace undefined values with null recursively (Firestore doesn't accept undefined)
  sanitizeObject(obj) {
    if (obj === null || obj === undefined) return null;
    if (Array.isArray(obj)) return obj.map(v => this.sanitizeObject(v));
    if (typeof obj === 'object') {
      const out = {};
      for (const [k, v] of Object.entries(obj)) {
        if (v === undefined) {
          out[k] = null;
        } else if (v instanceof Date) {
          out[k] = v.toISOString();
        } else if (typeof v === 'object' && v !== null) {
          out[k] = this.sanitizeObject(v);
        } else {
          out[k] = v;
        }
      }
      return out;
    }
    return obj;
  }

  // Store transaction hash and email in avaxTransactions collection
  async storeAvaxTransaction(transactionData) {
    try {
      console.log('💾 Storing AVAX transaction in Firestore:', transactionData);
      
      // Ensure no undefined values (Firestore rejects undefined)
      const safeData = this.sanitizeObject(transactionData || {});

      // Derive common fields from either top-level or nested userData
      const derivedEmail = safeData.email || (safeData.userData && safeData.userData.email) || (safeData.user && safeData.user.email) || null;
      const derivedUserAddress = safeData.userAddress || (safeData.userData && safeData.userData.userAddress) || (safeData.user && safeData.user.address) || null;
      const derivedUserName = safeData.userName || (safeData.userData && safeData.userData.name) || (safeData.user && safeData.user.name) || null;
      const derivedCid = safeData.cid || (safeData.userData && safeData.userData.cid) || null;
      const derivedHashId = safeData.hashId || (safeData.userData && safeData.userData.hashId) || null;
      const derivedContractAddress = safeData.contractAddress || safeData.contract || null;
      const derivedExplorerUrl = safeData.explorerUrl || null;

      const transactionRecord = {
        // Core transaction data
        transactionHash: safeData.transactionHash || null,
        email: derivedEmail,
        
        // User information
        userAddress: derivedUserAddress,
        userName: derivedUserName,
        
        // Blockchain details
        network: 'fuji-testnet',
        chainId: '43113',
  contractAddress: derivedContractAddress,
  vaultAddress: safeData.vaultAddress || null,
        
        // Session and data details
  sessionId: safeData.sessionId || null,
  sessionName: safeData.sessionName || null,
  cid: derivedCid,
  hashId: derivedHashId,
        
        // Transaction metadata
  status: safeData.status || 'completed',
  gasUsed: safeData.gasUsed || null,
  gasPrice: safeData.gasPrice || null,
  transactionFee: safeData.transactionFee || null,
        
        // Explorer links
  explorerUrl: derivedExplorerUrl,
        
        // Timestamps
  timestamp: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
        
        // Additional metadata
        uploadSource: 'demapp-private-section',
        version: '1.0.0'
      };
      
  const docRef = await addDoc(collection(db, this.avaxTransactionsCollection), this.sanitizeObject(transactionRecord));
      
      console.log('✅ AVAX transaction stored with ID:', docRef.id);
      
      return {
        id: docRef.id,
        ...transactionRecord
      };
      
    } catch (error) {
      console.error('❌ Error storing AVAX transaction:', error);
      throw error;
    }
  }

  // Get all transactions for a specific email
  async getTransactionsByEmail(email) {
    try {
      console.log(`🔍 Fetching transactions for email: ${email}`);
      
      const q = query(
        collection(db, this.avaxTransactionsCollection),
        where('email', '==', email),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const transactions = [];
      
      querySnapshot.forEach((doc) => {
        transactions.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log(`✅ Found ${transactions.length} transactions for ${email}`);
      return transactions;
      
    } catch (error) {
      console.error('❌ Error fetching transactions by email:', error);
      throw error;
    }
  }

  // Get transaction by hash
  async getTransactionByHash(transactionHash) {
    try {
      console.log(`🔍 Fetching transaction by hash: ${transactionHash}`);
      
      const q = query(
        collection(db, this.avaxTransactionsCollection),
        where('transactionHash', '==', transactionHash)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.log('❌ Transaction not found');
        return null;
      }
      
      const doc = querySnapshot.docs[0];
      const transaction = {
        id: doc.id,
        ...doc.data()
      };
      
      console.log('✅ Transaction found:', transaction);
      return transaction;
      
    } catch (error) {
      console.error('❌ Error fetching transaction by hash:', error);
      throw error;
    }
  }

  // Update avaxvault document to include transaction reference
  async linkTransactionToAvaxVault(email, transactionId, transactionHash) {
    try {
      console.log(`🔗 Linking transaction ${transactionId} to avaxvault for ${email}`);
      
      // Find the avaxvault document for this email
      const q = query(
        collection(db, this.avaxVaultCollection),
        where('primaryEmail', '==', email)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.log('❌ No avaxvault document found for email:', email);
        return null;
      }
      
      const vaultDoc = querySnapshot.docs[0];
      const vaultData = vaultDoc.data();
      
      // Add transaction reference to vault
      const updatedTransactions = [
        ...(vaultData.transactions || []),
        {
          transactionId,
          transactionHash,
          uploadedAt: new Date().toISOString(),
          status: 'completed'
        }
      ];
      
      await updateDoc(doc(db, this.avaxVaultCollection, vaultDoc.id), {
        transactions: updatedTransactions,
        lastTransactionHash: transactionHash,
        lastUploadedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      console.log('✅ Transaction linked to avaxvault successfully');
      
      return {
        vaultId: vaultDoc.id,
        transactionId,
        transactionHash
      };
      
    } catch (error) {
      console.error('❌ Error linking transaction to avaxvault:', error);
      throw error;
    }
  }

  // Get transaction statistics for an email
  async getTransactionStats(email) {
    try {
      const transactions = await this.getTransactionsByEmail(email);
      
      const stats = {
        totalTransactions: transactions.length,
        successfulTransactions: transactions.filter(tx => tx.status === 'completed').length,
        failedTransactions: transactions.filter(tx => tx.status === 'failed').length,
        totalGasUsed: transactions.reduce((sum, tx) => sum + (parseInt(tx.gasUsed) || 0), 0),
        totalFeesSpent: transactions.reduce((sum, tx) => sum + (parseFloat(tx.transactionFee) || 0), 0),
        lastTransaction: transactions[0] || null,
        uniqueCIDs: new Set(transactions.map(tx => tx.cid).filter(Boolean)).size,
        uniqueSessions: new Set(transactions.map(tx => tx.sessionId).filter(Boolean)).size
      };
      
      return stats;
      
    } catch (error) {
      console.error('❌ Error calculating transaction stats:', error);
      throw error;
    }
  }

  // Store failed transaction
  async storeFailedTransaction(errorData) {
    try {
      console.log('💾 Storing failed transaction:', errorData);
      // Sanitize incoming error data and provide defaults for missing fields
      const safe = this.sanitizeObject(errorData || {});

      // Derive common fields from either top-level or nested userData
      const derivedEmail = safe.email || (safe.userData && safe.userData.email) || (safe.user && safe.user.email) || null;
      const derivedUserAddress = safe.userAddress || (safe.userData && safe.userData.userAddress) || (safe.user && safe.user.address) || 'unknown';
      const derivedUserName = safe.userName || (safe.userData && safe.userData.name) || (safe.user && safe.user.name) || 'Unknown User';
      const derivedCid = safe.cid || (safe.userData && safe.userData.cid) || null;
      const derivedHashId = safe.hashId || (safe.userData && safe.userData.hashId) || null;

      const failedRecord = {
        transactionHash: safe.transactionHash || null,
        email: derivedEmail,
        userAddress: derivedUserAddress,
        userName: derivedUserName,

        // Error details
        status: 'failed',
        error: safe.error || (safe.errorMessage ? String(safe.errorMessage) : 'Unknown error'),
        errorMessage: safe.errorMessage || null,

        // Session data (if available)
        sessionId: safe.sessionId || null,
        sessionName: safe.sessionName || null,
        cid: derivedCid,
        hashId: derivedHashId,

        // Network info
        network: 'fuji-testnet',
        chainId: '43113',

        // Timestamps
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),

        // Metadata
        uploadSource: 'demapp-private-section',
        version: '1.0.0'
      };

      const docRef = await addDoc(collection(db, this.avaxTransactionsCollection), this.sanitizeObject(failedRecord));
      
      console.log('✅ Failed transaction stored with ID:', docRef.id);
      
      return {
        id: docRef.id,
        ...failedRecord
      };
      
    } catch (error) {
      console.error('❌ Error storing failed transaction:', error);
      throw error;
    }
  }

  // Update transaction status
  async updateTransactionStatus(transactionId, status, additionalData = {}) {
    try {
      console.log(`🔄 Updating transaction ${transactionId} status to ${status}`);
      
      const updateData = {
        status,
        updatedAt: new Date().toISOString(),
        ...additionalData
      };
      
      await updateDoc(doc(db, this.avaxTransactionsCollection, transactionId), updateData);
      
      console.log('✅ Transaction status updated successfully');
      
      return updateData;
      
    } catch (error) {
      console.error('❌ Error updating transaction status:', error);
      throw error;
    }
  }

  // Get recent transactions (last 10)
  async getRecentTransactions(limitCount = 10) {
    try {
      console.log(`🔍 Fetching recent ${limitCount} transactions`);
      
      const q = query(
        collection(db, this.avaxTransactionsCollection),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const transactions = [];
      
      querySnapshot.forEach((doc) => {
        transactions.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log(`✅ Found ${transactions.length} recent transactions`);
      return transactions;
      
    } catch (error) {
      console.error('❌ Error fetching recent transactions:', error);
      throw error;
    }
  }
}

export default new FirestoreTransactionService();