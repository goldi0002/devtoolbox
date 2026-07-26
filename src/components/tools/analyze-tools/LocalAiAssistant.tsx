import { useMemo, useState } from 'react'
import ToolLayout from '../../ToolLayout'
import CopyButton from '../../CopyButton'
import TextAreaField from '../../ui/TextAreaField'

const SAMPLE_TEXT = `Ship the updated onboarding flow this week. The current signup experience is confusing for mobile users and causes too many drop-offs after email verification. We should simplify the CTA copy, reduce the number of required fields, and clarify what happens after account creation. The support team also wants a short checklist they can send to customers. Please review analytics, summarize the main issues, and list the next actions before Friday.`

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'to', 'of', 'for', 'in', 'on', 'at', 'by', 'with', 'is', 'are', 'was', 'were', 'be', 'been', 'it', 'this', 'that', 'as', 'from', 'we', 'you', 'they', 'he', 'she', 'i', 'our', 'your', 'their', 'will', 'would', 'should', 'can', 'could', 'what', 'after', 'before', 'too'
])

const POSITIVE_WORDS = ['clear', 'improve', 'faster', 'better', 'success', 'good', 'ship', 'helpful', 'ready']
const NEGATIVE_WORDS = ['confusing', 'drop-offs', 'issue', 'issues', 'problem', 'slow', 'blocked', 'risk', 'error']

function splitSentences(text: string) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map(sentence => sentence.trim())
    .filter(Boolean)
}

function tokenize(text: string) {
  return text
    .toLowerCase()
    .match(/[a-z0-9'-]+/g) ?? []
}

function titleCase(value: string) {
  return value.replace(/\b\w/g, (char) => char.toUpperCase())
}

function analyzeText(text: string) {
  const sentences = splitSentences(text)
  const words = tokenize(text).filter(word => !STOP_WORDS.has(word) && word.length > 2)
  const frequency = words.reduce<Record<string, number>>((acc, word) => {
    acc[word] = (acc[word] ?? 0) + 1
    return acc
  }, {})

  const rankedSentences = sentences
    .map((sentence) => ({
      sentence,
      score: tokenize(sentence).reduce((total, word) => total + (frequency[word] ?? 0), 0),
    }))
    .sort((a, b) => b.score - a.score)

  const summary = rankedSentences.slice(0, 3).map(item => item.sentence)
  const keywords = Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([word]) => titleCase(word))

  const actionItems = sentences.filter(sentence => /\b(should|need to|please|review|ship|create|send|update|fix|list)\b/i.test(sentence))
  const positive = tokenize(text).filter(word => POSITIVE_WORDS.includes(word)).length
  const negative = tokenize(text).filter(word => NEGATIVE_WORDS.includes(word)).length

  let sentiment = 'Neutral'
  if (positive > negative) sentiment = 'Mostly positive'
  if (negative > positive) sentiment = 'Mostly negative'

  return {
    summary,
    keywords,
    actionItems: actionItems.slice(0, 5),
    sentiment,
    sentenceCount: sentences.length,
    keywordCount: Object.keys(frequency).length,
  }
}

export default function LocalAiAssistant() {
  const [input, setInput] = useState(SAMPLE_TEXT)
  const result = useMemo(() => analyzeText(input), [input])

  return (
    <ToolLayout
      title="Local AI Text Assistant"
      description="Generate a lightweight summary, keywords, action items, and sentiment hints fully in JavaScript with no API calls"
      tag="ai"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2 items-center">
          <button className="btn-ghost" onClick={() => setInput(SAMPLE_TEXT)}>Load sample</button>
          <button className="btn-primary ml-auto" onClick={() => setInput('')}>Clear</button>
        </div>

        <div>
          <TextAreaField
            label="Text to analyze"
            value={input}
            onChange={setInput}
            className="input-base min-h-[220px] w-full"
            placeholder="Paste meeting notes, support messages, a draft brief, or product feedback here"
          />
          <p className="text-[11px] font-mono text-subtle mt-2">
            Local-only heuristic analysis — this simulates an AI helper without any external API.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="border border-border rounded p-4 bg-surface">
            <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-subtle mb-2">Sentences</div>
            <p className="text-2xl font-display text-bright">{result.sentenceCount}</p>
          </div>
          <div className="border border-border rounded p-4 bg-surface">
            <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-subtle mb-2">Keywords</div>
            <p className="text-2xl font-display text-bright">{result.keywordCount}</p>
          </div>
          <div className="border border-border rounded p-4 bg-surface md:col-span-2">
            <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-subtle mb-2">Sentiment hint</div>
            <p className="text-sm font-sans text-bright">{result.sentiment}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="border border-border rounded p-4 bg-surface">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-subtle">Summary</div>
              <CopyButton text={result.summary.join('\n')} />
            </div>
            <ul className="space-y-2">
              {result.summary.length > 0 ? result.summary.map((sentence, index) => (
                <li key={`${sentence}-${index}`} className="text-sm font-sans text-dim leading-relaxed">• {sentence}</li>
              )) : <li className="text-sm font-sans text-subtle">Add some text to generate a summary.</li>}
            </ul>
          </div>

          <div className="border border-border rounded p-4 bg-surface">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-subtle">Action items</div>
              <CopyButton text={result.actionItems.join('\n')} />
            </div>
            <ul className="space-y-2">
              {result.actionItems.length > 0 ? result.actionItems.map((sentence, index) => (
                <li key={`${sentence}-${index}`} className="text-sm font-sans text-dim leading-relaxed">→ {sentence}</li>
              )) : <li className="text-sm font-sans text-subtle">No clear action-oriented lines detected yet.</li>}
            </ul>
          </div>
        </div>

        <div className="border border-border rounded p-4 bg-surface">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-subtle">Top keywords</div>
            <CopyButton text={result.keywords.join(', ')} />
          </div>
          <div className="flex flex-wrap gap-2">
            {result.keywords.length > 0 ? result.keywords.map((keyword) => (
              <span key={keyword} className="tag">{keyword}</span>
            )) : <span className="text-sm font-sans text-subtle">Keywords will appear here.</span>}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
