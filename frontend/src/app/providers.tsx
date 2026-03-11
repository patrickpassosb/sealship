'use client';

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '@/lib/blockchain/config';
import { ThemeProvider } from '@/hooks/useTheme';
import { AuthProvider } from '@/hooks/useAuth';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
    // Essential for React Query to work in Next.js App Router
    const [queryClient] = useState(() => new QueryClient());

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider>
                    <AuthProvider>
                        {children}
                    </AuthProvider>
                </ThemeProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
