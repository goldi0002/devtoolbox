import { lazy } from "react"
import { ToolMeta } from "../tool-meta"

export const DOCKERFILE_GENERATOR_META: ToolMeta = {
  slug: 'dockerfile-generator',
  name: 'Dockerfile & Container Generator',
  category: 'generate-tools',
  tag: 'DOCKER',
  description: 'Generate production-ready, secure, multi-stage Dockerfiles, .dockerignore, and docker-compose files with built-in security auditing.',
  keywords: ['dockerfile generator', 'docker compose generator', 'docker best practices', 'multi-stage dockerfile', 'dockerignore generator', 'docker security linter'],
  status: 'available',
  toolComponent: lazy(() => import('../../components/tools/DockerfileGenerator')),
  seo: {
    title: 'Dockerfile & Container Generator — Multi-Stage Docker Creator',
    description: 'Generate production-grade Dockerfiles, .dockerignore files, and docker-compose configurations for Node.js, Python, Go, Rust, React, and Java with security audits.',
    extraKeywords: ['dockerfile builder online', 'docker compose maker', 'node dockerfile generator', 'python fastapi dockerfile', 'lean docker multi-stage'],
  },
  about: {
    summary: 'The Dockerfile & Container Generator builds production-hardened Docker container configurations across popular web development frameworks with multi-stage builds, non-root users, and automated security auditing.',
    useCases: [
      'Containerizing Node.js, Next.js, FastAPI, Flask, Go, Rust, and Java Spring applications',
      'Creating multi-stage build workflows to reduce Docker image sizes by up to 80%',
      'Hardening containers with unprivileged non-root users (least privilege principle)',
      'Generating companion .dockerignore and docker-compose.yml files in one click'
    ],
    features: [
      'Multi-framework stack presets (Node.js, Vite, Next.js, FastAPI, Flask, Go, Rust, Java, Nginx)',
      'Automatic .dockerignore and docker-compose.yml file generation',
      'Container security linter auditing root access, image tagging, and health checks',
      'Configurable ports, versions, package managers, and environment variables'
    ],
    notes: [
      'Multi-stage builds separate build dependencies (compilers, devDependencies) from runtime images',
      'Using specific version tags prevents breaking changes from upstream image updates'
    ],
    tip: 'Review the Container Best Practices audit at the bottom to verify security and optimization compliance.'
  }
}
