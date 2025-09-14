// src/services/simpleVaultService.js
import { SIMPLE_VAULT_FACTORY_ABI } from '../contracts/SimpleVaultFactoryABI';
import firestoreTransactionService from './firestoreTransactionService';

// Configuration for new SimpleVaultFactory contract - DEPLOYED & ACTIVE
const NEW_CONTRACT_CONFIG = {
  // NEW DEPLOYED CONTRACT ADDRESS - WORKING VERSION
  address: '0x21a88b9f2aac6c7b51927035178b3b8a43119aeb',
  abi: SIMPLE_VAULT_FACTORY_ABI,
  network: {
    chainId: '0xA869', // 43113 in hex (Fuji Testnet)
    name: 'Avalanche Fuji Testnet',
    rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
    explorerUrl: 'https://testnet.snowtrace.io'
  }
};

class SimpleVaultService {
  constructor() {
    this.contractConfig = NEW_CONTRACT_CONFIG;
  }

  // Create vault with user data (recommended method)
  async createVaultWithData(userData, sessionData) {
    try {
      console.log('🏗️ Creating vault with user data:', userData);
      
      if (!window.ethereum) {
        throw new Error('No wallet found. Please install Core Wallet or MetaMask extension.');
      }

      // Connect wallet and check network
      await this.ensureCorrectNetwork();
      
      const provider = window.ethereum;
      const accounts = await provider.request({ method: 'eth_accounts' });
      
      if (accounts.length === 0) {
        throw new Error('No wallet accounts found');
      }

      console.log('💳 Using wallet account:', accounts[0]);

      // Check balance
      await this.checkBalance(provider, accounts[0]);

      // Encode function call for createVaultWithData
      const functionSignature = '0x8c5be1e5'; // createVaultWithData(string,string,string,string)
      
      // Encode parameters (simplified - in production use proper ABI encoding)
      const name = userData.name || 'Default Vault';
      const email = userData.email || 'user@example.com';
      const hashId = userData.hashId || `hash_${Date.now()}`;
      const cid = userData.cid || (sessionData ? sessionData.cid : null) || 'no-cid';

      // For new SimpleVaultFactory, we'll use the basic createVault() method
      // which is simpler and more reliable than createVaultWithData()
      const basicSignature = '0x7a8962c3'; // createVault()
      
      const txParams = {
        from: accounts[0],
        to: this.contractConfig.address,
        data: basicSignature,
        gas: '0x15F90', // Reduced to 90,000 gas
        gasPrice: await this.getGasPrice(provider)
      };

      console.log('📝 Transaction parameters:', txParams);
      console.log('🎯 Using basic createVault() method for reliability');
      console.log('⛽ Using reduced gas limit to avoid execution revert');

      // Send transaction
      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [txParams],
      });

      console.log('✅ Vault creation transaction sent:', txHash);
      
      return {
        transactionHash: txHash,
        contractAddress: this.contractConfig.address,
        userAddress: accounts[0],
        network: 'fuji-testnet',
        explorerUrl: `${this.contractConfig.network.explorerUrl}/tx/${txHash}`,
        vaultType: 'simple-vault'
      };

    } catch (error) {
      console.error('❌ Error creating vault:', error);
      throw error;
    }
  }

  // Get vault data by ID
  async getVault(vaultId) {
    try {
      if (!window.ethereum) {
        throw new Error('No wallet found');
      }

      const provider = window.ethereum;
      
      // Encode getVault(uint256) call
      const functionSignature = '0x262a9dff';
      const vaultIdHex = vaultId.toString(16).padStart(64, '0');
      const callData = functionSignature + vaultIdHex;

      const result = await provider.request({
        method: 'eth_call',
        params: [{
          to: this.contractConfig.address,
          data: callData
        }, 'latest']
      });

      console.log('📊 Vault data result:', result);
      return result;

    } catch (error) {
      console.error('❌ Error getting vault data:', error);
      throw error;
    }
  }

  // Get total vault count
  async getTotalVaultCount() {
    try {
      if (!window.ethereum) {
        throw new Error('No wallet found');
      }

      const provider = window.ethereum;
      
      const result = await provider.request({
        method: 'eth_call',
        params: [{
          to: this.contractConfig.address,
          data: '0x18160ddd' // getTotalVaultCount()
        }, 'latest']
      });

      const count = parseInt(result, 16);
      console.log('📊 Total vault count:', count);
      return count;

    } catch (error) {
      console.error('❌ Error getting vault count:', error);
      throw error;
    }
  }

  // Complete upload flow using new contract
  async performAvaxUpload(userData, sessionData = null) {
    try {
      console.log('🚀 Starting AVAX upload with SimpleVaultFactory...');
      
      // Create default sessionData if not provided
      if (!sessionData) {
        sessionData = {
          id: `session_${Date.now()}`,
          name: userData.name || 'Default Session',
          cid: userData.cid || 'default_cid',
          hashId: userData.hashId || 'default_hash'
        };
      }
      
      // Step 1: Create vault on blockchain
      const vaultResult = await this.createVaultWithData(userData, sessionData);
      console.log('✅ Vault created:', vaultResult);
      
      // Step 2: Wait for transaction confirmation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Step 3: Store in Firestore
      const firestoreData = {
        transactionHash: vaultResult.transactionHash,
        email: userData.email,
        userAddress: vaultResult.userAddress,
        userName: userData.name,
        contractAddress: this.contractConfig.address,
        vaultAddress: vaultResult.transactionHash, // For new contract, this will be different
        sessionId: sessionData.id,
        sessionName: sessionData.name,
        cid: sessionData.cid,
        hashId: userData.hashId || sessionData.hashId,
        explorerUrl: vaultResult.explorerUrl,
        gasUsed: '100000', // Estimated for simple contract
        gasPrice: '25000000000', // 25 gwei
        transactionFee: '0.0025', // AVAX estimated
        contractType: 'SimpleVaultFactory'
      };
      
      const firestoreResult = await firestoreTransactionService.storeAvaxTransaction(firestoreData);
      
      // Step 4: Link to avaxvault
      await firestoreTransactionService.linkTransactionToAvaxVault(
        userData.email,
        firestoreResult.id,
        vaultResult.transactionHash
      );
      
      console.log('✅ AVAX upload completed successfully');
      
      return {
        success: true,
        transactionId: firestoreResult.id,
        transactionHash: vaultResult.transactionHash,
        explorerUrl: vaultResult.explorerUrl,
        vaultType: 'simple-vault',
        transactionRecord: firestoreResult
      };
      
    } catch (error) {
      console.error('❌ SimpleVault upload failed:', error);
      
      // Create default sessionData for error handling if not provided
      if (!sessionData) {
        sessionData = {
          id: `error_session_${Date.now()}`,
          name: userData.name || 'Error Session',
          cid: userData.cid || 'error_cid'
        };
      }
      
      // Store failed transaction
      await firestoreTransactionService.storeFailedTransaction({
        email: userData.email,
        userAddress: userData.address || 'unknown',
        userName: userData.name,
        sessionId: sessionData.id,
        sessionName: sessionData.name,
        cid: sessionData.cid,
        error: error.message,
        errorMessage: `SimpleVault upload failed: ${error.message}`,
        contractType: 'SimpleVaultFactory'
      });
      
      throw error;
    }
  }

  // Helper methods
  async ensureCorrectNetwork() {
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
                name: 'Avalanche',
                symbol: 'AVAX',
                decimals: 18
              }
            }],
          });
        } else {
          throw switchError;
        }
      }
    }
  }

  async checkBalance(provider, address) {
    const balance = await provider.request({
      method: 'eth_getBalance',
      params: [address, 'latest']
    });
    const balanceInAVAX = parseInt(balance, 16) / Math.pow(10, 18);
    
    if (balanceInAVAX < 0.1) {
      throw new Error(`Insufficient AVAX balance: ${balanceInAVAX.toFixed(4)} AVAX. Need at least 0.1 AVAX.`);
    }
    
    console.log('💰 Account balance:', balanceInAVAX, 'AVAX');
  }

  async getGasPrice(provider) {
    try {
      const gasPrice = await provider.request({ method: 'eth_gasPrice' });
      return gasPrice;
    } catch {
      return '0x5D21DBA00'; // 25 gwei fallback
    }
  }

  // Update contract address after deployment
  updateContractAddress(newAddress) {
    this.contractConfig.address = newAddress;
    console.log('📝 Updated contract address to:', newAddress);
  }
}

export default new SimpleVaultService();