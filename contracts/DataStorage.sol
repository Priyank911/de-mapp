// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title DataStorage
 * @dev Smart contract for storing user data (email, UUID, CID) on Avalanche C-Chain
 * @author DEmapp Team
 */
contract DataStorage is Ownable, ReentrancyGuard {
    
    // Storage fee in AVAX (0.01 AVAX = 10^16 wei)
    uint256 public storagePrice = 0.01 ether;
    
    // Data structure for stored information
    struct UserData {
        string email;
        string uuid;
        string cid;
        uint256 timestamp;
        address user;
        bool exists;
    }
    
    // Mapping from CID to UserData
    mapping(string => UserData) public dataStore;
    
    // Mapping to track all CIDs by user address
    mapping(address => string[]) public userCids;
    
    // Array to store all CIDs for enumeration
    string[] public allCids;
    
    // Events
    event DataStored(
        address indexed user,
        string indexed cid,
        string email,
        string uuid,
        uint256 timestamp
    );
    
    event StorageFeeUpdated(uint256 oldFee, uint256 newFee);
    event FundsWithdrawn(address indexed owner, uint256 amount);
    
    /**
     * @dev Constructor sets the deployer as owner
     */
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Store user data with CID
     * @param email User's email address
     * @param uuid User's unique identifier
     * @param cid Content Identifier from IPFS
     */
    function storeData(
        string memory email,
        string memory uuid,
        string memory cid
    ) external payable nonReentrant {
        require(msg.value >= storagePrice, "Insufficient payment for storage");
        require(bytes(email).length > 0, "Email cannot be empty");
        require(bytes(uuid).length > 0, "UUID cannot be empty");
        require(bytes(cid).length > 0, "CID cannot be empty");
        require(!dataStore[cid].exists, "CID already exists");
        
        // Store the data
        dataStore[cid] = UserData({
            email: email,
            uuid: uuid,
            cid: cid,
            timestamp: block.timestamp,
            user: msg.sender,
            exists: true
        });
        
        // Add CID to user's list
        userCids[msg.sender].push(cid);
        
        // Add to all CIDs array
        allCids.push(cid);
        
        emit DataStored(msg.sender, cid, email, uuid, block.timestamp);
    }
    
    /**
     * @dev Check if a CID exists in storage
     * @param cid Content Identifier to check
     * @return bool indicating if CID exists
     */
    function checkCidExists(string memory cid) external view returns (bool) {
        return dataStore[cid].exists;
    }
    
    /**
     * @dev Get data by CID
     * @param cid Content Identifier to retrieve
     * @return UserData struct containing all stored information
     */
    function getDataByCid(string memory cid) external view returns (UserData memory) {
        require(dataStore[cid].exists, "CID does not exist");
        return dataStore[cid];
    }
    
    /**
     * @dev Get all CIDs stored by a specific user
     * @param user Address of the user
     * @return Array of CIDs belonging to the user
     */
    function getUserCids(address user) external view returns (string[] memory) {
        return userCids[user];
    }
    
    /**
     * @dev Get contract statistics
     * @return totalEntries Total number of stored entries
     * @return totalUsers Number of unique users
     * @return currentStoragePrice Current storage fee
     */
    function getContractStats() external view returns (
        uint256 totalEntries,
        uint256 totalUsers,
        uint256 currentStoragePrice
    ) {
        return (allCids.length, 0, storagePrice); // Note: totalUsers would need additional tracking
    }
    
    /**
     * @dev Update storage price (owner only)
     * @param newPrice New storage price in wei
     */
    function updateStoragePrice(uint256 newPrice) external onlyOwner {
        uint256 oldPrice = storagePrice;
        storagePrice = newPrice;
        emit StorageFeeUpdated(oldPrice, newPrice);
    }
    
    /**
     * @dev Withdraw contract balance (owner only)
     */
    function withdrawFunds() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
        
        emit FundsWithdrawn(owner(), balance);
    }
    
    /**
     * @dev Get contract balance
     * @return Contract balance in wei
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Emergency function to check contract state
     * @return contractOwner Address of the contract owner
     * @return balance Current contract balance in wei
     * @return totalStored Total number of stored CIDs
     * @return currentFee Current storage fee in wei
     */
    function getContractInfo() external view returns (
        address contractOwner,
        uint256 balance,
        uint256 totalStored,
        uint256 currentFee
    ) {
        return (
            owner(),
            address(this).balance,
            allCids.length,
            storagePrice
        );
    }
}