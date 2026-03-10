import { useState } from 'react'

interface CopyButtonProps {
  text: string
  size?: 'sm' | 'md'
}

export default function CopyButton({ text, size = 'sm' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={`font-mono transition-all duration-200 rounded border
        ${size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'}
        ${copied
          ? 'text-bright border-subtle bg-muted'
          : 'text-subtle border-transparent hover:border-muted hover:text-dim'
        }`}
      aria-label="Copy to clipboard"
    >
      {copied ? 'copied!' : 'copy'}
    </button>
  )
}
