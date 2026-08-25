export interface CronParsedResult {
  isValid: boolean
  description: string
  nextRuns: string[]
  error?: string
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const MACROS: Record<string, string> = {
  '@yearly': '0 0 1 1 *',
  '@annually': '0 0 1 1 *',
  '@monthly': '0 0 1 * *',
  '@weekly': '0 0 * * 0',
  '@daily': '0 0 * * *',
  '@midnight': '0 0 * * *',
  '@hourly': '0 * * * *',
}

const MONTH_MAP: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12
}

const DAY_MAP: Record<string, number> = {
  sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6
}

export function parseCronExpression(rawCron: string): CronParsedResult {
  let cron = rawCron.trim().toLowerCase()
  if (MACROS[cron]) {
    cron = MACROS[cron]
  }

  // Replace Quartz '?' with '*'
  cron = cron.replace(/\?/g, '*')

  const parts = cron.split(/\s+/)
  if (parts.length !== 5) {
    return {
      isValid: false,
      description: 'Invalid expression',
      nextRuns: [],
      error: 'Cron expression must contain exactly 5 fields (minute, hour, day-of-month, month, day-of-week) or a macro like @daily.'
    }
  }

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts

  function parsePartValue(partVal: string, nameMap?: Record<string, number>): number {
    const cleaned = partVal.trim().toLowerCase()
    if (nameMap && nameMap[cleaned] !== undefined) {
      return nameMap[cleaned]
    }
    return parseInt(cleaned, 10)
  }

  function describePart(part: string, unit: string, names?: string[], nameMap?: Record<string, number>): string {
    if (part === '*') return `every ${unit}`
    if (part.startsWith('*/')) {
      const step = part.replace('*/', '')
      return `every ${step} ${unit}s`
    }
    if (part.includes(',')) {
      const vals = part.split(',').map(v => {
        const num = parsePartValue(v, nameMap)
        return names ? names[num] || names[num % 7] || v : v
      })
      return `at ${unit}s ${vals.join(', ')}`
    }
    if (part.includes('-')) {
      const [start, end] = part.split('-')
      const sNum = parsePartValue(start, nameMap)
      const eNum = parsePartValue(end, nameMap)
      const s = names ? names[sNum] || names[sNum % 7] || start : start
      const e = names ? names[eNum] || names[eNum % 7] || end : end
      return `from ${s} through ${e}`
    }
    const num = parsePartValue(part, nameMap)
    const val = names ? names[num] || names[num % 7] || part : part
    return `at ${unit} ${val}`
  }

  const descMinute = describePart(minute, 'minute')
  const descHour = describePart(hour, 'hour')
  const descDay = describePart(dayOfMonth, 'day of month')
  const descMonth = describePart(month, 'month', MONTHS, MONTH_MAP)
  const descWeek = describePart(dayOfWeek, 'day of week', DAYS, DAY_MAP)

  const humanDesc = `Runs ${descMinute}, ${descHour}, ${descDay}, ${descMonth}, and ${descWeek}.`

  // Generate next 5 scheduled timestamps starting from now
  const nextRuns: string[] = []
  const now = new Date()
  let current = new Date(now.getTime() + 60000)
  current.setSeconds(0, 0)

  let maxLoop = 525600 // max 1 year check
  while (nextRuns.length < 5 && maxLoop > 0) {
    maxLoop--
    const m = current.getMinutes()
    const h = current.getHours()
    const dom = current.getDate()
    const mon = current.getMonth() + 1
    const dow = current.getDay()

    const matchMin = matchField(minute, m)
    const matchHour = matchField(hour, h)
    const matchDom = matchField(dayOfMonth, dom)
    const matchMon = matchField(month, mon, MONTH_MAP)
    const matchDow = matchField(dayOfWeek, dow, DAY_MAP)

    if (matchMin && matchHour && matchDom && matchMon && matchDow) {
      nextRuns.push(current.toUTCString())
    }

    current = new Date(current.getTime() + 60000)
  }

  return {
    isValid: true,
    description: humanDesc,
    nextRuns
  }
}

function matchField(field: string, val: number, nameMap?: Record<string, number>): boolean {
  if (field === '*') return true
  if (field.startsWith('*/')) {
    const step = parseInt(field.replace('*/', ''), 10)
    return !isNaN(step) && step > 0 && val % step === 0
  }
  if (field.includes(',')) {
    return field.split(',').some(v => matchSingleValue(v, val, nameMap))
  }
  if (field.includes('-')) {
    const [startStr, endStr] = field.split('-')
    const start = nameMap && nameMap[startStr] !== undefined ? nameMap[startStr] : parseInt(startStr, 10)
    const end = nameMap && nameMap[endStr] !== undefined ? nameMap[endStr] : parseInt(endStr, 10)
    return val >= start && val <= end
  }
  return matchSingleValue(field, val, nameMap)
}

function matchSingleValue(v: string, val: number, nameMap?: Record<string, number>): boolean {
  const cleaned = v.trim().toLowerCase()
  if (nameMap && nameMap[cleaned] !== undefined) {
    return nameMap[cleaned] === val
  }
  const parsed = parseInt(cleaned, 10)
  if (isNaN(parsed)) return false
  return parsed === val || (val === 0 && parsed === 7) // handle 7 as Sunday
}
