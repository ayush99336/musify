const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MusifyNFT", function () {
    let musifyNFT;
    let owner, artist, buyer;

    beforeEach(async function () {
        [owner, artist, buyer] = await ethers.getSigners();
        const MusifyNFT = await ethers.getContractFactory("MusifyNFT");
        musifyNFT = await MusifyNFT.deploy();
    });

    it("Should mint a new token", async function () {
        const tokenURI = "ipfs://QmTest";
        const price = ethers.parseEther("1");
        const royaltyFee = 500; // 5%

        // Connect as artist and mint
        const tx = await musifyNFT.connect(artist).mintToken(tokenURI, price, royaltyFee);
        const receipt = await tx.wait();

        // Check ownership
        expect(await musifyNFT.ownerOf(0)).to.equal(artist.address);
        // Check price
        expect(await musifyNFT.tokenPrices(0)).to.equal(price);
    });

    it("Should allow buying a license", async function () {
        const tokenURI = "ipfs://QmTest";
        const price = ethers.parseEther("1");
        const royaltyFee = 500;

        await musifyNFT.connect(artist).mintToken(tokenURI, price, royaltyFee);

        // Buyer buys license
        // Check artist balance increase (approximate due to gas)
        await expect(
            musifyNFT.connect(buyer).buyLicense(0, { value: price })
        ).to.changeEtherBalances(
            [buyer, artist],
            [-price, price]
        );

        // Check license creation
        const licenses = await musifyNFT.getLicenses(0);
        expect(licenses.length).to.equal(1);
        expect(licenses[0].buyer).to.equal(buyer.address);

        // Check expiry (approx > now, < now + 1 year + margin)
        // Detailed time check usually requires block timestamp manipulation, simple check present
        expect(licenses[0].expiryDate).to.be.gt(Math.floor(Date.now() / 1000));
    });

    it("Should fail if payment is insufficient", async function () {
        const price = ethers.parseEther("1");
        await musifyNFT.connect(artist).mintToken("uri", price, 0);

        await expect(
            musifyNFT.connect(buyer).buyLicense(0, { value: ethers.parseEther("0.5") })
        ).to.be.revertedWith("Insufficient payment");
    });
});
