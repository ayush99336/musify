import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { MusicNFT, RoyaltyTransaction } from '../types';
import { NftCard } from './NftCard';

interface CreatorDashboardProps {
  creatorAddress: string;
  onSelectNft: (nft: MusicNFT) => void;
}

export function CreatorDashboard({ creatorAddress, onSelectNft }: CreatorDashboardProps) {
  const [myNfts, setMyNfts] = useState<MusicNFT[]>([]);
  const [royaltyHistory, setRoyaltyHistory] = useState<RoyaltyTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!creatorAddress) return;
      setIsLoading(true);
      
      const nftsQuery = query(collection(db, "nfts"), where("recipientAddresses", "array-contains", creatorAddress));
      const nftsSnapshot = await getDocs(nftsQuery);
      const nftsData = nftsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MusicNFT));
      setMyNfts(nftsData);

      const history: RoyaltyTransaction[] = [];
      for (const nft of nftsData) {
          const recipientInfo = nft.royaltyInfo.recipients.find(r => r.address === creatorAddress);
          if (!recipientInfo) continue;

          const historyQuery = query(collection(db, `nfts/${nft.id}/royaltyTransactions`));
          const historySnapshot = await getDocs(historyQuery);
          historySnapshot.forEach(doc => {
              const data = doc.data();
              history.push({
                  id: doc.id,
                  nftId: nft.id,
                  nftTitle: nft.trackTitle,
                  buyerAddress: data.buyerAddress,
                  totalAmount: data.totalAmount,
                  royaltyReceived: data.totalAmount * (recipientInfo.share / 100),
                  purchaseDate: data.purchaseDate,
                  txHash: data.txHash
              });
          });
      }
      history.sort((a, b) => b.purchaseDate.seconds - a.purchaseDate.seconds);
      setRoyaltyHistory(history);

      setIsLoading(false);
    };
    fetchData();
  }, [creatorAddress]);

  if (isLoading) return <div className="loading">Loading Creator Dashboard...</div>;

  return (
    <div className="creator-dashboard">
      <h2>Creator Dashboard</h2>
      <div className="dashboard-split">
        <div className="dashboard-column">
            <h3>Your NFTs ({myNfts.length})</h3>
            <div className="grid">
                {myNfts.map(nft => (
                    <div key={nft.id} className="dashboard-nft-item">
                        <NftCard nft={nft} onSelect={onSelectNft} />
                        <div className="royalty-info-dashboard">
                            <h4>Royalty Distribution</h4>
                            <ul>
                                {nft.royaltyInfo.recipients.map((recipient, index) => (
                                    <li key={index}>
                                        <small>{recipient.address}</small>
                                        <span>{recipient.share}%</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        <div className="dashboard-column">
            <h3>Royalty History</h3>
            <ul className="royalty-history-list">
                {royaltyHistory.length > 0 ? royaltyHistory.map(tx => (
                    <li key={tx.id}>
                        Received <strong>{tx.royaltyReceived.toFixed(4)} SOL</strong> from sale of "{tx.nftTitle}"
                        <small>Bought by: {tx.buyerAddress.substring(0, 6)}... on {tx.purchaseDate.toDate().toLocaleDateString()}</small>
                    </li>
                )) : <p>No royalty income yet.</p>}
            </ul>
        </div>
      </div>
    </div>
  );
}
