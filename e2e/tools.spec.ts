import { test, expect, type Locator, type Page } from '@playwright/test';

async function gotoHydrated(page: Page, path: string, interactiveLocator?: Locator) {
  await page.goto(path, { waitUntil: 'networkidle' });
  if (interactiveLocator) {
    await interactiveLocator.waitFor({ state: 'visible' });
    await expect
      .poll(
        () =>
          interactiveLocator.evaluate((el) =>
            Object.keys(el).some((key) => key.startsWith('__reactProps$'))
          ),
        { timeout: 10000 }
      )
      .toBe(true);
  }
}

test.describe('ToolBox4Devs Web Application & Tools E2E Suite', () => {
  test('home page loads with tool catalog and search', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Search/i).first();
    await gotoHydrated(page, '/', searchInput);
    await expect(page).toHaveTitle(/ToolBox4Devs/);
    await expect(page.locator('h1')).toContainText('Modern Engineers');

    // Test Search Filter
    await expect(searchInput).toBeVisible();
    await searchInput.fill('JSON');
    await expect(page.getByText('JSON Formatter').first()).toBeVisible();
  });

  test('CIDR & Subnet Calculator calculates accurately', async ({ page }) => {
    const input = page.locator('#cidr-input');
    await gotoHydrated(page, '/cidr-calculator', input);
    await expect(page.locator('h1')).toContainText('CIDR & Subnet Calculator');

    await input.fill('10.0.0.0/16');

    await expect(page.getByText('65,534', { exact: true })).toBeVisible();
    await expect(page.getByText('255.255.0.0', { exact: true })).toBeVisible();
    await expect(page.getByText('10.0.0.1', { exact: true })).toBeVisible();
    await expect(page.getByText('10.0.255.254', { exact: true })).toBeVisible();
  });

  test('String Escape & Unescape processes input and mode toggle', async ({ page }) => {
    const textarea = page.getByPlaceholder('Type or paste text to escape/unescape...');
    await gotoHydrated(page, '/string-escaper', textarea);
    await expect(page.locator('h1')).toContainText('String Escape & Unescape');

    await textarea.fill('Hello "DevTools"!\nNew Line');

    // Check JSON escape output
    const output = page.getByPlaceholder('Result will appear here...');
    await expect(output).toHaveValue(/Hello \\"DevTools\\"/);

    // Switch to SQL mode
    await page.getByRole('button', { name: 'SQL', exact: true }).click();
    await textarea.fill("User's Query");
    await expect(output).toHaveValue("User''s Query");
  });

  test('Number Base Converter calculates real-time radix representations', async ({ page }) => {
    const input = page.locator('#base-input');
    await gotoHydrated(page, '/base-converter', input);
    await expect(page.locator('h1')).toContainText('Number Base Converter');

    await input.fill('255');

    await expect(page.getByText('0xFF', { exact: true })).toBeVisible();
    await expect(page.getByText('0o377', { exact: true })).toBeVisible();

    await input.fill('1024');
    await expect(page.getByText('0x400', { exact: true })).toBeVisible();
    await expect(page.getByText('0o2000', { exact: true })).toBeVisible();
  });

  test('CSS Unit Converter computes responsive units and clamp() formula', async ({ page }) => {
    const input = page.locator('#unit-val');
    await gotoHydrated(page, '/css-unit-converter', input);
    await expect(page.locator('h1')).toContainText('CSS Unit & Fluid clamp() Converter');

    await input.fill('32');

    await expect(page.getByText('2rem', { exact: true })).toBeVisible();
    await expect(page.getByText('w-8 / p-8', { exact: true })).toBeVisible();
  });

  test('tools index page categorizes and filters utilities', async ({ page }) => {
    const dataFilter = page.getByRole('button', { name: /Data/i }).first();
    await gotoHydrated(page, '/tools', dataFilter);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('ALL');

    // Filter by Data Tools
    await expect(dataFilter).toBeVisible();
    await dataFilter.click();
    await expect(page).toHaveURL(/\/tools\/data-tools/);
    await expect(page.getByText('CIDR & Subnet Calculator').first()).toBeVisible();
  });

  test('.env File Auditor & Secret Detector flags secrets and missing keys', async ({ page }) => {
    const envInput = page.getByPlaceholder(/NODE_ENV=development/).first();
    await gotoHydrated(page, '/env-auditor', envInput);
    await expect(page.locator('h1')).toContainText('.env File Auditor');
    await expect(page.getByText('AWS Access Key ID', { exact: true })).toBeVisible();
    await expect(page.getByText('+ STRIPE_WEBHOOK_SECRET', { exact: true })).toBeVisible();
  });
});
