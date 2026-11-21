import { lazy } from 'react'
import type { ToolMeta } from '../tool-meta'

export const USER_AGENT_PARSER_META: ToolMeta = {
  slug: 'user-agent-parser',
  name: 'User Agent Parser',
  description: 'Parse raw browser user agent strings into browser, engine, operating system, and device hints.',
  category: 'web-tools',
  tag: 'web',
  keywords: ['user agent parser', 'ua parser', 'browser detection', 'device detection', 'http header debugging'],
  toolComponent: lazy(() => import('../../components/tools/web-tools/UserAgentParser')),
  about: {
    summary: 'User Agent Parser gives you a quick read on what a raw User-Agent header is likely describing. It helps during analytics reviews, support triage, CDN rules, QA checks, or bot filtering when you need a lightweight browser-side interpretation.',
    useCases: [
      'Checking support tickets that include a raw User-Agent header',
      'Understanding browser and device hints during analytics or feature debugging',
      'Reviewing crawler traffic or mobile-vs-desktop requests',
    ],
    features: [
      'Extracts likely browser, rendering engine, operating system, and device class',
      'Includes desktop and mobile sample strings for quick testing',
      'Keeps parsing entirely client-side in the browser',
    ],
    tip: 'User-Agent parsing is heuristic by nature, so treat the result as a practical hint rather than a security-grade identifier.',
  },
  guide: {
    "steps": [
      {
        "name": "Paste a user agent",
        "text": "Paste a raw User-Agent string into User agent string."
      },
      {
        "name": "Or load a sample",
        "text": "Use Desktop sample or Mobile sample to see the output for a known string."
      },
      {
        "name": "Read the fields",
        "text": "Check Browser, Engine, OS, Device, Mobile flag and Raw length."
      },
      {
        "name": "Copy a field",
        "text": "Each field has a copy control, so you can paste a single value into a ticket or report."
      }
    ],
    "faqs": [
      {
        "question": "How accurate is the detection?",
        "answer": "It is pattern matching, so treat the result as a hint. The tool does not verify the string, and browsers or bots can send unusual or spoofed values."
      },
      {
        "question": "Why can an Opera string show as Chrome?",
        "answer": "Browsers are checked in the order Edge, Chrome, Firefox, Safari, Opera. Opera strings also contain a Chrome token, so the Chrome rule matches first."
      },
      {
        "question": "How is the device type decided?",
        "answer": "Strings containing bot, crawl, spider or slurp are Bot / crawler. Then tablet or iPad is Tablet, mobile, iPhone or Android is Mobile, and everything else is Desktop."
      },
      {
        "question": "Is the string sent anywhere?",
        "answer": "No. Parsing runs in your browser."
      }
    ],
    "example": {
      "title": "Parse a desktop Chrome user agent on macOS.",
      "input": "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
      "output": "Browser: Chrome 136.0.0.0\nEngine: Blink\nOS: macOS 14.5\nDevice: Desktop\nMobile flag: No\nRaw length: 114 chars",
      "inputLabel": "User agent",
      "outputLabel": "Parsed fields"
    }
  },
  addedAt: '2026-03-20',
  complexity: 'simple',
  featured: false,
  isNew: true,
  status: 'stable',
  seo: {
    title: 'User Agent Parser — Detect Browser, OS & Device from a UA String',
    description: 'Parse any user agent string into browser, rendering engine, operating system and device type. Free and fully client-side.',
  },
}
