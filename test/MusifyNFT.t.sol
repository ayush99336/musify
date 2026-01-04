// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/contracts/MusifyNFT.sol";

contract MusifyNFTTest is Test {
    MusifyNFT public musifyNFT;
    address public owner;
    address public artist;
    address public buyer;

    function setUp() public {
        owner = address(this);
        artist = address(0x1);
        buyer = address(0x2);
        
        // Deploy contract
        musifyNFT = new MusifyNFT();
        
        // Fund buyer
        vm.deal(buyer, 100 ether);
    }

    function testMintToken() public {
        vm.prank(artist);
        uint256 tokenId = musifyNFT.mintToken("ipfs://test", 1 ether, 500);
        
        assertEq(musifyNFT.ownerOf(tokenId), artist);
        assertEq(musifyNFT.tokenURI(tokenId), "ipfs://test");
        assertEq(musifyNFT.tokenPrices(tokenId), 1 ether);
    }

    function testRoyaltyInfo() public {
        vm.prank(artist);
        uint256 tokenId = musifyNFT.mintToken("ipfs://test", 1 ether, 500);
        
        (address receiver, uint256 amount) = musifyNFT.royaltyInfo(tokenId, 100 ether);
        assertEq(receiver, artist);
        // 5% of 100 is 5
        assertEq(amount, 5 ether);
    }

    function testBuyLicense() public {
        vm.prank(artist);
        uint256 tokenId = musifyNFT.mintToken("ipfs://test", 1 ether, 500);

        vm.prank(buyer);
        musifyNFT.buyLicense{value: 1 ether}(tokenId);
        
        // Check licenses
        MusifyNFT.License[] memory licenses = musifyNFT.getLicenses(tokenId);
        assertEq(licenses.length, 1);
        assertEq(licenses[0].buyer, buyer);
        assertTrue(licenses[0].expiryDate > block.timestamp);
    }

    function testBuyLicenseInsufficientFunds() public {
        vm.prank(artist);
        uint256 tokenId = musifyNFT.mintToken("ipfs://test", 1 ether, 500);

        vm.prank(buyer);
        vm.expectRevert("Insufficient payment");
        musifyNFT.buyLicense{value: 0.5 ether}(tokenId);
    }
}
