import { test, expect } from '@playwright/test';

test.describe('ToolBox4Devs Web Application & Tools E2E Suite', () => {
  test('home page loads with tool catalog and search', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/ToolBox4Devs/);
    await expect(page.locator('h1')).toContainText('Modern Developers');

    // Test Search Filter
    const searchInput = page.getByPlaceholder(/Search tools/i);
    await expect(searchInput).toBeVisible();
    await searchInput.fill('JSON');
    await expect(page.getByText('JSON Formatter')).toBeVisible();
  });

  test('CIDR & Subnet Calculator calculates accurately', async ({ page }) => {
    await page.goto('/cidr-calculator');
    await expect(page.locator('h1')).toContainText('CIDR & Subnet Calculator');

    const input = page.locator('#cidr-input');
    await input.fill('10.0.0.0/16');

    await expect(page.getByText('65,534')).toBeVisible();
    await expect(page.getByText('255.255.0.0')).toBeVisible();
    await expect(page.getByText('10.0.0.1')).toBeVisible();
    await expect(page.getByText('10.0.255.254')).toBeVisible();
  });

  test('String Escape & Unescape processes input and mode toggle', async ({ page }) => {
    await page.goto('/string-escaper');
    await expect(page.locator('h1')).toContainText('String Escape & Unescape');

    const textarea = page.getByPlaceholder('Type or paste text to escape/unescape...');
    await textarea.fill('Hello "DevTools"!\nNew Line');

    // Check JSON escape output
    const output = page.getByPlaceholder('Result will appear here...');
    await expect(output).toHaveValue(/Hello \\"DevTools\\"/);

    // Switch to SQL mode
    await page.getByRole('button', { name: 'SQL' }).click();
    await textarea.fill("User's Query");
    await expect(output).toHaveValue("User''s Query");
  });

  test('Number Base Converter calculates real-time radix representations', async ({ page }) => {
    await page.goto('/base-converter');
    await expect(page.locator('h1')).toContainText('Number Base Converter');

    const input = page.locator('#base-input');
    await input.fill('255');

    await expect(page.getByText('0xFF')).toBeVisible();
    await expect(page.getByText('0o377')).toBeVisible();
  });

  test('CSS Unit Converter computes responsive units and clamp() formula', async ({ page }) => {
    await page.goto('/css-unit-converter');
    await expect(page.locator('h1')).toContainText('CSS Unit & Fluid clamp() Converter');

    const input = page.locator('#unit-val');
    await input.fill('32');

    await expect(page.getByText('2rem')).toBeVisible();
    await expect(page.getByText('w-8 / p-8')).toBeVisible();
  });

  test('tools index page categorizes and filters utilities', async ({ page }) => {
    await page.goto('/tools');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('ALL');

    // Filter by Data Tools
    const dataFilter = page.getByRole('button', { name: /Data/i });
    if (await dataFilter.isVisible()) {
      await dataFilter.click();
      await expect(page.getByText('CIDR & Subnet Calculator')).toBeVisible();
    }
  });
});
