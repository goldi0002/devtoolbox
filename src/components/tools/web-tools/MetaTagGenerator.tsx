import { useMemo, useState } from 'react'
import ToolLayout from '../../ToolLayout'
import SectionPanel from '../../ui/SectionPanel'
import TextAreaField from '../../ui/TextAreaField'
import TextInputField from '../../ui/TextInputField'
import ToggleGroup from '../../ui/ToggleGroup'
import {
  DESCRIPTION_RECOMMENDED,
  TITLE_RECOMMENDED,
  TWITTER_CARD_LABELS,
  buildMetaTags,
  displayHost,
  isValidThemeColor,
  lengthWarning,
  urlWarning,
  type MetaTagInput,
  type TwitterCardType,
} from '../../../utils/metaTags'

const SAMPLE: MetaTagInput = {
  title: 'Ada Lovelace: Notes on the Analytical Engine',
  description: "The first published algorithm, with Ada Lovelace's notes on how the Analytical Engine could compute Bernoulli numbers.",
  url: 'https://example.com/blog/analytical-engine',
  imageUrl: 'https://example.com/images/analytical-engine.png',
  siteName: 'Example Blog',
  twitterCard: 'summary_large_image',
  themeColor: '#1e3a8a',
  canonical: 'https://example.com/blog/analytical-engine',
}

const CARD_OPTIONS = (Object.keys(TWITTER_CARD_LABELS) as TwitterCardType[]).map(value => ({
  value,
  label: TWITTER_CARD_LABELS[value],
}))

/** Shows the user's image URL. Remounts (via key) when the URL changes, and shows a placeholder on failure. */
function PreviewImage({ src, className }: { src: string; className: string }) {
  const [failed, setFailed] = useState(false)
  if (!src.trim() || failed) {
    return (
      <div className={`${className} flex items-center justify-center bg-muted text-xs font-mono text-dim`}>
        {src.trim() ? 'Image failed to load' : 'No image URL'}
      </div>
    )
  }
  return (
    <img
      src={src.trim()}
      alt=""
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setFailed(true)}
      className={`${className} object-cover bg-muted`}
    />
  )
}

function SearchPreview({ title, description, url }: { title: string; description: string; url: string }) {
  return (
    <div data-testid="preview-search" className="space-y-1 max-w-xl break-words">
      <p className="text-xs font-mono text-subtle truncate">{displayHost(url) || 'yourdomain.com'}</p>
      <p className="text-lg text-[var(--color-accent)] leading-snug">
        {title.trim() || <span className="text-dim">Page title</span>}
      </p>
      <p className="text-sm text-subtle leading-relaxed">
        {description.trim() || <span className="text-dim">The description appears here.</span>}
      </p>
    </div>
  )
}

function XCardPreview({ input }: { input: MetaTagInput }) {
  const large = input.twitterCard === 'summary_large_image'
  const body = (
    <div className="p-3 space-y-1 min-w-0">
      <p className="text-xs font-mono text-dim truncate">{displayHost(input.url) || 'yourdomain.com'}</p>
      <p className="text-sm font-semibold text-main break-words">
        {input.title.trim() || <span className="text-dim font-normal">Page title</span>}
      </p>
      <p className="text-xs text-subtle line-clamp-2 break-words">
        {input.description.trim() || <span className="text-dim">Description</span>}
      </p>
    </div>
  )
  return (
    <div data-testid="preview-x" className="max-w-md rounded-2xl border border-border bg-surface overflow-hidden">
      {large ? (
        <>
          <PreviewImage key={input.imageUrl} src={input.imageUrl} className="w-full aspect-[1.91/1]" />
          {body}
        </>
      ) : (
        <div className="flex">
          <PreviewImage key={input.imageUrl} src={input.imageUrl} className="w-28 h-28 shrink-0" />
          {body}
        </div>
      )}
    </div>
  )
}

function LinkedInSlackPreview({ input }: { input: MetaTagInput }) {
  return (
    <div data-testid="preview-linkedin" className="max-w-md rounded-lg border border-border bg-surface overflow-hidden">
      <PreviewImage key={input.imageUrl} src={input.imageUrl} className="w-full aspect-[1.91/1]" />
      <div className="p-3 space-y-1 min-w-0">
        <p className="text-xs font-mono text-dim truncate">
          {input.siteName.trim() || displayHost(input.url) || 'yourdomain.com'}
        </p>
        <p className="text-sm font-semibold text-main break-words">
          {input.title.trim() || <span className="text-dim font-normal">Page title</span>}
        </p>
        <p className="text-xs text-subtle line-clamp-2 break-words">
          {input.description.trim() || <span className="text-dim">Description</span>}
        </p>
      </div>
    </div>
  )
}

export default function MetaTagGenerator() {
  const [input, setInput] = useState<MetaTagInput>(SAMPLE)
  const update = <K extends keyof MetaTagInput>(key: K) => (value: MetaTagInput[K]) =>
    setInput(prev => ({ ...prev, [key]: value }))

  const tags = useMemo(() => buildMetaTags(input), [input])

  const titleWarning = lengthWarning(input.title, TITLE_RECOMMENDED, 'Title')
  const descriptionWarning = lengthWarning(input.description, DESCRIPTION_RECOMMENDED, 'Description')
  const urlWarnings = {
    url: urlWarning(input.url, 'Page URL'),
    imageUrl: urlWarning(input.imageUrl, 'Image URL'),
    canonical: urlWarning(input.canonical, 'Canonical URL'),
  }
  const themeWarning =
    input.themeColor.trim() && !isValidThemeColor(input.themeColor)
      ? 'Theme color should be a hex value such as #1e3a8a. It is left out of the tags until it is valid.'
      : null
  const pickerValue = /^#[0-9a-f]{6}$/i.test(input.themeColor.trim()) ? input.themeColor.trim() : '#000000'

  return (
    <ToolLayout
      title="Open Graph & Meta Tag Generator"
      description="Build title, description, Open Graph and Twitter Card tags with search and social previews"
      tag="web"
    >
      <div className="space-y-6">
        <SectionPanel title="Page details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <TextInputField
                label="Page title"
                aria-label="Page title"
                value={input.title}
                onChange={update('title')}
                placeholder="Ada Lovelace: Notes on the Analytical Engine"
              />
              {titleWarning && <p className="text-xs font-mono text-amber-500">{titleWarning}</p>}
            </div>
            <div className="space-y-2">
              <TextInputField
                label="Site name"
                value={input.siteName}
                onChange={update('siteName')}
                placeholder="Example Blog"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <TextAreaField
                label="Description"
                value={input.description}
                onChange={update('description')}
                rows={3}
                placeholder="A short summary of the page."
              />
              {descriptionWarning && <p className="text-xs font-mono text-amber-500">{descriptionWarning}</p>}
            </div>
            <div className="space-y-2">
              <TextInputField
                label="Page URL"
                value={input.url}
                onChange={update('url')}
                placeholder="https://example.com/blog/post"
              />
              {urlWarnings.url && <p className="text-xs font-mono text-amber-500">{urlWarnings.url}</p>}
            </div>
            <div className="space-y-2">
              <TextInputField
                label="Canonical URL"
                value={input.canonical}
                onChange={update('canonical')}
                placeholder="https://example.com/blog/post"
              />
              {urlWarnings.canonical && <p className="text-xs font-mono text-amber-500">{urlWarnings.canonical}</p>}
            </div>
            <div className="space-y-2 md:col-span-2">
              <TextInputField
                label="Image URL"
                value={input.imageUrl}
                onChange={update('imageUrl')}
                placeholder="https://example.com/images/cover.png"
              />
              {urlWarnings.imageUrl && <p className="text-xs font-mono text-amber-500">{urlWarnings.imageUrl}</p>}
            </div>
            <div className="space-y-2">
              <div className="flex items-end gap-2">
                <div className="flex-1 min-w-0">
                  <TextInputField
                    label="Theme color"
                    value={input.themeColor}
                    onChange={update('themeColor')}
                    placeholder="#1e3a8a"
                  />
                </div>
                <input
                  type="color"
                  aria-label="Theme color picker"
                  value={pickerValue}
                  onChange={e => update('themeColor')(e.target.value)}
                  className="h-10 w-12 shrink-0 cursor-pointer rounded border border-border bg-transparent p-1"
                />
              </div>
              {themeWarning && <p className="text-xs font-mono text-amber-500">{themeWarning}</p>}
            </div>
            <div className="space-y-2">
              <p className="block text-xs text-dim font-mono mb-1.5">Twitter Card type</p>
              <div role="group" aria-label="Twitter Card type" className="flex flex-wrap gap-2">
                <ToggleGroup
                  options={CARD_OPTIONS}
                  value={input.twitterCard}
                  onChange={update('twitterCard')}
                />
              </div>
            </div>
          </div>
        </SectionPanel>

        <SectionPanel title="Previews">
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-mono text-dim">Search result</p>
              <SearchPreview title={input.title} description={input.description} url={input.url} />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-mono text-dim">X / Twitter card</p>
              <XCardPreview input={input} />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-mono text-dim">LinkedIn / Slack card</p>
              <LinkedInSlackPreview input={input} />
            </div>
            <p className="text-xs text-dim">
              Previews are generic approximations. Each platform crops and caches cards differently.
            </p>
          </div>
        </SectionPanel>

        <SectionPanel title="Generated tags" copyText={tags}>
          <pre
            data-testid="meta-tags-output"
            className="p-4 text-xs font-mono text-main whitespace-pre-wrap break-all overflow-x-auto"
          >
            {tags}
          </pre>
        </SectionPanel>
      </div>
    </ToolLayout>
  )
}
