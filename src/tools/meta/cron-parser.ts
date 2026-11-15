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
  },
  seo: {
    title: 'Cron Expression Parser — Explain Crontab Schedules & Next Run Times',
    description: 'Paste a cron expression to get a plain-English explanation and the next run times. Supports standard 5-field crontab syntax, in your browser.',
  },
  guide: {
    "steps": [
      {
        "name": "Enter a cron expression",
        "text": "Type a 5-field expression (minute, hour, day of month, month, day of week) or a macro such as @daily."
      },
      {
        "name": "Or start from a preset",
        "text": "Click a preset like \"Every 5 minutes\" or \"Daily at 9:00 AM\" and adjust it."
      },
      {
        "name": "Read the plain-English schedule",
        "text": "The expression is translated field by field into a sentence."
      },
      {
        "name": "Check the next run times",
        "text": "The next 5 scheduled runs are listed in UTC, so you can confirm the schedule does what you expect."
      }
    ],
    "faqs": [
      {
        "question": "What do the five cron fields mean?",
        "answer": "In order: minute (0-59), hour (0-23), day of month (1-31), month (1-12) and day of week (0-6, where 0 is Sunday)."
      },
      {
        "question": "What does */15 mean in cron?",
        "answer": "A step value. */15 in the minute field means every 15th minute: 0, 15, 30 and 45. A range with a step, such as 9-17/2, steps through that range only."
      },
      {
        "question": "What happens when both day of month and day of week are set?",
        "answer": "In standard cron the job runs when either one matches, not both. For example, 0 0 1 * 1 runs on the 1st of the month and also on every Monday."
      },
      {
        "question": "Which time zone does cron use?",
        "answer": "The time zone of the server or scheduler running it. Many cloud schedulers default to UTC, which is why this tool lists the next runs in UTC."
      }
    ],
    "example": {
      "title": "Explain a schedule that runs during working hours.",
      "input": "*/15 9-17 * * 1-5",
      "output": "Runs every 15 minutes, from 9 through 17, every day of month, every month, and from Mon through Fri.",
      "inputLabel": "Cron expression",
      "outputLabel": "Meaning"
    }
  },
}
