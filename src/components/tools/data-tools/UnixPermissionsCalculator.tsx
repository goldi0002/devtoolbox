import { useMemo, useState } from 'react'
import ToolLayout from '../../ToolLayout'
import CopyButton from '../../CopyButton'

type Scope = 'owner' | 'group' | 'others'
type PermissionState = Record<Scope, { read: boolean; write: boolean; execute: boolean }>

const DEFAULT_STATE: PermissionState = {
  owner: { read: true, write: true, execute: true },
  group: { read: true, write: false, execute: true },
  others: { read: true, write: false, execute: true },
}

function scopeValue(scope: PermissionState[Scope]) {
  return (scope.read ? 4 : 0) + (scope.write ? 2 : 0) + (scope.execute ? 1 : 0)
}

export default function UnixPermissionsCalculator() {
  const [permissions, setPermissions] = useState<PermissionState>(DEFAULT_STATE)

  const computed = useMemo(() => {
    const octal = `${scopeValue(permissions.owner)}${scopeValue(permissions.group)}${scopeValue(permissions.others)}`
    const symbolic = [permissions.owner, permissions.group, permissions.others]
      .map(scope => `${scope.read ? 'r' : '-'}${scope.write ? 'w' : '-'}${scope.execute ? 'x' : '-'}`)
      .join('')

    return { octal, symbolic }
  }, [permissions])

  const toggle = (scope: Scope, key: 'read' | 'write' | 'execute') => {
    setPermissions((current) => ({
      ...current,
      [scope]: {
        ...current[scope],
        [key]: !current[scope][key],
      },
    }))
  }

  return (
    <ToolLayout
      title="Unix Permissions Calculator"
      description="Convert rwx permission bits into octal chmod values and symbolic notation"
      tag="data"
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(['owner', 'group', 'others'] as Scope[]).map((scope) => (
            <div key={scope} className="border border-border rounded p-4 bg-surface">
              <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-subtle mb-3">{scope}</div>
              <div className="space-y-2">
                {(['read', 'write', 'execute'] as const).map((key) => (
                  <label key={key} className="flex items-center justify-between text-sm font-sans text-dim gap-3">
                    <span>{key}</span>
                    <input
                      type="checkbox"
                      checked={permissions[scope][key]}
                      onChange={() => toggle(scope, key)}
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="border border-border rounded p-4 bg-surface">
            <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-subtle mb-2">Octal chmod</div>
            <div className="flex items-start gap-3">
              <p className="text-lg font-mono text-bright flex-1">{computed.octal}</p>
              <CopyButton text={computed.octal} />
            </div>
          </div>
          <div className="border border-border rounded p-4 bg-surface">
            <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-subtle mb-2">Symbolic</div>
            <div className="flex items-start gap-3">
              <p className="text-lg font-mono text-bright flex-1">{computed.symbolic}</p>
              <CopyButton text={computed.symbolic} />
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
