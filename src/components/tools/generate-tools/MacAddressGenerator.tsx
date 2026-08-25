import React, { useState, useCallback } from 'react'
import SectionPanel from '../../ui/SectionPanel'
import TextInputField from '../../ui/TextInputField'
import ToggleGroup from '../../ui/ToggleGroup'
import OutputPanel from '../../ui/OutputPanel'

const FORMATS = [
  { value: 'colon', label: 'Colon (XX:XX:XX:XX:XX:XX)' },
  { value: 'hyphen', label: 'Hyphen (XX-XX-XX-XX-XX-XX)' },
  { value: 'dot', label: 'Dot (XXXX.XXXX.XXXX)' },
  { value: 'none', label: 'None (XXXXXXXXXXXX)' }
]

export default function MacAddressGenerator() {
  const [count, setCount] = useState('5')
  const [format, setFormat] = useState('colon')
  const [uppercase, setUppercase] = useState(true)
  const [generated, setGenerated] = useState<string[]>([])

  const generate = useCallback(() => {
    const num = Math.min(Math.max(parseInt(count, 10) || 1, 1), 1000)
    const results: string[] = []

    for (let i = 0; i < num; i++) {
      const bytes = Array.from({ length: 6 }, () => Math.floor(Math.random() * 256))
      
      // set locally administered bit, clear multicast bit for a valid random unicast MAC
      bytes[0] = (bytes[0] | 0x02) & 0xFE

      const hexBytes = bytes.map(b => b.toString(16).padStart(2, '0'))
      
      let mac = ''
      if (format === 'colon') {
        mac = hexBytes.join(':')
      } else if (format === 'hyphen') {
        mac = hexBytes.join('-')
      } else if (format === 'dot') {
        mac = `${hexBytes[0]}${hexBytes[1]}.${hexBytes[2]}${hexBytes[3]}.${hexBytes[4]}${hexBytes[5]}`
      } else {
        mac = hexBytes.join('')
      }

      results.push(uppercase ? mac.toUpperCase() : mac.toLowerCase())
    }

    setGenerated(results)
  }, [count, format, uppercase])

  return (
    <div className="space-y-6">
      <SectionPanel title="Configuration">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInputField
            label="Number of Addresses (max 1000)"
            value={count}
            onChange={setCount}
            type="number"
            min="1"
            max="1000"
          />
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-subtle">Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="input-base w-full"
            >
              {FORMATS.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 mt-4 md:col-span-2">
            <label className="flex items-center gap-2 text-sm text-main cursor-pointer">
              <input
                type="checkbox"
                checked={uppercase}
                onChange={(e) => setUppercase(e.target.checked)}
                className="rounded border-border"
              />
              Uppercase
            </label>
          </div>
        </div>

        <div className="mt-4">
          <button onClick={generate} className="btn-primary">Generate MAC Addresses</button>
        </div>
      </SectionPanel>

      {generated.length > 0 && (
        <OutputPanel
          content={generated.join('\n')}
          language="text"
          label={`${generated.length} MAC Addresses`}
        />
      )}
    </div>
  )
}
