# AVAX Vault Storage - Smart Contract Deployment Guide

## 📋 Quick Setup for Remix IDE

### 1. **Contract Details**
- **Contract Name**: `AvaxVaultStorage`
- **Network**: AVAX C-Chain Fuji Testnet
- **Solidity Version**: ^0.8.19
- **File**: `AvaxVaultStorage.sol`

### 2. **Deployment Steps in Remix IDE**

#### Step 1: Setup Remix
1. Go to [Remix IDE](https://remix.ethereum.org/)
2. Create new file: `AvaxVaultStorage.sol`
3. Copy the contract code from `contracts/AvaxVaultStorage.sol`

#### Step 2: Compile Contract
1. Go to "Solidity Compiler" tab
2. Set compiler version to `0.8.19` or higher
3. Click "Compile AvaxVaultStorage.sol"
4. Ensure no compilation errors

#### Step 3: Configure Network
1. Install MetaMask or Core Wallet
2. Add Avalanche Fuji Testnet:
   ```
   Network Name: Avalanche Fuji Testnet
   RPC URL: https://api.avax-test.network/ext/bc/C/rpc
   Chain ID: 43113
   Symbol: AVAX
   Block Explorer: https://testnet.snowtrace.io/
   ```

#### Step 4: Get Test AVAX
1. Go to [Avalanche Faucet](https://faucet.avax.network/)
2. Request test AVAX for your wallet address
3. Wait for confirmation (usually 1-2 minutes)

#### Step 5: Deploy Contract
1. Go to "Deploy & Run Transactions" tab
2. Select Environment: "Injected Provider - MetaMask"
3. Select Contract: "AvaxVaultStorage"
4. Click "Deploy"
5. Confirm transaction in wallet (small gas fee ~0.001 AVAX)
6. Wait for deployment confirmation

#### Step 6: Save Contract Details
After successful deployment, save:
- **Contract Address**: `0x...` (copy from Remix)
- **Transaction Hash**: From block explorer
- **ABI**: Copy from Remix compilation artifacts

### 3. **Contract Functions**

#### Main Functions:
- `storeUserData(name, email, hashId, cid)` - Store user data
- `getUserData(address)` - Get user data by address
- `getUserDataByEmail(email)` - Get user data by email
- `getMyData()` - Get caller's data
- `updateUserData(name, hashId, cid)` - Update existing data

#### View Functions:
- `userExists(address)` - Check if user exists
- `isEmailRegistered(email)` - Check if email is registered
- `getContractStats()` - Get contract statistics

### 4. **Integration Constants**

```javascript
// AVAX Fuji Testnet Configuration
export const AVAX_CONFIG = {
  chainId: 43113,
  chainName: 'Avalanche Fuji Testnet',
  rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
  nativeCurrency: {
    name: 'AVAX',
    symbol: 'AVAX',
    decimals: 18
  },
  blockExplorerUrls: ['https://testnet.snowtrace.io/']
};

// Contract Configuration (Update after deployment)
export const CONTRACT_CONFIG = {
  address: 'YOUR_DEPLOYED_CONTRACT_ADDRESS',
  abi: [...], // Copy from Remix compilation artifacts
  network: 'fuji'
};
```

### 5. **Gas Estimation**
- **Deployment**: ~0.001-0.003 AVAX
- **Store Data**: ~0.0001-0.0003 AVAX per transaction
- **Read Data**: Free (view functions)
- **Update Data**: ~0.0001-0.0002 AVAX per transaction

### 6. **Security Features**
- ✅ Email uniqueness validation
- ✅ Data existence checks
- ✅ Input validation
- ✅ Access control for admin functions
- ✅ Event logging for transparency
- ✅ Gas optimization

### 7. **Testing After Deployment**

#### Test Transaction:
```javascript
// Example function call
await contract.storeUserData(
  "John Doe",
  "john@example.com", 
  "hash123abc",
  "QmXxxxYyy..."
);
```

#### Verify on Explorer:
1. Go to [Fuji Explorer](https://testnet.snowtrace.io/)
2. Search your contract address
3. Check contract interactions
4. Verify transaction history

### 8. **Common Issues & Solutions**

**Issue**: Transaction fails
- **Solution**: Ensure sufficient AVAX balance, check gas limits

**Issue**: Email already registered error
- **Solution**: Each email can only be registered once per address

**Issue**: Network connection issues
- **Solution**: Verify Fuji testnet configuration in wallet

### 9. **Next Steps After Deployment**
1. Copy contract address and ABI
2. Update frontend configuration
3. Test contract functions
4. Integrate with Core Wallet
5. Implement transaction monitoring

---

## 🚀 Ready for Production Integration!

Once deployed, this contract will:
- Store user data on AVAX blockchain
- Provide transparent transaction history
- Enable decentralized data verification
- Support micro-transactions with minimal fees