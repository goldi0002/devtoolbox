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

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
