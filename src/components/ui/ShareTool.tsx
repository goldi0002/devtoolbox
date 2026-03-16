import { useState } from 'react'
import { buildShareUrl } from '../../lib/share'
import type { ToolDataShare } from '../../types/share'

interface ShareButtonProps {
  data: ToolDataShare
  size?: 'sm' | 'md'
  disabled?: boolean
}

export default function ShareButton({
  data,
  size = 'sm',
  disabled = false,
}: ShareButtonProps) {
  const [state, setState] = useState<'idle' | 'copied' | 'error'>('idle')

  const isEmpty = !data.output && !data.input

  const handleShare = async () => {
    if (disabled || isEmpty) return

    const shareUrl = buildShareUrl(data)

    // Native share sheet (mobile)
    if (navigator.share) {
      try {
        await navigator.share({ title: data.tool.name, url: shareUrl })
        return
      } catch {
        // User cancelled — fall through to clipboard
      }
    }

    // Clipboard fallback (desktop)
    try {
      await navigator.clipboard.writeText(shareUrl)
      setState('copied')
      setTimeout(() => setState('idle'), 2000)
    } catch {
      setState('error')
      setTimeout(() => setState('idle'), 2000)
    }
  }

  const sizeClasses = size === 'sm'
    ? 'px-2.5 py-1 text-xs gap-1.5'
    : 'px-3.5 py-1.5 text-sm gap-2'

  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'

  return (
    <button
      onClick={handleShare}
      disabled={disabled || isEmpty}
      title={
        state === 'copied' ? 'Link copied!' :
        state === 'error'  ? 'Copy failed'  :
        'Copy share link'
      }
      className={`
        btn-ghost font-mono flex items-center transition-all
        ${sizeClasses}
        ${disabled || isEmpty     ? 'opacity-40 cursor-not-allowed' : ''}
        ${state === 'copied' ? 'text-green-500' : ''}
        ${state === 'error'  ? 'text-red-500'   : ''}
      `}
    >
      {state === 'copied' && (
        <>
          <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Copied!
        </>
      )}

      {state === 'error' && (
        <>
          <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Failed
        </>
      )}

      {state === 'idle' && (
        <>
          <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342
                 m0 2.684a3 3 0 110-2.684
                 m0 2.684l6.632 3.316
                 m-6.632-6l6.632-3.316
                 m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684
                 zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share
        </>
      )}
    </button>
  )
}