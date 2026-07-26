interface ErrorBannerProps {
  message: string
}

export default function ErrorBanner({ message }: ErrorBannerProps) {
  if (!message) return null

  return (
    <div className="text-xs font-mono text-dim bg-surface border border-border rounded px-3 py-2">
      ⚠ {message}
    </div>
  )
}
