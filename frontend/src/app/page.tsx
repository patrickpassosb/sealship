import { AnalyzeForm } from '@/components/analyzer/AnalyzeForm';
import Link from 'next/link';
import { getLeaderboard } from '@/lib/db/client';

export default async function Home() {
  const topProjects = await getLeaderboard(3);

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-4rem)]">
      {/* Hero Section - Centered like Uniswap */}
      <section className="flex flex-col items-center justify-center flex-1 w-full px-4 pt-8 pb-16">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-center mb-2 animate-fade-in">
          Seal your code.
        </h1>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-center mb-10 animate-fade-in" style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Ship your trust.
        </h1>

        {/* Hero Box - Uniswap-style centered card */}
        <div className="relative z-10 w-full max-w-lg">
          <AnalyzeForm />
          <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-[var(--accent-primary)] rounded-full blur-[120px] opacity-15 pointer-events-none"></div>
        </div>

        <p className="mt-6 text-sm text-[var(--text-tertiary)] text-center max-w-md">
          Analyze any GitHub repo with <span className="text-[var(--accent-primary)]">deterministic scoring</span> and verify on-chain with <span className="text-[var(--accent-primary)]">Polkadot Hub</span>.
        </p>
      </section>

      {/* Mini Leaderboard Teaser */}
      {topProjects.length > 0 && (
        <section className="w-full max-w-4xl mx-auto px-4 pb-16 animate-fade-in">
          <div className="flex items-center justify-between mb-6 border-b border-[var(--border-primary)] pb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              Top Sealed Repos
            </h3>
            <Link href="/leaderboard" className="text-sm font-medium text-[var(--accent-primary)] hover:underline flex items-center gap-1">
              View all <span>→</span>
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {topProjects.map((project, idx) => (
              <Link href={`/analysis/${project.id || project.report_cid}`} key={project.owner + project.name} className="card p-5 border border-[var(--border-primary)] hover:border-[var(--accent-primary)] hover:shadow-[var(--shadow-glow)] transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--bg-secondary)] font-bold text-sm text-[var(--text-secondary)] group-hover:text-[var(--accent-primary)] group-hover:bg-[var(--accent-primary)]/10 transition-colors">
                    #{idx + 1}
                  </div>
                  <span className="text-xs font-mono font-semibold text-[var(--success)]">
                    {project.total_score}/100
                  </span>
                </div>
                <h4 className="font-semibold text-sm mb-0.5 truncate">{project.name}</h4>
                <p className="text-xs text-[var(--text-tertiary)] truncate">
                  {project.owner}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
