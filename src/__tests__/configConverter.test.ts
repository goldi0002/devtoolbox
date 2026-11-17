import { describe, expect, it } from 'vitest'
import { parse as parseToml } from 'smol-toml'
import YAML from 'yaml'
import {
  CONFIG_FORMAT_EXTENSION,
  CONFIG_SAMPLES,
  convertConfig,
  describeConversionError,
  jsonErrorPosition,
  offsetToLineColumn,
  type ConversionOutcome,
} from '../utils/configConverter'
import { TOML_JSON_YAML_CONVERTER_META } from '../tools/meta/toml-json-yaml-converter'

function expectOk(outcome: ConversionOutcome): string {
  if (!outcome.ok) throw new Error(`expected success, got: ${outcome.error.message}`)
  return outcome.text
}

function expectError(outcome: ConversionOutcome) {
  if (outcome.ok) throw new Error(`expected an error, got: ${outcome.text}`)
  return outcome.error
}

const SERVICE_TOML = `name = "api"
enabled = true
ratio = 0.75

[server]
host = "localhost"
port = 8080

[server.tls]
enabled = false
cert = "/etc/ssl/cert.pem"

[[routes]]
path = "/a"
weight = 1

[[routes]]
path = "/b"
weight = 2
`

describe('TOML to JSON', () => {
  it('converts scalars, nested tables and arrays of tables', async () => {
    const json = JSON.parse(expectOk(await convertConfig(SERVICE_TOML, 'toml', 'json')))
    expect(json).toEqual({
      name: 'api',
      enabled: true,
      ratio: 0.75,
      server: { host: 'localhost', port: 8080, tls: { enabled: false, cert: '/etc/ssl/cert.pem' } },
      routes: [
        { path: '/a', weight: 1 },
        { path: '/b', weight: 2 },
      ],
    })
  })

  it('writes dates as ISO 8601 strings because JSON has no date type', async () => {
    const json = JSON.parse(
      expectOk(await convertConfig('issued = 2026-03-14T09:30:00Z\nday = 1979-05-27\nclock = 07:32:00\n', 'toml', 'json')),
    )
    expect(json.issued).toBe('2026-03-14T09:30:00.000Z')
    expect(json.day).toBe('1979-05-27')
    expect(json.clock).toBe('07:32:00.000')
  })

  it('indents with the requested number of spaces', async () => {
    const text = expectOk(await convertConfig('a = 1', 'toml', 'json', { indent: 4 }))
    expect(text).toBe('{\n    "a": 1\n}')
  })
})

describe('JSON to TOML', () => {
  it('writes nested objects as tables and arrays of objects as [[array of tables]]', async () => {
    const source = JSON.stringify({
      server: { host: 'localhost', port: 8080 },
      items: [{ id: 1 }, { id: 2 }],
    })
    const toml = expectOk(await convertConfig(source, 'json', 'toml'))
    expect(toml).toContain('[server]')
    expect(toml).toContain('[[items]]')
    expect(parseToml(toml)).toEqual({ server: { host: 'localhost', port: 8080 }, items: [{ id: 1 }, { id: 2 }] })
  })

  it('writes deeply nested tables with dotted headers', async () => {
    const toml = expectOk(await convertConfig('{"a":{"b":{"c":{"d":"deep"}}}}', 'json', 'toml'))
    expect(toml).toContain('[a.b.c]')
    expect(parseToml(toml)).toEqual({ a: { b: { c: { d: 'deep' } } } })
  })

  it('keeps date-like strings as quoted strings, not TOML dates', async () => {
    const toml = expectOk(await convertConfig('{"when":"2026-03-14T09:30:00.000Z"}', 'json', 'toml'))
    expect(parseToml(toml)).toEqual({ when: '2026-03-14T09:30:00.000Z' })
  })

  it('writes mixed-type arrays inside a table, which TOML 1.0 allows', async () => {
    const toml = expectOk(await convertConfig('{"mixed":[1,"two",true]}', 'json', 'toml'))
    expect(parseToml(toml)).toEqual({ mixed: [1, 'two', true] })
  })
})

describe('YAML to TOML', () => {
  it('converts a YAML mapping with nested maps and a list of maps', async () => {
    const yaml = 'service:\n  name: api\n  ports:\n    - 80\n    - 443\nsteps:\n  - name: build\n  - name: test\n'
    const toml = expectOk(await convertConfig(yaml, 'yaml', 'toml'))
    expect(parseToml(toml)).toEqual({
      service: { name: 'api', ports: [80, 443] },
      steps: [{ name: 'build' }, { name: 'test' }],
    })
  })

  it('converts YAML infinity and NaN to TOML inf and nan', async () => {
    const toml = expectOk(await convertConfig('a: .inf\nb: .nan\n', 'yaml', 'toml'))
    expect(toml).toContain('a = inf')
    expect(toml).toContain('b = nan')
  })
})

describe('round trips', () => {
  it('TOML to JSON to TOML keeps the data', async () => {
    const json = expectOk(await convertConfig(SERVICE_TOML, 'toml', 'json'))
    const back = expectOk(await convertConfig(json, 'json', 'toml'))
    expect(parseToml(back)).toEqual(parseToml(SERVICE_TOML))
  })

  it('TOML to YAML to TOML keeps the data', async () => {
    const yaml = expectOk(await convertConfig(SERVICE_TOML, 'toml', 'yaml'))
    const back = expectOk(await convertConfig(yaml, 'yaml', 'toml'))
    expect(parseToml(back)).toEqual(parseToml(SERVICE_TOML))
  })

  it('JSON to YAML to JSON keeps the data', async () => {
    const source = '{"a":{"b":[1,2,{"c":"d"}]},"e":null,"f":false}'
    const yaml = expectOk(await convertConfig(source, 'json', 'yaml'))
    const back = expectOk(await convertConfig(yaml, 'yaml', 'json'))
    expect(JSON.parse(back)).toEqual(JSON.parse(source))
  })

  it('TOML to TOML keeps local and offset dates', async () => {
    const source = 'when = 2026-03-14T09:30:00Z\nday = 1979-05-27\nclock = 07:32:00\n'
    const once = expectOk(await convertConfig(source, 'toml', 'toml'))
    expect(parseToml(once)).toEqual(parseToml(source))
  })
})

describe('values TOML cannot represent', () => {
  it('reports a null value with its path instead of writing a broken file', async () => {
    const error = expectError(await convertConfig('{"db":{"password":null}}', 'json', 'toml'))
    expect(error.message).toBe('TOML has no null value at "db.password". Replace it with a value or remove the key.')
    expect(error.line).toBeUndefined()
  })

  it('reports a null inside an array with its index', async () => {
    const error = expectError(await convertConfig('{"tags":["a",null]}', 'json', 'toml'))
    expect(error.message).toContain('at "tags[1]"')
  })

  it('rejects a top-level array because a TOML document must be a table', async () => {
    const error = expectError(await convertConfig('[1, 2, 3]', 'json', 'toml'))
    expect(error.message).toContain('this document is an array')
  })

  it('rejects a YAML list at the top level for the same reason', async () => {
    const error = expectError(await convertConfig('- a\n- b\n', 'yaml', 'toml'))
    expect(error.message).toContain('this document is an array')
  })

  it('rejects a bare scalar as a TOML document', async () => {
    const error = expectError(await convertConfig('"just text"', 'json', 'toml'))
    expect(error.message).toContain('a single string value')
  })

  it('writes a top-level null for JSON and YAML targets', async () => {
    expect(expectOk(await convertConfig('null', 'json', 'yaml'))).toBe('null\n')
  })

  it('reports NaN and Infinity for JSON, which cannot hold them', async () => {
    const error = expectError(await convertConfig('limits:\n  max: .inf\n', 'yaml', 'json'))
    expect(error.message).toBe('JSON has no Infinity value at "limits.max".')
  })
})

describe('syntax errors', () => {
  it('reports the line and column of a TOML error', async () => {
    const error = expectError(await convertConfig('a = 1\nb = "unclosed\n', 'toml', 'json'))
    expect(error.line).toBe(2)
    expect(error.column).toBeGreaterThan(0)
    expect(error.message).not.toContain('Invalid TOML document')
    expect(error.message).not.toContain('\n')
  })

  it('reports the line of a JSON error', async () => {
    const error = expectError(await convertConfig('{\n  "a": 1,\n}', 'json', 'yaml'))
    expect(error.line).toBe(3)
    expect(error.column).toBe(1)
    expect(error.message).not.toContain('position')
  })

  it('reports the end of the document for truncated JSON', async () => {
    const error = expectError(await convertConfig('{\n  "a": [1, 2', 'json', 'toml'))
    expect(error.line).toBe(2)
    expect(error.message).toBeTruthy()
  })

  it('reports the line and column of a YAML error without repeating the position in the message', async () => {
    const error = expectError(await convertConfig('a: 1\nb: c: d\n', 'yaml', 'json'))
    expect(error.line).toBe(2)
    expect(error.column).toBe(4)
    expect(error.message).not.toMatch(/at line/)
  })

  it('formats a located error for display', () => {
    expect(describeConversionError({ message: 'Expected a value', line: 4, column: 2 })).toBe(
      'Syntax error at line 4, column 2: Expected a value',
    )
    expect(describeConversionError({ message: 'TOML has no null value' })).toBe('TOML has no null value')
  })
})

describe('offsetToLineColumn', () => {
  it('maps offsets to 1-based lines and columns', () => {
    expect(offsetToLineColumn('ab\ncd', 0)).toEqual({ line: 1, column: 1 })
    expect(offsetToLineColumn('ab\ncd', 1)).toEqual({ line: 1, column: 2 })
    expect(offsetToLineColumn('ab\ncd', 3)).toEqual({ line: 2, column: 1 })
    expect(offsetToLineColumn('ab\ncd', 4)).toEqual({ line: 2, column: 2 })
  })

  it('handles a newline at the very start', () => {
    expect(offsetToLineColumn('\nx', 1)).toEqual({ line: 2, column: 1 })
  })
})

describe('jsonErrorPosition', () => {
  it('reads the line and column that V8 includes in the message', () => {
    expect(jsonErrorPosition('Expected ":" in JSON at position 5 (line 1 column 6)', '{"a" 1}')).toEqual({
      line: 1,
      column: 6,
    })
  })

  it('reads the line and column that Firefox puts in the message', () => {
    expect(jsonErrorPosition('JSON.parse: unexpected character at line 2 column 4 of the JSON data', 'x')).toEqual({
      line: 2,
      column: 4,
    })
  })

  it('computes the line from an offset when only a position is given', () => {
    expect(jsonErrorPosition('Unexpected token } in JSON at position 3', 'ab\n}')).toEqual({ line: 2, column: 1 })
  })

  it('returns nothing when the engine gives no position', () => {
    expect(jsonErrorPosition('JSON Parse error: Unexpected identifier', 'abc')).toBeUndefined()
  })
})

describe('dates through YAML', () => {
  it('keeps a TOML datetime as a quoted string in YAML', async () => {
    const yaml = expectOk(await convertConfig('when = 2026-03-14T09:30:00Z\n', 'toml', 'yaml'))
    expect(YAML.parse(yaml)).toEqual({ when: '2026-03-14T09:30:00.000Z' })
  })
})

describe('file extensions', () => {
  it('uses the conventional extension for each format', () => {
    expect(CONFIG_FORMAT_EXTENSION).toEqual({ toml: 'toml', json: 'json', yaml: 'yaml' })
  })
})

describe('sample documents', () => {
  it('each sample converts to the same data as the others', async () => {
    const fromToml = JSON.parse(expectOk(await convertConfig(CONFIG_SAMPLES.toml, 'toml', 'json')))
    expect(JSON.parse(CONFIG_SAMPLES.json)).toEqual(fromToml)
    expect(YAML.parse(CONFIG_SAMPLES.yaml)).toEqual(fromToml)
    const yamlToJson = JSON.parse(expectOk(await convertConfig(CONFIG_SAMPLES.yaml, 'yaml', 'json')))
    expect(yamlToJson).toEqual(fromToml)
  })
})

describe('TOML / JSON / YAML Converter guide example', () => {
  it('matches what the converter produces', async () => {
    const example = TOML_JSON_YAML_CONVERTER_META.guide?.example
    expect(example).toBeDefined()
    expect(expectOk(await convertConfig(example?.input ?? '', 'toml', 'json'))).toBe(example?.output)
  })
})
