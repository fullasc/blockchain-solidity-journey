// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract OurToken is ERC20 {
  /**
   * @dev Constructor that gives msg.sender all of existing tokens.
   * @param initialSupply The amount of tokens to mint in WEI.
   */
  constructor(uint256 initialSupply) ERC20("OurToken", "OT") {
    _mint(msg.sender, initialSupply);
  }
}
