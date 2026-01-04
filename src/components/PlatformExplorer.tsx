import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collectionGroup, query, getDocs } from 'firebase/firestore';
import { PlatformTransaction } from '../types';

export function PlatformExplorer() {
    const [transactions, setTransactions] = useState<PlatformTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            setIsLoading(true);
            const transctionsQuery = query(collectionGroup(db, 'royaltyTransactions'));
            const snapshot = await getDocs(transctionsQuery);
            const txsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PlatformTransaction));
            
            txsData.sort((a, b) => b.purchaseDate.seconds - a.purchaseDate.seconds);

            setTransactions(txsData);
            setIsLoading(false);
        };
        fetchTransactions();
    }, []);

    if (isLoading) return <div className="loading">Loading Platform Transactions...</div>;

    return (
        <div className="platform-explorer">
            <h2>Platform Transaction Explorer</h2>
            {transactions.length > 0 ? (
                <div className="explorer-table-container">
                    <table className="explorer-table">
                        <thead>
                            <tr>
                                <th>Transaction</th>
                                <th>Buyer</th>
                                <th>Amount</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(tx => (
                                <tr key={tx.id}>
                                    <td>
                                        {tx.txHash ? (
                                            <a href={`https://explorer.solana.com/tx/${tx.txHash}?cluster=devnet`} target="_blank" rel="noopener noreferrer" className="explorer-link">
                                                {tx.txHash.substring(0, 8)}...
                                            </a>
                                        ) : 'N/A'}
                                    </td>
                                    <td>{tx.buyerAddress.substring(0, 8)}...</td>
                                    <td>{tx.totalAmount.toFixed(4)} SOL</td>
                                    <td>{tx.purchaseDate.toDate().toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p>No transactions on the platform yet.</p>
            )}
        </div>
    );
}
