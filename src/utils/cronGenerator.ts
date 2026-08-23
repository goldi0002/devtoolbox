// ── Cron Expression Generator Utility ───────────────────────────────────────
// 100% client-side cron expression builder from structured options

export interface CronOptions {
  minute: string
  hour: string
  dayOfMonth: string
  month: string
  dayOfWeek: string
}

export function buildCronExpression(opts: CronOptions): string {
  return `${opts.minute} ${opts.hour} ${opts.dayOfMonth} ${opts.month} ${opts.dayOfWeek}`
}

export function describeCronExpression(expression: string): string {
  const parts = expression.trim().split(/\s+/)
  if (parts.length !== 5) return 'Invalid expression — must have exactly 5 fields'

  const [min, hour, dom, month, dow] = parts

  // Every minute
  if (min === '*' && hour === '*' && dom === '*' && month === '*' && dow === '*') {
    return 'Runs every minute'
  }

  const descriptions: string[] = []

  // Minute
  if (min.startsWith('*/')) {
    descriptions.push(`Runs every ${min.slice(2)} minutes`)
  } else if (min === '*') {
    descriptions.push('Runs every minute')
  } else {
    descriptions.push(`Runs at minute ${min}`)
  }

  // Hour
  if (hour.startsWith('*/')) {
    descriptions.push(`every ${hour.slice(2)} hours`)
  } else if (hour !== '*') {
    descriptions.push(`at hour ${hour}`)
  }

  // Day of month
  if (dom !== '*') {
    descriptions.push(`on day ${dom} of the month`)
  }

  // Month
  if (month !== '*') {
    const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    const monthNum = parseInt(month)
    if (monthNum >= 1 && monthNum <= 12) {
      descriptions.push(`in ${monthNames[monthNum]}`)
    } else {
      descriptions.push(`in month ${month}`)
    }
  }

  // Day of week
  if (dow !== '*') {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const dowNum = parseInt(dow)
    if (dowNum >= 0 && dowNum <= 6) {
      descriptions.push(`on ${dayNames[dowNum]}`)
    } else {
      descriptions.push(`on day-of-week ${dow}`)
    }
  }

  if (descriptions.length === 0) return 'Runs every minute'

  // Capitalize first word
  const result = descriptions.join(', ')
  return result.charAt(0).toUpperCase() + result.slice(1)
}

export const COMMON_PRESETS: { label: string; cron: string }[] = [
  { label: 'Every minute', cron: '* * * * *' },
  { label: 'Every 5 minutes', cron: '*/5 * * * *' },
  { label: 'Every 15 minutes', cron: '*/15 * * * *' },
  { label: 'Every 30 minutes', cron: '*/30 * * * *' },
  { label: 'Every hour', cron: '0 * * * *' },
  { label: 'Every 2 hours', cron: '0 */2 * * *' },
  { label: 'Every 6 hours', cron: '0 */6 * * *' },
  { label: 'Every 12 hours', cron: '0 */12 * * *' },
  { label: 'Daily at midnight', cron: '0 0 * * *' },
  { label: 'Daily at 9 AM', cron: '0 9 * * *' },
  { label: 'Weekdays at 9 AM', cron: '0 9 * * 1-5' },
  { label: 'Weekly on Monday', cron: '0 9 * * 1' },
  { label: 'Monthly on 1st', cron: '0 0 1 * *' },
  { label: 'Yearly on Jan 1st', cron: '0 0 1 1 *' },
]

export const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, i) => String(i))
export const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => String(i))
export const DAY_OF_MONTH_OPTIONS = Array.from({ length: 31 }, (_, i) => String(i + 1))
export const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => String(i + 1))
export const DAY_OF_WEEK_OPTIONS = [
  { value: '0', label: 'Sunday' },
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' },
]
