// ── Categories ────────────────────────────────────────────────────────────
export type ToolCategory =
    | 'json-tools'
    | 'encode-tools'
    | 'text-tools'
    | 'generate-tools'
    | 'auth-tools'
    | 'web-tools'
    | 'data-tools'
    | 'crypto-tools'
    | 'analyze-tools'

// ── Status ────────────────────────────────────────────────────────────────
export type ToolStatus =
    | 'stable'       // fully working, default
    | 'beta'         // working but may have rough edges
    | 'coming-soon'  // not yet available
    | 'deprecated'   // kept for reference, no longer maintained


// ── Complexity hint — helps users find quick tools vs deep tools ──────────
export type ToolComplexity =
    | 'simple'    // single input → single output (e.g. Base64)
    | 'moderate'  // some options / config (e.g. JSON formatter)
    | 'advanced'  // multi-step or expert-level (e.g. JWT debugger)


export interface ToolSEO {
    /** Overrides the default "<name> — ToolBox4Devs" page title if set */
    title?: string
    /** Short description for <meta name="description"> — max ~155 chars */
    description?: string
    /** Extra keywords beyond tool.keywords */
    extraKeywords?: string[]
    /** Alias for extraKeywords */
    keywords?: string[]
}

export interface ToolAbout {
    summary: string
    useCases: string[]
    features: string[]
    tip?: string,
    notes?: string[],
}


export interface ToolGuideStep {
    name: string
    text: string
}

export interface ToolGuideFaq {
    question: string
    answer: string
}

export interface ToolGuideExample {
    /** Short label for what the example shows, e.g. "Decode a query string" */
    title: string
    input: string
    output: string
    inputLabel?: string
    outputLabel?: string
}

/**
 * Tool-specific page content. When present it replaces the generic how-to
 * steps and most of the generic FAQs on the tool page, so each page carries
 * text that is true only of that tool.
 */
export interface ToolGuide {
    steps?: ToolGuideStep[]
    faqs?: ToolGuideFaq[]
    example?: ToolGuideExample
}

export interface ToolMeta {
    slug: string
    name: string
    description: string
    about: ToolAbout
    guide?: ToolGuide
    category: ToolCategory
    tag: string
    keywords: string[],
    icon?: string,
    seo?: ToolSEO,
    status?: ToolStatus,
    eta?: string, // e.g. "Q2 2025"
    complexity?: ToolComplexity,
    featured?: boolean, // whether to show on homepage featured section
    isNew?: boolean, // whether to show "New" badge on tool cards
    addedAt?: string, // ISO date string for when the tool was added (used to determine "New" status if isNew not set)
    updatedAt?: string, // ISO date string for when the tool was updated/improved
    toolComponent?: React.ComponentType,
}