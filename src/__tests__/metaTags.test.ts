import { describe, expect, it } from 'vitest'
import {
  DESCRIPTION_RECOMMENDED,
  EMPTY_META_INPUT,
  TITLE_RECOMMENDED,
  buildMetaTags,
  charLength,
  displayHost,
  escapeHtml,
  isValidThemeColor,
  lengthWarning,
  urlWarning,
  type MetaTagInput,
} from '../utils/metaTags'
import { META_TAG_GENERATOR_META } from '../tools/meta/meta-tag-generator'

const base: MetaTagInput = {
  ...EMPTY_META_INPUT,
  title: 'Ada Lovelace',
  description: 'Notes on the engine.',
  url: 'https://example.com/a',
  imageUrl: 'https://example.com/a.png',
  siteName: 'Example',
  canonical: 'https://example.com/a',
  themeColor: '#fff',
}

describe('escapeHtml', () => {
  it('escapes ampersand, angle brackets, double and single quotes', () => {
    expect(escapeHtml(`& < > " '`)).toBe('&amp; &lt; &gt; &quot; &#39;')
  })
  it('escapes an ampersand only once', () => {
    expect(escapeHtml('&amp;')).toBe('&amp;amp;')
  })
  it('leaves plain text unchanged', () => {
    expect(escapeHtml('Plain text 123')).toBe('Plain text 123')
  })
})

describe('length limits', () => {
  it('uses the recommended title and description ranges', () => {
    expect(TITLE_RECOMMENDED).toEqual({ min: 30, max: 60 })
    expect(DESCRIPTION_RECOMMENDED).toEqual({ min: 70, max: 160 })
  })

  it('warns for a title one character over 60 and not at 60', () => {
    expect(lengthWarning('a'.repeat(60), TITLE_RECOMMENDED, 'Title')).toBeNull()
    expect(lengthWarning('a'.repeat(61), TITLE_RECOMMENDED, 'Title')).toContain('Title is 61 characters')
  })

  it('warns for a description one character over 160 and not at 160', () => {
    expect(lengthWarning('a'.repeat(160), DESCRIPTION_RECOMMENDED, 'Description')).toBeNull()
    expect(lengthWarning('a'.repeat(161), DESCRIPTION_RECOMMENDED, 'Description')).toContain('Description is 161 characters')
  })

  it('warns when a non-empty value is shorter than the minimum', () => {
    expect(lengthWarning('a'.repeat(29), TITLE_RECOMMENDED, 'Title')).toContain('Aim for at least 30')
    expect(lengthWarning('a'.repeat(30), TITLE_RECOMMENDED, 'Title')).toBeNull()
  })

  it('does not warn for an empty value and ignores surrounding spaces', () => {
    expect(lengthWarning('', TITLE_RECOMMENDED, 'Title')).toBeNull()
    expect(lengthWarning('   ', TITLE_RECOMMENDED, 'Title')).toBeNull()
    expect(lengthWarning(`  ${'a'.repeat(60)}  `, TITLE_RECOMMENDED, 'Title')).toBeNull()
  })

  it('counts code points, so an emoji is one character', () => {
    expect(charLength('😀'.repeat(60))).toBe(60)
    expect(lengthWarning('😀'.repeat(60), TITLE_RECOMMENDED, 'Title')).toBeNull()
  })
})

describe('urlWarning and theme color', () => {
  it('accepts absolute http and https URLs and empty values', () => {
    expect(urlWarning('https://example.com/x', 'Page URL')).toBeNull()
    expect(urlWarning('http://example.com/x', 'Page URL')).toBeNull()
    expect(urlWarning('', 'Page URL')).toBeNull()
  })
  it('warns about relative and non-http URLs', () => {
    expect(urlWarning('/images/a.png', 'Image URL')).toContain('must be an absolute URL')
    expect(urlWarning('ftp://example.com/a', 'Image URL')).toContain('http:// or https://')
  })
  it('accepts 3- and 6-digit hex colors only', () => {
    expect(isValidThemeColor('#1e3a8a')).toBe(true)
    expect(isValidThemeColor('#FFF')).toBe(true)
    expect(isValidThemeColor('blue')).toBe(false)
    expect(isValidThemeColor('#12345')).toBe(false)
  })
})

describe('displayHost', () => {
  it('returns the hostname without www', () => {
    expect(displayHost('https://www.example.com/a/b')).toBe('example.com')
  })
  it('returns the raw text when it is not a URL', () => {
    expect(displayHost('not a url')).toBe('not a url')
    expect(displayHost('  ')).toBe('')
  })
})

describe('buildMetaTags', () => {
  it('emits the core title, description, canonical and theme tags', () => {
    const tags = buildMetaTags(base)
    expect(tags).toContain('<title>Ada Lovelace</title>')
    expect(tags).toContain('<meta name="description" content="Notes on the engine.">')
    expect(tags).toContain('<link rel="canonical" href="https://example.com/a">')
    expect(tags).toContain('<meta name="theme-color" content="#fff">')
  })

  it('emits Open Graph and Twitter Card tags with the same values', () => {
    const tags = buildMetaTags(base)
    expect(tags).toContain('<meta property="og:title" content="Ada Lovelace">')
    expect(tags).toContain('<meta property="og:description" content="Notes on the engine.">')
    expect(tags).toContain('<meta property="og:type" content="website">')
    expect(tags).toContain('<meta property="og:url" content="https://example.com/a">')
    expect(tags).toContain('<meta property="og:image" content="https://example.com/a.png">')
    expect(tags).toContain('<meta property="og:site_name" content="Example">')
    expect(tags).toContain('<meta name="twitter:card" content="summary_large_image">')
    expect(tags).toContain('<meta name="twitter:title" content="Ada Lovelace">')
    expect(tags).toContain('<meta name="twitter:description" content="Notes on the engine.">')
    expect(tags).toContain('<meta name="twitter:image" content="https://example.com/a.png">')
  })

  it('uses the chosen Twitter Card type', () => {
    expect(buildMetaTags({ ...base, twitterCard: 'summary' })).toContain('<meta name="twitter:card" content="summary">')
  })

  it('omits tags for empty fields, and keeps twitter:card and og:type', () => {
    const tags = buildMetaTags(EMPTY_META_INPUT)
    expect(tags).toBe(
      '<meta property="og:type" content="website">\n<meta name="twitter:card" content="summary_large_image">',
    )
  })

  it('leaves out a theme color that is not valid hex', () => {
    expect(buildMetaTags({ ...base, themeColor: 'red' })).not.toContain('theme-color')
  })

  it('escapes quotes, ampersands and angle brackets in attributes and text', () => {
    const tags = buildMetaTags({ ...base, title: 'Tom "Ada" & Co <beta>', siteName: "O'Brien" })
    expect(tags).toContain('<title>Tom &quot;Ada&quot; &amp; Co &lt;beta&gt;</title>')
    expect(tags).toContain('<meta property="og:title" content="Tom &quot;Ada&quot; &amp; Co &lt;beta&gt;">')
    expect(tags).toContain('<meta property="og:site_name" content="O&#39;Brien">')
  })

  it('cannot be broken out of an attribute by a crafted description', () => {
    const tags = buildMetaTags({ ...base, description: '"><script>alert(1)</script>' })
    expect(tags).not.toContain('<script')
    expect(tags).toContain('content="&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;"')
  })

  it('trims surrounding whitespace before output', () => {
    expect(buildMetaTags({ ...base, title: '  Hi  ' })).toContain('<title>Hi</title>')
  })
})

describe('Meta Tag Generator guide example', () => {
  it('matches what the tool produces', () => {
    const example = META_TAG_GENERATOR_META.guide?.example
    expect(example).toBeDefined()
    const input = JSON.parse(example?.input ?? '{}') as MetaTagInput
    expect(buildMetaTags(input)).toBe(example?.output)
  })
})
