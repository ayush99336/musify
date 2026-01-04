import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, getDocs } from 'firebase/firestore';
import { PlayHistoryRecord } from '../types';

// DIPERBAIKI: Komponen ini tidak lagi memerlukan props
export function PlaybackHistory() {
    const [history, setHistory] = useState<PlayHistoryRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            setIsLoading(true);
            
            // DIPERBAIKI: Query sekarang mengambil semua dokumen dari koleksi 'playHistory'
            const historyQuery = query(collection(db, 'playHistory'));

            const snapshot = await getDocs(historyQuery);
            const historyData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PlayHistoryRecord));

            // Lakukan pengurutan data di sisi klien setelah data diterima
            historyData.sort((a, b) => {
                if (a.playedAt && b.playedAt) {
                    return b.playedAt.seconds - a.playedAt.seconds;
                }
                return 0;
            });

            setHistory(historyData);
            setIsLoading(false);
        };
        fetchHistory();
    }, []); // Dependensi array dikosongkan agar hanya berjalan sekali

    if (isLoading) return <div className="loading">Loading Playback History...</div>;

    return (
        <div className="platform-explorer">
            {/* DIPERBAIKI: Judul diubah */}
            <h2>All Playback History</h2>
            {history.length > 0 ? (
                <table className="explorer-table">
                    <thead>
                        <tr>
                            {/* BARU: Menambahkan kolom 'User' */}
                            <th>User</th>
                            <th>Track Title</th>
                            <th>Played At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map(item => (
                            <tr key={item.id}>
                                {/* BARU: Menampilkan alamat user */}
                                <td>{item.userId ? `${item.userId.substring(0, 6)}...` : 'N/A'}</td>
                                <td>{item.nftTitle}</td>
                                <td>{item.playedAt ? item.playedAt.toDate().toLocaleString() : 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No tracks have been played yet.</p>
            )}
        </div>
    );
}
