import { useMemo, useState } from 'react'
import ToolLayout from '../../ToolLayout'
import SectionPanel from '../../ui/SectionPanel'
import TextAreaField from '../../ui/TextAreaField'
import StatCard from '../../ui/StatCard'
import OutputPanel from '../../ui/OutputPanel'
import TipsCard from '../../ui/TipsCard'
import { auditEnvFiles } from '../../../utils/envAuditor'
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  KeyRound,
  FileWarning,
  Sparkles,
  Trash2,
} from 'lucide-react'

const SAMPLE_ENV = `# Application Config
NODE_ENV=production
PORT=3000
DATABASE_URL=postgres://admin:S3cr3tPassw0rd!@db.internal:5432/prod
OPENAI_API_KEY=sk-proj-abc1234567890XYZabcdef123456
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
JWT_SECRET=super-secret-signing-key-9928172
PORT=8080
EXTRA_DEBUG_FLAG=true
EMPTY_VAR=`

const SAMPLE_EXAMPLE = `# Application Template
NODE_ENV=development
PORT=3000
DATABASE_URL=
OPENAI_API_KEY=
AWS_ACCESS_KEY_ID=
JWT_SECRET=
STRIPE_WEBHOOK_SECRET=
REDIS_URL=`

export default function EnvAuditor() {
  const [envText, setEnvText] = useState(SAMPLE_ENV)
  const [exampleText, setExampleText] = useState(SAMPLE_EXAMPLE)
  const [outputMode, setOutputMode] = useState<'sanitized' | 'sorted'>('sanitized')

  const audit = useMemo(
    () => auditEnvFiles(envText, exampleText),
    [envText, exampleText]
  )

  const scoreColor =
    audit.healthScore >= 85
      ? 'text-emerald-400'
      : audit.healthScore >= 60
      ? 'text-amber-400'
      : 'text-rose-400'

  const outputText = outputMode === 'sanitized' ? audit.sanitizedExample : audit.sortedEnv

  return (
    <ToolLayout
      title=".env File Auditor & Secret Detector"
      description="Compare .env vs .env.example, detect missing or duplicate keys, flag leaked credentials, and generate sanitized templates 100% locally."
      tag=".env audit"
    >
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setEnvText(SAMPLE_ENV)
                setExampleText(SAMPLE_EXAMPLE)
              }}
              className="btn-ghost text-xs py-1.5 px-3"
            >
              <Sparkles size={13} />
              Load Sample Audit
            </button>
            <button
              type="button"
              onClick={() => {
                setEnvText('')
                setExampleText('')
              }}
              className="btn-ghost text-xs py-1.5 px-3"
            >
              <Trash2 size={13} />
              Clear Both
            </button>
          </div>
          <span className="text-[11px] font-mono text-dim">
            100% in-browser — secrets never leave memory
          </span>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SectionPanel
            label=".env (Local / Active)"
            dot="bg-accent"
            extra={
              <span className="text-[11px] font-mono text-dim">
                {audit.envEntries.length} {audit.envEntries.length === 1 ? 'key' : 'keys'}
              </span>
            }
          >
            <TextAreaField
              label="Paste .env contents"
              value={envText}
              onChange={setEnvText}
              placeholder="NODE_ENV=development&#10;PORT=3000&#10;API_KEY=..."
              className="textarea-base h-60 text-xs"
            />
          </SectionPanel>

          <SectionPanel
            label=".env.example (Template)"
            dot="bg-cyan-400"
            extra={
              <span className="text-[11px] font-mono text-dim">
                {audit.exampleEntries.length} {audit.exampleEntries.length === 1 ? 'key' : 'keys'}
              </span>
            }
          >
            <TextAreaField
              label="Paste .env.example contents (optional)"
              value={exampleText}
              onChange={setExampleText}
              placeholder="NODE_ENV=development&#10;PORT=3000&#10;API_KEY="
              className="textarea-base h-60 text-xs"
            />
          </SectionPanel>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs font-mono">
          <StatCard
            label="Health Score"
            value={`${audit.healthScore}/100`}
            valueClassName={`text-lg font-bold ${scoreColor}`}
            icon={audit.healthScore >= 85 ? ShieldCheck : ShieldAlert}
          />
          <StatCard
            label="Secret Alerts"
            value={audit.secretFindings.length}
            valueClassName={`text-lg font-bold ${audit.secretFindings.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}
            icon={KeyRound}
          />
          <StatCard
            label="Missing in .env"
            value={audit.missingInEnv.length}
            valueClassName={`text-lg font-bold ${audit.missingInEnv.length > 0 ? 'text-amber-400' : 'text-emerald-400'}`}
            icon={FileWarning}
          />
          <StatCard
            label="Undocumented"
            value={audit.extraInEnv.length}
            valueClassName="text-lg font-bold"
            icon={AlertTriangle}
          />
          <StatCard
            label="Duplicate Keys"
            value={audit.duplicateKeysInEnv.length + audit.duplicateKeysInExample.length}
            valueClassName={`text-lg font-bold ${
              audit.duplicateKeysInEnv.length + audit.duplicateKeysInExample.length > 0 ? 'text-amber-400' : 'text-emerald-400'
            }`}
          />
        </div>

        {/* Secret Findings */}
        <SectionPanel
          label="Secret & Credential Detection"
          dot={audit.secretFindings.length > 0 ? 'bg-rose-400' : 'bg-emerald-400'}
        >
          {audit.secretFindings.length === 0 ? (
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 py-1">
              <ShieldCheck size={15} />
              <span>No known secret tokens, private keys, or high-entropy credentials detected.</span>
            </div>
          ) : (
            <div className="space-y-2">
              {audit.secretFindings.map((finding, idx) => (
                <div
                  key={`${finding.source}-${finding.key}-${finding.line}-${idx}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-rose-500/20 bg-rose-500/5 px-3.5 py-2.5 text-xs font-mono"
                >
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        finding.severity === 'critical'
                          ? 'bg-rose-500/20 text-rose-400'
                          : finding.severity === 'high'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-sky-500/20 text-sky-400'
                      }`}
                    >
                      {finding.severity}
                    </span>
                    <span className="text-bright font-semibold">{finding.key}</span>
                    <span className="text-dim">({finding.source} line {finding.line})</span>
                  </div>
                  <div className="flex items-center gap-3 text-dim">
                    <span>{finding.rule}</span>
                    <code className="px-2 py-0.5 rounded bg-surface border border-border text-bright">
                      {finding.maskedPreview}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionPanel>

        {/* Key Diff & Hygiene */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SectionPanel label="Missing From .env" dot={audit.missingInEnv.length > 0 ? 'bg-amber-400' : 'bg-emerald-400'}>
            {audit.missingInEnv.length === 0 ? (
              <p className="text-xs font-mono text-dim">All template keys are present.</p>
            ) : (
              <ul className="space-y-1.5 text-xs font-mono">
                {audit.missingInEnv.map((key) => (
                  <li key={key} className="text-amber-400">+ {key}</li>
                ))}
              </ul>
            )}
          </SectionPanel>

          <SectionPanel label="Undocumented in .env.example" dot="bg-sky-400">
            {audit.extraInEnv.length === 0 ? (
              <p className="text-xs font-mono text-dim">No undocumented keys found.</p>
            ) : (
              <ul className="space-y-1.5 text-xs font-mono">
                {audit.extraInEnv.map((key) => (
                  <li key={key} className="text-sky-400">? {key}</li>
                ))}
              </ul>
            )}
          </SectionPanel>

          <SectionPanel
            label="Duplicates & Empty Values"
            dot={audit.duplicateKeysInEnv.length + audit.emptyInEnv.length > 0 ? 'bg-amber-400' : 'bg-emerald-400'}
          >
            {audit.duplicateKeysInEnv.length === 0 && audit.emptyInEnv.length === 0 ? (
              <p className="text-xs font-mono text-dim">No duplicate keys or empty values.</p>
            ) : (
              <div className="space-y-2 text-xs font-mono">
                {audit.duplicateKeysInEnv.map((dup) => (
                  <div key={dup.key} className="text-rose-400">
                    Duplicate {dup.key} (lines {dup.lines.join(', ')})
                  </div>
                ))}
                {audit.emptyInEnv.map((key) => (
                  <div key={key} className="text-amber-400">
                    Empty value: {key}
                  </div>
                ))}
              </div>
            )}
          </SectionPanel>
        </div>

        {/* Normalized Output */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setOutputMode('sanitized')}
              className={`chip ${outputMode === 'sanitized' ? 'chip-active' : ''}`}
            >
              Sanitized .env.example
            </button>
            <button
              type="button"
              onClick={() => setOutputMode('sorted')}
              className={`chip ${outputMode === 'sorted' ? 'chip-active' : ''}`}
            >
              Sorted & Deduplicated .env
            </button>
          </div>
          <OutputPanel
            label={outputMode === 'sanitized' ? 'Generated .env.example (Secrets Stripped)' : 'Sorted & Deduplicated .env'}
            value={outputText}
            placeholder="Paste .env keys above to generate sanitized or sorted output..."
            heightClass="min-h-[160px] max-h-[360px]"
          />
        </div>

        <TipsCard
          title="Environment Hygiene Best Practices"
          items={[
            'Never commit real API tokens, private keys, or database passwords into .env.example.',
            'Use the "Sanitized .env.example" view to export an alphabetically sorted template with all values stripped.',
            'Duplicate keys override earlier definitions in most dotenv loaders — resolve duplicate lines to prevent subtle bugs.',
          ]}
        />
      </div>
    </ToolLayout>
  )
}
