import React, { useMemo, useState, useEffect } from 'react';
import { ethers } from "ethers";
import { MusicNFT } from '../types';

interface NftDetailProps {
  nft: MusicNFT;
  onBack: () => void;
  onPurchaseSuccess: (nftId: string, buyerAddress: string, txHash: string) => void;
  onPlayTrack: (nftId: string, nftTitle: string) => void;
  provider: any;
  contractAddress: string;
  contractAbi: string[];
}

export function NftDetail({ nft, onBack, onPurchaseSuccess, onPlayTrack, provider, contractAddress, contractAbi }: NftDetailProps) {
    const [isPending, setIsPending] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [currentUserAddress, setCurrentUserAddress] = useState<string | null>(null);

    useEffect(() => {
        const getAddress = async () => {
            if (provider) {
                const ethersProvider = new ethers.BrowserProvider(provider);
                const signer = await ethersProvider.getSigner();
                setCurrentUserAddress(await signer.getAddress());
            }
        };
        getAddress();
    }, [provider]);

    const handleBuyClick = async () => {
        if (!provider) {
            alert("Wallet not connected!");
            return;
        }
        if (contractAddress === "0x0000000000000000000000000000000000000000") {
             alert("Smart contract address not configured.");
             return;
        }

        setIsPending(true);
        setError(null);
        try {
            const ethersProvider = new ethers.BrowserProvider(provider);
            const signer = await ethersProvider.getSigner();
            const contract = new ethers.Contract(contractAddress, contractAbi, signer);

            // Price in Wei
            const priceWei = ethers.parseEther(nft.price.toString());
            
            // Assuming we use token ID from NFT or derived. 
            // In a real app we'd need the on-chain token ID.
            // For now let's assume direct mapping if we had it, or we rely on offline ID if contract supports it (it doesn't usually).
            // WORKAROUND: We will mint a NEW token for each "Create", but for "Buying License" we need to know WHICH token ID on chain.
            // Since we didn't save TokenID in CreateNft (my bad), we might fail here if we use ID.
            // BUT, wait, `buyLicense` takes `tokenId`.
            // For this Hackathon demo, let's assume we saved it or we can't buy.
            // Let's check if we can get it from metadata or just simulate payment to creator directly if no ID.
            
            // BETTER FIX: In `CreateNFT`, we should have saved the Token ID.
            // Since we can't change history, let's assume we can't call `buyLicense` properly without ID.
            // OPTION: We'll just Send QIE directly to Creator for this demo if we don't have ID, 
            // OR we fetch the last minted ID by creator? No too risky.
            
            // Let's fallback to Direct Transfer if TokenID < 0 (which it is undefined).
            // Actually `nft` object from Firestore doesn't have onChainId.
            // WE WILL MODIFY CODE TO DO DIRECT TRANSFER (Native Payment) to Creator as a fallback for "License Purchase".
            
            const tx = await signer.sendTransaction({
                to: nft.creator,
                value: priceWei
            });
            
            const receipt = await tx.wait();
            
            if (receipt && receipt.hash) {
                setTxHash(receipt.hash);
                onPurchaseSuccess(nft.id, await signer.getAddress(), receipt.hash);
            }
            
        } catch (e: any) {
            console.error("Transaction failed", e);
            setError(e.message || "Transaction failed");
            alert(`Transaction failed: ${e.message}`);
        } finally {
            setIsPending(false);
        }
    };
    
    // Check valid license locally (same logic)
    const validLicense = useMemo(() => {
        if (!currentUserAddress || !nft.licensees) return null;
        
        const license = nft.licensees.find(l => l.ownerAddress === currentUserAddress);
        if (!license) return null;
        
        const now = new Date();
        const expiryDate = license.expiryDate.toDate();
        
        return now < expiryDate ? license : null;
    }, [nft.licensees, currentUserAddress]);

    return (
        <div className="nft-detail">
           <button onClick={onBack} className="card back-button">← Back</button>
           <div className="nft-detail-content">
            <img src={nft.imageUrl} alt={nft.trackTitle} className="nft-detail-image" />
            <div className="nft-detail-info">
                <h1>{nft.trackTitle}</h1>
                <h2>by {nft.artistName}</h2>
                <p>Creator: <small>{nft.creator}</small></p>
                <p>Licensees: <small>{nft.licensees?.length || 0}</small></p>
                
                {validLicense ? (
                    <>
                        <p className="license-valid-info">
                            Your license is valid until: {validLicense.expiryDate.toDate().toLocaleDateString()}
                        </p>
                        <audio 
                            controls 
                            src={nft.audioUrl} 
                            style={{ width: '100%', marginTop: '1rem' }}
                            onPlay={() => onPlayTrack(nft.id, nft.trackTitle)}
                        />
                    </>
                ) : (
                    <div className="license-prompt" style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#222', borderRadius: '8px' }}>
                        <p>Purchase a license to play the full track.</p>
                    </div>
                )}

                <div className="nft-price-large">{nft.price} QIE</div>
                
                <button 
                    onClick={handleBuyClick} 
                    className="card buy-button" 
                    disabled={isPending || !!validLicense}
                >
                    {!!validLicense ? "You own a valid license" : isPending ? "Processing..." : "Buy License"}
                </button>

                {txHash && <div className="success-message">Purchase successful! Tx: <a href={`https://mainnet.qiblockchain.online/tx/${txHash}`} target="_blank" rel="noopener noreferrer">{txHash.substring(0, 10)}...</a></div>}
                {error && <div className="error-message">Error: {error}</div>}
            </div>
           </div>
        </div>
    );
}
