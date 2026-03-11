import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
    test('loads with hero section', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/Sealship/i);
        await expect(page.getByRole('heading', { name: /Code Speaks/i })).toBeVisible();
        await expect(page.locator('#repoUrl')).toBeVisible();
        await expect(page.getByRole('button', { name: /Dive In/i })).toBeVisible();
    });

    test('feature cards render correctly', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByRole('heading', { name: 'Deterministic Scoring' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'AI Deep Dive' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Web3 Verified' })).toBeVisible();
    });

    test('navigation links work', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByRole('link', { name: /Analyzer/i })).toBeVisible();
        await expect(page.getByRole('link', { name: /Leaderboard/i })).toBeVisible();

        await page.getByRole('link', { name: /Leaderboard/i }).click();
        await expect(page).toHaveURL(/\/leaderboard/);

        await page.getByRole('link', { name: /Sealship/i }).click();
        await expect(page).toHaveURL('/');
    });

    test('theme toggle switches modes', async ({ page }) => {
        await page.goto('/');
        const body = page.locator('body');
        const initialBg = await body.evaluate(el => getComputedStyle(el).backgroundColor);

        await page.locator('button').filter({ has: page.locator('svg, span') }).first().click();
        const newBg = await body.evaluate(el => getComputedStyle(el).backgroundColor);
        expect(newBg).not.toBe(initialBg);
    });

    test('header renders with logo and controls', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByText('Sealship')).toBeVisible();
        await expect(page.getByText('TESTNET')).toBeVisible();
        await expect(page.getByRole('button', { name: /Connect Wallet/i })).toBeVisible();
    });
});
