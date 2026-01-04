import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { MusicNFT } from '../types';
import { NftCard } from './NftCard';

interface UserDashboardProps {
  userAddress: string;
  onSelectNft: (nft: MusicNFT) => void;
}

export function UserDashboard({ userAddress, onSelectNft }: UserDashboardProps) {
  const [licensedNfts, setLicensedNfts] = useState<MusicNFT[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!userAddress) return;
      setIsLoading(true);

      // Ambil semua NFT dari koleksi
      const nftsQuery = query(collection(db, "nfts"));
      const nftsSnapshot = await getDocs(nftsQuery);
      const allNftsData = nftsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MusicNFT));

      // BARU: Lakukan filter di sisi klien untuk menemukan lisensi yang valid
      const now = new Date();
      const validLicensedNfts = allNftsData.filter(nft => {
        if (!nft.licensees) return false;
        
        // Cari lisensi yang dimiliki oleh pengguna saat ini
        const userLicense = nft.licensees.find(license => license.ownerAddress === userAddress);
        
        // Jika lisensi ditemukan, periksa apakah belum kedaluwarsa
        if (userLicense) {
          const expiryDate = userLicense.expiryDate.toDate();
          return expiryDate > now;
        }
        
        return false;
      });

      setLicensedNfts(validLicensedNfts);
      setIsLoading(false);
    };
    fetchData();
  }, [userAddress]);

  if (isLoading) return <div className="loading">Loading Your Licenses...</div>;

  return (
    <div className="user-dashboard">
      <h2>My Active Licenses</h2>
      <h3>You have purchased {licensedNfts.length} active license(s)</h3>
      <div className="grid">
        {licensedNfts.length > 0 ? (
          licensedNfts.map(nft => <NftCard key={nft.id} nft={nft} onSelect={onSelectNft} />)
        ) : (
          <p>You haven't purchased any active licenses yet.</p>
        )}
      </div>
    </div>
  );
}
