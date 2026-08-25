import { lazy } from 'react'
import { ToolMeta } from '../tool-meta'

export const CRON_PARSER_META: ToolMeta = {
  slug: 'cron-parser',
  name: 'Cron Expression Parser',
  category: 'data-tools',
  tag: 'Cron Parser',
  description: 'Parse, explain, and calculate execution times for 5-part cron expressions.',
  keywords: ['cron', 'schedule', 'parser', 'unix', 'timer', 'automation', 'cronjob', 'validator'],
  status: 'stable',
  featured: true,
  isNew: true,
  toolComponent: lazy(() => import('../../components/tools/data-tools/CronParser')),
  about: {
    summary: 'The Cron Expression Parser converts crontab syntax into human-readable plain language and predicts the next upcoming execution timestamps.',
    useCases: [
      'Verifying background job and cron task execution schedules.',
      'Translating complex cron expressions for non-technical team members.',
      'Debugging unexpected trigger timings in scheduled cloud functions or server scripts.'
    ],
    features: [
      'Explains minute, hour, day-of-month, month, and day-of-week fields in plain English.',
      'Calculates the next 5 upcoming scheduled execution timestamps.',
      'Includes quick-select presets for common scheduling patterns.'
    ],
    tip: 'Click any of the preset buttons above to quickly test standard cron formats.'
  }
}
