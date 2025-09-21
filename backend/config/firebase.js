const admin = require('firebase-admin');
const path = require('path');

let db = null;

// Mock data for development - simulating your actual Firestore data
const mockUsers = [
  {
    id: 'a139a0a6-7561-47f4-bfef-4f913031e344',
    email: 'panchalpriyankfullstack@gmail.com',
    userId: 'user_32f8pkazVTaGHhmKTIQfhSGQM74',
    profile: {
      email: 'panchalpriyankfullstack@gmail.com',
      lastActive: '2025-09-14T04:07:12.119Z',
      userId: 'a139a0a6-7561-47f4-bfef-4f913031e344'
    },
    wallet: {
      address: '0x99b6e96073E410781f9aA21a28f146b951a1E7D6'
    },
    authentication: {
      message: 'Welcome to De-MAPP Memory Hub! Sign this message to verify your identity. Use panchalpriyankfullstack@gmail.com'
    },
    metadata: {
      createdAt: '2025-09-14T04:07:12.119Z',
      version: '2.0'
    }
  }
];

const mockAvaxVaultData = [];

try {
  // Initialize Firebase Admin with environment variables instead of JSON file
  const serviceAccount = {
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN
  };
  
  if (!admin.apps.length && serviceAccount.project_id) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://your-project-id-default-rtdb.firebaseio.com'
    });
    console.log('✅ Firebase Admin initialized successfully with environment variables');
  } else if (!serviceAccount.project_id) {
    throw new Error('Firebase environment variables not found');
  }
  
  db = admin.firestore();
} catch (error) {
  console.warn('⚠️ Firebase Admin initialization failed, using mock interface with your data:', error.message);
  
  // Create a enhanced mock Firestore interface for development with your actual data
  db = {
    collection: (collectionName) => ({
      where: (field, operator, value) => ({
        get: async () => {
          if (collectionName === 'users') {
            const matchingUsers = mockUsers.filter(user => {
              if (field === 'email' || field === 'profile.email') {
                return user.email === value || user.profile.email === value;
              }
              return false;
            });
            
            console.log(`🔍 Mock: Searching users by ${field} ${operator} ${value}, found ${matchingUsers.length} matches`);
            
            return {
              empty: matchingUsers.length === 0,
              docs: matchingUsers.map(user => ({
                id: user.id,
                data: () => user,
                exists: true
              }))
            };
          }
          return { empty: true, docs: [] };
        }
      }),
      doc: (docId) => ({
        set: async (data, options = {}) => {
          console.log(`📝 Mock: Would save to ${collectionName}/${docId}:`, JSON.stringify(data, null, 2));
          
          if (collectionName === 'avaxvault') {
            // Store in mock avaxvault data
            const existingIndex = mockAvaxVaultData.findIndex(item => item.id === docId);
            if (existingIndex >= 0) {
              if (options.merge) {
                mockAvaxVaultData[existingIndex] = { ...mockAvaxVaultData[existingIndex], ...data };
              } else {
                mockAvaxVaultData[existingIndex] = { id: docId, ...data };
              }
            } else {
              mockAvaxVaultData.push({ id: docId, ...data });
            }
            console.log(`💾 Mock avaxvault now has ${mockAvaxVaultData.length} entries`);
          }
          
          return { id: docId };
        },
        get: async () => {
          if (collectionName === 'avaxvault') {
            const existing = mockAvaxVaultData.find(item => item.id === docId);
            return {
              exists: !!existing,
              data: () => existing || null,
              id: docId
            };
          }
          return {
            exists: false,
            data: () => null
          };
        }
      }),
      add: async (data) => {
        const mockId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        console.log(`📝 Mock: Would add to ${collectionName} with ID ${mockId}:`, JSON.stringify(data, null, 2));
        
        if (collectionName === 'avaxvault') {
          mockAvaxVaultData.push({ id: mockId, ...data });
          console.log(`💾 Mock avaxvault now has ${mockAvaxVaultData.length} entries`);
        }
        
        return { id: mockId };
      },
      get: async () => {
        if (collectionName === 'avaxvault') {
          console.log(`📋 Mock: Getting all avaxvault data (${mockAvaxVaultData.length} entries)`);
          return {
            empty: mockAvaxVaultData.length === 0,
            docs: mockAvaxVaultData.map(item => ({
              id: item.id,
              data: () => item,
              exists: true
            }))
          };
        }
        return { empty: true, docs: [] };
      }
    })
  };
}

// Export enhanced interface
const getFirestore = () => db;

module.exports = {
  admin,
  getFirestore,
  // For debugging
  getMockData: () => ({ users: mockUsers, avaxvault: mockAvaxVaultData })
};