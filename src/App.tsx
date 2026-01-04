import "./App.css";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import axios from "axios";
import { db } from "./firebaseConfig";
import { collection, onSnapshot, addDoc, doc, updateDoc, query, serverTimestamp, arrayUnion, Timestamp } from "firebase/firestore";

// Impor Tipe Data dan Komponen
import { MusicNFT, RoyaltyInfo, License } from "./types";
import { NftDetail } from "./components/NftDetail";
import { Marketplace } from "./components/Marketplace";
import { CreatorDashboard } from "./components/CreatorDashboard";
import { UserDashboard } from "./components/UserDashboard";
import { PlatformExplorer } from "./components/PlatformExplorer";
import { CreateNft } from "./components/CreateNft";
import { PlaybackHistory } from "./components/PlaybackHistory";
import { BalanceDisplay } from "./components/BalanceDisplay";

// Deployed on Qie Testnet
const CONTRACT_ADDRESS = "0xdD91ee143277438168B81eC6f1AEdFc44Fd9F9F9"; 
// Simplified ABI for MusifyNFT
const CONTRACT_ABI = [
  "function mintToken(string memory _tokenURI, uint256 _price, uint96 _royaltyFeeNumerator, address[] memory _payees, uint256[] memory _shares) public returns (uint256)",
  "function buyLicense(uint256 tokenId) public payable",
  "event NftMinted(uint256 indexed tokenId, string tokenURI, address indexed creator, uint256 price)"
];

const QIE_CHAIN_ID_HEX = "0x7BF"; // 1983
const QIE_RPC_URL = "https://rpc1testnet.qie.digital";
const QIE_EXPLORER_URL = "https://testnet.qie.digital/";

// Komponen Navbar yang Diperbarui
function Navbar({ currentPage, setCurrentPage, logout, provider, transactionCount, account }: any) {
    const [copyText, setCopyText] = useState('Copy');

    const handleCopyAddress = () => {
        if (account) {
            navigator.clipboard.writeText(account).then(() => {
                setCopyText('Copied!');
                setTimeout(() => setCopyText('Copy'), 2000);
            });
        }
    };

    return (
        <header className="app-header">
            <div className="logo" onClick={() => { setCurrentPage('marketplace'); }}>
                Musify<span>NFT (QIE)</span>
            </div>
            <nav className="main-nav">
                <button onClick={() => setCurrentPage('marketplace')} className={`nav-button ${currentPage === 'marketplace' ? 'active' : ''}`}>Marketplace</button>
                <button onClick={() => setCurrentPage('create')} className={`nav-button ${currentPage === 'create' ? 'active' : ''}`}>Create</button>
                <button onClick={() => setCurrentPage('creator-dashboard')} className={`nav-button ${currentPage === 'creator-dashboard' ? 'active' : ''}`}>Creator Dashboard</button>
                <button onClick={() => setCurrentPage('user-dashboard')} className={`nav-button ${currentPage === 'user-dashboard' ? 'active' : ''}`}>My Licenses</button>
                <button onClick={() => setCurrentPage('playback-history')} className={`nav-button ${currentPage === 'playback-history' ? 'active' : ''}`}>History</button>
                <button onClick={() => setCurrentPage('explorer')} className={`nav-button ${currentPage === 'explorer' ? 'active' : ''}`}>Explorer</button>
            </nav>
            <div className="user-section">
                <div className="user-info">
                    {account ? (
                        <div className="wallet-info">
                            <small>{account.substring(0, 6)}...{account.substring(account.length - 4)}</small>
                            <button onClick={handleCopyAddress} className="copy-button" title="Copy address">
                                {copyText === 'Copy' ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                )}
                            </button>
                            <BalanceDisplay provider={provider} refreshTrigger={transactionCount} />
                        </div>
                    ) : (
                        <button onClick={logout} className="login-button-small">
                            Connect Wallet
                        </button>
                    )}
                     {account && (
                        <button onClick={logout} className="logout-button">
                             Disconnect
                        </button>
                     )}
                </div>
            </div>
        </header>
    );
}

function App() {
  const [provider, setProvider] = useState<any | null>(null); // Metamask provider
  const [account, setAccount] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [nfts, setNfts] = useState<MusicNFT[]>([]);
  const [isLoadingNfts, setIsLoadingNfts] = useState(true);
  const [selectedNft, setSelectedNft] = useState<MusicNFT | null>(null);
  const [currentPage, setCurrentPage] = useState<'marketplace' | 'create' | 'creator-dashboard' | 'user-dashboard' | 'explorer' | 'playback-history'>('marketplace');
  const [isMinting, setIsMinting] = useState(false);
  const [mintingStatus, setMintingStatus] = useState('');
  const [transactionCount, setTransactionCount] = useState(0);

  const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

  useEffect(() => {
    // Check if wallet is already connected
    const checkConnection = async () => {
        if ((window as any).ethereum) {
            const ethProvider = (window as any).ethereum;
            try {
                const accounts = await ethProvider.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                    setProvider(ethProvider);
                    // Ensure Qie chain
                    await switchNetwork(ethProvider);
                }
            } catch (e) {
                console.error("Error checking connection:", e);
            }
        }
        setLoading(false);
    };
    checkConnection();
  }, []);

  const switchNetwork = async (ethProvider: any) => {
      try {
          await ethProvider.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: QIE_CHAIN_ID_HEX }],
          });
      } catch (switchError: any) {
          // This error code indicates that the chain has not been added to MetaMask.
          if (switchError.code === 4902) {
              try {
                  await ethProvider.request({
                      method: 'wallet_addEthereumChain',
                      params: [
                          {
                              chainId: QIE_CHAIN_ID_HEX,
                              chainName: 'Qie Blockchain',
                              rpcUrls: [QIE_RPC_URL],
                              nativeCurrency: {
                                  name: 'QIE Token',
                                  symbol: 'QIE',
                                  decimals: 18,
                              },
                              blockExplorerUrls: [QIE_EXPLORER_URL],
                          },
                      ],
                  });
              } catch (addError) {
                   console.error("Failed to add Qie network:", addError);
                   alert("Please add Qie Blockchain to your wallet manually.");
              }
          } else {
              console.error("Failed to switch network:", switchError);
          }
      }
  };

  const login = async () => {
    if (!(window as any).ethereum) {
        alert("Please install MetaMask or another Web3 wallet!");
        return;
    }
    try {
        const ethProvider = (window as any).ethereum;
        const accounts = await ethProvider.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        setProvider(ethProvider);
        await switchNetwork(ethProvider);
    } catch (e) {
        console.error("Connection failed:", e);
    }
  };

  const logout = async () => {
    setAccount(null);
    setProvider(null);
    // Metamask does not support programmatic disconnect
  };

  useEffect(() => {
    const nftsCollection = collection(db, "nfts");
    const q = query(nftsCollection);
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const nftsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MusicNFT));
      if (nftsData.every(nft => nft.createdAt)) {
        nftsData.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
      }
      setNfts(nftsData);
      setIsLoadingNfts(false);
    });
    return () => unsubscribe();
  }, []);

  const handleCreateNft = async (newData: {
    trackTitle: string;
    price: number;
    coverImageFile: File;
    audioFile: File;
    royaltyInfo: RoyaltyInfo;
  }) => {
    if (!PINATA_JWT) {
        alert("Pinata JWT is not configured.");
        return;
    }
    if (!provider || !account) {
        alert("Wallet not connected!");
        return;
    }

    setIsMinting(true);
    try {
        setMintingStatus('Uploading files to IPFS...');
        const uploadToPinata = async (file: File) => {
            const formData = new FormData();
            formData.append('file', file);
            const response = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
                headers: { 'Authorization': `Bearer ${PINATA_JWT}` }
            });
            return `https://ipfs.io/ipfs/${response.data.IpfsHash}`;
        };
        const imageUrl = await uploadToPinata(newData.coverImageFile);
        const audioUrl = await uploadToPinata(newData.audioFile);
        
        // Metadata for NFT
        const metadata = {
            name: newData.trackTitle,
            description: "Music NFT on Qie Blockchain",
            image: imageUrl,
            animation_url: audioUrl,
            properties: {
                royaltyInfo: newData.royaltyInfo
            }
        };

        const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
        const metadataFile = new File([metadataBlob], "metadata.json");
        const metadataUrl = await uploadToPinata(metadataFile);

        setMintingStatus('Awaiting wallet confirmation...');
        
        const ethersProvider = new ethers.BrowserProvider(provider);
        const signer = await ethersProvider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        
        const priceWei = ethers.parseEther(newData.price.toString());
        
        // Prepare Revenue Splitting
        const payees = newData.royaltyInfo.recipients.map(r => r.address);
        const shares = newData.royaltyInfo.recipients.map(r => Math.round(Number(r.share))); 
        
        const totalShare = shares.reduce((a, b) => a + b, 0);
        if (totalShare !== 100) {
            throw new Error(`Total share usage must be 100%. Current: ${totalShare}%`);
        }

        const royaltyFee = 500; 

        const tx = await contract.mintToken(metadataUrl, priceWei, royaltyFee, payees, shares);
        setMintingStatus('Confirming transaction...');
        const receipt = await tx.wait();
        
        if (receipt.status === 1) {
            setMintingStatus('Saving to database...');
            const recipientAddresses = newData.royaltyInfo.recipients.map(r => r.address);
            // const creatorAddress = account; // Use account from state or signer
            
            const creatorLicense: License = {
                ownerAddress: account,
                purchaseDate: Timestamp.now(),
                expiryDate: Timestamp.fromDate(new Date('9999-12-31')),
            };

            await addDoc(collection(db, "nfts"), {
                trackTitle: newData.trackTitle,
                price: newData.price,
                imageUrl: imageUrl, 
                audioUrl: audioUrl,
                creator: account,
                licensees: [creatorLicense],
                licenseeAddresses: [account],
                artistName: 'Unknown Artist',
                createdAt: serverTimestamp(),
                royaltyInfo: newData.royaltyInfo,
                recipientAddresses: recipientAddresses,
                tokenURI: metadataUrl,
            });
            setCurrentPage('marketplace');
            setTransactionCount(c => c + 1);
            alert("NFT Minted Successfully on Qie Blockchain!");
        } else {
             throw new Error("Transaction failed on-chain");
        }
    } catch (e) {
        console.error("Error during minting process: ", e);
        alert(`Minting failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
        setIsMinting(false);
        setMintingStatus('');
    }
  };

  const handlePurchaseSuccess = async (nftId: string, buyerAddress: string, txHash: string) => {
    const nftDocRef = doc(db, "nfts", nftId);
    const selectedNft = nfts.find(n => n.id === nftId);
    if (!selectedNft) return;

    const royaltyTxRef = collection(db, `nfts/${nftId}/royaltyTransactions`);
    await addDoc(royaltyTxRef, {
        buyerAddress: buyerAddress,
        totalAmount: selectedNft.price,
        purchaseDate: serverTimestamp(),
        txHash: txHash,
    });
    
    const purchaseDate = new Date();
    const expiryDate = new Date(purchaseDate.setFullYear(purchaseDate.getFullYear() + 1));
    
    const newLicense: License = {
        ownerAddress: buyerAddress,
        purchaseDate: Timestamp.fromDate(new Date()),
        expiryDate: Timestamp.fromDate(expiryDate),
    };

    await updateDoc(nftDocRef, {
        licensees: arrayUnion(newLicense),
        licenseeAddresses: arrayUnion(buyerAddress)
    });

    setTransactionCount(c => c + 1);
    alert("License purchased successfully! Valid for 1 year.");
  };

  const handlePlayTrack = async (nftId: string, nftTitle: string) => {
    if (!account) {
      console.log("User not logged in, cannot log play history.");
      return;
    }
    try {
        // Just use account from state, no need to sign for reading usually, but for logging we just need ID
        await addDoc(collection(db, "playHistory"), {
            userId: account,
            nftId: nftId,
            nftTitle: nftTitle,
            playedAt: serverTimestamp(),
        });
        console.log(`Track play for "${nftTitle}" logged to Firestore.`);
    } catch (e) {
        console.error("Failed to log track play to Firestore:", e);
    }
  };

  const handleSelectNft = (nft: MusicNFT) => {
      setSelectedNft(nft);
  };
  
  const handleSetCurrentPage = (page: 'marketplace' | 'create' | 'creator-dashboard' | 'user-dashboard' | 'explorer' | 'playback-history') => {
      setSelectedNft(null);
      setCurrentPage(page);
  }

  const renderCurrentPage = () => {
    if (selectedNft) {
        return <NftDetail 
            nft={selectedNft} 
            onBack={() => setSelectedNft(null)} 
            onPurchaseSuccess={handlePurchaseSuccess}
            onPlayTrack={handlePlayTrack} 
            provider={provider}
            contractAddress={CONTRACT_ADDRESS}
            contractAbi={CONTRACT_ABI}
        />;
    }

    // Pass account directly to dashboards
    const UserDashboardWrapper = () => {
        return account ? <UserDashboard userAddress={account} onSelectNft={handleSelectNft} /> : <div className="loading">Please connect wallet</div>;
    }

    const CreatorDashboardWrapper = () => {
        return account ? <CreatorDashboard creatorAddress={account} onSelectNft={handleSelectNft} /> : <div className="loading">Please connect wallet</div>;
    }

    switch (currentPage) {
      case 'marketplace':
        return isLoadingNfts ? <div className="loading">Loading...</div> : <Marketplace nfts={nfts} onSelectNft={handleSelectNft} />;
      case 'create':
        return <CreateNft 
            onSubmit={handleCreateNft} 
            onBack={() => handleSetCurrentPage('marketplace')} 
            isMinting={isMinting}
            mintingStatus={mintingStatus}
        />;
      case 'creator-dashboard':
         return <CreatorDashboardWrapper />;
      case 'user-dashboard':
         return <UserDashboardWrapper />;
      case 'playback-history':
         return <PlaybackHistory />;
      case 'explorer':
         return <PlatformExplorer />;
      default:
        return <Marketplace nfts={nfts} onSelectNft={handleSelectNft} />;
    }
  };

  if (loading) {
      return <div className="loading">Loading...</div>;
  }

  if (!account) {
    return (
        <div className="login-container">
            <div className="login-box">
                <h1 className="logo">Musify<span>NFT (QIE)</span></h1>
                <h2>The Future of Music Ownership</h2>
                <p>Connect your wallet to start collecting and creating music NFTs on Qie Blockchain.</p>
                <button onClick={login} className="login-button">
                    Connect Wallet (MetaMask)
                </button>
            </div>
        </div>
    );
  }

  return (
      <div className="app-container">
        <Navbar 
            currentPage={currentPage}
            setCurrentPage={handleSetCurrentPage}
            logout={logout}
            provider={provider}
            transactionCount={transactionCount}
            account={account}
        />
        <main className="main-content">
            {renderCurrentPage()}
        </main>
      </div>
  );
}

export default App;
