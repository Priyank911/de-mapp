import { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';

class UserMetadataService {
  constructor() {
    this.collectionName = 'userMetadata';
  }

  // Create enhanced user metadata
  async createUserMetadata(metadataData) {
    try {
      console.log('📊 Creating enhanced user metadata for:', metadataData.uuid);
      
      const sanitizedData = {
        // Core identifiers
        uuid: metadataData.uuid,
        email: metadataData.email,
        userId: metadataData.userId,
        
        // Blockchain activity
        blockchain: {
          totalTransactions: 0,
          successfulTransactions: 0,
          failedTransactions: 0,
          totalGasSpent: 0,
          totalFeesSpent: 0,
          lastTransactionHash: null,
          lastTransactionDate: null,
          favoriteCurrency: 'AVAX',
          networkPreference: 'fuji-testnet',
          transactionHistory: [],
          gasEfficiency: 100,
          averageTransactionValue: 0
        },
        
        // Upload activity
        uploads: {
          totalUploads: 0,
          totalStorageUsed: 0,
          totalCIDs: 0,
          lastUploadDate: null,
          lastUploadCID: null,
          uploadSources: [],
          fileTypes: {},
          uploadTrends: {
            dailyAverage: 0,
            weeklyAverage: 0,
            monthlyAverage: 0,
            peakUploadDay: null
          },
          storageBreakdown: {
            documents: 0,
            images: 0,
            videos: 0,
            others: 0
          }
        },
        
        // Session data
        sessions: {
          totalSessions: 0,
          lastSessionId: null,
          lastSessionDate: null,
          averageSessionDuration: 0,
          activeSessionsCount: 0,
          sessionPatterns: {
            preferredTimeOfDay: 'evening',
            averageSessionsPerDay: 0,
            longestSession: 0,
            shortestSession: 0
          },
          deviceUsage: {
            desktop: 0,
            mobile: 0,
            tablet: 0
          }
        },
        
        // User preferences
        preferences: {
          dashboardTheme: 'light',
          emailNotifications: true,
          transactionAlerts: true,
          defaultNetwork: 'fuji-testnet',
          autoBackup: true,
          language: 'en',
          currency: 'USD',
          timezone: 'UTC',
          privacyLevel: 'standard',
          dataRetention: '1year'
        },
        
        // Activity tracking
        activity: {
          lastActiveDate: new Date().toISOString(),
          totalActiveHours: 0,
          loginStreak: 1,
          lastLoginDate: new Date().toISOString(),
          deviceCount: 1,
          locationCount: 1,
          productivityScore: 75,
          engagementLevel: 'medium',
          featureUsage: {
            wallet: 0,
            uploads: 0,
            transactions: 0,
            dashboard: 1
          }
        },
        
        // Storage and data
        storage: {
          usedSpace: 0,
          allocatedSpace: 1000,
          fileCount: 0,
          folderCount: 0,
          sharedFiles: 0,
          backupCount: 0,
          storageOptimization: {
            compressionRatio: 1.0,
            duplicateFiles: 0,
            unusedFiles: 0
          }
        },
        
        // Security insights
        security: {
          securityScore: 85,
          lastSecurityCheck: new Date().toISOString(),
          securityEvents: [],
          riskLevel: 'low',
          twoFactorEnabled: false,
          passwordStrength: 'strong'
        },
        
        // Social and collaboration
        social: {
          connections: 0,
          sharedProjects: 0,
          collaborations: 0,
          publicProfile: false,
          reputation: 50
        },
        
        // Performance metrics
        performance: {
          averageResponseTime: 0,
          errorRate: 0,
          uptimePercentage: 100,
          lastPerformanceCheck: new Date().toISOString()
        },
        
        // Migration info (if migrated from old structure)
        ...(metadataData.migrationInfo && {
          migrationInfo: metadataData.migrationInfo
        }),
        
        // Timestamps and versioning
        createdAt: metadataData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '2.0',
        status: 'active'
      };

      const metadataRef = doc(db, this.collectionName, metadataData.uuid);
      await setDoc(metadataRef, sanitizedData);
      
      console.log('✅ Enhanced user metadata created');
      return { success: true, metadataId: metadataData.uuid };
      
    } catch (error) {
      console.error('❌ Failed to create user metadata:', error);
      throw error;
    }
  }

  // Get user metadata by UUID
  async getUserMetadata(uuid) {
    try {
      console.log(`🔍 Fetching metadata for UUID: ${uuid}`);
      
      const metadataRef = doc(db, this.collectionName, uuid);
      const metadataDoc = await getDoc(metadataRef);
      
      if (metadataDoc.exists()) {
        const metadata = { id: metadataDoc.id, ...metadataDoc.data() };
        console.log('✅ Metadata found');
        return metadata;
      }
      
      console.log('❌ Metadata not found');
      return null;
      
    } catch (error) {
      console.error('❌ Failed to get user metadata:', error);
      throw error;
    }
  }

  // Get user metadata by email
  async getUserMetadataByEmail(email) {
    try {
      console.log(`🔍 Fetching metadata by email: ${email}`);
      
      const q = query(
        collection(db, this.collectionName),
        where('email', '==', email)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const metadata = { id: doc.id, ...doc.data() };
        console.log('✅ Metadata found by email');
        return metadata;
      }
      
      console.log('❌ Metadata not found by email');
      return null;
      
    } catch (error) {
      console.error('❌ Failed to get metadata by email:', error);
      throw error;
    }
  }

  // Update blockchain activity
  async updateBlockchainActivity(uuid, transactionData) {
    try {
      console.log(`⛓️ Updating blockchain activity for: ${uuid}`);
      
      const metadataRef = doc(db, this.collectionName, uuid);
      const metadataDoc = await getDoc(metadataRef);
      
      if (metadataDoc.exists()) {
        const currentData = metadataDoc.data();
        const currentBlockchain = currentData.blockchain || {};
        
        const updatedBlockchain = {
          totalTransactions: (currentBlockchain.totalTransactions || 0) + 1,
          successfulTransactions: transactionData.success ? 
            (currentBlockchain.successfulTransactions || 0) + 1 : 
            (currentBlockchain.successfulTransactions || 0),
          failedTransactions: !transactionData.success ? 
            (currentBlockchain.failedTransactions || 0) + 1 : 
            (currentBlockchain.failedTransactions || 0),
          totalGasSpent: (currentBlockchain.totalGasSpent || 0) + (transactionData.gasUsed || 0),
          totalFeesSpent: (currentBlockchain.totalFeesSpent || 0) + (transactionData.fee || 0),
          lastTransactionHash: transactionData.hash,
          lastTransactionDate: new Date().toISOString(),
          networkPreference: currentBlockchain.networkPreference || 'fuji-testnet'
        };
        
        await updateDoc(metadataRef, {
          blockchain: updatedBlockchain,
          updatedAt: new Date().toISOString()
        });
        
        console.log('✅ Blockchain activity updated');
        return { success: true };
      }
      
    } catch (error) {
      console.error('❌ Failed to update blockchain activity:', error);
      throw error;
    }
  }

  // Update upload activity
  async updateUploadActivity(uuid, uploadData) {
    try {
      console.log(`📤 Updating upload activity for: ${uuid}`);
      
      const metadataRef = doc(db, this.collectionName, uuid);
      const metadataDoc = await getDoc(metadataRef);
      
      if (metadataDoc.exists()) {
        const currentData = metadataDoc.data();
        const currentUploads = currentData.uploads || {};
        
        const updatedUploads = {
          totalUploads: (currentUploads.totalUploads || 0) + 1,
          totalStorageUsed: (currentUploads.totalStorageUsed || 0) + (uploadData.fileSize || 0),
          totalCIDs: (currentUploads.totalCIDs || 0) + 1,
          lastUploadDate: new Date().toISOString(),
          lastUploadCID: uploadData.cid,
          uploadSources: [...new Set([...(currentUploads.uploadSources || []), uploadData.source])],
          fileTypes: {
            ...currentUploads.fileTypes,
            [uploadData.fileType]: ((currentUploads.fileTypes || {})[uploadData.fileType] || 0) + 1
          }
        };
        
        await updateDoc(metadataRef, {
          uploads: updatedUploads,
          updatedAt: new Date().toISOString()
        });
        
        console.log('✅ Upload activity updated');
        return { success: true };
      }
      
    } catch (error) {
      console.error('❌ Failed to update upload activity:', error);
      throw error;
    }
  }

  // Update user activity
  async updateUserActivity(uuid, activityData = {}) {
    try {
      console.log(`📊 Updating user activity for: ${uuid}`);
      
      const metadataRef = doc(db, this.collectionName, uuid);
      const metadataDoc = await getDoc(metadataRef);
      
      if (metadataDoc.exists()) {
        const currentData = metadataDoc.data();
        const currentActivity = currentData.activity || {};
        
        const now = new Date().toISOString();
        const lastLogin = currentActivity.lastLoginDate;
        const isNewDay = !lastLogin || 
          new Date(now).toDateString() !== new Date(lastLogin).toDateString();
        
        const updatedActivity = {
          lastActiveDate: now,
          totalActiveHours: currentActivity.totalActiveHours || 0,
          loginStreak: isNewDay ? 
            (currentActivity.loginStreak || 0) + 1 : 
            (currentActivity.loginStreak || 1),
          lastLoginDate: activityData.isLogin ? now : currentActivity.lastLoginDate,
          deviceCount: currentActivity.deviceCount || 1,
          locationCount: currentActivity.locationCount || 1
        };
        
        await updateDoc(metadataRef, {
          activity: updatedActivity,
          updatedAt: now
        });
        
        console.log('✅ User activity updated');
        return { success: true };
      }
      
    } catch (error) {
      console.error('❌ Failed to update user activity:', error);
      throw error;
    }
  }

  // Get user statistics
  async getUserStatistics(uuid) {
    try {
      console.log(`📈 Getting statistics for: ${uuid}`);
      
      const metadata = await this.getUserMetadata(uuid);
      
      if (metadata) {
        const stats = {
          totalTransactions: metadata.blockchain?.totalTransactions || 0,
          successRate: metadata.blockchain?.totalTransactions > 0 ? 
            ((metadata.blockchain?.successfulTransactions || 0) / metadata.blockchain.totalTransactions * 100).toFixed(1) : 0,
          totalUploads: metadata.uploads?.totalUploads || 0,
          storageUsed: ((metadata.storage?.usedSpace || 0) / 1024 / 1024).toFixed(2) + ' MB',
          loginStreak: metadata.activity?.loginStreak || 0,
          lastActive: metadata.activity?.lastActiveDate,
          memberSince: metadata.createdAt,
          totalSessions: metadata.sessions?.totalSessions || 0
        };
        
        console.log('✅ Statistics calculated');
        return stats;
      }
      
      return null;
      
    } catch (error) {
      console.error('❌ Failed to get user statistics:', error);
      throw error;
    }
  }

  // Check if metadata exists
  async metadataExists(uuid) {
    try {
      const metadataRef = doc(db, this.collectionName, uuid);
      const metadataDoc = await getDoc(metadataRef);
      return metadataDoc.exists();
    } catch (error) {
      console.error('❌ Failed to check metadata existence:', error);
      return false;
    }
  }
}

const userMetadataService = new UserMetadataService();
export default userMetadataService;