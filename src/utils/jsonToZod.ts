/**
 * Utility to convert JSON value into a Zod schema TypeScript string.
 */
export function jsonToZod(jsonValue: unknown, rootName = 'schema'): string {
  function parseValue(val: unknown, indentLevel = 1): string {
    const indent = '  '.repeat(indentLevel)

    if (val === null) {
      return 'z.null()'
    }

    if (typeof val === 'string') {
      return 'z.string()'
    }

    if (typeof val === 'number') {
      return Number.isInteger(val) ? 'z.number().int()' : 'z.number()'
    }

    if (typeof val === 'boolean') {
      return 'z.boolean()'
    }

    if (Array.isArray(val)) {
      if (val.length === 0) {
        return 'z.array(z.unknown())'
      }
      // Infer element schema from first element (or union if multiple types)
      const elementSchemas = Array.from(new Set(val.map(item => parseValue(item, indentLevel))))
      if (elementSchemas.length === 1) {
        return `z.array(${elementSchemas[0]})`
      }
      return `z.array(z.union([${elementSchemas.join(', ')}]))`
    }

    if (typeof val === 'object') {
      const entries = Object.entries(val as Record<string, unknown>)
      if (entries.length === 0) {
        return 'z.object({})'
      }

      const fields = entries.map(([key, childVal]) => {
        const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : JSON.stringify(key)
        const childSchema = parseValue(childVal, indentLevel + 1)
        return `${indent}${safeKey}: ${childSchema},`
      })

      const parentIndent = '  '.repeat(indentLevel - 1)
      return `z.object({\n${fields.join('\n')}\n${parentIndent}})`
    }

    return 'z.unknown()'
  }

  try {
    const parsed = typeof jsonValue === 'string' ? JSON.parse(jsonValue) : jsonValue
    const schemaBody = parseValue(parsed, 1)
    return `import { z } from 'zod'\n\nexport const ${rootName} = ${schemaBody}\n\nexport type ${rootName.charAt(0).toUpperCase() + rootName.slice(1)} = z.infer<typeof ${rootName}>`
  } catch (err) {
    throw new Error(`Invalid JSON: ${(err as Error).message}`)
  }
}
