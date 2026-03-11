import { test, expect } from '@playwright/test';

const MOCK_COMPLETED_ANALYSIS = {
    id: 'test-id',
    status: 'completed',
    total_score: 85,
    commit_sha: 'abc1234567890',
    documentation_score: 17,
    testing_score: 18,
    architecture_score: 16,
    hygiene_score: 18,
    security_score: 16,
    repo_hash: '0xabc123def456',
    report_cid: 'bafybeigtest',
    ai_analysis: '### Summary\nGreat repo with solid architecture.',
    tx_hash: null,
    repo_url: 'https://github.com/test/repo',
};

test.describe('Analysis Page', () => {
    test('progress page shows steps while analyzing', async ({ page }) => {
        await page.route('**/api/analysis/test-id', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    data: { status: 'analyzing' },
                    pollingComplete: false,
                }),
            });
        });

        await page.goto('/analysis/test-id');
        await expect(page.getByText(/Diving Deep/)).toBeVisible();
        await expect(page.getByText('Fetching GitHub Data')).toBeVisible();
        await expect(page.getByText('Calculating Deterministic Score')).toBeVisible();
        await expect(page.getByText('Generating AI Context')).toBeVisible();
    });

    test('completed analysis shows score breakdown', async ({ page }) => {
        await page.route('**/api/analysis/test-id', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    data: MOCK_COMPLETED_ANALYSIS,
                    pollingComplete: true,
                }),
            });
        });

        await page.goto('/analysis/test-id');
        await expect(page.getByText('Score Report')).toBeVisible();
        await expect(page.getByText('85')).toBeVisible();

        // Category score bars
        await expect(page.getByText('Documentation')).toBeVisible();
        await expect(page.getByText('Testing')).toBeVisible();
        await expect(page.getByText('Architecture')).toBeVisible();
        await expect(page.getByText('Hygiene')).toBeVisible();
        await expect(page.getByText('Security')).toBeVisible();

        // AI analysis
        await expect(page.getByText('Summary')).toBeVisible();

        // Seal button (since tx_hash is null)
        await expect(page.getByRole('button', { name: /Seal on Polkadot Hub/i })).toBeVisible();
    });

    test('verified analysis shows transaction link', async ({ page }) => {
        const verifiedAnalysis = {
            ...MOCK_COMPLETED_ANALYSIS,
            tx_hash: '0xdeadbeef1234567890abcdef',
        };

        await page.route('**/api/analysis/test-id', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    data: verifiedAnalysis,
                    pollingComplete: true,
                }),
            });
        });

        await page.goto('/analysis/test-id');
        await expect(page.getByText('Web3 Verified')).toBeVisible();
        await expect(page.getByText('Sealed on Polkadot Hub')).toBeVisible();
        await expect(page.getByRole('link', { name: /View Transaction/i })).toHaveAttribute(
            'href',
            /blockscout-testnet\.polkadot\.io\/tx\/0xdeadbeef/
        );
    });
});
