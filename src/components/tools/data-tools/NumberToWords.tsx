import { useMemo, useState } from 'react'
import ToolLayout from '../../ToolLayout'
import OutputPanel from '../../ui/OutputPanel'
import StatCard from '../../ui/StatCard'
import TextInputField from '../../ui/TextInputField'
import { numberToWords } from '../../../utils/numberToWords'

export default function NumberToWords() {
  const [input, setInput] = useState('1234567')

  const { words, error } = useMemo(() => {
    if (!input.trim()) return { words: '', error: '' }
    try {
      return { words: numberToWords(input), error: '' }
    } catch (err) {
      return { words: '', error: (err as Error).message }
    }
  }, [input])

  const capitalized = words ? words.charAt(0).toUpperCase() + words.slice(1) : ''

  return (
    <ToolLayout
      title="Number to Words Converter"
      description="Convert numbers into English words — supports decimals, negatives, and values up to 999 trillion"
      tag="data"
    >
      <div className="space-y-5">
        <TextInputField
          label="Number"
          value={input}
          onChange={setInput}
          placeholder="Enter a number, e.g. 1234.56"
        />

        <OutputPanel
          label="English words"
          value={capitalized}
          error={error}
          placeholder="The number spelled out in words will appear here..."
          heightClass="min-h-[100px]"
          surface="surface"
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
          <StatCard label="Input length" value={`${input.length} chars`} />
          <StatCard label="Word count" value={words ? words.split(' ').length : 0} />
          <StatCard label="Has decimal" value={input.includes('.') ? 'Yes' : 'No'} />
        </div>
      </div>
    </ToolLayout>
  )
}
