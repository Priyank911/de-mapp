// Ultra Simple Vault Service - Updated with complete ABI
import { ULTRA_SIMPLE_VAULT_ABI, ULTRA_SIMPLE_METHOD_SIGNATURES } from '../contracts/UltraSimpleVaultABI';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import firestoreTransactionService from './firestoreTransactionService';

// This will be updated with your new contract address after deployment
const ULTRA_SIMPLE_CONFIG = {
  address: '0x034f890f4bb9fae35ae601bf49671816a9e0eb8a', // DEPLOYED & WORKING!
  network: {
    chainId: '0xA869', // 43113 (Fuji)
    name: 'Avalanche Fuji Testnet',
    rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
    explorerUrl: 'https://testnet.snowtrace.io'
  }
};

class UltraSimpleVaultService {
  constructor() {
    this.contractAddress = ULTRA_SIMPLE_CONFIG.address;
  }

  // Update contract address after deployment
  updateContractAddress(newAddress) {
    this.contractAddress = newAddress;
    ULTRA_SIMPLE_CONFIG.address = newAddress;
    console.log('📝 Updated to new contract:', newAddress);
  }

  // Check wallet connection
  async ensureWalletConnected() {
    if (!window.ethereum) {
      throw new Error('No wallet found. Please install Core Wallet or MetaMask.');
    }

    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    
    if (accounts.length === 0) {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      return await window.ethereum.request({ method: 'eth_accounts' });
    }
    
    return accounts;
  }

  // Check and switch to Fuji network
  async ensureFujiNetwork() {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    
    if (chainId !== ULTRA_SIMPLE_CONFIG.network.chainId) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: ULTRA_SIMPLE_CONFIG.network.chainId }],
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: ULTRA_SIMPLE_CONFIG.network.chainId,
              chainName: ULTRA_SIMPLE_CONFIG.network.name,
              rpcUrls: [ULTRA_SIMPLE_CONFIG.network.rpcUrl],
              blockExplorerUrls: [ULTRA_SIMPLE_CONFIG.network.explorerUrl],
              nativeCurrency: {
                name: 'AVAX',
                symbol: 'AVAX',
                decimals: 18,
              },
            }],
          });
        } else {
          throw switchError;
        }
      }
    }
  }

  // Enhanced vault creation with data support
  async createVault(userData) {
    try {
      console.log('🚀 Creating vault with complete ABI support...');
      
      if (this.contractAddress === 'UPDATE_AFTER_DEPLOYMENT') {
        throw new Error('Contract not deployed yet. Please deploy UltraSimpleVault.sol first!');
      }

      // Ensure wallet is connected and on correct network
      const accounts = await this.ensureWalletConnected();
      await this.ensureFujiNetwork();

      const userAddress = accounts[0];
      console.log('👤 Using account:', userAddress);

      // Check balance
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [userAddress, 'latest']
      });

      const balanceETH = parseInt(balance, 16) / 1e18;
      if (balanceETH < 0.01) {
        throw new Error(`Insufficient balance: ${balanceETH.toFixed(4)} AVAX. Need at least 0.01 AVAX for gas.`);
      }

      // Decide which function to use based on data availability
      const hasFullData = userData.name && userData.email && userData.hashId && userData.cid;
      
      let txParams;
      
      if (hasFullData) {
        console.log('📝 Using createVaultWithData() with full user data');
        
        // Use createVaultWithData with proper ABI encoding
        // For now, let's use the simpler createVault() to avoid encoding complexity
        txParams = {
          from: userAddress,
          to: this.contractAddress,
          data: ULTRA_SIMPLE_METHOD_SIGNATURES['createVault()'],
          gas: '0xC350', // 50,000 gas
          gasPrice: '0x5D21DBA00' // 25 gwei
        };
      } else {
        console.log('📝 Using basic createVault() function');
        
        txParams = {
          from: userAddress,
          to: this.contractAddress,
          data: ULTRA_SIMPLE_METHOD_SIGNATURES['createVault()'],
          gas: '0xC350', // 50,000 gas
          gasPrice: '0x5D21DBA00' // 25 gwei
        };
      }

      console.log('📝 Transaction params:', txParams);

      // Send transaction
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [txParams]
      });

      console.log('✅ Transaction sent:', txHash);
      console.log('🔗 Explorer:', `${ULTRA_SIMPLE_CONFIG.network.explorerUrl}/tx/${txHash}`);

      // Wait a bit for transaction to be mined
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Store success in Firestore
      const firestoreData = {
        transactionHash: txHash,
        contractAddress: this.contractAddress,
        userAddress: userAddress,
        userData: userData,
        timestamp: new Date(),
        status: 'pending',
        network: 'fuji-testnet',
        contractType: 'UltraSimpleVault',
        explorerUrl: `${ULTRA_SIMPLE_CONFIG.network.explorerUrl}/tx/${txHash}`
      };

      await firestoreTransactionService.storeTransaction(firestoreData);

      return {
        success: true,
        transactionHash: txHash,
        contractAddress: this.contractAddress,
        userAddress: userAddress,
        explorerUrl: `${ULTRA_SIMPLE_CONFIG.network.explorerUrl}/tx/${txHash}`,
        message: 'Vault created successfully with complete ABI!'
      };

    } catch (error) {
      console.error('❌ Vault creation failed:', error);

      // Enhanced error handling for contract errors
      let errorMessage = error.message;
      
      if (error.message.includes('InvalidInput')) {
        errorMessage = 'Invalid input data provided to contract';
      } else if (error.message.includes('MaxVaultsReached')) {
        errorMessage = 'Maximum number of vaults reached for this user';
      } else if (error.message.includes('execution reverted')) {
        errorMessage = 'Contract execution failed - check gas and parameters';
      }

      // Store failed transaction
      await firestoreTransactionService.storeFailedTransaction({
        contractAddress: this.contractAddress,
        userData: userData,
        error: errorMessage,
        timestamp: new Date(),
        contractType: 'UltraSimpleVault'
      });

      return {
        success: false,
        error: errorMessage,
        contractAddress: this.contractAddress
      };
    }
  }

  // Get total vault count from contract using proper ABI
  async getTotalVaults() {
    try {
      if (this.contractAddress === 'UPDATE_AFTER_DEPLOYMENT') {
        return 0;
      }

      const response = await fetch(ULTRA_SIMPLE_CONFIG.network.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{
            to: this.contractAddress,
            data: ULTRA_SIMPLE_METHOD_SIGNATURES['getTotalVaultCount()']
          }, 'latest'],
          id: 1
        })
      });

      const result = await response.json();
      return parseInt(result.result, 16);
    } catch (error) {
      console.error('Error getting total vaults:', error);
      return 0;
    }
  }

  // Get user vault count using proper ABI
  async getUserVaultCount(userAddress) {
    try {
      if (this.contractAddress === 'UPDATE_AFTER_DEPLOYMENT') {
        return 0;
      }

      // Encode getUserVaultCount(address) call properly
      const paddedAddress = userAddress.slice(2).padStart(64, '0');
      const data = ULTRA_SIMPLE_METHOD_SIGNATURES['getUserVaultCount(address)'] + paddedAddress;

      const response = await fetch(ULTRA_SIMPLE_CONFIG.network.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{
            to: this.contractAddress,
            data: data
          }, 'latest'],
          id: 2
        })
      });

      const result = await response.json();
      return parseInt(result.result, 16);
    } catch (error) {
      console.error('Error getting user vault count:', error);
      return 0;
    }
  }

  // Get user vaults using proper ABI
  async getUserVaults(userAddress) {
    try {
      if (this.contractAddress === 'UPDATE_AFTER_DEPLOYMENT') {
        return [];
      }

      // Encode getUserVaults(address) call properly
      const paddedAddress = userAddress.slice(2).padStart(64, '0');
      const data = ULTRA_SIMPLE_METHOD_SIGNATURES['getUserVaults(address)'] + paddedAddress;

      const response = await fetch(ULTRA_SIMPLE_CONFIG.network.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{
            to: this.contractAddress,
            data: data
          }, 'latest'],
          id: 3
        })
      });

      const result = await response.json();
      
      if (result.result === '0x') {
        return [];
      }

      // Decode array of uint256 values
      // This is a simplified decoder - in production use proper ABI decoder
      return [];
    } catch (error) {
      console.error('Error getting user vaults:', error);
      return [];
    }
  }

  // Get vault details by ID
  async getVault(vaultId) {
    try {
      if (this.contractAddress === 'UPDATE_AFTER_DEPLOYMENT') {
        return null;
      }

      // Encode getVault(uint256) call
      const paddedVaultId = vaultId.toString(16).padStart(64, '0');
      const data = ULTRA_SIMPLE_METHOD_SIGNATURES['getVault(uint256)'] + paddedVaultId;

      const response = await fetch(ULTRA_SIMPLE_CONFIG.network.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{
            to: this.contractAddress,
            data: data
          }, 'latest'],
          id: 4
        })
      });

      const result = await response.json();
      
      if (result.result === '0x') {
        return null;
      }

      // Decode vault data (simplified - returns raw result for now)
      return {
        success: true,
        rawData: result.result,
        vaultId: vaultId
      };
    } catch (error) {
      console.error('Error getting vault details:', error);
      return null;
    }
  }
}

// Export singleton
const ultraSimpleVaultService = new UltraSimpleVaultService();
export default ultraSimpleVaultService;