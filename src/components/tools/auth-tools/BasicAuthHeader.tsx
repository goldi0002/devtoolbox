import { useMemo, useState } from 'react'
import ToolLayout from '../../ToolLayout'
import FieldCard from '../../ui/FieldCard'
import TextAreaField from '../../ui/TextAreaField'
import TextInputField from '../../ui/TextInputField'

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
            <TextInputField label="Username" value={username} onChange={setUsername} />
            <TextInputField label="Password" value={password} onChange={setPassword} />
            <FieldCard label="Authorization header" value={authorizationHeader} copyable />
          </div>

          <TextAreaField
            label="Decode existing header"
            value={headerInput}
            onChange={setHeaderInput}
            className="input-base min-h-[180px] w-full"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FieldCard label="Decoded username" value={decoded?.username || '—'} emphasis="dim" copyable={Boolean(decoded?.username)} />
          <FieldCard label="Decoded password" value={decoded?.password || '—'} emphasis="dim" copyable={Boolean(decoded?.password)} />
        </div>
      </div>
    </ToolLayout>
  )
}
