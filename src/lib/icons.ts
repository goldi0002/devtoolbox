import type { ToolCategory } from '../tools/tool-meta'
import {
  // JSON & Data
  Braces,
  FileJson,
  Boxes,
  Table,
  FolderTree,
  BarChart3,
  Database,
  TableProperties,
  FileSpreadsheet,
  // Crypto & Security
  Fingerprint,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Shield,
  Key,
  Lock,
  FileCheck2,
  // Web & Network
  Globe,
  Palette,
  Code2,
  Server,
  FileCode,
  Keyboard,
  Scaling,
  Eye,
  Network,
  // Text & String
  FileText,
  Binary,
  Code,
  CaseUpper,
  Regex,
  Link2,
  ArrowDownAZ,
  CopyCheck,
  FileTerminal,
  Percent,
  // Generators & AI
  Sparkles,
  Hash,
  QrCode,
  ScanLine,
  Scan,
  Bot,
  Dice5,
  GitBranch,
  Cpu,
  Image,
  Pilcrow,
  // DevOps & Workflow
  Workflow,
  Container,
  Clock,
  GitCompare,
  Hourglass,
  SpellCheck,
  Wrench,
  type LucideIcon,
} from 'lucide-react'

// ── Direct Named Icon Registry ──────────────────────────────────────────────
export const ICON_MAP: Record<string, LucideIcon> = {
  Braces,
  FileJson,
  Boxes,
  Table,
  FolderTree,
  BarChart3,
  Database,
  TableProperties,
  FileSpreadsheet,
  Fingerprint,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Shield,
  Key,
  Lock,
  FileCheck2,
  Globe,
  Palette,
  Code2,
  Server,
  FileCode,
  Keyboard,
  Scaling,
  Eye,
  Network,
  FileText,
  Binary,
  Code,
  CaseUpper,
  Regex,
  Link2,
  ArrowDownAZ,
  CopyCheck,
  FileTerminal,
  Percent,
  Sparkles,
  Hash,
  QrCode,
  ScanLine,
  Scan,
  Bot,
  Dice5,
  GitBranch,
  Cpu,
  Image,
  Pilcrow,
  Workflow,
  Container,
  Clock,
  GitCompare,
  Hourglass,
  SpellCheck,
  Wrench,
}

// ── Slug to Icon Mapping (Covers all 73 tools in ToolBox4Devs) ───────────────
export const SLUG_ICON_MAP: Record<string, LucideIcon> = {
  // JSON Tools
  'json-formatter': Braces,
  'json-model': FileJson,
  'json-to-zod': Boxes,
  'json-schema-generator': FileJson,
  'json-to-sql': FileSpreadsheet,
  'json-to-csv': Table,
  'json-tree-view': FolderTree,
  'json-table-view': TableProperties,
  'json-stats': BarChart3,

  // Encode / Decode Tools
  'base-64': Binary,
  'base64': Binary,
  'url-encoder': Percent,
  'html-entity': Code,
  'hex-converter': Binary,
  'hash-comparator': CopyCheck,
  'string-escaper': FileTerminal,

  // Text Tools
  'text-diff': FileText,
  'case-converter': CaseUpper,
  'regex': Regex,
  'slug-generator': Link2,
  'csv-to-markdown': Table,
  'line-sorter': ArrowDownAZ,
  'text-repeater': CopyCheck,
  'word-counter': FileText,

  // Generators
  'uuid': Hash,
  'password-generator': KeyRound,
  'ai-token-counter': Bot,
  'bulk-qr-generator': QrCode,
  'qr-code-generator': QrCode,
  'qr-code-scanner': ScanLine,
  'faker-data-generator': Dice5,
  'gitignore-generator': GitBranch,
  'mac-address-generator': Cpu,
  'svg-placeholder-generator': Image,
  'lorem-ipsum-generator': Pilcrow,

  // Authentication & Security
  'jwt': KeyRound,
  'jwt-decoder': KeyRound,
  'jwt-encoder': KeyRound,
  'basic-auth-header': ShieldCheck,
  'password-strength-analyzer': ShieldAlert,

  // Cryptography
  'sha-256': Fingerprint,
  'sha256': Fingerprint,
  'hmac-generator': Key,
  'rsa-key-generator': Key,
  'certificate-decoder': FileCheck2,
  'bcrypt-generator': Lock,

  // Web Tools
  'curl-converter': Globe,
  'wcag-contrast-checker': Palette,
  'css-unit-converter': Scaling,
  'svg-to-jsx': Code2,
  'html-formatter': Code2,
  'xml-formatter': Code2,
  'graphql-formatter': Code2,
  'http-header-parser': Server,
  'http-status-lookup': Server,
  'url-parser': Globe,
  'query-string-parser': FileCode,
  'user-agent-parser': Globe,
  'mime-type-lookup': FileCode,
  'color-converter': Palette,
  'keycode-inspector': Keyboard,
  'markdown-preview': Eye,

  // Data & DevOps
  'csv-validator': FileCheck2,
  'csv-txt-viewer': TableProperties,
  'pipeline-studio': Workflow,
  'pipeline': Workflow,
  'cidr-calculator': Network,
  'dockerfile-generator': Container,
  'docker-run-to-compose': Container,
  'cron-parser': Clock,
  'cron-generator': Clock,
  'yaml-json-converter': FileJson,
  'semver-calculator': GitCompare,
  'unix-permissions-calculator': Shield,
  'base-converter': Binary,
  'number-to-words': SpellCheck,
  'timestamp-converter': Clock,
  'ascii-table': FileTerminal,
  'age-calculator': Hourglass,
  'sql-formatter': Database,

  // Analysis Tools
  'local-ai-text-assistant': Bot,
}

// ── Category Default Fallback Icons ─────────────────────────────────────────
export const CATEGORY_ICON_MAP: Record<ToolCategory, LucideIcon> = {
  'json-tools': Braces,
  'encode-tools': Binary,
  'text-tools': FileText,
  'generate-tools': Sparkles,
  'auth-tools': ShieldCheck,
  'web-tools': Globe,
  'data-tools': Database,
  'crypto-tools': Fingerprint,
  'analyze-tools': Scan,
}

// ── Category Subtle Color Schemes for Badges ────────────────────────────────
export const CATEGORY_STYLE_MAP: Record<ToolCategory | 'default', { text: string; bg: string; border: string }> = {
  'json-tools': { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  'encode-tools': { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  'text-tools': { text: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
  'generate-tools': { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  'auth-tools': { text: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  'web-tools': { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  'data-tools': { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  'crypto-tools': { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  'analyze-tools': { text: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20' },
  'default': { text: 'text-accent', bg: 'bg-accent-soft', border: 'border-border' },
}

/**
 * Resolves the appropriate Lucide icon component with O(1) performance:
 * 1. Explicit `name` from ICON_MAP
 * 2. `slug` from SLUG_ICON_MAP
 * 3. `category` from CATEGORY_ICON_MAP
 * 4. Fallback to `Wrench`
 */
export function resolveToolIcon(name?: string, slug?: string, category?: string): LucideIcon {
  if (name && ICON_MAP[name]) {
    return ICON_MAP[name]
  }
  if (slug && SLUG_ICON_MAP[slug]) {
    return SLUG_ICON_MAP[slug]
  }
  if (category && CATEGORY_ICON_MAP[category as ToolCategory]) {
    return CATEGORY_ICON_MAP[category as ToolCategory]
  }
  return Wrench
}
