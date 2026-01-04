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

    struct RevenueShare { // Renamed from Payee to avoid confusion with OpenZeppelin
        address payee;
        uint256 share; // Percentage (0-100)
    }

    // Mapping from token ID to price in wei
    mapping(uint256 => uint256) public tokenPrices;
    
    // Mapping from token ID to list of licenses
    mapping(uint256 => License[]) public tokenLicenses;

    // Mapping from token ID to revenue sharing info
    mapping(uint256 => RevenueShare[]) public tokenRevenueShares;

    event NftMinted(uint256 indexed tokenId, string tokenURI, address indexed creator, uint256 price);
    event LicensePurchased(uint256 indexed tokenId, address indexed buyer, uint256 expiryDate);

    constructor() ERC721("MusifyNFT", "MNFT") Ownable(msg.sender) {}

    function mintToken(
        string memory _tokenURI, 
        uint256 _price, 
        uint96 _royaltyFeeNumerator,
        address[] memory _payees,
        uint256[] memory _shares
    ) public returns (uint256) {
        require(_payees.length == _shares.length, "Payees and shares length mismatch");
        
        uint256 totalShare = 0;
        for (uint256 i = 0; i < _shares.length; i++) {
            totalShare += _shares[i];
        }
        require(totalShare == 100, "Total share must be 100");

        uint256 tokenId = _nextTokenId++;
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, _tokenURI);
        tokenPrices[tokenId] = _price;

        for (uint256 i = 0; i < _payees.length; i++) {
            tokenRevenueShares[tokenId].push(RevenueShare({
                payee: _payees[i],
                share: _shares[i]
            }));
        }

        // Set royalty for the token (msg.sender is the receiver for secondary sales on marketplaces)
        // Note: For advanced use cases, this should also point to a splitter contract.
        _setTokenRoyalty(tokenId, msg.sender, _royaltyFeeNumerator);

        emit NftMinted(tokenId, _tokenURI, msg.sender, _price);
        return tokenId;
    }

    function buyLicense(uint256 tokenId) public payable {
        uint256 price = tokenPrices[tokenId];
        require(msg.value >= price, "Insufficient payment");
        require(ownerOf(tokenId) != address(0), "Token does not exist");

        // Distribute payment based on revenue shares
        RevenueShare[] memory shares = tokenRevenueShares[tokenId];
        uint256 remaining = msg.value;

        for (uint256 i = 0; i < shares.length; i++) {
            uint256 payment = (msg.value * shares[i].share) / 100;
            if (payment > 0) {
                (bool success, ) = payable(shares[i].payee).call{value: payment}("");
                require(success, "Transfer failed");
                remaining -= payment;
            }
        }
        // Refund any dust or handle it (though math above shouldn't leave much if 100%)

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
