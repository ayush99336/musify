import { WEB3AUTH_NETWORK } from "@web3auth/modal";
import { CHAIN_NAMESPACES, IProvider, IAdapter } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { Web3Auth, Web3AuthOptions } from "@web3auth/modal";

const clientId = "BB8THy-x5Y75pkAFdyav4eIIA1mQs_mlVAnXPGbQKqm2ABRuNnPyvc3yrNPMPTNiZree5GL1B9AHuK3bvNNmIUM"; // get from https://dashboard.web3auth.io

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0x1618", // 5656 in hex
  rpcTarget: "https://rpc-main1.qiblockchain.online/",
  displayName: "Qie Blockchain",
  blockExplorerUrl: "https://mainnet.qiblockchain.online",
  ticker: "QIE",
  tickerName: "Qie",
};

const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig },
});

const web3AuthOptions: Web3AuthOptions = {
  clientId,
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  privateKeyProvider,
};

export const web3auth = new Web3Auth(web3AuthOptions);
export { chainConfig };