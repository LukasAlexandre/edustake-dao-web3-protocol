// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EduBadgeNFT is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    constructor() ERC721("EduBadge", "EDB") Ownable(msg.sender) {}

    function mintBadge(address to, string memory tokenUri) external onlyOwner returns (uint256) {
        _nextTokenId += 1;
        uint256 tokenId = _nextTokenId;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenUri);

        return tokenId;
    }
}
