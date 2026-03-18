import { useMemo, useState } from 'react'
import ToolLayout from '../../ToolLayout'
import CopyButton from '../../CopyButton'

const WORDS = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur'.split(' ')

function createWords(count: number, offset = 0): string[] {
  return Array.from({ length: count }, (_, index) => WORDS[(index + offset) % WORDS.length])
}

function createSentences(sentenceCount: number, wordsPerSentence: number): string {
  return Array.from({ length: sentenceCount }, (_, sentenceIndex) => {
    const words = createWords(wordsPerSentence, sentenceIndex * 3).map((word, wordIndex) => {
      if (sentenceIndex === 0 && wordIndex === 0) return 'lorem'
      return word
    })
    const sentence = words.join(' ')
    return sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.'
  }).join(' ')
}

function createParagraphs(paragraphCount: number, sentencesPerParagraph: number, wordsPerSentence: number): string {
  return Array.from({ length: paragraphCount }, () => createSentences(sentencesPerParagraph, wordsPerSentence)).join('\n\n')
}

export default function LoremIpsumGenerator() {
  const [paragraphs, setParagraphs] = useState(3)
  const [sentences, setSentences] = useState(4)
  const [words, setWords] = useState(12)

  const output = useMemo(
    () => createParagraphs(paragraphs, sentences, words),
    [paragraphs, sentences, words]
  )

  const estimatedChars = output.length
  const estimatedWords = output ? output.split(/\s+/).length : 0

  return (
    <ToolLayout
      title="Lorem Ipsum Generator"
      description="Generate placeholder copy instantly for UI mockups, layouts, and content tests"
      tag="generate"
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-dim font-mono mb-1.5">Paragraphs</label>
              <input type="range" min={1} max={10} value={paragraphs} onChange={e => setParagraphs(Number(e.target.value))} className="w-full" />
              <div className="mt-1 text-[10px] font-mono text-subtle">{paragraphs} paragraph{paragraphs !== 1 ? 's' : ''}</div>
            </div>
            <div>
              <label className="block text-xs text-dim font-mono mb-1.5">Sentences per paragraph</label>
              <input type="range" min={2} max={8} value={sentences} onChange={e => setSentences(Number(e.target.value))} className="w-full" />
              <div className="mt-1 text-[10px] font-mono text-subtle">{sentences} sentence{sentences !== 1 ? 's' : ''}</div>
            </div>
            <div>
              <label className="block text-xs text-dim font-mono mb-1.5">Words per sentence</label>
              <input type="range" min={4} max={20} value={words} onChange={e => setWords(Number(e.target.value))} className="w-full" />
              <div className="mt-1 text-[10px] font-mono text-subtle">{words} word{words !== 1 ? 's' : ''}</div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="border border-border rounded px-3 py-2">
                <div className="text-subtle mb-1">Words</div>
                <div className="text-bright">{estimatedWords}</div>
              </div>
              <div className="border border-border rounded px-3 py-2">
                <div className="text-subtle mb-1">Chars</div>
                <div className="text-bright">{estimatedChars}</div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-dim font-mono">Generated copy</label>
              <CopyButton text={output} />
            </div>
            <textarea
              value={output}
              readOnly
              className="textarea-base h-72"
              spellCheck={false}
            />
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
