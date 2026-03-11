'use client';

import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/blockchain/config';
import { ConnectButton } from './ConnectButton';
import { useAuth } from '@/hooks/useAuth';

interface VerifyOnChainProps {
    repoHash: string;      // 0x...
    score: number;         // 0-100
    reportCid: string;     // Qm...
    repoUrl: string;       // https://github.com/owner/repo
    existingTxHash: string | null;
    onSuccess: (txHash: string) => void;
}

export function VerifyOnChain({ repoHash, score, reportCid, repoUrl, existingTxHash, onSuccess }: VerifyOnChainProps) {
    const { user, signInWithGitHub } = useAuth();
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

    if (!user) {
        return (
            <div className="card p-8 border-2 border-[var(--border-primary)] text-center">
                <div className="text-4xl mb-4">🔐</div>
                <h3 className="text-xl font-bold mb-2">Sign in to Seal on Chain</h3>
                <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
                    Sign in with GitHub to verify repository ownership before sealing on-chain.
                </p>
                <button
                    onClick={signInWithGitHub}
                    className="btn btn-primary px-6 py-2 inline-flex items-center gap-2"
                    style={{ background: 'var(--accent-gradient)', color: '#fff', border: 'none' }}
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                    </svg>
                    Sign in with GitHub
                </button>
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
