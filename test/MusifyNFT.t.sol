// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/contracts/MusifyNFT.sol";

contract MusifyNFTTest is Test {
    MusifyNFT public musifyNFT;
    address public owner;
    address public artist1;
    address public artist2;
    address public artist3;
    address public buyer;

    function setUp() public {
        owner = address(this);
        artist1 = address(0x1);
        artist2 = address(0x2);
        artist3 = address(0x3);
        buyer = address(0x4);
        
        // Deploy contract
        musifyNFT = new MusifyNFT();
        
        // Fund buyer
        vm.deal(buyer, 100 ether);
    }

    function testMintToken() public {
        vm.startPrank(artist1);
        address[] memory payees = new address[](1);
        payees[0] = artist1;
        uint256[] memory shares = new uint256[](1);
        shares[0] = 100;

        uint256 tokenId = musifyNFT.mintToken("ipfs://test", 1 ether, 500, payees, shares);
        
        assertEq(musifyNFT.ownerOf(tokenId), artist1);
        assertEq(musifyNFT.tokenURI(tokenId), "ipfs://test");
        assertEq(musifyNFT.tokenPrices(tokenId), 1 ether);
        vm.stopPrank();
    }

    function testMintInvalidShares() public {
        vm.startPrank(artist1);
        address[] memory payees = new address[](2);
        payees[0] = artist1;
        payees[1] = artist2;
        uint256[] memory shares = new uint256[](2);
        shares[0] = 50;
        shares[1] = 40; // Sum = 90, should fail

        vm.expectRevert("Total share must be 100");
        musifyNFT.mintToken("ipfs://test", 1 ether, 500, payees, shares);
        vm.stopPrank();
    }

    function testRevenueSharing() public {
        vm.startPrank(artist1);
        address[] memory payees = new address[](3);
        payees[0] = artist1;
        payees[1] = artist2;
        payees[2] = artist3;
        uint256[] memory shares = new uint256[](3);
        shares[0] = 50;
        shares[1] = 30;
        shares[2] = 20;

        uint256 tokenId = musifyNFT.mintToken("ipfs://collab", 10 ether, 500, payees, shares);
        vm.stopPrank();

        uint256 balance1Before = artist1.balance;
        uint256 balance2Before = artist2.balance;
        uint256 balance3Before = artist3.balance;

        vm.prank(buyer);
        musifyNFT.buyLicense{value: 10 ether}(tokenId);

        // Check balances
        assertEq(artist1.balance - balance1Before, 5 ether);
        assertEq(artist2.balance - balance2Before, 3 ether);
        assertEq(artist3.balance - balance3Before, 2 ether);
        
        // Check license
        MusifyNFT.License[] memory licenses = musifyNFT.getLicenses(tokenId);
        assertEq(licenses.length, 1);
        assertEq(licenses[0].buyer, buyer);
    }
}
