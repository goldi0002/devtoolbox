import { getErrorMessage } from './errors'

/** Parses JSON, re-throwing with the original parser message kept intact. */
function parseJson(json: string): unknown {
  try {
    return JSON.parse(json)
  } catch (e) {
    throw new Error(`Invalid JSON: ${getErrorMessage(e, 'could not be parsed')}`)
  }
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

export function jsonToPythonPydantic(json: string, className = 'GeneratedModel'): string {
  const parsed = parseJson(json)
  const models: string[] = []

  function toPyType(value: unknown, key: string): string {
    if (value === null) return 'Optional[Any]'
    if (typeof value === 'boolean') return 'bool'
    if (typeof value === 'number') return Number.isInteger(value) ? 'int' : 'float'
    if (typeof value === 'string') return 'str'
    if (Array.isArray(value)) {
      if (value.length === 0) return 'List[Any]'
      const itemType = toPyType(value[0], key)
      return `List[${itemType}]`
    }
    if (typeof value === 'object') {
      const nestedName = key.charAt(0).toUpperCase() + key.slice(1)
      generateModel(value as Record<string, unknown>, nestedName)
      return nestedName
    }
    return 'Any'
  }

  function generateModel(obj: Record<string, unknown>, name: string) {
    const props = Object.entries(obj).map(([key, val]) => {
      const type = toPyType(val, key)
      return `    ${key}: ${type}`
    })
    models.push(`class ${name}(BaseModel):\n${props.join('\n')}`)
  }

  if (typeof parsed === 'object' && !Array.isArray(parsed) && parsed !== null) {
    generateModel(parsed as Record<string, unknown>, className)
  } else {
    throw new Error('Root JSON must be an object')
  }

  return `from pydantic import BaseModel\nfrom typing import List, Optional, Any\n\n` + models.reverse().join('\n\n')
}

export function jsonToGo(json: string, structName = 'GeneratedModel'): string {
  const parsed = parseJson(json)
  const structs: string[] = []

  function toGoType(value: unknown, key: string): string {
    if (value === null) return 'interface{}'
    if (typeof value === 'boolean') return 'bool'
    if (typeof value === 'number') return Number.isInteger(value) ? 'int64' : 'float64'
    if (typeof value === 'string') return 'string'
    if (Array.isArray(value)) {
      if (value.length === 0) return '[]interface{}'
      const itemType = toGoType(value[0], key)
      return `[]${itemType}`
    }
    if (typeof value === 'object') {
      const nestedName = key.charAt(0).toUpperCase() + key.slice(1)
      generateStruct(value as Record<string, unknown>, nestedName)
      return nestedName
    }
    return 'interface{}'
  }

  function generateStruct(obj: Record<string, unknown>, name: string) {
    const props = Object.entries(obj).map(([key, val]) => {
      const fieldName = key.charAt(0).toUpperCase() + key.slice(1)
      const type = toGoType(val, key)
      return `\t${fieldName} ${type} \`json:"${key}"\``
    })
    structs.push(`type ${name} struct {\n${props.join('\n')}\n}`)
  }

  if (typeof parsed === 'object' && !Array.isArray(parsed) && parsed !== null) {
    generateStruct(parsed as Record<string, unknown>, structName)
  } else {
    throw new Error('Root JSON must be an object')
  }

  return structs.reverse().join('\n\n')
}

export function jsonToRust(json: string, structName = 'GeneratedModel'): string {
  const parsed = parseJson(json)
  const structs: string[] = []

  function toRustType(value: unknown, key: string): string {
    if (value === null) return 'Option<serde_json::Value>'
    if (typeof value === 'boolean') return 'bool'
    if (typeof value === 'number') return Number.isInteger(value) ? 'i64' : 'f64'
    if (typeof value === 'string') return 'String'
    if (Array.isArray(value)) {
      if (value.length === 0) return 'Vec<serde_json::Value>'
      const itemType = toRustType(value[0], key)
      return `Vec<${itemType}>`
    }
    if (typeof value === 'object') {
      const nestedName = key.charAt(0).toUpperCase() + key.slice(1)
      generateStruct(value as Record<string, unknown>, nestedName)
      return nestedName
    }
    return 'serde_json::Value'
  }

  function generateStruct(obj: Record<string, unknown>, name: string) {
    const props = Object.entries(obj).map(([key, val]) => {
      const type = toRustType(val, key)
      return `    pub ${key}: ${type},`
    })
    structs.push(`#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]\n#[serde(rename_all = "camelCase")]\npub struct ${name} {\n${props.join('\n')}\n}`)
  }

  if (typeof parsed === 'object' && !Array.isArray(parsed) && parsed !== null) {
    generateStruct(parsed as Record<string, unknown>, structName)
  } else {
    throw new Error('Root JSON must be an object')
  }

  return `use serde::{Serialize, Deserialize};\n\n` + structs.reverse().join('\n\n')
}
