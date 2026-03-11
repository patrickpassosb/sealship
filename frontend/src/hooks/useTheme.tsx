'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

export type ThemeMode = 'dark' | 'light' | 'auto';
type ResolvedTheme = 'dark' | 'light';

interface ThemeContextType {
    mode: ThemeMode;
    theme: ResolvedTheme;
    setMode: (mode: ThemeMode) => void;
    toggleTheme: () => void;
    setTheme: (theme: ResolvedTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemTheme(): ResolvedTheme {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function resolveTheme(mode: ThemeMode): ResolvedTheme {
    if (mode === 'auto') return getSystemTheme();
    return mode;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [mode, setModeState] = useState<ThemeMode>('dark');
    const [mounted, setMounted] = useState(false);

    const applyTheme = useCallback((m: ThemeMode) => {
        document.documentElement.setAttribute('data-theme', resolveTheme(m));
    }, []);

    useEffect(() => {
        const saved = localStorage.getItem('sealship-theme-mode') as ThemeMode | null;
        const legacySaved = localStorage.getItem('sealship-theme') as 'dark' | 'light' | null;
        const initial = saved || legacySaved || 'auto';
        setTimeout(() => {
            setModeState(initial);
            applyTheme(initial);
            setMounted(true);
        }, 0);
    }, [applyTheme]);

    useEffect(() => {
        if (mode !== 'auto') return;
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => applyTheme('auto');
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, [mode, applyTheme]);

    const setMode = (newMode: ThemeMode) => {
        setModeState(newMode);
        localStorage.setItem('sealship-theme-mode', newMode);
        applyTheme(newMode);
    };

    const setTheme = (newTheme: ResolvedTheme) => setMode(newTheme);
    const toggleTheme = () => setMode(resolveTheme(mode) === 'dark' ? 'light' : 'dark');
    const theme = resolveTheme(mode);

    return (
        <ThemeContext.Provider value={{ mode, theme, setMode, toggleTheme, setTheme }}>
            <div style={!mounted ? { visibility: 'hidden' } : undefined}>
                {children}
            </div>
        </ThemeContext.Provider>
    );
}

export function useTheme(): ThemeContextType {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
