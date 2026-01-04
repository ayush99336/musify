import React from 'react';
import { MusicNFT } from '../types';
import { NftCard } from './NftCard';

interface MarketplaceProps {
  nfts: MusicNFT[];
  onSelectNft: (nft: MusicNFT) => void;
}

export function Marketplace({ nfts, onSelectNft }: MarketplaceProps) {
    return (
      <div>
        <h2>Explore Music NFTs</h2>
        <div className="grid">
          {nfts.map(nft => <NftCard key={nft.id} nft={nft} onSelect={onSelectNft} />)}
        </div>
      </div>
    );
}
