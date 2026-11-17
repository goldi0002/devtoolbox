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
  test('JSON Diff lists changes by path and can ignore array order', async ({ page }) => {
    const left = page.getByLabel('Original (left)', { exact: true });
    await gotoHydrated(page, '/json-diff', left);

    await left.fill('{"name":"Ada","age":36,"tags":["a","b"]}');
    await page.getByLabel('Changed (right)', { exact: true }).fill('{"age":37,"name":"Ada","tags":["b","a"],"id":1}');

    const changes = page.getByTestId('json-diff-changes');
    await expect(changes.getByRole('listitem')).toHaveCount(4);
    await expect(changes).toContainText('$.age');
    await expect(changes).toContainText('36 → 37');
    await expect(changes).toContainText('$.id');

    await page.getByRole('checkbox', { name: 'Ignore array order' }).check();
    await expect(changes.getByRole('listitem')).toHaveCount(2);

    await page.getByLabel('Changed (right)', { exact: true }).fill('{"tags":["b","a"],"age":36,"name":"Ada"}');
    await expect(page.getByRole('status').filter({ hasText: 'No differences' })).toBeVisible();

    await left.fill('{bad');
    await expect(page.getByText(/^⚠ Original:/)).toBeVisible();
  });
  test('Image Compressor converts an uploaded image and offers a download', async ({ page }) => {
    const picker = page.getByLabel('Images', { exact: true });
    await gotoHydrated(page, '/image-compressor', picker);

    const base64 = await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 200;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#3366cc';
      ctx.fillRect(0, 0, 400, 200);
      return canvas.toDataURL('image/png').split(',')[1];
    });
    await picker.setInputFiles({ name: 'blue.png', mimeType: 'image/png', buffer: Buffer.from(base64, 'base64') });

    const results = page.getByTestId('image-results');
    await expect(results).toContainText('blue-compressed.webp');
    await expect(results).toContainText('400 × 200 px');

    await page.getByLabel(/Max width/).fill('100');
    await expect(results).toContainText('100 × 50 px');

    await page.getByRole('button', { name: 'PNG', exact: true }).click();
    await expect(results).toContainText('blue-compressed.png');
    await expect(page.getByRole('link', { name: 'Download blue-compressed.png' })).toHaveAttribute('download', 'blue-compressed.png');
  });
  test('PDF Merge & Split merges files and extracts pages', async ({ page }) => {
    const picker = page.getByLabel('PDF files', { exact: true });
    await gotoHydrated(page, '/pdf-merge-split', picker);

    const makePdf = (pages: number) =>
      page.evaluate(async (count) => {
        const text = (s: string) => new TextEncoder().encode(s);
        const objects: string[] = [];
        const kids = Array.from({ length: count }, (_, i) => `${3 + i} 0 R`).join(' ');
        objects.push('<< /Type /Catalog /Pages 2 0 R >>');
        objects.push(`<< /Type /Pages /Kids [${kids}] /Count ${count} >>`);
        for (let i = 0; i < count; i++) objects.push('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] >>');
        let body = '%PDF-1.4\n';
        const offsets: number[] = [];
        objects.forEach((obj, i) => {
          offsets.push(body.length);
          body += `${i + 1} 0 obj\n${obj}\nendobj\n`;
        });
        const xref = body.length;
        body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
        offsets.forEach((o) => { body += `${String(o).padStart(10, '0')} 00000 n \n`; });
        body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
        return Array.from(text(body));
      }, pages);

    const toFile = async (name: string, pages: number) => ({
      name,
      mimeType: 'application/pdf',
      buffer: Buffer.from(await makePdf(pages)),
    });

    await picker.setInputFiles([await toFile('a.pdf', 2), await toFile('b.pdf', 3)]);
    const list = page.getByTestId('pdf-files');
    await expect(list.getByRole('listitem')).toHaveCount(2);
    await expect(list).toContainText('2 pages');
    await expect(list).toContainText('3 pages');

    await page.getByRole('button', { name: 'Move b.pdf up' }).click();
    await expect(list.getByRole('listitem').first()).toContainText('b.pdf');

    await page.getByRole('button', { name: 'Merge PDFs' }).click();
    const output = page.getByTestId('pdf-output');
    await expect(output).toContainText('merged.pdf: 5 pages');
    await expect(page.getByRole('link', { name: 'Download merged.pdf' })).toHaveAttribute('download', 'merged.pdf');

    await page.getByRole('button', { name: 'Extract pages', exact: true }).click();
    await page.getByLabel('PDF file', { exact: true }).setInputFiles(await toFile('report.pdf', 8));
    await page.getByLabel(/Pages to keep/).fill('1-3, 5');
    await page.getByRole('button', { name: 'Extract pages', exact: true }).last().click();
    await expect(output).toContainText('report-pages.pdf: 4 pages');

    await page.getByLabel(/Pages to keep/).fill('9');
    await page.getByRole('button', { name: 'Extract pages', exact: true }).last().click();
    await expect(page.getByText(/outside this PDF, which has 8 pages/)).toBeVisible();
  });
  test('Meta Tag Generator builds escaped tags, warns on length and updates previews', async ({ page }) => {
    const title = page.getByLabel('Page title', { exact: true });
    await gotoHydrated(page, '/meta-tag-generator', title);

    await title.fill('Tom "Ada" & Co <beta> notes');
    const output = page.getByTestId('meta-tags-output');
    await expect(output).toContainText('<meta property="og:title" content="Tom &quot;Ada&quot; &amp; Co &lt;beta&gt; notes">');
    await expect(page.getByTestId('preview-search')).toContainText('Tom "Ada" & Co <beta> notes');

    await title.fill('x'.repeat(61));
    await expect(page.getByText(/Title is 61 characters/)).toBeVisible();
    await title.fill('Ada Lovelace: Notes on the Analytical Engine');
    await expect(page.getByText(/Title is \d+ characters/)).toHaveCount(0);

    await page.getByRole('group', { name: 'Twitter Card type' }).getByRole('button', { name: 'Summary', exact: true }).click();
    await expect(output).toContainText('<meta name="twitter:card" content="summary">');
    await expect(page.getByRole('button', { name: 'Copy to clipboard' }).first()).toBeVisible();
  });
  test('CSS / JS Minifier minifies JavaScript and CSS and reports syntax errors', async ({ page }) => {
    const jsInput = page.getByLabel('JavaScript input', { exact: true });
    await gotoHydrated(page, '/css-js-minifier', jsInput);

    await jsInput.fill('// greet\nfunction greet(name) {\n  console.log(name);\n  return "hi " + name;\n}\n');
    await page.getByRole('checkbox', { name: 'Drop console calls' }).check();
    await page.getByRole('button', { name: 'Minify', exact: true }).click();

    const output = page.getByTestId('minify-output');
    await expect(output).toBeVisible();
    await expect(output).not.toContainText('console');
    await expect(output).not.toContainText('// greet');
    await expect(page.getByText('Saved', { exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Download minified.js' })).toHaveAttribute('download', 'minified.js');

    await jsInput.fill('const a = 1;\nconst b = ;');
    await page.getByRole('button', { name: 'Minify', exact: true }).click();
    await expect(page.getByText(/Syntax error at line 2/)).toBeVisible();

    await page.getByRole('button', { name: 'CSS', exact: true }).click();
    await page.getByLabel('CSS input', { exact: true }).fill('/* note */\n.box {\n  color: #ffffff;\n}');
    await page.getByRole('button', { name: 'Minify', exact: true }).click();
    await expect(output).toContainText('.box{');
    await expect(output).not.toContainText('note');
    await expect(page.getByRole('link', { name: 'Download minified.css' })).toHaveAttribute('download', 'minified.css');
  });

  test('SVG Optimizer removes comments, previews both SVGs and downloads the result', async ({ page }) => {
    const input = page.getByLabel('Original SVG', { exact: true });
    await gotoHydrated(page, '/svg-optimizer', input);

    await input.fill('<svg xmlns="http://www.w3.org/2000/svg"><!-- secret note --><path d="M1.000000 2.000000L3 4"/></svg>');
    const output = page.getByTestId('svg-output');
    await expect(output).toContainText('<path');
    await expect(output).not.toContainText('secret note');

    await expect(page.getByRole('img', { name: 'Original SVG preview', exact: true })).toHaveAttribute('src', /^blob:/);
    await expect(page.getByRole('img', { name: 'Optimized SVG preview', exact: true })).toHaveAttribute('src', /^blob:/);

    await page.getByRole('checkbox', { name: 'Remove comments', exact: true }).uncheck();
    await expect(output).toContainText('secret note');

    await input.fill('<html></html>');
    await expect(page.getByText(/does not look like an SVG/)).toBeVisible();

    await input.fill('<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0"/></svg>');
    const downloadButton = page.getByRole('button', { name: 'Download image.min.svg', exact: true });
    await expect(downloadButton).toBeVisible();
    const [download] = await Promise.all([page.waitForEvent('download'), downloadButton.click()]);
    expect(download.suggestedFilename()).toBe('image.min.svg');
  });
  test('Image to Base64 encodes a file and decodes a Data URI back', async ({ page }) => {
    const picker = page.getByLabel('File to encode', { exact: true });
    await gotoHydrated(page, '/image-to-base64', picker);

    await picker.setInputFiles({ name: 'hi.txt', mimeType: 'text/plain', buffer: Buffer.from('Hi') });
    await expect(page.getByLabel('Data URI output', { exact: true })).toHaveValue('data:text/plain;base64,SGk=');
    await expect(page.getByLabel('Raw Base64 output', { exact: true })).toHaveValue('SGk=');
    await expect(page.getByLabel('CSS background-image output', { exact: true })).toHaveValue('background-image: url("data:text/plain;base64,SGk=");');
    await expect(page.getByLabel('HTML img tag output', { exact: true })).toHaveValue('<img src="data:text/plain;base64,SGk=" alt="hi.txt">');
    await expect(page.getByText('text/plain', { exact: true })).toBeVisible();
    await expect(page.getByText(/Large file/)).toHaveCount(0);

    await page.getByRole('button', { name: 'Decode Data URI', exact: true }).click();
    const uri = page.getByLabel('Data URI', { exact: true });
    await uri.fill('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');
    await expect(page.getByTestId('data-uri-preview')).toBeVisible();
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Download decoded.png', exact: true }).click(),
    ]);
    expect(download.suggestedFilename()).toBe('decoded.png');

    await uri.fill('data:image/svg+xml,%3Csvg%3E%3C%2Fsvg%3E');
    await expect(page.getByText(/^⚠ Data URI: Only base64 Data URIs can be decoded/)).toBeVisible();
    await expect(page.getByTestId('data-uri-preview')).toHaveCount(0);
  });
  test('robots.txt & sitemap.xml Generator applies presets, warns on bad URLs and downloads both files', async ({ page }) => {
    const sitemapTab = page.getByRole('group', { name: 'Generator' }).getByRole('button', { name: 'sitemap.xml', exact: true });
    await gotoHydrated(page, '/robots-sitemap-generator', page.getByRole('group', { name: 'Robots presets' }).getByRole('button', { name: 'Block AI crawlers', exact: true }));

    await page.getByRole('group', { name: 'Robots presets' }).getByRole('button', { name: 'Block AI crawlers', exact: true }).click();
    const robotsOutput = page.getByTestId('robots-output');
    await expect(robotsOutput).toContainText('User-agent: GPTBot');
    await expect(robotsOutput).toContainText('User-agent: ClaudeBot');
    await expect(page.getByRole('button', { name: 'Copy to clipboard' }).first()).toBeVisible();

    await page.getByRole('group', { name: 'Robots presets' }).getByRole('button', { name: 'Block all', exact: true }).click();
    await expect(robotsOutput).toContainText('User-agent: *');
    await expect(robotsOutput).toContainText('Disallow: /');
    await expect(robotsOutput).not.toContainText('GPTBot');
    const robotsDownload = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download robots.txt', exact: true }).click();
    expect((await robotsDownload).suggestedFilename()).toBe('robots.txt');

    await sitemapTab.click();
    const sitemapText = page.getByLabel('Page URLs', { exact: true });
    await sitemapText.fill('https://example.com/a?x=1&y=2\n/relative\nhttps://example.com/a?x=1&y=2');
    const sitemapOutput = page.getByTestId('sitemap-output');
    await expect(sitemapOutput).toContainText('<loc>https://example.com/a?x=1&amp;y=2</loc>');
    await expect(page.getByText(/Line 2: "\/relative" must be an absolute URL/)).toBeVisible();
    await expect(page.getByText(/Line 3: "https:\/\/example\.com\/a\?x=1&y=2" is a duplicate of line 1/)).toBeVisible();
    const sitemapDownload = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download sitemap.xml', exact: true }).click();
    expect((await sitemapDownload).suggestedFilename()).toBe('sitemap.xml');
  });
  test('Time Zone Converter converts across DST, plans working hours and copies a summary', async ({ page }) => {
    const date = page.getByLabel('Date', { exact: true });
    await gotoHydrated(page, '/time-zone-converter', date);

    await date.fill('2026-03-29');
    await page.getByLabel('Time', { exact: true }).fill('09:00');

    // 2026-03-29: New York is on EDT, London has just moved to BST, Kolkata is UTC+05:30.
    await expect(page.getByTestId('convert-Europe/London')).toContainText('2026-03-29 14:00');
    await expect(page.getByTestId('convert-Asia/Kolkata')).toContainText('2026-03-29 18:30');
    await expect(page.getByTestId('convert-Asia/Kolkata')).toContainText('UTC+05:30');
    await expect(page.getByTestId('summary-line')).toHaveText(
      '2026-03-29 09:00 America/New_York (UTC-04:00) = Europe/London 14:00 (UTC+01:00); Asia/Kolkata 18:30 (UTC+05:30); Asia/Tokyo 22:00 (UTC+09:00)'
    );
    await expect(page.getByRole('button', { name: 'Copy to clipboard', exact: true }).filter({ hasText: 'Copy summary' })).toBeVisible();

    // Eight local working hours (09:00-16:59) per zone across the 24-hour planner.
    await expect(page.getByTestId('planner-Europe/London').locator('td[data-working="true"]')).toHaveCount(8);
    await expect(page.getByTestId('planner-Asia/Kolkata').locator('td[data-working="true"]')).toHaveCount(8);

    await page.getByPlaceholder('City or IANA name, e.g. kolkata or America/Chicago').fill('sydney');
    await page.getByRole('button', { name: 'Add Australia/Sydney', exact: true }).click();
    await expect(page.getByTestId('convert-Australia/Sydney')).toContainText('2026-03-30 00:00');
    await expect(page.getByTestId('convert-Australia/Sydney')).toContainText('+1 day');

    await page.getByRole('button', { name: 'Remove Asia/Tokyo', exact: true }).click();
    await expect(page.getByTestId('convert-Asia/Tokyo')).toHaveCount(0);

    // Spring forward: 02:30 does not exist in New York on 2026-03-08.
    await date.fill('2026-03-08');
    await page.getByLabel('Time', { exact: true }).fill('02:30');
    await expect(page.getByText(/does not exist in America\/New_York/)).toBeVisible();

    // Fall back: 01:30 happens twice in New York on 2026-11-01.
    await date.fill('2026-11-01');
    await page.getByLabel('Time', { exact: true }).fill('01:30');
    await expect(page.getByText(/happens twice in America\/New_York/)).toBeVisible();
  });

  test('Favicon Generator builds the icon set from an uploaded image and offers downloads', async ({ page }) => {
    const picker = page.getByLabel('Source image', { exact: true });
    await gotoHydrated(page, '/favicon-generator', picker);

    const base64 = await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(0, 0, 64, 64);
      return canvas.toDataURL('image/png').split(',')[1];
    });
    await picker.setInputFiles({ name: 'logo.png', mimeType: 'image/png', buffer: Buffer.from(base64, 'base64') });

    await expect(page.getByRole('img', { name: 'Preview of apple-touch-icon.png', exact: true })).toHaveAttribute('src', /^blob:/);
    await expect(page.getByRole('img', { name: 'Preview of favicon-16x16.png', exact: true })).toHaveAttribute('src', /^blob:/);
    await expect(page.getByTestId('favicon-results').getByRole('listitem')).toHaveCount(7);

    const linkTags = page.getByLabel('HTML link tags', { exact: true });
    await expect(linkTags).toHaveValue(/<link rel="apple-touch-icon" sizes="180x180" href="\/apple-touch-icon\.png">/);
    await page.getByLabel('Base path (where the files are hosted)', { exact: true }).fill('/assets/icons');
    await expect(linkTags).toHaveValue(/href="\/assets\/icons\/favicon\.ico"/);

    await expect(page.getByLabel('Web app manifest', { exact: true })).toHaveValue(/"theme_color": "#ffffff"/);
    await page.getByLabel('Site name (manifest)', { exact: true }).fill('Demo Site');
    await expect(page.getByLabel('Web app manifest', { exact: true })).toHaveValue(/"name": "Demo Site"/);

    const [icoDownload] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('link', { name: 'Download favicon.ico', exact: true }).click(),
    ]);
    expect(icoDownload.suggestedFilename()).toBe('favicon.ico');

    const [zipDownload] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Download all as ZIP', exact: true }).click(),
    ]);
    expect(zipDownload.suggestedFilename()).toBe('favicon-package.zip');
  });
});
