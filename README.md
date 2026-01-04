# MusifyNFT: Decentralized Music Royalty Platform

**MusifyNFT** is a decentralized music marketplace built on the Solana blockchain, designed to revolutionize how musicians distribute their work and how businesses and fans legally license music.

---

## The Problem

The current structure of the music industry often harms artists, especially concerning royalties. The traditional process of collecting and distributing royalties is **non-transparent, unfair, and prone to corruption**. The complex flow of funds through various intermediaries leads to significant cuts, payment delays, and a lack of clarity regarding the total income that creators should receive.

## The Solution: MusifyNFT

MusifyNFT empowers artists to turn their songs into Non-Fungible Tokens (NFTs), giving them full control over pricing, ownership, and, most importantly, transparent and automated royalty distribution. For businesses (like cafes and hotels) and fans, it provides a clear and legitimate way to license music.

---

## Key Features

* **Music NFT Minting:** Artists can easily upload their songs and album art, then mint them as NFTs on the Solana blockchain.
* **Automated Royalty Distribution:** When minting an NFT, artists can define multiple wallet addresses and royalty share percentages. Every time an NFT license is purchased, the payment is automatically distributed to all entitled parties.
* **Verified Commercial Licenses:** Buyers own a time-based commercial license (one year) recorded on the blockchain, providing a valid and immutable proof of playback rights.
* **Seamless Social Login:** Powered by **MetaMask Embedded Wallet (Web3Auth)**, users can create a wallet and log in using only their social or email accounts, eliminating the need for seed phrases.
* **Integrated Dashboards:** Separate dashboards for creators to track royalty income and for users to view their collection of active music licenses.

---

## How Web3Auth is Integrated

Web3Auth is the core of our user onboarding experience, making Web3 accessible to everyone, regardless of their technical expertise.

1.  **Effortless Onboarding:** We use the **Web3Auth Plug and Play Web SDK with React Hooks** (`@web3auth/modal/react`). This allows new users to instantly create a non-custodial Solana wallet simply by logging in with their existing Google, Twitter, or other social accounts.
2.  **Seedless Wallet Management:** By abstracting away complex concepts like seed phrases, Web3Auth provides a user experience that is as simple as a traditional web application, significantly lowering the barrier to entry.
3.  **Secure Transactions:** Once logged in, users can seamlessly sign and send transactions on the Solana network to mint NFTs, purchase licenses, and interact with the platform, all from a familiar interface.

The integration can be seen in `App.tsx` (handling the login flow) and `web3authContext.tsx` (configuring the Web3Auth client).

---

## Instructions for Running the Demo

To set up and run this project locally, follow these steps:

**1. Prerequisites:**
* Node.js (v16 or later)
* NPM or Yarn

**2. Clone the Repository:**
```bash
git clone https://github.com/Prestige14/musifynft-solana-web3auth.git/
cd musifynft-solana-web3auth
```

**3. Install Dependencies:**
```bash
npm install
```

**4. Set Up Environment Variables:**
Create a file named ```.env ``` in the root of the project folder, add your Pinata JWT key and Web3Auth Client ID:
```bash
VITE_WEB3AUTH_CLIENT_ID=YOUR_WEB3AUTH_CLIENT_ID
VITE_PINATA_JWT="YOUR_PINATA_JWT_KEY"
```

**5. Run the Application:**
```bash
npm run dev
```
