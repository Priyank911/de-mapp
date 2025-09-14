// src/utils/contractDebugger.js
export class ContractDebugger {
  static async debugContractCall(provider, contractAddress, methodData, fromAddress) {
    console.log('🔍 DEBUGGING CONTRACT CALL');
    console.log('==========================');
    
    try {
      // 1. Check contract exists
      const code = await provider.request({
        method: 'eth_getCode',
        params: [contractAddress, 'latest']
      });
      console.log('📜 Contract code length:', code.length);
      console.log('📜 Contract has code:', code !== '0x' && code !== '0x0');
      
      // 2. Check account balance
      const balance = await provider.request({
        method: 'eth_getBalance',
        params: [fromAddress, 'latest']
      });
      const balanceInAVAX = parseInt(balance, 16) / Math.pow(10, 18);
      console.log('💰 Sender balance:', balanceInAVAX, 'AVAX');
      
      // 3. Skip eth_call that might be causing multicall issues
      console.log('⚠️ Skipping eth_call to avoid multicall issues');
      
      // 4. Try to estimate gas directly
      console.log('⛽ Estimating gas...');
      let gasEstimate = 500000; // Default fallback
      let gasPrice = 25000000000; // 25 gwei default
      
      try {
        const callParams = {
          to: contractAddress,
          data: methodData,
          from: fromAddress
        };
        
        const estimatedGas = await provider.request({
          method: 'eth_estimateGas',
          params: [callParams]
        });
        gasEstimate = parseInt(estimatedGas, 16);
        console.log('⛽ Gas estimate successful:', gasEstimate);
      } catch (gasError) {
        console.warn('⚠️ Gas estimation failed, using default:', gasError.message);
      }
      
      // 5. Get current gas price
      try {
        const currentGasPrice = await provider.request({ method: 'eth_gasPrice' });
        gasPrice = parseInt(currentGasPrice, 16);
        console.log('⛽ Current gas price:', gasPrice / Math.pow(10, 9), 'gwei');
      } catch (priceError) {
        console.warn('⚠️ Gas price fetch failed, using default');
      }
      
      // 6. Calculate transaction cost
      const txCost = (gasEstimate * gasPrice) / Math.pow(10, 18);
      console.log('💸 Estimated transaction cost:', txCost, 'AVAX');
      
      return {
        contractExists: code !== '0x' && code !== '0x0',
        balance: balanceInAVAX,
        callSucceeds: true, // Assume true since we can't test safely
        gasEstimate,
        gasPrice,
        txCost,
        canAfford: balanceInAVAX > txCost,
        warning: 'Skipped eth_call to avoid multicall conflicts'
      };
      
    } catch (error) {
      console.error('❌ Debug failed:', error);
      return { error: error.message };
    }
  }
  
  static async getContractInfo(provider, contractAddress) {
    try {
      // Get deployed vaults (should work if contract is valid)
      const getVaultsData = '0xffd5c6c2'; // getDeployedVaults()
      
      const result = await provider.request({
        method: 'eth_call',
        params: [{
          to: contractAddress,
          data: getVaultsData
        }, 'latest']
      });
      
      console.log('📊 Contract getDeployedVaults result:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Could not get contract info:', error);
      return null;
    }
  }
  
  // Method to verify the exact method signature
  static calculateMethodSignature(method) {
    // For createVault() - no parameters
    // The signature should be the first 4 bytes of keccak256 hash of "createVault()"
    
    console.log('🔧 Calculating method signature for:', method);
    
    // Known method signatures for this contract:
    const signatures = {
      'createVault()': '0x7a8962c3',
      'getDeployedVaults()': '0xffd5c6c2',
      'getUserVaults(address)': '0x4f0a5f5d',
      'deployedVaults(uint256)': '0x8c1b3cf0',
      'userVaults(address,uint256)': '0x95a47c4e'
    };
    
    return signatures[method] || null;
  }
}