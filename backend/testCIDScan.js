require('dotenv').config();
const axios = require('axios');

// Test script to scan the specific CID and demonstrate the process
async function testCIDScanning() {
  console.log('🚀 Testing CID Scanning for Email: panchalpriyankfullstack@gmail.com');
  console.log('📁 Target CID: bafkr...eeccy (from Pinata screenshot)');
  
  try {
    // Test Pinata API connection
    console.log('🔍 1. Testing Pinata API connection...');
    
    const pinataJWT = process.env.PINATA_JWT;
    if (!pinataJWT) {
      throw new Error('❌ PINATA_JWT not found in environment variables');
    }
    
    // Fetch all pinned files
    console.log('📋 2. Fetching all pinned files from Pinata...');
    const response = await axios.get('https://api.pinata.cloud/data/pinList', {
      headers: {
        'Authorization': `Bearer ${pinataJWT}`
      },
      params: {
        status: 'pinned',
        pageLimit: 100
      }
    });
    
    console.log(`✅ Found ${response.data.rows.length} pinned files`);
    
    // Look for the specific file we saw in the screenshot
    const files = response.data.rows;
    let targetFile = null;
    
    // Find files that might contain our target email
    for (const file of files) {
      console.log(`📄 File: ${file.metadata?.name || 'Unknown'} - CID: ${file.ipfs_pin_hash}`);
      
      // Check if this matches the CID from screenshot (starts with bafkr)
      if (file.ipfs_pin_hash.startsWith('bafkr')) {
        targetFile = file;
        console.log(`🎯 Found potential target file: ${file.ipfs_pin_hash}`);
        break;
      }
    }
    
    if (!targetFile) {
      console.log('⚠️ Target file not found, will test with first available file');
      targetFile = files[0];
    }
    
    if (!targetFile) {
      throw new Error('❌ No files found in Pinata');
    }
    
    // Fetch content of the target file
    console.log(`📖 3. Fetching content of CID: ${targetFile.ipfs_pin_hash}`);
    const contentResponse = await axios.get(`https://gateway.pinata.cloud/ipfs/${targetFile.ipfs_pin_hash}`, {
      timeout: 10000,
      headers: { 'Accept': 'application/json' }
    });
    
    console.log('📊 File content:', JSON.stringify(contentResponse.data, null, 2));
    
    // Extract emails from content
    console.log('🔍 4. Extracting emails from content...');
    const contentStr = JSON.stringify(contentResponse.data);
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = contentStr.match(emailRegex) || [];
    
    console.log(`📧 Found emails: ${emails.join(', ')}`);
    
    // Check if our target email is found
    const targetEmail = 'panchalpriyankfullstack@gmail.com';
    const emailFound = emails.some(email => email.toLowerCase() === targetEmail.toLowerCase());
    
    if (emailFound) {
      console.log(`✅ SUCCESS! Found target email: ${targetEmail}`);
      console.log('🏗️ 5. This would trigger avaxvault creation with structure:');
      console.log(`
📦 avaxvault/${targetEmail}
├── profile (from existing user data)
├── wallet (from existing user data + secretKey)
├── metadata (updated with migration info)
└── cidFiles
    ├── totalFiles: 1
    ├── processedAt: "${new Date().toISOString()}"
    └── files: [
        {
          "cid": "${targetFile.ipfs_pin_hash}",
          "fileName": "${targetFile.metadata?.name || 'Unknown'}",
          "content": {JSON content},
          "fileSize": ${targetFile.size},
          "datePinned": "${targetFile.date_pinned}",
          "processedAt": "${new Date().toISOString()}"
        }
    ]
      `);
    } else {
      console.log(`⚠️ Target email ${targetEmail} not found in this file`);
      console.log('💡 The backend will scan all files to find matching emails');
    }
    
    console.log('🎉 Test completed successfully!');
    console.log('💡 To run full scan: POST http://localhost:3001/api/scan');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('📄 Response data:', error.response.data);
    }
  }
}

// Run the test
testCIDScanning();