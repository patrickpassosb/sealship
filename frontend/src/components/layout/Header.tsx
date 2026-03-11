import ThemeToggle from '@/components/layout/ThemeToggle';
import Link from 'next/link';
import { ConnectButton } from '@/components/blockchain/ConnectButton';
import { GitHubAuthButton } from '@/components/auth/GitHubAuthButton';

export default function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b backdrop-blur-md" style={{ background: 'var(--header-bg)', borderColor: 'var(--header-border)' }}>
            <div className="container flex items-center justify-between h-16">
                {/* Logo Section */}
                <Link href="/" className="flex items-center gap-2 group">
                    <span className="text-3xl transition-transform group-hover:animate-wave">🦭</span>
                    <div className="font-bold tracking-tight">
                        <span style={{ fontSize: '1.25rem', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Sealship
                        </span>
                        <span className="ml-2 text-xs font-mono px-2 py-0.5 rounded-full border border-primary opacity-60">TESTNET</span>
                    </div>
                </Link>

                {/* Navigation & Controls */}
                <div className="flex items-center gap-4">
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium mr-4">
                        <Link href="/" className="text-secondary hover:text-primary transition-colors">Analyzer</Link>
                        <Link href="/leaderboard" className="text-secondary hover:text-primary transition-colors">Leaderboard</Link>
                    </nav>

                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <GitHubAuthButton />
                        <ConnectButton />
                    </div>
                </div>
            </div>
        </header>
    );
}
