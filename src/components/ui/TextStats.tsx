import { countWords } from '../../utils/text'

interface TextStatsProps {
  value: string
  /** Overrides the default whitespace-based word count. */
  wordCount?: number
}

export default function TextStats({ value, wordCount }: TextStatsProps) {
  return (
    <div className="mt-2 flex gap-4 text-[10px] font-mono text-subtle">
      <span>{value.length} chars</span>
      <span>{wordCount ?? countWords(value)} words</span>
    </div>
  )
}
