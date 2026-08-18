import React, { useState } from 'react'
import ToolLayout from '../../ToolLayout'
import CodeBlock from '../../CodeBlock'
import ErrorBanner from '../../ui/ErrorBanner'

export default function HexConverter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'text-to-hex' | 'hex-to-text'>('text-to-hex')

  const process = (m: 'text-to-hex' | 'hex-to-text') => {
    setMode(m)
    setError('')
    
    if (!input) {
      setOutput('')
      return
    }

    try {
      if (m === 'text-to-hex') {
        const encoder = new TextEncoder()
        const bytes = encoder.encode(input)
        const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(' ')
        setOutput(hex)
      } else {
        const hexClean = input.replace(/\s+/g, '')
        if (hexClean.length % 2 !== 0) {
          throw new Error('Invalid hexadecimal string: length must be even')
        }
        if (!/^[0-9a-fA-F]*$/.test(hexClean)) {
          throw new Error('Invalid hexadecimal string: contains non-hex characters')
        }

        const bytes = new Uint8Array(hexClean.length / 2)
        for (let i = 0; i < hexClean.length; i += 2) {
          bytes[i / 2] = parseInt(hexClean.substring(i, i + 2), 16)
        }
        
        const decoder = new TextDecoder()
        setOutput(decoder.decode(bytes))
      }
    } catch (e: any) {
      setError(e.message || 'Failed to process conversion')
      setOutput('')
    }
  }

  const handleInputChange = (val: string) => {
    setInput(val)
    if (val.trim() === '') {
      setOutput('')
      setError('')
    }
  }

  return (
    <ToolLayout
      title="Hex Converter"
      description="Convert text to hexadecimal and hexadecimal back to text"
      tag="encode"
    >
      <div className="space-y-4">
        <div className="flex gap-2 items-center">
          <button onClick={() => process('text-to-hex')} className={`btn-${mode === 'text-to-hex' ? 'primary' : 'ghost'}`}>Text to Hex</button>
          <button onClick={() => process('hex-to-text')} className={`btn-${mode === 'hex-to-text' ? 'primary' : 'ghost'}`}>Hex to Text</button>
          <button onClick={() => { setInput(''); setOutput(''); setError(''); }} className="btn-ghost ml-auto">Clear</button>
        </div>

        <div>
          <label className="block text-xs text-dim font-mono mb-1.5">{mode === 'text-to-hex' ? 'Text Input' : 'Hex Input'}</label>
          <CodeBlock
            code={input}
            language="text"
            label="Input"
            maxHeight="300px"
            minHeight="150px"
            isForInput={true}
            readOnly={false}
            onChange={handleInputChange}
          />
        </div>

        <ErrorBanner message={error} />

        {output && (
          <div>
            <label className="block text-xs text-dim font-mono mb-1.5">{mode === 'text-to-hex' ? 'Hex Output' : 'Text Output'}</label>
            <CodeBlock
              code={output}
              language="text"
              label="Output"
              maxHeight="300px"
              minHeight="150px"
            />
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
