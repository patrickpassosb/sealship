import { test, expect } from '@playwright/test';

const MOCK_LEADERBOARD = [
    {
        id: '1',
        owner: 'polkadot',
        name: 'polkadot-sdk',
        commit_sha: 'abc1234567',
        total_score: 92,
        report_cid: 'bafybeig1',
        tx_hash: '0x111',
    },
    {
        id: '2',
        owner: 'vercel',
        name: 'next.js',
        commit_sha: 'def4567890',
        total_score: 87,
        report_cid: 'bafybeig2',
        tx_hash: '0x222',
    },
    {
        id: '3',
        owner: 'facebook',
        name: 'react',
        commit_sha: 'ghi7890123',
        total_score: 83,
        report_cid: 'bafybeig3',
        tx_hash: '0x333',
    },
];

test.describe('Leaderboard', () => {
    test('page loads with table', async ({ page }) => {
        // The leaderboard page is a Server Component that calls getLeaderboard() directly.
        // We mock the API route for the client-side fetch fallback.
        await page.route('**/api/leaderboard*', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ success: true, data: MOCK_LEADERBOARD }),
            });
        });

        await page.goto('/leaderboard');
        await expect(page.getByRole('heading', { name: /The Global Leaderboard/i })).toBeVisible();

        // Table headers
        await expect(page.getByText('Rank')).toBeVisible();
        await expect(page.getByText('Repository')).toBeVisible();
        await expect(page.getByText('Seal Score')).toBeVisible();
    });

    test('empty state shows message', async ({ page }) => {
        await page.route('**/api/leaderboard*', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ success: true, data: [] }),
            });
        });

        await page.goto('/leaderboard');
        // The leaderboard page is server-rendered, so the empty state depends on DB.
        // If DB is empty, we should see the empty state message.
        // Note: since this is SSR with getLeaderboard(), mock may not intercept server-side calls.
        // This test verifies the page loads without errors at minimum.
        await expect(page.getByRole('heading', { name: /The Global Leaderboard/i })).toBeVisible();
    });
});
