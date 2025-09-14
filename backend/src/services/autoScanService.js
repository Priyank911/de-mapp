const AvaxVaultService = require('./avaxVaultService');

class AutoScanService {
  constructor() {
    this.avaxVaultService = new AvaxVaultService();
    this.scanInterval = null;
    this.isScanning = false;
    this.scanIntervalMinutes = 2; // Scan every 2 minutes
  }

  // Start auto-scanning
  startAutoScan() {
    console.log('🚀 Starting auto-scan service...');
    console.log(`⏰ Will scan every ${this.scanIntervalMinutes} minutes`);
    
    // Run initial scan immediately
    this.performScan();
    
    // Set up recurring scans
    this.scanInterval = setInterval(() => {
      this.performScan();
    }, this.scanIntervalMinutes * 60 * 1000); // Convert minutes to milliseconds
    
    console.log('✅ Auto-scan service started successfully');
  }

  // Stop auto-scanning
  stopAutoScan() {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
      console.log('🛑 Auto-scan service stopped');
    }
  }

  // Perform a single scan
  async performScan() {
    if (this.isScanning) {
      console.log('⏳ Scan already in progress, skipping...');
      return;
    }

    try {
      this.isScanning = true;
      const timestamp = new Date().toISOString();
      
      console.log('🔄 ========================================');
      console.log(`🔄 AUTO-SCAN STARTED: ${timestamp}`);
      console.log('🔄 ========================================');
      
      const startTime = Date.now();
      const results = await this.avaxVaultService.scanAndProcessFiles();
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      
      console.log('📊 ========================================');
      console.log('📊 SCAN RESULTS:');
      console.log(`⏱️ Duration: ${duration} seconds`);
      console.log(`📧 Emails found: ${results.results?.length || 0} files with emails`);
      console.log(`👥 Matching users: ${results.matchingUsers?.length || 0}`);
      console.log(`💾 Processed: ${results.processed || 0} avaxvault entries`);
      console.log('📊 ========================================');
      
      if (results.processedResults && results.processedResults.length > 0) {
        console.log('✅ Successfully processed users:');
        results.processedResults.forEach(result => {
          console.log(`   - ${result.email} (${result.cidFiles} CID files)`);
        });
      }
      
      return results;
      
    } catch (error) {
      console.error('❌ Auto-scan failed:', error.message);
      console.error('Stack:', error.stack);
    } finally {
      this.isScanning = false;
      console.log('🔄 Auto-scan cycle completed\n');
    }
  }

  // Get scan status
  getStatus() {
    return {
      isActive: this.scanInterval !== null,
      isScanning: this.isScanning,
      intervalMinutes: this.scanIntervalMinutes,
      nextScanIn: this.scanInterval ? 
        `${this.scanIntervalMinutes} minutes` : 'Not scheduled'
    };
  }

  // Manual trigger for testing
  async triggerManualScan() {
    console.log('🔧 Manual scan triggered...');
    return await this.performScan();
  }

  // Set scan interval
  setScanInterval(minutes) {
    this.scanIntervalMinutes = minutes;
    
    if (this.scanInterval) {
      // Restart with new interval
      this.stopAutoScan();
      this.startAutoScan();
    }
    
    console.log(`⏰ Scan interval updated to ${minutes} minutes`);
  }
}

module.exports = AutoScanService;