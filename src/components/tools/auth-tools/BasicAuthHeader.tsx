import { useMemo, useState } from 'react'
import ToolLayout from '../../ToolLayout'
import CopyButton from '../../CopyButton'

function encodeBasicAuth(username: string, password: string) {
  return btoa(`${username}:${password}`)
}

function decodeBasicAuth(header: string) {
  const raw = header.trim().replace(/^Basic\s+/i, '')
  if (!raw) return null

  try {
    const decoded = atob(raw)
    const separator = decoded.indexOf(':')
    if (separator === -1) {
      return { username: decoded, password: '' }
    }
    return {
      username: decoded.slice(0, separator),
      password: decoded.slice(separator + 1),
    }
  } catch {
    return null
  }
}

export default function BasicAuthHeader() {
  const [username, setUsername] = useState('service-account')
  const [password, setPassword] = useState('s3cret-token')
  const [headerInput, setHeaderInput] = useState('Basic c2VydmljZS1hY2NvdW50OnMzY3JldC10b2tlbg==')

  const encoded = useMemo(() => encodeBasicAuth(username, password), [username, password])
  const authorizationHeader = `Basic ${encoded}`
  const decoded = useMemo(() => decodeBasicAuth(headerInput), [headerInput])

  return (
    <ToolLayout
      title="Basic Auth Header"
      description="Generate and decode HTTP Basic Authorization headers entirely in your browser"
      tag="auth"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-dim font-mono mb-1.5">Username</label>
              <input value={username} onChange={e => setUsername(e.target.value)} className="input-base w-full" spellCheck={false} />
            </div>
            <div>
              <label className="block text-xs text-dim font-mono mb-1.5">Password</label>
              <input value={password} onChange={e => setPassword(e.target.value)} className="input-base w-full" spellCheck={false} />
            </div>
            <div className="border border-border rounded p-4 bg-surface">
              <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-subtle mb-2">Authorization header</div>
              <div className="flex items-start gap-3">
                <p className="text-sm font-mono text-bright break-all flex-1">{authorizationHeader}</p>
                <CopyButton text={authorizationHeader} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs text-dim font-mono mb-1.5">Decode existing header</label>
            <textarea value={headerInput} onChange={e => setHeaderInput(e.target.value)} className="input-base min-h-[180px] w-full" spellCheck={false} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="border border-border rounded p-4 bg-surface">
            <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-subtle mb-2">Decoded username</div>
            <div className="flex items-start gap-3">
              <p className="text-sm font-mono text-dim break-all flex-1">{decoded?.username || '—'}</p>
              {decoded?.username && <CopyButton text={decoded.username} />}
            </div>
          </div>
          <div className="border border-border rounded p-4 bg-surface">
            <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-subtle mb-2">Decoded password</div>
            <div className="flex items-start gap-3">
              <p className="text-sm font-mono text-dim break-all flex-1">{decoded?.password || '—'}</p>
              {decoded?.password && <CopyButton text={decoded.password} />}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
