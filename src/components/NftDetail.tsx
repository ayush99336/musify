import React, { useMemo } from 'react';
import { useSolanaWallet, useSignAndSendTransaction } from "@web3auth/modal/react/solana";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import { MusicNFT } from '../types';

interface NftDetailProps {
  nft: MusicNFT;
  onBack: () => void;
  onPurchaseSuccess: (nftId: string, buyerAddress: string, txHash: string) => void;
  onPlayTrack: (nftId: string, nftTitle: string) => void;
}

export function NftDetail({ nft, onBack, onPurchaseSuccess, onPlayTrack }: NftDetailProps) {
    const { accounts, connection } = useSolanaWallet();
    const { data: hash, error, loading: isPending, signAndSendTransaction } = useSignAndSendTransaction();

    const handleBuyClick = async () => {
        if (!connection || !accounts?.[0]) {
            alert("Wallet not connected!");
            return;
        }
        try {
            const block = await connection.getLatestBlockhash();
            const priceInLamports = nft.price * LAMPORTS_PER_SOL;

            const instructions = nft.royaltyInfo.recipients.map(recipient => {
                const amount = Math.floor(priceInLamports * (recipient.share / 100));
                return SystemProgram.transfer({
                    fromPubkey: new PublicKey(accounts[0]),
                    toPubkey: new PublicKey(recipient.address),
                    lamports: amount,
                });
            });

            const transactionMessage = new TransactionMessage({
                recentBlockhash: block.blockhash,
                instructions: instructions,
                payerKey: new PublicKey(accounts[0]),
            });
            const transaction = new VersionedTransaction(transactionMessage.compileToV0Message());
            const txHash = await signAndSendTransaction(transaction);
            if (txHash) {
                onPurchaseSuccess(nft.id, accounts[0], txHash);
            }
        } catch (e) {
            console.error("Transaction failed", e);
            alert(`Transaction failed: ${e instanceof Error ? e.message : String(e)}`);
        }
    };
    
    const currentUserAddress = accounts?.[0];

    // DIPERBAIKI: Mengembalikan logika untuk memeriksa lisensi yang valid dan belum kedaluwarsa
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
                
                {/* DIPERBAIKI: Tampilkan pemutar audio hanya jika lisensi valid */}
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

                <div className="nft-price-large">{nft.price} SOL</div>
                
                <button 
                    onClick={handleBuyClick} 
                    className="card buy-button" 
                    disabled={isPending || !!validLicense}
                >
                    {!!validLicense ? "You own a valid license" : isPending ? "Processing..." : "Buy License"}
                </button>

                {hash && <div className="success-message">Purchase successful! Tx: <a href={`https://explorer.solana.com/tx/${hash}?cluster=devnet`} target="_blank" rel="noopener noreferrer">{hash.substring(0, 10)}...</a></div>}
                {error && <div className="error-message">Error: {error.message}</div>}
            </div>
           </div>
        </div>
    );
}
