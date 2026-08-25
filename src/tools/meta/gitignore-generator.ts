import { lazy } from 'react'
import type { ToolMeta } from '../tool-meta'

export const GITIGNORE_GENERATOR_META: ToolMeta = {
  slug: 'gitignore-generator', name: '.gitignore Generator', category: 'generate-tools', tag: 'GIT',
  description: 'Generate a clean, deduplicated .gitignore file for your language, framework, editor, and operating system—entirely in your browser.',
  keywords: ['gitignore generator', 'generate gitignore', 'git ignore file', 'node gitignore', 'react gitignore', 'python gitignore', 'vscode gitignore'],
  toolComponent: lazy(() => import('../../components/tools/generate-tools/GitignoreGenerator')), complexity: 'simple', isNew: true, addedAt: '2026-08-22',
  seo: { title: 'Free .gitignore Generator — Build a Clean Git Ignore File', description: 'Create a tailored .gitignore file for Node.js, React, Python, VS Code, macOS, Docker, Terraform, and more. Private, instant, and browser-based.', extraKeywords: ['gitignore generator online', 'create .gitignore file', 'git ignore template generator'] },
  about: {
    summary: 'The .gitignore Generator combines selected project templates into a clean, deduplicated ignore file. It runs entirely in your browser, so project names and custom ignore rules remain private.',
    useCases: ['Starting a new repository with the right ignores for its language and framework', 'Combining editor, operating system, and runtime-specific rules into one file', 'Adding custom rules for local configuration, generated assets, or private notes'],
    features: ['Templates for languages, frameworks, editors, operating systems, Docker, and Terraform', 'Automatic duplicate removal while preserving useful negation rules', 'Optional common rules for environment files, logs, caches, and coverage reports', 'Custom patterns, readable comments, one-click copy, and download'],
    tip: 'A .gitignore does not untrack files already committed. Run git rm --cached <file> once if a tracked file should become ignored.',
  },
}
