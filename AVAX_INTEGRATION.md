# AVAX Blockchain Integration Documentation

## Overview
Complete blockchain integration system for storing user data on Avalanche Fuji Testnet with automatic scanning, Firebase integration, and transaction tracking.

## 🚀 Deployed Contract Information

### Contract Details
- **Contract Address**: `0x6afd10e0b2e11784aabb298105e23d2e68add687`
- **Transaction Hash**: `0xc65d3d56138e4253cb15f489ce6a6b9f04bca81ce1a7077789ce75a35b5fb3e1`
- **Block Hash**: `0x7ad3f33ce3a88bdd1d88d0d8fa2052ff627a7688070eb1467a8a050cc1c31b66`
- **Network**: Avalanche Fuji Testnet (Chain ID: 43113 / 0xA869)
- **Explorer**: https://testnet.snowtrace.io

### Contract Functions
- `createVault()`: Creates individual vault for users
- `getDeployedVaults()`: Gets all deployed vaults
- `getUserVaults(address)`: Gets vaults for specific user

## 🏗️ System Architecture

### 1. Auto-Scan Service (`backend/src/autoScanService.js`)
- **Purpose**: Automatically scans Pinata every 2 minutes
- **Triggers**: Creates avaxvault entries when matching emails found
- **Integration**: Works with Firebase Firestore for data storage

### 2. AVAX Transaction Service (`src/services/avaxTransactionService.js`)
- **Purpose**: Handles blockchain interactions and wallet connections
- **Features**:
  - Core Wallet / MetaMask detection
  - Network switching to Fuji Testnet
  - Vault creation on blockchain
  - Transaction storage in Firestore

### 3. Dynamic Frontend (`src/components/DashboardPrivateSection.jsx`)
- **Purpose**: Shows user data and handles AVAX uploads
- **Features**:
  - Light theme for new conversations
  - Real-time transaction status
  - Snowtrace links for transaction viewing
  - Loading states and error handling

## 📊 Data Flow

### 1. Detection Phase
```
Auto-Scan Service → Pinata Files → Email Extraction → Firestore (avaxvault)
```

### 2. Upload Phase
```
User Click → Wallet Connect → Create Vault → Store Data → Firestore (avaxTransactions)
```

### 3. Display Phase
```
Firestore → Frontend → Transaction Status → Snowtrace Link
```

## 🔧 Configuration

### Environment Variables
```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id

# AVAX Network Configuration (Already configured)
AVAX_CONTRACT_ADDRESS=0x6afd10e0b2e11784aabb298105e23d2e68add687
AVAX_NETWORK_CHAIN_ID=0xA869
AVAX_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
```

### Firestore Collections

#### `avaxvault` Collection
```json
{
  "userId": "user123",
  "userData": {
    "name": "John Doe",
    "email": "john@example.com",
    "files": [...]
  },
  "metadata": {
    "createdAt": "2025-09-14T...",
    "lastUpdated": "2025-09-14T..."
  }
}
```

#### `avaxTransactions` Collection
```json
{
  "transactionHash": "0xabc123...",
  "walletAddress": "0x456def...",
  "network": "fuji-testnet",
  "status": "completed",
  "userData": {
    "name": "John Doe",
    "email": "john@example.com",
    "hashId": "hash_1726344123",
    "cid": "QmABC123..."
  },
  "sessionData": {
    "sessionId": "session_123",
    "sessionName": "Memory Session",
    "cid": "QmXYZ789...",
    "emails": ["john@example.com"],
    "fileSize": "2.4 MB"
  },
  "chainId": "0xA869",
  "explorerUrl": "https://testnet.snowtrace.io/tx/0xabc123...",
  "timestamp": "2025-09-14T..."
}
```

## 🎯 User Flow

### For New Conversations
1. **Auto-Detection**: Auto-scan service detects new CID files
2. **Light Theme**: UI shows new conversation in light theme
3. **Upload Ready**: "AVAX Upload" button becomes available
4. **One-Click Upload**: User clicks button to start blockchain upload

### For AVAX Upload Process
1. **Wallet Connection**: System connects to Core Wallet/MetaMask
2. **Network Check**: Switches to Fuji Testnet if needed
3. **Vault Creation**: Creates new vault on blockchain
4. **Data Storage**: Stores user data (name, email, hashId, CID)
5. **Transaction Recording**: Saves transaction details to Firestore
6. **Status Display**: Shows transaction status and Snowtrace link

## 🔍 Transaction Status States

### UI Status Indicators
- **🔄 Preparing**: Setting up transaction
- **💳 Wallet**: Connecting to wallet
- **✅ Completed**: Transaction successful with Snowtrace link
- **❌ Failed**: Error with detailed message

### Transaction Storage
- All transactions (successful and failed) are stored
- Failed transactions include error messages
- Successful transactions include explorer URLs

## 🌐 Blockchain Network Details

### Avalanche Fuji Testnet
- **Chain ID**: 43113 (0xA869)
- **RPC URL**: https://api.avax-test.network/ext/bc/C/rpc
- **Explorer**: https://testnet.snowtrace.io
- **Currency**: AVAX (testnet)
- **Gas Price**: ~20 gwei

### Contract Interaction
- **Method**: `createVault()`
- **Gas Limit**: 2,000,000
- **Returns**: Transaction hash and vault address
- **Events**: `VaultCreated` event with creator and vault address

## 🧪 Testing

### Manual Testing Steps
1. **Start Backend**: `cd backend && npm start`
2. **Start Frontend**: `npm run dev`
3. **Upload Test File**: Add file to Pinata with email in first 4 lines
4. **Wait for Scan**: Auto-scan will detect and create avaxvault
5. **Check Frontend**: New conversation should appear in light theme
6. **Test Upload**: Click "AVAX Upload" and follow wallet prompts
7. **Verify Transaction**: Check Snowtrace link for confirmation

### Using Test Utilities
```javascript
import blockchainTest from './utils/blockchainTest';

// Run all tests
const results = await blockchainTest.runAllTests();

// Test specific functions
const walletConnected = await blockchainTest.testWalletConnection();
const mockTx = blockchainTest.generateMockTransaction();
```

## 🔧 Troubleshooting

### Common Issues

#### "No wallet detected"
- **Solution**: Install Core Wallet or MetaMask extension
- **Check**: `window.ethereum` should be available

#### "Wrong network"
- **Solution**: System automatically switches to Fuji Testnet
- **Manual**: Add network details to wallet

#### "Transaction failed"
- **Check**: Sufficient AVAX balance for gas fees
- **Check**: Network connection and RPC availability
- **Check**: Contract address is correct

#### "Auto-scan not working"
- **Check**: Backend server is running
- **Check**: Pinata API credentials are valid
- **Check**: Firebase connection is established

### Debug Commands
```bash
# Check backend logs
cd backend && npm start

# Test wallet connection
console.log(window.ethereum)

# Check transaction service
import avaxTransactionService from './services/avaxTransactionService'
console.log(avaxTransactionService.contractConfig)
```

## 📈 Success Metrics

### What Success Looks Like
✅ Auto-scan detects new files every 2 minutes  
✅ Light theme appears for new conversations  
✅ AVAX upload connects to wallet successfully  
✅ Transaction appears on Snowtrace  
✅ Transaction data stored in Firestore  
✅ Status updates show in real-time  
✅ Explorer links work correctly  

### Expected Performance
- **Auto-scan interval**: Every 2 minutes
- **Wallet connection**: < 5 seconds
- **Transaction confirmation**: 2-10 seconds on Fuji
- **UI updates**: Real-time via Firebase listeners

## 🚀 Next Steps

### Potential Enhancements
1. **Gas Optimization**: Implement gas estimation
2. **Batch Uploads**: Handle multiple sessions at once
3. **Transaction History**: Full transaction management UI
4. **Mainnet Deployment**: Move to production Avalanche network
5. **Advanced Vault Features**: Additional vault functionality

### Monitoring
- Transaction success rates
- Gas usage optimization
- User adoption metrics
- Auto-scan efficiency