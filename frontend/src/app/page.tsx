import { AnalyzeForm } from '@/components/analyzer/AnalyzeForm';
import Link from 'next/link';
import { getLeaderboard } from '@/lib/db/client';

export default async function Home() {
  // We can optionally fetch the top 3 projects to display on the home page statically
  // For the MVP, we just show the form
  const topProjects = getLeaderboard(3);

  return (
    <div className="container py-12 md:py-24">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto mb-16 animate-fade-in">
        <div className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold rounded-full bg-[var(--accent-primary)] bg-opacity-10 text-[var(--accent-primary)] border border-[var(--accent-primary)] border-opacity-20 animate-pulse">
          Polkadot Solidity Hackathon MVP
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6" style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Code Speaks. <br className="hidden md:block" />
          Data Verifies. <br className="hidden md:block" />
          <span className="bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 text-transparent">We Seal It.</span>
        </h1>
        <p className="text-xl text-[var(--text-secondary)] mb-10 max-w-2xl mx-auto leading-relaxed">
          The decentralized developer identity protocol built on the Polkadot Hub TestNet. Establish trust through deterministic analysis and zero-knowledge reputation.
        </p>

        {/* Input Form */}
        <div className="relative z-10 w-full">
          <AnalyzeForm />

          {/* Decorative Glow */}
          <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-[var(--accent-primary)] rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
        </div>
      </section>

      {/* Mini Leaderboard Teaser */}
      {topProjects.length > 0 && (
        <section className="mb-24 fade-in block delay-200">
          <div className="flex items-center justify-between mb-6 border-b border-[var(--border-primary)] pb-4">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <span className="text-xl">🏆</span> Current Leaders
            </h3>
            <Link href="/leaderboard" className="text-sm font-semibold text-[var(--accent-primary)] hover:underline flex items-center gap-1">
              View All Leaderboard <span>→</span>
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {topProjects.map((project, idx) => (
              <Link href={`/analysis/${project.id || project.report_cid}`} key={project.owner + project.name} className="card p-6 border border-[var(--border-primary)] hover:border-[var(--accent-primary)] hover:shadow-[var(--shadow-glow)] transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--bg-secondary)] font-bold text-xl text-[var(--text-secondary)] group-hover:text-[var(--accent-primary)] group-hover:bg-[var(--accent-primary)]/10 transition-colors">
                    #{idx + 1}
                  </div>
                  <div className="pill border border-[var(--success)] text-[var(--success)] bg-[var(--success)]/10">
                    {project.total_score} Score
                  </div>
                </div>
                <h4 className="font-bold text-lg mb-1 truncate">{project.name}</h4>
                <p className="text-sm text-[var(--text-secondary)] truncate">
                  by {project.owner}
                </p>
                <div className="mt-4 pt-4 border-t border-[var(--border-primary)] flex items-center text-xs text-[var(--text-tertiary)]">
                  <span>Verified on Polkadot Hub</span>
                  <span className="ml-auto">🦭</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Features Grid */}
      <section className="grid md:grid-cols-3 gap-8 py-12 text-left fade-in block delay-[400ms]">
        <div className="card p-8 border border-[var(--border-primary)] bg-[var(--bg-card)] hover:translate-y-[-4px] transition-transform duration-300">
          <div className="text-4xl mb-4 bg-clip-text text-transparent bg-gradient-to-br from-blue-400 to-indigo-500 w-fit">1️⃣</div>
          <h3 className="text-xl font-bold mb-3">Deterministic Scoring</h3>
          <p className="text-[var(--text-secondary)] leading-relaxed text-sm">
            5 exhaustive categories (Docs, Testing, Architecture, Security, Hygiene) verify repo quality beyond simple star count.
          </p>
        </div>
        <div className="card p-8 border border-[var(--border-primary)] bg-[var(--bg-card)] hover:translate-y-[-4px] transition-transform duration-300">
          <div className="text-4xl mb-4 bg-clip-text text-transparent bg-gradient-to-br from-pink-400 to-rose-500 w-fit">2️⃣</div>
          <h3 className="text-xl font-bold mb-3">AI Deep Dive</h3>
          <p className="text-[var(--text-secondary)] leading-relaxed text-sm">
            Mistral-powered intelligent feedback evaluates subjective design choices and code nuances providing actionable feedback.
          </p>
        </div>
        <div className="card p-8 border border-[var(--border-primary)] bg-[var(--bg-card)] hover:translate-y-[-4px] transition-transform duration-300">
          <div className="text-4xl mb-4 bg-clip-text text-transparent bg-gradient-to-br from-emerald-400 to-teal-500 w-fit">3️⃣</div>
          <h3 className="text-xl font-bold mb-3">Web3 Verified</h3>
          <p className="text-[var(--text-secondary)] leading-relaxed text-sm">
            Scores are hashed, immutable on Polkadot Hub TestNet. Decentralized proofs stored on IPFS Pinata. Own your reputation.
          </p>
        </div>
      </section>
    </div>
  );
}
