import React, { useState, useMemo } from 'react'
import SectionPanel from '../../ui/SectionPanel'
import TextInputField from '../../ui/TextInputField'
import OutputPanel from '../../ui/OutputPanel'

export default function SvgPlaceholderGenerator() {
  const [width, setWidth] = useState('800')
  const [height, setHeight] = useState('600')
  const [text, setText] = useState('800 x 600')
  const [bgColor, setBgColor] = useState('#cccccc')
  const [textColor, setTextColor] = useState('#666666')
  const [fontSize, setFontSize] = useState('48')

  const svgCode = useMemo(() => {
    const w = parseInt(width, 10) || 800
    const h = parseInt(height, 10) || 600
    const fSize = parseInt(fontSize, 10) || 48
    
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect fill="${bgColor}" width="${w}" height="${h}"/>
  <text fill="${textColor}" font-family="sans-serif" font-size="${fSize}" dy="0.35em" font-weight="bold" x="50%" y="50%" text-anchor="middle">${text || `${w} x ${h}`}</text>
</svg>`
  }, [width, height, text, bgColor, textColor, fontSize])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionPanel title="Configuration">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <TextInputField label="Width (px)" value={width} onChange={setWidth} type="number" />
              <TextInputField label="Height (px)" value={height} onChange={setHeight} type="number" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-subtle mb-1.5">Background Color</label>
                <div className="flex gap-2">
                  <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-9 w-12 p-0.5 border border-border rounded" />
                  <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="input-base flex-1" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-subtle mb-1.5">Text Color</label>
                <div className="flex gap-2">
                  <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="h-9 w-12 p-0.5 border border-border rounded" />
                  <input type="text" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="input-base flex-1" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <TextInputField label="Custom Text" value={text} onChange={setText} placeholder="Default is dimensions" />
              <TextInputField label="Font Size" value={fontSize} onChange={setFontSize} type="number" />
            </div>
          </div>
        </SectionPanel>

        <SectionPanel title="Preview">
          <div className="flex items-center justify-center p-4 bg-checkerboard border border-border rounded overflow-hidden" style={{ minHeight: '300px' }}>
            <div dangerouslySetInnerHTML={{ __html: svgCode }} style={{ maxWidth: '100%', maxHeight: '100%' }} />
          </div>
        </SectionPanel>
      </div>

      <OutputPanel value={svgCode} language="xml" label="SVG Code" />
    </div>
  )
}
