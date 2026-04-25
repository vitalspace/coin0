// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Memecoin is ERC20 {
    constructor(
        string memory name,
        string memory symbol,
        address initialAddress,
        uint256 initialSupply
    ) ERC20(name, symbol) {
        _mint(initialAddress, initialSupply);
    }
}
