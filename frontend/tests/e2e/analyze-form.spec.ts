import { test, expect } from '@playwright/test';

test.describe('Analyze Form', () => {
    test('rejects invalid GitHub URL', async ({ page }) => {
        await page.goto('/');
        await page.locator('#repoUrl').fill('https://example.com/not-github');
        await page.getByRole('button', { name: /Dive In/i }).click();
        await expect(page.getByText('Please enter a valid GitHub repository URL.')).toBeVisible();
    });

    test('rejects empty input', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByRole('button', { name: /Dive In/i })).toBeDisabled();
    });

    test('accepts valid GitHub URL and redirects', async ({ page }) => {
        await page.route('**/api/analyze', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    data: { analysisId: 'test-123', status: 'queued' },
                }),
            });
        });

        // Also mock the polling endpoint so the page doesn't error
        await page.route('**/api/analysis/test-123', async (route) => {
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

        await page.goto('/');
        await page.locator('#repoUrl').fill('https://github.com/vercel/next.js');
        await page.getByRole('button', { name: /Dive In/i }).click();
        await expect(page.getByText('Diving...')).toBeVisible();
        await expect(page).toHaveURL(/\/analysis\/test-123/);
    });

    test('handles API error gracefully', async ({ page }) => {
        await page.route('**/api/analyze', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: false,
                    error: 'Repository not found',
                }),
            });
        });

        await page.goto('/');
        await page.locator('#repoUrl').fill('https://github.com/nonexistent/repo');
        await page.getByRole('button', { name: /Dive In/i }).click();
        await expect(page.getByText('Repository not found')).toBeVisible();
        // Form should still be usable (not stuck in loading state)
        await expect(page.getByRole('button', { name: /Dive In/i })).toBeEnabled();
    });
});
