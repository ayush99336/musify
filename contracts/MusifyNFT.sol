// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MusifyNFT is ERC721URIStorage, ERC2981, Ownable {
    uint256 private _nextTokenId;

    struct License {
        address buyer;
        uint256 purchaseDate;
        uint256 expiryDate;
    }

    // Mapping from token ID to price in wei
    mapping(uint256 => uint256) public tokenPrices;
    
    // Mapping from token ID to list of licenses
    mapping(uint256 => License[]) public tokenLicenses;

    event NftMinted(uint256 indexed tokenId, string tokenURI, address indexed creator, uint256 price);
    event LicensePurchased(uint256 indexed tokenId, address indexed buyer, uint256 expiryDate);

    constructor() ERC721("MusifyNFT", "MNFT") Ownable(msg.sender) {}

    function mintToken(string memory _tokenURI, uint256 _price, uint96 _royaltyFeeNumerator) public returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, _tokenURI);
        tokenPrices[tokenId] = _price;

        // Set royalty for the token (msg.sender is the receiver)
        _setTokenRoyalty(tokenId, msg.sender, _royaltyFeeNumerator);

        emit NftMinted(tokenId, _tokenURI, msg.sender, _price);
        return tokenId;
    }

    function buyLicense(uint256 tokenId) public payable {
        uint256 price = tokenPrices[tokenId];
        require(msg.value >= price, "Insufficient payment");
        require(ownerOf(tokenId) != address(0), "Token does not exist");

        address creator = ownerOf(tokenId);
        
        // Distribute payment (Simple version: 100% to creator for now, usually platform fee + royalties logic here)
        // Since we are buying a LICENSE, not transferring the NFT, the royalty logic is slightly different.
        // But for simplicity in this hackathon, we send the full amount to the creator.
        
        (bool success, ) = payable(creator).call{value: msg.value}("");
        require(success, "Transfer failed");

        // Create 1 year license
        uint256 expiry = block.timestamp + 365 days;
        tokenLicenses[tokenId].push(License({
            buyer: msg.sender,
            purchaseDate: block.timestamp,
            expiryDate: expiry
        }));

        emit LicensePurchased(tokenId, msg.sender, expiry);
    }

    function getLicenses(uint256 tokenId) public view returns (License[] memory) {
        return tokenLicenses[tokenId];
    }

    // The following functions are overrides required by Solidity.

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
