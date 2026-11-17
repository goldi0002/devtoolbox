import { lazy } from 'react'
import type { ToolMeta } from '../tool-meta'

export const MARKDOWN_TO_HTML_META: ToolMeta = {
  slug: 'markdown-to-html',
  name: 'Markdown to HTML',
  description: 'Convert Markdown into clean, copy-ready HTML source, with optional inline styles or a full HTML document. Runs entirely in your browser.',
  category: 'web-tools',
  tag: 'web',
  icon: 'FileCode',
  keywords: [
    'markdown to html',
    'md to html',
    'markdown html converter',
    'convert markdown',
    'markdown renderer',
    'html from markdown',
  ],
  toolComponent: lazy(() => import('../../components/tools/web-tools/MarkdownToHtml')),
  about: {
    summary: 'Markdown to HTML converts Markdown text into HTML source you can paste into a page, CMS or email template. It produces plain semantic markup (headings, paragraphs, lists, tables, code blocks) and escapes any raw HTML you type, so the output never contains live scripts from the input. Conversion runs in your browser and nothing is uploaded.',
    useCases: [
      'Turning README or documentation drafts into HTML for a static page.',
      'Preparing a changelog or newsletter block for a CMS that accepts raw HTML.',
      'Checking how Markdown maps to HTML before publishing.',
      'Getting a self-contained HTML file with a title and charset for quick sharing.',
    ],
    features: [
      'Headings, bold, italic, strikethrough, links, images, inline code, blockquotes and horizontal rules.',
      'Fenced code blocks with a language class, and ordered or unordered lists.',
      'Pipe tables with a header row.',
      'Raw HTML in the input is escaped, so it appears as text.',
      'Links and images with javascript:, data: or vbscript: URLs are neutralized.',
      'Optional inline styles on tables, code and quotes, or a full document with doctype, title and charset.',
    ],
    tip: 'Leave "Include inline styles" off when the HTML will be styled by your own CSS; turn it on for emails or snippets that need borders and spacing without a stylesheet.',
  },
  addedAt: '2026-11-17',
  complexity: 'simple',
  isNew: true,
  status: 'stable',
  seo: {
    title: 'Markdown to HTML — Convert Markdown to clean HTML online',
    description: 'Convert Markdown to clean HTML source with tables, code blocks and images. Optional inline styles and full document output. 100% client-side and private.',
    extraKeywords: [
      'markdown to html online',
      'md to html converter',
      'convert markdown to html',
      'markdown html generator',
      'markdown to html full document',
    ],
  },
  guide: {
    steps: [
      {
        name: 'Paste your Markdown',
        text: 'Type or paste Markdown into Markdown input. The HTML output updates as you edit.',
      },
      {
        name: 'Pick the output shape',
        text: 'Leave Full HTML document off to get a fragment you can paste into an existing page. Turn it on to wrap the fragment in a document with a doctype, a head holding the title and charset, and a body.',
      },
      {
        name: 'Choose styling',
        text: 'Include inline styles adds minimal style attributes to tables, table cells, code, blockquotes and horizontal rules. Leave it off for plain semantic HTML.',
      },
      {
        name: 'Copy or download',
        text: 'Use Copy in the HTML output header to put the source on your clipboard, or the download button to save it as an .html file.',
      },
    ],
    faqs: [
      {
        question: 'What happens to HTML tags typed inside the Markdown?',
        answer: 'They are escaped and shown as text, for example <script> becomes &lt;script&gt;. The converter never passes raw HTML through, so the output cannot run scripts.',
      },
      {
        question: 'Which link and image addresses are kept?',
        answer: 'http, https, mailto and relative addresses are kept. A javascript:, data: or vbscript: address is removed: a link keeps its text and an image keeps its alt text.',
      },
      {
        question: 'Which Markdown syntax is supported?',
        answer: 'Headings, bold, italic, strikethrough, links, images, inline code, fenced code blocks, ordered and unordered lists, blockquotes, horizontal rules and pipe tables. Nested lists are flattened into one list, and features outside this list are not converted.',
      },
      {
        question: 'Is my Markdown uploaded anywhere?',
        answer: 'No. Conversion runs in your browser and nothing is sent to a server.',
      },
    ],
    example: {
      title: 'Convert a short section with a heading, a link and a list.',
      input: '## Tips\n\nUse **bold** and [docs](https://example.com).\n\n- one\n- two',
      output: '<h2>Tips</h2>\n<p>Use <strong>bold</strong> and <a href="https://example.com" target="_blank" rel="noopener noreferrer">docs</a>.</p>\n<ul><li>one</li><li>two</li></ul>',
      inputLabel: 'Markdown',
      outputLabel: 'HTML',
    },
  },
}
