# AVAX Smart Contract Deployment Guide (Remix IDE)

## Overview
This guide will help you deploy the DataStorage smart contract to Avalanche Fuji Testnet using Remix IDE and integrate it with your application.

## Prerequisites

### 1. Wallet Setup
- Install [Core Wallet](https://core.app/) browser extension
- Create a new wallet or import existing one
- Switch to Avalanche Fuji Testnet
- Get testnet AVAX from [Avalanche Faucet](https://faucet.avax.network/)

### 2. Remix IDE Setup
- Open [Remix IDE](https://remix.ethereum.org/)
- Install "File Manager" and "Solidity Compiler" plugins
- Install "Deploy & Run Transactions" plugin

## Deployment Steps

### Step 1: Prepare Smart Contract

1. **Open Remix IDE** at https://remix.ethereum.org/
2. **Create new file**: `DataStorage.sol` in the contracts folder
3. **Copy contract code** from `contracts/DataStorage.sol` in this project
4. **Install OpenZeppelin**: 
   - Go to File Manager
   - Click "Import from GitHub"
   - Import: `@openzeppelin/contracts/access/Ownable.sol`
   - Import: `@openzeppelin/contracts/security/ReentrancyGuard.sol`

### Step 2: Compile Contract

1. **Go to Solidity Compiler tab**
2. **Select compiler version**: 0.8.19 or higher
3. **Select contract**: DataStorage.sol
4. **Click "Compile DataStorage.sol"**
5. **Verify**: Green checkmark appears on compiler tab

### Step 3: Configure Avalanche Network

1. **Go to "Deploy & Run Transactions" tab**
2. **Environment**: Select "Injected Provider - MetaMask"
3. **Connect Core Wallet** when prompted
4. **Verify network**: Should show Avalanche Fuji Testnet (Chain ID: 43113)
5. **Check balance**: Ensure you have at least 0.1 AVAX for deployment

**If Fuji network not available:**
- Open Core Wallet
- Go to Settings → Networks
- Add custom network:
  - Network Name: Avalanche Fuji Testnet
  - RPC URL: https://api.avax-test.network/ext/bc/C/rpc
  - Chain ID: 43113
  - Symbol: AVAX
  - Explorer: https://testnet.snowtrace.io/

### Step 4: Deploy Contract

1. **Select contract**: DataStorage from dropdown
2. **Check gas limit**: Should auto-calculate (usually 2-3M gas)
3. **Click "Deploy" button**
4. **Confirm transaction** in Core Wallet
5. **Wait for confirmation**: Usually 2-3 seconds

### Step 5: Verify Deployment

After successful deployment, you'll see:
- ✅ **Contract Address**: Copy this address
- ✅ **Transaction Hash**: Copy this hash
- ✅ **Deployed Contracts section**: Shows your contract instance

**Get ABI:**
1. Go to Solidity Compiler tab
2. Click on DataStorage contract
3. Scroll down to "Compilation Details"
4. Copy the entire ABI JSON

### Step 6: Test Contract Functions

In Remix "Deploy & Run Transactions":

1. **Test getContractInfo()**: Should return contract details
2. **Test storagePrice()**: Should return 10000000000000000 (0.01 AVAX in wei)
3. **Test owner()**: Should return your wallet address

## Integration with Your App

### Required Information
After deployment, you'll have:
```javascript
const CONTRACT_ADDRESS = "0x..."; // From Remix deployment
const TRANSACTION_HASH = "0x..."; // From deployment transaction
const CONTRACT_ABI = [ /* ABI JSON from Remix */ ];
```

### Update avaxTransactionService.js
Replace the placeholders in your service file:

```javascript
// Replace these values with your deployment details
const CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS_HERE";
const CONTRACT_ABI = YOUR_ABI_JSON_HERE;
```

## Verification on Snowtrace

1. **Visit Snowtrace**: https://testnet.snowtrace.io/
2. **Search contract address**: Paste your contract address
3. **Verify contract source**:
   - Click "Contract" tab
   - Click "Verify and Publish"
   - Select "Single File"
   - Paste your Solidity code
   - Set compiler version to match Remix
   - Verify

## Testing the Integration

### 1. Frontend Connection Test
- Open your application
- Navigate to dashboard with CIDs
- Click "Store to AVAX" button
- Verify Core Wallet opens for transaction

### 2. Complete Transaction Flow
- Select a CID to store
- Approve 0.01 AVAX transaction
- Monitor transaction status
- Verify data stored on blockchain

### 3. Verify on Snowtrace
- Check transaction history
- Verify contract interactions
- View stored data events

## Troubleshooting

### Common Issues

#### 1. "Gas estimation failed"
- Increase gas limit manually
- Check wallet has sufficient AVAX
- Verify network connection

#### 2. "Transaction reverted"
- Check storage fee (0.01 AVAX minimum)
- Ensure CID doesn't already exist
- Verify valid input parameters

#### 3. "MetaMask/Core Wallet not detected"
- Refresh Remix page
- Reconnect wallet
- Check if wallet is unlocked

#### 4. "Wrong network"
- Switch to Avalanche Fuji in wallet
- Refresh Remix
- Reconnect wallet

### Debug Commands in Remix Console
```javascript
// Check contract balance
await dataStorage.getContractBalance()

// Get contract stats
await dataStorage.getContractStats()

// Check if CID exists
await dataStorage.checkCidExists("your-cid-here")
```

## Production Deployment

### For Mainnet:
1. Get real AVAX for deployment
2. Switch to Avalanche Mainnet in Core Wallet
3. Use Mainnet RPC: https://api.avax.network/ext/bc/C/rpc
4. Deploy same contract to mainnet
5. Update service with mainnet contract address

## Next Steps After Deployment

1. **Update Configuration**: Add contract details to avaxTransactionService.js
2. **Test Integration**: Verify complete user flow works
3. **Monitor Usage**: Check contract interactions on Snowtrace
4. **Optimize Gas**: Monitor gas usage and optimize if needed

## Support Resources

- [Remix Documentation](https://remix-ide.readthedocs.io/)
- [Avalanche Developer Docs](https://docs.avax.network/)
- [Core Wallet Guide](https://core.app/en/support/)
- [Testnet Snowtrace](https://testnet.snowtrace.io/)

---

**Ready to Deploy?** 
1. Open Remix IDE
2. Copy the DataStorage.sol contract
3. Follow the steps above
4. Send me the contract address, hash, and ABI when deployed!