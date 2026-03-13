import { NextResponse } from 'next/server';
import { getLeaderboard } from '@/lib/db/client';

/**
 * GET /api/leaderboard
 * Fetch the top repositories from the database.
 */
export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const limitParam = url.searchParams.get('limit');
        const parsed = limitParam ? parseInt(limitParam, 10) : 50;
        const limit = Number.isNaN(parsed) ? 50 : parsed;

        // Ensure limit is safe
        const safeLimit = Math.max(1, Math.min(limit, 100));

        const leaderboard = await getLeaderboard(safeLimit);

        return NextResponse.json({
            success: true,
            data: leaderboard,
        }, {
            // Leaderboards can be cached for a minute to reduce load
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
            }
        });

    } catch (error) {
        console.error('Leaderboard API Error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
