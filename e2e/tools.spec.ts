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

  test('tool page FAQ accordion toggles with mouse and keyboard', async ({ page }) => {
    const faqSection = page.locator('section[aria-labelledby="faq-heading"]');
    const firstQuestion = faqSection.getByRole('button').first();
    await gotoHydrated(page, '/cidr-calculator', firstQuestion);

    const panelId = await firstQuestion.getAttribute('aria-controls');
    expect(panelId).toBeTruthy();
    const panel = page.locator(`[id="${panelId}"]`);

    await expect(firstQuestion).toHaveAttribute('aria-expanded', 'false');
    await expect(panel).toBeHidden();

    await firstQuestion.click();
    await expect(firstQuestion).toHaveAttribute('aria-expanded', 'true');
    await expect(panel).toBeVisible();
    await expect(panel).toHaveAttribute('role', 'region');

    await firstQuestion.focus();
    await page.keyboard.press('Enter');
    await expect(firstQuestion).toHaveAttribute('aria-expanded', 'false');
    await expect(panel).toBeHidden();

    await page.keyboard.press('Space');
    await expect(firstQuestion).toHaveAttribute('aria-expanded', 'true');
    await expect(panel).toBeVisible();
  });

  test('text fields show a Clear button that empties the field and restores focus', async ({ page }) => {
    const input = page.getByPlaceholder('https://...');
    await gotoHydrated(page, '/url-parser', input);
    const clearInput = page.getByRole('button', { name: 'Clear URL to Parse' });

    await input.fill('');
    await expect(clearInput).toHaveCount(0);

    await input.fill('https://example.com/a?b=1');
    await expect(clearInput).toBeVisible();

    // The button follows the field in the tab order and works from the keyboard.
    await input.focus();
    await page.keyboard.press('Tab');
    await expect(clearInput).toBeFocused();
    await page.keyboard.press('Enter');

    await expect(input).toHaveValue('');
    await expect(input).toBeFocused();
    await expect(clearInput).toHaveCount(0);
  });

  test('textarea Clear button empties the field without moving it', async ({ page }) => {
    const textarea = page.locator('textarea').first();
    await gotoHydrated(page, '/case-converter', textarea);
    const clearButton = page.getByRole('button', { name: /^Clear / }).first();

    await textarea.fill('');
    await expect(clearButton).toHaveCount(0);
    const before = await textarea.boundingBox();

    await textarea.fill('hello world');
    await expect(clearButton).toBeVisible();
    expect(await textarea.boundingBox()).toEqual(before);

    await clearButton.click();
    await expect(textarea).toHaveValue('');
    await expect(textarea).toBeFocused();
    expect(await textarea.boundingBox()).toEqual(before);
  });

  test('SQL Formatter loads the multi-join sample and keeps each join on one line', async ({ page }) => {
    const sample = page.getByRole('button', { name: 'Multi-Join Report' });
    await gotoHydrated(page, '/sql-formatter', sample);

    await sample.click();
    await expect(page.getByText('LEFT JOIN categories cat ON cat.id = p.category_id').first()).toBeVisible();
    await expect(page.getByText('INNER JOIN order_items oi ON oi.order_id = o.id').first()).toBeVisible();
  });

  test('Regex Tester example presets load a pattern and show matches', async ({ page }) => {
    const preset = page.getByRole('button', { name: 'IPv4', exact: true });
    await gotoHydrated(page, '/regex', preset);

    await preset.click();
    await expect(page.getByText('256.1.1.1 is not', { exact: false }).first()).toBeVisible();
    await expect(page.getByText('10.0.0.255', { exact: true }).first()).toBeVisible();
  });

  test('textarea accepts a dropped text file and rejects binary or oversized files', async ({ page }) => {
    const textarea = page.locator('textarea').first();
    await gotoHydrated(page, '/case-converter', textarea);

    const drop = async (name: string, bytes: number[] | { size: number }) => {
      const dataTransfer = await page.evaluateHandle(
        ({ name, bytes }) => {
          const data = Array.isArray(bytes) ? new Uint8Array(bytes) : new Uint8Array(bytes.size).fill(97);
          const dt = new DataTransfer();
          dt.items.add(new File([data], name));
          return dt;
        },
        { name, bytes }
      );
      await textarea.dispatchEvent('dragover', { dataTransfer });
      await expect(textarea).toHaveAttribute('data-dragging', 'true');
      await textarea.dispatchEvent('drop', { dataTransfer });
      await expect(textarea).not.toHaveAttribute('data-dragging', 'true');
    };
    const alert = page.getByRole('alert').filter({ hasText: 'notes' });

    await drop('notes.txt', [...Buffer.from('hello from a file')]);
    await expect(textarea).toHaveValue('hello from a file');
    await expect(alert).toHaveCount(0);

    await drop('notes.png', [0x89, 0x50, 0x4e, 0x47, 0x00, 0x01, 0xff]);
    await expect(alert).toContainText('does not look like a text file');
    await expect(textarea).toHaveValue('hello from a file');

    await drop('notes.log', { size: 2 * 1024 * 1024 + 1 });
    await expect(alert).toContainText('over the 2.0 MB limit');
    await expect(textarea).toHaveValue('hello from a file');

    await drop('notes.md', [...Buffer.from('# replaced')]);
    await expect(textarea).toHaveValue('# replaced');
    await expect(alert).toHaveCount(0);
  });

  test('Base32 tool encodes, swaps to decode and reports invalid input', async ({ page }) => {
    const input = page.getByPlaceholder('Type or paste text to encode...');
    await gotoHydrated(page, '/base32', input);
    await expect(page.locator('h1')).toContainText('Base32');

    await input.fill('foobar');
    await expect(page.getByText('MZXW6YTBOI======').first()).toBeVisible();

    await page.getByRole('button', { name: 'Swap' }).click();
    const base32Input = page.getByPlaceholder(/Paste Base32/);
    await expect(base32Input).toHaveValue('MZXW6YTBOI======');
    await expect(page.getByText('foobar', { exact: true }).first()).toBeVisible();

    await base32Input.fill('MZXW1');
    await expect(page.getByRole('alert')).toContainText('Invalid Base32 character "1"');
  });

  test('NanoID Generator makes IDs that match the chosen length and alphabet', async ({ page }) => {
    const length = page.getByLabel(/^Length/);
    await gotoHydrated(page, '/nanoid-generator', length);
    await expect(page.locator('h1')).toContainText('NanoID');

    await page.getByLabel('Alphabet', { exact: true }).selectOption('numbers');
    await length.fill('12');
    await page.getByLabel(/^How many/).fill('3');
    await page.getByRole('button', { name: 'Generate 3 IDs' }).click();

    const items = page.getByRole('list', { name: 'Generated IDs' }).getByRole('listitem');
    await expect(items).toHaveCount(3);
    for (const text of await items.getByTestId('nanoid-value').allInnerTexts()) {
      expect(text.trim()).toMatch(/^\d{12}$/);
    }

    await page.getByLabel('Alphabet', { exact: true }).selectOption('custom');
    await page.getByLabel('Custom alphabet', { exact: true }).fill('aab');
    await expect(page.getByRole('alert')).toContainText('repeated characters');
    await expect(page.getByRole('button', { name: /^Generate/ })).toBeDisabled();
  });

  test('Color Converter shows harmony swatches and a swatch click sets the active color', async ({ page }) => {
    const input = page.getByPlaceholder('#7c3aed');
    await gotoHydrated(page, '/color-converter', input);

    await input.fill('#ff0000');
    const harmonies = page.locator('section[aria-labelledby="color-harmonies-heading"]');
    await expect(harmonies.getByRole('button')).toHaveCount(5);

    await harmonies.getByRole('button', { name: /complementary color #00FFFF/ }).click();
    await expect(input).toHaveValue('#00FFFF');
    await expect(page.getByText('rgb(0, 255, 255)').first()).toBeVisible();
    await expect(harmonies.getByRole('button', { name: /complementary color #FF0000/ })).toBeVisible();
  });

  test('CSV viewer copies the visible table as Markdown and HTML', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    const sample = page.getByRole('button', { name: '500-Row E-Commerce CSV' });
    await gotoHydrated(page, '/csv-txt-viewer', sample);
    await sample.click();

    const exportButton = page.getByRole('button', { name: 'Export', exact: true });
    await expect(exportButton).toBeVisible({ timeout: 15000 });

    await exportButton.click();
    await page.getByRole('button', { name: 'Copy Markdown table' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Markdown table copied' })).toBeVisible();
    const markdown = await page.evaluate(() => navigator.clipboard.readText());
    const mdLines = markdown.split('\n');
    expect(mdLines[0]).toMatch(/^\| order_id \| customer_name \|/);
    expect(mdLines[1]).toMatch(/^\| --- \| --- \|/);
    expect(mdLines.length).toBeGreaterThan(2);

    await exportButton.click();
    await page.getByRole('button', { name: 'Copy HTML table' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'HTML table copied' })).toBeVisible();
    const html = await page.evaluate(() => navigator.clipboard.readText());
    expect(html.startsWith('<table>')).toBe(true);
    expect(html).toContain('<th>order_id</th>');
  });
});
