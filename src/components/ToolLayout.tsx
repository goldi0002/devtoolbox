interface ToolLayoutProps {
  title: string
  description: string
  tag: string
  children: React.ReactNode
}

export default function ToolLayout({ title, description, tag, children }: ToolLayoutProps) {
  return (
    <section className="rounded-lg border border-border bg-surface/40 shadow-soft overflow-hidden animate-fade-in">
      <header className="relative border-b border-border px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-accent/60" />
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="tag">{tag}</span>
          </div>
          <h2 className="text-bright font-sans font-semibold text-lg">{title}</h2>
        </div>
        <p className="hidden sm:block text-dim text-xs font-sans max-w-sm text-right leading-relaxed">
          {description}
        </p>
      </header>
      <div className="bg-bg p-6 sm:p-8">
        {children}
      </div>
    </section>
  )
}
