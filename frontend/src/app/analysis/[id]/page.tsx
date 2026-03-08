'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AnalysisProgress } from '@/components/analyzer/AnalysisProgress';
import { VerifyOnChain } from '@/components/blockchain/VerifyOnChain';
import { DbAnalysis } from '@/lib/db/client';

export default function AnalysisPage() {
    const params = useParams();
    const id = params.id as string;

    const [analysis, setAnalysis] = useState<(DbAnalysis & { repo_url?: string }) | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isPolling, setIsPolling] = useState(true);

    // Poll for updates
    useEffect(() => {
        if (!id || !isPolling) return;

        const fetchStatus = async () => {
            try {
                const res = await fetch(`/api/analysis/${id}`);
                const data = await res.json();

                if (data.success) {
                    setAnalysis(data.data);
                    if (data.pollingComplete) {
                        setIsPolling(false);
                    }
                } else {
                    setError(data.error);
                    setIsPolling(false);
                }
            } catch (err) {
                console.error('Polling error:', err);
            }
        };

        fetchStatus(); // immediate call
        const intervalId = setInterval(fetchStatus, 2000); // Poll every 2 seconds

        return () => clearInterval(intervalId);
    }, [id, isPolling]);

    // Handle finalize (transaction confirmed)
    const handleFinalize = async (txHash: string) => {
        try {
            // In a real app we'd trigger an API to update Postgres.
            // For this hackathon, we simply update the UI since the indexer handles the real truth.
            setAnalysis(prev => prev ? { ...prev, tx_hash: txHash, status: 'completed' } : null);
        } catch (e) {
            console.error("Failed to sync tx hash", e);
        }
    };

    if (error) {
        return (
            <div className="container py-24 text-center">
                <h2 className="text-3xl text-red-500 mb-4">Error Fetching Analysis</h2>
                <p>{error}</p>
            </div>
        );
    }

    if (!analysis || (analysis.status !== 'completed' && analysis.status !== 'failed' && analysis.status !== 'uploading_ipfs')) {
        // Show Loading Progress
        return (
            <div className="container py-12">
                <AnalysisProgress status={analysis?.status || 'analyzing'} />
            </div>
        );
    }

    if (analysis.status === 'failed') {
        return (
            <div className="container py-24 text-center">
                <h2 className="text-3xl text-red-500 mb-4">Analysis Failed</h2>
                <p>There was an issue processing the repository. Ensure the LLM keys are correctly set in the .env.</p>
            </div>
        );
    }

    // --- Completed View ---
    return (
        <div className="container py-12 max-w-5xl animate-fade-in">
            {/* Header section */}
            <div className="flex flex-col md:flex-row items-center md:items-start justify-between mb-12 gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold mb-2 break-all text-[var(--accent-primary)]">
                        Score Report
                    </h1>
                    <p className="text-[var(--text-secondary)] text-lg mb-1 font-mono">
                        commit: <span className="font-bold text-[var(--accent-secondary)]">{analysis.commit_sha.slice(0, 7)}</span>
                    </p>
                    <p className="text-[var(--text-tertiary)] text-xs font-mono uppercase tracking-widest mt-4">
                        Analysis ID: {analysis.id}
                    </p>
                </div>

                <div className="flex flex-col items-center">
                    <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-2">Overall Seal Score</div>
                    <div className="relative">
                        <svg className="w-32 h-32 -rotate-90">
                            <circle cx="64" cy="64" r="56" fill="transparent" stroke="var(--border-primary)" strokeWidth="12" />
                            <circle cx="64" cy="64" r="56" fill="transparent" stroke="var(--success)" strokeWidth="12" strokeDasharray="351.85" strokeDashoffset={351.85 - (351.85 * analysis.total_score) / 100} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className="text-4xl font-bold">{analysis.total_score}</span>
                            <span className="text-[10px] uppercase text-[var(--text-tertiary)] mt-1">/ 100</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid md:grid-cols-3 gap-8">

                {/* Left Column: Metrics Breakdown */}
                <div className="md:col-span-1 space-y-4">
                    <h3 className="font-bold text-xl mb-4 border-b border-[var(--border-primary)] pb-2 flex items-center gap-2">
                        📊 Deterministic Metrics
                    </h3>

                    <ScoreBar label="Documentation" icon="📚" score={analysis.documentation_score} max={20} />
                    <ScoreBar label="Testing" icon="🧪" score={analysis.testing_score} max={20} />
                    <ScoreBar label="Architecture" icon="🏗️" score={analysis.architecture_score} max={20} />
                    <ScoreBar label="Hygiene" icon="🧹" score={analysis.hygiene_score} max={20} />
                    <ScoreBar label="Security" icon="🔒" score={analysis.security_score} max={20} />

                    <div className="card p-4 bg-[var(--bg-secondary)] mt-8 border-l-4 border-[var(--accent-primary)]">
                        <h4 className="font-bold text-sm mb-1">Reputation Hash</h4>
                        <p className="font-mono text-[10px] break-all text-[var(--text-tertiary)]">{analysis.repo_hash}</p>
                    </div>
                    <div className="card p-4 bg-[var(--bg-secondary)] mt-2">
                        <h4 className="font-bold text-sm mb-1 flex items-center gap-1 justify-between">
                            IPFS Report CID
                            <a href={`https://gateway.pinata.cloud/ipfs/${analysis.report_cid}`} target="_blank" rel="noopener noreferrer" className="text-[var(--accent-primary)] hover:underline">View ↗</a>
                        </h4>
                        <p className="font-mono text-[10px] break-all text-[var(--text-tertiary)]">{analysis.report_cid}</p>
                    </div>
                </div>

                {/* Right Column: AI Analysis & Verification */}
                <div className="md:col-span-2 space-y-8">
                    <VerifyOnChain
                        repoHash={analysis.repo_hash}
                        score={analysis.total_score}
                        reportCid={analysis.report_cid || ''}
                        repoUrl={analysis.repo_url || `https://github.com`}
                        existingTxHash={analysis.tx_hash}
                        onSuccess={handleFinalize}
                    />

                    <div className="card p-8 bg-[var(--bg-card)]">
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <span className="text-2xl animate-pulse">🧠</span>
                            AI Deep Context Analysis
                        </h3>

                        {/* Simple Markdown Renderer for MVP */}
                        <div className="prose prose-invert max-w-none text-[var(--text-secondary)] leading-loose">
                            {analysis.ai_analysis ? (
                                analysis.ai_analysis.split('\n').map((paragraph, i) => {
                                    if (paragraph.startsWith('###')) {
                                        return <h4 key={i} className="text-lg font-bold text-[var(--text-primary)] mt-6 mb-2">{paragraph.replace('###', '').trim()}</h4>;
                                    }
                                    if (paragraph.startsWith('**') || paragraph.startsWith('- **')) {
                                        return <p key={i} className="font-bold text-[var(--text-primary)] mt-4 mb-1">{paragraph.replace(/\*\*/g, '').replace('- ', '')}</p>;
                                    }
                                    if (paragraph.startsWith('-')) {
                                        return <li key={i} className="ml-4 mb-1">{paragraph.replace('-', '').trim()}</li>;
                                    }
                                    if (paragraph.trim() === '') return <br key={i} />;
                                    return <p key={i} className="mb-4">{paragraph}</p>;
                                })
                            ) : (
                                <p>No AI analysis text found.</p>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

function ScoreBar({ label, icon, score, max }: { label: string, icon: string, score: number, max: number }) {
    const percentage = (score / max) * 100;
    let colorClass = 'bg-[var(--success)]';
    if (percentage < 50) colorClass = 'bg-red-500';
    else if (percentage < 75) colorClass = 'bg-yellow-500';

    return (
        <div className="card p-4 border border-[var(--border-primary)] bg-[var(--bg-card)] shadow-sm">
            <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-sm flex items-center gap-2"><span className="text-lg">{icon}</span> {label}</span>
                <span className="text-sm font-mono font-bold">{score}/{max}</span>
            </div>
            <div className="w-full bg-[var(--bg-secondary)] rounded-full h-2.5 overflow-hidden border border-[var(--border-primary)]">
                <div className={`h-2.5 rounded-full ${colorClass} transition-all duration-1000 ease-out`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
}
