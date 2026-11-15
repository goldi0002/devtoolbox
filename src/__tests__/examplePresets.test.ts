import { describe, it, expect } from 'vitest'
import { formatSql, minifySql, SAMPLE_SQLS } from '../utils/sqlFormatter'
import { REGEX_EXAMPLES } from '../utils/regexExamples'

const matchesOf = (label: string, text?: string) => {
  const ex = REGEX_EXAMPLES.find((e) => e.label === label)!
  return [...(text ?? ex.test).matchAll(new RegExp(ex.pattern, ex.flags))].map((m) => m[0])
}

describe('Regex Tester example presets', () => {
  it('offers the email, URL, IPv4 and ISO 8601 date presets', () => {
    const labels = REGEX_EXAMPLES.map((e) => e.label)
    expect(labels).toEqual(expect.arrayContaining(['Email', 'URL', 'IPv4', 'ISO 8601 Date']))
    expect(new Set(labels).size).toBe(labels.length)
  })

  it.each(REGEX_EXAMPLES)('$label compiles and matches its own sample text', (ex) => {
    expect(matchesOf(ex.label).length).toBeGreaterThan(0)
  })

  it('IPv4 only matches addresses with octets in range', () => {
    expect(matchesOf('IPv4')).toEqual(['192.168.1.1', '10.0.0.255'])
  })

  it('ISO 8601 Date matches dates and date-times with zone', () => {
    expect(matchesOf('ISO 8601 Date')).toEqual([
      '2024-01-15',
      '2024-03-22T09:30:00Z',
      '2025-01-01T00:00:00+05:30',
    ])
  })
})

describe('formatSql', () => {
  it('keeps qualified joins on one line', () => {
    const out = formatSql(
      'select a.id from a left join b on b.a_id = a.id inner join c on c.b_id = b.id join d on d.id = c.d_id full outer join e on e.id = d.e_id',
      true,
      2,
    )
    expect(out.split('\n')).toEqual([
      'SELECT a.id',
      'FROM a',
      'LEFT JOIN b ON b.a_id = a.id',
      'INNER JOIN c ON c.b_id = b.id',
      'JOIN d ON d.id = c.d_id',
      'FULL OUTER JOIN e ON e.id = d.e_id',
    ])
  })

  it('still breaks clauses when keyword uppercasing is off', () => {
    const out = formatSql('select a, b from t left join u on u.id = t.id where a > 1', false, 4)
    expect(out.split('\n')).toEqual([
      'select',
      '    a,',
      '    b',
      'from t',
      'left join u on u.id = t.id',
      'where a > 1',
    ])
  })

  it('does not break column types containing WITH', () => {
    const out = formatSql('create table t (created_at timestamp with time zone default now());', true, 2)
    expect(out).toBe('CREATE TABLE t (created_at timestamp WITH time zone default now());')
  })

  it('returns an empty string for blank input', () => {
    expect(formatSql('   ', true, 2)).toBe('')
  })
})

describe('SQL Formatter samples', () => {
  it('includes a multi-join sample whose joins each get their own line', () => {
    const sample = SAMPLE_SQLS.find((s) => s.name === 'Multi-Join Report')!
    const joinLines = formatSql(sample.sql, true, 2)
      .split('\n')
      .filter((l) => /\bJOIN\b/.test(l))
    expect(joinLines).toHaveLength(4)
    joinLines.forEach((l) => expect(l).toMatch(/^(INNER|LEFT) JOIN \w+ \w+ ON /))
  })

  it.each(SAMPLE_SQLS)('$name formats and minifies to non-empty output', ({ sql }) => {
    expect(formatSql(sql, true, 2)).not.toBe('')
    expect(minifySql(sql)).toBe(sql)
  })
})

describe('minifySql', () => {
  it('strips comments and collapses whitespace', () => {
    expect(minifySql('select 1 -- one\n  /* two */ from\n dual')).toBe('select 1 from dual')
  })
})
