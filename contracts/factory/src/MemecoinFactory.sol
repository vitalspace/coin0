// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { Memecoin } from "./Memecoin.sol";

contract MemecoinFactory {
    address[] public allTokens;
    mapping(address => bool) public isToken;
    
    event MemecoinCreated(
        address indexed contractAddress,
        string name,
        string symbol,
        address initialAddress,
        uint256 initialSupply
    );
    
    function createMemecoin(
        string memory name,
        string memory symbol,
        address initialAddress,
        uint256 initialSupply
    ) external returns (address) {
        Memecoin newCoin = new Memecoin(
            name,
            symbol,
            initialAddress,
            initialSupply
        );
        
        address tokenAddress = address(newCoin);
        allTokens.push(tokenAddress);
        isToken[tokenAddress] = true;
        
        emit MemecoinCreated(
            tokenAddress,
            name,
            symbol,
            initialAddress,
            initialSupply
        );
        
        return tokenAddress;
    }
    
    function getAllTokens() external view returns (address[] memory) {
        return allTokens;
    }
    
    function getTokenCount() external view returns (uint256) {
        return allTokens.length;
    }
    
    function getToken(uint256 index) external view returns (address) {
        require(index < allTokens.length, "Index out of bounds");
        return allTokens[index];
    }
}
