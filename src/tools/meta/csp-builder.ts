import { lazy } from 'react'
import type { ToolMeta } from '../tool-meta'

export const CSP_BUILDER_META: ToolMeta = {
  slug: 'csp-builder',
  name: 'CSP Header Builder & Analyzer',
  description: 'Build Content-Security-Policy headers visually, audit existing policies for XSS risks, and export HTTP, Nginx, Apache, Express, or meta tag configs.',
  category: 'web-tools',
  tag: 'security',
  icon: 'ShieldAlert',
  keywords: [
    'csp builder',
    'content security policy generator',
    'csp analyzer',
    'csp header parser',
    'content security policy checker',
    'csp nginx config',
    'csp strict-dynamic',
    'xss header generator',
  ],
  toolComponent: lazy(() => import('../../components/tools/web-tools/CspBuilder')),
  about: {
    summary:
      'CSP Header Builder & Analyzer helps you craft, parse, and audit Content-Security-Policy (CSP) headers without memorizing directive quirks. Start from hardened presets or paste an existing policy header to check for XSS risks like unguarded unsafe-inline, wildcards, plaintext http: origins, or missing object-src and frame-ancestors directives. Export the final policy as a raw HTTP header, Nginx add_header, Apache Header set, Express res.setHeader, or an HTML meta tag with spec warnings.',
    useCases: [
      'Authoring a strict Content-Security-Policy for a new SPA or API-backed web application',
      'Auditing a legacy CSP header pasted from browser DevTools to spot unsafe-inline, wildcards, or duplicate directives',
      'Generating copy-ready Nginx, Apache, or Express server header configurations',
      'Rolling out a new policy safely using Content-Security-Policy-Report-Only mode',
    ],
    features: [
      'Visual directive editor with one-click source tokens (\'self\', \'none\', \'strict-dynamic\', https:, data:, blob:)',
      'Parse & Audit mode that accepts raw Content-Security-Policy or Report-Only headers and loads them into the builder',
      'Deterministic security audit flagging high-risk XSS vectors, duplicate directives, and missing clickjacking protections',
      'Starter presets for Strict SPA, Modern Web + CDN, Nonce + Strict Dynamic, and Static Site',
      'Multi-format export for HTTP Header, Nginx, Apache, Express, and HTML <meta> (with frame-ancestors/report-uri caveats)',
      '100% client-side — your internal domains and policy drafts stay in your browser',
    ],
    tip: 'When adopting CSP on an existing site, toggle Report-Only mode first so browsers log violations without blocking scripts while you tighten each directive.',
  },
  addedAt: '2026-11-21',
  complexity: 'moderate',
  featured: false,
  isNew: true,
  status: 'stable',
  seo: {
    title: 'CSP Header Builder & Analyzer — Content-Security-Policy Generator',
    description: 'Build and audit Content-Security-Policy (CSP) headers visually. Detect XSS risks and export Nginx, Apache, Express, and HTTP header snippets client-side.',
    extraKeywords: [
      'content security policy builder online',
      'csp evaluator client side',
      'csp header generator',
      'content-security-policy audit',
    ],
  },
  guide: {
    steps: [
      {
        name: 'Start from a preset or paste an existing header',
        text: 'Pick a starter preset such as Strict SPA or Nonce + Strict Dynamic, or switch to Parse & Audit Header to paste an existing CSP string.',
      },
      {
        name: 'Edit directives and source tokens',
        text: 'Toggle common tokens like \'self\', \'none\', or \'strict-dynamic\', or add custom origins, nonces, and SHA-256 hashes per directive.',
      },
      {
        name: 'Review the security audit',
        text: 'Check the Security Audit panel for high-risk directives (such as unsafe-inline scripts or wildcards), duplicate directives, and missing defenses like object-src \'none\'.',
      },
      {
        name: 'Export for your server',
        text: 'Switch between HTTP Header, Nginx, Apache, Express, and HTML <meta> outputs and copy the configuration.',
      },
    ],
    faqs: [
      {
        question: 'Why does the HTML <meta> export warn about frame-ancestors and report-uri?',
        answer: 'According to the W3C CSP specification, browsers ignore frame-ancestors, report-uri, sandbox, and Report-Only policies when delivered via a <meta> tag. Those directives must be sent as HTTP response headers.',
      },
      {
        question: 'What happens if a CSP header contains duplicate directives?',
        answer: 'Browsers enforce only the first occurrence of a directive and silently ignore any duplicates later in the header. The analyzer flags duplicates so you can merge their source lists.',
      },
      {
        question: 'Why does combining \'none\' with other sources trigger a warning?',
        answer: '\'none\' means no sources are allowed for that directive. Combining it with origins or \'self\' is contradictory, so the builder replaces \'none\' when other tokens are selected.',
      },
      {
        question: 'Is my CSP policy or domain list sent anywhere?',
        answer: 'No. Parsing, auditing, and code generation run entirely in your browser.',
      },
    ],
    example: {
      title: 'Generate a strict SPA Content-Security-Policy header.',
      input: 'Preset: Strict SPA',
      output: "Content-Security-Policy: default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; upgrade-insecure-requests",
      inputLabel: 'Selected preset',
      outputLabel: 'Generated HTTP header',
    },
  },
}
