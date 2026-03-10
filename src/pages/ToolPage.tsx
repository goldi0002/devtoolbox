import { useParams, Link, Navigate } from 'react-router-dom'
import { tools } from '../tools/registry'
import { usePageTitle } from '../hooks/usePageTitle'
import { SEO } from '../hooks/useSEO'
import { useLocation } from 'react-router-dom'
import JsonFormatter from '../components/tools/json-tools/JsonFormatter'
import JsonModelGenerator from '../components/tools/json-tools/JsonModelGenerator'
import UuidGenerator from '../components/tools/web-tools/UuidGenerator'
import Base64Tool from '../components/tools/text-tools/Base64Tool'
import TextDiff from '../components/tools/text-tools/TextDiff'
import JwtDecoder from '../components/tools/web-tools/JwtDecoder'
import HtmlFormatter from '../components/tools/web-tools/HtmlFormatter'

const toolComponents: Record<string, React.ComponentType> = {
  'json-formatter': JsonFormatter,
  'json-model': JsonModelGenerator,
  'uuid': UuidGenerator,
  'base64': Base64Tool,
  'text-diff': TextDiff,
  'jwt': JwtDecoder,
  'html-formatter': HtmlFormatter,
}

export default function ToolPage() {
  const location = useLocation()
  const slug = location.pathname.split('/').pop() // Get last segment as slug
  const meta = tools.find(t => t.slug === slug)
  usePageTitle(meta?.name)
  if (!meta) return <Navigate to="/tools" replace />

  const ToolComponent = toolComponents[slug!]
  if (!ToolComponent) return <Navigate to="/tools" replace />

  // Sibling tools (excluding current)
  const others = tools.filter(t => t.slug !== slug)

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <SEO title={meta.name} description={meta.description} slug={meta.slug} />
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 mb-8 text-xs font-mono animate-fade-in">
        <Link to="/" className="text-subtle hover:text-dim transition-colors">home</Link>
        <span className="text-muted">/</span>
        <Link to="/tools" className="text-subtle hover:text-dim transition-colors">tools</Link>
        <span className="text-muted">/</span>
        <span className="text-dim">{slug}</span>
      </nav>

      {/* Tool */}
      <div className="animate-slide-up">
        <ToolComponent />
      </div>

      {/* Other tools */}
      <section className="mt-14 pt-8 border-t border-border">
        <p className="text-xs font-mono text-subtle tracking-widest uppercase mb-4">Other Tools</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {others.map(tool => (
            <Link
              key={tool.slug}
              to={`/${tool.slug}`}
              className="card flex flex-col gap-1.5 hover:border-subtle hover:-translate-y-0.5 group p-4"
            >
              <span className="tag self-start">{tool.tag}</span>
              <span className="text-bright text-xs font-sans font-medium mt-1 group-hover:text-black transition-colors">
                {tool.name}
              </span>
              <span className="text-xs font-mono text-muted group-hover:text-subtle transition-colors">
                /{tool.slug}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
