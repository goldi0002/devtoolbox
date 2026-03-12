import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'
import { SEO } from '../hooks/useSEO'
import { WEB_INFO } from '../utils/webinfo'

const SECTIONS = [
  {
    num:   '01',
    title: 'What we collect',
    body: [
      'Nothing you type, paste, upload, or generate inside any tool ever leaves your browser. All processing happens entirely client-side using JavaScript running on your own machine.',
      'We do not run any analytics platform, session recorder, heatmap tool, or user tracking service. There are no cookies set by this site for tracking purposes.',
    ],
  },
  {
    num:   '02',
    title: 'Server requests',
    body: [
      'The only network requests your browser makes are to load the static files that make up this site — HTML, CSS, JavaScript, and fonts — from our hosting provider.',
      'Once the page is loaded, no further outbound requests are made when you use any tool. You can verify this yourself: open DevTools → Network tab → use any tool. You will see zero Fetch/XHR requests.',
    ],
  },
  {
    num:   '03',
    title: 'Hosting provider',
    body: [
      'This site is served via a static hosting provider (such as Vercel, Netlify, or Cloudflare Pages). Like any web server, the provider\'s infrastructure may log standard HTTP access data — IP addresses, request paths, and timestamps — for operational purposes.',
      'These server-side logs are controlled by the hosting provider, not by us, and are subject to their own privacy policy. We do not have access to, aggregate, or analyze these logs.',
    ],
  },
  {
    num:   '04',
    title: 'Third-party scripts',
    body: [
      'There are no third-party scripts loaded on this site. No Google Analytics, no Hotjar, no Meta Pixel, no ad networks, no social embeds, no CDN-hosted fonts that report back to a third party.',
      'All JavaScript running on this site is part of the application bundle we ship — nothing is loaded from an external domain at runtime.',
    ],
  },
  {
    num:   '05',
    title: 'Cookies',
    body: [
      'We do not set any cookies for tracking, advertising, or analytics. The only browser storage this site may use is localStorage for saving your UI preferences (such as theme) — this data never leaves your device.',
    ],
  },
  {
    num:   '06',
    title: 'Contact & questions',
    body: [
      'If you have any questions about how this site handles data, or if something on this page seems inconsistent with what you observe in DevTools, please reach out. We want to be held accountable.',
    ],
    contact: true,
  },
]

export default function Privacy() {
  usePageTitle('Privacy')

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 animate-fade-in">
      <SEO
        title="Privacy Policy"
        description="ToolBox4Devs collects nothing. No tracking, no analytics, no cookies. All tools run entirely in your browser."
        slug="privacy"
      />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <section className="mb-20">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-px w-10 bg-border" />
          <span className="text-[10px] font-mono text-subtle tracking-[0.25em] uppercase">Privacy</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 items-end">
          <div>
            <h1 className="font-display text-[clamp(3rem,10vw,7rem)] text-bright leading-[0.9] mb-8 tracking-tight">
              YOUR DATA<br />
              <span className="text-border" style={{ WebkitTextStroke: '1.5px #d4d4d4' }}>STAYS</span>
              <span className="text-bright"> YOURS.</span>
            </h1>
            <p className="text-dim font-sans text-base leading-relaxed max-w-lg">
              This is a plain-English privacy policy — no legal padding, no vague language.
              Here is exactly what happens to your data when you use ToolBox4Devs.
            </p>
          </div>

          {/* Last updated */}
          <div className="flex lg:flex-col gap-8 lg:gap-2 pb-2 lg:text-right">
            <div>
              <div className="text-[10px] font-mono text-muted uppercase tracking-wider mb-1">Last updated</div>
              <div className="font-mono text-sm text-subtle">{WEB_INFO.PRIVACY_POLICY_LAST_UPDATED}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TL;DR banner ───────────────────────────────────────────────────── */}
      <div className="border border-border p-6 mb-20">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <span className="text-[10px] font-mono text-muted uppercase tracking-wider border border-border px-2 py-1">
              TL;DR
            </span>
          </div>
          <div className="space-y-1">
            {[
              'We collect nothing you type or paste into any tool.',
              'There are no analytics, trackers, or ad scripts on this site.',
              'All tools run 100% in your browser — nothing is sent to our servers.',
              'You can verify all of this yourself with DevTools in under 60 seconds.',
            ].map((point, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-[10px] font-mono text-muted mt-0.5 flex-shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="text-sm font-sans text-dim leading-relaxed">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Policy sections ────────────────────────────────────────────────── */}
      <div className="space-y-0 divide-y divide-border border-t border-border">
        {SECTIONS.map(section => (
          <div
            key={section.num}
            className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8 py-12"
          >
            {/* Left */}
            <div className="lg:pt-0.5">
              <span className="text-[10px] font-mono text-muted mb-2 block">{section.num}</span>
              <h2 className="font-display text-xl text-bright leading-tight">{section.title}</h2>
            </div>

            {/* Right */}
            <div className="space-y-4">
              {section.body.map((para, i) => (
                <p key={i} className="text-sm font-sans text-dim leading-relaxed">{para}</p>
              ))}

              {section.contact && (
                <div className="flex flex-wrap gap-3 pt-2">
                  <a
                    href="mailto:hello@toolbox4devs.com"
                    className="inline-flex items-center gap-2 px-4 py-2 border border-border hover:border-subtle text-xs font-mono text-dim hover:text-bright transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                    {WEB_INFO.CONTACT_QUESTIONS_EMAIL}
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Verify yourself CTA ────────────────────────────────────────────── */}
      <div className="border-t border-border mt-4 pt-16">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-2xl text-bright mb-1">VERIFY IT YOURSELF</h2>
            <p className="text-xs font-mono text-subtle">
              Open DevTools on any tool page. Network tab. Use the tool. Watch nothing happen.
            </p>
          </div>
          <Link
            to="/tools"
            className="btn-primary text-sm px-6 py-2.5 whitespace-nowrap flex-shrink-0"
          >
            Open a tool →
          </Link>
        </div>
      </div>
    </main>
  )
}