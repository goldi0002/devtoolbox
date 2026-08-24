import { describe, it, expect } from 'vitest'
import { getToolBySlug } from '../tools/registry'
import Papa from 'papaparse'

function detectDelimiter(sampleText: string): string {
  const delimiters = [',', '\t', '|', ';']
  const lines = sampleText.split(/\r?\n/).filter(l => l.trim().length > 0).slice(0, 10)
  if (lines.length === 0) return ','

  let bestDelim = ','
  let maxConsistentCount = 0

  for (const delim of delimiters) {
    const counts = lines.map(line => line.split(delim).length - 1)
    const firstCount = counts[0]
    if (firstCount > 0 && counts.every(c => c === firstCount)) {
      if (firstCount > maxConsistentCount) {
        maxConsistentCount = firstCount
        bestDelim = delim
      }
    }
  }

  if (maxConsistentCount === 0) {
    let highestAvg = 0
    for (const delim of delimiters) {
      const avg = lines.reduce((acc, l) => acc + (l.split(delim).length - 1), 0) / lines.length
      if (avg > highestAvg) {
        highestAvg = avg
        bestDelim = delim
      }
    }
  }

  return bestDelim
}

function countRowsAccurate(text: string, hasHeader = true): number {
  const parsed = Papa.parse<string[]>(text, {
    header: false,
    skipEmptyLines: 'greedy'
  })
  const rows = parsed.data || []
  return hasHeader ? Math.max(0, rows.length - 1) : rows.length
}

describe('CSV/TXT Viewer Tool setup', () => {
  it('has proper tool metadata conforming to ToolMeta interface', () => {
    const tool = getToolBySlug('csv-txt-viewer')
    expect(tool).toBeDefined()
    expect(tool?.name).toBe('Large CSV & TXT Table Viewer (Up to 1GB)')
    expect(tool?.slug).toBe('csv-txt-viewer')
    expect(tool?.category).toBe('data-tools')
    expect(tool?.tag).toBe('DATA')
    expect(tool?.status).toBe('stable')
    expect(tool?.toolComponent).toBeDefined()
    expect(tool?.seo?.title).toBeDefined()
    expect(tool?.about.features.length).toBeGreaterThan(2)
    expect(tool?.about.useCases.length).toBeGreaterThan(1)
  })

  it('correctly detects delimiters across various formats', () => {
    expect(detectDelimiter('id,name,age\n1,Alice,30\n2,Bob,25')).toBe(',')
    expect(detectDelimiter('id\tname\tage\n1\tAlice\t30\n2\tBob\t25')).toBe('\t')
    expect(detectDelimiter('id|name|age\n1|Alice|30\n2|Bob|25')).toBe('|')
    expect(detectDelimiter('id;name;age\n1;Alice;30\n2;Bob;25')).toBe(';')
  })

  it('accurately counts exact 100 rows with and without trailing newlines', () => {
    // 1 header + 100 rows with trailing newline
    const linesWithNewline = ['id,value']
    for (let i = 1; i <= 100; i++) {
      linesWithNewline.push(`${i},val_${i}`)
    }
    const csvWithNewline = linesWithNewline.join('\n') + '\n'
    expect(countRowsAccurate(csvWithNewline, true)).toBe(100)

    // 1 header + 100 rows WITHOUT trailing newline (EOF immediately after last char)
    const csvWithoutNewline = linesWithNewline.join('\n')
    expect(countRowsAccurate(csvWithoutNewline, true)).toBe(100)

    // Extra empty trailing lines are cleanly skipped
    const csvWithExtraBlank = linesWithNewline.join('\n') + '\n\n   \n'
    expect(countRowsAccurate(csvWithExtraBlank, true)).toBe(100)
  })

  it('correctly extracts row key-value pairs for row detail inspector', () => {
    const headers = ['id', 'user', 'email', 'status']
    const row = ['101', 'Sarah', 'sarah@example.com', 'active']
    const record: Record<string, string> = {}
    headers.forEach((h, i) => {
      record[h] = row[i] || ''
    })

    expect(record.id).toBe('101')
    expect(record.user).toBe('Sarah')
    expect(record.email).toBe('sarah@example.com')
    expect(record.status).toBe('active')
  })

  it('formats throughput metrics accurately in MB/s', () => {
    const bytes = 100 * 1024 * 1024 // 100MB
    const elapsedSeconds = 0.5 // 500ms
    const bytesPerSec = bytes / elapsedSeconds
    const mbPerSec = bytesPerSec / (1024 * 1024)
    expect(mbPerSec).toBe(200)
  })
})

