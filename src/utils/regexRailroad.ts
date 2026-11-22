export type RegexAstNode =
  | { type: 'alternation'; branches: RegexAstNode[] }
  | { type: 'sequence'; elements: RegexAstNode[] }
  | { type: 'quantifier'; child: RegexAstNode; min: number; max: number | null; greedy: boolean; raw: string }
  | { type: 'group'; kind: 'capturing' | 'non-capturing' | 'lookahead' | 'neg-lookahead' | 'lookbehind' | 'neg-lookbehind'; name?: string; index?: number; child: RegexAstNode }
  | { type: 'charClass'; negated: boolean; raw: string; label: string }
  | { type: 'literal'; text: string }
  | { type: 'anchor'; raw: string; label: string }
  | { type: 'escape'; raw: string; label: string }
  | { type: 'any'; label: string }
  | { type: 'empty' }

export interface RegexTokenExplanation {
  token: string
  role: string
  description: string
}

export interface RailroadLayout {
  width: number
  height: number
  svgMarkup: string
}

const ESCAPE_DESCRIPTIONS: Record<string, string> = {
  d: 'Digit (0–9)',
  D: 'Non-digit',
  w: 'Word char (a–z, A–Z, 0–9, _)',
  W: 'Non-word char',
  s: 'Whitespace (space, tab, newline)',
  S: 'Non-whitespace',
  b: 'Word boundary',
  B: 'Non-word boundary',
  n: 'Newline (LF)',
  r: 'Carriage return (CR)',
  t: 'Tab character',
}

export function parseRegexToAst(pattern: string): RegexAstNode {
  let pos = 0
  let groupCount = 0

  function parseAlternation(): RegexAstNode {
    const branches: RegexAstNode[] = [parseSequence()]
    while (pos < pattern.length && pattern[pos] === '|') {
      pos++ // consume '|'
      branches.push(parseSequence())
    }
    return branches.length === 1 ? branches[0] : { type: 'alternation', branches }
  }

  function parseSequence(): RegexAstNode {
    const elements: RegexAstNode[] = []
    while (pos < pattern.length) {
      const ch = pattern[pos]
      if (ch === ')' || ch === '|') break
      const atom = parseAtom()
      const quantified = parseQuantifier(atom)
      // Merge consecutive literal single characters if neither is quantified
      const prev = elements[elements.length - 1]
      if (
        prev &&
        prev.type === 'literal' &&
        quantified.type === 'literal'
      ) {
        prev.text += quantified.text
      } else {
        elements.push(quantified)
      }
    }
    if (elements.length === 0) return { type: 'empty' }
    return elements.length === 1 ? elements[0] : { type: 'sequence', elements }
  }

  function parseAtom(): RegexAstNode {
    const ch = pattern[pos]

    if (ch === '^') {
      pos++
      return { type: 'anchor', raw: '^', label: 'Start of line/input' }
    }
    if (ch === '$') {
      pos++
      return { type: 'anchor', raw: '$', label: 'End of line/input' }
    }
    if (ch === '.') {
      pos++
      return { type: 'any', label: 'Any character' }
    }
    if (ch === '\\') {
      return parseEscape()
    }
    if (ch === '[') {
      return parseCharClass()
    }
    if (ch === '(') {
      return parseGroup()
    }

    pos++
    return { type: 'literal', text: ch }
  }

  function parseEscape(): RegexAstNode {
    pos++ // consume '\'
    if (pos >= pattern.length) {
      return { type: 'literal', text: '\\' }
    }
    const next = pattern[pos]
    pos++

    if (next === 'b' || next === 'B') {
      return { type: 'anchor', raw: `\\${next}`, label: ESCAPE_DESCRIPTIONS[next] }
    }
    if (ESCAPE_DESCRIPTIONS[next]) {
      return { type: 'escape', raw: `\\${next}`, label: ESCAPE_DESCRIPTIONS[next] }
    }
    if (next === 'x' && pos + 2 <= pattern.length) {
      const hex = pattern.slice(pos, pos + 2)
      if (/^[0-9a-fA-F]{2}$/.test(hex)) {
        pos += 2
        return { type: 'escape', raw: `\\x${hex}`, label: `Hex 0x${hex}` }
      }
    }
    if (next === 'u' && pos + 4 <= pattern.length) {
      const hex = pattern.slice(pos, pos + 4)
      if (/^[0-9a-fA-F]{4}$/.test(hex)) {
        pos += 4
        return { type: 'escape', raw: `\\u${hex}`, label: `Unicode U+${hex}` }
      }
    }
    if (/[1-9]/.test(next)) {
      return { type: 'escape', raw: `\\${next}`, label: `Backref #${next}` }
    }

    return { type: 'literal', text: next }
  }

  function parseCharClass(): RegexAstNode {
    const start = pos
    pos++ // consume '['
    const negated = pattern[pos] === '^'
    if (negated) pos++
    // Allow literal ']' as first char inside class
    if (pattern[pos] === ']') pos++

    while (pos < pattern.length) {
      if (pattern[pos] === '\\') {
        pos += 2
        continue
      }
      if (pattern[pos] === ']') {
        pos++
        break
      }
      pos++
    }
    const raw = pattern.slice(start, pos)
    const inner = raw.slice(negated ? 2 : 1, raw.endsWith(']') ? -1 : undefined)
    const label = negated ? `None of [${inner}]` : `One of [${inner}]`
    return { type: 'charClass', negated, raw, label }
  }

  function parseGroup(): RegexAstNode {
    pos++ // consume '('
    let kind: Extract<RegexAstNode, { type: 'group' }>['kind'] = 'capturing'
    let name: string | undefined
    let index: number | undefined

    if (pattern[pos] === '?') {
      if (pattern.slice(pos, pos + 2) === '?:') {
        kind = 'non-capturing'
        pos += 2
      } else if (pattern.slice(pos, pos + 2) === '?=') {
        kind = 'lookahead'
        pos += 2
      } else if (pattern.slice(pos, pos + 2) === '?!') {
        kind = 'neg-lookahead'
        pos += 2
      } else if (pattern.slice(pos, pos + 3) === '?<=') {
        kind = 'lookbehind'
        pos += 3
      } else if (pattern.slice(pos, pos + 3) === '?<!') {
        kind = 'neg-lookbehind'
        pos += 3
      } else if (pattern.slice(pos, pos + 2) === '?<') {
        const closeIdx = pattern.indexOf('>', pos + 2)
        if (closeIdx !== -1) {
          name = pattern.slice(pos + 2, closeIdx)
          pos = closeIdx + 1
          groupCount++
          index = groupCount
        }
      }
    } else {
      groupCount++
      index = groupCount
    }

    const child = parseAlternation()
    if (pattern[pos] === ')') pos++
    return { type: 'group', kind, name, index, child }
  }

  function parseQuantifier(atom: RegexAstNode): RegexAstNode {
    if (pos >= pattern.length) return atom
    if (atom.type === 'anchor') return atom

    const ch = pattern[pos]
    let min = 1
    let max: number | null = 1
    let raw = ''

    if (ch === '*') {
      min = 0
      max = null
      raw = '*'
      pos++
    } else if (ch === '+') {
      min = 1
      max = null
      raw = '+'
      pos++
    } else if (ch === '?') {
      min = 0
      max = 1
      raw = '?'
      pos++
    } else if (ch === '{') {
      const m = /^\{(\d+)(?:,(\d*))?\}/.exec(pattern.slice(pos))
      if (!m) return atom
      min = Number(m[1])
      max = m[2] === undefined ? min : m[2] === '' ? null : Number(m[2])
      raw = m[0]
      pos += m[0].length
    } else {
      return atom
    }

    let greedy = true
    if (pattern[pos] === '?') {
      greedy = false
      raw += '?'
      pos++
    }

    return { type: 'quantifier', child: atom, min, max, greedy, raw }
  }

  return parseAlternation()
}

export function explainRegexAst(node: RegexAstNode, out: RegexTokenExplanation[] = []): RegexTokenExplanation[] {
  switch (node.type) {
    case 'empty':
      return out
    case 'literal':
      out.push({ token: node.text, role: 'Literal', description: `Matches exact characters "${node.text}"` })
      return out
    case 'any':
      out.push({ token: '.', role: 'Wildcard', description: 'Matches any single character (except newline unless /s)' })
      return out
    case 'anchor':
      out.push({ token: node.raw, role: 'Anchor', description: node.label })
      return out
    case 'escape':
      out.push({ token: node.raw, role: 'Character Class', description: node.label })
      return out
    case 'charClass':
      out.push({
        token: node.raw,
        role: node.negated ? 'Negated Set' : 'Character Set',
        description: node.label,
      })
      return out
    case 'sequence':
      for (const el of node.elements) explainRegexAst(el, out)
      return out
    case 'alternation':
      node.branches.forEach((b, idx) => {
        if (idx > 0) {
          out.push({ token: '|', role: 'Alternation', description: 'OR — match either preceding or following branch' })
        }
        explainRegexAst(b, out)
      })
      return out
    case 'group': {
      const roleMap: Record<typeof node.kind, string> = {
        capturing: node.name ? `Named Group (?<${node.name}>)` : `Capturing Group #${node.index ?? ''}`,
        'non-capturing': 'Non-Capturing Group (?:)',
        lookahead: 'Positive Lookahead (?=)',
        'neg-lookahead': 'Negative Lookahead (?!)',
        lookbehind: 'Positive Lookbehind (?<=)',
        'neg-lookbehind': 'Negative Lookbehind (?<!)',
      }
      out.push({
        token: node.name ? `(?<${node.name}>...)` : '(...)',
        role: roleMap[node.kind],
        description: `Groups sub-expression (${roleMap[node.kind]})`,
      })
      explainRegexAst(node.child, out)
      return out
    }
    case 'quantifier': {
      explainRegexAst(node.child, out)
      const rangeDesc =
        node.min === 0 && node.max === 1
          ? 'Optional (0 or 1 times)'
          : node.min === 0 && node.max === null
            ? 'Zero or more times'
            : node.min === 1 && node.max === null
              ? 'One or more times'
              : node.max === null
                ? `At least ${node.min} times`
                : node.min === node.max
                  ? `Exactly ${node.min} times`
                  : `Between ${node.min} and ${node.max} times`
      out.push({
        token: node.raw,
        role: node.greedy ? 'Quantifier (Greedy)' : 'Quantifier (Lazy)',
        description: `${rangeDesc}${node.greedy ? '' : ', matching as few as possible'}`,
      })
      return out
    }
  }
}

// ── SVG Railroad Layout Engine ─────────────────────────────────────────────

interface DiagramBox {
  width: number
  height: number
  entryY: number
  render: (x: number, y: number) => string
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function measureLabelWidth(text: string, minW = 34): number {
  return Math.max(minW, Math.min(260, text.length * 7.6 + 20))
}

function truncateText(text: string, maxLen = 28): string {
  return text.length > maxLen ? `${text.slice(0, maxLen - 1)}…` : text
}

function makePillBox(text: string, fill: string, stroke: string, textColor: string, tag?: string): DiagramBox {
  const display = truncateText(text)
  const w = measureLabelWidth(display, 36)
  const h = tag ? 38 : 28
  const entryY = h / 2

  return {
    width: w,
    height: h,
    entryY,
    render: (x, y) => {
      const tagSvg = tag
        ? `<text x="${x + w / 2}" y="${y + 11}" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, monospace" font-size="8.5" fill="${textColor}" opacity="0.72">${escapeXml(tag)}</text>`
        : ''
      const textY = tag ? y + 26 : y + 18
      return `
        <g>
          <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7" fill="${fill}" stroke="${stroke}" stroke-width="1.35" />
          ${tagSvg}
          <text x="${x + w / 2}" y="${textY}" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, monospace" font-size="11.5" font-weight="600" fill="${textColor}">${escapeXml(display)}</text>
        </g>`
    },
  }
}

function buildBox(node: RegexAstNode): DiagramBox {
  switch (node.type) {
    case 'empty': {
      return {
        width: 24,
        height: 20,
        entryY: 10,
        render: (x, y) => `<line x1="${x}" y1="${y + 10}" x2="${x + 24}" y2="${y + 10}" stroke="#64748b" stroke-width="1.6" />`,
      }
    }

    case 'literal':
      return makePillBox(`"${node.text}"`, '#1e293b', '#6366f1', '#e2e8f0')

    case 'any':
      return makePillBox('any char', '#1e293b', '#0ea5e9', '#bae6fd', '.')

    case 'anchor':
      return makePillBox(node.raw, '#312e81', '#818cf8', '#e0e7ff', 'anchor')

    case 'escape':
      return makePillBox(node.label, '#0f172a', '#14b8a6', '#99f6e4', node.raw)

    case 'charClass':
      return makePillBox(
        truncateText(node.raw, 24),
        node.negated ? '#3b0764' : '#064e3b',
        node.negated ? '#c084fc' : '#10b981',
        node.negated ? '#f3e8ff' : '#d1fae5',
        node.negated ? 'exclude' : 'set'
      )

    case 'sequence': {
      const boxes = node.elements.map(buildBox)
      const gap = 14
      const width = boxes.reduce((sum, b) => sum + b.width, 0) + gap * Math.max(0, boxes.length - 1)
      const maxAbove = Math.max(...boxes.map(b => b.entryY))
      const maxBelow = Math.max(...boxes.map(b => b.height - b.entryY))
      const height = maxAbove + maxBelow
      const entryY = maxAbove

      return {
        width,
        height,
        entryY,
        render: (x, y) => {
          let cursor = x
          const parts: string[] = []
          boxes.forEach((b, idx) => {
            const boxY = y + (entryY - b.entryY)
            parts.push(b.render(cursor, boxY))
            if (idx < boxes.length - 1) {
              const lineY = y + entryY
              parts.push(
                `<line x1="${cursor + b.width}" y1="${lineY}" x2="${cursor + b.width + gap}" y2="${lineY}" stroke="#64748b" stroke-width="1.6" />`
              )
            }
            cursor += b.width + gap
          })
          return parts.join('\n')
        },
      }
    }

    case 'alternation': {
      const boxes = node.branches.map(buildBox)
      const padX = 20
      const branchGap = 12
      const maxW = Math.max(...boxes.map(b => b.width))
      const width = maxW + padX * 2
      const height = boxes.reduce((sum, b) => sum + b.height, 0) + branchGap * (boxes.length - 1)
      const entryY = height / 2

      return {
        width,
        height,
        entryY,
        render: (x, y) => {
          const parts: string[] = []
          let cursorY = y
          const mainY = y + entryY
          const leftX = x
          const rightX = x + width

          boxes.forEach(b => {
            const bx = x + (width - b.width) / 2
            const by = cursorY
            const bLineY = by + b.entryY

            // Left rail into branch
            parts.push(
              `<path d="M ${leftX} ${mainY} C ${leftX + 10} ${mainY}, ${leftX + 10} ${bLineY}, ${bx} ${bLineY}" fill="none" stroke="#64748b" stroke-width="1.5" />`
            )
            parts.push(b.render(bx, by))
            // Right rail out of branch
            parts.push(
              `<path d="M ${bx + b.width} ${bLineY} C ${rightX - 10} ${bLineY}, ${rightX - 10} ${mainY}, ${rightX} ${mainY}" fill="none" stroke="#64748b" stroke-width="1.5" />`
            )

            cursorY += b.height + branchGap
          })

          return parts.join('\n')
        },
      }
    }

    case 'group': {
      const inner = buildBox(node.child)
      const padX = 12
      const padTop = 18
      const padBottom = 10
      const label =
        node.kind === 'capturing'
          ? node.name
            ? `group #${node.index} <${node.name}>`
            : `group #${node.index ?? ''}`
          : node.kind === 'non-capturing'
            ? 'non-capturing'
            : node.kind === 'lookahead'
              ? 'lookahead (?=)'
              : node.kind === 'neg-lookahead'
                ? 'neg lookahead (?!)'
                : node.kind === 'lookbehind'
                  ? 'lookbehind (?<=)'
                  : 'neg lookbehind (?<!)'

      const minLabelW = measureLabelWidth(label, 60)
      const width = Math.max(inner.width + padX * 2, minLabelW)
      const height = inner.height + padTop + padBottom
      const entryY = padTop + inner.entryY

      return {
        width,
        height,
        entryY,
        render: (x, y) => {
          const innerX = x + (width - inner.width) / 2
          const innerY = y + padTop
          const lineY = y + entryY
          return `
            <g>
              <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="9" fill="rgba(99,102,241,0.06)" stroke="#475569" stroke-dasharray="4 3" stroke-width="1.2" />
              <text x="${x + 8}" y="${y + 12}" font-family="ui-monospace, SFMono-Regular, monospace" font-size="9.5" fill="#94a3b8">${escapeXml(label)}</text>
              <line x1="${x}" y1="${lineY}" x2="${innerX}" y2="${lineY}" stroke="#64748b" stroke-width="1.5" />
              ${inner.render(innerX, innerY)}
              <line x1="${innerX + inner.width}" y1="${lineY}" x2="${x + width}" y2="${lineY}" stroke="#64748b" stroke-width="1.5" />
            </g>`
        },
      }
    }

    case 'quantifier': {
      const inner = buildBox(node.child)
      const hasBypass = node.min === 0
      const hasLoop = node.max === null || node.max > 1
      const padX = 18
      const topBypass = hasBypass ? 20 : 0
      const bottomLoop = hasLoop ? 24 : 0
      const width = inner.width + padX * 2
      const height = inner.height + topBypass + bottomLoop
      const entryY = topBypass + inner.entryY
      const loopLabel =
        node.max === null
          ? node.min === 0
            ? '0+ times'
            : node.min === 1
              ? '1+ times'
              : `${node.min}+ times`
          : node.min === 0 && node.max === 1
            ? 'optional'
            : `${node.min}..${node.max}x`

      return {
        width,
        height,
        entryY,
        render: (x, y) => {
          const parts: string[] = []
          const innerX = x + padX
          const innerY = y + topBypass
          const lineY = y + entryY

          parts.push(`<line x1="${x}" y1="${lineY}" x2="${innerX}" y2="${lineY}" stroke="#64748b" stroke-width="1.6" />`)
          parts.push(inner.render(innerX, innerY))
          parts.push(`<line x1="${innerX + inner.width}" y1="${lineY}" x2="${x + width}" y2="${lineY}" stroke="#64748b" stroke-width="1.6" />`)

          if (hasBypass) {
            const bypassY = y + 8
            parts.push(
              `<path d="M ${x + 4} ${lineY} Q ${x + 8} ${bypassY}, ${x + 16} ${bypassY} L ${x + width - 16} ${bypassY} Q ${x + width - 8} ${bypassY}, ${x + width - 4} ${lineY}" fill="none" stroke="#94a3b8" stroke-width="1.35" stroke-dasharray="3 2" />`
            )
          }

          if (hasLoop) {
            const loopY = y + topBypass + inner.height + 12
            parts.push(
              `<path d="M ${innerX + inner.width + 6} ${lineY} Q ${innerX + inner.width + 12} ${loopY}, ${innerX + inner.width} ${loopY} L ${innerX} ${loopY} Q ${innerX - 12} ${loopY}, ${innerX - 6} ${lineY}" fill="none" stroke="#f59e0b" stroke-width="1.4" />`
            )
            parts.push(
              `<text x="${x + width / 2}" y="${loopY + 10}" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, monospace" font-size="9" fill="#fbbf24">${escapeXml(loopLabel)}${node.greedy ? '' : ' (lazy)'}</text>`
            )
          }

          return parts.join('\n')
        },
      }
    }
  }
}

export function renderRegexRailroadSvg(pattern: string): RailroadLayout {
  if (!pattern) {
    return {
      width: 240,
      height: 70,
      svgMarkup: `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="70" viewBox="0 0 240 70"><text x="120" y="38" text-anchor="middle" font-family="ui-monospace, monospace" font-size="12" fill="#94a3b8">Enter a regex pattern</text></svg>`,
    }
  }

  const ast = parseRegexToAst(pattern)
  const box = buildBox(ast)
  const marginX = 28
  const marginY = 20
  const width = Math.max(220, box.width + marginX * 2)
  const height = Math.max(80, box.height + marginY * 2)
  const lineY = marginY + box.entryY

  const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect x="0" y="0" width="${width}" height="${height}" rx="10" fill="#0b1120" />
  <circle cx="14" cy="${lineY}" r="4.5" fill="#10b981" />
  <line x1="18.5" y1="${lineY}" x2="${marginX}" y2="${lineY}" stroke="#64748b" stroke-width="1.6" />
  ${box.render(marginX, marginY)}
  <line x1="${marginX + box.width}" y1="${lineY}" x2="${width - 18.5}" y2="${lineY}" stroke="#64748b" stroke-width="1.6" />
  <circle cx="${width - 14}" cy="${lineY}" r="4.5" fill="none" stroke="#6366f1" stroke-width="2" />
</svg>`

  return { width, height, svgMarkup }
}
