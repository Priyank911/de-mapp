const axios = require('axios');

class PinataService {
  constructor() {
    this.apiKey = process.env.PINATA_API_KEY;
    this.apiSecret = process.env.PINATA_API_SECRET;
    this.jwt = process.env.PINATA_JWT;
    this.baseUrl = 'https://api.pinata.cloud';
    this.gatewayUrl = 'https://gateway.pinata.cloud/ipfs';
  }

  // Get all pinned files from Pinata
  async getAllPinnedFiles() {
    try {
      console.log('🔍 Fetching all pinned files from Pinata...');
      
      const response = await axios.get(`${this.baseUrl}/data/pinList`, {
        headers: {
          'Authorization': `Bearer ${this.jwt}`
        },
        params: {
          status: 'pinned',
          pageLimit: 1000, // Get up to 1000 files
          metadata: {
            name: '',
            keyvalues: {}
          }
        }
      });

      console.log(`✅ Found ${response.data.rows.length} pinned files`);
      return response.data.rows;
    } catch (error) {
      console.error('❌ Error fetching pinned files:', error.response?.data || error.message);
      throw new Error('Failed to fetch pinned files from Pinata');
    }
  }

  // Fetch content of a specific CID
  async fetchCIDContent(cid) {
    try {
      console.log(`📁 Fetching content for CID: ${cid}`);
      
      const response = await axios.get(`${this.gatewayUrl}/${cid}`, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Accept': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching CID ${cid}:`, error.response?.status || error.message);
      throw new Error(`Failed to fetch content for CID: ${cid}`);
    }
  }

  // Get JSON files only (filter by content type or file extension)
  async getJSONFiles() {
    try {
      const allFiles = await this.getAllPinnedFiles();
      
      // Filter for JSON files
      const jsonFiles = allFiles.filter(file => {
        const metadata = file.metadata;
        const mimeType = metadata?.mimeType || '';
        const name = metadata?.name || '';
        
        return (
          mimeType.includes('application/json') ||
          name.toLowerCase().endsWith('.json') ||
          file.mime_type === 'application/json'
        );
      });

      console.log(`📄 Found ${jsonFiles.length} JSON files out of ${allFiles.length} total files`);
      return jsonFiles;
    } catch (error) {
      console.error('❌ Error filtering JSON files:', error.message);
      throw error;
    }
  }

  // Scan all JSON files for user emails
  async scanAllJSONFilesForEmails() {
    try {
      console.log('🔎 Starting comprehensive scan of all JSON files...');
      
      const jsonFiles = await this.getJSONFiles();
      const emailResults = [];

      for (const file of jsonFiles) {
        try {
          console.log(`📋 Scanning file: ${file.metadata?.name || file.ipfs_pin_hash}`);
          
          const content = await this.fetchCIDContent(file.ipfs_pin_hash);
          const emails = this.extractEmailsFromContent(content);
          
          if (emails.length > 0) {
            emailResults.push({
              cid: file.ipfs_pin_hash,
              fileName: file.metadata?.name || 'Unknown',
              emails: emails,
              fileSize: file.size,
              datePinned: file.date_pinned,
              metadata: file.metadata
            });
            
            console.log(`✅ Found ${emails.length} email(s) in ${file.metadata?.name || file.ipfs_pin_hash}`);
          }
        } catch (fileError) {
          console.warn(`⚠️ Skipped file ${file.ipfs_pin_hash}: ${fileError.message}`);
          continue;
        }
      }

      console.log(`🎯 Scan complete! Found emails in ${emailResults.length} files`);
      return emailResults;
    } catch (error) {
      console.error('❌ Error during email scanning:', error.message);
      throw error;
    }
  }

  // Extract email addresses from JSON content (focus on first 4 lines)
  extractEmailsFromContent(content) {
    const emails = new Set();
    
    try {
      // Convert content to string for searching
      const contentStr = JSON.stringify(content, null, 2);
      
      // Split into lines and focus on first 4 lines for email extraction
      const lines = contentStr.split('\n');
      const firstFourLines = lines.slice(0, 4).join('\n');
      
      console.log('🔍 Scanning first 4 lines for emails:');
      console.log(firstFourLines);
      
      // Regex pattern for email addresses
      const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
      
      // Check first 4 lines first (priority)
      const firstLinesMatches = firstFourLines.match(emailRegex);
      if (firstLinesMatches) {
        firstLinesMatches.forEach(email => {
          emails.add(email.toLowerCase());
          console.log(`📧 Found email in first 4 lines: ${email}`);
        });
      }
      
      // Also check full content as fallback
      const fullMatches = contentStr.match(emailRegex);
      if (fullMatches) {
        fullMatches.forEach(email => emails.add(email.toLowerCase()));
      }

      // Also check for specific email field in JSON structure
      this.searchForEmailFields(content, emails);
      
    } catch (error) {
      console.warn('⚠️ Error extracting emails from content:', error.message);
    }
    
    return Array.from(emails);
  }

  // Recursively search for email fields in JSON objects
  searchForEmailFields(obj, emails) {
    if (typeof obj !== 'object' || obj === null) return;
    
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        // Check if key suggests it's an email field
        if (key.toLowerCase().includes('email') || key.toLowerCase().includes('mail')) {
          const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
          if (emailRegex.test(obj[key])) {
            emails.add(obj[key].toLowerCase());
          }
        }
      } else if (typeof obj[key] === 'object') {
        this.searchForEmailFields(obj[key], emails);
      }
    }
  }

  // Get file metadata
  async getFileMetadata(cid) {
    try {
      const allFiles = await this.getAllPinnedFiles();
      return allFiles.find(file => file.ipfs_pin_hash === cid);
    } catch (error) {
      console.error(`❌ Error getting metadata for CID ${cid}:`, error.message);
      return null;
    }
  }
}

module.exports = PinataService;