// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

error BasicNft__TokenDoesNotExist(uint256 tokenId);

contract BasicNft is ERC721 {
    string public constant TOKEN_URI = "ipfs://blablabla";
    uint256 private s_tokenCounter;

    event BlaMinted(uint256 tokenId);

    constructor() ERC721("Blabla bla", "BLA") {
        s_tokenCounter = 0;
    }

    function mint() public {
        _safeMint(msg.sender, s_tokenCounter);
        emit BlaMinted(s_tokenCounter);
        s_tokenCounter++;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        if (!_exists(tokenId)) {
            revert BasicNft__TokenDoesNotExist(tokenId);
        }
        return TOKEN_URI;
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }
}
