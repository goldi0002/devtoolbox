import { useState, useMemo } from 'react'
import SectionPanel from '../../ui/SectionPanel'
import TextAreaField from '../../ui/TextAreaField'
import TextInputField from '../../ui/TextInputField'
import OutputPanel from '../../ui/OutputPanel'
import StatCard from '../../ui/StatCard'
import {
  Code2,
  Eye,
  Settings2,
  RotateCcw,
  Sparkles,
  Layers,
  FileCode,
  Sun,
  Moon,
  Info
} from 'lucide-react'

const SAMPLE_SVGS = [
  {
    name: 'Shield Icon',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  <path d="m9 12 2 2 4-4"/>
</svg>`
  },
  {
    name: 'Bell Notification',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
</svg>`
  },
  {
    name: 'Gradient Logo Emblem',
    svg: `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="paint0_linear" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
      <stop stop-color="#38BDF8"/>
      <stop offset="1" stop-color="#818CF8"/>
    </linearGradient>
  </defs>
  <rect width="48" height="48" rx="12" fill="url(#paint0_linear)"/>
  <path d="M14 24L22 32L34 16" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
  }
]

const SVG_ATTR_MAP: Record<string, string> = {
  'class': 'className',
  'for': 'htmlFor',
  'tabindex': 'tabIndex',
  'stroke-width': 'strokeWidth',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
  'stroke-miterlimit': 'strokeMiterlimit',
  'stroke-dasharray': 'strokeDasharray',
  'stroke-dashoffset': 'strokeDashoffset',
  'stroke-opacity': 'strokeOpacity',
  'fill-rule': 'fillRule',
  'fill-opacity': 'fillOpacity',
  'clip-rule': 'clipRule',
  'clip-path': 'clipPath',
  'stop-color': 'stopColor',
  'stop-opacity': 'stopOpacity',
  'font-family': 'fontFamily',
  'font-size': 'fontSize',
  'font-weight': 'fontWeight',
  'text-anchor': 'textAnchor',
  'dominant-baseline': 'dominantBaseline',
  'alignment-baseline': 'alignmentBaseline',
  'baseline-shift': 'baselineShift',
  'color-interpolation-filters': 'colorInterpolationFilters',
  'flood-color': 'floodColor',
  'flood-opacity': 'floodOpacity',
  'lighting-color': 'lightingColor',
  'xmlns:xlink': 'xmlnsXlink',
  'xlink:href': 'xlinkHref',
  'xml:space': 'xmlSpace',
  'gradientunits': 'gradientUnits',
  'gradienttransform': 'gradientTransform',
  'patternunits': 'patternUnits',
  'patterntransform': 'patternTransform',
  'patterncontentunits': 'patternContentUnits',
  'spreadmethod': 'spreadMethod',
  'viewbox': 'viewBox',
  'preserveaspectratio': 'preserveAspectRatio'
}

function parseStyleString(styleStr: string): string {
  const rules = styleStr.split(';').filter(r => r.trim().length > 0)
  const objEntries: string[] = []

  rules.forEach(rule => {
    const colonIdx = rule.indexOf(':')
    if (colonIdx === -1) return
    const key = rule.substring(0, colonIdx).trim()
    const val = rule.substring(colonIdx + 1).trim()
    const camelKey = key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
    objEntries.push(`${camelKey}: '${val.replace(/'/g, "\\'")}'`)
  })

  return `{{ ${objEntries.join(', ')} }}`
}

function serializeSvgElement(
  node: Element,
  options: {
    useForwardRef: boolean
    replaceColorsWithCurrentColor: boolean
    removeDimensions: boolean
    spreadProps: boolean
  },
  depth: number = 2
): string {
  const indent = '  '.repeat(depth)
  const tagName = node.tagName.toLowerCase()
  const attributes: string[] = []

  // If root svg element and spreading props
  if (tagName === 'svg' && options.spreadProps) {
    if (options.useForwardRef) {
      attributes.push('ref={ref}')
    }
    attributes.push('{...props}')
  }

  Array.from(node.attributes).forEach(attr => {
    const lowerName = attr.name.toLowerCase()
    let val = attr.value

    // Skip dimensions if enabled
    if (tagName === 'svg' && options.removeDimensions && (lowerName === 'width' || lowerName === 'height')) {
      return
    }

    // Color replacement
    if (options.replaceColorsWithCurrentColor) {
      if (lowerName === 'stroke' && val !== 'none') {
        val = 'currentColor'
      }
      if (lowerName === 'fill' && val !== 'none' && !val.startsWith('url(')) {
        val = 'currentColor'
      }
    }

    // Style attribute
    if (lowerName === 'style') {
      attributes.push(`style=${parseStyleString(val)}`)
      return
    }

    const mappedName = SVG_ATTR_MAP[lowerName] || SVG_ATTR_MAP[attr.name] || attr.name

    // Value format
    if (val === '') {
      attributes.push(mappedName)
    } else {
      attributes.push(`${mappedName}="${val.replace(/"/g, '&quot;')}"`)
    }
  })

  const children = Array.from(node.children)
  const textContent = node.childNodes.length === 1 && node.childNodes[0].nodeType === Node.TEXT_NODE
    ? node.textContent?.trim()
    : ''

  const attrString = attributes.length > 0 ? ' ' + attributes.join(' ') : ''

  if (children.length === 0 && !textContent) {
    return `${indent}<${tagName}${attrString} />`
  }

  if (children.length === 0 && textContent) {
    return `${indent}<${tagName}${attrString}>${textContent}</${tagName}>`
  }

  const childMarkup = children.map(c => serializeSvgElement(c, options, depth + 1)).join('\n')
  return `${indent}<${tagName}${attrString}>\n${childMarkup}\n${indent}</${tagName}>`
}

function convertSvgToJsx(
  rawSvg: string,
  options: {
    componentName: string
    isTypeScript: boolean
    useForwardRef: boolean
    useMemo: boolean
    replaceColorsWithCurrentColor: boolean
    removeDimensions: boolean
    spreadProps: boolean
  }
): { jsx: string; error?: string } {
  const cleanInput = rawSvg
    .replace(/<\?xml.*?\?>/gi, '')
    .replace(/<!DOCTYPE.*?>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim()

  if (!cleanInput) {
    return { jsx: '' }
  }

  if (typeof DOMParser === 'undefined') {
    return { jsx: cleanInput }
  }

  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(cleanInput, 'image/svg+xml')
    const parserError = doc.querySelector('parsererror')
    if (parserError) {
      return { jsx: '', error: 'Invalid SVG markup: ' + (parserError.textContent || 'XML Parsing error') }
    }

    const svgElement = doc.querySelector('svg')
    if (!svgElement) {
      return { jsx: '', error: 'No root <svg> element found in the input.' }
    }

    const transformedSvgMarkup = serializeSvgElement(svgElement, options, 2)

    // Build the full component wrapper
    const compName = options.componentName.replace(/[^a-zA-Z0-9]/g, '') || 'Icon'
    const imports: string[] = []

    if (options.useForwardRef || options.useMemo) {
      const hooks: string[] = []
      if (options.useForwardRef) hooks.push('forwardRef')
      if (options.useMemo) hooks.push('memo')
      if (options.isTypeScript) {
        imports.push(`import { ${hooks.join(', ')}, type SVGProps, type Ref } from 'react'`)
      } else {
        imports.push(`import { ${hooks.join(', ')} } from 'react'`)
      }
    } else {
      if (options.isTypeScript) {
        imports.push(`import type { SVGProps } from 'react'`)
      } else {
        imports.push(`import React from 'react'`)
      }
    }

    const typeDef = options.isTypeScript
      ? `\nexport interface ${compName}Props extends SVGProps<SVGSVGElement> {\n  size?: number | string\n}\n`
      : ''

    let compBody = ''

    if (options.useForwardRef) {
      if (options.isTypeScript) {
        compBody = `const ${compName} = forwardRef<SVGSVGElement, ${compName}Props>(function ${compName}(props, ref) {\n  return (\n${transformedSvgMarkup}\n  )\n})`
      } else {
        compBody = `const ${compName} = forwardRef(function ${compName}(props, ref) {\n  return (\n${transformedSvgMarkup}\n  )\n})`
      }
    } else {
      if (options.isTypeScript) {
        compBody = `export function ${compName}(props: ${compName}Props) {\n  return (\n${transformedSvgMarkup}\n  )\n}`
      } else {
        compBody = `export function ${compName}(props) {\n  return (\n${transformedSvgMarkup}\n  )\n}`
      }
    }

    let finalExport = ''
    if (options.useMemo) {
      finalExport = `\n\nexport default memo(${compName})`
    } else if (options.useForwardRef) {
      finalExport = `\n\nexport default ${compName}`
    }

    const fullCode = [
      imports.join('\n'),
      typeDef.trim(),
      compBody,
      finalExport.trim()
    ]
      .filter(Boolean)
      .join('\n\n')

    return { jsx: fullCode }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    return { jsx: '', error: 'SVG Transform error: ' + errorMsg }
  }
}

export default function SvgToJsx() {
  const [svgInput, setSvgInput] = useState(SAMPLE_SVGS[0].svg)
  const [componentName, setComponentName] = useState('ShieldCheckIcon')
  const [isTypeScript, setIsTypeScript] = useState(true)
  const [useForwardRef, setUseForwardRef] = useState(true)
  const [wrapWithMemo, setWrapWithMemo] = useState(false)
  const [replaceColors, setReplaceColors] = useState(false)
  const [removeDimensions, setRemoveDimensions] = useState(false)
  const [spreadProps, setSpreadProps] = useState(true)
  const [previewBgDark, setPreviewBgDark] = useState(true)

  const { jsx: outputJsx, error } = useMemo(() => {
    return convertSvgToJsx(svgInput, {
      componentName,
      isTypeScript,
      useForwardRef,
      useMemo: wrapWithMemo,
      replaceColorsWithCurrentColor: replaceColors,
      removeDimensions,
      spreadProps
    })
  }, [
    svgInput,
    componentName,
    isTypeScript,
    useForwardRef,
    wrapWithMemo,
    replaceColors,
    removeDimensions,
    spreadProps
  ])

  return (
    <div className="space-y-6">
      {/* Preset Buttons Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-border bg-surface/30">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-subtle uppercase tracking-wider font-semibold mr-1">
            Samples:
          </span>
          {SAMPLE_SVGS.map(sample => (
            <button
              key={sample.name}
              onClick={() => {
                setSvgInput(sample.svg)
                setComponentName(sample.name.replace(/[^a-zA-Z0-9]/g, '') + 'Icon')
              }}
              className="text-xs font-mono px-2.5 py-1 rounded-md border border-border bg-surface/60 hover:border-subtle hover:text-bright text-dim transition-colors"
            >
              {sample.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <TextInputField
            label="Component Name"
            value={componentName}
            onChange={setComponentName}
            placeholder="CustomIcon"
            containerClassName="w-48"
          />
        </div>
      </div>

      {/* Conversion Options Bar */}
      <div className="p-4 rounded-xl border border-border bg-surface/20 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono">
        <label className="flex items-center gap-2 cursor-pointer text-dim hover:text-bright select-none">
          <input
            type="checkbox"
            checked={isTypeScript}
            onChange={e => setIsTypeScript(e.target.checked)}
            className="rounded border-border text-accent focus:ring-accent"
          />
          <span>TypeScript (TSX)</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer text-dim hover:text-bright select-none">
          <input
            type="checkbox"
            checked={useForwardRef}
            onChange={e => setUseForwardRef(e.target.checked)}
            className="rounded border-border text-accent focus:ring-accent"
          />
          <span>forwardRef</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer text-dim hover:text-bright select-none">
          <input
            type="checkbox"
            checked={wrapWithMemo}
            onChange={e => setWrapWithMemo(e.target.checked)}
            className="rounded border-border text-accent focus:ring-accent"
          />
          <span>React.memo</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer text-dim hover:text-bright select-none">
          <input
            type="checkbox"
            checked={replaceColors}
            onChange={e => setReplaceColors(e.target.checked)}
            className="rounded border-border text-accent focus:ring-accent"
          />
          <span>currentColor</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer text-dim hover:text-bright select-none">
          <input
            type="checkbox"
            checked={removeDimensions}
            onChange={e => setRemoveDimensions(e.target.checked)}
            className="rounded border-border text-accent focus:ring-accent"
          />
          <span>Remove w/h</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer text-dim hover:text-bright select-none">
          <input
            type="checkbox"
            checked={spreadProps}
            onChange={e => setSpreadProps(e.target.checked)}
            className="rounded border-border text-accent focus:ring-accent"
          />
          <span>{'{...props}'}</span>
        </label>
      </div>

      {/* Main Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Raw SVG Input & Preview */}
        <div className="space-y-4">
          <SectionPanel
            title="Raw SVG Markup"
            action={
              <button
                onClick={() => setSvgInput('')}
                className="text-xs font-mono text-muted hover:text-bright flex items-center gap-1 transition-colors"
              >
                <RotateCcw size={12} />
                Clear
              </button>
            }
          >
            <TextAreaField
              label="Input SVG Code"
              value={svgInput}
              onChange={setSvgInput}
              placeholder="Paste <svg>...</svg> markup here..."
              rows={9}
            />
          </SectionPanel>

          {/* Live SVG Visual Preview */}
          <div className="p-4 rounded-xl border border-border bg-surface/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-bright">
                <Eye size={14} className="text-accent" />
                <span>Live SVG Preview</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewBgDark(d => !d)}
                  className="text-xs font-mono px-2 py-1 rounded border border-border bg-surface text-dim hover:text-bright flex items-center gap-1.5"
                  title="Toggle preview contrast"
                >
                  {previewBgDark ? <Sun size={12} /> : <Moon size={12} />}
                  <span>{previewBgDark ? 'Light Bg' : 'Dark Bg'}</span>
                </button>
              </div>
            </div>

            <div
              className={`w-full min-h-[140px] rounded-lg border border-border flex items-center justify-center p-6 transition-colors ${
                previewBgDark ? 'bg-[#0f172a] text-white' : 'bg-[#f8fafc] text-[#0f172a]'
              }`}
              dangerouslySetInnerHTML={{ __html: svgInput }}
            />
          </div>
        </div>

        {/* Right Column: React JSX Component */}
        <div className="space-y-4">
          <SectionPanel title={`Generated ${isTypeScript ? 'TSX' : 'JSX'} Component`}>
            <OutputPanel
              label="React Component"
              value={outputJsx}
              error={error}
              language={isTypeScript ? 'typescript' : 'javascript'}
              heightClass="min-h-[380px]"
              placeholder="React component will be generated here..."
            />
          </SectionPanel>
        </div>
      </div>
    </div>
  )
}
