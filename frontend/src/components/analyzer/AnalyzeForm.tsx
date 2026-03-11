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
        <div className="hero-card">
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                {/* Input area */}
                <div className="hero-card-inner">
                    <label htmlFor="repoUrl" className="text-xs font-medium text-[var(--text-tertiary)] mb-1 block">Repository</label>
                    <input
                        id="repoUrl"
                        type="url"
                        className="w-full h-10 text-base bg-transparent border-none outline-none text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] font-sans"
                        placeholder="https://github.com/owner/repo"
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                </div>

                {error && (
                    <div className="px-4 py-3 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400 text-sm animate-fade-in flex items-center gap-2">
                        <span>⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                {/* CTA Button - full width like Uniswap's "Get started" */}
                <button
                    type="submit"
                    className="btn btn-primary w-full h-14 text-base font-semibold rounded-2xl"
                    disabled={isLoading || !repoUrl}
                >
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <div className="spinner w-5 h-5 border-2" />
                            <span>Analyzing...</span>
                        </div>
                    ) : (
                        'Dive In'
                    )}
                </button>
            </form>
        </div>
    );
}
