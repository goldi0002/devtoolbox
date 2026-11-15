export interface RegexExample {
  label: string
  pattern: string
  flags: string
  test: string
}

const OCTET = '(?:25[0-5]|2[0-4]\\d|1?\\d?\\d)'

export const REGEX_EXAMPLES: RegexExample[] = [
  { label: 'Email',         pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', flags: 'g', test: 'Contact us at hello@example.com or support@dev.io for help.' },
  { label: 'URL',           pattern: 'https?:\\/\\/[\\w\\-._~:/?#[\\]@!$&\'()*+,;=%]+', flags: 'g', test: 'Visit https://example.com or http://dev.io/docs for more info.' },
  { label: 'IPv4',          pattern: `\\b(?:${OCTET}\\.){3}${OCTET}\\b`,                 flags: 'g', test: 'Server IPs: 192.168.1.1 and 10.0.0.255 are valid, 256.1.1.1 is not.' },
  { label: 'ISO 8601 Date', pattern: '\\d{4}-\\d{2}-\\d{2}(?:T\\d{2}:\\d{2}(?::\\d{2}(?:\\.\\d+)?)?(?:Z|[+-]\\d{2}:\\d{2})?)?', flags: 'g', test: 'Created on 2024-01-15, updated 2024-03-22T09:30:00Z, expires 2025-01-01T00:00:00+05:30.' },
  { label: 'Hex Color',     pattern: '#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\\b',             flags: 'g', test: 'Colors used: #fff, #1a2b3c, #FF5733 and #abc.' },
]
