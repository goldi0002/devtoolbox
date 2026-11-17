import { describe, it, expect } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import FileDropzone from '../components/ui/FileDropzone'

describe('FileDropzone markup', () => {
  it('attaches the visible label to the hidden file input and keeps the zone keyboard-reachable', () => {
    const html = renderToStaticMarkup(
      createElement(FileDropzone, {
        label: 'Images',
        accept: 'image/*',
        multiple: true,
        hint: 'Up to 5 MB each.',
        onFiles: () => {},
      })
    )

    const forId = /<label[^>]*for="([^"]+)"[^>]*>Images<\/label>/.exec(html)?.[1]
    expect(forId).toBeTruthy()
    expect(html).toMatch(new RegExp(`<input[^>]*id="${escapeRegExp(forId!)}"[^>]*type="file"`))
    expect(html).toMatch(/<input[^>]*type="file"[^>]*accept="image\/\*"[^>]*multiple=""/)

    const zone = /<div[^>]*role="button"[^>]*>/.exec(html)?.[0] ?? ''
    expect(zone).toContain('tabindex="0"')
    expect(zone).not.toContain('aria-label')

    expect(html).toContain('Files are read in your browser and never uploaded.')
    expect(html).toContain('Up to 5 MB each.')
  })
})

describe('FileDropzone compact variant', () => {
  it('renders one button-sized zone whose text is the label, with the input labelled by aria-label', () => {
    const html = renderToStaticMarkup(
      createElement(FileDropzone, {
        label: 'Upload CSV',
        accept: '.csv',
        variant: 'compact',
        className: 'px-3 py-2 bg-indigo-600',
        onFiles: () => {},
      })
    )

    const inputTag = /<input[^>]*>/.exec(html)?.[0] ?? ''
    expect(inputTag).toContain('type="file"')
    expect(inputTag).toContain('aria-label="Upload CSV"')
    expect(inputTag).toContain('accept=".csv"')
    expect(inputTag).toContain('aria-hidden="true"')
    expect(html).not.toMatch(/<label/)
    expect(html).not.toContain('border-dashed')

    const zone = /<div[^>]*role="button"[^>]*>/.exec(html)?.[0] ?? ''
    expect(zone).toContain('tabindex="0"')
    expect(zone).toContain('px-3 py-2 bg-indigo-600')
    expect(zone).toContain('focus-visible:ring-accent')
    expect(html).toContain('<span>Upload CSV</span>')
  })

  it('hides the icon when showIcon is false and shows the selected file name instead of the label', () => {
    const html = renderToStaticMarkup(
      createElement(FileDropzone, {
        label: 'Browse',
        variant: 'compact',
        showIcon: false,
        selectedName: 'data.csv',
        onFiles: () => {},
      })
    )

    expect(html).not.toContain('<svg')
    expect(html).toContain('<span>data.csv</span>')
    expect(html).not.toContain('<span>Browse</span>')
  })

  it('puts the disabled state on the zone and removes it from the tab order', () => {
    const html = renderToStaticMarkup(
      createElement(FileDropzone, { label: 'Upload', variant: 'compact', disabled: true, onFiles: () => {} })
    )
    const zone = /<div[^>]*role="button"[^>]*>/.exec(html)?.[0] ?? ''
    expect(zone).toContain('tabindex="-1"')
    expect(zone).toContain('aria-disabled="true"')
    expect(zone).toContain('cursor-not-allowed')
  })
})

describe('FileDropzone composition props', () => {
  it('replaces the default helper line with a custom description', () => {
    const html = renderToStaticMarkup(
      createElement(FileDropzone, {
        label: 'Data file',
        description: 'Supports massive CSV files.',
        onFiles: () => {},
      })
    )
    expect(html).toContain('Supports massive CSV files.')
    expect(html).not.toContain('Files are read in your browser and never uploaded.')
  })

  it('keeps the default helper line when no description is given', () => {
    const html = renderToStaticMarkup(createElement(FileDropzone, { label: 'Images', onFiles: () => {} }))
    expect(html).toContain('Files are read in your browser and never uploaded.')
  })

  it('renders children after the clickable zone, never inside it, so nested buttons stay valid', () => {
    const html = renderToStaticMarkup(
      createElement(
        FileDropzone,
        { label: 'Data file', onFiles: () => {} },
        createElement('button', { type: 'button' }, 'Load Demo Data')
      )
    )

    const zoneEnd = html.indexOf('</div>', html.indexOf('Click or press Enter'))
    const buttonAt = html.indexOf('Load Demo Data')
    expect(html.indexOf('role="button"')).toBeGreaterThan(-1)
    expect(buttonAt).toBeGreaterThan(zoneEnd)
  })

  it('keeps the default zone free of extra classes when className is not passed', () => {
    const html = renderToStaticMarkup(createElement(FileDropzone, { label: 'Images', onFiles: () => {} }))
    const zone = /<div[^>]*role="button"[^>]*class="([^"]*)"/.exec(html)?.[1] ?? ''
    expect(zone.endsWith('cursor-pointer')).toBe(true)
  })
})

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
