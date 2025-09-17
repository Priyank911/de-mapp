// CONTRACT DEPLOYMENT DETAILS
// ✅ UPDATED WITH REAL DEPLOYMENT DATA

export const CONTRACT_DETAILS = {
  // ✅ DEPLOYED CONTRACT DETAILS
  
  // Contract address from Remix deployment
  ADDRESS: "0x324f02afd4ab534454d841e6dd83431518ccfabb",
  
  // Transaction hash from deployment
  DEPLOYMENT_HASH: "0xd756f919f605f912d108164cfb53e3af2ed06258348c5986e792c8a84f666ab9",
  
  // Network details
  NETWORK: {
    NAME: "Avalanche Fuji Testnet",
    CHAIN_ID: 43113,
    RPC_URL: "https://api.avax-test.network/ext/bc/C/rpc",
    EXPLORER: "https://testnet.snowtrace.io"
  },
  
  // Contract ABI from Remix compilation
  ABI: [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "OwnableInvalidOwner",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "OwnableUnauthorizedAccount",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "string",
          "name": "cid",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "email",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "uuid",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
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
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "FundsWithdrawn",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "oldFee",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newFee",
          "type": "uint256"
        }
      ],
      "name": "StorageFeeUpdated",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "email",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "uuid",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "cid",
          "type": "string"
        }
      ],
      "name": "storeData",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "newPrice",
          "type": "uint256"
        }
      ],
      "name": "updateStoragePrice",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "withdrawFunds",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "allCids",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "cid",
          "type": "string"
        }
      ],
      "name": "checkCidExists",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "name": "dataStore",
      "outputs": [
        {
          "internalType": "string",
          "name": "email",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "uuid",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "cid",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "exists",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getContractBalance",
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
      "inputs": [],
      "name": "getContractInfo",
      "outputs": [
        {
          "internalType": "address",
          "name": "contractOwner",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "balance",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "totalStored",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "currentFee",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getContractStats",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "totalEntries",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "totalUsers",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "currentStoragePrice",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "cid",
          "type": "string"
        }
      ],
      "name": "getDataByCid",
      "outputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "email",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "uuid",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "cid",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "user",
              "type": "address"
            },
            {
              "internalType": "bool",
              "name": "exists",
              "type": "bool"
            }
          ],
          "internalType": "struct DataStorage.UserData",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "getUserCids",
      "outputs": [
        {
          "internalType": "string[]",
          "name": "",
          "type": "string[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "storagePrice",
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
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "userCids",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ],
  
  // Storage fee in AVAX
  STORAGE_FEE: "0.01", // 0.01 AVAX per storage operation
  
  // Gas limits for different operations
  GAS_LIMITS: {
    STORE_DATA: 300000,  // Increased from 150000
    CHECK_CID: 100000,   // Increased from 50000
    GET_DATA: 100000     // Increased from 50000
  }
};

// Helper function to get contract URL on explorer
export const getContractExplorerUrl = (address = CONTRACT_DETAILS.ADDRESS) => {
  return `${CONTRACT_DETAILS.NETWORK.EXPLORER}/address/${address}`;
};

// Helper function to get transaction URL on explorer
export const getTransactionExplorerUrl = (hash) => {
  return `${CONTRACT_DETAILS.NETWORK.EXPLORER}/tx/${hash}`;
};

// Validation function to check if contract details are configured
export const validateContractConfig = () => {
  const errors = [];
  
  // Check for valid contract address (not placeholder values)
  if (!CONTRACT_DETAILS.ADDRESS || 
      CONTRACT_DETAILS.ADDRESS === "YOUR_CONTRACT_ADDRESS_HERE" || 
      CONTRACT_DETAILS.ADDRESS === "0x0000000000000000000000000000000000000000") {
    errors.push("Contract address not configured");
  }
  
  // Check for valid deployment hash
  if (!CONTRACT_DETAILS.DEPLOYMENT_HASH || 
      CONTRACT_DETAILS.DEPLOYMENT_HASH === "YOUR_DEPLOYMENT_TRANSACTION_HASH_HERE" || 
      CONTRACT_DETAILS.DEPLOYMENT_HASH === "0x0000000000000000000000000000000000000000000000000000000000000000") {
    errors.push("Deployment hash not configured");
  }
  
  // Check for complete ABI (should have many functions for full contract)
  if (!CONTRACT_DETAILS.ABI || CONTRACT_DETAILS.ABI.length < 10) {
    errors.push("Contract ABI incomplete - needs full ABI from Remix");
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    isTemporary: false  // No longer temporary - real deployment!
  };
};