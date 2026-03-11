import Link from 'next/link';
import { ConnectButton } from '@/components/blockchain/ConnectButton';
import { GitHubAuthButton } from '@/components/auth/GitHubAuthButton';
import GlobalPreferences from '@/components/layout/GlobalPreferences';

export default function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b backdrop-blur-md" style={{ background: 'var(--header-bg)', borderColor: 'var(--header-border)' }}>
            <div className="container flex items-center justify-between h-16">
                {/* Left: Logo + Nav */}
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2 group">
                        <span className="text-2xl transition-transform group-hover:animate-wave">🦭</span>
                        <span className="text-lg font-bold tracking-tight" style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Sealship
                        </span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-1">
                        <Link href="/" className="nav-link">Analyze</Link>
                        <Link href="/leaderboard" className="nav-link">Leaderboard</Link>
                    </nav>
                </div>

                {/* Right: Controls */}
                <div className="flex items-center gap-3">
                    <GlobalPreferences />
                    <GitHubAuthButton />
                    <ConnectButton />
                </div>
            </div>
        </header>
    );
}
