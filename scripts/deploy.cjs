const hre = require("hardhat");

async function main() {
    console.log("Deploying MusifyNFT to Qie Testnet...");

    const MusifyNFT = await hre.ethers.getContractFactory("MusifyNFT");
    const musifyNFT = await MusifyNFT.deploy();

    await musifyNFT.waitForDeployment();

    const address = await musifyNFT.getAddress();
    console.log("MusifyNFT deployed to:", address);
    console.log("\nUpdate CONTRACT_ADDRESS in src/App.tsx with:", address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
