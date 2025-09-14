// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// Simplified Vault Factory - No external contract creation
contract SimpleVaultFactory {
    
    struct VaultData {
        address owner;
        string name;
        string email;
        string hashId;
        string cid;
        uint256 createdAt;
        bool exists;
    }
    
    mapping(address => VaultData[]) public userVaults;
    mapping(address => uint256) public userVaultCount;
    VaultData[] public allVaults;
    
    event VaultCreated(address indexed creator, uint256 vaultId, uint256 timestamp);
    event DataStored(address indexed owner, uint256 vaultId, string cid, string hashId);
    
    // Create a new vault (simplified - just stores data)
    function createVault() external returns (uint256) {
        uint256 vaultId = allVaults.length;
        
        VaultData memory newVault = VaultData({
            owner: msg.sender,
            name: "Default Vault",
            email: "user@example.com",
            hashId: "",
            cid: "",
            createdAt: block.timestamp,
            exists: true
        });
        
        allVaults.push(newVault);
        userVaults[msg.sender].push(newVault);
        userVaultCount[msg.sender]++;
        
        emit VaultCreated(msg.sender, vaultId, block.timestamp);
        
        return vaultId;
    }
    
    // Create vault with custom data
    function createVaultWithData(string memory _name, string memory _email, string memory _hashId, string memory _cid) external returns (uint256) {
        uint256 vaultId = allVaults.length;
        
        VaultData memory newVault = VaultData({
            owner: msg.sender,
            name: _name,
            email: _email,
            hashId: _hashId,
            cid: _cid,
            createdAt: block.timestamp,
            exists: true
        });
        
        allVaults.push(newVault);
        userVaults[msg.sender].push(newVault);
        userVaultCount[msg.sender]++;
        
        emit VaultCreated(msg.sender, vaultId, block.timestamp);
        emit DataStored(msg.sender, vaultId, _cid, _hashId);
        
        return vaultId;
    }
    
    // Update vault data
    function updateVault(uint256 _vaultId, string memory _hashId, string memory _cid) external {
        require(_vaultId < allVaults.length, "Vault does not exist");
        require(allVaults[_vaultId].owner == msg.sender, "Not vault owner");
        
        allVaults[_vaultId].hashId = _hashId;
        allVaults[_vaultId].cid = _cid;
        
        // Update in user's vault array too
        for (uint256 i = 0; i < userVaults[msg.sender].length; i++) {
            if (userVaults[msg.sender][i].createdAt == allVaults[_vaultId].createdAt) {
                userVaults[msg.sender][i].hashId = _hashId;
                userVaults[msg.sender][i].cid = _cid;
                break;
            }
        }
        
        emit DataStored(msg.sender, _vaultId, _cid, _hashId);
    }
    
    // Get vault data
    function getVault(uint256 _vaultId) external view returns (address, string memory, string memory, string memory, string memory, uint256) {
        require(_vaultId < allVaults.length, "Vault does not exist");
        VaultData memory vault = allVaults[_vaultId];
        return (vault.owner, vault.name, vault.email, vault.hashId, vault.cid, vault.createdAt);
    }
    
    // Get user's vaults
    function getUserVaults(address _user) external view returns (uint256[] memory) {
        uint256 count = userVaultCount[_user];
        uint256[] memory vaultIds = new uint256[](count);
        uint256 found = 0;
        
        for (uint256 i = 0; i < allVaults.length && found < count; i++) {
            if (allVaults[i].owner == _user) {
                vaultIds[found] = i;
                found++;
            }
        }
        
        return vaultIds;
    }
    
    // Get all vault IDs (returns array of indices)
    function getDeployedVaults() external view returns (uint256[] memory) {
        uint256[] memory vaultIds = new uint256[](allVaults.length);
        for (uint256 i = 0; i < allVaults.length; i++) {
            vaultIds[i] = i;
        }
        return vaultIds;
    }
    
    // Get total vault count
    function getTotalVaultCount() external view returns (uint256) {
        return allVaults.length;
    }
    
    // Get user vault count
    function getUserVaultCount(address _user) external view returns (uint256) {
        return userVaultCount[_user];
    }
}