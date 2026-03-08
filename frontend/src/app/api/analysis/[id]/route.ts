import { NextResponse } from 'next/server';
import { getAnalysis } from '@/lib/db/client';

/**
 * GET /api/analysis/[id]
 * Fetch the status and results of a specific analysis.
 */
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> } // In Next.js 15, params is a Promise
) {
    try {
        const { id } = await params;
        if (!id) {
            return NextResponse.json({ success: false, error: 'Analysis ID is required' }, { status: 400 });
        }

        const analysis = await getAnalysis(id);

        if (!analysis) {
            return NextResponse.json({ success: false, error: 'Analysis not found' }, { status: 404 });
        }

        // Determine polling interval based on status
        const isComplete = analysis.status === 'completed' || analysis.status === 'failed' || analysis.status === 'uploading_ipfs';

        return NextResponse.json(
            {
                success: true,
                data: analysis,
                // Hint to client whether to continue polling
                pollingComplete: isComplete,
            },
            {
                // Add cache control headers - don't cache while processing
                headers: {
                    'Cache-Control': isComplete ? 'public, max-age=60' : 'no-store, max-age=0',
                },
            }
        );

    } catch (error) {
        console.error(`Get Analysis API Error:`, error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
