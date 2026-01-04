require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.20",
    networks: {
        qieTestnet: {
            url: "https://rpc1testnet.qie.digital",
            chainId: 1983,
            accounts: ["0x4dc4ee9f97d46d2c8c225782a364404b84ad8c31dd393c935c04f92e860cb44e"]
        }
    }
};
