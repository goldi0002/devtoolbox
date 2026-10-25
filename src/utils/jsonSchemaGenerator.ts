export type SchemaDraft = 'draft-07' | 'draft-2020-12' | 'openapi-3.0'

export type RequiredMode = 'all' | 'top-level' | 'none'

export interface JsonSchemaOptions {
  draft: SchemaDraft
  title?: string
  description?: string
  requiredMode: RequiredMode
  detectFormats: boolean
  additionalProperties: boolean
  inferEnums: boolean
}

export interface ValidationError {
  path: string
  message: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const DATE_TIME_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/
const URI_REGEX = /^https?:\/\/[^\s$.?#].[^\s]*$/i
const IPV4_REGEX = /^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/

function detectStringFormat(val: string): string | undefined {
  if (DATE_TIME_REGEX.test(val)) return 'date-time'
  if (DATE_REGEX.test(val)) return 'date'
  if (UUID_REGEX.test(val)) return 'uuid'
  if (EMAIL_REGEX.test(val)) return 'email'
  if (URI_REGEX.test(val)) return 'uri'
  if (IPV4_REGEX.test(val)) return 'ipv4'
  return undefined
}

export function generateSchemaFromValue(value: unknown, options: JsonSchemaOptions, depth = 0): Record<string, any> {
  if (value === null) {
    return { type: 'null' }
  }

  if (typeof value === 'boolean') {
    return { type: 'boolean' }
  }

  if (typeof value === 'number') {
    return Number.isInteger(value) ? { type: 'integer' } : { type: 'number' }
  }

  if (typeof value === 'string') {
    const schema: Record<string, any> = { type: 'string' }
    if (options.detectFormats) {
      const format = detectStringFormat(value)
      if (format) schema.format = format
    }
    return schema
  }

  if (Array.isArray(value)) {
    const schema: Record<string, any> = { type: 'array' }
    if (value.length === 0) {
      schema.items = {}
    } else {
      // Analyze array items
      const itemTypes = new Set<string>()
      value.forEach(item => {
        if (item === null) itemTypes.add('null')
        else if (Array.isArray(item)) itemTypes.add('array')
        else itemTypes.add(typeof item)
      })

      if (itemTypes.size === 1 && typeof value[0] === 'object' && value[0] !== null && !Array.isArray(value[0])) {
        // Merge object properties across items if multiple objects
        const mergedObj: Record<string, any> = {}
        value.forEach(item => {
          if (item && typeof item === 'object') {
            Object.assign(mergedObj, item)
          }
        })
        schema.items = generateSchemaFromValue(mergedObj, options, depth + 1)
      } else if (value.length > 0) {
        schema.items = generateSchemaFromValue(value[0], options, depth + 1)
      } else {
        schema.items = {}
      }
    }
    return schema
  }

  if (typeof value === 'object') {
    const obj = value as Record<string, any>
    const schema: Record<string, any> = {
      type: 'object',
      properties: {} as Record<string, any>
    }

    const keys = Object.keys(obj)
    const requiredKeys: string[] = []

    for (const key of keys) {
      schema.properties[key] = generateSchemaFromValue(obj[key], options, depth + 1)
      if (options.requiredMode === 'all' || (options.requiredMode === 'top-level' && depth === 0)) {
        requiredKeys.push(key)
      }
    }

    if (requiredKeys.length > 0) {
      schema.required = requiredKeys
    }

    if (!options.additionalProperties) {
      schema.additionalProperties = false
    }

    return schema
  }

  return {}
}

export function generateJsonSchema(jsonString: string, options: JsonSchemaOptions): Record<string, any> {
  const parsed = JSON.parse(jsonString)
  const schemaBody = generateSchemaFromValue(parsed, options, 0)

  const rootSchema: Record<string, any> = {}

  if (options.draft === 'draft-07') {
    rootSchema.$schema = 'http://json-schema.org/draft-07/schema#'
  } else if (options.draft === 'draft-2020-12') {
    rootSchema.$schema = 'https://json-schema.org/draft/2020-12/schema'
  }

  if (options.title) rootSchema.title = options.title
  if (options.description) rootSchema.description = options.description

  return { ...rootSchema, ...schemaBody }
}

export function validateJsonAgainstSchema(schema: any, data: any, path = '#'): ValidationResult {
  const errors: ValidationError[] = []

  if (!schema || typeof schema !== 'object') {
    return { valid: true, errors: [] }
  }

  // Type check
  if (schema.type) {
    const expectedType = schema.type
    let actualType: string = typeof data

    if (data === null) actualType = 'null'
    else if (Array.isArray(data)) actualType = 'array'
    else if (typeof data === 'number' && Number.isInteger(data) && expectedType === 'integer') {
      actualType = 'integer'
    }

    if (actualType !== expectedType) {
      errors.push({
        path,
        message: `Expected type "${expectedType}", got "${actualType}"`
      })
      return { valid: false, errors }
    }
  }

  // Object checks
  if (schema.type === 'object' && typeof data === 'object' && data !== null && !Array.isArray(data)) {
    // Check required fields
    if (Array.isArray(schema.required)) {
      for (const reqKey of schema.required) {
        if (!(reqKey in data) || data[reqKey] === undefined) {
          errors.push({
            path: `${path}/${reqKey}`,
            message: `Required property "${reqKey}" is missing`
          })
        }
      }
    }

    // Check additionalProperties
    if (schema.additionalProperties === false && schema.properties) {
      const allowedKeys = new Set(Object.keys(schema.properties))
      for (const actualKey of Object.keys(data)) {
        if (!allowedKeys.has(actualKey)) {
          errors.push({
            path: `${path}/${actualKey}`,
            message: `Additional property "${actualKey}" is not allowed`
          })
        }
      }
    }

    // Check properties recursively
    if (schema.properties) {
      for (const [propKey, propSchema] of Object.entries(schema.properties)) {
        if (propKey in data) {
          const childResult = validateJsonAgainstSchema(propSchema, data[propKey], `${path}/${propKey}`)
          errors.push(...childResult.errors)
        }
      }
    }
  }

  // Array checks
  if (schema.type === 'array' && Array.isArray(data)) {
    if (schema.items && typeof schema.items === 'object') {
      data.forEach((item, index) => {
        const itemResult = validateJsonAgainstSchema(schema.items, item, `${path}[${index}]`)
        errors.push(...itemResult.errors)
      })
    }
  }

  // String format checks
  if (schema.type === 'string' && typeof data === 'string' && schema.format) {
    if (schema.format === 'email' && !EMAIL_REGEX.test(data)) {
      errors.push({ path, message: `Value does not match format "email"` })
    } else if (schema.format === 'uuid' && !UUID_REGEX.test(data)) {
      errors.push({ path, message: `Value does not match format "uuid"` })
    } else if (schema.format === 'date-time' && !DATE_TIME_REGEX.test(data)) {
      errors.push({ path, message: `Value does not match format "date-time"` })
    } else if (schema.format === 'date' && !DATE_REGEX.test(data)) {
      errors.push({ path, message: `Value does not match format "date"` })
    } else if (schema.format === 'uri' && !URI_REGEX.test(data)) {
      errors.push({ path, message: `Value does not match format "uri"` })
    } else if (schema.format === 'ipv4' && !IPV4_REGEX.test(data)) {
      errors.push({ path, message: `Value does not match format "ipv4"` })
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
