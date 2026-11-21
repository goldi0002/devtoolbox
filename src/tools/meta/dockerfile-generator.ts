import { lazy } from "react"
import { ToolMeta } from "../tool-meta"

export const DOCKERFILE_GENERATOR_META: ToolMeta = {
  slug: 'dockerfile-generator',
  name: 'Dockerfile & Container Generator',
  category: 'generate-tools',
  tag: 'DOCKER',
  description: 'Generate production-ready, secure, multi-stage Dockerfiles, .dockerignore, and docker-compose files with built-in security auditing.',
  keywords: ['dockerfile generator', 'docker compose generator', 'docker best practices', 'multi-stage dockerfile', 'dockerignore generator', 'docker security linter'],
  status: 'stable',
  toolComponent: lazy(() => import('../../components/tools/DockerfileGenerator')),
  guide: {
    "steps": [
      {
        "name": "Choose a stack",
        "text": "Pick the framework stack for your app, then set its base image version and the port."
      },
      {
        "name": "Set the options",
        "text": "Turn on Multi-Stage Build (Lean Production Image), Non-Root User (Least Privilege) or HEALTHCHECK Instruction as needed."
      },
      {
        "name": "Review the audit",
        "text": "Read the Container Best Practices audit below the output for warnings about the generated file."
      },
      {
        "name": "Copy the files",
        "text": "Copy the Dockerfile, the .dockerignore and the docker-compose output into your project."
      }
    ],
    "faqs": [
      {
        "question": "What does the multi-stage option do?",
        "answer": "It splits the file into a dependencies stage and a runtime stage, so the final image copies only what it needs. For Node.js, the runtime stage copies node_modules from the first stage."
      },
      {
        "question": "What does the non-root option add?",
        "answer": "A USER instruction, so the container does not run as root. For Node.js the generated file uses USER node."
      },
      {
        "question": "Does the audit build or run the image?",
        "answer": "No. It reports warnings, such as running as root or using a :latest tag, and does not build or run the container."
      },
      {
        "question": "Is my configuration sent anywhere?",
        "answer": "No. The files and the audit are generated in your browser."
      }
    ],
    "example": {
      "title": "Generate a multi-stage Node.js Dockerfile that runs as a non-root user.",
      "input": "Node.js with Express, version 22, port 3000, Multi-Stage Build and Non-Root User on, HEALTHCHECK off",
      "output": "# ── Stage 1: Build & Dependencies ──\nFROM node:22 AS dependencies\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\n\n# ── Stage 2: Production Runtime ──\nFROM node:22 AS runner\nWORKDIR /app\nENV NODE_ENV=production\n\nUSER node\n\nCOPY --from=dependencies /app/node_modules ./node_modules\nCOPY . .\n\nEXPOSE 3000\n\nCMD [\"node\", \"server.js\"]",
      "inputLabel": "Configuration",
      "outputLabel": "Dockerfile"
    }
  },
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
