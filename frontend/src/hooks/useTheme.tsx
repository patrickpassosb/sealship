'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('dark');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Read saved theme or prefer dark
        const saved = localStorage.getItem('sealship-theme') as Theme | null;
        const preferred = saved || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
        setTimeout(() => {
            setThemeState(preferred);
            document.documentElement.setAttribute('data-theme', preferred);
            setMounted(true);
        }, 0);
    }, []);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem('sealship-theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    // Prevent flash of wrong theme
    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {/* Prevent flash of wrong theme */}
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
