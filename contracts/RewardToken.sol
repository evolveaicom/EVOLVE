// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract EvolveReward is ERC20 {
    address public distributor;
    
    constructor() ERC20("Evolve Reward", "EVR") {
        _mint(msg.sender, 10_000_000 * 10**decimals());
        distributor = msg.sender;
    }
    
    modifier onlyDistributor() {
        require(msg.sender == distributor, "Not authorized");
        _;
    }
    
    function setDistributor(address newDistributor) external onlyDistributor {
        distributor = newDistributor;
    }
    
    function mintRewards(address to, uint256 amount) external onlyDistributor {
        _mint(to, amount);
    }
} 