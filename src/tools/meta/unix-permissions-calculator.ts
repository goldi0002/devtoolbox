import { lazy } from 'react'
import type { ToolMeta } from '../tool-meta'

export const UNIX_PERMISSIONS_CALCULATOR_META: ToolMeta = {
  slug: 'unix-permissions-calculator',
  name: 'Unix Permissions Calculator',
  description: 'Convert read, write, and execute bits into chmod octal and symbolic permission strings.',
  category: 'data-tools',
  tag: 'data',
  keywords: ['chmod calculator', 'chmod generator', 'unix permissions', 'linux permissions', 'rwx calculator', 'octal permissions'],
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
  guide: {
    "steps": [
      {
        "name": "Set the owner permissions",
        "text": "Under owner, tick read, write and execute as needed."
      },
      {
        "name": "Set group and others",
        "text": "Do the same for group and others."
      },
      {
        "name": "Read the octal value",
        "text": "Octal chmod shows the three-digit number, such as 755."
      },
      {
        "name": "Read the symbolic string",
        "text": "Symbolic shows the nine-character form, such as rwxr-xr-x."
      }
    ],
    "faqs": [
      {
        "question": "How is each digit calculated?",
        "answer": "Read adds 4, write adds 2 and execute adds 1. The sum for each scope is one octal digit."
      },
      {
        "question": "Are setuid, setgid and sticky bits covered?",
        "answer": "No. Only the nine read, write and execute bits are calculated, so special modes such as 4755 are not shown."
      },
      {
        "question": "What is selected by default?",
        "answer": "Owner rwx, group r-x and others r-x, which gives 755."
      },
      {
        "question": "Does it change any files?",
        "answer": "No. It only calculates values. Run chmod yourself on your system."
      },
      {
        "question": "What do chmod 755 and 644 mean?",
        "answer": "755 (rwxr-xr-x) lets the owner read, write, and execute while group and others can read and execute — standard for directories and scripts. 644 (rw-r--r--) lets the owner read and write while everyone else can only read — standard for regular files."
      }
    ],
    "example": {
      "title": "Convert the default executable mode.",
      "input": "Owner rwx · Group r-x · Others r-x",
      "output": "755 · rwxr-xr-x",
      "inputLabel": "Permissions",
      "outputLabel": "Octal and symbolic"
    }
  },
  addedAt: '2026-03-20',
  complexity: 'simple',
  featured: false,
  isNew: true,
  status: 'stable',
  seo: {
    title: 'Chmod Calculator — Unix File Permissions & Generator',
    description: 'Calculate Linux and Unix chmod octal (755, 644) and symbolic (rwxr-xr-x) permissions interactively. Free chmod generator running in your browser.',
    extraKeywords: [
      'chmod calculator',
      'chmod generator',
      'unix permissions calculator',
      'linux file permissions calculator',
      'chmod 755',
      'chmod 644',
      'octal to symbolic permissions',
    ],
  },
}
