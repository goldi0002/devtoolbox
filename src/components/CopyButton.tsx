import { useState } from 'react'
import { Copy, Check, AlertCircle } from 'lucide-react'
import { reportError } from '../utils/errors'

interface CopyButtonProps {
  text: string
  size?: 'sm' | 'md'
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
    if (disabled) return
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

  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={disabled}
      aria-live="polite"
      aria-label={state === 'copied' ? 'Copied to clipboard' : state === 'error' ? 'Copy failed' : 'Copy to clipboard'}
      title={state === 'error' ? 'Copy failed — copy the text manually' : 'Copy to clipboard'}
      className={`inline-flex items-center gap-1.5 font-mono transition-all duration-200 rounded border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent
        ${size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'}
        ${state === 'copied' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : ''}
        ${state === 'error' ? 'text-red-400 border-red-400/40 bg-red-500/10' : ''}
        ${state === 'idle' ? 'text-subtle border-transparent hover:border-muted hover:text-dim' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {state === 'copied' && <Check className={`${iconSize} text-emerald-400 shrink-0`} aria-hidden="true" />}
      {state === 'error' && <AlertCircle className={`${iconSize} text-red-400 shrink-0`} aria-hidden="true" />}
      {state === 'idle' && <Copy className={`${iconSize} shrink-0`} aria-hidden="true" />}
      <span>{state === 'copied' ? 'copied!' : state === 'error' ? 'copy failed' : 'copy'}</span>
    </button>
  )
}
