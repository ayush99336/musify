import { useState, useEffect } from 'react';
import { IProvider } from "@web3auth/base";
import { ethers } from "ethers";

interface BalanceDisplayProps {
  provider: IProvider | null;
  refreshTrigger: number;
}

export function BalanceDisplay({ provider, refreshTrigger }: BalanceDisplayProps) {
    const [balance, setBalance] = useState<string | null>(null);

    useEffect(() => {
        const fetchBalance = async () => {
            if (provider) {
                try {
                    const ethersProvider = new ethers.BrowserProvider(provider);
                    const signer = await ethersProvider.getSigner();
                    const address = await signer.getAddress();
                    const balanceWei = await ethersProvider.getBalance(address);
                    const balanceEth = ethers.formatEther(balanceWei);
                    setBalance(balanceEth);
                } catch (error) {
                    console.error("Failed to fetch balance:", error);
                    setBalance(null);
                }
            }
        };

        fetchBalance();
    }, [provider, refreshTrigger]);

    if (balance === null) return null;

    return (
        <div className="balance-display">
            {parseFloat(balance).toFixed(4)} QIE
        </div>
    );
}
