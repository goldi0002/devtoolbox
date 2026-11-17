import { useMemo, useState } from 'react'
import ToolLayout from '../../ToolLayout'
import SectionPanel from '../../ui/SectionPanel'
import TextAreaField from '../../ui/TextAreaField'
import TextInputField from '../../ui/TextInputField'
import ToggleGroup from '../../ui/ToggleGroup'
import {
  EMPTY_ROBOTS_GROUP,
  ROBOTS_PRESET_IDS,
  ROBOTS_PRESET_LABELS,
  buildRobotsTxt,
  generateSitemap,
  robotsPresetGroups,
  validateRobots,
  type RobotsConfig,
  type RobotsGroup,
  type RobotsPresetId,
} from '../../../utils/robotsSitemap'

type Mode = 'robots' | 'sitemap'

const MODE_OPTIONS: ReadonlyArray<{ value: Mode; label: string }> = [
  { value: 'robots', label: 'robots.txt' },
  { value: 'sitemap', label: 'sitemap.xml' },
]

const SAMPLE_ROBOTS: RobotsConfig = {
  groups: [{ userAgent: '*', allow: '/', disallow: '/admin/\n/cart', crawlDelay: '' }],
  sitemaps: 'https://example.com/sitemap.xml',
}

const SAMPLE_SITEMAP = [
  'https://example.com/',
  'https://example.com/blog/analytical-engine 2026-11-01 weekly 0.8',
  'https://example.com/search?lang=en&page=2 monthly 0.3',
].join('\n')

/** Saves text as a local file through a temporary object URL. Nothing leaves the browser. */
function downloadText(fileName: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type: `${type};charset=utf-8` }))
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function DownloadButton({ fileName, content, type }: { fileName: string; content: string; type: string }) {
  return (
    <button
      type="button"
      className="btn-ghost"
      disabled={!content}
      onClick={() => downloadText(fileName, content, type)}
    >
      Download {fileName}
    </button>
  )
}

function WarningList({ warnings }: { warnings: string[] }) {
  if (warnings.length === 0) return null
  return (
    <ul data-testid="warnings" className="space-y-1">
      {warnings.map((warning, index) => (
        <li key={index} className="text-xs font-mono text-amber-500 break-words">
          {warning}
        </li>
      ))}
    </ul>
  )
}

export default function RobotsSitemapGenerator() {
  const [mode, setMode] = useState<Mode>('robots')
  const [robots, setRobots] = useState<RobotsConfig>(SAMPLE_ROBOTS)
  const [sitemapText, setSitemapText] = useState<string>(SAMPLE_SITEMAP)

  const robotsTxt = useMemo(() => buildRobotsTxt(robots), [robots])
  const robotsWarnings = useMemo(() => validateRobots(robots), [robots])
  const sitemap = useMemo(() => generateSitemap(sitemapText), [sitemapText])

  const setGroups = (groups: RobotsGroup[]) => setRobots(prev => ({ ...prev, groups }))
  const updateGroup = (index: number, patch: Partial<RobotsGroup>) =>
    setGroups(robots.groups.map((group, i) => (i === index ? { ...group, ...patch } : group)))
  const removeGroup = (index: number) => setGroups(robots.groups.filter((_, i) => i !== index))
  const applyPreset = (id: RobotsPresetId) => setGroups(robotsPresetGroups(id))

  return (
    <ToolLayout
      title="robots.txt & sitemap.xml Generator"
      description="Build robots.txt crawler rules with AI-crawler presets, or sitemap.xml from a list of URLs"
      tag="web"
    >
      <div className="space-y-6">
        <div role="group" aria-label="Generator" className="flex flex-wrap gap-2">
          <ToggleGroup options={MODE_OPTIONS} value={mode} onChange={setMode} />
        </div>

        {mode === 'robots' ? (
          <>
            <SectionPanel title="Presets">
              <div role="group" aria-label="Robots presets" className="flex flex-wrap gap-2">
                {ROBOTS_PRESET_IDS.map(id => (
                  <button key={id} type="button" className="btn-ghost" onClick={() => applyPreset(id)}>
                    {ROBOTS_PRESET_LABELS[id]}
                  </button>
                ))}
              </div>
              <p className="text-xs text-dim mt-3">
                A preset replaces the groups below. Edit them afterwards as needed.
              </p>
            </SectionPanel>

            <SectionPanel title="User-agent groups">
              <div className="space-y-4">
                {robots.groups.map((group, index) => {
                  const n = index + 1
                  return (
                    <div key={index} className="border border-border rounded-lg p-3 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <TextInputField
                          label={`Group ${n} user-agent`}
                          value={group.userAgent}
                          onChange={userAgent => updateGroup(index, { userAgent })}
                          placeholder="*"
                        />
                        <TextInputField
                          label={`Group ${n} crawl-delay (seconds)`}
                          value={group.crawlDelay}
                          onChange={crawlDelay => updateGroup(index, { crawlDelay })}
                          placeholder="Optional, such as 10"
                        />
                        <TextAreaField
                          label={`Group ${n} allow`}
                          value={group.allow}
                          onChange={allow => updateGroup(index, { allow })}
                          rows={3}
                          placeholder={'/public/\n/images/'}
                        />
                        <TextAreaField
                          label={`Group ${n} disallow`}
                          value={group.disallow}
                          onChange={disallow => updateGroup(index, { disallow })}
                          rows={3}
                          placeholder={'/admin/\n/tmp/'}
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          className="btn-ghost"
                          aria-label={`Remove group ${n}`}
                          onClick={() => removeGroup(index)}
                        >
                          Remove group
                        </button>
                      </div>
                    </div>
                  )
                })}
                <button type="button" className="btn-ghost" onClick={() => setGroups([...robots.groups, { ...EMPTY_ROBOTS_GROUP }])}>
                  Add group
                </button>
              </div>
            </SectionPanel>

            <SectionPanel title="Sitemaps">
              <div className="space-y-2">
                <TextAreaField
                  label="Sitemap URLs"
                  value={robots.sitemaps}
                  onChange={sitemaps => setRobots(prev => ({ ...prev, sitemaps }))}
                  rows={2}
                  placeholder="https://example.com/sitemap.xml"
                />
                <p className="text-xs text-dim">One full sitemap URL per line. Each becomes a Sitemap line.</p>
              </div>
            </SectionPanel>

            <WarningList warnings={robotsWarnings} />

            <SectionPanel
              title="robots.txt"
              copyText={robotsTxt}
              action={<DownloadButton fileName="robots.txt" content={robotsTxt} type="text/plain" />}
            >
              <pre data-testid="robots-output" className="text-xs font-mono text-main whitespace-pre-wrap break-all">
                {robotsTxt || '# Add a user-agent group to generate robots.txt'}
              </pre>
            </SectionPanel>
          </>
        ) : (
          <>
            <SectionPanel title="Page URLs">
              <div className="space-y-2">
                <TextAreaField
                  label="Page URLs"
                  value={sitemapText}
                  onChange={setSitemapText}
                  rows={8}
                  placeholder={'https://example.com/\nhttps://example.com/blog/post 2026-11-01 weekly 0.8'}
                />
                <p className="text-xs text-dim">
                  One URL per line. After the URL you can add a lastmod date (YYYY-MM-DD), a changefreq (such as weekly) and a priority (0.0 to 1.0), separated by spaces.
                </p>
              </div>
            </SectionPanel>

            <WarningList warnings={sitemap.warnings} />

            <SectionPanel
              title={`sitemap.xml (${sitemap.entries.length} ${sitemap.entries.length === 1 ? 'URL' : 'URLs'})`}
              copyText={sitemap.xml}
              action={<DownloadButton fileName="sitemap.xml" content={sitemap.xml} type="application/xml" />}
            >
              <pre data-testid="sitemap-output" className="text-xs font-mono text-main whitespace-pre-wrap break-all">
                {sitemap.xml}
              </pre>
            </SectionPanel>
          </>
        )}
      </div>
    </ToolLayout>
  )
}
