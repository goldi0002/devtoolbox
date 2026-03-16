interface ToolLayoutProps {
  title: string
  description: string
  tag: string
  children: React.ReactNode
}

export default function ToolLayout({ title, description, tag, children }: ToolLayoutProps) {
  return (
    <div className="border border-border rounded-lg overflow-hidden animate-fade-in">
      <div className="border-b border-border px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="tag">{tag}</span>
          </div>
          <h2 className="text-bright font-sans font-medium text-lg">{title}</h2>
        </div>
        <p className="hidden sm:block text-dim text-xs font-sans max-w-sm text-right leading-relaxed">
          {description}
        </p>
      </div>
      {/* ✅ more padding, no overflow clipping the split panel */}
      <div className="p-6 sm:p-8">
        {children}
      </div>
    </div>
  )
}