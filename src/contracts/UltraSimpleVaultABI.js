// Complete ABI for deployed UltraSimpleVault contract
export const ULTRA_SIMPLE_VAULT_ABI = [
  {
    "inputs": [],
    "name": "createVault",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_email",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_hashId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_cid",
        "type": "string"
      }
    ],
    "name": "createVaultWithData",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "InvalidInput",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "MaxVaultsReached",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NotVaultOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_vaultId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_hashId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_cid",
        "type": "string"
      }
    ],
    "name": "updateVault",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "VaultDoesNotExist",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "vaultId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "cid",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "hashId",
        "type": "string"
      }
    ],
    "name": "DataStored",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "creator",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "vaultId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "VaultCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "vaultId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "VaultUpdated",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "getDeployedVaults",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalVaultCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      }
    ],
    "name": "getUserVaultCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      }
    ],
    "name": "getUserVaults",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_vaultId",
        "type": "uint256"
      }
    ],
    "name": "getVault",
    "outputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "email",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "hashId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "cid",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "createdAt",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Method signatures for direct RPC calls
export const ULTRA_SIMPLE_METHOD_SIGNATURES = {
  'createVault()': '0x7a8962c3',
  'createVaultWithData(string,string,string,string)': '0x8c5be1e5',
  'getTotalVaultCount()': '0x18160ddd',
  'getUserVaultCount(address)': '0x0e9d3bf4',
  'getUserVaults(address)': '0x4f0a5f5d',
  'getVault(uint256)': '0x262a9dff',
  'getDeployedVaults()': '0x3b3bff0f',
  'updateVault(uint256,string,string)': '0x441a3e70'
};

// Error signatures for better error handling
export const ULTRA_SIMPLE_ERROR_SIGNATURES = {
  'InvalidInput()': '0x...',
  'MaxVaultsReached()': '0x...',
  'NotVaultOwner()': '0x...',
  'VaultDoesNotExist()': '0x...'
};