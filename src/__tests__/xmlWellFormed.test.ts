import { describe, expect, it } from 'vitest'
import { checkXmlWellFormed } from '../utils/xmlWellFormed'

const isOk = (src: string) => checkXmlWellFormed(src).ok

const errorOf = (src: string) => {
  const r = checkXmlWellFormed(src)
  if (r.ok) throw new Error(`expected malformed XML to be rejected: ${src}`)
  return r
}

describe('checkXmlWellFormed: valid XML', () => {
  it.each([
    ['simple element', '<root/>'],
    ['nested elements with text', '<root><item id="1"><name>Apple</name></item></root>'],
    ['XML declaration and whitespace', '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n  <a>1</a>\n</root>\n'],
    ['comments before and inside the root', '<!-- top --><root><!-- inner --><a/></root><!-- tail -->'],
    ['CDATA containing markup', '<root><![CDATA[<b>not & markup</b> ]]></root>'],
    ['processing instruction inside root', '<root><?php echo 1; ?><a/></root>'],
    ['DOCTYPE without internal subset', '<!DOCTYPE note SYSTEM "note.dtd"><note/>'],
    ['DOCTYPE with internal subset containing ">"', '<!DOCTYPE r [<!ENTITY e "a>b">]><r>&e;</r>'],
    ['self-closing tags with and without space', '<root><a/><b /><c attr="x"/></root>'],
    ['attribute value containing ">" in double quotes', '<root><a title="x > y">t</a></root>'],
    ['attribute value containing ">" in single quotes', "<root><a title='x > y'>t</a></root>"],
    ['attribute value containing the other quote', `<root><a title="it's">t</a></root>`],
    ['attribute with escaped entities', '<root><a v="&lt;&amp;&#65;&#x42;"/></root>'],
    ['namespaces and prefixed names', '<soap:Envelope xmlns:soap="http://x"><soap:Body/></soap:Envelope>'],
    ['names with dots, dashes and digits', '<a-b.c_1><d2/></a-b.c_1>'],
    ['text containing ">" and single "]"', '<root>a > b ] c</root>'],
    ['text with entity references', '<root>Tom &amp; Jerry &lt;3 &#169;</root>'],
    ['multi-line attribute value and CRLF line endings', '<root\r\n  a="1\r\n2">\r\n</root>\r\n'],
    ['BOM before the declaration', '﻿<?xml version="1.0"?><root/>'],
    ['comment after the root element', '<root/><!-- done -->\n'],
  ])('accepts %s', (_name, src) => {
    expect(isOk(src)).toBe(true)
  })
})

describe('checkXmlWellFormed: mismatched, unclosed and stray tags', () => {
  it('reports a mismatched closing tag with both names and the opening line', () => {
    const r = errorOf('<root>\n  <item>\n  </items>\n</root>')
    expect(r.message).toContain('</items>')
    expect(r.message).toContain('<item>')
    expect(r.message).toContain('opened on line 2')
    expect(r.line).toBe(3)
    expect(r.column).toBe(3)
  })

  it('reports an element that is never closed, at its opening tag', () => {
    const r = errorOf('<root>\n  <item>\n    <name>A</name>\n')
    expect(r.message).toContain('<item> is never closed')
    expect(r.line).toBe(2)
    expect(r.column).toBe(3)
  })

  it('reports a stray closing tag with no open element', () => {
    const r = errorOf('<root></root></extra>')
    expect(r.message).toContain('</extra> has no matching opening tag')
    expect(r.line).toBe(1)
    expect(r.column).toBe(14)
  })

  it('reports a stray closing tag at the start of the document', () => {
    expect(errorOf('</root>').message).toContain('</root> has no matching opening tag')
  })

  it('reports a closing tag that is missing its ">"', () => {
    expect(errorOf('<a></a').message).toContain('expected ">" to end closing tag </a>')
  })

  it('reports an unclosed start tag at end of input', () => {
    expect(errorOf('<root><a').message).toContain('start tag <a> is not closed')
  })

  it('reports nested mismatch in the innermost element', () => {
    expect(errorOf('<a><b></a></b>').message).toContain('</a> does not match <b>')
  })
})

describe('checkXmlWellFormed: document structure', () => {
  it('rejects a second root element', () => {
    expect(errorOf('<a/><b/>').message).toContain('after the root element has closed')
  })

  it('rejects non-whitespace text after the root element', () => {
    expect(errorOf('<a/>oops').message).toContain('text is not allowed outside the root element')
  })

  it('rejects text before the root element', () => {
    expect(errorOf('hello <a/>').message).toContain('text is not allowed outside the root element')
  })

  it('rejects a document with no root element', () => {
    expect(errorOf('<!-- only a comment -->').message).toContain('no root element')
  })

  it('rejects a DOCTYPE after the root element', () => {
    expect(errorOf('<a/><!DOCTYPE a>').message).toContain('DOCTYPE must come before the root element')
  })
})

describe('checkXmlWellFormed: comments, CDATA and processing instructions', () => {
  it('rejects an unclosed comment', () => {
    expect(errorOf('<root><!-- oops </root>').message).toContain('comment is not closed')
  })

  it('rejects "--" inside a comment', () => {
    expect(errorOf('<root><!-- a -- b --></root>').message).toContain('comments cannot contain "--"')
  })

  it('rejects a comment ending in "-"', () => {
    expect(errorOf('<root><!-- a ---></root>').message).toContain('comments cannot contain "--"')
  })

  it('rejects an unclosed CDATA section', () => {
    expect(errorOf('<root><![CDATA[ text </root>').message).toContain('CDATA section is not closed')
  })

  it('rejects CDATA outside the root element', () => {
    expect(errorOf('<![CDATA[x]]><root/>').message).toContain('CDATA section is outside the root element')
  })

  it('rejects an unclosed processing instruction', () => {
    expect(errorOf('<?xml version="1.0"<root/>').message).toContain('processing instruction is not closed')
  })
})

describe('checkXmlWellFormed: attributes and characters', () => {
  it('rejects an unquoted attribute value', () => {
    expect(errorOf('<a b=1/>').message).toContain('value of attribute "b" must be in quotes')
  })

  it('rejects an attribute with no value', () => {
    expect(errorOf('<a checked/>').message).toContain('attribute "checked" has no value')
  })

  it('rejects a duplicate attribute', () => {
    expect(errorOf('<a x="1" x="2"/>').message).toContain('duplicate attribute "x"')
  })

  it('rejects attributes without whitespace between them', () => {
    expect(errorOf('<a x="1"y="2"/>').message).toContain('expected whitespace before the next attribute')
  })

  it('rejects an unclosed attribute value', () => {
    expect(errorOf('<a x="1/>').message).toContain('value of attribute "x" is not closed')
  })

  it('rejects "<" inside an attribute value', () => {
    expect(errorOf('<a x="a<b"/>').message).toContain('"<" is not allowed in the value of attribute "x"')
  })

  it('rejects a bare "&" in text', () => {
    const r = errorOf('<root>Tom & Jerry</root>')
    expect(r.message).toContain('unescaped "&" in text')
    expect(r.column).toBe(11)
  })

  it('rejects a bare "&" in an attribute value', () => {
    expect(errorOf('<a x="a&b"/>').message).toContain('unescaped "&" in attribute "x"')
  })

  it('rejects a literal "]]>" in text', () => {
    expect(errorOf('<root>a]]>b</root>').message).toContain('literal "]]>" is not allowed')
  })

  it('rejects a bare "<" that does not start a tag', () => {
    expect(errorOf('<root>1 < 2</root>').message).toContain('write "&lt;" for a literal "<"')
  })

  it('rejects an element name that starts with a digit', () => {
    expect(errorOf('<1a/>').message).toContain('write "&lt;" for a literal "<"')
  })
})

describe('checkXmlWellFormed: positions', () => {
  it('counts lines and columns from 1 across newlines', () => {
    const r = errorOf('<a>\n\n   <b>\n   </c>\n</a>')
    expect(r.line).toBe(4)
    expect(r.column).toBe(4)
  })

  it('prefixes the message with the position', () => {
    expect(errorOf('<a></b>').message.startsWith('Malformed XML at line 1, column 4:')).toBe(true)
  })
})
