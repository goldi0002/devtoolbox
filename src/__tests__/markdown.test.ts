import { describe, expect, it } from 'vitest'
import {
  buildHtmlDocument,
  escapeHtml,
  extractTitle,
  isSafeUrl,
  markdownToHtml,
  renderMarkdown,
} from '../utils/markdown'
import { MARKDOWN_TO_HTML_META } from '../tools/meta/markdown-to-html'

const FRAGMENT = { inlineStyles: false, fullDocument: false }

describe('markdownToHtml: headings and emphasis', () => {
  it('renders ATX headings at every level', () => {
    expect(markdownToHtml('# One\n## Two\n###### Six', FRAGMENT)).toBe('<h1>One</h1>\n<h2>Two</h2>\n<h6>Six</h6>')
  })
  it('does not treat a hash without a space as a heading', () => {
    expect(markdownToHtml('#NoSpace', FRAGMENT)).toBe('<p>#NoSpace</p>')
  })
  it('renders bold, italic and strikethrough', () => {
    expect(markdownToHtml('**b** __b2__ *i* _i2_ ~~s~~', FRAGMENT)).toBe(
      '<p><strong>b</strong> <strong>b2</strong> <em>i</em> <em>i2</em> <del>s</del></p>',
    )
  })
})

describe('markdownToHtml: links and images', () => {
  it('renders http, https and mailto links with safe attributes', () => {
    expect(markdownToHtml('[a](https://example.com) [b](http://x.test) [c](mailto:a@b.co)', FRAGMENT)).toBe(
      '<p><a href="https://example.com" target="_blank" rel="noopener noreferrer">a</a> '
      + '<a href="http://x.test" target="_blank" rel="noopener noreferrer">b</a> '
      + '<a href="mailto:a@b.co" target="_blank" rel="noopener noreferrer">c</a></p>',
    )
  })
  it('keeps underscores inside URLs intact', () => {
    expect(markdownToHtml('[x](https://e.com/a_b_c)', FRAGMENT)).toContain('href="https://e.com/a_b_c"')
  })
  it('renders images with alt text and no link wrapper', () => {
    expect(markdownToHtml('![Logo](https://img.example/logo.png)', FRAGMENT)).toBe(
      '<p><img src="https://img.example/logo.png" alt="Logo" /></p>',
    )
  })
  it('does not render a link label that contains code as emphasis', () => {
    expect(markdownToHtml('[`a_b_`](https://e.com)', FRAGMENT)).toContain('<code>a_b_</code>')
  })
})

describe('markdownToHtml: code, lists, quotes, rules', () => {
  it('renders fenced code with a language class and escapes its content', () => {
    expect(markdownToHtml('```js\nif (a < b) {}\n```', FRAGMENT)).toBe(
      '<pre><code class="language-js">if (a &lt; b) {}</code></pre>',
    )
  })
  it('renders inline code without emphasis inside it', () => {
    expect(markdownToHtml('Use `snake_case_name` here', FRAGMENT)).toBe('<p>Use <code>snake_case_name</code> here</p>')
  })
  it('renders unordered and ordered lists', () => {
    expect(markdownToHtml('- a\n- b\n\n1. one\n2. two', FRAGMENT)).toBe(
      '<ul><li>a</li><li>b</li></ul>\n<ol><li>one</li><li>two</li></ol>',
    )
  })
  it('renders blockquotes and horizontal rules', () => {
    expect(markdownToHtml('> quoted *text*\n\n---', FRAGMENT)).toBe(
      '<blockquote><p>quoted <em>text</em></p></blockquote>\n<hr />',
    )
  })
})

describe('markdownToHtml: tables', () => {
  it('renders a pipe table with a header and body rows', () => {
    expect(markdownToHtml('| Name | Qty |\n| --- | --- |\n| Apple | **3** |', FRAGMENT)).toBe(
      '<table><thead><tr><th>Name</th><th>Qty</th></tr></thead>'
      + '<tbody><tr><td>Apple</td><td><strong>3</strong></td></tr></tbody></table>',
    )
  })
})

describe('markdownToHtml: escaping and URL safety', () => {
  it('escapes raw HTML so it is shown as text', () => {
    const html = markdownToHtml('<script>alert(1)</script> and <img src=x onerror=alert(1)>', FRAGMENT)
    expect(html).not.toMatch(/<(script|img)/i)
    expect(html).toBe('<p>&lt;script&gt;alert(1)&lt;/script&gt; and &lt;img src=x onerror=alert(1)&gt;</p>')
  })
  it('escapes raw HTML inside code, headings and table cells', () => {
    expect(markdownToHtml('# <b>x</b>', FRAGMENT)).toBe('<h1>&lt;b&gt;x&lt;/b&gt;</h1>')
    expect(markdownToHtml('`<i>`', FRAGMENT)).toBe('<p><code>&lt;i&gt;</code></p>')
    expect(markdownToHtml('| a | b |\n| - | - |\n| <u>c</u> | d |', FRAGMENT)).toContain('<td>&lt;u&gt;c&lt;/u&gt;</td>')
  })
  it('escapes quotes in attribute values so links cannot break out', () => {
    const html = markdownToHtml('[x](https://e.com/?q="onmouseover="alert(1))', FRAGMENT)
    expect(html).toContain('href="https://e.com/?q=&quot;onmouseover=&quot;alert(1)"')
    expect(html).not.toMatch(/" onmouseover/)
  })
  it.each([
    ['javascript:alert(1)'],
    ['JavaScript:alert(1)'],
    ['  javascript:alert(1)'],
    ['java\tscript:alert(1)'],
    ['data:text/html,<script>alert(1)</script>'],
    ['vbscript:msgbox(1)'],
    ['VBScript:msgbox(1)'],
  ])('neutralizes the link URL %j', url => {
    const html = markdownToHtml(`[click me](${url})`, FRAGMENT)
    expect(html).not.toMatch(/href/i)
    expect(html).toContain('click me')
    expect(html).not.toMatch(/<script/i)
  })
  it('neutralizes unsafe image sources and keeps the alt text', () => {
    const html = markdownToHtml('![logo](javascript:alert(1))', FRAGMENT)
    expect(html).toBe('<p>logo</p>')
    expect(markdownToHtml('![x](data:image/svg+xml,<svg onload=alert(1)>)', FRAGMENT)).not.toMatch(/<svg|<img/)
  })
  it('keeps relative links', () => {
    expect(markdownToHtml('[home](/docs/intro)', FRAGMENT)).toContain('href="/docs/intro"')
  })
  it('classifies URLs by scheme', () => {
    expect(isSafeUrl('https://a.b')).toBe(true)
    expect(isSafeUrl('mailto:a@b.c')).toBe(true)
    expect(isSafeUrl('/relative/path')).toBe(true)
    expect(isSafeUrl('#anchor')).toBe(true)
    expect(isSafeUrl('javascript:x')).toBe(false)
    expect(isSafeUrl('data:text/plain,x')).toBe(false)
    expect(isSafeUrl('vbscript:x')).toBe(false)
    expect(isSafeUrl('ftp://x')).toBe(false)
  })
  it('escapeHtml escapes all five special characters', () => {
    expect(escapeHtml(`&<>"'`)).toBe('&amp;&lt;&gt;&quot;&#39;')
  })
  it('replaces the placeholder character so user text cannot collide with internal placeholders', () => {
    expect(markdownToHtml('a0b', FRAGMENT)).toBe('<p>a�0�b</p>')
  })
})

describe('markdownToHtml: inline styles option', () => {
  it('adds no style attributes by default', () => {
    const html = markdownToHtml('| a | b |\n| - | - |\n| c | d |\n\n`e`', FRAGMENT)
    expect(html).not.toContain('style=')
  })
  it('adds minimal inline styles to tables, cells, code, quotes and rules', () => {
    const html = markdownToHtml('| a | b |\n| - | - |\n| c | d |\n\n`e`\n\n> q\n\n```\nx\n```\n\n---', {
      inlineStyles: true,
      fullDocument: false,
    })
    expect(html).toContain('<table style="border-collapse:collapse;width:100%">')
    expect(html).toContain('<th style="border:1px solid #d0d7de;')
    expect(html).toContain('<td style="border:1px solid #d0d7de;')
    expect(html).toContain('<code style="background:#f6f8fa;')
    expect(html).toContain('<blockquote style="border-left:4px solid #d0d7de;')
    expect(html).toContain('<pre style="background:#f6f8fa;')
    expect(html).toContain('<hr style="border:0;border-top:1px solid #d0d7de" />')
  })
})

describe('markdownToHtml: full document option', () => {
  it('wraps the fragment in a document with doctype, charset, title and body', () => {
    const html = markdownToHtml('# Hello & welcome\n\nBody', { inlineStyles: false, fullDocument: true })
    expect(html.startsWith('<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">')).toBe(true)
    expect(html).toContain('<title>Hello &amp; welcome</title>')
    expect(html).toContain('<body>\n<h1>Hello &amp; welcome</h1>\n<p>Body</p>\n</body>')
    expect(html.endsWith('</body>\n</html>')).toBe(true)
  })
  it('outputs nothing for blank input, even with the document option on', () => {
    expect(markdownToHtml('  \n', { inlineStyles: false, fullDocument: true })).toBe('')
  })
  it('falls back to a Document title when there is no heading', () => {
    expect(extractTitle('just text')).toBe('Document')
    expect(extractTitle('## Some *styled* [title](https://x.y)')).toBe('Some styled title')
    expect(buildHtmlDocument('', '<x>')).toContain('<title>&lt;x&gt;</title>')
  })
})

describe('renderMarkdown default mode (Markdown Preview)', () => {
  it('keeps unsafe and image syntax as plain text, as before', () => {
    expect(renderMarkdown('[bad](javascript:alert(1))')).toBe('<p>[bad](javascript:alert(1))</p>')
    expect(renderMarkdown('![alt](https://x.y/i.png)')).toBe(
      '<p>!<a href="https://x.y/i.png" target="_blank" rel="noopener noreferrer">alt</a></p>',
    )
  })
  it('adds no style attributes unless asked', () => {
    expect(renderMarkdown('> q\n\n---')).toBe('<blockquote><p>q</p></blockquote>\n<hr />')
  })
})

describe('Markdown to HTML guide', () => {
  it('its worked example matches what the converter really outputs', () => {
    const example = MARKDOWN_TO_HTML_META.guide?.example
    expect(example).toBeDefined()
    expect(markdownToHtml(example!.input, FRAGMENT)).toBe(example!.output)
  })
})
