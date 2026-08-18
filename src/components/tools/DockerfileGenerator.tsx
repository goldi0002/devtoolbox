import { useState, useMemo } from 'react'
import {
  generateDockerfile,
  generateDockerIgnore,
  generateDockerCompose,
  lintDockerfileContent,
  DockerStack,
  DockerConfig,
  STACK_DEFAULTS
} from '../../utils/dockerfileGenerator'
import CopyButton from '../CopyButton'
import { Container, ShieldCheck, AlertTriangle, FileCode, CheckCircle2, Download, Layers } from 'lucide-react'

export default function DockerfileGenerator() {
  const [stack, setStack] = useState<DockerStack>('node-express')
  const [version, setVersion] = useState('20-alpine')
  const [port, setPort] = useState(3000)
  const [packageManager, setPackageManager] = useState('npm')
  const [multiStage, setMultiStage] = useState(true)
  const [nonRootUser, setNonRootUser] = useState(true)
  const [enableHealthCheck, setEnableHealthCheck] = useState(true)
  const [envVars, setEnvVars] = useState('NODE_ENV=production\nPORT=3000')
  const [activeTab, setActiveTab] = useState<'dockerfile' | 'dockerignore' | 'compose'>('dockerfile')

  const handleStackChange = (newStack: DockerStack) => {
    setStack(newStack)
    const defaults = STACK_DEFAULTS[newStack]
    setPort(defaults.defaultPort)
    setVersion(defaults.defaultVersion)
    setPackageManager(defaults.pkgManagers[0] || 'npm')
    if (newStack.startsWith('python')) {
      setEnvVars('PYTHONUNBUFFERED=1\nPORT=' + defaults.defaultPort)
    } else if (newStack === 'golang' || newStack === 'rust') {
      setEnvVars('PORT=' + defaults.defaultPort)
    } else {
      setEnvVars('NODE_ENV=production\nPORT=' + defaults.defaultPort)
    }
  }

  const config: DockerConfig = useMemo(() => ({
    stack,
    version,
    port,
    packageManager,
    multiStage,
    nonRootUser,
    enableHealthCheck,
    envVars
  }), [stack, version, port, packageManager, multiStage, nonRootUser, enableHealthCheck, envVars])

  const dockerfile = useMemo(() => generateDockerfile(config), [config])
  const dockerignore = useMemo(() => generateDockerIgnore(stack), [stack])
  const dockerCompose = useMemo(() => generateDockerCompose(config), [config])
  const lintResults = useMemo(() => lintDockerfileContent(dockerfile), [dockerfile])

  const activeContent = activeTab === 'dockerfile' ? dockerfile : activeTab === 'dockerignore' ? dockerignore : dockerCompose
  const activeFilename = activeTab === 'dockerfile' ? 'Dockerfile' : activeTab === 'dockerignore' ? '.dockerignore' : 'docker-compose.yml'

  const handleDownload = () => {
    const blob = new Blob([activeContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = activeFilename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* ── Configuration Card ── */}
      <div className="card p-6 bg-surface border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <h2 className="text-sm font-mono font-semibold text-bright uppercase tracking-wider flex items-center gap-2">
            <Container size={15} className="text-indigo-400" />
            Stack & Architecture Preset
          </h2>
        </div>

        {/* Stack Selection Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {(Object.keys(STACK_DEFAULTS) as DockerStack[]).map((stk) => (
            <button
              key={stk}
              type="button"
              onClick={() => handleStackChange(stk)}
              className={`p-3 text-left rounded-xl border transition-all text-xs font-mono ${
                stack === stk
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500 font-semibold shadow-xs'
                  : 'bg-muted/30 text-dim border-border/70 hover:bg-muted/50 hover:text-bright'
              }`}
            >
              {STACK_DEFAULTS[stk].name}
            </button>
          ))}
        </div>

        {/* Parameters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label htmlFor="base-ver" className="block text-xs font-mono text-subtle mb-1">
              Base Image Tag / Version
            </label>
            <input
              id="base-ver"
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="w-full px-3 py-2 bg-muted/40 border border-border rounded-lg font-mono text-xs text-bright focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="exp-port" className="block text-xs font-mono text-subtle mb-1">
              Exposed Container Port
            </label>
            <input
              id="exp-port"
              type="number"
              value={port}
              onChange={(e) => setPort(Number(e.target.value) || 80)}
              className="w-full px-3 py-2 bg-muted/40 border border-border rounded-lg font-mono text-xs text-bright focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="pkg-mgr" className="block text-xs font-mono text-subtle mb-1">
              Package Manager
            </label>
            <select
              id="pkg-mgr"
              value={packageManager}
              onChange={(e) => setPackageManager(e.target.value)}
              className="w-full px-3 py-2 bg-muted/40 border border-border rounded-lg font-mono text-xs text-bright focus:outline-none focus:border-indigo-500"
            >
              {STACK_DEFAULTS[stack].pkgManagers.map((pm) => (
                <option key={pm} value={pm}>
                  {pm}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Checkbox Options */}
        <div className="flex flex-wrap items-center gap-5 pt-2 border-t border-border/50 text-xs font-mono text-dim">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={multiStage}
              onChange={(e) => setMultiStage(e.target.checked)}
              className="rounded border-border bg-muted/40 text-indigo-600 focus:ring-0"
            />
            <span>Multi-Stage Build (Lean Production Image)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={nonRootUser}
              onChange={(e) => setNonRootUser(e.target.checked)}
              className="rounded border-border bg-muted/40 text-indigo-600 focus:ring-0"
            />
            <span>Non-Root User (Least Privilege)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={enableHealthCheck}
              onChange={(e) => setEnableHealthCheck(e.target.checked)}
              className="rounded border-border bg-muted/40 text-indigo-600 focus:ring-0"
            />
            <span>HEALTHCHECK Instruction</span>
          </label>
        </div>
      </div>

      {/* ── Generated Outputs with Tabs ── */}
      <div className="card p-6 bg-surface border border-border rounded-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
          <div className="inline-flex p-1 bg-muted/50 rounded-lg border border-border">
            <button
              type="button"
              onClick={() => setActiveTab('dockerfile')}
              className={`px-3 py-1.5 text-xs font-mono rounded-md transition-all ${
                activeTab === 'dockerfile' ? 'bg-indigo-600 text-white font-medium shadow-xs' : 'text-dim hover:text-bright'
              }`}
            >
              Dockerfile
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('dockerignore')}
              className={`px-3 py-1.5 text-xs font-mono rounded-md transition-all ${
                activeTab === 'dockerignore' ? 'bg-indigo-600 text-white font-medium shadow-xs' : 'text-dim hover:text-bright'
              }`}
            >
              .dockerignore
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('compose')}
              className={`px-3 py-1.5 text-xs font-mono rounded-md transition-all ${
                activeTab === 'compose' ? 'bg-indigo-600 text-white font-medium shadow-xs' : 'text-dim hover:text-bright'
              }`}
            >
              docker-compose.yml
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-md bg-muted/40 border border-border text-dim hover:text-bright transition-colors"
            >
              <Download size={13} />
              {activeFilename}
            </button>
            <CopyButton text={activeContent} />
          </div>
        </div>

        <pre className="p-4 bg-muted/30 border border-border rounded-xl font-mono text-xs text-bright overflow-x-auto select-all leading-relaxed">
          {activeContent}
        </pre>
      </div>

      {/* ── Security & Best Practices Linter ── */}
      <div className="card p-5 bg-surface border border-border rounded-xl space-y-3">
        <h3 className="text-xs font-mono font-semibold text-bright uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck size={15} className="text-emerald-400" />
          Container Best Practices & Security Audit
        </h3>

        <div className="space-y-2">
          {lintResults.map((item, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg border text-xs font-mono flex items-start gap-2.5 ${
                item.level === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : item.level === 'warning'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
              }`}
            >
              {item.level === 'success' ? (
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle size={15} className="text-amber-400 shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-semibold block">{item.rule}</span>
                <span className="opacity-90">{item.message}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
