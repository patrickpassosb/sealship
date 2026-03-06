'use client';

import { useEffect, useState } from 'react';
import { AnalysisStatus } from '@/types';

interface AnalysisProgressProps {
    status: AnalysisStatus;
}

export function AnalysisProgress({ status }: AnalysisProgressProps) {
    const [dots, setDots] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
        }, 500);
        return () => clearInterval(interval);
    }, []);

    const steps = [
        { key: 'queued', label: 'Queued for Analysis', icon: '📝' },
        { key: 'analyzing', label: 'Fetching GitHub Data', icon: '🐙' },
        { key: 'scoring', label: 'Calculating Deterministic Score', icon: '🧮' },
        { key: 'ai_analysis', label: 'Generating AI Context', icon: '🧠' },
        { key: 'uploading_ipfs', label: 'Publishing to IPFS', icon: '📦' },
        { key: 'completed', label: 'Analysis Complete!', icon: '✅' },
    ];

    const currentIndex = steps.findIndex((s) => s.key === status);
    // If failed, we don't show the progress bar. This component is just for loading state.

    return (
        <div className="card p-8 bg-[var(--bg-card)] max-w-2xl mx-auto border border-[var(--border-primary)] shadow-lg mt-12 mb-24">
            <div className="flex flex-col items-center justify-center text-center space-y-6">
                <div className="relative w-32 h-32 flex items-center justify-center">
                    <div className="absolute inset-0 bg-[var(--accent-primary)] rounded-full animate-ping opacity-20"></div>
                    <div className="w-24 h-24 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center text-5xl z-10 border-4 border-[var(--accent-primary)]">
                        🦭
                    </div>
                </div>

                <h2 className="text-2xl font-bold">
                    Diving Deep{dots}
                </h2>
                <p className="text-[var(--text-secondary)]">
                    The Sealship AI is analyzing the repository. This usually takes 10-30 seconds.
                </p>

                <div className="w-full mt-8 bg-[var(--bg-secondary)] rounded-xl p-6">
                    <ul className="space-y-4 text-left">
                        {steps.map((step, idx) => {
                            const isPast = idx < currentIndex;
                            const isCurrent = idx === currentIndex;
                            const isFuture = idx > currentIndex;

                            let color = 'var(--text-tertiary)';
                            if (isPast) color = 'var(--success)';
                            if (isCurrent) color = 'var(--accent-primary)';

                            return (
                                <li key={step.key} className={`flex items-center gap-4 transition-colors duration-500`} style={{ color }}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${isPast ? 'bg-[var(--success)]/20 text-[var(--success)]' :
                                            isCurrent ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] animate-pulse' :
                                                'bg-[var(--bg-card)] border border-[var(--border-primary)] text-[var(--text-tertiary)]'
                                        }`}>
                                        {isPast ? '✓' : step.icon}
                                    </div>
                                    <span className={`font-medium ${isCurrent ? 'font-bold' : ''} ${isFuture ? 'opacity-50' : ''}`}>
                                        {step.label}
                                        {isCurrent && dots}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </div>
    );
}
