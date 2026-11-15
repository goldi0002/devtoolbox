const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'LEFT OUTER JOIN', 'RIGHT OUTER JOIN', 'FULL OUTER JOIN',
  'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN',
  'CROSS JOIN', 'FULL JOIN', 'ON', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET',
  'UNION', 'UNION ALL', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM',
  'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE', 'PRIMARY KEY', 'FOREIGN KEY',
  'AS', 'AND', 'OR', 'NOT', 'IN', 'IS NULL', 'IS NOT NULL', 'LIKE', 'BETWEEN',
  'EXISTS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'ASC', 'DESC', 'WITH', 'RECURSIVE'
]

// Clauses that start a new line. Matched in a single pass, with the qualified
// joins listed before the bare JOIN, so "LEFT JOIN" stays on one line instead
// of being split again at its JOIN. WITH is left out on purpose: a CTE's WITH
// already starts the statement, and breaking on it mangles column types such as
// "timestamp with time zone".
const CLAUSE_BREAK = new RegExp(
  '\\b(' +
    [
      'SELECT', 'FROM', 'WHERE',
      '(?:LEFT|RIGHT|FULL) OUTER JOIN', '(?:LEFT|RIGHT|FULL|INNER|OUTER|CROSS) JOIN', 'JOIN',
      'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'VALUES', 'SET',
    ].join('|') +
    ')\\b',
  'gi',
)

export function formatSql(sql: string, uppercaseKeywords: boolean, indentSize: number): string {
  if (!sql.trim()) return ''

  let tokens = sql
    .replace(/\s+/g, ' ')
    .trim()

  // Standardize keyword casing if requested
  if (uppercaseKeywords) {
    SQL_KEYWORDS.forEach(kw => {
      const reg = new RegExp(`\\b${kw}\\b`, 'gi')
      tokens = tokens.replace(reg, kw)
    })
  }

  // Major clause line breaks
  const formatted = tokens.replace(CLAUSE_BREAK, '\n$1')

  // Split lines and apply indentation
  const indentStr = ' '.repeat(indentSize)
  const lines = formatted.split('\n').filter(l => l.trim().length > 0)

  let level = 0
  const resultLines: string[] = []

  lines.forEach(line => {
    const trimmed = line.trim()

    // Handle comma list breaks after SELECT
    if (/^select /i.test(trimmed)) {
      const selectPart = trimmed.slice(7)
      const fields = selectPart.split(/,(?![^()]*\))/).map(f => f.trim())
      if (fields.length > 1) {
        resultLines.push(trimmed.slice(0, 6))
        fields.forEach((f, idx) => {
          const comma = idx < fields.length - 1 ? ',' : ''
          resultLines.push(`${indentStr}${f}${comma}`)
        })
        return
      }
    }

    if (trimmed.includes(')')) {
      level = Math.max(0, level - (trimmed.split(')').length - 1))
    }

    const currentIndent = indentStr.repeat(level)
    resultLines.push(currentIndent + trimmed)

    if (trimmed.includes('(')) {
      level += (trimmed.split('(').length - 1)
    }
  })

  return resultLines.join('\n')
}

export function minifySql(sql: string): string {
  return sql
    .replace(/--.*$/gm, '') // remove line comments
    .replace(/\/\*[\s\S]*?\*\//g, '') // remove block comments
    .replace(/\s+/g, ' ')
    .trim()
}

export const SAMPLE_SQLS = [
  {
    name: 'User Analytics Query',
    sql: `select u.id, u.name, u.email, count(o.id) as total_orders, sum(o.total_amount) as lifetime_value from users u left join orders o on u.id = o.user_id where u.created_at >= '2025-01-01' and u.status = 'active' group by u.id, u.name, u.email having count(o.id) > 2 order by lifetime_value desc limit 50;`
  },
  {
    name: 'Multi-Join Report',
    sql: `select c.name as customer, p.title as product, cat.name as category, sum(oi.quantity) as units, sum(oi.quantity * oi.unit_price) as revenue from customers c inner join orders o on o.customer_id = c.id inner join order_items oi on oi.order_id = o.id inner join products p on p.id = oi.product_id left join categories cat on cat.id = p.category_id where o.status = 'paid' and o.placed_at >= '2025-01-01' group by c.name, p.title, cat.name order by revenue desc limit 25;`
  },
  {
    name: 'Table Creation',
    sql: `create table products (id uuid primary key default gen_random_uuid(), title varchar(255) not null, price numeric(10,2) not null check (price >= 0), stock_quantity integer default 0, created_at timestamp with time zone default now());`
  }
]
