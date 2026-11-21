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
  },
  guide: {
    "steps": [
      {
        "name": "Paste JSON records",
        "text": "Paste a JSON array of objects, or a single object, into JSON Records Input."
      },
      {
        "name": "Set the table and dialect",
        "text": "Enter a Table Name and choose a SQL Dialect: PostgreSQL, MySQL / MariaDB, SQLite, Microsoft SQL Server or Oracle."
      },
      {
        "name": "Choose options",
        "text": "Turn DROP TABLE, Transactions (BEGIN/COMMIT) and Batch Inserts on or off. The SQL updates as you change them."
      },
      {
        "name": "Copy the SQL",
        "text": "Copy the generated CREATE TABLE and INSERT statements from the output panel."
      }
    ],
    "faqs": [
      {
        "question": "How are column types chosen?",
        "answer": "Each column takes its type from the first value seen for it. If that value is null, a later non-null value sets the type. ISO timestamps become timestamp types, and strings longer than 255 characters become text types."
      },
      {
        "question": "Which column becomes the primary key?",
        "answer": "Any column named id, in any letter case, is marked PRIMARY KEY."
      },
      {
        "question": "Why are Oracle inserts not batched?",
        "answer": "The Batch Inserts option is skipped for Oracle, so it always writes one INSERT per record."
      },
      {
        "question": "How are special characters handled?",
        "answer": "Single quotes in text are doubled. Objects and arrays are stored as JSON text inside a quoted string."
      }
    ],
    "example": {
      "title": "Generate a PostgreSQL table and insert statement with the default options.",
      "input": "[{ \"id\": 1, \"email\": \"ada@example.com\" }]",
      "output": "BEGIN;\n\nDROP TABLE IF EXISTS \"users\";\nCREATE TABLE \"users\" (\n    \"id\" INTEGER PRIMARY KEY,\n    \"email\" VARCHAR(255)\n);\n\nINSERT INTO \"users\" (\"id\", \"email\") VALUES\n    (1, 'ada@example.com');\n\nCOMMIT;",
      "inputLabel": "JSON Records Input",
      "outputLabel": "SQL"
    }
  },
}
