import { lazy } from "react"
import type { ToolMeta } from "../tool-meta"

export const GRAPHQL_FORMATTER_META: ToolMeta = {
  slug: 'graphql-formatter',
  name: 'GraphQL Query Formatter',
  description: 'Format, prettify, validate, and minify GraphQL queries, mutations, and schemas online with custom indentation.',
  category: 'web-tools',
  tag: 'graphql',
  toolComponent: lazy(() => import('../../components/tools/web-tools/GraphqlFormatter')),
  keywords: [
    'graphql formatter',
    'graphql prettifier',
    'graphql validator',
    'format graphql query',
    'minify graphql',
    'graphql query beautifier',
    'graphql schema formatter',
  ],
  about: {
    summary:
      'GraphQL Query Formatter cleans up messy GraphQL queries, mutations, and subscriptions into properly indented, structured code blocks. It validates matching braces/parentheses and generates minified query strings suitable for HTTP GET/POST payloads.',
    useCases: [
      'Formatting minified GraphQL queries copied from browser network logs or GraphiQL',
      'Minifying GraphQL queries to send inside JSON request bodies (`{"query": "..."}`)',
      'Checking for syntax errors like unclosed selections or missing braces',
      'Standardizing GraphQL query indentation before committing to git repos',
    ],
    features: [
      'Beautify queries with 2 or 4 space indentation',
      'Minify query strings into a single line for compact network payloads',
      'Structural syntax validation detecting unbalanced braces and parentheses',
      'Instant client-side formatting with zero server roundtrips',
    ],
    tip: 'Copy minified queries directly into cURL or Postman POST request bodies under the "query" string field!',
  },
  addedAt: '2026-07-26',
  complexity: 'simple',
  featured: true,
  isNew: true,
  status: 'stable',
  seo: {
    description: 'Format, beautify, and minify GraphQL queries and mutations online. Validate syntax, clean selection sets, and minify for HTTP payloads. Free, 100% client-side.',
    extraKeywords: [
      'graphql query formatter online',
      'graphql prettifier free',
      'minify graphql query online',
      'format graphql query online',
    ],
    title: 'GraphQL Query Formatter & Prettifier — ToolBox4Devs',
  }
}
