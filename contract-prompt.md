# Smart Contract Prompt: Simple CID Storage Contract

## Contract Requirements

Create a Solidity smart contract for Avalanche (Fuji Testnet) that stores minimal data for each user:

### Core Functionality
- **Store only 3 fields per record:**
  1. `cid` (string) - IPFS Content Identifier hash
  2. `email` (string) - User's email address  
  3. `timestamp` (uint256) - Block timestamp when record was created

### Contract Features
- **Function: `storeRecord(string cid, string email)`**
  - Automatically sets timestamp to `block.timestamp`
  - Emits event when record is stored
  - Returns unique record ID

- **Function: `getRecord(uint256 recordId)`**
  - Returns struct with cid, email, timestamp
  - Should revert if record doesn't exist

- **Function: `getUserRecords(string email)`**
  - Returns array of record IDs for given email
  - Allows users to find all their records

- **Function: `getTotalRecords()`**
  - Returns total number of records stored

### Contract Specifications
- **Network:** Avalanche Fuji Testnet (Chain ID: 43113)
- **Solidity Version:** ^0.8.19 or latest stable
- **Gas Optimization:** Use minimal storage, efficient data types
- **Security:** Include basic input validation
- **Events:** Emit `RecordStored(uint256 indexed recordId, string indexed email, string cid, uint256 timestamp)`

### Data Structure
```solidity
struct Record {
    string cid;
    string email;
    uint256 timestamp;
}
```

### Additional Requirements
- Include constructor (can be empty)
- Add error handling for invalid inputs
- Make functions `public` or `external` as appropriate
- Include comprehensive natspec comments
- Ensure contract is deployable with standard tools (Remix, Hardhat, etc.)

### Example Usage Pattern
```javascript
// Deploy contract
const contract = new ethers.Contract(address, abi, signer);

// Store a record
await contract.storeRecord("QmX1eHjw5Z2...", "user@example.com");

// Get record by ID
const record = await contract.getRecord(1);

// Get all records for user
const userRecords = await contract.getUserRecords("user@example.com");
```

### Output Format
Please provide:
1. Complete Solidity contract code
2. ABI JSON array
3. Deployment instructions for Fuji testnet
4. Gas estimates for main functions
5. Example JavaScript integration code

### Optimization Goals
- Minimize gas costs for storage operations
- Keep contract size under 24KB
- Use events for efficient querying
- Implement proper error messages

---

**Note:** This contract will be integrated with a React frontend using ethers.js and will store transaction records in Firebase Firestore for additional indexing.