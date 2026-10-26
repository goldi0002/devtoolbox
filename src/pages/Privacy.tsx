import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'
import { SEO } from '../hooks/useSEO'
import { WEB_INFO } from '../utils/webinfo'
import { tools } from '../tools/registry'
import { ShieldCheck, Lock, EyeOff, ServerOff, Terminal, CheckCircle2, ArrowRight } from 'lucide-react'

const AUDIT_STEPS = [
  {
    step: '1',
    title: 'Open DevTools',
    desc: 'Press F12 or right-click anywhere on the page and select "Inspect", then navigate to the Network tab.'
  },
  {
    step: '2',
    title: 'Filter Fetch/XHR',
    desc: 'Select the "Fetch/XHR" or "WS" filter tab in your browser DevTools to isolate API calls.'
  },
  {
    step: '3',
    title: 'Use Any Utility',
    desc: 'Paste a private JWT token, JSON payload, or format a database query in any tool.'
  },
  {
    step: '4',
    title: 'Observe Zero Traffic',
    desc: 'Verify that 0 network requests are made. No background telemetry, no pings, no analytic beacons.'
  }
]

const SECTIONS = [
  {
    num: '01',
    title: 'Zero Data Collection Guarantee',
    body: [
      'Nothing you type, paste, upload, calculate, or generate inside any tool ever leaves your browser memory. All processing happens entirely client-side using JavaScript, WebAssembly, and the native Web Crypto API running directly on your CPU.',
      'We do not collect, store, transmit, log, or sell any user inputs. Whether you are debugging production JSON, inspecting secret HMAC keys, or decoding sensitive JWT claims, your intellectual property and sensitive credentials remain strictly local to your machine.',
    ],
  },
  {
    num: '02',
    title: 'No Analytics, Trackers, or Beacons',
    body: [
      'ToolBox4Devs does not include third-party tracking scripts, session replay software (such as Hotjar or FullStory), advertising pixels (such as Meta Pixel or Google Ads), or behavioral analytics platforms.',
      'We do not fingerprint your browser or track your navigation across pages. Our application is built to provide an ad-free, unmonitored utility workspace for developers.',
    ],
  },
  {
    num: '03',
    title: 'Network Requests & Static Assets',
    body: [
      'The only network requests your browser ever makes while using ToolBox4Devs are initial HTTP GET requests to fetch static web assets (compiled HTML, JavaScript bundles, CSS stylesheets, and vector icons) from our hosting content delivery network (CDN).',
      'Once static assets are downloaded into browser cache or registered by the Service Worker (PWA mode), the application is capable of running completely offline with zero active internet connection.',
    ],
  },
  {
    num: '04',
    title: 'Local Storage & Browser Memory',
    body: [
      'This site does not set tracking or advertising cookies.',
      'ToolBox4Devs only utilizes browser localStorage for client-side user preferences (such as your dark/light theme choice, custom favorites, or recent tool history). This storage is confined strictly to your browser instance and is never synchronized to a cloud backend.',
    ],
  },
  {
    num: '05',
    title: 'Cryptographic Security & Web Crypto API',
    body: [
      'All cryptographic hashing (SHA-256, HMAC, Bcrypt), key generation (RSA public/private PEM keypairs), and token decoding (JWT, Base64) are powered by the W3C standard Web Crypto API and secure browser memory buffers.',
      'Private keys and seed secrets generated on this site are created using cryptographically secure pseudorandom number generators (CSPRNG) via window.crypto.getRandomValues and never persist beyond your active browser session.',
    ],
  },
  {
    num: '06',
    title: 'Static Hosting Infrastructure',
    body: [
      'ToolBox4Devs is distributed as a statically generated site (SSG) via global edge hosting providers. Like all web servers, standard operational edge logs (such as request timestamps and IP addresses for DDoS protection) may be processed by edge networks.',
      'We do not aggregate, analyze, or link these network-level logs with any user activity, nor do we run any application backend servers.',
    ],
  },
  {
    num: '07',
    title: 'Questions, Verification & Contact',
    body: [
      'We believe developer tools must be transparent and verifiable. If you have questions about our privacy architecture, or want to report an issue, please reach out to us directly.',
    ],
    contact: true,
  },
]

export default function Privacy() {
  usePageTitle('Privacy Policy — 100% In-Browser Privacy Guarantee')

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 animate-fade-in">
      <SEO
        title="Privacy Policy — 100% Client-Side Privacy Guarantee"
        description="ToolBox4Devs collects zero user data. No tracking, no backend calls, no telemetry, no cookies. All 57+ developer utilities run 100% in your browser memory."
        slug="privacy"
      />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <section className="relative mb-20 pt-4">
        {/* Ambient glow */}
        <div className="absolute top-0 right-1/4 w-[450px] h-[220px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 text-[11px] font-mono font-medium mb-6 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Privacy Architecture
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 items-end">
          <div>
            <h1 className="font-display text-[clamp(2.8rem,9vw,6.5rem)] leading-[0.9] mb-6 tracking-tight">
              <span className="text-bright">YOUR DATA</span><br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400">STAYS</span>
              <span className="text-bright"> YOURS.</span>
            </h1>
            <p className="text-dim font-sans text-base sm:text-lg leading-relaxed max-w-xl">
              ToolBox4Devs is designed from first principles around complete client-side isolation. No accounts, zero analytics, and zero telemetry. Here is our plain-English commitment to your security.
            </p>
          </div>

          {/* Last updated & Badge */}
          <div className="p-5 rounded-2xl border border-border bg-surface/60 backdrop-blur-md text-left lg:text-right shadow-sm">
            <div className="text-[10px] font-mono text-muted uppercase tracking-wider mb-1">Last updated</div>
            <div className="font-mono text-xs text-bright font-semibold mb-3">{WEB_INFO.PRIVACY_POLICY_LAST_UPDATED}</div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[11px] font-mono font-medium">
              ● 100% Client-Side
            </span>
          </div>
        </div>
      </section>

      {/* ── Core Commitments Grid ───────────────────────────────────────────── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-20">
        {[
          { icon: ServerOff, title: 'Zero Backend Processing', desc: 'Inputs never leave your browser memory.' },
          { icon: EyeOff, title: 'Zero Trackers or Ads', desc: 'No Google Analytics, Meta Pixels, or cookies.' },
          { icon: Lock, title: 'Hardware Web Crypto', desc: 'Cryptographic hashing runs on native CPU.' },
          { icon: ShieldCheck, title: 'Offline & PWA Ready', desc: 'Works seamlessly without internet access.' },
        ].map((item) => {
          const Icon = item.icon
          return (
            <div key={item.title} className="p-6 rounded-2xl border border-border bg-surface/50 hover:border-indigo-500/30 transition-all shadow-sm group">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Icon size={20} />
              </div>
              <h3 className="text-xs font-mono font-bold text-bright mb-2">{item.title}</h3>
              <p className="text-xs font-sans text-subtle leading-relaxed">{item.desc}</p>
            </div>
          )
        })}
      </section>

      {/* ── Verification Step-by-Step ───────────────────────────────────────── */}
      <section className="mb-20 p-6 sm:p-8 rounded-2xl border border-border bg-surface/50 backdrop-blur-md shadow-md">
        <div className="flex items-center gap-2.5 mb-2">
          <Terminal size={20} className="text-indigo-400" />
          <h2 className="font-display text-xl sm:text-2xl text-bright">HOW TO VERIFY IN 60 SECONDS</h2>
        </div>
        <p className="text-xs font-mono text-dim mb-6">
          Don't just take our word for it. You can independently verify our zero-network promise using your browser developer tools:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {AUDIT_STEPS.map((step) => (
            <div key={step.step} className="p-5 rounded-xl border border-border bg-surface/80 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10">STEP {step.step}</span>
                <CheckCircle2 size={16} className="text-indigo-400/70" />
              </div>
              <h3 className="text-xs font-mono font-semibold text-bright mb-1.5">{step.title}</h3>
              <p className="text-xs font-sans text-subtle leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Detailed Policy Sections ───────────────────────────────────────── */}
      <div className="space-y-0 divide-y divide-border border-t border-border mb-20">
        {SECTIONS.map(section => (
          <div
            key={section.num}
            className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8 py-12"
          >
            {/* Left */}
            <div className="lg:pt-1">
              <span className="text-xs font-mono font-bold text-indigo-400 mb-2 inline-block px-2.5 py-1 rounded bg-indigo-500/10">{section.num}</span>
              <h2 className="font-display text-xl text-bright leading-tight">{section.title}</h2>
            </div>

            {/* Right */}
            <div className="space-y-4">
              {section.body.map((para, i) => (
                <p key={i} className="text-sm font-sans text-dim leading-relaxed">{para}</p>
              ))}

              {section.contact && (
                <div className="flex flex-wrap gap-3 pt-4">
                  <a
                    href="mailto:privacy@toolbox4devs.com"
                    className="inline-flex items-center gap-2.5 px-4 py-2.5 border border-border hover:border-indigo-500/40 text-xs font-mono text-dim hover:text-bright transition-all rounded-xl bg-surface/80 shadow-sm"
                  >
                    <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                    <span>privacy@toolbox4devs.com</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Explore CTA ────────────────────────────────────────────────────── */}
      <section className="border-t border-border pt-16">
        <div className="p-8 rounded-2xl border border-border bg-surface/50 shadow-md backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-2xl text-bright mb-1.5">SAFE & PRIVATE BY DESIGN</h2>
            <p className="text-xs font-mono text-subtle">
              Browse all {tools.length} utilities running 100% in your browser. Zero telemetry.
            </p>
          </div>
          <Link
            to="/tools"
            className="btn-primary text-xs font-mono px-6 py-3 whitespace-nowrap flex items-center gap-2.5 shrink-0 shadow-sm"
          >
            <span>Explore All Tools</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </main>
  )
}
