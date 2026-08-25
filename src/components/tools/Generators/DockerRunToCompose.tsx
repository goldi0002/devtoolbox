import { useState, useMemo } from 'react'
import SectionPanel from '../../ui/SectionPanel'
import TextAreaField from '../../ui/TextAreaField'
import OutputPanel from '../../ui/OutputPanel'
import StatCard from '../../ui/StatCard'
import {
  Server,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  HardDrive,
  Network,
  Cpu,
  Info
} from 'lucide-react'

interface ParsedService {
  name: string
  image: string
  container_name?: string
  command?: string
  entrypoint?: string
  restart?: string
  ports?: string[]
  environment?: Record<string, string>
  env_file?: string[]
  volumes?: string[]
  networks?: string[]
  labels?: Record<string, string>
  working_dir?: string
  user?: string
  privileged?: boolean
  cap_add?: string[]
  mem_limit?: string
  cpus?: string
  healthcheck?: {
    test: string
    interval?: string
    timeout?: string
    retries?: number
  }
}

const PRESETS = [
  {
    name: 'Nginx Web Server',
    command: 'docker run -d --name web-proxy -p 80:80 -p 443:443 -v ./html:/usr/share/nginx/html:ro --restart always nginx:alpine'
  },
  {
    name: 'PostgreSQL Database',
    command: 'docker run -d --name postgres-db -p 5432:5432 -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=secretpassword -e POSTGRES_DB=appdb -v pgdata:/var/lib/postgresql/data --restart unless-stopped postgres:16-alpine'
  },
  {
    name: 'Redis with Password',
    command: 'docker run -d --name redis-cache -p 6379:6379 -v redis-data:/data --restart always redis:alpine redis-server --requirepass "mypassword"'
  },
  {
    name: 'Full Stack App (2 Containers)',
    command: `docker run -d --name api-backend -p 3000:3000 -e NODE_ENV=production -e DB_HOST=postgres-db --network app-tier -v ./backend:/app node:20-alpine npm start

docker run -d --name web-frontend -p 8080:80 --network app-tier nginx:alpine`
  }
]

function tokenizeCommandLine(cmd: string): string[] {
  const tokens: string[] = []
  let current = ''
  let inSingleQuote = false
  let inDoubleQuote = false
  let escapeNext = false

  for (let i = 0; i < cmd.length; i++) {
    const char = cmd[i]

    if (escapeNext) {
      current += char
      escapeNext = false
      continue
    }

    if (char === '\\' && !inSingleQuote) {
      escapeNext = true
      continue
    }

    if (char === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote
      continue
    }

    if (char === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote
      continue
    }

    if (/\s/.test(char) && !inSingleQuote && !inDoubleQuote) {
      if (current.length > 0) {
        tokens.push(current)
        current = ''
      }
    } else {
      current += char
    }
  }

  if (current.length > 0) {
    tokens.push(current)
  }

  return tokens
}

function parseSingleDockerRun(rawCommand: string, defaultServiceName: string): ParsedService | null {
  // Normalize line continuations (\ or `)
  const normalized = rawCommand
    .replace(/\\\r?\n/g, ' ')
    .replace(/`\r?\n/g, ' ')
    .trim()

  if (!normalized) return null

  const tokens = tokenizeCommandLine(normalized)
  if (tokens.length === 0) return null

  // Skip leading "docker run" if present
  let startIndex = 0
  if (tokens[0] === 'docker' && tokens[1] === 'run') {
    startIndex = 2
  } else if (tokens[0] === 'docker') {
    startIndex = 1
  }

  const ports: string[] = []
  const environment: Record<string, string> = {}
  const env_file: string[] = []
  const volumes: string[] = []
  const networks: string[] = []
  const labels: Record<string, string> = {}
  const cap_add: string[] = []
  let containerName: string | undefined
  let restartPolicy: string | undefined
  let workingDir: string | undefined
  let user: string | undefined
  let privileged: boolean | undefined
  let memLimit: string | undefined
  let cpus: string | undefined
  let entrypoint: string | undefined
  let healthcheckTest: string | undefined
  let image: string | undefined
  let commandArgs: string[] = []

  let i = startIndex
  while (i < tokens.length) {
    const token = tokens[i]

    // If we haven't found the image yet and we hit a non-flag token, that's the image!
    if (!token.startsWith('-') && !image) {
      image = token
      i++
      // All subsequent tokens are container command arguments
      commandArgs = tokens.slice(i)
      break
    }

    // Flag parsing
    if (token === '-p' || token === '--publish') {
      if (i + 1 < tokens.length) ports.push(tokens[++i])
    } else if (token.startsWith('-p=') || token.startsWith('--publish=')) {
      ports.push(token.split('=')[1])
    } else if (token === '-e' || token === '--env') {
      if (i + 1 < tokens.length) {
        const envVal = tokens[++i]
        const eqIdx = envVal.indexOf('=')
        if (eqIdx !== -1) {
          environment[envVal.substring(0, eqIdx)] = envVal.substring(eqIdx + 1)
        } else {
          environment[envVal] = ''
        }
      }
    } else if (token.startsWith('-e=') || token.startsWith('--env=')) {
      const envVal = token.split('=')[1]
      const eqIdx = envVal.indexOf('=')
      if (eqIdx !== -1) {
        environment[envVal.substring(0, eqIdx)] = envVal.substring(eqIdx + 1)
      } else {
        environment[envVal] = ''
      }
    } else if (token === '--env-file') {
      if (i + 1 < tokens.length) env_file.push(tokens[++i])
    } else if (token === '-v' || token === '--volume') {
      if (i + 1 < tokens.length) volumes.push(tokens[++i])
    } else if (token.startsWith('-v=') || token.startsWith('--volume=')) {
      volumes.push(token.split('=')[1])
    } else if (token === '--name') {
      if (i + 1 < tokens.length) containerName = tokens[++i]
    } else if (token.startsWith('--name=')) {
      containerName = token.split('=')[1]
    } else if (token === '--restart') {
      if (i + 1 < tokens.length) restartPolicy = tokens[++i]
    } else if (token.startsWith('--restart=')) {
      restartPolicy = token.split('=')[1]
    } else if (token === '--network' || token === '--net') {
      if (i + 1 < tokens.length) networks.push(tokens[++i])
    } else if (token.startsWith('--network=') || token.startsWith('--net=')) {
      networks.push(token.split('=')[1])
    } else if (token === '-w' || token === '--workdir') {
      if (i + 1 < tokens.length) workingDir = tokens[++i]
    } else if (token === '-u' || token === '--user') {
      if (i + 1 < tokens.length) user = tokens[++i]
    } else if (token === '--privileged') {
      privileged = true
    } else if (token === '-m' || token === '--memory') {
      if (i + 1 < tokens.length) memLimit = tokens[++i]
    } else if (token === '--cpus') {
      if (i + 1 < tokens.length) cpus = tokens[++i]
    } else if (token === '--entrypoint') {
      if (i + 1 < tokens.length) entrypoint = tokens[++i]
    } else if (token === '-l' || token === '--label') {
      if (i + 1 < tokens.length) {
        const labelVal = tokens[++i]
        const eqIdx = labelVal.indexOf('=')
        if (eqIdx !== -1) {
          labels[labelVal.substring(0, eqIdx)] = labelVal.substring(eqIdx + 1)
        } else {
          labels[labelVal] = 'true'
        }
      }
    } else if (token === '--cap-add') {
      if (i + 1 < tokens.length) cap_add.push(tokens[++i])
    } else if (token === '--health-cmd') {
      if (i + 1 < tokens.length) healthcheckTest = tokens[++i]
    }
    // Ignored/flag-only options: -d, --detach, -it, -i, -t, --rm
    i++
  }

  if (!image) {
    return null
  }

  // Derive service name from container name or image name
  let finalServiceName = defaultServiceName
  if (containerName) {
    finalServiceName = containerName.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase()
  } else {
    const rawImg = image.split(':')[0].split('/').pop() || defaultServiceName
    finalServiceName = rawImg.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase()
  }

  return {
    name: finalServiceName,
    image,
    container_name: containerName,
    command: commandArgs.length > 0 ? commandArgs.join(' ') : undefined,
    entrypoint,
    restart: restartPolicy,
    ports: ports.length > 0 ? ports : undefined,
    environment: Object.keys(environment).length > 0 ? environment : undefined,
    env_file: env_file.length > 0 ? env_file : undefined,
    volumes: volumes.length > 0 ? volumes : undefined,
    networks: networks.length > 0 ? networks : undefined,
    labels: Object.keys(labels).length > 0 ? labels : undefined,
    working_dir: workingDir,
    user,
    privileged,
    cap_add: cap_add.length > 0 ? cap_add : undefined,
    mem_limit: memLimit,
    cpus,
    healthcheck: healthcheckTest ? { test: healthcheckTest } : undefined
  }
}

function generateComposeYaml(services: ParsedService[], composeVersion: string): string {
  if (services.length === 0) return ''

  const lines: string[] = []

  if (composeVersion !== 'spec') {
    lines.push(`version: '${composeVersion}'`)
    lines.push('')
  }

  lines.push('services:')

  const allNetworks = new Set<string>()
  const allNamedVolumes = new Set<string>()

  // Deduplicate service names
  const seenNames = new Set<string>()

  services.forEach((svc, index) => {
    let serviceKey = svc.name || `service_${index + 1}`
    let counter = 1
    while (seenNames.has(serviceKey)) {
      serviceKey = `${svc.name}_${++counter}`
    }
    seenNames.add(serviceKey)

    lines.push(`  ${serviceKey}:`)
    lines.push(`    image: ${svc.image}`)

    if (svc.container_name) {
      lines.push(`    container_name: ${svc.container_name}`)
    }

    if (svc.restart) {
      lines.push(`    restart: ${svc.restart}`)
    }

    if (svc.entrypoint) {
      lines.push(`    entrypoint: ${svc.entrypoint}`)
    }

    if (svc.command) {
      lines.push(`    command: ${svc.command}`)
    }

    if (svc.user) {
      lines.push(`    user: "${svc.user}"`)
    }

    if (svc.working_dir) {
      lines.push(`    working_dir: ${svc.working_dir}`)
    }

    if (svc.privileged) {
      lines.push(`    privileged: true`)
    }

    if (svc.cap_add && svc.cap_add.length > 0) {
      lines.push(`    cap_add:`)
      svc.cap_add.forEach(cap => lines.push(`      - ${cap}`))
    }

    if (svc.ports && svc.ports.length > 0) {
      lines.push(`    ports:`)
      svc.ports.forEach(p => lines.push(`      - "${p}"`))
    }

    if (svc.env_file && svc.env_file.length > 0) {
      lines.push(`    env_file:`)
      svc.env_file.forEach(ef => lines.push(`      - ${ef}`))
    }

    if (svc.environment && Object.keys(svc.environment).length > 0) {
      lines.push(`    environment:`)
      Object.entries(svc.environment).forEach(([k, v]) => {
        if (v === '') {
          lines.push(`      - ${k}`)
        } else if (/[\s#:"]/.test(v)) {
          lines.push(`      ${k}: "${v.replace(/"/g, '\\"')}"`)
        } else {
          lines.push(`      ${k}: ${v}`)
        }
      })
    }

    if (svc.volumes && svc.volumes.length > 0) {
      lines.push(`    volumes:`)
      svc.volumes.forEach(v => {
        lines.push(`      - ${v}`)
        const hostPart = v.split(':')[0]
        if (hostPart && !hostPart.startsWith('.') && !hostPart.startsWith('/') && !hostPart.startsWith('~')) {
          allNamedVolumes.add(hostPart)
        }
      })
    }

    if (svc.networks && svc.networks.length > 0) {
      lines.push(`    networks:`)
      svc.networks.forEach(n => {
        lines.push(`      - ${n}`)
        allNetworks.add(n)
      })
    }

    if (svc.labels && Object.keys(svc.labels).length > 0) {
      lines.push(`    labels:`)
      Object.entries(svc.labels).forEach(([k, v]) => {
        lines.push(`      ${k}: "${v.replace(/"/g, '\\"')}"`)
      })
    }

    if (svc.healthcheck) {
      lines.push(`    healthcheck:`)
      lines.push(`      test: ["CMD-SHELL", "${svc.healthcheck.test.replace(/"/g, '\\"')}"]`)
      lines.push(`      interval: 30s`)
      lines.push(`      timeout: 10s`)
      lines.push(`      retries: 3`)
    }

    if (svc.mem_limit || svc.cpus) {
      lines.push(`    deploy:`)
      lines.push(`      resources:`)
      lines.push(`        limits:`)
      if (svc.cpus) lines.push(`          cpus: '${svc.cpus}'`)
      if (svc.mem_limit) lines.push(`          memory: ${svc.mem_limit}`)
    }

    lines.push('')
  })

  // Append root networks if any custom networks used
  if (allNetworks.size > 0) {
    lines.push('networks:')
    allNetworks.forEach(net => {
      lines.push(`  ${net}:`)
      lines.push(`    driver: bridge`)
    })
    lines.push('')
  }

  // Append root volumes if any named volumes used
  if (allNamedVolumes.size > 0) {
    lines.push('volumes:')
    allNamedVolumes.forEach(vol => {
      lines.push(`  ${vol}:`)
    })
    lines.push('')
  }

  return lines.join('\n').trimEnd() + '\n'
}

export default function DockerRunToCompose() {
  const [inputCommand, setInputCommand] = useState(
    'docker run -d --name webapp -p 8080:80 -e NODE_ENV=production -e DB_HOST=db.internal -v /var/data:/data --restart always nginx:alpine'
  )
  const [composeVersion, setComposeVersion] = useState<'spec' | '3.8' | '2.4'>('spec')

  const parsedServices = useMemo(() => {
    if (!inputCommand.trim()) return []

    // Split on double newlines or separate docker run statements
    const chunks = inputCommand
      .split(/(?=docker\s+run)/gi)
      .map(c => c.trim())
      .filter(Boolean)

    const services: ParsedService[] = []
    chunks.forEach((chunk, idx) => {
      const parsed = parseSingleDockerRun(chunk, `app_${idx + 1}`)
      if (parsed) services.push(parsed)
    })

    return services
  }, [inputCommand])

  const outputYaml = useMemo(() => {
    if (parsedServices.length === 0) return ''
    return generateComposeYaml(parsedServices, composeVersion)
  }, [parsedServices, composeVersion])

  const stats = useMemo(() => {
    let portCount = 0
    let envCount = 0
    let volumeCount = 0
    parsedServices.forEach(s => {
      portCount += s.ports?.length || 0
      envCount += Object.keys(s.environment || {}).length
      volumeCount += s.volumes?.length || 0
    })
    return {
      serviceCount: parsedServices.length,
      portCount,
      envCount,
      volumeCount
    }
  }, [parsedServices])

  return (
    <div className="space-y-6">
      {/* Configuration & Presets Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-border bg-surface/30">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-subtle uppercase tracking-wider font-semibold mr-1">
            Presets:
          </span>
          {PRESETS.map(preset => (
            <button
              key={preset.name}
              onClick={() => setInputCommand(preset.command)}
              className="text-xs font-mono px-2.5 py-1 rounded-md border border-border bg-surface/60 hover:border-subtle hover:text-bright text-dim transition-colors"
            >
              {preset.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-subtle">Compose Spec:</span>
          <select
            value={composeVersion}
            onChange={e => setComposeVersion(e.target.value as 'spec' | '3.8' | '2.4')}
            className="text-xs font-mono px-2.5 py-1 rounded-md border border-border bg-surface text-bright focus:outline-none focus:border-accent"
          >
            <option value="spec">Compose Spec (Recommended)</option>
            <option value="3.8">Version 3.8</option>
            <option value="2.4">Version 2.4</option>
          </select>
        </div>
      </div>

      {/* Input / Output Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: CLI Command Input */}
        <div className="space-y-4">
          <SectionPanel
            title="Docker Run CLI Command"
            action={
              <button
                onClick={() => setInputCommand('')}
                className="text-xs font-mono text-muted hover:text-bright flex items-center gap-1 transition-colors"
              >
                <RotateCcw size={12} />
                Clear
              </button>
            }
          >
            <TextAreaField
              label="Input Command"
              value={inputCommand}
              onChange={setInputCommand}
              placeholder="Paste docker run command here (e.g. docker run -d -p 80:80 nginx)..."
              rows={10}
            />

            <div className="p-3 rounded-lg border border-border bg-surface/20 text-xs font-mono text-subtle space-y-1 mt-3">
              <div className="flex items-center gap-1.5 text-bright font-semibold">
                <Info size={13} className="text-accent" />
                <span>Supported CLI Flags:</span>
              </div>
              <p className="text-[11px] text-dim leading-relaxed">
                <code>-p / --publish</code>, <code>-e / --env</code>, <code>--env-file</code>, <code>-v / --volume</code>, <code>--name</code>, <code>--restart</code>, <code>--network</code>, <code>--entrypoint</code>, <code>-w / --workdir</code>, <code>-u / --user</code>, <code>--memory</code>, <code>--cpus</code>, <code>--cap-add</code>, <code>--health-cmd</code>
              </p>
            </div>
          </SectionPanel>
        </div>

        {/* Right Column: Generated docker-compose.yml */}
        <div className="space-y-4">
          <SectionPanel title="Generated docker-compose.yml">
            <OutputPanel
              label="YAML Output"
              value={outputYaml}
              language="yaml"
              heightClass="min-h-[280px]"
              placeholder="docker-compose.yml configuration will be generated here..."
            />
          </SectionPanel>
        </div>
      </div>

      {/* Overview Stat Badges */}
      {parsedServices.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            label="Detected Services"
            value={stats.serviceCount}
            icon={Layers}
            variant="default"
          />
          <StatCard
            label="Mapped Ports"
            value={stats.portCount}
            icon={Network}
            variant="default"
          />
          <StatCard
            label="Environment Variables"
            value={stats.envCount}
            icon={Cpu}
            variant="default"
          />
          <StatCard
            label="Volume Mounts"
            value={stats.volumeCount}
            icon={HardDrive}
            variant="default"
          />
        </div>
      )}
    </div>
  )
}
