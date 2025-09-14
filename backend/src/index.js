require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Import routes and services
const cidRoutes = require('./routes/cidRoutes');
const AutoScanService = require('./services/autoScanService');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Initialize auto-scan service
const autoScanService = new AutoScanService();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS for all routes
app.use(morgan('combined')); // Logging
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Routes
app.use('/api', cidRoutes);

// Auto-scan routes
app.post('/api/auto-scan/start', (req, res) => {
  try {
    autoScanService.startAutoScan();
    res.json({
      success: true,
      message: 'Auto-scan service started',
      status: autoScanService.getStatus()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to start auto-scan',
      error: error.message
    });
  }
});

app.post('/api/auto-scan/stop', (req, res) => {
  try {
    autoScanService.stopAutoScan();
    res.json({
      success: true,
      message: 'Auto-scan service stopped',
      status: autoScanService.getStatus()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to stop auto-scan',
      error: error.message
    });
  }
});

app.get('/api/auto-scan/status', (req, res) => {
  res.json({
    success: true,
    message: 'Auto-scan status retrieved',
    status: autoScanService.getStatus()
  });
});

app.post('/api/auto-scan/trigger', async (req, res) => {
  try {
    const results = await autoScanService.triggerManualScan();
    res.json({
      success: true,
      message: 'Manual scan completed',
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Manual scan failed',
      error: error.message
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'DEmapp CID Scanner Backend API with Auto-Scan',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    autoScanStatus: autoScanService.getStatus(),
    endpoints: {
      'POST /api/scan': 'Manual scan of all CID files',
      'POST /api/auto-scan/start': 'Start automatic scanning',
      'POST /api/auto-scan/stop': 'Stop automatic scanning',
      'POST /api/auto-scan/trigger': 'Trigger manual scan',
      'GET /api/auto-scan/status': 'Get auto-scan status',
      'GET /api/avaxvault': 'Get all avaxvault data',
      'GET /api/avaxvault/:userId': 'Get avaxvault data for specific user',
      'GET /api/status': 'Health check endpoint'
    }
  });
});

// Health check endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'Backend server is running',
    timestamp: new Date().toISOString(),
    autoScanStatus: autoScanService.getStatus()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    availableEndpoints: {
      'POST /api/scan': 'Manual scan of all CID files',
      'POST /api/auto-scan/start': 'Start automatic scanning',
      'POST /api/auto-scan/stop': 'Stop automatic scanning',
      'POST /api/auto-scan/trigger': 'Trigger manual scan',
      'GET /api/auto-scan/status': 'Get auto-scan status',
      'GET /api/avaxvault': 'Get all avaxvault data',
      'GET /api/avaxvault/:userId': 'Get avaxvault data for specific user',
      'GET /api/status': 'Health check endpoint'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 ========================================');
  console.log('🚀   DEmapp CID Scanner Backend API');
  console.log('🚀 ========================================');
  console.log(`🌐 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Base URL: http://localhost:${PORT}`);
  console.log(`⏰ Auto-scan service: ${autoScanService.getStatus().isRunning ? 'ACTIVE' : 'INACTIVE'}`);
  console.log('🚀 ========================================');
  console.log('📋 Available endpoints:');
  console.log(`   POST http://localhost:${PORT}/api/scan`);
  console.log(`   POST http://localhost:${PORT}/api/auto-scan/start`);
  console.log(`   POST http://localhost:${PORT}/api/auto-scan/stop`);
  console.log(`   POST http://localhost:${PORT}/api/auto-scan/trigger`);
  console.log(`   GET  http://localhost:${PORT}/api/auto-scan/status`);
  console.log(`   GET  http://localhost:${PORT}/api/avaxvault`);
  console.log(`   GET  http://localhost:${PORT}/api/avaxvault/:userId`);
  console.log(`   GET  http://localhost:${PORT}/api/status`);
  console.log('🚀 ========================================');
  
  // Start auto-scan service automatically
  console.log('⏰ Starting auto-scan service automatically...');
  autoScanService.startAutoScan();
});

module.exports = app;