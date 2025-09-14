// src/services/directContractService.js
class DirectContractService {
  constructor() {
    this.contractAddress = '0x6afd10e0b2e11784aabb298105e23d2e68add687';
    this.fujiRpcUrl = 'https://api.avax-test.network/ext/bc/C/rpc';
  }

  // Method to interact directly with RPC without wallet middleware
  async callContractDirectly(methodSignature, fromAddress, privateKey = null) {
    try {
      console.log('🔗 Making direct RPC call to Fuji testnet');
      
      // Check if contract exists
      const codeCheck = await this.makeRpcCall('eth_getCode', [this.contractAddress, 'latest']);
      if (codeCheck === '0x' || codeCheck === '0x0') {
        throw new Error('Contract not found at address');
      }
      
      console.log('✅ Contract exists, proceeding with call');
      
      // Test call first
      const callParams = {
        to: this.contractAddress,
        data: methodSignature,
        from: fromAddress
      };
      
      const callResult = await this.makeRpcCall('eth_call', [callParams, 'latest']);
      console.log('📞 Direct call result:', callResult);
      
      // Estimate gas
      const gasEstimate = await this.makeRpcCall('eth_estimateGas', [callParams]);
      console.log('⛽ Gas estimate:', parseInt(gasEstimate, 16));
      
      return {
        success: true,
        callResult,
        gasEstimate: parseInt(gasEstimate, 16),
        contractExists: true
      };
      
    } catch (error) {
      console.error('❌ Direct contract call failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Make raw RPC call to Fuji testnet
  async makeRpcCall(method, params) {
    const response = await fetch(this.fujiRpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: method,
        params: params
      })
    });
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(`RPC Error: ${data.error.message}`);
    }
    
    return data.result;
  }
  
  // Test contract interaction without wallet
  async testContractInteraction() {
    console.log('🧪 Testing contract interaction via direct RPC');
    
    try {
      // Test getDeployedVaults (read-only)
      const getVaultsSignature = '0xffd5c6c2'; // getDeployedVaults()
      
      const result = await this.makeRpcCall('eth_call', [{
        to: this.contractAddress,
        data: getVaultsSignature
      }, 'latest']);
      
      console.log('📊 getDeployedVaults result:', result);
      
      // Test createVault signature
      const createVaultSignature = '0x7a8962c3'; // createVault()
      const testAddress = '0x0000000000000000000000000000000000000001'; // Test address
      
      const createTest = await this.callContractDirectly(createVaultSignature, testAddress);
      console.log('🏗️ createVault test:', createTest);
      
      return {
        getVaultsWorks: result !== '0x',
        createVaultGasEstimate: createTest.gasEstimate,
        contractResponsive: true
      };
      
    } catch (error) {
      console.error('❌ Contract interaction test failed:', error);
      return {
        contractResponsive: false,
        error: error.message
      };
    }
  }
}

export default new DirectContractService();