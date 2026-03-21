import { lazy } from 'react'
import type { ToolMeta } from '../tool-meta'

export const UNIX_PERMISSIONS_CALCULATOR_META: ToolMeta = {
  slug: 'unix-permissions-calculator',
  name: 'Unix Permissions Calculator',
  description: 'Convert read, write, and execute bits into chmod octal and symbolic permission strings.',
  category: 'data-tools',
  tag: 'data',
  keywords: ['chmod calculator', 'unix permissions', 'linux permissions', 'rwx calculator', 'octal permissions'],
  toolComponent: lazy(() => import('../../components/tools/data-tools/UnixPermissionsCalculator')),
  about: {
    summary: 'Unix Permissions Calculator makes it easy to convert rwx permission bits into the chmod values you use on Linux and macOS systems. It is handy when configuring deployments, Docker images, scripts, SSH keys, and file permissions from memory.',
    useCases: [
      'Checking the octal value for a permission set like rwxr-xr-x',
      'Teaching or reviewing how Unix permissions map to chmod numbers',
      'Quickly validating file-mode settings during deployment work',
    ],
    features: [
      'Interactive owner, group, and others checkboxes',
      'Live octal and symbolic output',
      'Copy actions for both common permission formats',
    ],
    tip: 'A common executable file mode is 755, which maps to rwxr-xr-x.',
  },
  addedAt: '2026-03-20',
  complexity: 'simple',
  featured: false,
  isNew: true,
  status: 'stable',
}
