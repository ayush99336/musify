// 1. Impor fungsi yang diperlukan dari SDK Firebase
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// 2. TODO: Tempel (Paste) objek firebaseConfig Anda di sini
// Ganti semua placeholder di bawah ini dengan kunci asli dari Firebase Console Anda
const firebaseConfig = {
  apiKey: "AIzaSyDOKNbXHEw7cbDs6E1LCcLWEZSiPzGrtrw",
  authDomain: "solana-nft-marketplace.firebaseapp.com",
  projectId: "solana-nft-marketplace",
  storageBucket: "solana-nft-marketplace.firebasestorage.app",
  messagingSenderId: "338378016737",
  appId: "1:338378016737:web:ff4cc2b9d5ae7a0bba34a0",
  measurementId: "G-Q4QVP2QRPD"
};

// 3. Inisialisasi Firebase dan Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// 4. Ekspor instance database untuk digunakan di seluruh aplikasi
export { db, storage };
