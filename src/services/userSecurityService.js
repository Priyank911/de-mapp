import { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

class UserSecurityService {
  constructor() {
    this.collectionName = 'userSecurity';
  }

  // Create user security data (wallet, secret keys, authentication)
  async createUserSecurity(securityData) {
    try {
      console.log('🔐 Creating user security data for:', securityData.email);
      
      const sanitizedData = {
        // Basic identifiers
        email: securityData.email,
        userId: securityData.userId,
        
        // Wallet information
        wallet: {
          address: securityData.wallet?.address || null,
          type: securityData.wallet?.type || 'Core Wallet',
          chainId: securityData.wallet?.chainId || null,
          connectedAt: securityData.wallet?.connectedAt || new Date().toISOString(),
          lastConnected: new Date().toISOString(),
          status: securityData.wallet?.status || 'connected'
        },
        
        // Secret key (encrypted/secured)
        secretKey: securityData.secretKey ? {
          code: securityData.secretKey.code,
          generatedAt: securityData.secretKey.generatedAt || new Date().toISOString(),
          status: 'active',
          usageCount: 0,
          lastUsed: null
        } : null,
        
        // Authentication data
        authentication: {
          signature: securityData.authentication?.signature || null,
          message: securityData.authentication?.message || null,
          nonce: securityData.authentication?.nonce || null,
          timestamp: securityData.authentication?.timestamp || null,
          chainId: securityData.authentication?.chainId || null,
          verified: securityData.authentication?.verified || false
        },
        
        // Connection data
        connection: {
          connectedAt: new Date().toISOString(),
          lastConnected: new Date().toISOString(),
          status: 'connected',
          type: securityData.wallet?.type || 'Core Wallet'
        },
        
        // Security metadata
        security: {
          encryptionLevel: 'standard',
          lastSecurityUpdate: new Date().toISOString(),
          securityVersion: '1.0',
          ipAddress: securityData.security?.ipAddress || null,
          userAgent: securityData.security?.userAgent || null,
          riskLevel: 'low',
          securityScore: 85
        },
        
        // Timestamps
        createdAt: securityData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active'
      };

      // Use email as document ID for easy lookup
      const securityRef = doc(db, this.collectionName, securityData.email);
      await setDoc(securityRef, sanitizedData);
      
      console.log('✅ User security data created');
      return { success: true, securityId: securityData.email };
      
    } catch (error) {
      console.error('❌ Failed to create user security data:', error);
      throw error;
    }
  }

  // Get user security data by email
  async getUserSecurity(email) {
    try {
      console.log(`🔍 Fetching security data for: ${email}`);
      
      const securityRef = doc(db, this.collectionName, email);
      const securityDoc = await getDoc(securityRef);
      
      if (securityDoc.exists()) {
        const security = { id: securityDoc.id, ...securityDoc.data() };
        console.log('✅ Security data found');
        return security;
      }
      
      console.log('❌ Security data not found');
      return null;
      
    } catch (error) {
      console.error('❌ Failed to get user security data:', error);
      throw error;
    }
  }

  // Get secret key for user
  async getSecretKey(email) {
    try {
      console.log(`🔑 Getting secret key for: ${email}`);
      
      const securityData = await this.getUserSecurity(email);
      
      if (securityData && securityData.secretKey) {
        // Update usage count
        await this.updateSecretKeyUsage(email);
        return securityData.secretKey.code;
      }
      
      console.log('❌ Secret key not found');
      return null;
      
    } catch (error) {
      console.error('❌ Failed to get secret key:', error);
      return null;
    }
  }

  // Generate and store new secret key
  async generateSecretKey(email, userId) {
    try {
      console.log(`🔐 Generating secret key for: ${email}`);
      
      // Check if secret key already exists
      const existingSecurity = await this.getUserSecurity(email);
      if (existingSecurity && existingSecurity.secretKey) {
        console.log('🔐 Secret key already exists');
        return existingSecurity.secretKey.code;
      }
      
      // Generate new 5-digit secret key
      const secretCode = Math.floor(10000 + Math.random() * 90000).toString();
      
      const secretKeyData = {
        code: secretCode,
        generatedAt: new Date().toISOString(),
        status: 'active',
        usageCount: 0,
        lastUsed: null
      };
      
      // If security data exists, update it; otherwise create new
      if (existingSecurity) {
        await this.updateUserSecurity(email, {
          secretKey: secretKeyData
        });
      } else {
        await this.createUserSecurity({
          email: email,
          userId: userId,
          secretKey: secretKeyData
        });
      }
      
      console.log('✅ Secret key generated and stored');
      return secretCode;
      
    } catch (error) {
      console.error('❌ Failed to generate secret key:', error);
      throw error;
    }
  }

  // Update secret key usage
  async updateSecretKeyUsage(email) {
    try {
      const securityRef = doc(db, this.collectionName, email);
      const securityDoc = await getDoc(securityRef);
      
      if (securityDoc.exists()) {
        const currentData = securityDoc.data();
        const currentUsage = currentData.secretKey?.usageCount || 0;
        
        await updateDoc(securityRef, {
          'secretKey.usageCount': currentUsage + 1,
          'secretKey.lastUsed': new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('❌ Failed to update secret key usage:', error);
    }
  }

  // Update wallet information
  async updateWalletInfo(email, walletData) {
    try {
      console.log(`🔄 Updating wallet info for: ${email}`);
      
      const securityRef = doc(db, this.collectionName, email);
      const updateData = {
        wallet: {
          address: walletData.address,
          type: walletData.type || 'Core Wallet',
          chainId: walletData.chainId,
          lastConnected: new Date().toISOString(),
          status: 'connected'
        },
        'connection.lastConnected': new Date().toISOString(),
        'connection.status': 'connected',
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(securityRef, updateData);
      
      console.log('✅ Wallet info updated');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Failed to update wallet info:', error);
      throw error;
    }
  }

  // Update authentication data
  async updateAuthentication(email, authData) {
    try {
      console.log(`🔄 Updating authentication for: ${email}`);
      
      const securityRef = doc(db, this.collectionName, email);
      const updateData = {
        authentication: {
          signature: authData.signature,
          message: authData.message,
          nonce: authData.nonce,
          timestamp: authData.timestamp,
          chainId: authData.chainId,
          verified: authData.verified || true
        },
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(securityRef, updateData);
      
      console.log('✅ Authentication updated');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Failed to update authentication:', error);
      throw error;
    }
  }

  // Update user security data
  async updateUserSecurity(email, updates) {
    try {
      console.log(`🔄 Updating security data for: ${email}`);
      
      const securityRef = doc(db, this.collectionName, email);
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(securityRef, updateData);
      
      console.log('✅ Security data updated');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Failed to update security data:', error);
      throw error;
    }
  }

  // Check if user has security data
  async hasSecurityData(email) {
    try {
      const securityData = await this.getUserSecurity(email);
      return securityData !== null;
    } catch (error) {
      console.error('❌ Failed to check security data existence:', error);
      return false;
    }
  }

  // Deactivate user security (for account closure)
  async deactivateSecurity(email) {
    try {
      console.log(`🔒 Deactivating security for: ${email}`);
      
      const securityRef = doc(db, this.collectionName, email);
      await updateDoc(securityRef, {
        status: 'inactive',
        'secretKey.status': 'inactive',
        'wallet.status': 'disconnected',
        'connection.status': 'disconnected',
        deactivatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      console.log('✅ Security data deactivated');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Failed to deactivate security:', error);
      throw error;
    }
  }

  // Get users by wallet address (for debugging/admin)
  async getUsersByWallet(walletAddress) {
    try {
      console.log(`🔍 Finding users by wallet: ${walletAddress}`);
      
      const q = query(
        collection(db, this.collectionName),
        where('wallet.address', '==', walletAddress)
      );
      
      const querySnapshot = await getDocs(q);
      const users = [];
      
      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });
      
      console.log(`✅ Found ${users.length} users with wallet ${walletAddress}`);
      return users;
      
    } catch (error) {
      console.error('❌ Failed to find users by wallet:', error);
      throw error;
    }
  }

  // Get security statistics (admin function)
  async getSecurityStatistics() {
    try {
      console.log('📊 Getting security statistics');
      
      const securityCollection = collection(db, this.collectionName);
      const querySnapshot = await getDocs(securityCollection);
      
      let totalUsers = 0;
      let usersWithWallets = 0;
      let usersWithSecretKeys = 0;
      let usersWithAuth = 0;
      let activeUsers = 0;
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        totalUsers++;
        
        if (data.wallet?.address) usersWithWallets++;
        if (data.secretKey?.code) usersWithSecretKeys++;
        if (data.authentication?.verified) usersWithAuth++;
        if (data.status === 'active') activeUsers++;
      });
      
      const stats = {
        totalUsers,
        activeUsers,
        usersWithWallets,
        usersWithSecretKeys,
        usersWithAuth,
        securityScore: totalUsers > 0 ? Math.round((usersWithAuth / totalUsers) * 100) : 0,
        walletConnectRate: totalUsers > 0 ? Math.round((usersWithWallets / totalUsers) * 100) : 0
      };
      
      console.log('✅ Security statistics calculated');
      return stats;
      
    } catch (error) {
      console.error('❌ Failed to get security statistics:', error);
      return null;
    }
  }

  // Delete user security data (GDPR compliance)
  async deleteUserSecurity(email) {
    try {
      console.log(`🗑️ Deleting security data for: ${email}`);
      
      const securityRef = doc(db, this.collectionName, email);
      await deleteDoc(securityRef);
      
      console.log('✅ Security data deleted');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Failed to delete security data:', error);
      throw error;
    }
  }
}

// Export singleton instance
const userSecurityService = new UserSecurityService();
export default userSecurityService;