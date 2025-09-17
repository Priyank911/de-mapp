// Firestore Restructuring Service - Separate the three data types
import { db } from '../firebase';
import { collection, doc, getDocs, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import userProfileService from './userProfileService';
import userSecurityService from './userSecurityService';
import userMetadataService from './userMetadataService';

class FirestoreRestructuringService {
  constructor() {
    this.migrationResults = {
      emailBasicData: { total: 0, migrated: 0, kept: 0 },
      profileData: { total: 0, migrated: 0 },
      secretKeyData: { total: 0, migrated: 0 },
      errors: []
    };
  }

  // Main restructuring function
  async restructureFirestore() {
    try {
      console.log('🔄 Starting Firestore restructuring...');
      console.log('📋 Analyzing current users collection...');

      // Get all documents from users collection
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);

      console.log(`📊 Found ${usersSnapshot.size} documents in users collection`);

      // Process each document
      for (const userDoc of usersSnapshot.docs) {
        await this.processUserDocument(userDoc.id, userDoc.data());
      }

      // Print results
      this.printRestructuringResults();
      return this.migrationResults;

    } catch (error) {
      console.error('❌ Restructuring failed:', error);
      throw error;
    }
  }

  // Process individual user document
  async processUserDocument(docId, docData) {
    try {
      console.log(`\n🔍 Processing document: ${docId}`);
      
      const documentType = this.identifyDocumentType(docId, docData);
      console.log(`📝 Document type: ${documentType}`);

      switch (documentType) {
        case 'email-basic':
          await this.handleEmailBasicData(docId, docData);
          break;
        case 'uuid-profile':
          await this.handleUuidProfileData(docId, docData);
          break;
        case 'user-secret':
          await this.handleUserSecretData(docId, docData);
          break;
        default:
          console.log(`⚠️ Unknown document type: ${docId}`);
      }

    } catch (error) {
      console.error(`❌ Error processing document ${docId}:`, error);
      this.migrationResults.errors.push({
        docId,
        error: error.message,
        data: docData
      });
    }
  }

  // Identify what type of document this is
  identifyDocumentType(docId, docData) {
    // Type 1: Email-based basic data (like panchalpriyankfullstack@gmail.com)
    if (docData.email && docData.uuid && docData.createdAt && Object.keys(docData).length <= 4) {
      return 'email-basic';
    }

    // Type 2: UUID-based profile data (like a139a0a6-7561-47f4-bfef-4f913031e344)
    if (docId.includes('-') && docId.length > 30) {
      // Check if it contains email-based nested data
      const emailKeys = Object.keys(docData).filter(key => key.includes('@'));
      if (emailKeys.length > 0) {
        return 'uuid-profile';
      }
    }

    // Type 3: User-based secret data (like user_32f9VSSyzPPelOpo01Tsp57aI2L)
    if (docId.startsWith('user_')) {
      // Check if it contains email-based data with secretKey
      const emailKeys = Object.keys(docData).filter(key => key.includes('@'));
      if (emailKeys.length > 0) {
        const firstEmailData = docData[emailKeys[0]];
        if (firstEmailData?.wallet?.secretKey) {
          return 'user-secret';
        }
      }
    }

    return 'unknown';
  }

  // Handle Type 1: Email basic data (KEEP AS IS)
  async handleEmailBasicData(docId, docData) {
    try {
      console.log('✅ Email basic data - keeping as is');
      this.migrationResults.emailBasicData.total++;
      this.migrationResults.emailBasicData.kept++;
      
      // This data stays in users collection - no migration needed
      console.log(`📧 Preserved: ${docData.email} with UUID: ${docData.uuid}`);

    } catch (error) {
      console.error('❌ Error handling email basic data:', error);
    }
  }

  // Handle Type 2: UUID profile data (MOVE TO userProfiles)
  async handleUuidProfileData(docId, docData) {
    try {
      console.log('🔄 UUID profile data - migrating to userProfiles collection');
      this.migrationResults.profileData.total++;

      // Extract email-based data
      const emailKeys = Object.keys(docData).filter(key => key.includes('@'));
      
      for (const email of emailKeys) {
        const emailData = docData[email];
        
        // Create profile data for userProfiles collection
        const profileData = {
          email: email,
          uuid: docId, // The document ID is the UUID
          userId: emailData.profile?.userId || docId,
          displayName: emailData.profile?.displayName || null,
          createdAt: emailData.metadata?.createdAt || new Date().toISOString(),
          lastActive: emailData.profile?.lastActive || new Date().toISOString(),
          status: 'active',
          profileVersion: '2.0'
        };

        // Store in userProfiles collection
        await userProfileService.createUserProfile(profileData);
        console.log(`✅ Profile created for: ${email}`);

        // If there's security data, move it too
        if (emailData.wallet || emailData.authentication) {
          const securityData = {
            email: email,
            userId: emailData.profile?.userId || docId,
            wallet: emailData.wallet ? {
              address: emailData.wallet.address,
              type: emailData.wallet.type || 'Core Wallet',
              chainId: emailData.wallet.chainId,
              connectedAt: emailData.wallet.connection?.connectedAt,
              lastConnected: emailData.wallet.connection?.lastConnected || new Date().toISOString(),
              status: emailData.wallet.connection?.status || 'connected'
            } : null,
            authentication: emailData.authentication ? {
              signature: emailData.authentication.signature,
              message: emailData.authentication.message,
              nonce: emailData.authentication.nonce,
              timestamp: emailData.authentication.timestamp,
              verified: true
            } : null,
            security: {
              encryptionLevel: 'standard',
              lastSecurityUpdate: new Date().toISOString(),
              securityVersion: '2.0'
            },
            createdAt: profileData.createdAt
          };

          await userSecurityService.createUserSecurity(securityData);
          console.log(`✅ Security data created for: ${email}`);
        }

        // Create metadata
        const metadataData = {
          uuid: docId,
          email: email,
          userId: emailData.profile?.userId || docId,
          createdAt: profileData.createdAt,
          migrationInfo: {
            migratedAt: new Date().toISOString(),
            sourceCollection: 'users',
            sourceDocumentId: docId,
            migrationVersion: '2.0'
          }
        };

        await userMetadataService.createUserMetadata(metadataData);
        console.log(`✅ Metadata created for: ${email}`);
      }

      // Delete from users collection after successful migration
      await deleteDoc(doc(db, 'users', docId));
      console.log(`🗑️ Deleted original document: ${docId}`);
      
      this.migrationResults.profileData.migrated++;

    } catch (error) {
      console.error('❌ Error handling UUID profile data:', error);
      throw error;
    }
  }

  // Handle Type 3: User secret data (MOVE TO userSecurity)
  async handleUserSecretData(docId, docData) {
    try {
      console.log('🔄 User secret data - migrating to userSecurity collection');
      this.migrationResults.secretKeyData.total++;

      // Extract email-based data
      const emailKeys = Object.keys(docData).filter(key => key.includes('@'));
      
      for (const email of emailKeys) {
        const emailData = docData[email];
        
        if (emailData?.wallet?.secretKey) {
          // Create security data for userSecurity collection
          const securityData = {
            email: email,
            userId: docId, // Using the user_ ID as userId
            secretKey: {
              code: emailData.wallet.secretKey.code,
              generatedAt: emailData.wallet.secretKey.generatedAt,
              status: emailData.wallet.secretKey.status || 'active',
              usageCount: 0,
              lastUsed: null,
              migratedFrom: 'users-collection',
              migratedAt: new Date().toISOString()
            },
            wallet: emailData.wallet.address ? {
              address: emailData.wallet.address,
              type: emailData.wallet.type || 'Core Wallet',
              chainId: emailData.wallet.chainId,
              connectedAt: emailData.wallet.connection?.connectedAt || new Date().toISOString(),
              lastConnected: emailData.wallet.connection?.lastConnected || new Date().toISOString(),
              status: emailData.wallet.connection?.status || 'connected'
            } : null,
            authentication: emailData.authentication || null,
            security: {
              encryptionLevel: 'standard',
              lastSecurityUpdate: new Date().toISOString(),
              securityVersion: '2.0',
              migratedFrom: docId
            },
            createdAt: emailData.wallet.secretKey.generatedAt || new Date().toISOString()
          };

          // Check if security data already exists
          const existingSecurity = await userSecurityService.getUserSecurity(email);
          if (!existingSecurity) {
            await userSecurityService.createUserSecurity(securityData);
            console.log(`✅ Secret key migrated for: ${email}`);
            console.log(`🔑 Secret code: ${emailData.wallet.secretKey.code}`);
          } else {
            console.log(`⚠️ Security data already exists for: ${email}`);
          }
        }
      }

      // Delete from users collection after successful migration
      await deleteDoc(doc(db, 'users', docId));
      console.log(`🗑️ Deleted original document: ${docId}`);
      
      this.migrationResults.secretKeyData.migrated++;

    } catch (error) {
      console.error('❌ Error handling user secret data:', error);
      throw error;
    }
  }

  // Print restructuring results
  printRestructuringResults() {
    console.log('\n📊 FIRESTORE RESTRUCTURING RESULTS:');
    console.log('═══════════════════════════════════════');
    
    console.log('📧 EMAIL BASIC DATA (Type 1):');
    console.log(`   Total: ${this.migrationResults.emailBasicData.total}`);
    console.log(`   Kept in users: ${this.migrationResults.emailBasicData.kept}`);
    
    console.log('\n👤 PROFILE DATA (Type 2):');
    console.log(`   Total: ${this.migrationResults.profileData.total}`);
    console.log(`   Migrated to userProfiles: ${this.migrationResults.profileData.migrated}`);
    
    console.log('\n🔐 SECRET KEY DATA (Type 3):');
    console.log(`   Total: ${this.migrationResults.secretKeyData.total}`);
    console.log(`   Migrated to userSecurity: ${this.migrationResults.secretKeyData.migrated}`);
    
    if (this.migrationResults.errors.length > 0) {
      console.log(`\n⚠️ ERRORS (${this.migrationResults.errors.length}):`);
      this.migrationResults.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.docId}: ${error.error}`);
      });
    }
    
    console.log('═══════════════════════════════════════\n');
  }

  // Verify the restructuring
  async verifyRestructuring() {
    try {
      console.log('🔍 Verifying Firestore restructuring...');

      // Check users collection
      const usersSnapshot = await getDocs(collection(db, 'users'));
      console.log(`📧 Users collection: ${usersSnapshot.size} documents remaining`);

      // Check new collections
      const profilesSnapshot = await getDocs(collection(db, 'userProfiles'));
      console.log(`👤 UserProfiles collection: ${profilesSnapshot.size} documents`);

      const securitySnapshot = await getDocs(collection(db, 'userSecurity'));
      console.log(`🔐 UserSecurity collection: ${securitySnapshot.size} documents`);

      const metadataSnapshot = await getDocs(collection(db, 'userMetadata'));
      console.log(`📊 UserMetadata collection: ${metadataSnapshot.size} documents`);

      return {
        usersRemaining: usersSnapshot.size,
        profilesCreated: profilesSnapshot.size,
        securityCreated: securitySnapshot.size,
        metadataCreated: metadataSnapshot.size
      };

    } catch (error) {
      console.error('❌ Verification failed:', error);
      throw error;
    }
  }
}

// Export the service
const firestoreRestructuringService = new FirestoreRestructuringService();
export default firestoreRestructuringService;

// Usage:
/*
import firestoreRestructuringService from './firestoreRestructuringService';

// Restructure the entire Firestore
await firestoreRestructuringService.restructureFirestore();

// Verify the results
await firestoreRestructuringService.verifyRestructuring();
*/