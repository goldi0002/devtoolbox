// ── Types ──────────────────────────────────────────────────────────────────
export type ChangeLogType = 'new' | 'improved' | 'fixed'

export type ChangeLogEntry = {
    type: ChangeLogType
    title: string
    description: string
    date: string   // 'YYYY-MM-DD'
}

export type StyledChangeLogEntry = ChangeLogEntry & {
    style: string
}

// ── Data ───────────────────────────────────────────────────────────────────
// Keep newest first.
const CHANGELOG: ChangeLogEntry[] = [
    {
        type: 'new',
        title: 'Slug Generator + Lorem Ipsum Generator',
        description: 'Added two more fully client-side tools for generating clean slugs and placeholder copy directly in the browser.',
        date: '2026-03-18',
    },
    {
        type: 'new',
        title: 'Markdown Preview',
        description: 'Launched a live Markdown previewer that renders headings, lists, tables, blockquotes, and generated HTML fully client-side.',
        date: '2026-03-18',
    },
    {
        type: 'new',
        title: 'Case Converter + Timestamp Converter',
        description: 'Added two new fully client-side utilities for converting text casing and translating Unix timestamps into readable dates.',
        date: '2026-03-18',
    },
    {
        type: 'new',
        title: 'Privacy Page',
        description: "Added a dedicated privacy page clearly explaining what data is — and isn't — collected.",
        date: '2026-03-12',
    },
    {
        type: 'new',
        title: 'Initial Launch',
        description: 'ToolBox4Devs launched with a curated list of essential tools for developers.',
        date: '2026-03-09',
    }
]

// ── Style map ──────────────────────────────────────────────────────────────
export const CHANGE_TYPE_STYLES: Record<ChangeLogType, string> = {
    new: 'text-bright border-bright',
    improved: 'text-dim    border-dim',
    fixed: 'text-muted  border-muted',
}

// ── Internal helpers ───────────────────────────────────────────────────────
function addStyle(entries: ChangeLogEntry[]): StyledChangeLogEntry[] {
    return entries.map(entry => ({ ...entry, style: CHANGE_TYPE_STYLES[entry.type] }))
}

function groupByMonth(entries: ChangeLogEntry[]): Map<string, ChangeLogEntry[]> {
    const map = new Map<string, ChangeLogEntry[]>()
    for (const entry of entries) {
        const key = entry.date.slice(0, 7) // 'YYYY-MM'
        if (!map.has(key)) map.set(key, [])
        map.get(key)!.push(entry)
    }
    return map
}

export function formatMonth(yyyyMM: string): string {
    const [y, m] = yyyyMM.split('-')
    return new Date(Number(y), Number(m) - 1).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
    })
}

// ── Public API ─────────────────────────────────────────────────────────────

/** All entries, newest first, no style attached. */
export function getChangelog(): ChangeLogEntry[] {
    return CHANGELOG
}

/** All entries with their Tailwind style string attached. */
export function getStyledChangelog(): StyledChangeLogEntry[] {
    return addStyle(CHANGELOG)
}

/** Entries grouped by 'YYYY-MM', each group unstyled. */
export function getChangelogByMonth(): Map<string, ChangeLogEntry[]> {
    return groupByMonth(CHANGELOG)
}

/** Entries grouped by 'YYYY-MM', each group styled. */
export function getStyledChangelogByMonth(): Map<string, StyledChangeLogEntry[]> {
    const grouped = groupByMonth(CHANGELOG)
    const styled = new Map<string, StyledChangeLogEntry[]>()
    grouped.forEach((entries, key) => styled.set(key, addStyle(entries)))
    return styled
}

/** Only entries of a specific type. */
export function getChangelogByType(type: ChangeLogType): ChangeLogEntry[] {
    return CHANGELOG.filter(e => e.type === type)
}

/** The N most recent entries — useful for homepage preview. */
export function getRecentChangelog(limit = 3): StyledChangeLogEntry[] {
    return addStyle(CHANGELOG.slice(0, limit))
}

/** Summary counts — useful for the changelog page header stats. */
export function getChangelogStats() {
    return {
        total: CHANGELOG.length,
        new: CHANGELOG.filter(e => e.type === 'new').length,
        improved: CHANGELOG.filter(e => e.type === 'improved').length,
        fixed: CHANGELOG.filter(e => e.type === 'fixed').length,
    }
}