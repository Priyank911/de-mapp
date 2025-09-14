// Simple CID Storage Service - Clean & Minimal
import { SIMPLE_CID_STORAGE_ABI } from '../contracts/SimpleCIDStorageABI.js';
import firestoreTransactionService from './firestoreTransactionService.js';

// DEPLOYED CONTRACT - Simple CID Storage
const CONTRACT_CONFIG = {
  address: '0xcb0154623bfc81fbd23e6074e29b8103cabb03be',
  abi: SIMPLE_CID_STORAGE_ABI,
  network: {
    chainId: '0xA869', // 43113 (Fuji)
    name: 'Avalanche Fuji Testnet',
    rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
    explorerUrl: 'https://testnet.snowtrace.io'
  }
};

class SimpleCIDStorageService {
  constructor() {
    this.contractConfig = CONTRACT_CONFIG;
  }

  // Ensure wallet is connected
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

  // Ensure correct network
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

  // Detailed error analysis for better user feedback
  analyzeTransactionError(error) {
    const errorMessage = error.message || error.toString();
    const errorLower = errorMessage.toLowerCase();

    // User denied transaction
    if (errorLower.includes('user denied') || errorLower.includes('user rejected')) {
      return {
        code: 'USER_DENIED',
        category: 'User Action',
        userMessage: '🚫 Transaction cancelled by user. Please try again and approve the transaction in your wallet.',
        debugInfo: 'User rejected the transaction request in wallet'
      };
    }

    // Insufficient funds
    if (errorLower.includes('insufficient funds') || errorLower.includes('insufficient balance')) {
      return {
        code: 'INSUFFICIENT_FUNDS',
        category: 'Balance',
        userMessage: '💰 Insufficient AVAX balance. You need at least 0.01 AVAX for gas fees. Please add funds to your wallet.',
        debugInfo: 'User wallet balance too low for transaction gas fees'
      };
    }

    // Gas estimation failed
    if (errorLower.includes('gas') && (errorLower.includes('estimation') || errorLower.includes('limit'))) {
      return {
        code: 'GAS_ERROR',
        category: 'Gas',
        userMessage: '⛽ Gas estimation failed. The network might be congested. Try again in a few minutes.',
        debugInfo: 'Gas estimation failed - possible network congestion or contract issue'
      };
    }

    // Execution reverted
    if (errorLower.includes('execution reverted') || errorLower.includes('revert')) {
      return {
        code: 'EXECUTION_REVERTED',
        category: 'Contract',
        userMessage: '🔄 Contract execution failed. This might be due to invalid data or contract restrictions. Please check your inputs.',
        debugInfo: 'Smart contract execution reverted - possible input validation failure'
      };
    }

    // Network errors
    if (errorLower.includes('network') || errorLower.includes('connection') || errorLower.includes('timeout')) {
      return {
        code: 'NETWORK_ERROR',
        category: 'Network',
        userMessage: '🌐 Network connection issue. Please check your internet connection and try again.',
        debugInfo: 'Network connectivity or RPC endpoint issue'
      };
    }

    // Wallet connection errors
    if (errorLower.includes('wallet') || errorLower.includes('provider') || errorLower.includes('ethereum')) {
      return {
        code: 'WALLET_ERROR',
        category: 'Wallet',
        userMessage: '👛 Wallet connection issue. Please ensure your wallet (Core/MetaMask) is connected and unlocked.',
        debugInfo: 'Wallet provider connection or setup issue'
      };
    }

    // Chain/network mismatch
    if (errorLower.includes('chain') || errorLower.includes('wrong network')) {
      return {
        code: 'WRONG_NETWORK',
        category: 'Network',
        userMessage: '🔗 Wrong network detected. Please switch to Avalanche Fuji Testnet in your wallet.',
        debugInfo: 'User wallet connected to wrong blockchain network'
      };
    }

    // Contract not found
    if (errorLower.includes('contract') && (errorLower.includes('not found') || errorLower.includes('does not exist'))) {
      return {
        code: 'CONTRACT_NOT_FOUND',
        category: 'Contract',
        userMessage: '📋 Smart contract not accessible. This might be a temporary network issue.',
        debugInfo: 'Contract address not found or not deployed on current network'
      };
    }

    // Invalid parameters
    if (errorLower.includes('invalid') || errorLower.includes('parameter')) {
      return {
        code: 'INVALID_PARAMS',
        category: 'Input',
        userMessage: '❌ Invalid input data. Please check your CID and email format.',
        debugInfo: 'Invalid parameters passed to contract function'
      };
    }

    // Rate limiting
    if (errorLower.includes('rate limit') || errorLower.includes('too many requests')) {
      return {
        code: 'RATE_LIMITED',
        category: 'Network',
        userMessage: '⏱️ Too many requests. Please wait a moment and try again.',
        debugInfo: 'RPC endpoint rate limiting active'
      };
    }

    // Generic blockchain errors
    if (errorLower.includes('nonce') || errorLower.includes('replacement')) {
      return {
        code: 'NONCE_ERROR',
        category: 'Transaction',
        userMessage: '🔄 Transaction nonce issue. Please try refreshing your wallet or waiting a moment.',
        debugInfo: 'Transaction nonce too low or replacement transaction underpriced'
      };
    }

    // Default fallback for unknown errors
    return {
      code: 'UNKNOWN_ERROR',
      category: 'Unknown',
      userMessage: `❓ An unexpected error occurred: ${errorMessage.substring(0, 100)}... Please try again or contact support.`,
      debugInfo: `Unhandled error type: ${errorMessage}`
    };
  }

  // Store CID and email - Main function
  async storeRecord(cid, email) {
    let userAddress = null;
    
    try {
      console.log('🚀 Storing CID record on blockchain...');
      console.log('📝 CID:', cid);
      console.log('📧 Email:', email);
      
      // Connect wallet and switch network
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

      // Encode function call
      const { ethers } = await import('ethers');
      const iface = new ethers.Interface(this.contractConfig.abi);
      
      const functionData = iface.encodeFunctionData('storeRecord', [
        cid || 'default_cid',
        email || 'user@example.com'
      ]);

      // Create transaction
      const txParams = {
        from: userAddress,
        to: this.contractConfig.address,
        data: functionData,
        gas: '0x15F90', // 90,000 gas
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

      // Store in Firestore immediately
      const firestoreData = {
        transactionHash: txHash,
        contractAddress: this.contractConfig.address,
        userAddress: userAddress,
        cid: cid,
        email: email,
        timestamp: new Date(),
        status: 'pending',
        network: 'fuji-testnet',
        contractType: 'SimpleCIDStorage',
        explorerUrl: `${this.contractConfig.network.explorerUrl}/tx/${txHash}`
      };

      await firestoreTransactionService.storeAvaxTransaction(firestoreData);

      return {
        success: true,
        transactionHash: txHash,
        contractAddress: this.contractConfig.address,
        userAddress: userAddress,
        explorerUrl: `${this.contractConfig.network.explorerUrl}/tx/${txHash}`,
        message: 'CID record stored successfully!'
      };

    } catch (error) {
      console.error('❌ CID storage failed:', error);

      // Detailed error analysis for better user feedback
      const errorDetails = this.analyzeTransactionError(error);
      
      console.error('🔍 Error Analysis:', errorDetails);

      // Store failed transaction in Firestore with detailed error info
      await firestoreTransactionService.storeFailedTransaction({
        contractAddress: this.contractConfig.address,
        userAddress: userAddress,
        email: email,
        cid: cid,
        error: errorDetails.userMessage,
        errorCode: errorDetails.code,
        errorCategory: errorDetails.category,
        originalError: error.message,
        debugInfo: errorDetails.debugInfo,
        timestamp: new Date(),
        contractType: 'SimpleCIDStorage'
      });

      return {
        success: false,
        error: errorDetails.userMessage,
        errorCode: errorDetails.code,
        errorCategory: errorDetails.category,
        debugInfo: errorDetails.debugInfo,
        contractAddress: this.contractConfig.address,
        explorerUrl: `${this.contractConfig.network.explorerUrl}/address/${this.contractConfig.address}`
      };
    }
  }

  // Get record by ID
  async getRecord(recordId) {
    try {
      const response = await fetch(this.contractConfig.network.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{
            to: this.contractConfig.address,
            data: '0x262a9dff' + recordId.toString(16).padStart(64, '0') // getRecord(uint256)
          }, 'latest'],
          id: 1
        })
      });

      const result = await response.json();
      
      if (result.result && result.result !== '0x') {
        const { ethers } = await import('ethers');
        const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
          ['tuple(string,string,uint256)'], 
          result.result
        );
        
        const record = decoded[0];
        return {
          cid: record[0],
          email: record[1],
          timestamp: parseInt(record[2].toString())
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting record:', error);
      return null;
    }
  }

  // Get user records
  async getUserRecords(email) {
    try {
      const { ethers } = await import('ethers');
      const emailBytes = ethers.toUtf8Bytes(email);
      const emailHash = ethers.keccak256(emailBytes);
      
      const response = await fetch(this.contractConfig.network.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{
            to: this.contractConfig.address,
            data: '0x4f0a5f5d' + emailHash.slice(2) // getUserRecords(string)
          }, 'latest'],
          id: 2
        })
      });

      const result = await response.json();
      
      if (result.result && result.result !== '0x') {
        const { ethers } = await import('ethers');
        const decoded = ethers.AbiCoder.defaultAbiCoder().decode(['uint256[]'], result.result);
        return decoded[0].map(id => parseInt(id.toString()));
      }
      
      return [];
    } catch (error) {
      console.error('Error getting user records:', error);
      return [];
    }
  }

  // Get total records count
  async getTotalRecords() {
    try {
      const response = await fetch(this.contractConfig.network.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{
            to: this.contractConfig.address,
            data: '0x18160ddd' // getTotalRecords()
          }, 'latest'],
          id: 3
        })
      });

      const result = await response.json();
      return parseInt(result.result, 16);
    } catch (error) {
      console.error('Error getting total records:', error);
      return 0;
    }
  }
}

// Export singleton
const simpleCIDStorageService = new SimpleCIDStorageService();
export default simpleCIDStorageService;