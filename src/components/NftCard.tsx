import React from 'react';
import { MusicNFT } from '../types';

interface NftCardProps {
  nft: MusicNFT;
  onSelect: (nft: MusicNFT) => void;
}

export function NftCard({ nft, onSelect }: NftCardProps) {
  return (
    <div className="card nft-card" onClick={() => onSelect(nft)}>
      <div className="nft-image-wrapper">
        <img src={nft.imageUrl} alt={nft.trackTitle} className="nft-image" />
      </div>
      <div className="nft-card-info">
        <h3>{nft.trackTitle}</h3>
        <p>by {nft.artistName}</p>
        <div className="nft-price">{nft.price} QIE</div>
      </div>
    </div>
  );
}
