// Improved Vault Factory Service - Latest Contract
import { IMPROVED_VAULT_FACTORY_ABI } from '../contracts/ImprovedVaultFactoryABI.js';
import firestoreTransactionService from './firestoreTransactionService.js';

// NEW IMPROVED CONTRACT - DEPLOYED & WORKING
const IMPROVED_CONTRACT_CONFIG = {
  address: '0x84ee8d0a2b72eafb6af8bbd0516c08cf1fe08045',
  abi: IMPROVED_VAULT_FACTORY_ABI,
  network: {
    chainId: '0xA869', // 43113 (Fuji)
    name: 'Avalanche Fuji Testnet',
    rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
    explorerUrl: 'https://testnet.snowtrace.io'
  }
};

class ImprovedVaultFactoryService {
  constructor() {
    this.contractConfig = IMPROVED_CONTRACT_CONFIG;
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
    
    if (chainId !== this.contractConfig.network.chainId) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: this.contractConfig.network.chainId }],
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: this.contractConfig.network.chainId,
              chainName: this.contractConfig.network.name,
              rpcUrls: [this.contractConfig.network.rpcUrl],
              blockExplorerUrls: [this.contractConfig.network.explorerUrl],
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

  // Create vault with full data
  async createVaultWithData(userData) {
    let userAddress = null;
    try {
      console.log('🚀 Creating vault with improved contract...');
      
      // Ensure wallet is connected and on correct network
      const accounts = await this.ensureWalletConnected();
      await this.ensureFujiNetwork();

  userAddress = accounts[0];
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

      // Prepare function call with proper ABI encoding
      const { ethers } = await import('ethers');
      const iface = new ethers.Interface(this.contractConfig.abi);
      
      const functionData = iface.encodeFunctionData('createVaultWithData', [
        userData.name || 'Default User',
        userData.email || 'user@example.com',
        userData.hashId || `hash_${Date.now()}`,
        userData.cid || 'default_cid'
      ]);

      // Create transaction
      const txParams = {
        from: userAddress,
        to: this.contractConfig.address,
        data: functionData,
        gas: '0x186A0', // 100,000 gas
        gasPrice: '0x5D21DBA00' // 25 gwei
      };

      console.log('📝 Transaction params:', txParams);

      // Send transaction
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [txParams]
      });

      console.log('✅ Transaction sent:', txHash);
      console.log('🔗 Explorer:', `${this.contractConfig.network.explorerUrl}/tx/${txHash}`);

      // Wait for transaction to be mined
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Store success in Firestore (flatten userData to top-level to avoid nested undefineds)
      const firestoreData = {
        transactionHash: txHash,
        contractAddress: this.contractConfig.address,
        userAddress: userAddress,
        // flatten common fields
        name: userData?.name || null,
        email: userData?.email || null,
        hashId: userData?.hashId || null,
        cid: userData?.cid || null,
        timestamp: new Date(),
        status: 'pending',
        network: 'fuji-testnet',
        contractType: 'ImprovedVaultFactory',
        explorerUrl: `${this.contractConfig.network.explorerUrl}/tx/${txHash}`
      };

      await firestoreTransactionService.storeAvaxTransaction(firestoreData);

      return {
        success: true,
        transactionHash: txHash,
        contractAddress: this.contractConfig.address,
        userAddress: userAddress,
        explorerUrl: `${this.contractConfig.network.explorerUrl}/tx/${txHash}`,
        message: 'Improved vault created successfully!'
      };

    } catch (error) {
      console.error('❌ Improved vault creation failed:', error);

      // Store failed transaction - include flattened user fields and userAddress
      await firestoreTransactionService.storeFailedTransaction({
        contractAddress: this.contractConfig.address,
        userAddress: (typeof userAddress !== 'undefined') ? userAddress : null,
        userName: userData?.name || null,
        email: userData?.email || null,
        hashId: userData?.hashId || null,
        cid: userData?.cid || null,
        error: error.message,
        timestamp: new Date(),
        contractType: 'ImprovedVaultFactory'
      });

      return {
        success: false,
        error: error.message,
        contractAddress: this.contractConfig.address
      };
    }
  }

  // Create simple vault (no data)
  async createVault() {
    try {
      console.log('🚀 Creating simple vault...');
      
      const accounts = await this.ensureWalletConnected();
      await this.ensureFujiNetwork();

      const userAddress = accounts[0];

      // Simple createVault() call
      const txParams = {
        from: userAddress,
        to: this.contractConfig.address,
        data: '0x7a8962c3', // createVault() signature
        gas: '0xC350', // 50,000 gas
        gasPrice: '0x5D21DBA00' // 25 gwei
      };

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [txParams]
      });

      return {
        success: true,
        transactionHash: txHash,
        contractAddress: this.contractConfig.address,
        userAddress: userAddress,
        explorerUrl: `${this.contractConfig.network.explorerUrl}/tx/${txHash}`
      };

    } catch (error) {
      console.error('❌ Simple vault creation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get total vault count
  async getTotalVaultCount() {
    try {
      const response = await fetch(this.contractConfig.network.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{
            to: this.contractConfig.address,
            data: '0x18160ddd' // getTotalVaultCount()
          }, 'latest'],
          id: 1
        })
      });

      const result = await response.json();
      return parseInt(result.result, 16);
    } catch (error) {
      console.error('Error getting total vault count:', error);
      return 0;
    }
  }

  // Get user vault count
  async getUserVaultCount(userAddress) {
    try {
      // Encode getUserVaultCount(address) call
      const paddedAddress = userAddress.slice(2).padStart(64, '0');
      const data = '0x0e9d3bf4' + paddedAddress; // getUserVaultCount(address)

      const response = await fetch(this.contractConfig.network.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{
            to: this.contractConfig.address,
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

  // Get max vaults per user
  async getMaxVaultsPerUser() {
    try {
      const response = await fetch(this.contractConfig.network.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{
            to: this.contractConfig.address,
            data: '0x8da5cb5b' // MAX_VAULTS_PER_USER()
          }, 'latest'],
          id: 3
        })
      });

      const result = await response.json();
      return parseInt(result.result, 16);
    } catch (error) {
      console.error('Error getting max vaults per user:', error);
      return 10; // Default fallback
    }
  }

  // Get user vault IDs
  async getUserVaults(userAddress) {
    try {
      // Encode getUserVaults(address) call
      const paddedAddress = userAddress.slice(2).padStart(64, '0');
      const data = '0x4f0a5f5d' + paddedAddress; // getUserVaults(address)

      const response = await fetch(this.contractConfig.network.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{
            to: this.contractConfig.address,
            data: data
          }, 'latest'],
          id: 4
        })
      });

      const result = await response.json();
      
      if (result.result && result.result !== '0x') {
        // Decode array of uint256
        const { ethers } = await import('ethers');
        const decoded = ethers.AbiCoder.defaultAbiCoder().decode(['uint256[]'], result.result);
        return decoded[0].map(id => parseInt(id.toString()));
      }
      
      return [];
    } catch (error) {
      console.error('Error getting user vaults:', error);
      return [];
    }
  }

  // Get vault details by ID
  async getVault(vaultId) {
    try {
      // Encode getVault(uint256) call
      const paddedVaultId = vaultId.toString(16).padStart(64, '0');
      const data = '0x262a9dff' + paddedVaultId; // getVault(uint256)

      const response = await fetch(this.contractConfig.network.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{
            to: this.contractConfig.address,
            data: data
          }, 'latest'],
          id: 5
        })
      });

      const result = await response.json();
      
      if (result.result && result.result !== '0x') {
        // Decode VaultData struct
        const { ethers } = await import('ethers');
        const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
          ['tuple(address,string,string,string,string,uint256)'], 
          result.result
        );
        
        const vaultData = decoded[0];
        return {
          owner: vaultData[0],
          name: vaultData[1],
          email: vaultData[2],
          hashId: vaultData[3],
          cid: vaultData[4],
          createdAt: parseInt(vaultData[5].toString())
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting vault:', error);
      return null;
    }
  }

  // Update vault
  async updateVault(vaultId, hashId, cid) {
    try {
      const accounts = await this.ensureWalletConnected();
      await this.ensureFujiNetwork();

      const userAddress = accounts[0];

      // Prepare function call
      const { ethers } = await import('ethers');
      const iface = new ethers.Interface(this.contractConfig.abi);
      
      const functionData = iface.encodeFunctionData('updateVault', [
        vaultId,
        hashId,
        cid
      ]);

      const txParams = {
        from: userAddress,
        to: this.contractConfig.address,
        data: functionData,
        gas: '0x15F90', // 90,000 gas
        gasPrice: '0x5D21DBA00' // 25 gwei
      };

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [txParams]
      });

      return {
        success: true,
        transactionHash: txHash,
        contractAddress: this.contractConfig.address,
        explorerUrl: `${this.contractConfig.network.explorerUrl}/tx/${txHash}`
      };

    } catch (error) {
      console.error('❌ Vault update failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Export singleton
const improvedVaultFactoryService = new ImprovedVaultFactoryService();
export default improvedVaultFactoryService;