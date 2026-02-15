// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Token is ERC20, Ownable {

    uint256 public constant MAX_SUPPLY = 1_000_000 * 10**18;
    address public faucet;

    constructor(address _faucet)
        ERC20("Partnr Token", "PRT")
        Ownable(msg.sender)
    {
        faucet = _faucet;
    }

    modifier onlyFaucet() {
        require(msg.sender == faucet, "Only faucet can mint");
        _;
    }

    function mint(address to, uint256 amount) external onlyFaucet {
        require(totalSupply() + amount <= MAX_SUPPLY, "Max supply exceeded");
        _mint(to, amount);
    }

    function setFaucet(address _faucet) external onlyOwner {
        faucet = _faucet;
    }
}
