import { useState } from 'react'
import { reportError } from '../utils/errors'

interface CopyButtonProps {
  text: string
  size?: 'sm' | 'md',
  disabled?: boolean
}

function copyWithExecCommand(text: string): boolean {
  const el = document.createElement('textarea')
  el.value = text
  document.body.appendChild(el)
  el.select()
  try {
    return document.execCommand('copy')
  } finally {
    document.body.removeChild(el)
  }
}

export default function CopyButton({ text, size = 'sm', disabled = false }: CopyButtonProps) {
  const [state, setState] = useState<'idle' | 'copied' | 'error'>('idle')

  const handleCopy = async () => {
    let succeeded = false
    try {
      await navigator.clipboard.writeText(text)
      succeeded = true
    } catch (clipboardError) {
      reportError('Clipboard API copy failed, falling back to execCommand', clipboardError)
      try {
        succeeded = copyWithExecCommand(text)
        if (!succeeded) reportError('Copy fallback rejected', new Error('document.execCommand("copy") returned false'))
      } catch (fallbackError) {
        reportError('Copy fallback failed', fallbackError)
      }
    }
    setState(succeeded ? 'copied' : 'error')
    setTimeout(() => setState('idle'), 2000)
  }

  const copied = state === 'copied'

  return (
    <button
      onClick={handleCopy}
      className={`font-mono transition-all duration-200 rounded border
        ${size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'}
        ${copied ? 'text-bright border-subtle bg-muted' : ''}
        ${state === 'error' ? 'text-red-400 border-red-400/40' : ''}
        ${state === 'idle' ? 'text-subtle border-transparent hover:border-muted hover:text-dim' : ''}`}
      aria-label="Copy to clipboard"
      title={state === 'error' ? 'Copy failed — copy the text manually' : 'Copy to clipboard'}
    >
      {state === 'copied' ? 'copied!' : state === 'error' ? 'copy failed' : 'copy'}
    </button>
  )
}
