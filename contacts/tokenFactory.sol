// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract MemecoinFactory {
    using Address for address;
    
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
        
        emit MemecoinCreated(address(newCoin), name, symbol, initialAddress, initialSupply);
        
        return address(newCoin);
    }
}

contract Memecoin is ERC20 {
    constructor(
        string memory name,
        string memory symbol,
        address initialAddress,
        uint256 initialSupply
    ) ERC20(name, symbol) {
        _mint(initialAddress, initialSupply * 10**decimals());
    }
}