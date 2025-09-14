// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title AvaxVaultStorage
 * @dev Smart contract for storing user data on AVAX C-Chain Fuji Testnet
 * @notice This contract stores hash, CID, email, and name data with minimal gas fees
 */
contract AvaxVaultStorage {
    
    // Events
    event DataStored(
        address indexed user,
        string indexed email,
        string name,
        string hashId,
        string cid,
        uint256 timestamp
    );
    
    event DataUpdated(
        address indexed user,
        string indexed email,
        uint256 timestamp
    );
    
    // Struct to store user data
    struct UserData {
        string name;
        string email;
        string hashId;
        string cid;
        uint256 timestamp;
        uint256 updateCount;
        bool exists;
    }
    
    // Mappings
    mapping(address => UserData) public userData;
    mapping(string => address) public emailToAddress;
    mapping(string => bool) public emailExists;
    
    // State variables
    address public owner;
    uint256 public totalUsers;
    uint256 public totalTransactions;
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier validData(string memory _name, string memory _email, string memory _hashId, string memory _cid) {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_email).length > 0, "Email cannot be empty");
        require(bytes(_hashId).length > 0, "Hash ID cannot be empty");
        require(bytes(_cid).length > 0, "CID cannot be empty");
        require(bytes(_email).length <= 100, "Email too long");
        require(bytes(_name).length <= 50, "Name too long");
        _;
    }
    
    // Constructor
    constructor() {
        owner = msg.sender;
        totalUsers = 0;
        totalTransactions = 0;
    }
    
    /**
     * @dev Store user data on blockchain
     * @param _name User's name
     * @param _email User's email address
     * @param _hashId Hash identifier
     * @param _cid IPFS CID
     */
    function storeUserData(
        string memory _name,
        string memory _email,
        string memory _hashId,
        string memory _cid
    ) public validData(_name, _email, _hashId, _cid) {
        
        bool isNewUser = !userData[msg.sender].exists;
        
        // If email is being used by different address, revert
        if (emailExists[_email] && emailToAddress[_email] != msg.sender) {
            revert("Email already registered to different address");
        }
        
        // Store/Update user data
        userData[msg.sender] = UserData({
            name: _name,
            email: _email,
            hashId: _hashId,
            cid: _cid,
            timestamp: block.timestamp,
            updateCount: userData[msg.sender].updateCount + 1,
            exists: true
        });
        
        // Update email mappings
        emailToAddress[_email] = msg.sender;
        emailExists[_email] = true;
        
        // Update counters
        if (isNewUser) {
            totalUsers++;
        }
        totalTransactions++;
        
        // Emit appropriate event
        if (isNewUser) {
            emit DataStored(msg.sender, _email, _name, _hashId, _cid, block.timestamp);
        } else {
            emit DataUpdated(msg.sender, _email, block.timestamp);
        }
    }
    
    /**
     * @dev Get user data by address
     * @param _userAddress Address to query
     * @return UserData struct
     */
    function getUserData(address _userAddress) public view returns (UserData memory) {
        require(userData[_userAddress].exists, "User data not found");
        return userData[_userAddress];
    }
    
    /**
     * @dev Get user data by email
     * @param _email Email to query
     * @return UserData struct
     */
    function getUserDataByEmail(string memory _email) public view returns (UserData memory) {
        address userAddress = emailToAddress[_email];
        require(userAddress != address(0), "Email not registered");
        require(userData[userAddress].exists, "User data not found");
        return userData[userAddress];
    }
    
    /**
     * @dev Get caller's own data
     * @return UserData struct
     */
    function getMyData() public view returns (UserData memory) {
        require(userData[msg.sender].exists, "No data found for your address");
        return userData[msg.sender];
    }
    
    /**
     * @dev Check if user exists by address
     * @param _userAddress Address to check
     * @return bool indicating if user exists
     */
    function userExists(address _userAddress) public view returns (bool) {
        return userData[_userAddress].exists;
    }
    
    /**
     * @dev Check if email is registered
     * @param _email Email to check
     * @return bool indicating if email is registered
     */
    function isEmailRegistered(string memory _email) public view returns (bool) {
        return emailExists[_email];
    }
    
    /**
     * @dev Get contract statistics
     * @return totalUsers, totalTransactions, deploymentTime
     */
    function getContractStats() public view returns (uint256, uint256, address) {
        return (totalUsers, totalTransactions, owner);
    }
    
    /**
     * @dev Update user data (requires previous registration)
     * @param _name New name
     * @param _hashId New hash ID
     * @param _cid New CID
     */
    function updateUserData(
        string memory _name,
        string memory _hashId,
        string memory _cid
    ) public {
        require(userData[msg.sender].exists, "User must be registered first");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_hashId).length > 0, "Hash ID cannot be empty");
        require(bytes(_cid).length > 0, "CID cannot be empty");
        
        // Keep the same email, update other fields
        userData[msg.sender].name = _name;
        userData[msg.sender].hashId = _hashId;
        userData[msg.sender].cid = _cid;
        userData[msg.sender].timestamp = block.timestamp;
        userData[msg.sender].updateCount++;
        
        totalTransactions++;
        
        emit DataUpdated(msg.sender, userData[msg.sender].email, block.timestamp);
    }
    
    /**
     * @dev Emergency function to update owner (only current owner)
     * @param _newOwner New owner address
     */
    function transferOwnership(address _newOwner) public onlyOwner {
        require(_newOwner != address(0), "New owner cannot be zero address");
        owner = _newOwner;
    }
    
    /**
     * @dev Get latest user registrations (for admin purposes)
     * @param _limit Number of recent users to fetch (max 50)
     * @return arrays of addresses and timestamps
     */
    function getRecentUsers(uint256 _limit) public view onlyOwner returns (address[] memory, uint256[] memory) {
        require(_limit <= 50, "Limit too high");
        
        // Note: This is a simplified version. In production, you'd want to maintain a separate array
        // of user addresses and implement proper pagination
        address[] memory addresses = new address[](_limit);
        uint256[] memory timestamps = new uint256[](_limit);
        
        // This is a basic implementation - in production you'd maintain an array of registered users
        return (addresses, timestamps);
    }
}

/**
 * @title AvaxVaultFactory
 * @dev Factory contract to deploy multiple AvaxVaultStorage instances if needed
 */
contract AvaxVaultFactory {
    event VaultCreated(address indexed creator, address vaultAddress, uint256 timestamp);
    
    address[] public deployedVaults;
    mapping(address => address[]) public userVaults;
    
    function createVault() public returns (address) {
        AvaxVaultStorage newVault = new AvaxVaultStorage();
        address vaultAddress = address(newVault);
        
        deployedVaults.push(vaultAddress);
        userVaults[msg.sender].push(vaultAddress);
        
        emit VaultCreated(msg.sender, vaultAddress, block.timestamp);
        
        return vaultAddress;
    }
    
    function getDeployedVaults() public view returns (address[] memory) {
        return deployedVaults;
    }
    
    function getUserVaults(address _user) public view returns (address[] memory) {
        return userVaults[_user];
    }
}