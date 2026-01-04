import { Timestamp } from "firebase/firestore";

// Tipe data untuk distribusi royalti
export interface RoyaltyRecipient {
  address: string;
  share: number;
}

export interface RoyaltyInfo {
  recipients: RoyaltyRecipient[];
}

// BARU: Tipe data untuk lisensi dengan masa berlaku
export interface License {
  ownerAddress: string;
  purchaseDate: Timestamp;
  expiryDate: Timestamp;
}

// Tipe data utama untuk NFT
export interface MusicNFT {
  id: string; 
  artistName: string;
  trackTitle: string;
  imageUrl: string;
  audioUrl: string;
  price: number;
  creator: string;
  // DIPERBARUI: Menggunakan tipe data License
  licensees: License[]; 
  royaltyInfo: RoyaltyInfo;
  recipientAddresses: string[];
  createdAt: Timestamp;
}

// Tipe data untuk riwayat transaksi
export interface RoyaltyTransaction {
    id: string;
    nftId: string;
    nftTitle: string;
    buyerAddress: string;
    totalAmount: number;
    royaltyReceived: number;
    purchaseDate: Timestamp;
    txHash: string;
}

// BARU: Tipe data untuk riwayat pemutaran lagu
export interface PlayHistoryRecord {
    id: string;
    userId: string;
    nftId: string;
    nftTitle: string;
    playedAt: Timestamp;
    txHash: string; // Hash transaksi dari Memo Program
}

// Tipe data untuk explorer platform
export interface PlatformTransaction {
    id: string;
    buyerAddress: string;
    totalAmount: number;
    purchaseDate: Timestamp;
    txHash: string;
}