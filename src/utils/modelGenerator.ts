import { getErrorMessage } from './errors'

/** Parses JSON, re-throwing with the original parser message kept intact. */
function parseJson(json: string): unknown {
  try {
    return JSON.parse(json)
  } catch (e) {
    throw new Error(`Invalid JSON: ${getErrorMessage(e, 'could not be parsed')}`)
  }
}

export function jsonToCSharp(json: string, className = 'GeneratedModel'): string {
  const parsed = parseJson(json)

  const classes: string[] = []

  function toCSharpType(value: unknown, key: string): string {
    if (value === null) return 'object?'
    if (typeof value === 'boolean') return 'bool'
    if (typeof value === 'number') return Number.isInteger(value) ? 'int' : 'double'
    if (typeof value === 'string') return 'string'
    if (Array.isArray(value)) {
      if (value.length === 0) return 'List<object>'
      const itemType = toCSharpType(value[0], key)
      return `List<${itemType}>`
    }
    if (typeof value === 'object') {
      const nestedName = key.charAt(0).toUpperCase() + key.slice(1)
      generateClass(value as Record<string, unknown>, nestedName)
      return nestedName
    }
    return 'object'
  }

  function generateClass(obj: Record<string, unknown>, name: string) {
    const props = Object.entries(obj).map(([key, val]) => {
      const propName = key.charAt(0).toUpperCase() + key.slice(1)
      const type = toCSharpType(val, key)
      return `    public ${type} ${propName} { get; set; }`
    })

    classes.push(`public class ${name}\n{\n${props.join('\n')}\n}`)
  }

  if (typeof parsed === 'object' && !Array.isArray(parsed) && parsed !== null) {
    generateClass(parsed as Record<string, unknown>, className)
  } else {
    throw new Error('Root JSON must be an object')
  }

  return classes.reverse().join('\n\n')
}

export function jsonToTypeScript(json: string, interfaceName = 'GeneratedModel'): string {
  const parsed = parseJson(json)

  const interfaces: string[] = []

  function toTSType(value: unknown, key: string): string {
    if (value === null) return 'null'
    if (typeof value === 'boolean') return 'boolean'
    if (typeof value === 'number') return 'number'
    if (typeof value === 'string') return 'string'
    if (Array.isArray(value)) {
      if (value.length === 0) return 'unknown[]'
      const itemType = toTSType(value[0], key)
      return `${itemType}[]`
    }
    if (typeof value === 'object') {
      const nestedName = key.charAt(0).toUpperCase() + key.slice(1)
      generateInterface(value as Record<string, unknown>, nestedName)
      return nestedName
    }
    return 'unknown'
  }

  function generateInterface(obj: Record<string, unknown>, name: string) {
    const props = Object.entries(obj).map(([key, val]) => {
      const type = toTSType(val, key)
      const optional = val === null ? '?' : ''
      return `  ${key}${optional}: ${type};`
    })

    interfaces.push(`interface ${name} {\n${props.join('\n')}\n}`)
  }

  if (typeof parsed === 'object' && !Array.isArray(parsed) && parsed !== null) {
    generateInterface(parsed as Record<string, unknown>, interfaceName)
  } else {
    throw new Error('Root JSON must be an object')
  }

  return interfaces.reverse().join('\n\n')
}
