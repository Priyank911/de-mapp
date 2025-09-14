const { getFirestore } = require('../../config/firebase');
const PinataService = require('./pinataService');

class AvaxVaultService {
  constructor() {
    this.db = getFirestore();
    this.pinataService = new PinataService();
  }

  // Scan CID files and process matching users
  async scanAndProcessFiles() {
    try {
      console.log('🚀 Starting CID file scanning and processing...');
      
      // Step 1: Scan all JSON files for emails
      const emailResults = await this.pinataService.scanAllJSONFilesForEmails();
      
      if (emailResults.length === 0) {
        console.log('📭 No emails found in any JSON files');
        return { processed: 0, results: [] };
      }

      // Step 2: Get all emails found in files
      const allEmails = new Set();
      emailResults.forEach(result => {
        result.emails.forEach(email => allEmails.add(email));
      });

      console.log(`📧 Total unique emails found: ${allEmails.size}`);
      console.log('📧 Emails found:', Array.from(allEmails));

      // Step 3: Check which emails exist in Firestore users collection
      const matchingUsers = await this.findMatchingUsers(Array.from(allEmails));
      
      if (matchingUsers.length === 0) {
        console.log('👤 No matching users found in Firestore');
        return { processed: 0, results: emailResults, matchingUsers: [] };
      }

      console.log(`👥 Found ${matchingUsers.length} matching users in Firestore`);

      // Step 4: Create avaxvault entries for matching users
      const processedResults = [];
      for (const user of matchingUsers) {
        try {
          const userEmailResults = emailResults.filter(result => 
            result.emails.includes(user.email)
          );
          
          const avaxVaultData = await this.createAvaxVaultEntry(user, userEmailResults);
          processedResults.push({
            email: user.email,
            userId: user.userId,
            cidFiles: userEmailResults.length,
            avaxVaultData: avaxVaultData
          });
          
          console.log(`✅ Created avaxvault entry for ${user.email}`);
        } catch (error) {
          console.error(`❌ Failed to process user ${user.email}:`, error.message);
        }
      }

      console.log(`🎉 Processing complete! Created ${processedResults.length} avaxvault entries`);
      
      return {
        processed: processedResults.length,
        results: emailResults,
        matchingUsers: matchingUsers,
        processedResults: processedResults
      };
      
    } catch (error) {
      console.error('❌ Error in scan and process:', error.message);
      throw error;
    }
  }

  // Find users in Firestore that match the found emails
  async findMatchingUsers(emails) {
    try {
      console.log('🔍 Searching for matching users in Firestore...');
      console.log(`📧 Looking for emails: ${emails.join(', ')}`);
      
      const matchingUsers = [];
      
      // Search for each email
      for (const email of emails) {
        const usersRef = this.db.collection('users');
        const emailQuery = usersRef.where('email', '==', email);
        const snapshot = await emailQuery.get();
        
        if (!snapshot.empty) {
          snapshot.docs.forEach(doc => {
            const userData = doc.data();
            console.log(`✅ Found matching user for ${email}:`, userData.profile?.email);
            
            matchingUsers.push({
              id: doc.id,
              userId: userData.userId || doc.id,
              email: email,
              profile: userData.profile,
              wallet: userData.wallet,
              authentication: userData.authentication,
              metadata: userData.metadata
            });
          });
        } else {
          console.log(`❌ No user found for email: ${email}`);
        }
      }
      
      console.log(`🎯 Found ${matchingUsers.length} matching users total`);
      return matchingUsers;
      
    } catch (error) {
      console.error('❌ Error finding matching users:', error.message);
      throw error;
    }
  }

  // Check if user data contains the specified email
  userContainsEmail(userData, targetEmail) {
    try {
      // Check email-based structure (panchalpriyankfullstack@gmail.com)
      for (const key in userData) {
        if (key.includes('@') && key.toLowerCase() === targetEmail.toLowerCase()) {
          return true;
        }
        
        // Also check within the profile section
        if (userData[key] && userData[key].profile && userData[key].profile.email) {
          if (userData[key].profile.email.toLowerCase() === targetEmail.toLowerCase()) {
            return true;
          }
        }
      }
      
      // Check for direct email fields (fallback)
      const userDataStr = JSON.stringify(userData).toLowerCase();
      return userDataStr.includes(targetEmail.toLowerCase());
      
    } catch (error) {
      console.warn('⚠️ Error checking user email:', error.message);
      return false;
    }
  }

  // Create avaxvault entry for a user with their CID data
  async createAvaxVaultEntry(user, cidResults) {
    try {
      console.log(`📝 Creating avaxvault entry for ${user.email}...`);
      
      // Create comprehensive avaxvault structure matching your Firestore image
      const avaxVaultData = {
        // Main email field as shown in your Firestore structure
        [user.email]: {
          metadata: {
            createdAt: user.metadata?.createdAt || new Date().toISOString(),
            version: user.metadata?.version || "2.0",
            lastUpdated: new Date().toISOString(),
            source: 'pinata-cid-scan'
          },
          profile: {
            email: user.email,
            lastActive: user.profile?.lastActive || new Date().toISOString(),
            userId: user.id || user.userId
          },
          wallet: {
            address: user.wallet?.address || null
          },
          authentication: {
            message: user.authentication?.message || `Welcome to De-MAPP Memory Hub! Sign this message to verify your identity. Use ${user.email}`
          },
          cidData: {
            totalFiles: cidResults?.length || 1,
            processedAt: new Date().toISOString(),
            files: cidResults || [],
            scanSource: 'pinata-auto-scan'
          }
        }
      };

      // Store in avaxvault collection using the user's document ID
      const docId = user.id || user.userId;
      const avaxVaultRef = this.db.collection('avaxvault').doc(docId);
      await avaxVaultRef.set(avaxVaultData, { merge: true });
      
      console.log(`💾 ✅ Stored avaxvault data for ${user.email} (Document ID: ${docId})`);
      console.log(`📁 Structure created with email key: ${user.email}`);
      
      return avaxVaultData;
      
    } catch (error) {
      console.error(`❌ Error creating avaxvault entry for ${user.email}:`, error.message);
      throw error;
    }
  }

  // Get avaxvault data for a specific user
  async getAvaxVaultData(userId) {
    try {
      const avaxVaultRef = this.db.collection('avaxvault').doc(userId);
      const doc = await avaxVaultRef.get();
      
      if (doc.exists) {
        return doc.data();
      } else {
        return null;
      }
    } catch (error) {
      console.error(`❌ Error getting avaxvault data for user ${userId}:`, error.message);
      throw error;
    }
  }

  // Get all avaxvault entries
  async getAllAvaxVaultData() {
    try {
      const avaxVaultRef = this.db.collection('avaxvault');
      const snapshot = await avaxVaultRef.get();
      
      const results = [];
      snapshot.forEach(doc => {
        results.push({
          userId: doc.id,
          data: doc.data()
        });
      });
      
      return results;
    } catch (error) {
      console.error('❌ Error getting all avaxvault data:', error.message);
      throw error;
    }
  }
}

module.exports = AvaxVaultService;