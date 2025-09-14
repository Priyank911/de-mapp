// src/services/avaxVaultService.js
import { db } from '../firebase';
import { collection, doc, getDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

class AvaxVaultService {
  constructor() {
    this.collectionName = 'avaxvault';
  }

  // Get user's avaxvault data by user ID
  async getUserAvaxVaultData(userId) {
    try {
      console.log(`🔍 Fetching avaxvault data for user: ${userId}`);
      
      const docRef = doc(db, this.collectionName, userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log(`✅ Found avaxvault data for user: ${userId}`);
        return {
          id: docSnap.id,
          ...data
        };
      } else {
        console.log(`❌ No avaxvault data found for user: ${userId}`);
        return null;
      }
    } catch (error) {
      console.error('Error fetching user avaxvault data:', error);
      throw error;
    }
  }

  // Get user's avaxvault data by email
  async getUserAvaxVaultDataByEmail(userEmail) {
    try {
      console.log(`🔍 Fetching avaxvault data for email: ${userEmail}`);
      
      // Query all documents to find one that contains the user's email
      const collectionRef = collection(db, this.collectionName);
      const querySnapshot = await getDocs(collectionRef);
      
      let userData = null;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Check if this document contains the user's email as a key
        if (data[userEmail]) {
          userData = {
            id: doc.id,
            email: userEmail,
            data: data[userEmail]
          };
        }
      });
      
      if (userData) {
        console.log(`✅ Found avaxvault data for email: ${userEmail}`);
        return userData;
      } else {
        console.log(`❌ No avaxvault data found for email: ${userEmail}`);
        return null;
      }
    } catch (error) {
      console.error('Error fetching user avaxvault data by email:', error);
      throw error;
    }
  }

  // Get all avaxvault data (admin/demo purpose)
  async getAllAvaxVaultData() {
    try {
      console.log('🔍 Fetching all avaxvault data...');
      
      const collectionRef = collection(db, this.collectionName);
      const querySnapshot = await getDocs(collectionRef);
      
      const allData = [];
      querySnapshot.forEach((doc) => {
        allData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log(`✅ Found ${allData.length} avaxvault entries`);
      return allData;
    } catch (error) {
      console.error('Error fetching all avaxvault data:', error);
      throw error;
    }
  }

  // Transform avaxvault data for dashboard display
  transformDataForDashboard(avaxVaultData) {
    try {
      if (!avaxVaultData || !avaxVaultData.data) {
        return this.getDefaultDashboardData();
      }

      const userData = avaxVaultData.data;
      
      // Extract metrics
      const totalSessions = userData.cidData?.totalFiles || 0;
      const activeSessions = userData.cidData?.files?.length || 0;
      const memorySize = this.calculateMemorySize(userData.cidData?.files || []);
      
      // Transform memory sessions data
      const mySessions = this.transformToMemorySessions(userData);
      
      // Transform vaults data
      const myVaults = this.transformToVaults(userData);
      
      // Memory overview data
      const memoryData = {
        totalSessions: totalSessions.toString(),
        activeSessions: activeSessions.toString(),
        memorySize: memorySize,
        growth: `+${Math.floor(activeSessions * 0.2)} sessions`,
        growthPercent: `+${Math.floor(Math.random() * 20 + 10)}%`,
        isPositive: true
      };

      return {
        memoryData,
        mySessions,
        myVaults,
        userData
      };
    } catch (error) {
      console.error('Error transforming avaxvault data:', error);
      return this.getDefaultDashboardData();
    }
  }

  // Transform CID data to memory sessions format
  transformToMemorySessions(userData) {
    const sessions = [];
    
    if (userData.cidData && userData.cidData.files) {
      userData.cidData.files.forEach((file, index) => {
        // Determine status - new conversations get 'ongoing' status with light theme
        const isNewConversation = this.isRecentFile(file.datePinned);
        const status = isNewConversation ? 'ongoing' : (index === 0 ? 'active' : (index % 2 === 0 ? 'idle' : 'learning'));
        
        sessions.push({
          id: index + 1,
          name: file.fileName || `Memory Session ${index + 1}`,
          description: `CID-based memory session from ${file.datePinned ? new Date(file.datePinned).toLocaleDateString() : 'Unknown date'}`,
          status: status,
          sessions: 1,
          lastActive: this.getRelativeTime(file.datePinned),
          memorySize: this.formatFileSize(file.fileSize),
          conversations: file.emails?.length || 1,
          cid: file.cid,
          isNew: isNewConversation,
          emails: file.emails || [],
          needsUpload: isNewConversation // Flag for AVAX upload requirement
        });
      });
    }

    // If no CID data, create default session
    if (sessions.length === 0) {
      sessions.push({
        id: 1,
        name: `${userData.profile?.email?.split('@')[0] || 'Personal'}_AI`,
        description: "Your dedicated coding assistant with persistent memory",
        status: "active",
        sessions: 1,
        lastActive: "Just created",
        memorySize: "0 MB",
        conversations: 0,
        isNew: false,
        needsUpload: false
      });
    }

    return sessions;
  }

  // Check if file is recent (within last 24 hours)
  isRecentFile(datePinned) {
    if (!datePinned) return false;
    
    try {
      const fileDate = new Date(datePinned);
      const now = new Date();
      const hoursDiff = (now - fileDate) / (1000 * 60 * 60);
      return hoursDiff <= 24; // Consider files from last 24 hours as "new"
    } catch (error) {
      return false;
    }
  }

  // Transform data to vaults format
  transformToVaults(userData) {
    const vaults = [];
    
    // Main vault from profile data
    if (userData.profile) {
      vaults.push({
        id: 1,
        name: "Personal Memory Vault",
        description: `Memory vault for ${userData.profile.email}`,
        sessions: userData.cidData?.totalFiles || 1,
        size: this.calculateMemorySize(userData.cidData?.files || []),
        lastUpdated: this.getRelativeTime(userData.metadata?.lastUpdated || userData.metadata?.createdAt)
      });
    }

    // Wallet vault if wallet exists
    if (userData.wallet && userData.wallet.address) {
      vaults.push({
        id: 2,
        name: "Wallet Memory Vault",
        description: "Blockchain and wallet interaction memories",
        sessions: 1,
        size: "128 MB",
        lastUpdated: this.getRelativeTime(userData.metadata?.lastUpdated)
      });
    }

    // Authentication vault
    if (userData.authentication) {
      vaults.push({
        id: 3,
        name: "Authentication Vault",
        description: "Secure authentication and session data",
        sessions: 1,
        size: "64 MB",
        lastUpdated: this.getRelativeTime(userData.metadata?.lastUpdated)
      });
    }

    return vaults;
  }

  // Calculate memory size from files
  calculateMemorySize(files) {
    if (!files || files.length === 0) return "0 MB";
    
    const totalBytes = files.reduce((total, file) => {
      return total + (file.fileSize || 0);
    }, 0);
    
    return this.formatFileSize(totalBytes);
  }

  // Format file size
  formatFileSize(bytes) {
    if (!bytes || bytes === 0) return "0 MB";
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  // Get relative time
  getRelativeTime(dateString) {
    if (!dateString) return "Unknown";
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      
      if (diffInMinutes < 1) return "Just now";
      if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
      
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
      
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } catch (error) {
      return "Unknown";
    }
  }

  // Default dashboard data when no avaxvault data exists
  getDefaultDashboardData() {
    return {
      memoryData: {
        totalSessions: "0",
        activeSessions: "0",
        memorySize: "0 MB",
        growth: "+0 sessions",
        growthPercent: "+0%",
        isPositive: true
      },
      mySessions: [
        {
          id: 1,
          name: "Getting Started",
          description: "Create your first memory session",
          status: "idle",
          sessions: 0,
          lastActive: "Not started",
          memorySize: "0 MB",
          conversations: 0
        }
      ],
      myVaults: [
        {
          id: 1,
          name: "Default Vault",
          description: "Your personal memory vault",
          sessions: 0,
          size: "0 MB",
          lastUpdated: "Not created"
        }
      ],
      userData: null
    };
  }
}

export default new AvaxVaultService();