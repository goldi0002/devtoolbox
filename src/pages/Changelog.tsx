import { usePageTitle } from '../hooks/usePageTitle'
import { SEO } from '../hooks/useSEO'
import { getStyledChangelogByMonth, formatMonth, getChangelog, CHANGE_TYPE_STYLES } from '../utils/changelog'
export default function Changelog() {
  usePageTitle('Changelog')
  const CHANGELOG = getChangelog()
  const grouped = getStyledChangelogByMonth()

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 animate-fade-in">
      <SEO
        title="Changelog"
        description="A running log of every tool added, improved, or fixed on ToolBox4Devs."
        slug="changelog"
      />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <section className="mb-20">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-px w-10 bg-border" />
          <span className="text-[10px] font-mono text-subtle tracking-[0.25em] uppercase">Changelog</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 items-end">
          <div>
            <h1 className="font-display text-[clamp(3rem,10vw,7rem)] text-bright leading-[0.9] mb-8 tracking-tight">
              WHAT'S<br />
              <span className="text-border" style={{ WebkitTextStroke: '1.5px #d4d4d4' }}>NEW</span>
              <span className="text-bright">.</span>
            </h1>
            <p className="text-dim font-sans text-base leading-relaxed max-w-lg">
              Every tool added, every improvement shipped, every bug squashed — logged here in order.
              This project is actively maintained.
            </p>
          </div>

          {/* Stats */}
          <div className="flex lg:flex-col gap-8 lg:gap-6 pb-2">
            {[
              { value: String(CHANGELOG.length).padStart(2, '0'), label: 'total entries' },
              { value: String(CHANGELOG.filter(e => e.type === 'new').length).padStart(2, '0'), label: 'new tools' },
              { value: String(CHANGELOG.filter(e => e.type === 'improved' || e.type === 'fixed').length).padStart(2, '0'), label: 'improvements' },
            ].map(s => (
              <div key={s.label} className="text-right">
                <div className="font-display text-3xl text-bright leading-none">{s.value}</div>
                <div className="text-[10px] font-mono text-subtle mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Legend ─────────────────────────────────────────────────────────── */}
      <div className="border-t border-border pt-8 pb-12 flex items-center gap-6">
        <span className="text-[10px] font-mono text-muted uppercase tracking-wider">Legend</span>
        {(['new', 'improved', 'fixed'] as const).map(t => (
          <span key={t} className={`text-[9px] font-mono border px-1.5 py-0.5 uppercase tracking-wider ${CHANGE_TYPE_STYLES[t]}`}>
            {t}
          </span>
        ))}
      </div>

      {/* ── Entries grouped by month ───────────────────────────────────────── */}
      <div className="space-y-16">
        {Array.from(grouped.entries()).map(([monthKey, entries]) => (
          <section key={monthKey}>
            {/* Month heading */}
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-[10px] font-mono text-subtle tracking-[0.2em] uppercase whitespace-nowrap">
                {formatMonth(monthKey)}
              </h2>
              <div className="h-px flex-1 bg-border" />
            </div>

            {/* Entries for this month */}
            <div className="divide-y divide-border">
              {entries.map(entry => (
                <div key={entry.title + entry.date} className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-4 py-5 first:pt-0">
                  {/* Date */}
                  <div className="pt-0.5">
                    <span className="text-[10px] font-mono text-muted tabular-nums">{entry.date}</span>
                  </div>

                  {/* Badge + content */}
                  <div>
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <span className={`text-[9px] font-mono border px-1.5 py-0.5 uppercase tracking-wider flex-shrink-0 ${entry.style}`}>
                        {entry.type}
                      </span>
                      <h3 className="text-sm font-mono text-bright">{entry.title}</h3>
                    </div>
                    <p className="text-xs font-sans text-subtle leading-relaxed">{entry.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* ── Bottom note ────────────────────────────────────────────────────── */}
      <div className="border-t border-border mt-16 pt-8">
        <p className="text-xs font-mono text-muted leading-relaxed">
          Have a tool you'd like to see added?{' '}
          <a
            href="mailto:suggest@toolbox4devs.com?subject=Tool%20suggestion%20for%20ToolBox4Devs"
            className="text-subtle hover:text-dim underline underline-offset-2 transition-colors"
          >
            Send a suggestion →
          </a>
        </p>
      </div>
    </main>
  )
}