export function stripDiacritics(value: string): string {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
}

export function toWords(input: string): string[] {
  return input
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
}

export function capitalize(word: string): string {
  if (!word) return ''
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
}

export function countWords(input: string): number {
  const trimmed = input.trim()
  return trimmed ? trimmed.split(/\s+/).length : 0
}

export function matchesQuery(query: string, fields: Array<string | number>): boolean {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return true
  return fields.some(field => String(field).toLowerCase().includes(normalized))
}
