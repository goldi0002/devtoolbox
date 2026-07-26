import { useMemo, useState } from 'react'
import ToolLayout from '../../ToolLayout'
import FieldCard from '../../ui/FieldCard'
import TextAreaField from '../../ui/TextAreaField'

type ParsedPair = {
  label: string
  value: string
}

const SAMPLE_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36'

function detectBrowser(ua: string) {
  const checks: Array<{ name: string; pattern: RegExp }> = [
    { name: 'Edge', pattern: /edg\/(\d+[\d.]*)/i },
    { name: 'Chrome', pattern: /chrome\/(\d+[\d.]*)/i },
    { name: 'Firefox', pattern: /firefox\/(\d+[\d.]*)/i },
    { name: 'Safari', pattern: /version\/(\d+[\d.]*)[\s\S]*safari/i },
    { name: 'Opera', pattern: /opr\/(\d+[\d.]*)/i },
  ]

  for (const check of checks) {
    const match = ua.match(check.pattern)
    if (match) {
      return `${check.name} ${match[1]}`
    }
  }

  return 'Unknown'
}

function detectOS(ua: string) {
  const checks: Array<{ name: string; pattern: RegExp }> = [
    { name: 'Windows', pattern: /windows nt ([\d.]+)/i },
    { name: 'macOS', pattern: /mac os x ([\d_]+)/i },
    { name: 'iOS', pattern: /iphone os ([\d_]+)/i },
    { name: 'Android', pattern: /android ([\d.]+)/i },
    { name: 'Linux', pattern: /linux/i },
  ]

  for (const check of checks) {
    const match = ua.match(check.pattern)
    if (!match) continue
    if (match[1]) {
      return `${check.name} ${match[1].replace(/_/g, '.')}`
    }
    return check.name
  }

  return 'Unknown'
}

function detectDevice(ua: string) {
  if (/bot|crawl|spider|slurp/i.test(ua)) return 'Bot / crawler'
  if (/tablet|ipad/i.test(ua)) return 'Tablet'
  if (/mobile|iphone|android/i.test(ua)) return 'Mobile'
  return 'Desktop'
}

function getEngine(browser: string) {
  if (browser.startsWith('Chrome') || browser.startsWith('Edge') || browser.startsWith('Opera')) return 'Blink'
  if (browser.startsWith('Safari')) return 'WebKit'
  if (browser.startsWith('Firefox')) return 'Gecko'
  return 'Unknown'
}

export default function UserAgentParser() {
  const [input, setInput] = useState(SAMPLE_USER_AGENT)

  const parsed = useMemo<ParsedPair[]>(() => {
    const ua = input.trim()
    if (!ua) return []

    const browser = detectBrowser(ua)
    const os = detectOS(ua)
    const device = detectDevice(ua)

    return [
      { label: 'Browser', value: browser },
      { label: 'Engine', value: getEngine(browser) },
      { label: 'OS', value: os },
      { label: 'Device', value: device },
      { label: 'Mobile flag', value: /mobile/i.test(ua) ? 'Yes' : 'No' },
      { label: 'Raw length', value: `${ua.length} chars` },
    ]
  }, [input])

  return (
    <ToolLayout
      title="User Agent Parser"
      description="Inspect browser, engine, operating system, and device hints from a raw user agent string"
      tag="web"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          <button className="btn-ghost" onClick={() => setInput(SAMPLE_USER_AGENT)}>Desktop sample</button>
          <button className="btn-ghost" onClick={() => setInput('Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1')}>Mobile sample</button>
          <button className="btn-primary ml-auto" onClick={() => setInput('')}>Clear</button>
        </div>

        <TextAreaField
          label="User agent string"
          value={input}
          onChange={setInput}
          className="input-base min-h-[150px] w-full"
          placeholder="Paste a user agent string here"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {parsed.map((item) => (
            <FieldCard key={item.label} label={item.label} value={item.value} font="sans" copyable />
          ))}
        </div>

        {!parsed.length && (
          <div className="border border-dashed border-border rounded p-6 text-xs font-mono text-subtle">
            Paste a user agent string to inspect it.
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
