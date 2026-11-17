import { describe, expect, it } from 'vitest'
import {
  AI_CRAWLERS,
  ROBOTS_PRESET_IDS,
  buildRobotsTxt,
  buildSitemapXml,
  escapeXml,
  generateSitemap,
  isValidLastmod,
  parseLines,
  robotsPresetGroups,
  validateRobots,
  type RobotsConfig,
} from '../utils/robotsSitemap'
import { ROBOTS_SITEMAP_GENERATOR_META } from '../tools/meta/robots-sitemap-generator'

const emptyConfig: RobotsConfig = { groups: [], sitemaps: '' }

describe('escapeXml', () => {
  it('escapes ampersand, angle brackets, double and single quotes', () => {
    expect(escapeXml(`& < > " '`)).toBe('&amp; &lt; &gt; &quot; &apos;')
  })
  it('escapes an ampersand only once', () => {
    expect(escapeXml('&amp;')).toBe('&amp;amp;')
  })
  it('leaves plain URLs unchanged', () => {
    expect(escapeXml('https://example.com/a/b-c_d')).toBe('https://example.com/a/b-c_d')
  })
})

describe('parseLines', () => {
  it('trims lines, drops blanks and keeps original line numbers', () => {
    expect(parseLines('  a \n\n b\r\n')).toEqual([
      { line: 1, text: 'a' },
      { line: 3, text: 'b' },
    ])
  })
})

describe('robots presets', () => {
  it('defines three presets with groups', () => {
    expect(ROBOTS_PRESET_IDS).toEqual(['allow-all', 'block-all', 'block-ai'])
    for (const id of ROBOTS_PRESET_IDS) expect(robotsPresetGroups(id).length).toBeGreaterThan(0)
  })

  it('block-ai creates one group per AI crawler, each disallowing everything', () => {
    const groups = robotsPresetGroups('block-ai')
    expect(groups.map(g => g.userAgent)).toEqual([...AI_CRAWLERS])
    expect(AI_CRAWLERS).toEqual(expect.arrayContaining(['GPTBot', 'ClaudeBot', 'CCBot', 'Google-Extended']))
    for (const group of groups) expect(group.disallow).toBe('/')
  })

  it('returns fresh objects so editing one result does not change the next', () => {
    const first = robotsPresetGroups('allow-all')
    first[0].disallow = '/private'
    expect(robotsPresetGroups('allow-all')[0].disallow).toBe('')
  })
})

describe('buildRobotsTxt', () => {
  it('builds the block-all preset', () => {
    const txt = buildRobotsTxt({ groups: robotsPresetGroups('block-all'), sitemaps: '' })
    expect(txt).toBe('User-agent: *\nDisallow: /\n')
  })

  it('separates groups with a blank line and lists allow before disallow', () => {
    const txt = buildRobotsTxt({
      groups: [
        { userAgent: 'Googlebot', allow: '/public/', disallow: '/admin/\n/tmp/', crawlDelay: '' },
        { userAgent: '*', allow: '', disallow: '/', crawlDelay: '10' },
      ],
      sitemaps: '',
    })
    expect(txt).toBe(
      'User-agent: Googlebot\nAllow: /public/\nDisallow: /admin/\nDisallow: /tmp/\n\nUser-agent: *\nDisallow: /\nCrawl-delay: 10\n',
    )
  })

  it('adds sitemap lines after the groups, separated by a blank line', () => {
    const txt = buildRobotsTxt({
      groups: [{ userAgent: '*', allow: '/', disallow: '', crawlDelay: '' }],
      sitemaps: 'https://example.com/sitemap.xml\n\nhttps://example.com/news.xml',
    })
    expect(txt).toBe(
      'User-agent: *\nAllow: /\n\nSitemap: https://example.com/sitemap.xml\nSitemap: https://example.com/news.xml\n',
    )
  })

  it('leaves out groups with no user-agent and returns an empty string when nothing is set', () => {
    expect(buildRobotsTxt({ groups: [{ ...robotsPresetGroups('allow-all')[0], userAgent: ' ' }], sitemaps: '' })).toBe('')
    expect(buildRobotsTxt(emptyConfig)).toBe('')
  })
})

describe('validateRobots', () => {
  it('reports nothing for a clean allow-all configuration', () => {
    expect(validateRobots({ groups: robotsPresetGroups('allow-all'), sitemaps: 'https://example.com/sitemap.xml' })).toEqual([])
  })

  it('asks for at least one group', () => {
    expect(validateRobots(emptyConfig)).toEqual(['Add at least one user-agent group, or use a preset.'])
  })

  it('flags duplicate user-agents case-insensitively', () => {
    const warnings = validateRobots({
      groups: [
        { userAgent: 'GPTBot', allow: '', disallow: '/', crawlDelay: '' },
        { userAgent: 'gptbot', allow: '', disallow: '/a', crawlDelay: '' },
      ],
      sitemaps: '',
    })
    expect(warnings.join('\n')).toContain('User-agent "gptbot" appears in more than one group')
  })

  it('flags paths that do not start with a slash', () => {
    const warnings = validateRobots({
      groups: [{ userAgent: '*', allow: '', disallow: 'admin/', crawlDelay: '' }],
      sitemaps: '',
    })
    expect(warnings).toEqual(['Disallow path "admin/" in group 1 should start with /.'])
  })

  it('flags an invalid crawl-delay and notes when Google ignores a valid one', () => {
    const bad = validateRobots({ groups: [{ userAgent: '*', allow: '', disallow: '', crawlDelay: 'soon' }], sitemaps: '' })
    expect(bad).toEqual(['Crawl-delay "soon" in group 1 must be a whole or decimal number of seconds.'])
    const good = validateRobots({ groups: [{ userAgent: '*', allow: '', disallow: '', crawlDelay: '5' }], sitemaps: '' })
    expect(good[0]).toContain('Google ignores it')
  })

  it('flags relative and duplicate sitemap lines', () => {
    const warnings = validateRobots({
      groups: [{ userAgent: '*', allow: '', disallow: '', crawlDelay: '' }],
      sitemaps: '/sitemap.xml\nhttps://example.com/s.xml\nhttps://example.com/s.xml',
    })
    expect(warnings.some(w => w.includes('Sitemap on line 1') && w.includes('absolute URL'))).toBe(true)
    expect(warnings).toContain('Sitemap "https://example.com/s.xml" is listed more than once.')
  })
})

describe('isValidLastmod', () => {
  it('accepts W3C dates and datetimes with a real calendar date', () => {
    expect(isValidLastmod('2026-11-17')).toBe(true)
    expect(isValidLastmod('2026-11-17T08:30:00+01:00')).toBe(true)
    expect(isValidLastmod('2024-02-29')).toBe(true)
  })
  it('rejects impossible dates and other formats', () => {
    expect(isValidLastmod('2026-02-30')).toBe(false)
    expect(isValidLastmod('17/11/2026')).toBe(false)
    expect(isValidLastmod('2026-11-17 08:30')).toBe(false)
  })
})

describe('generateSitemap', () => {
  it('builds valid XML with the namespace and only the fields given', () => {
    const { xml, entries, warnings } = generateSitemap('https://example.com/\nhttps://example.com/blog weekly 0.8')
    expect(warnings).toEqual([])
    expect(entries).toHaveLength(2)
    expect(xml).toBe(
      [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        '  <url>',
        '    <loc>https://example.com/</loc>',
        '  </url>',
        '  <url>',
        '    <loc>https://example.com/blog</loc>',
        '    <changefreq>weekly</changefreq>',
        '    <priority>0.8</priority>',
        '  </url>',
        '</urlset>',
        '',
      ].join('\n'),
    )
  })

  it('accepts lastmod, changefreq and priority in any order and normalises changefreq case', () => {
    const { entries } = generateSitemap('https://example.com/a 1.0 Daily 2026-11-01')
    expect(entries).toEqual([{ url: 'https://example.com/a', priority: '1.0', changefreq: 'daily', lastmod: '2026-11-01' }])
  })

  it('escapes XML special characters in URLs', () => {
    const { xml } = generateSitemap(`https://example.com/search?a=1&b=<2>"it's"`)
    expect(xml).toContain('<loc>https://example.com/search?a=1&amp;b=&lt;2&gt;&quot;it&apos;s&quot;</loc>')
    const locValue = /<loc>([^<]*)<\/loc>/.exec(xml)?.[1] ?? ''
    expect(locValue).not.toMatch(/[<>"']|&(?!amp;|lt;|gt;|quot;|apos;)/)
  })

  it('leaves out relative and non-http URLs and says why', () => {
    const { entries, warnings } = generateSitemap('/about\nftp://example.com/file\nhttps://example.com/ok')
    expect(entries.map(e => e.url)).toEqual(['https://example.com/ok'])
    expect(warnings[0]).toBe('Line 1: "/about" must be an absolute URL, such as https://example.com/page. This line is left out.')
    expect(warnings[1]).toContain('Line 2')
  })

  it('keeps the first of duplicate URLs and reports the later line', () => {
    const { entries, warnings } = generateSitemap('https://example.com/a\nhttps://example.com/b\nhttps://example.com/a')
    expect(entries.map(e => e.url)).toEqual(['https://example.com/a', 'https://example.com/b'])
    expect(warnings).toEqual(['Line 3: "https://example.com/a" is a duplicate of line 1. This line is left out.'])
  })

  it('drops invalid optional fields with a warning and keeps the URL', () => {
    const { entries, warnings } = generateSitemap('https://example.com/a 2026-02-30 sometimes 1.5')
    expect(entries).toEqual([{ url: 'https://example.com/a' }])
    expect(warnings).toEqual([
      'Line 1: lastmod "2026-02-30" is not a valid date. Use YYYY-MM-DD. It is left out.',
      'Line 1: "sometimes" is not a lastmod date, changefreq or priority. It is ignored.',
      'Line 1: priority "1.5" must be between 0.0 and 1.0. It is left out.',
    ])
  })

  it('warns above 50,000 URLs but still returns the XML', () => {
    const text = Array.from({ length: 50001 }, (_, i) => `https://example.com/p/${i}`).join('\n')
    const { entries, warnings } = generateSitemap(text)
    expect(entries).toHaveLength(50001)
    expect(warnings[0]).toContain('The sitemap has 50001 URLs')
  })

  it('returns an empty urlset for empty input', () => {
    expect(generateSitemap('  \n ').xml).toBe(
      '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"/>\n',
    )
  })
})

describe('buildSitemapXml', () => {
  it('escapes values passed in directly', () => {
    const xml = buildSitemapXml([{ url: 'https://example.com/?q=a&b', lastmod: '2026-01-01' }])
    expect(xml).toContain('<loc>https://example.com/?q=a&amp;b</loc>')
  })
})

describe('robots & sitemap generator guide example', () => {
  it('matches what the tool produces', () => {
    const example = ROBOTS_SITEMAP_GENERATOR_META.guide?.example
    expect(example).toBeDefined()
    expect(generateSitemap(example?.input ?? '').xml).toBe(example?.output)
  })
})
