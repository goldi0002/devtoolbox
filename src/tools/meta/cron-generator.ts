import { lazy } from 'react'
import type { ToolMeta } from '../tool-meta'

export const CRON_GENERATOR_META: ToolMeta = {
  slug: 'cron-generator',
  name: 'Cron Expression Generator',
  description: 'Build cron scheduling expressions with interactive controls, presets, and human-readable descriptions.',
  category: 'data-tools',
  tag: 'cron',
  keywords: ['cron', 'generator', 'schedule', 'crontab', 'timer', 'automation', 'build', 'create'],
  status: 'stable',
  featured: false,
  isNew: true,
  complexity: 'simple',
  addedAt: '2026-08-23',
  toolComponent: lazy(() => import('../../components/tools/data-tools/CronGenerator')),
  about: {
    summary:
      'Cron Expression Generator helps you build 5-part cron scheduling expressions using interactive UI controls. Select minute, hour, day-of-month, month, and day-of-week fields visually or type custom values. Get instant human-readable descriptions and field-by-field breakdowns.',
    useCases: [
      'Building cron schedules for background jobs and task schedulers',
      'Learning cron syntax by experimenting with field values',
      'Creating CI/CD pipeline schedules and deployment triggers',
      'Setting up recurring database maintenance or backup tasks',
      'Debugging existing cron expressions by modifying individual fields',
    ],
    features: [
      'Interactive field-by-field controls for each cron parameter',
      '14+ quick-select presets for common scheduling patterns',
      'Weekday and weekend shortcuts for day-of-week selection',
      'Custom expression input with automatic description parsing',
      'Colored field breakdown showing each part of the expression',
    ],
    tip: 'Pair this with the Cron Parser tool to both generate and validate cron expressions in a complete workflow.',
  },
  seo: {
    title: 'Cron Expression Generator — Build Crontab Schedules Online',
    description: 'Build cron scheduling expressions with interactive controls, presets, and human-readable descriptions. Free, runs in your browser.',
    extraKeywords: [
      'cron generator', 'crontab builder', 'cron expression builder', 'create cron schedule',
      'cron job scheduler', 'build crontab', 'cron expression maker', 'task scheduler',
      'cron job generator', 'scheduling expression builder',
    ],
  },
}
