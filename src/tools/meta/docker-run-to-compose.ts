import { lazy } from "react"
import { ToolMeta } from "../tool-meta"

export const DOCKER_RUN_TO_COMPOSE_META: ToolMeta = {
  slug: 'docker-run-to-compose',
  name: 'Docker Run to Compose Converter',
  category: 'generate-tools',
  tag: 'DOCKER',
  description: 'Convert single or multi-line docker run commands into clean, production-ready docker-compose.yml YAML configurations instantly.',
  keywords: ['docker run to compose', 'docker run to docker-compose', 'convert docker run', 'docker compose generator', 'docker compose converter', 'docker cli to yaml'],
  status: 'stable',
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
  },
  guide: {
    "steps": [
      {
        "name": "Paste a docker run command",
        "text": "Paste one or more docker run commands into Input Command, one per line. Backslash and backtick line continuations are joined automatically."
      },
      {
        "name": "Pick a compose format",
        "text": "Choose Compose Spec (Recommended), Version 3.8 or Version 2.4. A version line is written only for the two numbered versions."
      },
      {
        "name": "Review the detected services",
        "text": "Check Detected Services, Mapped Ports, Environment Variables and Volume Mounts."
      },
      {
        "name": "Copy the YAML",
        "text": "Copy the generated docker-compose YAML from the YAML Output panel."
      }
    ],
    "faqs": [
      {
        "question": "Which docker run flags are converted?",
        "answer": "Ports (-p, --publish), environment (-e, --env), --env-file, volumes (-v, --volume), --name, --restart, --network or --net, -w, -u, --privileged, -m, --cpus, --entrypoint, -l, --cap-add and --health-cmd."
      },
      {
        "question": "What happens to flags like -d or --rm?",
        "answer": "They are ignored. Detached, interactive, tty and --rm flags do not change the generated YAML."
      },
      {
        "question": "How is the service name chosen?",
        "answer": "It comes from --name when present, lowercased, with characters other than letters, digits, underscores and hyphens replaced. Otherwise the image name without its tag is used."
      },
      {
        "question": "What timings does a health check get?",
        "answer": "A converted --health-cmd always gets an interval of 30s, a timeout of 10s and 3 retries. Edit the YAML if you need other values."
      }
    ],
    "example": {
      "title": "Convert a docker run command into a Compose service.",
      "input": "docker run -d --name web -p 8080:80 -e MODE=prod nginx:1.27",
      "output": "services:\n  web:\n    image: nginx:1.27\n    container_name: web\n    ports:\n      - \"8080:80\"\n    environment:\n      MODE: prod",
      "inputLabel": "docker run command",
      "outputLabel": "docker-compose.yml"
    }
  },
}
