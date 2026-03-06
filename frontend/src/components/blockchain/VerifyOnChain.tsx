'use client';

import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/blockchain/config';
import { ConnectButton } from './ConnectButton';

interface VerifyOnChainProps {
    repoHash: string;      // 0x...
    score: number;         // 0-100
    reportCid: string;     // Qm...
    repoUrl: string;       // https://github.com/owner/repo
    existingTxHash: string | null;
    onSuccess: (txHash: string) => void;
}

export function VerifyOnChain({ repoHash, score, reportCid, repoUrl, existingTxHash, onSuccess }: VerifyOnChainProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        const timeoutId = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timeoutId);
    }, []);

    const { data: hash, isPending, error, writeContract } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    // Call parent when confirmed
    useEffect(() => {
        if (isSuccess && hash) {
            onSuccess(hash);
        }
    }, [isSuccess, hash, onSuccess]);

    if (!mounted) return null;

    if (existingTxHash) {
        return (
            <div className="p-6 bg-[var(--success)]/10 border border-[var(--success)]/30 rounded-xl text-center">
                <div className="text-3xl mb-2">✅ Web3 Verified</div>
                <h3 className="text-xl font-bold text-[var(--success)] mb-2">Sealed on Polkadot Hub</h3>
                <p className="text-sm text-[var(--text-secondary)] mb-4">
                    This analysis snapshot is forever recorded on-chain.
                </p>
                <a
                    href={`https://blockscout-testnet.polkadot.io/tx/${existingTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-mono text-[var(--accent-primary)] hover:underline"
                >
                    View Transaction ↗
                </a>
            </div>
        );
    }

    const handleVerify = () => {
        if (!reportCid) {
            alert("IPFS Report CID is missing.");
            return;
        }
        writeContract({
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: CONTRACT_ABI,
            functionName: 'recordScore',
            args: [
                repoHash as `0x${string}`,
                BigInt(score),
                reportCid,
                repoUrl
            ],
        });
    };

    return (
        <div className="card p-8 border-2 border-[var(--accent-primary)]/30 shadow-[var(--shadow-glow)] text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-20 text-6xl transform rotate-12 pointer-events-none">🦭</div>

            <h3 className="text-2xl font-bold mb-4">Seal This Score on Chain</h3>
            <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
                Verify this deterministic analysis on the Polkadot Hub TestNet. By signing this transaction, you become the official underwriter of this repository&apos;s snapshot.
            </p>

            <div className="flex flex-col items-center gap-4">
                {/* Wagmi Connect Button - if user isn't connected, this lets them connect first */}
                <ConnectButton />

                <button
                    onClick={handleVerify}
                    disabled={isPending || isConfirming}
                    className="btn btn-primary px-8 py-3 text-lg mt-2"
                    style={{ background: 'var(--accent-gradient)', color: '#fff', border: 'none' }}
                >
                    {isPending ? 'Confirm in Wallet...' : isConfirming ? 'Mining Tx...' : 'Seal on Polkadot Hub'}
                </button>

                {error && (
                    <div className="text-red-500 text-sm mt-2 max-w-md bg-red-900/10 p-3 rounded">
                        Error: {(error as Error & { shortMessage?: string }).shortMessage || error.message}
                    </div>
                )}

                <div className="text-xs text-[var(--text-tertiary)] font-mono mt-4 space-y-1 text-left bg-[var(--bg-secondary)] p-4 rounded-lg w-full max-w-md break-all">
                    <div><span className="text-[var(--text-primary)] font-bold">Hash:</span> {repoHash}</div>
                    <div><span className="text-[var(--text-primary)] font-bold">CID:</span> {reportCid}</div>
                    <div><span className="text-[var(--text-primary)] font-bold">Score:</span> {score}/100</div>
                </div>
            </div>
        </div>
    );
}
