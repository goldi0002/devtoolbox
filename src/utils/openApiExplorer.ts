import { parse as parseYaml } from 'yaml'

export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'options' | 'head'

export interface OpenApiParameter {
  name: string
  in: 'path' | 'query' | 'header' | 'cookie'
  required: boolean
  description?: string
  schema?: Record<string, unknown>
  example?: unknown
}

export interface OpenApiResponseInfo {
  status: string
  description: string
  contentType?: string
  schema?: Record<string, unknown>
  exampleJson?: string
}

export interface OpenApiEndpoint {
  id: string
  method: HttpMethod
  path: string
  summary: string
  description?: string
  operationId?: string
  tags: string[]
  deprecated: boolean
  parameters: OpenApiParameter[]
  requestBody?: {
    required: boolean
    description?: string
    contentType: string
    schema?: Record<string, unknown>
    sampleJson: string
  }
  responses: OpenApiResponseInfo[]
}

export interface ParsedOpenApiSpec {
  specVersion: string
  title: string
  version: string
  description?: string
  servers: string[]
  tags: string[]
  endpoints: OpenApiEndpoint[]
  schemaCount: number
}

const HTTP_METHODS: HttpMethod[] = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head']

export const SAMPLE_OPENAPI_SPEC = `openapi: 3.0.3
info:
  title: Orders & Users API
  version: 2.4.0
  description: Client-side sample OpenAPI 3.0 specification for exploring endpoints, schemas, and generated requests.
servers:
  - url: https://api.example.com/v2
    description: Production gateway
  - url: https://staging-api.example.com/v2
    description: Staging environment
tags:
  - name: Orders
    description: Order lifecycle endpoints
  - name: Users
    description: User account endpoints
paths:
  /orders:
    get:
      tags: [Orders]
      summary: List recent orders
      operationId: listOrders
      parameters:
        - name: status
          in: query
          required: false
          description: Filter by fulfillment status
          schema:
            type: string
            enum: [pending, paid, shipped, cancelled]
        - name: limit
          in: query
          required: false
          schema:
            type: integer
            default: 20
      responses:
        '200':
          description: Paginated list of orders
          content:
            application/json:
              schema:
                type: object
                properties:
                  items:
                    type: array
                    items:
                      $ref: '#/components/schemas/Order'
                  total:
                    type: integer
                    example: 42
    post:
      tags: [Orders]
      summary: Create a new order
      operationId: createOrder
      requestBody:
        required: true
        description: Order payload
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateOrderInput'
      responses:
        '201':
          description: Created order
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Order'
  /orders/{orderId}:
    get:
      tags: [Orders]
      summary: Get order by ID
      operationId: getOrderById
      parameters:
        - name: orderId
          in: path
          required: true
          description: Unique order UUID
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Order details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Order'
        '404':
          description: Order not found
  /users/{userId}:
    patch:
      tags: [Users]
      summary: Update user profile
      operationId: updateUser
      parameters:
        - name: userId
          in: path
          required: true
          schema:
            type: string
            example: usr_90210
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                displayName:
                  type: string
                  example: Ada Lovelace
                email:
                  type: string
                  format: email
                marketingOptIn:
                  type: boolean
                  default: false
      responses:
        '200':
          description: Updated user profile
components:
  schemas:
    CreateOrderInput:
      type: object
      required: [customerId, items]
      properties:
        customerId:
          type: string
          format: uuid
        currency:
          type: string
          enum: [USD, EUR, GBP]
          default: USD
        items:
          type: array
          items:
            $ref: '#/components/schemas/OrderLineItem'
    OrderLineItem:
      type: object
      properties:
        sku:
          type: string
          example: WIDGET-42
        quantity:
          type: integer
          example: 2
        unitPriceCents:
          type: integer
          example: 1999
    Order:
      type: object
      properties:
        id:
          type: string
          format: uuid
        status:
          type: string
          enum: [pending, paid, shipped]
        totalCents:
          type: integer
          example: 3998
        createdAt:
          type: string
          format: date-time
        items:
          type: array
          items:
            $ref: '#/components/schemas/OrderLineItem'
`

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function resolvePointer(root: Record<string, unknown>, ref: string): unknown {
  if (!ref.startsWith('#/')) return undefined
  const parts = ref
    .slice(2)
    .split('/')
    .map(p => p.replace(/~1/g, '/').replace(/~0/g, '~'))
  let current: unknown = root
  for (const part of parts) {
    if (!isPlainObject(current) && !Array.isArray(current)) return undefined
    current = (current as Record<string, unknown>)[part]
  }
  return current
}

export function resolveSchema(
  schema: unknown,
  root: Record<string, unknown>,
  visited: Set<string> = new Set(),
  depth = 0
): Record<string, unknown> | undefined {
  if (!isPlainObject(schema) || depth > 12) return undefined

  if (typeof schema.$ref === 'string') {
    const ref = schema.$ref
    if (visited.has(ref)) {
      return { type: 'object', description: `Circular reference (${ref})` }
    }
    const target = resolvePointer(root, ref)
    if (!isPlainObject(target)) return { type: 'object', $ref: ref }
    const nextVisited = new Set(visited)
    nextVisited.add(ref)
    const resolvedTarget = resolveSchema(target, root, nextVisited, depth + 1) ?? target
    const { $ref: _omit, ...rest } = schema
    return { ...resolvedTarget, ...rest }
  }

  if (Array.isArray(schema.allOf) && schema.allOf.length > 0) {
    const mergedProps: Record<string, unknown> = {}
    const mergedReq: string[] = []
    for (const branch of schema.allOf) {
      const r = resolveSchema(branch, root, visited, depth + 1)
      if (r && isPlainObject(r.properties)) {
        Object.assign(mergedProps, r.properties)
      }
      if (r && Array.isArray(r.required)) {
        for (const req of r.required) {
          if (typeof req === 'string' && !mergedReq.includes(req)) mergedReq.push(req)
        }
      }
    }
    return {
      ...schema,
      type: schema.type ?? 'object',
      properties: mergedProps,
      ...(mergedReq.length > 0 ? { required: mergedReq } : {}),
    }
  }

  return schema
}

export function generateSampleFromSchema(
  schema: unknown,
  root: Record<string, unknown>,
  visited: Set<string> = new Set(),
  depth = 0
): unknown {
  if (!isPlainObject(schema) || depth > 8) return null

  if (typeof schema.$ref === 'string') {
    if (visited.has(schema.$ref)) return {}
    const nextVisited = new Set(visited)
    nextVisited.add(schema.$ref)
    const target = resolvePointer(root, schema.$ref)
    if (!isPlainObject(target)) return {}
    return generateSampleFromSchema(target, root, nextVisited, depth + 1)
  }

  if (schema.example !== undefined) return schema.example
  if (schema.default !== undefined) return schema.default
  if (Array.isArray(schema.enum) && schema.enum.length > 0) return schema.enum[0]

  if (Array.isArray(schema.allOf) && schema.allOf.length > 0) {
    const combined: Record<string, unknown> = {}
    for (const part of schema.allOf) {
      const val = generateSampleFromSchema(part, root, visited, depth + 1)
      if (isPlainObject(val)) Object.assign(combined, val)
    }
    return combined
  }

  if (Array.isArray(schema.oneOf) && schema.oneOf.length > 0) {
    return generateSampleFromSchema(schema.oneOf[0], root, visited, depth + 1)
  }
  if (Array.isArray(schema.anyOf) && schema.anyOf.length > 0) {
    return generateSampleFromSchema(schema.anyOf[0], root, visited, depth + 1)
  }

  const resolvedType = Array.isArray(schema.type) ? schema.type[0] : schema.type

  if (resolvedType === 'object' || isPlainObject(schema.properties)) {
    const out: Record<string, unknown> = {}
    const props = isPlainObject(schema.properties) ? schema.properties : {}
    for (const [key, propSchema] of Object.entries(props)) {
      out[key] = generateSampleFromSchema(propSchema, root, visited, depth + 1)
    }
    return out
  }

  if (resolvedType === 'array') {
    const itemSample = schema.items ? generateSampleFromSchema(schema.items, root, visited, depth + 1) : 'item'
    return [itemSample]
  }

  if (resolvedType === 'integer') return 1
  if (resolvedType === 'number') return 1.5
  if (resolvedType === 'boolean') return true

  if (resolvedType === 'string' || !resolvedType) {
    switch (schema.format) {
      case 'uuid':
        return '550e8400-e29b-41d4-a716-446655440000'
      case 'email':
        return 'developer@example.com'
      case 'date-time':
        return '2026-11-21T12:00:00Z'
      case 'date':
        return '2026-11-21'
      case 'uri':
      case 'url':
        return 'https://example.com/resource'
      case 'ipv4':
        return '192.0.2.1'
      default:
        return 'string'
    }
  }

  return null
}

export function parseOpenApiSpec(rawInput: string): ParsedOpenApiSpec {
  const trimmed = rawInput.trim()
  if (!trimmed) {
    throw new Error('Paste an OpenAPI 3.0 / 3.1 or Swagger 2.0 specification (JSON or YAML).')
  }

  let doc: unknown
  try {
    doc = trimmed.startsWith('{') ? JSON.parse(trimmed) : parseYaml(trimmed)
  } catch (err) {
    throw new Error(err instanceof Error ? `Parse error: ${err.message}` : 'Invalid JSON or YAML specification.')
  }

  if (!isPlainObject(doc)) {
    throw new Error('Specification must be a JSON or YAML object.')
  }

  const openapiVer = typeof doc.openapi === 'string' ? doc.openapi : undefined
  const swaggerVer = typeof doc.swagger === 'string' ? doc.swagger : undefined
  if (!openapiVer && !swaggerVer) {
    throw new Error('Missing "openapi" (3.x) or "swagger" (2.0) version field.')
  }
  if (!isPlainObject(doc.paths)) {
    throw new Error('Specification must include a "paths" object.')
  }

  const info = isPlainObject(doc.info) ? doc.info : {}
  const title = typeof info.title === 'string' && info.title.trim() ? info.title.trim() : 'Untitled API'
  const version = typeof info.version === 'string' && info.version.trim() ? info.version.trim() : '1.0.0'
  const description = typeof info.description === 'string' ? info.description.trim() : undefined

  const servers: string[] = []
  if (Array.isArray(doc.servers)) {
    for (const s of doc.servers) {
      if (isPlainObject(s) && typeof s.url === 'string' && s.url.trim()) {
        servers.push(s.url.trim())
      }
    }
  } else if (typeof doc.host === 'string' && doc.host.trim()) {
    const schemes = Array.isArray(doc.schemes) && typeof doc.schemes[0] === 'string' ? doc.schemes[0] : 'https'
    const basePath = typeof doc.basePath === 'string' ? doc.basePath : ''
    servers.push(`${schemes}://${doc.host.trim()}${basePath}`)
  }
  if (servers.length === 0) {
    servers.push('https://api.example.com')
  }

  const declaredTags = Array.isArray(doc.tags)
    ? doc.tags
        .map(t => (isPlainObject(t) && typeof t.name === 'string' ? t.name : null))
        .filter((t): t is string => Boolean(t))
    : []

  const endpoints: OpenApiEndpoint[] = []
  const tagSet = new Set<string>(declaredTags)

  for (const [pathKey, rawPathItem] of Object.entries(doc.paths)) {
    if (!isPlainObject(rawPathItem)) continue
    const pathLevelParams = Array.isArray(rawPathItem.parameters) ? rawPathItem.parameters : []

    for (const method of HTTP_METHODS) {
      const rawOp = rawPathItem[method]
      if (!isPlainObject(rawOp)) continue

      const opParamsRaw = Array.isArray(rawOp.parameters) ? rawOp.parameters : []
      const mergedParamsMap = new Map<string, OpenApiParameter>()

      for (const rawParam of [...pathLevelParams, ...opParamsRaw]) {
        const resolvedParam = resolveSchema(rawParam, doc) ?? (isPlainObject(rawParam) ? rawParam : null)
        if (!resolvedParam || typeof resolvedParam.name !== 'string') continue
        const paramIn =
          resolvedParam.in === 'path' ||
          resolvedParam.in === 'query' ||
          resolvedParam.in === 'header' ||
          resolvedParam.in === 'cookie'
            ? resolvedParam.in
            : 'query'
        const paramSchema = resolveSchema(resolvedParam.schema, doc)
        mergedParamsMap.set(`${paramIn}:${resolvedParam.name}`, {
          name: resolvedParam.name,
          in: paramIn,
          required: Boolean(resolvedParam.required) || paramIn === 'path',
          description: typeof resolvedParam.description === 'string' ? resolvedParam.description : undefined,
          schema: paramSchema,
          example: resolvedParam.example ?? paramSchema?.example ?? paramSchema?.default,
        })
      }

      // Swagger 2.0 body parameter support
      let requestBody: OpenApiEndpoint['requestBody']
      if (isPlainObject(rawOp.requestBody)) {
        const rb = resolveSchema(rawOp.requestBody, doc) ?? rawOp.requestBody
        const content = isPlainObject(rb.content) ? rb.content : {}
        const preferredType = content['application/json']
          ? 'application/json'
          : Object.keys(content)[0] || 'application/json'
        const mediaObj = isPlainObject(content[preferredType]) ? content[preferredType] : {}
        const rawSchema = mediaObj.schema
        const resolvedBodySchema = resolveSchema(rawSchema, doc)
        const sampleValue =
          mediaObj.example !== undefined
            ? mediaObj.example
            : rawSchema
              ? generateSampleFromSchema(rawSchema, doc)
              : {}

        requestBody = {
          required: Boolean(rb.required),
          description: typeof rb.description === 'string' ? rb.description : undefined,
          contentType: preferredType,
          schema: resolvedBodySchema,
          sampleJson: JSON.stringify(sampleValue, null, 2),
        }
      } else {
        const bodyParam = [...pathLevelParams, ...opParamsRaw]
          .map(p => resolveSchema(p, doc) ?? p)
          .find(p => isPlainObject(p) && p.in === 'body')
        if (isPlainObject(bodyParam)) {
          const resolvedBodySchema = resolveSchema(bodyParam.schema, doc)
          const sampleValue = bodyParam.schema ? generateSampleFromSchema(bodyParam.schema, doc) : {}
          requestBody = {
            required: Boolean(bodyParam.required),
            description: typeof bodyParam.description === 'string' ? bodyParam.description : undefined,
            contentType: 'application/json',
            schema: resolvedBodySchema,
            sampleJson: JSON.stringify(sampleValue, null, 2),
          }
        }
      }

      const responses: OpenApiResponseInfo[] = []
      if (isPlainObject(rawOp.responses)) {
        for (const [status, rawResp] of Object.entries(rawOp.responses)) {
          const resp = resolveSchema(rawResp, doc) ?? (isPlainObject(rawResp) ? rawResp : {})
          const respContent = isPlainObject(resp.content) ? resp.content : {}
          const cType = respContent['application/json'] ? 'application/json' : Object.keys(respContent)[0]
          const mediaObj = cType && isPlainObject(respContent[cType]) ? respContent[cType] : undefined
          const schemaObj = mediaObj ? resolveSchema(mediaObj.schema, doc) : resolveSchema(resp.schema, doc)
          let exampleJson: string | undefined
          if (mediaObj?.example !== undefined) {
            exampleJson = JSON.stringify(mediaObj.example, null, 2)
          } else if (schemaObj) {
            exampleJson = JSON.stringify(generateSampleFromSchema(schemaObj, doc), null, 2)
          }
          responses.push({
            status,
            description: typeof resp.description === 'string' ? resp.description : 'Response',
            contentType: cType,
            schema: schemaObj,
            exampleJson,
          })
        }
      }

      const opTags = Array.isArray(rawOp.tags)
        ? rawOp.tags.filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
        : ['default']
      for (const t of opTags) tagSet.add(t)

      endpoints.push({
        id: `${method.toUpperCase()} ${pathKey}`,
        method,
        path: pathKey,
        summary:
          (typeof rawOp.summary === 'string' && rawOp.summary.trim()) ||
          (typeof rawOp.operationId === 'string' && rawOp.operationId.trim()) ||
          `${method.toUpperCase()} ${pathKey}`,
        description: typeof rawOp.description === 'string' ? rawOp.description.trim() : undefined,
        operationId: typeof rawOp.operationId === 'string' ? rawOp.operationId : undefined,
        tags: opTags.length > 0 ? opTags : ['default'],
        deprecated: Boolean(rawOp.deprecated),
        parameters: Array.from(mergedParamsMap.values()),
        requestBody,
        responses,
      })
    }
  }

  const componentsSchemas =
    isPlainObject(doc.components) && isPlainObject(doc.components.schemas)
      ? Object.keys(doc.components.schemas).length
      : isPlainObject(doc.definitions)
        ? Object.keys(doc.definitions).length
        : 0

  return {
    specVersion: openapiVer ? `OpenAPI ${openapiVer}` : `Swagger ${swaggerVer}`,
    title,
    version,
    description,
    servers,
    tags: Array.from(tagSet),
    endpoints,
    schemaCount: componentsSchemas,
  }
}

export function buildEndpointUrl(
  baseUrl: string,
  endpoint: OpenApiEndpoint,
  paramValues: Record<string, string>
): string {
  const cleanBase = baseUrl.replace(/\/+$/, '')
  let resolvedPath = endpoint.path
  const queryParts: string[] = []

  for (const param of endpoint.parameters) {
    const rawVal = paramValues[`${param.in}:${param.name}`]
    const fallback =
      param.example !== undefined
        ? String(param.example)
        : param.schema?.format === 'uuid'
          ? '550e8400-e29b-41d4-a716-446655440000'
          : param.name

    if (param.in === 'path') {
      const value = (rawVal && rawVal.trim()) || fallback
      resolvedPath = resolvedPath.replace(`{${param.name}}`, encodeURIComponent(value))
    } else if (param.in === 'query') {
      const value = rawVal !== undefined ? rawVal.trim() : param.required ? fallback : ''
      if (value) {
        queryParts.push(`${encodeURIComponent(param.name)}=${encodeURIComponent(value)}`)
      }
    }
  }

  const qs = queryParts.length > 0 ? `?${queryParts.join('&')}` : ''
  return `${cleanBase}${resolvedPath}${qs}`
}

export function generateCurlSnippet(
  baseUrl: string,
  endpoint: OpenApiEndpoint,
  paramValues: Record<string, string>,
  bodyOverride?: string
): string {
  const url = buildEndpointUrl(baseUrl, endpoint, paramValues)
  const lines: string[] = [`curl -X ${endpoint.method.toUpperCase()} "${url}"`]

  for (const param of endpoint.parameters) {
    if (param.in !== 'header') continue
    const val = paramValues[`header:${param.name}`]?.trim() || (param.example !== undefined ? String(param.example) : '')
    if (val) {
      lines.push(`  -H "${param.name}: ${val.replace(/"/g, '\\"')}"`)
    }
  }

  const body = bodyOverride ?? endpoint.requestBody?.sampleJson
  if (body && ['post', 'put', 'patch'].includes(endpoint.method)) {
    lines.push(`  -H "Content-Type: ${endpoint.requestBody?.contentType || 'application/json'}"`)
    const compact = body.replace(/\r?\n\s*/g, ' ').replace(/'/g, "'\\''")
    lines.push(`  -d '${compact}'`)
  }

  return lines.join(' \\\n')
}

export function generateFetchSnippet(
  baseUrl: string,
  endpoint: OpenApiEndpoint,
  paramValues: Record<string, string>,
  bodyOverride?: string
): string {
  const url = buildEndpointUrl(baseUrl, endpoint, paramValues)
  const headers: Record<string, string> = {}

  for (const param of endpoint.parameters) {
    if (param.in !== 'header') continue
    const val = paramValues[`header:${param.name}`]?.trim() || (param.example !== undefined ? String(param.example) : '')
    if (val) headers[param.name] = val
  }

  const body = bodyOverride ?? endpoint.requestBody?.sampleJson
  const hasBody = Boolean(body && ['post', 'put', 'patch'].includes(endpoint.method))
  if (hasBody) {
    headers['Content-Type'] = endpoint.requestBody?.contentType || 'application/json'
  }

  const initObj: Record<string, unknown> = {
    method: endpoint.method.toUpperCase(),
  }
  if (Object.keys(headers).length > 0) {
    initObj.headers = headers
  }

  const lines = [`const response = await fetch("${url}", {`, `  method: "${endpoint.method.toUpperCase()}",`]
  if (Object.keys(headers).length > 0) {
    lines.push(`  headers: ${JSON.stringify(headers, null, 2).replace(/\n/g, '\n  ')},`)
  }
  if (hasBody && body) {
    lines.push(`  body: JSON.stringify(${body.replace(/\n/g, '\n  ')}),`)
  }
  lines.push('});', 'const data = await response.json();')

  return lines.join('\n')
}
