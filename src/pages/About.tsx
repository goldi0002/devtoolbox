import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'
import { SEO } from '../hooks/useSEO'
import { tools, getToolCategories } from '../tools/registry'
import { WEB_DEVELOPER_INFO, WEB_PRINCIPLES } from '../utils/webinfo'
import {
  ShieldCheck,
  Zap,
  Lock,
  WifiOff,
  Cpu,
  Terminal,
  Layers,
  Code2,
  ArrowRight,
  HelpCircle,
  FolderGit2,
  ExternalLink
} from 'lucide-react'

const keyFeatures = [
  {
    icon: ShieldCheck,
    title: '100% Client-Side Memory',
    desc: 'All utilities execute entirely within your local browser runtime. No code snippets, API keys, JSON payloads, passwords, or auth tokens are ever sent across a network.'
  },
  {
    icon: Zap,
    title: 'Sub-Millisecond Execution',
    desc: 'Instant processing powered directly by your browser V8 engine and hardware. Zero server queues, network hops, or API rate limits.'
  },
  {
    icon: WifiOff,
    title: 'Offline & PWA Ready',
    desc: 'Installable on macOS, Windows, Linux, iOS, and Android. Fully functional without an active internet connection once cached in your browser.'
  },
  {
    icon: Lock,
    title: 'Zero Ads & Zero Tracking',
    desc: 'No intrusive popups, tracking scripts, behavioral analytics, or cookies. A clean, distraction-free workspace dedicated to developer productivity.'
  },
  {
    icon: Cpu,
    title: 'Native Web Crypto & CSPRNG',
    desc: 'Uses W3C Web Crypto primitives for SHA-256, RSA keypair generation, HMAC signatures, and Bcrypt hashing with cryptographically secure random values.'
  },
  {
    icon: Terminal,
    title: 'Streamlined Ergonomics',
    desc: 'Instant copy-to-clipboard, auto-detection formatting, keyboard shortcuts, sample presets, and side-by-side diffing for rapid workflows.'
  }
]

const stack = [
  { name: 'React 18', desc: 'Component architecture with fast virtual DOM rendering' },
  { name: 'TypeScript', desc: 'Strict end-to-end type safety across tools and registries' },
  { name: 'Vite & SSG', desc: 'Pre-rendered static site generation for sub-second load times' },
  { name: 'Tailwind CSS', desc: 'High-contrast, responsive typographic design system' },
  { name: 'Web Crypto API', desc: 'Browser-native hardware-accelerated cryptographic primitives' },
  { name: 'Lucide Icons', desc: 'Consistent, lightweight SVG vector iconography' },
  { name: 'diff', desc: 'Side-by-side text comparison engine for diffing' },
  { name: 'Prettier', desc: 'Client-side AST code formatting and beautification' },
]

const faqs = [
  {
    q: 'How does 100% client-side execution work?',
    a: 'When you open ToolBox4Devs, your browser downloads the lightweight static application bundle. All computations (JSON parsing, regex testing, cryptographic hashing, timestamp conversion) run entirely within your device CPU and JavaScript engine. No background server calls are ever made.'
  },
  {
    q: 'Can I use ToolBox4Devs completely offline?',
    a: 'Yes! ToolBox4Devs is built as a Progressive Web App (PWA). Once loaded or installed to your desktop/mobile dock, the Service Worker caches all assets so you can use all tools on airplanes, subways, or in air-gapped environments without internet.'
  },
  {
    q: 'Is it safe to paste confidential tokens and secrets?',
    a: 'Yes. Because zero network requests leave your machine, your confidential JWTs, private keys, database schemas, and proprietary code never touch any server. You can independently verify this at any time in your browser DevTools Network tab.'
  },
  {
    q: 'Can I request or suggest a new tool?',
    a: 'Absolutely! ToolBox4Devs is continuously evolving. You can suggest tools via our GitHub repository or by emailing the maintainer directly.'
  }
]

export default function About() {
  usePageTitle('About ToolBox4Devs — Fast, Private Developer Utilities')
  const categories = getToolCategories()
  const pageDescription = `ToolBox4Devs is an open, privacy-first, ad-free suite of ${tools.length}+ developer utilities that run 100% inside your browser.`

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 animate-fade-in">
      <SEO
        title="About ToolBox4Devs — Fast, Private Developer Utilities"
        description={pageDescription}
        slug="about"
      />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <section className="relative mb-20 pt-4">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/4 w-[450px] h-[220px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 text-[11px] font-mono font-medium mb-6 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Manifesto & Architecture
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 items-end">
          <div>
            <h1 className="font-display text-[clamp(3rem,9vw,6.5rem)] leading-[0.9] mb-8 tracking-tight">
              <span className="text-bright">BUILT FOR</span><br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400">DEVS</span>
              <span className="text-bright">.</span>
            </h1>
            <p className="text-dim font-sans text-base sm:text-lg leading-relaxed max-w-xl">
              <span className="text-bright font-semibold">ToolBox4Devs</span> is an open, privacy-first workspace engineered for software engineers, security analysts, and DevOps teams.
              No accounts, zero telemetry, zero server roundtrips. Every tool computes instantly in client memory.
            </p>
          </div>

          {/* Stats column */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex lg:flex-col gap-6 lg:gap-5 pb-2">
            {[
              { value: String(tools.length).padStart(2, '0'), label: 'active utilities' },
              { value: String(categories.length).padStart(2, '0'), label: 'categories' },
              { value: '0', label: 'trackers & ads' },
              { value: '100%', label: 'in-browser memory' },
            ].map(s => (
              <div key={s.label} className="p-4 lg:p-3 rounded-xl lg:rounded-lg bg-surface/60 lg:bg-surface/30 border border-border/80 lg:border-border text-left lg:text-right shadow-sm backdrop-blur-md">
                <div className="font-display text-2xl sm:text-3xl text-bright leading-none">{s.value}</div>
                <div className="text-[10px] font-mono text-subtle mt-1.5 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── The Problem & Solution ──────────────────────────────────────────── */}
      <section className="border-t border-border pt-16 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-12">
          <div>
            <p className="text-[10px] font-mono text-subtle tracking-[0.2em] uppercase mb-1">The Mission</p>
            <h2 className="font-display text-2xl text-bright leading-none">WHY THIS<br />EXISTS</h2>
          </div>

          <div className="space-y-5 text-dim font-sans text-sm sm:text-base leading-relaxed">
            <p>
              Every software engineer opens dozens of utility tabs every day — formatting a messy JSON payload, inspecting a JWT authentication token, generating UUIDs, calculating CIDR subnets, or diffing code snippets.
            </p>
            <p>
              Unfortunately, the modern web is full of utility sites cluttered with invasive banner ads, slow server roundtrips, paywalls, or covert tracking scripts that upload your sensitive payloads to third-party backends.
            </p>
            <div className="p-6 rounded-2xl border border-accent/30 bg-accent-soft/20 text-bright shadow-md backdrop-blur-sm">
              <p className="font-mono text-xs leading-relaxed text-accent mb-2 uppercase tracking-wider font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
                Our Uncompromising Guarantee
              </p>
              <p className="text-sm font-sans leading-relaxed text-bright/90">
                ToolBox4Devs was created as a unified, uncompromising alternative: an ad-free, blazing fast developer toolbox where <strong>100% of all computations execute strictly in your local browser memory</strong>. Nothing is ever sent to a server.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Key Architectural Features ─────────────────────────────────────── */}
      <section className="border-t border-border pt-16 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-12">
          <div>
            <p className="text-[10px] font-mono text-subtle tracking-[0.2em] uppercase mb-1">Engineering</p>
            <h2 className="font-display text-2xl text-bright leading-none">CORE<br />PILLARS</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {keyFeatures.map((feat) => {
              const Icon = feat.icon
              return (
                <div key={feat.title} className="p-6 rounded-2xl border border-border bg-surface/50 hover:border-accent/50 hover:bg-surface/80 transition-all duration-300 shadow-sm group">
                  <div className="w-10 h-10 rounded-xl bg-accent-soft text-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-sm font-mono font-semibold text-bright mb-2">{feat.title}</h3>
                  <p className="text-xs font-sans text-dim leading-relaxed">{feat.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Tool Ecosystem Breakdown ───────────────────────────────────────── */}
      <section className="border-t border-border pt-16 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-12">
          <div>
            <p className="text-[10px] font-mono text-subtle tracking-[0.2em] uppercase mb-1">Ecosystem</p>
            <h2 className="font-display text-2xl text-bright leading-none">EXPLORE<br />SUITES</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const count = tools.filter(t => t.category === cat.category).length
              return (
                <Link
                  key={cat.category}
                  to={`/tools/${cat.category}`}
                  className="p-5 rounded-2xl border border-border bg-surface/40 hover:bg-surface/80 hover:border-accent/60 transition-all duration-300 group flex flex-col justify-between shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono font-bold text-bright group-hover:text-accent transition-colors">
                        {cat.label}
                      </span>
                      <div className="w-6 h-6 rounded-lg bg-surface flex items-center justify-center group-hover:bg-accent-soft group-hover:text-accent transition-colors">
                        <ArrowRight size={13} className="text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-subtle">
                      {count} {count === 1 ? 'utility' : 'utilities'} available
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Principles ─────────────────────────────────────────────────────── */}
      <section className="border-t border-border pt-16 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-12">
          <div>
            <p className="text-[10px] font-mono text-subtle tracking-[0.2em] uppercase mb-1">Guiding ethos</p>
            <h2 className="font-display text-2xl text-bright leading-none">DESIGN<br />PRINCIPLES</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {WEB_PRINCIPLES.map(p => (
              <div key={p.num} className="p-6 rounded-2xl border border-border bg-surface/30 hover:border-subtle transition-all shadow-sm">
                <span className="text-xs font-mono text-accent font-semibold mb-3 inline-block px-2.5 py-1 rounded bg-accent-soft">{p.num}</span>
                <h3 className="text-sm font-sans font-bold text-bright mb-2">{p.label}</h3>
                <p className="text-xs font-sans text-dim leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Maintainer Profile ──────────────────────────────────────────────── */}
      <section className="border-t border-border pt-16 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-12">
          <div>
            <p className="text-[10px] font-mono text-subtle tracking-[0.2em] uppercase mb-1">Maintainer</p>
            <h2 className="font-display text-2xl text-bright leading-none">OPEN<br />SOURCE</h2>
          </div>

          <div className="max-w-xl">
            <div className="mb-6 p-6 rounded-2xl border border-border bg-surface/40 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="font-display text-xl text-bright">{WEB_DEVELOPER_INFO.NAME}</span>
                <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-accent-soft text-accent border border-accent/20">Maintainer</span>
              </div>
              <p className="text-xs font-mono text-subtle tracking-wide mb-4">{WEB_DEVELOPER_INFO.ROLE}</p>
              <p className="text-sm font-sans text-dim leading-relaxed">
                {WEB_DEVELOPER_INFO.BIO}
              </p>
            </div>

            {/* Action Links */}
            <div className="flex flex-wrap gap-3">
              <a
                href={WEB_DEVELOPER_INFO.GITHUB}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-4 py-2.5 border border-border hover:border-accent text-xs font-mono text-dim hover:text-bright transition-all rounded-xl bg-surface/80 shadow-sm"
              >
                <Code2 size={15} className="text-accent" />
                <span>GitHub Repository</span>
                <ExternalLink size={12} className="text-muted" />
              </a>

              <Link
                to="/privacy"
                className="inline-flex items-center gap-2.5 px-4 py-2.5 border border-border hover:border-accent text-xs font-mono text-dim hover:text-bright transition-all rounded-xl bg-surface/80 shadow-sm"
              >
                <ShieldCheck size={15} className="text-accent" />
                <span>Privacy Architecture</span>
              </Link>

              <a
                href="mailto:suggest@toolbox4devs.com?subject=Feature%20Suggestion%20for%20ToolBox4Devs"
                className="inline-flex items-center gap-2.5 px-4 py-2.5 border border-border hover:border-accent text-xs font-mono text-dim hover:text-bright transition-all rounded-xl bg-surface/80 shadow-sm"
              >
                <FolderGit2 size={15} className="text-accent" />
                <span>Suggest a Utility</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tech Stack ─────────────────────────────────────────────────────── */}
      <section className="border-t border-border pt-16 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-12">
          <div>
            <p className="text-[10px] font-mono text-subtle tracking-[0.2em] uppercase mb-1">Under the hood</p>
            <h2 className="font-display text-2xl text-bright leading-none">TECH<br />STACK</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stack.map(item => (
              <div key={item.name} className="p-5 rounded-xl border border-border bg-surface/30 hover:border-accent/40 transition-colors shadow-sm">
                <div className="text-xs font-mono font-semibold text-bright mb-1.5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  {item.name}
                </div>
                <div className="text-xs font-sans text-dim leading-relaxed">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ Section ────────────────────────────────────────────────────── */}
      <section className="border-t border-border pt-16 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-12">
          <div>
            <p className="text-[10px] font-mono text-subtle tracking-[0.2em] uppercase mb-1">Got questions?</p>
            <h2 className="font-display text-2xl text-bright leading-none">COMMON<br />QUESTIONS</h2>
          </div>

          <div className="space-y-4">
            {faqs.map(faq => (
              <div key={faq.q} className="p-6 rounded-2xl border border-border bg-surface/40 shadow-sm">
                <div className="flex items-start gap-3 mb-2.5">
                  <HelpCircle size={18} className="text-accent shrink-0 mt-0.5" />
                  <h3 className="text-sm font-mono font-bold text-bright">{faq.q}</h3>
                </div>
                <p className="text-xs font-sans text-dim leading-relaxed pl-7">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section className="border-t border-border pt-16">
        <div className="p-8 rounded-2xl border border-border bg-surface/50 shadow-md backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <Layers size={20} className="text-accent" />
              <h2 className="font-display text-2xl text-bright">READY TO EXPLORE?</h2>
            </div>
            <p className="text-xs font-mono text-subtle">{tools.length} browser-based developer tools · 100% private · zero tracking</p>
          </div>
          <Link to="/tools" className="btn-primary text-xs font-mono px-6 py-3 whitespace-nowrap flex items-center gap-2.5 shrink-0 shadow-sm">
            <span>Browse All {tools.length} Tools</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

    </main>
  )
}
