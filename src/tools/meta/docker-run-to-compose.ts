import { lazy } from "react"
import { ToolMeta } from "../tool-meta"

export const DOCKER_RUN_TO_COMPOSE_META: ToolMeta = {
  slug: 'docker-run-to-compose',
  name: 'Docker Run to Compose Converter',
  category: 'generate-tools',
  tag: 'DOCKER',
  description: 'Convert single or multi-line docker run commands into clean, production-ready docker-compose.yml YAML configurations instantly.',
  keywords: ['docker run to compose', 'docker run to docker-compose', 'convert docker run', 'docker compose generator', 'docker compose converter', 'docker cli to yaml'],
  status: 'available',
  toolComponent: lazy(() => import('../../components/tools/Generators/DockerRunToCompose')),
  seo: {
    title: 'Docker Run to Docker Compose Converter — Instant Online YAML Generator',
    description: 'Transform docker run shell commands into clean, formatted docker-compose.yml files. Supports ports, environment variables, volumes, networks, restart policies, and resource limits.',
    extraKeywords: ['docker run to compose online', 'convert docker command to compose', 'docker compose v3 generator', 'docker cli to compose yaml'],
  },
  about: {
    summary: 'The Docker Run to Compose Converter parses complex Docker CLI commands and automatically synthesizes structured, valid docker-compose.yml files in memory.',
    useCases: [
      'Migrating ad-hoc docker run commands from READMEs and tutorials into reproducible Compose files',
      'Orchestrating multi-container services with shared networks and persistent volumes',
      'Configuring port bindings, environment variable files, restart policies, and health checks'
    ],
    features: [
      'Comprehensive CLI flag parsing (-p/--publish, -e/--env, -v/--volume, --name, --restart, --network, --memory, --cpus, etc.)',
      'Multiple compose specification formats (Compose v3, v2, Compose Spec)',
      'Multi-command support to build multi-service compose stacks from multiple docker run lines',
      'One-click copy, download docker-compose.yml, and syntax validated output'
    ],
    notes: [
      'Multi-line commands with backslashes (\\) or backticks (`) are automatically normalized before parsing',
      'All parsing runs 100% in your browser memory without transmitting container names or secrets'
    ],
    tip: 'Paste multiple docker run commands separated by newlines to generate a multi-service docker-compose.yml file.'
  }
}
