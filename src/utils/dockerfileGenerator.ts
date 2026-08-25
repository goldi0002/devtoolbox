export type DockerStack = 
  | 'node-express'
  | 'react-vite'
  | 'nextjs'
  | 'python-fastapi'
  | 'python-flask'
  | 'golang'
  | 'rust'
  | 'java-spring'
  | 'static-nginx'

export interface DockerConfig {
  stack: DockerStack
  version: string
  port: number
  packageManager: string
  multiStage: boolean
  nonRootUser: boolean
  enableHealthCheck: boolean
  envVars: string
}

export interface LintMessage {
  level: 'warning' | 'info' | 'success'
  message: string
  rule: string
}

export const STACK_DEFAULTS: Record<DockerStack, { name: string; defaultPort: number; defaultVersion: string; pkgManagers: string[] }> = {
  'node-express': { name: 'Node.js (Express / Fastify)', defaultPort: 3000, defaultVersion: '20-alpine', pkgManagers: ['npm', 'pnpm', 'yarn', 'bun'] },
  'react-vite': { name: 'React / Vite (Multi-stage Nginx)', defaultPort: 80, defaultVersion: '20-alpine', pkgManagers: ['npm', 'pnpm', 'yarn', 'bun'] },
  'nextjs': { name: 'Next.js (Standalone Output)', defaultPort: 3000, defaultVersion: '20-alpine', pkgManagers: ['npm', 'pnpm', 'yarn'] },
  'python-fastapi': { name: 'Python (FastAPI / Uvicorn)', defaultPort: 8000, defaultVersion: '3.11-slim', pkgManagers: ['pip', 'poetry'] },
  'python-flask': { name: 'Python (Flask / Gunicorn)', defaultPort: 5000, defaultVersion: '3.11-slim', pkgManagers: ['pip', 'poetry'] },
  'golang': { name: 'Go (Scratch / Alpine Binary)', defaultPort: 8080, defaultVersion: '1.22-alpine', pkgManagers: ['go modules'] },
  'rust': { name: 'Rust (Multi-stage Cargo Release)', defaultPort: 8080, defaultVersion: '1.77-slim', pkgManagers: ['cargo'] },
  'java-spring': { name: 'Java (Spring Boot / Temurin)', defaultPort: 8080, defaultVersion: '21-jdk-alpine', pkgManagers: ['maven', 'gradle'] },
  'static-nginx': { name: 'Static SPA / HTML (Nginx)', defaultPort: 80, defaultVersion: 'alpine', pkgManagers: ['static'] },
}

export function generateDockerfile(config: DockerConfig): string {
  const { stack, version, port, packageManager, multiStage, nonRootUser, enableHealthCheck, envVars } = config

  const envLines = envVars
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => `ENV ${line}`)
    .join('\n')

  switch (stack) {
    case 'node-express': {
      if (multiStage) {
        return `# ── Stage 1: Build & Dependencies ──
FROM node:${version} AS dependencies
WORKDIR /app
COPY package*.json ./
${packageManager === 'pnpm' ? 'RUN corepack enable && corepack prepare pnpm@latest --activate && pnpm install --frozen-lockfile' : 'RUN npm ci'}

# ── Stage 2: Production Runtime ──
FROM node:${version} AS runner
WORKDIR /app
ENV NODE_ENV=production
${envLines ? `${envLines}\n` : ''}
${nonRootUser ? 'USER node' : ''}

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

EXPOSE ${port}
${enableHealthCheck ? `HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \\\n  CMD wget --no-verbose --tries=1 --spider http://localhost:${port}/api/health || exit 1\n` : ''}
CMD ["node", "server.js"]`
      }
      return `FROM node:${version}
WORKDIR /app
ENV NODE_ENV=production
${envLines ? `${envLines}\n` : ''}
COPY package*.json ./
RUN npm ci --only=production
COPY . .

${nonRootUser ? 'USER node' : ''}
EXPOSE ${port}
${enableHealthCheck ? `HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:${port}/health || exit 1\n` : ''}
CMD ["node", "index.js"]`
    }

    case 'react-vite': {
      return `# ── Stage 1: Build Static Assets ──
FROM node:${version} AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ── Stage 2: Serve with Nginx Alpine ──
FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=builder /app/dist .
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE ${port}
CMD ["nginx", "-g", "daemon off;"]`
    }

    case 'nextjs': {
      return `# ── Stage 1: Dependencies ──
FROM node:${version} AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ── Stage 2: Builder ──
FROM node:${version} AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ── Stage 3: Runner ──
FROM node:${version} AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=${port}
${envLines ? `${envLines}\n` : ''}
${nonRootUser ? 'RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs\nUSER nextjs' : ''}

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

EXPOSE ${port}
CMD ["node", "server.js"]`
    }

    case 'python-fastapi': {
      return `FROM python:${version}
WORKDIR /app
ENV PYTHONUNBUFFERED=1 \\
    PYTHONDONTWRITEBYTECODE=1
${envLines ? `${envLines}\n` : ''}
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

${nonRootUser ? 'RUN adduser --disabled-password --no-create-home appuser\nUSER appuser' : ''}
EXPOSE ${port}
${enableHealthCheck ? `HEALTHCHECK --interval=30s --timeout=5s CMD curl -f http://localhost:${port}/health || exit 1\n` : ''}
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "${port}"]`
    }

    case 'python-flask': {
      return `FROM python:${version}
WORKDIR /app
ENV PYTHONUNBUFFERED=1
${envLines ? `${envLines}\n` : ''}
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

${nonRootUser ? 'RUN adduser --disabled-password --gecos "" appuser\nUSER appuser' : ''}
EXPOSE ${port}
CMD ["gunicorn", "--bind", "0.0.0.0:${port}", "--workers", "4", "app:app"]`
    }

    case 'golang': {
      return `# ── Stage 1: Build Binary ──
FROM golang:${version} AS builder
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /app/server .

# ── Stage 2: Ultra-Minimal Scratch/Alpine ──
FROM alpine:latest AS runner
RUN apk --no-cache add ca-certificates tzdata
WORKDIR /app
${envLines ? `${envLines}\n` : ''}
${nonRootUser ? 'RUN addgroup -S appgroup && adduser -S appuser -G appgroup\nUSER appuser' : ''}
COPY --from=builder /app/server /app/server

EXPOSE ${port}
${enableHealthCheck ? `HEALTHCHECK --interval=30s --timeout=3s CMD wget --spider -q http://localhost:${port}/health || exit 1\n` : ''}
CMD ["/app/server"]`
    }

    case 'rust': {
      return `# ── Stage 1: Cargo Build Release ──
FROM rust:${version} AS builder
WORKDIR /usr/src/app
COPY Cargo.toml Cargo.lock ./
COPY src ./src
RUN cargo build --release

# ── Stage 2: Distroless/Debian Slim Runner ──
FROM debian:bookworm-slim AS runner
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
${envLines ? `${envLines}\n` : ''}
${nonRootUser ? 'RUN useradd -m -u 1000 appuser\nUSER appuser' : ''}
COPY --from=builder /usr/src/app/target/release/app /app/server

EXPOSE ${port}
CMD ["/app/server"]`
    }

    case 'java-spring': {
      return `# ── Stage 1: Maven/Gradle Build ──
FROM maven:3.9-eclipse-temurin-21-alpine AS builder
WORKDIR /build
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests -B

# ── Stage 2: Lightweight JRE ──
FROM eclipse-temurin:${version} AS runner
WORKDIR /app
${envLines ? `${envLines}\n` : ''}
${nonRootUser ? 'RUN addgroup -S spring && adduser -S spring -G spring\nUSER spring' : ''}
COPY --from=builder /build/target/*.jar app.jar

EXPOSE ${port}
CMD ["java", "-jar", "app.jar"]`
    }

    case 'static-nginx':
    default: {
      return `FROM nginx:${version}
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY . .

EXPOSE ${port}
CMD ["nginx", "-g", "daemon off;"]`
    }
  }
}

export function generateDockerIgnore(stack: DockerStack): string {
  const common = `.git\n.gitignore\n.env\n.env.*\n*.log\nnode_modules\n.DS_Store\nREADME.md\nDockerfile*\ndocker-compose*.yml\n.vscode\n.idea`
  if (stack.startsWith('node') || stack === 'react-vite' || stack === 'nextjs') {
    return `${common}\n.next\ndist\nbuild\ncoverage\nnpm-debug.log*`
  }
  if (stack.startsWith('python')) {
    return `${common}\n__pycache__\n*.pyc\n*.pyo\n.pytest_cache\n.venv\nenv\nvenv`
  }
  if (stack === 'golang') {
    return `${common}\nbin\nvendor`
  }
  if (stack === 'rust') {
    return `${common}\ntarget`
  }
  return common
}

export function generateDockerCompose(config: DockerConfig): string {
  return `version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "${config.port}:${config.port}"
    environment:
      - NODE_ENV=production
      - PORT=${config.port}
    restart: unless-stopped
`
}

export function lintDockerfileContent(content: string): LintMessage[] {
  const messages: LintMessage[] = []

  // Check root user
  if (!content.includes('USER ') && !content.includes('nginx')) {
    messages.push({
      level: 'warning',
      rule: 'security/no-root-user',
      message: 'Container runs as root user by default. Consider adding a non-root USER instruction for security.'
    })
  } else {
    messages.push({
      level: 'success',
      rule: 'security/non-root',
      message: 'Non-root user detected. Complies with least-privilege security principle.'
    })
  }

  // Check tag pinning
  if (content.match(/FROM\s+[a-zA-Z0-9_\-/]+:latest/)) {
    messages.push({
      level: 'warning',
      rule: 'reproducibility/avoid-latest-tag',
      message: 'Avoid using :latest base image tags in production for deterministic builds.'
    })
  }

  // Check healthcheck
  if (!content.includes('HEALTHCHECK') && !content.includes('nginx')) {
    messages.push({
      level: 'info',
      rule: 'reliability/missing-healthcheck',
      message: 'No HEALTHCHECK instruction defined. Adding one allows orchestrators to detect deadlocks.'
    })
  }

  // Check multi-stage
  if (content.includes(' AS ') || content.includes(' as ')) {
    messages.push({
      level: 'success',
      rule: 'optimization/multi-stage-build',
      message: 'Multi-stage build utilized. Keeps production image footprint minimal.'
    })
  }

  return messages
}
