import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

function sanitizeRedirectPath(value: string): string {
    // Prevent open-redirect: only allow relative paths starting with a single "/"
    if (!value.startsWith('/') || value.startsWith('//')) return '/';
    return value;
}

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = sanitizeRedirectPath(searchParams.get('next') ?? '/');

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            const forwardedHost = request.headers.get('x-forwarded-host');
            const isLocalEnv = process.env.NODE_ENV === 'development';

            if (isLocalEnv) {
                return NextResponse.redirect(`${origin}${next}`);
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`);
            } else {
                return NextResponse.redirect(`${origin}${next}`);
            }
        }
    }

    // Auth error — redirect home
    return NextResponse.redirect(`${origin}/`);
}
