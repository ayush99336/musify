# MusifyNFT - Decentralized Music NFT Marketplace

[🌐 Live Demo](https://musify-omega.vercel.app/)

## 🎵 Overview

MusifyNFT is a revolutionary blockchain-based music NFT marketplace built on **Qie Blockchain**. It empowers musicians and creators to tokenize their music, implement fair royalty distribution, and monetize their work through a transparent, decentralized licensing system.

### Key Features

- **🎨 Music NFT Minting**: Create unique NFTs for your music tracks with custom metadata
- **💰 On-Chain Royalty Splitting**: Automatically distribute revenue among multiple collaborators
- **📜 Smart Licensing System**: Purchase time-limited licenses (1 year) to access music
- **🔗 IPFS Storage**: Decentralized storage for audio files, cover art, and metadata via Pinata
- **🌐 MetaMask Integration**: Simple wallet connection for seamless user experience
- **📊 Platform Explorer**: Track all transactions and royalty distributions on-chain

## 🏆 Hackathon Alignment

This project is designed for the **QIE Blockchain Hackathon** and addresses multiple prize categories:

- **NFTs Beyond Art**: Music licensing and royalty management through NFTs
- **Tokenization for All**: Enabling independent musicians to tokenize their work
- **DeFi Without Borders**: Instant cross-border royalty payments to collaborators

## 🛠️ Technology Stack

### Blockchain
- **Network**: Qie Blockchain Testnet (Chain ID: 1983)
- **Smart Contracts**: Solidity 0.8.20 (ERC-721, ERC-2981)
- **Development Tools**: Foundry, Hardhat
- **EVM Version**: London (for Qie compatibility)

### Frontend
- **Framework**: React + TypeScript + Vite
- **Web3 Library**: Ethers.js v6
- **Wallet**: MetaMask (window.ethereum)
- **Styling**: Tailwind CSS

### Storage & Backend
- **IPFS**: Pinata for decentralized file storage
- **Database**: Firebase Firestore for off-chain metadata
- **Authentication**: MetaMask wallet-based

## 📋 Smart Contract Features

### MusifyNFT Contract (`0xB01f8ce6924FC535636C17d9ca491c0Fea4602d5`)

```solidity
// Core Functions
- mintToken(): Create music NFT with royalty splitting
- buyLicense(): Purchase 1-year license with automatic revenue distribution
- getLicenses(): View all licenses for a token
```

**Royalty Splitting Mechanism**:
- Define multiple payees (collaborators, producers, artists)
- Set percentage shares (must total 100%)
- Automatic on-chain distribution when licenses are purchased
- Transparent and immutable revenue sharing

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MetaMask browser extension
- Qie Testnet tokens (for gas fees)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd musifynft-solana-web3auth-main

# Install dependencies
npm install

# Set up environment variables
# Create .env file with:
VITE_PINATA_JWT=your_pinata_jwt_here

# Start development server
npm run dev
```

### Network Configuration

Add Qie Testnet to MetaMask:
- **Network Name**: QIE Testnet
- **RPC URL**: https://rpc1testnet.qie.digital
- **Chain ID**: 1983
- **Currency Symbol**: QIE
- **Block Explorer**: https://testnet.qie.digital/

## 📖 Usage

### For Musicians (Creators)

1. **Connect Wallet**: Click "Connect Wallet" and approve MetaMask
2. **Create NFT**: 
   - Upload cover art and audio file
   - Set track title and price in QIE
   - Define royalty recipients and their shares (must total 100%)
3. **Mint**: Confirm transaction to mint your music NFT
4. **Track Revenue**: View earnings in Creator Dashboard

### For Listeners (Buyers)

1. **Browse Marketplace**: Explore available music NFTs
2. **Purchase License**: Buy a 1-year license to access the track
3. **Play Music**: Stream licensed tracks directly in the app
4. **View Licenses**: Check your active licenses in My Licenses

## 🏗️ Project Structure

```
musifynft-solana-web3auth-main/
├── src/
│   ├── contracts/
│   │   └── MusifyNFT.sol          # Main smart contract
│   ├── components/
│   │   ├── Marketplace.tsx         # NFT listing page
│   │   ├── CreateNft.tsx          # Minting interface
│   │   ├── NftDetail.tsx          # Individual NFT view
│   │   ├── CreatorDashboard.tsx   # Creator analytics
│   │   └── UserDashboard.tsx      # User licenses
│   ├── App.tsx                    # Main application
│   ├── firebaseConfig.ts          # Firebase setup
│   └── types.ts                   # TypeScript definitions
├── test/
│   └── MusifyNFT.t.sol           # Foundry tests
├── scripts/
│   └── deploy.cjs                # Deployment script
├── foundry.toml                  # Foundry configuration
└── hardhat.config.cjs            # Hardhat configuration
```

## 🧪 Testing

### Smart Contract Tests (Foundry)

```bash
# Run all tests
npm test

# Or use Foundry directly
forge test

# Test with verbosity
forge test -vvv
```

### Test Coverage
- ✅ NFT minting with royalty splitting
- ✅ Revenue distribution validation
- ✅ License purchasing
- ✅ Invalid share percentage handling

## 🔐 Security Features

- **Wallet-based Authentication**: No passwords, only MetaMask signatures
- **On-chain Validation**: All royalty splits validated in smart contract
- **Immutable Licenses**: License records stored permanently on blockchain
- **IPFS Storage**: Censorship-resistant file storage

## 🌟 Unique Value Propositions

1. **Fair Revenue Distribution**: Automatic, transparent royalty splitting
2. **No Intermediaries**: Direct artist-to-listener transactions
3. **Time-based Licensing**: 1-year licenses instead of perpetual ownership
4. **Collaborative Creation**: Support for multiple creators per track
5. **Cross-border Payments**: Instant global royalty distribution

## 📊 Deployment Information

- **Contract Address**: `0xB01f8ce6924FC535636C17d9ca491c0Fea4602d5`
- **Network**: Qie Testnet
- **Deployer**: `0x14d67Eece2ce6312b20f9721351C6AeD500aF7Db`
- **Deployment TX**: [View on Explorer](https://testnet.qie.digital/tx/0x0571ee34d97d1b31aeee570625e01e5efd13cd742f638855c65806bf4bf0441c)

## 🤝 Contributing

This project was built for the QIE Blockchain Hackathon. Contributions, issues, and feature requests are welcome!

## 📝 License

MIT License - see LICENSE file for details

## 🔗 Links

- [Qie Blockchain](https://qie.digital)
- [Pinata IPFS](https://pinata.cloud)
- [OpenZeppelin Contracts](https://openzeppelin.com/contracts)

## 👥 Team

Built with ❤️ for the QIE Blockchain Hackathon

---

**Note**: This is a testnet deployment. For production use, deploy to Qie Mainnet and update network configurations accordingly.
