'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function AnalyzeForm() {
    const [repoUrl, setRepoUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Basic validation
        if (!repoUrl.includes('github.com')) {
            setError('Please enter a valid GitHub repository URL.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ repoUrl }),
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to start analysis.');
            }

            // Redirect to the analysis status/report page
            router.push(`/analysis/${result.data.analysisId}`);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            setIsLoading(false);
        }
    };

    return (
        <div className="card p-8 bg-[var(--bg-card)] max-w-2xl mx-auto backdrop-blur-md">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold tracking-tight mb-2 text-[var(--accent-primary)]">Seal Your Open Source Legacy</h2>
                <p className="text-[var(--text-secondary)]">
                    Submit your GitHub repository for a comprehensive AI-powered analysis and secure your reputation on Polkadot Hub.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                    <label htmlFor="repoUrl" className="sr-only">GitHub Repository URL</label>
                    <div className="relative group">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-2xl group-focus-within:animate-wave">
                            🦭
                        </span>
                        <input
                            id="repoUrl"
                            type="url"
                            className="input pr-32 pl-12 h-14 text-lg bg-[var(--bg-secondary)]"
                            placeholder="https://github.com/polkadot/polkadot"
                            value={repoUrl}
                            onChange={(e) => setRepoUrl(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            className="btn btn-primary absolute top-1.5 right-1.5 bottom-1.5 min-w-28 text-sm uppercase tracking-wider font-bold"
                            disabled={isLoading || !repoUrl}
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="spinner w-4 h-4 border-2" />
                                    <span>Diving...</span>
                                </div>
                            ) : (
                                'Dive In'
                            )}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-xl text-red-500 text-sm animate-fade-in flex items-start gap-2">
                        <span>⚠️</span>
                        <span>{error}</span>
                    </div>
                )}
            </form>

            <div className="mt-6 flex flex-wrap gap-2 justify-center text-xs text-[var(--text-tertiary)] opacity-80">
                <span className="flex items-center gap-1 group whitespace-nowrap"><span className="w-2 h-2 rounded-full bg-[var(--accent-secondary)] group-hover:animate-ping"></span> 1. File Structure Scan</span>
                <span className="opacity-50">•</span>
                <span className="flex items-center gap-1 group whitespace-nowrap"><span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] group-hover:animate-ping"></span> 2. Deterministic Scoring</span>
                <span className="opacity-50">•</span>
                <span className="flex items-center gap-1 group whitespace-nowrap"><span className="w-2 h-2 rounded-full bg-[var(--success)] group-hover:animate-ping"></span> 3. Web3 Verification</span>
            </div>
        </div>
    );
}
