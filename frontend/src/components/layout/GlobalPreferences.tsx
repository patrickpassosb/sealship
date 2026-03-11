'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme, type ThemeMode } from '@/hooks/useTheme';

const themeOptions: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
    {
        value: 'auto',
        label: 'Auto',
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
            </svg>
        ),
    },
    {
        value: 'light',
        label: '',
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
        ),
    },
    {
        value: 'dark',
        label: '',
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
        ),
    },
];

export default function GlobalPreferences() {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const { mode, setMode } = useTheme();

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [open]);

    return (
        <div ref={ref} className="relative">
            {/* Three dots trigger */}
            <button
                onClick={() => setOpen(!open)}
                className="preferences-trigger"
                aria-label="Global preferences"
                title="Global preferences"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="5" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="12" cy="19" r="2" />
                </svg>
            </button>

            {/* Dropdown */}
            {open && (
                <div className="preferences-dropdown">
                    <div className="preferences-header">Global preferences</div>

                    {/* Theme row */}
                    <div className="preferences-row">
                        <span className="preferences-label">Theme</span>
                        <div className="theme-switcher">
                            {themeOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setMode(opt.value)}
                                    className={`theme-option ${mode === opt.value ? 'theme-option-active' : ''}`}
                                    aria-label={`${opt.value} theme`}
                                    title={opt.value.charAt(0).toUpperCase() + opt.value.slice(1)}
                                >
                                    {opt.icon}
                                    {opt.label && <span>{opt.label}</span>}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Language row */}
                    <div className="preferences-row">
                        <span className="preferences-label">Language</span>
                        <button className="preferences-value" onClick={() => { /* placeholder */ }}>
                            English
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
