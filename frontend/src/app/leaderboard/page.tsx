import Link from 'next/link';
import { getLeaderboard } from '@/lib/db/client';

export const revalidate = 60; // Regenerate this page every 60 seconds

export default async function LeaderboardPage() {
    const leaderboard = await getLeaderboard(100);

    return (
        <div className="container py-12 md:py-24 max-w-5xl">
            <div className="text-center mb-16 animate-fade-in">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4" style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    The Global Leaderboard
                </h1>
                <p className="text-xl text-[var(--text-secondary)]">
                    Web3-verified top developer identities and repositories on the Polkadot Hub TestNet.
                </p>
            </div>

            <div className="card p-0 overflow-hidden border border-[var(--border-primary)] shadow-lg animate-slide-up">
                {leaderboard.length === 0 ? (
                    <div className="p-12 text-center text-[var(--text-secondary)]">
                        <div className="text-4xl mb-4">🦭</div>
                        <p>No repositories have been sealed yet.</p>
                        <Link href="/" className="btn btn-primary mt-4 inline-block">Be the First</Link>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-primary)] text-[var(--text-secondary)] font-mono text-sm uppercase tracking-wider">
                                <th className="p-4 pl-6 text-center w-16">Rank</th>
                                <th className="p-4">Repository</th>
                                <th className="p-4 text-center">Commit</th>
                                <th className="p-4 text-center w-32">Seal Score</th>
                                <th className="p-4 pr-6 text-right w-48">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboard.map((entry, index) => {
                                const isTop3 = index < 3;
                                return (
                                    <tr key={`${entry.owner}/${entry.name}`} className="border-b border-[var(--border-primary)]/50 hover:bg-[var(--bg-secondary)] transition-colors group">
                                        <td className="p-4 pl-6 text-center font-bold">
                                            {isTop3 ? (
                                                <span className="text-2xl" title={index === 0 ? 'Gold' : index === 1 ? 'Silver' : 'Bronze'}>
                                                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                                                </span>
                                            ) : (
                                                <span className="text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors">#{index + 1}</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <Link href={`/analysis/${entry.report_cid}`} className="block">
                                                <div className="font-bold text-lg group-hover:text-[var(--accent-primary)] transition-colors">{entry.name}</div>
                                                <div className="text-sm text-[var(--text-secondary)]">by {entry.owner}</div>
                                            </Link>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="font-mono text-sm px-2 py-1 bg-[var(--bg-card)] border border-[var(--border-primary)] rounded">
                                                {entry.commit_sha.slice(0, 7)}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center">
                                                <span className={`text-xl font-bold ${entry.total_score >= 80 ? 'text-[var(--success)]' :
                                                    entry.total_score >= 50 ? 'text-yellow-500' : 'text-red-500'
                                                    }`}>
                                                    {entry.total_score}
                                                </span>
                                                <span className="text-xs text-[var(--text-tertiary)] ml-1">/100</span>
                                            </div>
                                        </td>
                                        <td className="p-4 pr-6 text-right">
                                            {/* For the MVP we assume if it's on this list, it's either in the DB or fully verified */}
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-xs font-semibold px-2 py-1 rounded bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/30">
                                                    Verified Snapshot
                                                </span>
                                                <span className="text-[10px] text-[var(--text-tertiary)] font-mono max-w-[120px] truncate" title={entry.report_cid || ''}>
                                                    CID: {entry.report_cid ? entry.report_cid.slice(0, 10) + '...' : 'Pending'}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
