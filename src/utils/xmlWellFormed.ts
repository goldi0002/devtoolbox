/**
 * Well-formedness check for XML 1.0 documents (a syntax check, not schema
 * validation). Used by the XML Formatter so malformed markup is reported
 * instead of being silently repaired by the formatter.
 *
 * Covers: mismatched, unclosed and stray closing tags, multiple roots, text
 * outside the root, comments, CDATA, processing instructions, DOCTYPE (with an
 * internal subset), self-closing tags, quoted attribute values that contain
 * `>`, duplicate or unquoted attributes, and bare `&` / `<` in text.
 *
 * Names use a simplified character range (`À-￿`) instead of the full
 * XML name production, which is close enough for a formatter.
 */

export type XmlWellFormedResult =
  | { ok: true }
  | { ok: false; line: number; column: number; message: string }

const WS = /[ \t\r\n]/
const NAME_START_CHARS = 'A-Za-z_:\\u00C0-\\uFFFF'
const NAME_RE = new RegExp(`[${NAME_START_CHARS}][A-Za-z0-9_:.\\-\\u00B7\\u00C0-\\uFFFF]*`, 'y')
const ENTITY_RE = /&(?:#[0-9]+|#x[0-9a-fA-F]+|[A-Za-z_:][-A-Za-z0-9_:.]*);/y

/** Index of the first `&` that does not start a well-formed reference, or -1. */
function findBareAmpersand(text: string): number {
  let k = text.indexOf('&')
  while (k >= 0) {
    ENTITY_RE.lastIndex = k
    if (!ENTITY_RE.exec(text)) return k
    k = text.indexOf('&', k + 1)
  }
  return -1
}

/** Index of the `>` that closes a DOCTYPE starting at `start`, or -1. */
function findDoctypeEnd(source: string, start: number): number {
  let depth = 0
  let quote = ''
  for (let k = start + '<!DOCTYPE'.length; k < source.length; k++) {
    const c = source[k]
    if (quote) {
      if (c === quote) quote = ''
    } else if (c === '"' || c === "'") {
      quote = c
    } else if (c === '[') {
      depth++
    } else if (c === ']') {
      depth--
    } else if (c === '>' && depth <= 0) {
      return k
    }
  }
  return -1
}

/**
 * Checks that `source` is a well-formed XML document. Returns the first problem
 * found, with a 1-based line and column.
 */
export function checkXmlWellFormed(source: string): XmlWellFormedResult {
  const s = source.charCodeAt(0) === 0xfeff ? source.slice(1) : source
  const n = s.length

  const locate = (pos: number) => {
    const before = s.slice(0, pos)
    return {
      line: before.split('\n').length,
      column: pos - before.lastIndexOf('\n'),
    }
  }
  const fail = (pos: number, reason: string): XmlWellFormedResult => {
    const { line, column } = locate(pos)
    return { ok: false, line, column, message: `Malformed XML at line ${line}, column ${column}: ${reason}` }
  }

  const stack: { name: string; pos: number }[] = []
  let rootSeen = false
  let i = 0

  while (i < n) {
    if (s[i] !== '<') {
      // Character data.
      const next = s.indexOf('<', i)
      const end = next < 0 ? n : next
      const text = s.slice(i, end)
      if (stack.length === 0) {
        const firstNonSpace = text.search(/[^ \t\r\n]/)
        if (firstNonSpace >= 0) {
          return fail(i + firstNonSpace, 'text is not allowed outside the root element.')
        }
      } else {
        const bad = text.indexOf(']]>')
        if (bad >= 0) return fail(i + bad, 'literal "]]>" is not allowed in text; write "]]&gt;".')
        const amp = findBareAmpersand(text)
        if (amp >= 0) return fail(i + amp, 'unescaped "&" in text; write "&amp;".')
      }
      i = end
      continue
    }

    if (s.startsWith('<?', i)) {
      const end = s.indexOf('?>', i + 2)
      if (end < 0) return fail(i, 'processing instruction is not closed with "?>".')
      i = end + 2
      continue
    }

    if (s.startsWith('<!--', i)) {
      const end = s.indexOf('-->', i + 4)
      if (end < 0) return fail(i, 'comment is not closed with "-->".')
      const body = s.slice(i + 4, end)
      if (body.includes('--') || body.endsWith('-')) {
        return fail(i, 'comments cannot contain "--" or end with "-".')
      }
      i = end + 3
      continue
    }

    if (s.startsWith('<![CDATA[', i)) {
      if (stack.length === 0) return fail(i, 'CDATA section is outside the root element.')
      const end = s.indexOf(']]>', i + 9)
      if (end < 0) return fail(i, 'CDATA section is not closed with "]]>".')
      i = end + 3
      continue
    }

    if (s.startsWith('<!DOCTYPE', i)) {
      if (rootSeen) return fail(i, 'DOCTYPE must come before the root element.')
      const end = findDoctypeEnd(s, i)
      if (end < 0) return fail(i, 'DOCTYPE is not closed with ">".')
      i = end + 1
      continue
    }

    if (s[i + 1] === '/') {
      NAME_RE.lastIndex = i + 2
      const m = NAME_RE.exec(s)
      if (!m) return fail(i, 'closing tag has no element name.')
      const name = m[0]
      let j = i + 2 + name.length
      while (j < n && WS.test(s[j])) j++
      if (s[j] !== '>') return fail(j, `expected ">" to end closing tag </${name}>.`)
      if (stack.length === 0) return fail(i, `closing tag </${name}> has no matching opening tag.`)
      const open = stack.pop()!
      if (open.name !== name) {
        return fail(
          i,
          `closing tag </${name}> does not match <${open.name}> opened on line ${locate(open.pos).line}.`,
        )
      }
      i = j + 1
      continue
    }

    NAME_RE.lastIndex = i + 1
    const startName = NAME_RE.exec(s)
    if (!startName) {
      return fail(i, '"<" must start a tag, comment or CDATA section; write "&lt;" for a literal "<".')
    }

    const name = startName[0]
    if (stack.length === 0 && rootSeen) {
      return fail(i, `<${name}> appears after the root element has closed; a document has one root element.`)
    }
    rootSeen = true

    let j = i + 1 + name.length
    const seenAttrs = new Set<string>()
    let selfClosing = false
    for (;;) {
      const before = j
      while (j < n && WS.test(s[j])) j++
      if (j >= n) return fail(i, `start tag <${name}> is not closed.`)
      if (s[j] === '>') {
        j++
        break
      }
      if (s.startsWith('/>', j)) {
        selfClosing = true
        j += 2
        break
      }
      if (j === before) return fail(j, `expected whitespace before the next attribute in <${name}>.`)

      NAME_RE.lastIndex = j
      const attr = NAME_RE.exec(s)
      if (!attr) return fail(j, `unexpected character "${s[j]}" in <${name}> tag.`)
      const attrName = attr[0]
      if (seenAttrs.has(attrName)) return fail(j, `duplicate attribute "${attrName}" in <${name}>.`)
      seenAttrs.add(attrName)
      j += attrName.length

      while (j < n && WS.test(s[j])) j++
      if (s[j] !== '=') return fail(j, `attribute "${attrName}" has no value; write ${attrName}="...".`)
      j++
      while (j < n && WS.test(s[j])) j++

      const quote = s[j]
      if (quote !== '"' && quote !== "'") {
        return fail(j, `value of attribute "${attrName}" must be in quotes.`)
      }
      const close = s.indexOf(quote, j + 1)
      if (close < 0) return fail(j, `value of attribute "${attrName}" is not closed.`)
      const value = s.slice(j + 1, close)
      if (value.includes('<')) return fail(j, `"<" is not allowed in the value of attribute "${attrName}".`)
      const amp = findBareAmpersand(value)
      if (amp >= 0) return fail(j + 1 + amp, `unescaped "&" in attribute "${attrName}"; write "&amp;".`)
      j = close + 1
    }

    if (!selfClosing) stack.push({ name, pos: i })
    i = j
  }

  if (stack.length > 0) {
    const open = stack[stack.length - 1]
    return fail(open.pos, `element <${open.name}> is never closed.`)
  }
  if (!rootSeen) return fail(n, 'the document has no root element.')
  return { ok: true }
}
