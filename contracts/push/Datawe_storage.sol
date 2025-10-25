// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title DataStorage (Lightweight for Push Network)
 * @dev Gas-optimized contract for Push testnet
 */
contract DataStorageLight {
    
    address public owner;
    uint256 public storagePrice = 0.01 ether;
    bool private locked;
    
    struct UserData {
        string email;
        string uuid;
        string cid;
        uint256 timestamp;
        address user;
        bool exists;
    }
    
    mapping(string => UserData) public dataStore;
    mapping(address => string[]) public userCids;
    string[] public allCids;
    
    event DataStored(
        address indexed user,
        string indexed cid,
        string email,
        string uuid,
        uint256 timestamp
    );
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier noReentrant() {
        require(!locked, "Reentrant call");
        locked = true;
        _;
        locked = false;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    function storeData(
        string calldata email,
        string calldata uuid,
        string calldata cid
    ) external payable noReentrant {
        require(msg.value >= storagePrice, "Insufficient payment");
        require(bytes(email).length > 0, "Email empty");
        require(bytes(uuid).length > 0, "UUID empty");
        require(bytes(cid).length > 0, "CID empty");
        require(!dataStore[cid].exists, "CID exists");
        
        // Create UserData struct
        UserData memory newData = UserData({
            email: email,
            uuid: uuid,
            cid: cid,
            timestamp: block.timestamp,
            user: msg.sender,
            exists: true
        });
        
        // Store data
        dataStore[cid] = newData;
        userCids[msg.sender].push(cid);
        allCids.push(cid);
        
        emit DataStored(msg.sender, cid, email, uuid, block.timestamp);
    }
    
    function checkCidExists(string calldata cid) external view returns (bool) {
        return dataStore[cid].exists;
    }
    
    function getDataByCid(string calldata cid) external view returns (UserData memory) {
        require(dataStore[cid].exists, "CID not found");
        return dataStore[cid];
    }
    
    function getUserCids(address user) external view returns (string[] memory) {
        return userCids[user];
    }
    
    function getTotalCids() external view returns (uint256) {
        return allCids.length;
    }
    
    function withdrawFunds() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds");
        
        (bool success, ) = payable(owner).call{value: balance}("");
        require(success, "Transfer failed");
    }
    
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}