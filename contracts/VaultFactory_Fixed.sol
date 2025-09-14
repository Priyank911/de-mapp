// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// Individual Vault Contract
contract Vault {
    address public owner;
    string public name;
    string public email;
    string public hashId;
    string public cid;
    uint256 public createdAt;
    
    event DataStored(string email, string cid, string hashId, uint256 timestamp);
    
    constructor(address _owner, string memory _name, string memory _email) {
        owner = _owner;
        name = _name;
        email = _email;
        createdAt = block.timestamp;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only vault owner can call this function");
        _;
    }
    
    function storeData(string memory _hashId, string memory _cid) external onlyOwner {
        hashId = _hashId;
        cid = _cid;
        emit DataStored(email, _cid, _hashId, block.timestamp);
    }
    
    function getData() external view returns (string memory, string memory, string memory, string memory, uint256) {
        return (name, email, hashId, cid, createdAt);
    }
}

// Main Vault Factory Contract
contract VaultFactory {
    address[] public deployedVaults;
    mapping(address => address[]) public userVaults;
    mapping(address => uint256) public userVaultCount;
    
    event VaultCreated(address indexed creator, address vaultAddress, uint256 timestamp);
    
    // Create a new vault for the caller
    function createVault(string memory _name, string memory _email) external returns (address) {
        // Create new vault contract
        Vault newVault = new Vault(msg.sender, _name, _email);
        address vaultAddress = address(newVault);
        
        // Store vault address
        deployedVaults.push(vaultAddress);
        userVaults[msg.sender].push(vaultAddress);
        userVaultCount[msg.sender]++;
        
        // Emit event
        emit VaultCreated(msg.sender, vaultAddress, block.timestamp);
        
        return vaultAddress;
    }
    
    // Create vault with default parameters (for backward compatibility)
    function createVault() external returns (address) {
        return createVault("Default Vault", "user@example.com");
    }
    
    // Get all deployed vaults
    function getDeployedVaults() external view returns (address[] memory) {
        return deployedVaults;
    }
    
    // Get vaults for a specific user
    function getUserVaults(address _user) external view returns (address[] memory) {
        return userVaults[_user];
    }
    
    // Get vault count for a user
    function getUserVaultCount(address _user) external view returns (uint256) {
        return userVaultCount[_user];
    }
    
    // Get vault at specific index
    function deployedVaults(uint256 _index) external view returns (address) {
        require(_index < deployedVaults.length, "Index out of bounds");
        return deployedVaults[_index];
    }
    
    // Get user vault at specific index
    function userVaults(address _user, uint256 _index) external view returns (address) {
        require(_index < userVaults[_user].length, "Index out of bounds");
        return userVaults[_user][_index];
    }
    
    // Get total number of deployed vaults
    function getTotalVaultCount() external view returns (uint256) {
        return deployedVaults.length;
    }
}