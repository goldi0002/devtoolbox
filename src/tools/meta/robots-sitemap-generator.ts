import { lazy } from 'react'
import type { ToolMeta } from '../tool-meta'

export const ROBOTS_SITEMAP_GENERATOR_META: ToolMeta = {
  slug: 'robots-sitemap-generator',
  name: 'robots.txt & sitemap.xml Generator',
  description: 'Build a robots.txt with user-agent groups, allow and disallow rules, crawl-delay and AI-crawler presets, or a sitemap.xml from a list of URLs.',
  category: 'web-tools',
  tag: 'web',
  icon: 'Globe',
  keywords: [
    'robots.txt generator',
    'sitemap.xml generator',
    'xml sitemap generator',
    'robots txt builder',
    'block ai crawlers',
    'gptbot robots.txt',
    'sitemap from url list',
    'crawl-delay',
  ],
  toolComponent: lazy(() => import('../../components/tools/web-tools/RobotsSitemapGenerator')),
  about: {
    summary: 'The robots.txt & sitemap.xml Generator writes the two plain-text files that tell search engines and other crawlers what they may fetch and which pages exist. The robots.txt builder takes user-agent groups with allow and disallow paths, an optional crawl-delay and sitemap lines, and includes presets for allowing everything, blocking everything or blocking common AI crawlers. The sitemap builder turns a list of URLs, one per line, into valid XML with optional lastmod, changefreq and priority values. Both outputs can be copied or downloaded, and warnings flag relative URLs, duplicates and invalid values. Everything runs in your browser.',
    useCases: [
      'Blocking GPTBot, ClaudeBot and other AI training crawlers from a site without changing its pages.',
      'Creating a sitemap.xml for a small site from a list of URLs exported from a CMS.',
      'Keeping an admin area or staging path out of crawler reach with a Disallow rule.',
      'Checking that every sitemap URL is absolute and not listed twice before uploading it.',
    ],
    features: [
      'robots.txt builder with multiple user-agent groups, Allow and Disallow rules, Crawl-delay and Sitemap lines.',
      'Presets for Allow all, Block all and Block AI crawlers (GPTBot, ClaudeBot, CCBot, Google-Extended and others).',
      'sitemap.xml builder that accepts a URL per line with optional lastmod, changefreq and priority.',
      'XML escaping of &, <, >, quotes and apostrophes in every sitemap URL.',
      'Warnings for relative URLs, duplicates, invalid dates, changefreq and priority values, and sitemaps over 50,000 URLs.',
      'Copy or download robots.txt and sitemap.xml.',
    ],
    tip: 'Put robots.txt at the root of the domain, for example https://example.com/robots.txt, since crawlers do not look for it anywhere else. Robots rules control crawling, not indexing, so use a noindex meta tag for pages that must stay out of search results.',
  },
  addedAt: '2026-11-17',
  complexity: 'moderate',
  isNew: true,
  status: 'stable',
  seo: {
    title: 'robots.txt & sitemap.xml Generator — Crawler rules and XML sitemaps',
    description: 'Generate robots.txt rules with AI-crawler presets and build sitemap.xml from a URL list, with XML escaping and validation warnings. Private, runs in your browser.',
    extraKeywords: [
      'robots.txt generator online',
      'block gptbot robots.txt',
      'sitemap xml generator from urls',
      'robots txt disallow generator',
      'free sitemap maker',
    ],
  },
  guide: {
    steps: [
      {
        name: 'Choose the generator',
        text: 'Switch between robots.txt and sitemap.xml with the tabs at the top. Each generator keeps its own input while you switch.',
      },
      {
        name: 'Start from a preset or build the groups',
        text: 'For robots.txt, pick Allow all, Block all or Block AI crawlers to fill the groups, then edit them. Each group has a user-agent name, one Allow or Disallow path per line, and an optional crawl-delay in seconds.',
      },
      {
        name: 'Add sitemap URLs',
        text: 'For robots.txt, list full sitemap URLs in the Sitemap field, one per line. For sitemap.xml, paste page URLs one per line, and optionally add a lastmod date, a changefreq and a priority after each URL, separated by spaces.',
      },
      {
        name: 'Read the warnings',
        text: 'Warnings appear under the input. Relative or non-http URLs and duplicate URLs are left out of sitemap.xml and reported with their line number. Invalid optional values are dropped and the URL is kept.',
      },
      {
        name: 'Copy or download the file',
        text: 'Use Copy to put the text on the clipboard, or Download to save robots.txt or sitemap.xml. Upload robots.txt to the root of your domain and sitemap.xml to the location you list in robots.txt.',
      },
    ],
    faqs: [
      {
        question: 'Does blocking AI crawlers in robots.txt stop them completely?',
        answer: 'It stops crawlers that follow robots.txt. Those that ignore the file are not affected. Google-Extended is a control token: disallowing it tells Google not to use your content for AI training, while Googlebot can still index the page.',
      },
      {
        question: 'Why is a URL left out of sitemap.xml?',
        answer: 'Sitemap URLs must be absolute http:// or https:// addresses, so a relative path such as /about is left out and reported. A URL that appears twice keeps its first line and the later one is reported.',
      },
      {
        question: 'Is Crawl-delay supported everywhere?',
        answer: 'No. Google ignores Crawl-delay. Some other crawlers honour it, so the generator writes the line only when you enter a value and notes that Google ignores it.',
      },
      {
        question: 'Is anything I type sent to a server?',
        answer: 'No. Both files are built in your browser and the download is created locally. Nothing is uploaded.',
      },
    ],
    example: {
      title: 'Build a sitemap.xml with an escaped query string and optional fields.',
      input: 'https://example.com/\nhttps://example.com/blog/analytical-engine 2026-11-01 weekly 0.8\nhttps://example.com/search?lang=en&page=2 monthly 0.3',
      output: '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>https://example.com/</loc>\n  </url>\n  <url>\n    <loc>https://example.com/blog/analytical-engine</loc>\n    <lastmod>2026-11-01</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n  <url>\n    <loc>https://example.com/search?lang=en&amp;page=2</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.3</priority>\n  </url>\n</urlset>\n',
      inputLabel: 'Page URLs (one per line)',
      outputLabel: 'sitemap.xml',
    },
  },
}
