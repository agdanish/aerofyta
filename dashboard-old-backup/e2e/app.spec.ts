import { test, expect } from '@playwright/test';

test.describe('AeroFyta Dashboard', () => {
  test('loads in demo mode when backend is down', async ({ page }) => {
    await page.goto('/');
    // Should show DEMO badge
    await expect(page.locator('text=DEMO')).toBeVisible();
    // Should show demo mode banner
    await expect(page.locator('text=Demo mode')).toBeVisible();
  });

  test('displays wallet balances in demo mode', async ({ page }) => {
    await page.goto('/');
    // Should show ETH and TON wallets
    await expect(page.locator('text=ETH')).toBeVisible();
    await expect(page.locator('text=TON')).toBeVisible();
    // Should show USDT total
    await expect(page.locator('text=USDT total')).toBeVisible();
  });

  test('displays Rumble creators in demo mode', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Rumble Creators')).toBeVisible();
    await expect(page.locator('text=TechReview')).toBeVisible();
    await expect(page.locator('text=CryptoDaily')).toBeVisible();
    await expect(page.locator('text=NewsNow')).toBeVisible();
  });

  test('tip form has all required fields', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Tipping Actions')).toBeVisible();
    await expect(page.getByPlaceholder('0x... or UQ... address')).toBeVisible();
    await expect(page.getByRole('button', { name: /Send Tip/ })).toBeVisible();
  });

  test('clicking creator Tip button populates recipient', async ({ page }) => {
    await page.goto('/');
    // Wait for demo data to load
    await expect(page.locator('text=TechReview')).toBeVisible();
    // Click the first Tip button
    const tipButtons = page.getByRole('button', { name: 'Tip' });
    await tipButtons.first().click();
    // Recipient field should be populated
    const recipientInput = page.getByPlaceholder('0x... or UQ... address');
    await expect(recipientInput).not.toHaveValue('');
  });

  test('validates empty tip submission', async ({ page }) => {
    await page.goto('/');
    // Clear any pre-filled values and try to submit
    const sendButton = page.getByRole('button', { name: /Send Tip/ });
    // Button should be disabled when fields are empty
    await expect(sendButton).toBeDisabled();
  });

  test('shows agent pipeline section', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Agent Pipeline')).toBeVisible();
    await expect(page.locator('text=11-step decision pipeline')).toBeVisible();
  });

  test('shows recent activity in demo mode', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Recent Activity')).toBeVisible();
    await expect(page.locator('text=Tipped TechReview')).toBeVisible();
    await expect(page.locator('text=Auto-tipped CryptoDaily')).toBeVisible();
  });

  test('advanced mode toggle works', async ({ page }) => {
    await page.goto('/');
    const advancedBtn = page.getByRole('button', { name: 'Advanced' });
    await advancedBtn.click();
    // Should switch to advanced mode - button text changes to "Simple"
    await expect(page.getByRole('button', { name: 'Simple' })).toBeVisible();
    // Click back to simple
    await page.getByRole('button', { name: 'Simple' }).click();
    await expect(advancedBtn).toBeVisible();
  });

  test('tab navigation works', async ({ page }) => {
    await page.goto('/');
    // Click Auto-Tip tab
    await page.locator('text=Auto-Tip').click();
    await expect(page.locator('text=Watch-Time Auto-Tipping')).toBeVisible();
    // Click Pools tab
    await page.locator('text=Pools').click();
    await expect(page.locator('text=Community Tipping Pools')).toBeVisible();
    // Click Events tab
    await page.locator('text=Events').click();
    await expect(page.locator('text=Event-Triggered Tipping')).toBeVisible();
  });
});
