// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "base64-sol/base64.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

error DynamicSvgNft__TokenAlreadyMinted(uint256 tokenId);

contract DynamicSvgNft is ERC721 {
    // mint
    // store our SVG information somewhere
    // some logic to say "show X image" or "show Y image"

    uint256 private s_tokenCounter;
    string private s_lowSvg;
    string private s_highSvg;
    string private constant base64EncodedSvgPrefix =
        "data:image/svg+xml;base64,";
    AggregatorV3Interface internal immutable i_priceFeed;
    mapping(uint256 => int256) public s_tokenIdToHighValue;

    event NftMinted(address minter, uint256 tokenCounter, int256 value);

    constructor(
        address priceFeedAddress,
        string memory lowSvg,
        string memory highSvg
    ) ERC721("Dynamic SVG NFT", "DSN") {
        s_tokenCounter = 0;
        s_lowSvg = svgToImageURI(lowSvg);
        s_highSvg = svgToImageURI(highSvg);
        i_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    function svgToImageURI(string memory svg)
        public
        pure
        returns (string memory)
    {
        string memory svgBase64Encoded = Base64.encode(
            bytes(abi.encodePacked(svg))
        );
        return
            string(abi.encodePacked(base64EncodedSvgPrefix, svgBase64Encoded));
    }

    function mintNft(int256 highValue) public {
        s_tokenIdToHighValue[s_tokenCounter] = highValue;
        _safeMint(msg.sender, s_tokenCounter);
        emit NftMinted(msg.sender, s_tokenCounter, highValue);
        s_tokenCounter++;
    }

    function _baseURI() internal pure override returns (string memory) {
        return "data:application/json;base64,";
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        if (!_exists(tokenId)) {
            revert DynamicSvgNft__TokenAlreadyMinted(tokenId);
        }
        string memory imageURI = s_lowSvg;
        (, int256 price, , , ) = i_priceFeed.latestRoundData();
        if (price >= s_tokenIdToHighValue[tokenId]) {
            imageURI = s_highSvg;
        }

        return
            string(
                abi.encodePacked(
                    _baseURI(),
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{ "name":"',
                                name(),
                                '", "description": "An NFT that can change its image dynamically", ',
                                '"attributes": [ { "trait_type": "Image", "value": "100" } ], ',
                                '"image": "',
                                imageURI,
                                '" }'
                            )
                        )
                    )
                )
            );
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }

    function getLowSvgNft() public view returns (string memory) {
        return s_lowSvg;
    }

    function getHighSvgNft() public view returns (string memory) {
        return s_highSvg;
    }

    function getPriceFeed() public view returns (address) {
        return address(i_priceFeed);
    }
}
