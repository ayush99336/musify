import "./App.css";
import { useEffect, useState } from "react";
import { web3auth } from "./web3authContext";
import { IProvider } from "@web3auth/base";
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

// Placeholder Address - **YOU MUST DEPLOY CONTRACT AND UPDATE THIS**
const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"; 
// Simplified ABI for MusifyNFT
const CONTRACT_ABI = [
  "function mintToken(string memory _tokenURI, uint256 _price, uint96 _royaltyFeeNumerator) public returns (uint256)",
  "function buyLicense(uint256 tokenId) public payable",
  "event NftMinted(uint256 indexed tokenId, string tokenURI, address indexed creator, uint256 price)"
];

// Komponen Navbar yang Diperbarui
function Navbar({ currentPage, setCurrentPage, logout, provider, transactionCount }: any) {
    const [account, setAccount] = useState<string | null>(null);
    const [copyText, setCopyText] = useState('Copy');

    useEffect(() => {
        const getAccount = async () => {
            if (provider) {
                const ethersProvider = new ethers.BrowserProvider(provider);
                const signer = await ethersProvider.getSigner();
                setAccount(await signer.getAddress());
            } else {
                setAccount(null);
            }
        };
        getAccount();
    }, [provider, transactionCount]);

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
                    {account && (
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
                    )}
                    <button onClick={logout} className="logout-button">
                        Log Out
                    </button>
                </div>
            </div>
        </header>
    );
}

function App() {
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
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
    const init = async () => {
      try {
        await (web3auth as any).initModal();
        setProvider(web3auth.provider);
        if (web3auth.connected) {
          setLoggedIn(true);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    const web3authProvider = await web3auth.connect();
    setProvider(web3authProvider);
    setLoggedIn(true);
  };

  const logout = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    await web3auth.logout();
    setProvider(null);
    setLoggedIn(false);
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
    if (!provider) {
        alert("Wallet not connected!");
        return;
    }

    if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
        alert("Smart Contract Address not set! Please deploy contract and update CONTRACT_ADDRESS in App.tsx");
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

        // Upload metadata to IPFS
        const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
        const metadataFile = new File([metadataBlob], "metadata.json");
        const metadataUrl = await uploadToPinata(metadataFile);

        setMintingStatus('Awaiting wallet confirmation...');
        
        const ethersProvider = new ethers.BrowserProvider(provider);
        const signer = await ethersProvider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        
        // Convert price to Wei
        const priceWei = ethers.parseEther(newData.price.toString());
        // Calculate royalty (basis points, e.g., 5% = 500) - Simplified to use first recipient share for now or total
        // Note: Contract expects uint96 for royalty numerator (denominator is 10000)
        // Taking the total share (should be 100 in input, but for royalty fee let's say we set a standard or derive)
        // For this demo, let's assume specific creator royalty is 5% hardcoded or derived. 
        // Real implementation would split payment. Here we just set ERC2981 royalty.
        const royaltyFee = 500; // 5%

        const tx = await contract.mintToken(metadataUrl, priceWei, royaltyFee);
        setMintingStatus('Confirming transaction...');
        const receipt = await tx.wait();
        
        // Extract Token ID from event
        // Note: basic parsing, robust apps verify log topics
        // Assuming NftMinted is the last event or finding it:
        // For simplicity in this hackathon, we proceed.
        // In real app we get tokenId from receipt.logs

        if (receipt.status === 1) {
            setMintingStatus('Saving to database...');
            const recipientAddresses = newData.royaltyInfo.recipients.map(r => r.address);
            const creatorAddress = await signer.getAddress();
            
            const creatorLicense: License = {
                ownerAddress: creatorAddress,
                purchaseDate: Timestamp.now(),
                expiryDate: Timestamp.fromDate(new Date('9999-12-31')),
            };

            await addDoc(collection(db, "nfts"), {
                trackTitle: newData.trackTitle,
                price: newData.price,
                imageUrl: imageUrl, // Storing separate for UI speed, but is in metadata
                audioUrl: audioUrl,
                creator: creatorAddress,
                licensees: [creatorLicense],
                licenseeAddresses: [creatorAddress],
                artistName: 'Unknown Artist',
                createdAt: serverTimestamp(),
                royaltyInfo: newData.royaltyInfo,
                recipientAddresses: recipientAddresses,
                tokenURI: metadataUrl,
                // On-chain ID would be ideal to store here too
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
    // This is called AFTER on-chain purchase succeeds in NftDetail (which needs update too)
    // Or we handle functionality here if passed up.
    // NOTE: NftDetail usually handles the UI interaction.
    // For this refactor, we assume NftDetail will handle the interaction returning success.
    
    // In Firebase update
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
    if (!provider) {
      console.log("User not logged in, cannot log play history.");
      return;
    }
    try {
        const ethersProvider = new ethers.BrowserProvider(provider);
        const signer = await ethersProvider.getSigner();
        const address = await signer.getAddress();

        await addDoc(collection(db, "playHistory"), {
            userId: address,
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
    // Note: NftDetail needs to be updated to support buying via Ethers
    // Passing provider and contract details down might be needed or handled via Context
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
    // Getting account for dashboard
    const UserDashboardWrapper = () => {
        const [address, setAddress] = useState<string | null>(null);
        useEffect(() => {
            if(provider) {
                new ethers.BrowserProvider(provider).getSigner().then(s => s.getAddress()).then(setAddress);
            }
        }, [provider]);
        return address ? <UserDashboard userAddress={address} onSelectNft={handleSelectNft} /> : <div className="loading">Loading user...</div>;
    }

    const CreatorDashboardWrapper = () => {
        const [address, setAddress] = useState<string | null>(null);
        useEffect(() => {
            if(provider) {
                new ethers.BrowserProvider(provider).getSigner().then(s => s.getAddress()).then(setAddress);
            }
        }, [provider]);
        return address ? <CreatorDashboard creatorAddress={address} onSelectNft={handleSelectNft} /> : <div className="loading">Loading creator...</div>;
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
      return <div className="loading">Loading Web3Auth...</div>;
  }

  if (!loggedIn) {
    return (
        <div className="login-container">
            <div className="login-box">
                <h1 className="logo">Musify<span>NFT (QIE)</span></h1>
                <h2>The Future of Music Ownership</h2>
                <p>Login with your social account to start collecting and creating music NFTs on Qie Blockchain.</p>
                <button onClick={login} className="login-button">
                    Connect with Web3Auth
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
        />
        <main className="main-content">
            {renderCurrentPage()}
        </main>
      </div>
  );
}

export default App;
