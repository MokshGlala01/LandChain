// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CarbonCredit is ERC20, Ownable {
    constructor() ERC20("LandChainCarbonCredit", "LCCC") Ownable(msg.sender) {}

    function mintCredits(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function burnCredits(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }
}
