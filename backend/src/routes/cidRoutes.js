const express = require('express');
const AvaxVaultService = require('../services/avaxVaultService');

const router = express.Router();
const avaxVaultService = new AvaxVaultService();

// POST /api/scan - Scan all CID files and process matching users
router.post('/scan', async (req, res) => {
  try {
    console.log('🚀 Starting CID scan process...');
    
    const startTime = Date.now();
    const results = await avaxVaultService.scanAndProcessFiles();
    const endTime = Date.now();
    
    console.log(`⏱️ Scan completed in ${(endTime - startTime) / 1000} seconds`);
    
    res.json({
      success: true,
      message: 'CID scan and processing completed',
      processingTime: `${(endTime - startTime) / 1000} seconds`,
      data: results
    });
    
  } catch (error) {
    console.error('❌ Error in scan endpoint:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to scan and process CID files',
      error: error.message
    });
  }
});

// GET /api/avaxvault - Get all avaxvault data
router.get('/avaxvault', async (req, res) => {
  try {
    console.log('📋 Fetching all avaxvault data...');
    
    const data = await avaxVaultService.getAllAvaxVaultData();
    
    res.json({
      success: true,
      message: 'Avaxvault data retrieved successfully',
      count: data.length,
      data: data
    });
    
  } catch (error) {
    console.error('❌ Error in avaxvault endpoint:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve avaxvault data',
      error: error.message
    });
  }
});

// GET /api/avaxvault/:userId - Get avaxvault data for specific user
router.get('/avaxvault/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`👤 Fetching avaxvault data for user: ${userId}`);
    
    const data = await avaxVaultService.getAvaxVaultData(userId);
    
    if (data) {
      res.json({
        success: true,
        message: 'User avaxvault data retrieved successfully',
        userId: userId,
        data: data
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'No avaxvault data found for this user',
        userId: userId
      });
    }
    
  } catch (error) {
    console.error(`❌ Error fetching user ${req.params.userId}:`, error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user avaxvault data',
      error: error.message
    });
  }
});

// GET /api/status - Health check endpoint
router.get('/status', (req, res) => {
  res.json({
    success: true,
    message: 'CID Scanner API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

module.exports = router;