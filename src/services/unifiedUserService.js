// Unified User Service - Coordinates all three separate collections
import userProfileService from './userProfileService';
import userSecurityService from './userSecurityService';
import userMetadataService from './userMetadataService';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

class UnifiedUserService {
  
  // Create a complete user across all three collections
  async createCompleteUser(userData) {
    try {
      console.log('🚀 Creating complete user across all collections:', userData.email);
      
      const {
        email,
        uuid,
        userId,
        displayName,
        walletAddress,
        walletType,
        chainId,
        signature,
        message,
        nonce,
        timestamp,
        connectedAt
      } = userData;

      // 1. Create Profile in userProfiles collection
      const profileData = {
        email,
        uuid,
        userId: userId || uuid,
        displayName: displayName || null,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        status: 'active',
        profileVersion: '2.0'
      };
      
      await userProfileService.createUserProfile(profileData);
      console.log('✅ Profile created in userProfiles');

      // 2. Create Security in userSecurity collection (if wallet data provided)
      if (walletAddress) {
        const securityData = {
          email,
          userId: userId || uuid,
          wallet: {
            address: walletAddress,
            type: walletType || 'Core Wallet',
            chainId: chainId,
            connectedAt: connectedAt || new Date().toISOString(),
            lastConnected: new Date().toISOString(),
            status: 'connected'
          },
          authentication: signature ? {
            signature,
            message,
            nonce,
            timestamp,
            verified: true
          } : null,
          security: {
            encryptionLevel: 'standard',
            lastSecurityUpdate: new Date().toISOString(),
            securityVersion: '2.0'
          },
          createdAt: new Date().toISOString()
        };
        
        await userSecurityService.createUserSecurity(securityData);
        console.log('✅ Security created in userSecurity');
      }

      // 3. Create Metadata in userMetadata collection
      const metadataData = {
        uuid,
        email,
        userId: userId || uuid,
        userActivity: {
          profileCreated: new Date().toISOString(),
          walletConnected: walletAddress ? new Date().toISOString() : null,
          lastActive: new Date().toISOString()
        },
        createdAt: new Date().toISOString()
      };
      
      await userMetadataService.createUserMetadata(metadataData);
      console.log('✅ Metadata created in userMetadata');

      console.log(`🎉 Complete user created for ${email}!`);
      return { success: true, email, uuid };

    } catch (error) {
      console.error('❌ Failed to create complete user:', error);
      throw error;
    }
  }

  // Get complete user data from all collections
  async getCompleteUser(email) {
    try {
      const profile = await userProfileService.getUserProfile(email);
      const security = await userSecurityService.getUserSecurity(email);
      const metadata = profile ? await userMetadataService.getUserMetadata(profile.uuid) : null;

      return {
        profile,
        security,
        metadata,
        exists: !!profile
      };
    } catch (error) {
      console.error('❌ Failed to get complete user:', error);
      return { profile: null, security: null, metadata: null, exists: false };
    }
  }

  // Check if user exists in any collection
  async userExists(email) {
    try {
      return await userProfileService.profileExists(email);
    } catch (error) {
      console.error('❌ Failed to check user existence:', error);
      return false;
    }
  }

  // Update user activity across collections
  async updateUserActivity(email, activityType, activityData = {}) {
    try {
      // Update profile last active
      await userProfileService.updateLastActive(email);

      // Update metadata with activity
      const profile = await userProfileService.getUserProfile(email);
      if (profile) {
        await userMetadataService.updateUserActivity(profile.uuid, {
          type: activityType,
          timestamp: new Date().toISOString(),
          data: activityData
        });
      }

      console.log(`✅ Updated user activity: ${activityType} for ${email}`);
    } catch (error) {
      console.error('❌ Failed to update user activity:', error);
    }
  }

  // Migrate user from old mixed structure to new separated structure
  async migrateUserFromOldStructure(userId, email) {
    try {
      console.log(`🔄 Migrating user from old structure: ${email}`);
      
      // Check if user already exists in new structure
      const existsInNew = await this.userExists(email);
      if (existsInNew) {
        console.log('✅ User already exists in new structure');
        return { migrated: false, reason: 'already_exists' };
      }

      // Get old data from users collection
      const oldUserRef = doc(db, 'users', userId);
      const oldUserDoc = await getDoc(oldUserRef);

      if (!oldUserDoc.exists()) {
        console.log('❌ No old data found to migrate');
        return { migrated: false, reason: 'no_old_data' };
      }

      const oldData = oldUserDoc.data();
      
      // Extract data from old structure
      let userData = {
        email,
        uuid: oldData.uuid || userId,
        userId,
        createdAt: oldData.createdAt
      };

      // Check for email-based nested data
      if (oldData[email]) {
        const emailData = oldData[email];
        
        if (emailData.profile) {
          userData.displayName = emailData.profile.displayName;
        }
        
        if (emailData.wallet) {
          userData.walletAddress = emailData.wallet.address;
          userData.walletType = emailData.wallet.type;
          userData.chainId = emailData.wallet.chainId;
          userData.connectedAt = emailData.wallet.connection?.connectedAt;
          
          if (emailData.wallet.authentication) {
            userData.signature = emailData.wallet.authentication.signature;
            userData.message = emailData.wallet.authentication.message;
            userData.nonce = emailData.wallet.authentication.nonce;
            userData.timestamp = emailData.wallet.authentication.timestamp;
          }
        }
      }

      // Create user in new structure
      await this.createCompleteUser(userData);

      console.log(`✅ Successfully migrated ${email} to new structure`);
      return { migrated: true, userData };

    } catch (error) {
      console.error(`❌ Failed to migrate user ${email}:`, error);
      throw error;
    }
  }

  // Record transaction activity
  async recordTransaction(email, transactionData) {
    try {
      const profile = await userProfileService.getUserProfile(email);
      if (profile) {
        await userMetadataService.updateBlockchainActivity(profile.uuid, {
          type: 'transaction',
          transactionHash: transactionData.hash,
          amount: transactionData.amount,
          timestamp: new Date().toISOString(),
          status: transactionData.status || 'pending'
        });
        
        console.log(`✅ Recorded transaction for ${email}`);
      }
    } catch (error) {
      console.error('❌ Failed to record transaction:', error);
    }
  }

  // Get user statistics
  async getUserStatistics(email) {
    try {
      const profile = await userProfileService.getUserProfile(email);
      if (!profile) return null;

      const metadata = await userMetadataService.getUserMetadata(profile.uuid);
      const security = await userSecurityService.getUserSecurity(email);

      return {
        profileCreated: profile.createdAt,
        lastActive: profile.lastActive,
        walletConnected: !!security?.wallet,
        walletAddress: security?.wallet?.address,
        secretKeyExists: !!security?.secretKey,
        totalTransactions: metadata?.blockchainActivity?.transactions?.length || 0,
        activityCount: metadata?.userActivity?.activityLog?.length || 0
      };
    } catch (error) {
      console.error('❌ Failed to get user statistics:', error);
      return null;
    }
  }
}

// Export singleton instance
const unifiedUserService = new UnifiedUserService();
export default unifiedUserService;