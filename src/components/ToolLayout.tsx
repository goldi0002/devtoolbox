interface ToolLayoutProps {
  title: string
  description: string
  tag: string
  children: React.ReactNode
}

export default function ToolLayout({ title, description, tag, children }: ToolLayoutProps) {
  return (
    <div className="border border-border rounded-lg overflow-hidden animate-fade-in">
      <div className="border-b border-border px-5 py-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="tag">{tag}</span>
          </div>
          <h2 className="text-bright font-sans font-medium text-base">{title}</h2>
        </div>
        <p className="hidden sm:block text-dim text-xs font-sans max-w-xs text-right leading-relaxed">{description}</p>
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  )
}
