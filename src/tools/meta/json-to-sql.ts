import { lazy } from "react"
import { ToolMeta } from "../tool-meta"

export const JSON_TO_SQL_META: ToolMeta = {
  slug: 'json-to-sql',
  name: 'JSON to SQL Schema & Query Converter',
  category: 'data-tools',
  tag: 'SQL',
  description: 'Convert JSON objects and arrays into SQL CREATE TABLE and INSERT INTO statements with automatic data type detection and multi-dialect support.',
  keywords: ['json to sql', 'json to create table', 'json to insert', 'sql generator', 'json to postgres', 'json to mysql', 'json to sqlite'],
  status: 'stable',
  isNew: true,
  toolComponent: lazy(() => import('../../components/tools/data-tools/JsonToSql')),
  seo: {
    title: 'JSON to SQL Schema & INSERT Query Generator',
    description: 'Convert JSON data into clean SQL DDL and INSERT statements for PostgreSQL, MySQL, SQLite, SQL Server, and Oracle in your browser.',
    extraKeywords: ['json to ddl', 'sql insert generator', 'json to sql table', 'database schema from json', 'sql batch insert'],
  },
  about: {
    summary: 'The JSON to SQL Converter transforms raw JSON datasets into structured SQL table definitions (CREATE TABLE) and parameterized or batched INSERT statements across major database dialects.',
    useCases: [
      'Bootstrapping database tables and test seed data from API JSON responses',
      'Migrating NoSQL documents or JSON dumps into relational databases (PostgreSQL, MySQL, SQLite, SQL Server)',
      'Generating mock data INSERT scripts for integration tests',
      'Creating database schemas with automatically inferred column types'
    ],
    features: [
      'Multi-dialect syntax generation: PostgreSQL, MySQL / MariaDB, SQLite, Microsoft SQL Server, and Oracle',
      'Automatic column data type inference (INTEGER, NUMERIC, BOOLEAN, TIMESTAMPTZ, JSONB, VARCHAR)',
      'Configurable options for DROP TABLE, Transactions (BEGIN/COMMIT), and Batch INSERTs',
      'SQL syntax highlighting with instant 1-click copy and download'
    ],
    notes: [
      'Null values are handled gracefully and typed based on subsequent non-null records in the array',
      'All transformations execute 100% locally in browser memory'
    ],
    tip: 'Toggle Batch Inserts to combine hundreds of records into high-performance multi-row VALUES clauses.'
  }
}
