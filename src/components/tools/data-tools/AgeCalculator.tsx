import { useState, useEffect, useMemo } from 'react'
import ToolLayout from '../../ToolLayout'
import { tools } from '../../../tools/registry'
import {
  Calendar,
  Clock,
  Heart,
  Moon,
  Sparkles,
  Zap,
  Gift,
  Globe,
  Share2,
  Check,
  RefreshCw,
  Compass,
  Hourglass,
  Flame,
  Award
} from 'lucide-react'
import CopyButton from '../../CopyButton'

interface AgeBreakdown {
  years: number
  months: number
  days: number
  hours: number
  minutes: number
  seconds: number
  totalDays: number
  totalWeeks: number
  totalHours: number
  totalMinutes: number
  totalSeconds: number
  totalMilliseconds: number
  nextBirthdayDays: number
  nextBirthdayHours: number
  nextBirthdayMinutes: number
  nextBirthdaySeconds: number
  nextBirthdayDayOfWeek: string
  nextAge: number
  dayOfWeekBorn: string
  zodiacSign: string
  chineseZodiac: string
  heartbeats: number
  breaths: number
  sleepHours: number
  lifespanPercentage: number
  planetaryAges: { planet: string; age: number; periodDays: number }[]
  milestones: { name: string; date: Date; passed: boolean; remainingDays: number }[]
}

const ZODIAC_SIGNS = [
  { name: 'Capricorn', start: [1, 1], end: [1, 19] },
  { name: 'Aquarius', start: [1, 20], end: [2, 18] },
  { name: 'Pisces', start: [2, 19], end: [3, 20] },
  { name: 'Aries', start: [3, 21], end: [4, 19] },
  { name: 'Taurus', start: [4, 20], end: [5, 20] },
  { name: 'Gemini', start: [5, 21], end: [6, 20] },
  { name: 'Cancer', start: [6, 21], end: [7, 22] },
  { name: 'Leo', start: [7, 23], end: [8, 22] },
  { name: 'Virgo', start: [8, 23], end: [9, 22] },
  { name: 'Libra', start: [9, 23], end: [10, 22] },
  { name: 'Scorpio', start: [10, 23], end: [11, 21] },
  { name: 'Sagittarius', start: [11, 22], end: [12, 21] },
  { name: 'Capricorn', start: [12, 22], end: [12, 31] },
]

const CHINESE_ZODIAC = [
  'Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake',
  'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'
]

const PLANETS = [
  { planet: 'Mercury', periodDays: 87.97 },
  { planet: 'Venus', periodDays: 224.7 },
  { planet: 'Mars', periodDays: 686.98 },
  { planet: 'Jupiter', periodDays: 4332.59 },
  { planet: 'Saturn', periodDays: 10759.22 },
]

function getZodiac(month: number, day: number): string {
  for (const sign of ZODIAC_SIGNS) {
    const [sm, sd] = sign.start
    const [em, ed] = sign.end
    if (
      (month === sm && day >= sd) ||
      (month === em && day <= ed)
    ) {
      return sign.name
    }
  }
  return 'Capricorn'
}

function calculateAgeDetails(birthDateStr: string, birthTimeStr: string, compareDate: Date): AgeBreakdown | null {
  if (!birthDateStr) return null

  const [year, month, day] = birthDateStr.split('-').map(Number)
  const [hour = 0, minute = 0] = (birthTimeStr || '00:00').split(':').map(Number)

  const birth = new Date(year, month - 1, day, hour, minute, 0, 0)
  if (isNaN(birth.getTime())) return null

  const now = compareDate
  const diffMs = now.getTime() - birth.getTime()
  if (diffMs < 0) return null

  // Exact calendar differences
  let years = now.getFullYear() - birth.getFullYear()
  let months = now.getMonth() - birth.getMonth()
  let days = now.getDate() - birth.getDate()
  let hours = now.getHours() - birth.getHours()
  let minutes = now.getMinutes() - birth.getMinutes()
  let seconds = now.getSeconds() - birth.getSeconds()

  if (seconds < 0) {
    seconds += 60
    minutes--
  }
  if (minutes < 0) {
    minutes += 60
    hours--
  }
  if (hours < 0) {
    hours += 24
    days--
  }
  if (days < 0) {
    const prevMonthLastDay = new Date(now.getFullYear(), now.getMonth(), 0).getDate()
    days += prevMonthLastDay
    months--
  }
  if (months < 0) {
    months += 12
    years--
  }

  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const totalWeeks = Math.floor(totalDays / 7)
  const totalHours = Math.floor(diffMs / (1000 * 60 * 60))
  const totalMinutes = Math.floor(diffMs / (1000 * 60))
  const totalSeconds = Math.floor(diffMs / 1000)

  // Next birthday calculation
  let nextBday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate(), birth.getHours(), birth.getMinutes(), 0)
  if (nextBday.getTime() <= now.getTime()) {
    nextBday = new Date(now.getFullYear() + 1, birth.getMonth(), birth.getDate(), birth.getHours(), birth.getMinutes(), 0)
  }
  const nextBdayDiff = nextBday.getTime() - now.getTime()
  const nextBirthdayDays = Math.floor(nextBdayDiff / (1000 * 60 * 60 * 24))
  const nextBirthdayHours = Math.floor((nextBdayDiff / (1000 * 60 * 60)) % 24)
  const nextBirthdayMinutes = Math.floor((nextBdayDiff / (1000 * 60)) % 60)
  const nextBirthdaySeconds = Math.floor((nextBdayDiff / 1000) % 60)
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const nextBirthdayDayOfWeek = daysOfWeek[nextBday.getDay()]
  const dayOfWeekBorn = daysOfWeek[birth.getDay()]
  const nextAge = nextBday.getFullYear() - birth.getFullYear()

  // Zodiac
  const zodiacSign = getZodiac(birth.getMonth() + 1, birth.getDate())
  const chineseIndex = (birth.getFullYear() - 4) % 12
  const chineseZodiac = CHINESE_ZODIAC[(chineseIndex + 12) % 12]

  // Biological Estimates
  const heartbeats = Math.floor(totalMinutes * 75) // ~75 bpm average
  const breaths = Math.floor(totalMinutes * 16) // ~16 breaths/min
  const sleepHours = Math.floor(totalDays * 8) // ~8 hrs/day
  const lifespanPercentage = Math.min(100, parseFloat(((totalDays / (80 * 365.25)) * 100).toFixed(2)))

  // Planetary ages
  const planetaryAges = PLANETS.map(p => ({
    planet: p.planet,
    age: parseFloat((totalDays / p.periodDays).toFixed(2)),
    periodDays: p.periodDays,
  }))

  // Next Major Milestones
  const milestonesList = [
    { name: '10,000 Days', targetDays: 10000 },
    { name: '15,000 Days', targetDays: 15000 },
    { name: '20,000 Days', targetDays: 20000 },
    { name: '25,000 Days', targetDays: 25000 },
    { name: '500 Million Seconds', targetSeconds: 500000000 },
    { name: '1 Billion Seconds', targetSeconds: 1000000000 },
    { name: '2 Billion Seconds', targetSeconds: 2000000000 },
  ]

  const milestones = milestonesList.map(m => {
    let targetDate: Date
    if (m.targetDays) {
      targetDate = new Date(birth.getTime() + m.targetDays * 24 * 60 * 60 * 1000)
    } else {
      targetDate = new Date(birth.getTime() + (m.targetSeconds || 0) * 1000)
    }
    const passed = targetDate.getTime() <= now.getTime()
    const remainingDays = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return {
      name: m.name,
      date: targetDate,
      passed,
      remainingDays,
    }
  })

  return {
    years,
    months,
    days,
    hours,
    minutes,
    seconds,
    totalDays,
    totalWeeks,
    totalHours,
    totalMinutes,
    totalSeconds,
    totalMilliseconds: diffMs,
    nextBirthdayDays,
    nextBirthdayHours,
    nextBirthdayMinutes,
    nextBirthdaySeconds,
    nextBirthdayDayOfWeek,
    nextAge,
    dayOfWeekBorn,
    zodiacSign,
    chineseZodiac,
    heartbeats,
    breaths,
    sleepHours,
    lifespanPercentage,
    planetaryAges,
    milestones,
  }
}

const PRESETS = [
  { label: 'Gen Z (2000-01-01)', date: '2000-01-01', time: '00:00' },
  { label: 'Millennial (1990-05-15)', date: '1990-05-15', time: '08:30' },
  { label: 'Unix Epoch (1970-01-01)', date: '1970-01-01', time: '00:00' },
  { label: 'Moon Landing (1969-07-20)', date: '1969-07-20', time: '20:17' },
]

export default function AgeCalculator() {
  const [birthDate, setBirthDate] = useState('1995-06-15')
  const [birthTime, setBirthTime] = useState('09:30')
  const [liveTicker, setLiveTicker] = useState(true)
  const [currentNow, setCurrentNow] = useState<Date>(new Date())
  const [customCompareDate, setCustomCompareDate] = useState('')
  const [useCustomCompare, setUseCustomCompare] = useState(false)

  const meta = tools.find(t => t.slug === 'age-calculator')

  // Live ticking clock every second
  useEffect(() => {
    if (!liveTicker || useCustomCompare) return
    const timer = setInterval(() => {
      setCurrentNow(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [liveTicker, useCustomCompare])

  const targetDate = useMemo(() => {
    if (useCustomCompare && customCompareDate) {
      const d = new Date(customCompareDate)
      return isNaN(d.getTime()) ? currentNow : d
    }
    return currentNow
  }, [useCustomCompare, customCompareDate, currentNow])

  const stats = useMemo(() => {
    return calculateAgeDetails(birthDate, birthTime, targetDate)
  }, [birthDate, birthTime, targetDate])

  const summaryText = stats
    ? `Age: ${stats.years} years, ${stats.months} months, ${stats.days} days, ${stats.hours} hours, ${stats.minutes} minutes, and ${stats.seconds} seconds. (${stats.totalDays.toLocaleString()} total days lived)`
    : ''

  return (
    <ToolLayout
      title={meta?.name || 'Age & Lifetime Milestone Calculator'}
      description={meta?.description || 'Calculate your exact age in years, months, days, hours, minutes, and seconds with live ticking updates, planetary ages, and milestone countdowns.'}
      tag="AGE"
    >
      <div className="space-y-6">
        {/* Sample Presets */}
        <div className="flex flex-wrap items-center gap-2 p-3 bg-surface border border-border rounded-xl">
          <div className="flex items-center gap-1.5 text-xs font-mono text-dim mr-2">
            <Sparkles size={14} className="text-accent" />
            <span>Presets:</span>
          </div>
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setBirthDate(preset.date)
                setBirthTime(preset.time)
              }}
              className="px-2.5 py-1 rounded-md text-xs font-mono bg-muted/40 hover:bg-muted text-bright border border-border/50 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Input Controls Bar */}
        <div className="p-4 bg-surface border border-border rounded-xl space-y-4 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-mono text-dim mb-1 font-medium">
                Date of Birth (DOB)
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono bg-bg border border-border rounded-lg text-bright focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-dim mb-1 font-medium">
                Time of Birth (Optional)
              </label>
              <input
                type="time"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono bg-bg border border-border rounded-lg text-bright focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-dim mb-1 font-medium">
                Compare Against
              </label>
              <div className="flex items-center gap-2 h-9.5">
                <button
                  type="button"
                  onClick={() => setUseCustomCompare(false)}
                  className={`flex-1 py-1.5 px-2 text-xs font-mono rounded-lg border transition-colors ${
                    !useCustomCompare
                      ? 'bg-accent/15 border-accent text-accent font-semibold'
                      : 'bg-bg border-border text-dim hover:text-bright'
                  }`}
                >
                  Today (Live)
                </button>
                <button
                  type="button"
                  onClick={() => setUseCustomCompare(true)}
                  className={`flex-1 py-1.5 px-2 text-xs font-mono rounded-lg border transition-colors ${
                    useCustomCompare
                      ? 'bg-accent/15 border-accent text-accent font-semibold'
                      : 'bg-bg border-border text-dim hover:text-bright'
                  }`}
                >
                  Custom Date
                </button>
              </div>
            </div>

            {useCustomCompare ? (
              <div>
                <label className="block text-xs font-mono text-dim mb-1 font-medium">
                  Custom Target Date
                </label>
                <input
                  type="date"
                  value={customCompareDate}
                  onChange={(e) => setCustomCompareDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono bg-bg border border-border rounded-lg text-bright focus:outline-none focus:border-accent"
                />
              </div>
            ) : (
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-dim hover:text-bright select-none">
                  <input
                    type="checkbox"
                    checked={liveTicker}
                    onChange={(e) => setLiveTicker(e.target.checked)}
                    className="rounded border-border bg-bg text-accent focus:ring-0"
                  />
                  <span>Live running seconds ticker</span>
                </label>
              </div>
            )}
          </div>
        </div>

        {stats ? (
          <div className="space-y-6">
            {/* Primary Hero Age Display */}
            <div className="p-6 bg-surface border border-accent/30 rounded-2xl shadow-md relative overflow-hidden">
              <span aria-hidden="true" className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <span className="eyebrow block mb-1 text-accent">EXACT AGE BREAKDOWN</span>
                  <h3 className="text-xl sm:text-2xl font-mono font-bold text-bright tracking-tight">
                    {stats.years} Years, {stats.months} Months, {stats.days} Days
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <CopyButton text={summaryText} />
                </div>
              </div>

              {/* Dynamic Live Units Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 pt-2">
                <div className="p-3 bg-bg/80 border border-border/80 rounded-xl text-center">
                  <span className="text-2xl sm:text-3xl font-mono font-bold text-indigo-400 block">{stats.years}</span>
                  <span className="text-[11px] font-mono text-dim">Years</span>
                </div>
                <div className="p-3 bg-bg/80 border border-border/80 rounded-xl text-center">
                  <span className="text-2xl sm:text-3xl font-mono font-bold text-emerald-400 block">{stats.months}</span>
                  <span className="text-[11px] font-mono text-dim">Months</span>
                </div>
                <div className="p-3 bg-bg/80 border border-border/80 rounded-xl text-center">
                  <span className="text-2xl sm:text-3xl font-mono font-bold text-amber-400 block">{stats.days}</span>
                  <span className="text-[11px] font-mono text-dim">Days</span>
                </div>
                <div className="p-3 bg-bg/80 border border-border/80 rounded-xl text-center">
                  <span className="text-2xl sm:text-3xl font-mono font-bold text-cyan-400 block">{stats.hours}</span>
                  <span className="text-[11px] font-mono text-dim">Hours</span>
                </div>
                <div className="p-3 bg-bg/80 border border-border/80 rounded-xl text-center">
                  <span className="text-2xl sm:text-3xl font-mono font-bold text-purple-400 block">{stats.minutes}</span>
                  <span className="text-[11px] font-mono text-dim">Minutes</span>
                </div>
                <div className="p-3 bg-bg/80 border border-accent/40 rounded-xl text-center bg-accent/5">
                  <span className="text-2xl sm:text-3xl font-mono font-bold text-accent block animate-pulse">
                    {stats.seconds.toString().padStart(2, '0')}
                  </span>
                  <span className="text-[11px] font-mono text-accent">Seconds</span>
                </div>
              </div>
            </div>

            {/* Next Birthday & Life Progress Strip */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Next Birthday Card */}
              <div className="p-5 bg-surface border border-border rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-amber-400">
                  <Gift size={18} />
                  <h4 className="text-sm font-mono font-bold text-bright">Next Birthday Countdown</h4>
                </div>
                <p className="text-xs text-dim">
                  Turning <strong className="text-bright font-mono">{stats.nextAge}</strong> on a <strong className="text-bright font-mono">{stats.nextBirthdayDayOfWeek}</strong>
                </p>
                <div className="grid grid-cols-4 gap-2 text-center pt-1 font-mono">
                  <div className="p-2 bg-bg border border-border/70 rounded-lg">
                    <span className="text-lg font-bold text-bright block">{stats.nextBirthdayDays}</span>
                    <span className="text-[10px] text-dim">Days</span>
                  </div>
                  <div className="p-2 bg-bg border border-border/70 rounded-lg">
                    <span className="text-lg font-bold text-bright block">{stats.nextBirthdayHours}</span>
                    <span className="text-[10px] text-dim">Hours</span>
                  </div>
                  <div className="p-2 bg-bg border border-border/70 rounded-lg">
                    <span className="text-lg font-bold text-bright block">{stats.nextBirthdayMinutes}</span>
                    <span className="text-[10px] text-dim">Mins</span>
                  </div>
                  <div className="p-2 bg-bg border border-border/70 rounded-lg">
                    <span className="text-lg font-bold text-bright block">{stats.nextBirthdaySeconds}</span>
                    <span className="text-[10px] text-dim">Secs</span>
                  </div>
                </div>
              </div>

              {/* Astrological & Birth Day Insights */}
              <div className="p-5 bg-surface border border-border rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-indigo-400">
                  <Compass size={18} />
                  <h4 className="text-sm font-mono font-bold text-bright">Birth Astrological Profile</h4>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-center">
                  <div className="p-2.5 bg-bg border border-border/70 rounded-lg">
                    <span className="text-[10px] text-dim block mb-1">Day Born</span>
                    <span className="text-xs font-bold text-cyan-400">{stats.dayOfWeekBorn}</span>
                  </div>
                  <div className="p-2.5 bg-bg border border-border/70 rounded-lg">
                    <span className="text-[10px] text-dim block mb-1">Western Zodiac</span>
                    <span className="text-xs font-bold text-purple-400">{stats.zodiacSign}</span>
                  </div>
                  <div className="p-2.5 bg-bg border border-border/70 rounded-lg">
                    <span className="text-[10px] text-dim block mb-1">Chinese Zodiac</span>
                    <span className="text-xs font-bold text-emerald-400">{stats.chineseZodiac}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Lifetime Units Breakdown */}
            <div className="p-5 bg-surface border border-border rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-mono font-bold text-bright">Total Lifetime Units Breakdown</h4>
                  <p className="text-xs text-dim">Your complete existence represented in individual time increments</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 font-mono text-xs">
                <div className="p-3 bg-bg border border-border/70 rounded-lg">
                  <span className="text-dim block text-[11px]">Total Days Lived</span>
                  <span className="text-base font-bold text-emerald-400">{stats.totalDays.toLocaleString()}</span>
                </div>
                <div className="p-3 bg-bg border border-border/70 rounded-lg">
                  <span className="text-dim block text-[11px]">Total Weeks</span>
                  <span className="text-base font-bold text-indigo-400">{stats.totalWeeks.toLocaleString()}</span>
                </div>
                <div className="p-3 bg-bg border border-border/70 rounded-lg">
                  <span className="text-dim block text-[11px]">Total Hours</span>
                  <span className="text-base font-bold text-amber-400">{stats.totalHours.toLocaleString()}</span>
                </div>
                <div className="p-3 bg-bg border border-border/70 rounded-lg">
                  <span className="text-dim block text-[11px]">Total Minutes</span>
                  <span className="text-base font-bold text-cyan-400">{stats.totalMinutes.toLocaleString()}</span>
                </div>
                <div className="p-3 bg-bg border border-border/70 rounded-lg sm:col-span-2">
                  <span className="text-dim block text-[11px]">Total Seconds</span>
                  <span className="text-base font-bold text-purple-400">{stats.totalSeconds.toLocaleString()}</span>
                </div>
                <div className="p-3 bg-bg border border-border/70 rounded-lg sm:col-span-2">
                  <span className="text-dim block text-[11px]">Total Milliseconds</span>
                  <span className="text-base font-bold text-rose-400">{stats.totalMilliseconds.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Biological Estimates & Planetary Ages Split */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Biological Estimates */}
              <div className="p-5 bg-surface border border-border rounded-xl space-y-4">
                <div className="flex items-center gap-2 text-rose-400">
                  <Heart size={18} />
                  <h4 className="text-sm font-mono font-bold text-bright">Estimated Biological Milestones</h4>
                </div>
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-bg border border-border/70 rounded-lg">
                    <span className="text-dim">Estimated Heartbeats (~75 bpm):</span>
                    <span className="font-bold text-rose-400">{stats.heartbeats.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-bg border border-border/70 rounded-lg">
                    <span className="text-dim">Estimated Breaths Taken (~16/min):</span>
                    <span className="font-bold text-cyan-400">{stats.breaths.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-bg border border-border/70 rounded-lg">
                    <span className="text-dim">Estimated Sleep Time (~8 hrs/day):</span>
                    <span className="font-bold text-indigo-400">{stats.sleepHours.toLocaleString()} hours</span>
                  </div>
                  <div className="p-2.5 bg-bg border border-border/70 rounded-lg space-y-1.5">
                    <div className="flex justify-between text-dim">
                      <span>Lifespan (relative to 80-year baseline):</span>
                      <span className="font-bold text-bright">{stats.lifespanPercentage}%</span>
                    </div>
                    <div className="w-full bg-surface h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-accent h-full transition-all duration-500"
                        style={{ width: `${stats.lifespanPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Planetary Ages */}
              <div className="p-5 bg-surface border border-border rounded-xl space-y-4">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Globe size={18} />
                  <h4 className="text-sm font-mono font-bold text-bright">Age on Other Solar Planets</h4>
                </div>
                <div className="space-y-2 font-mono text-xs">
                  {stats.planetaryAges.map((p) => (
                    <div key={p.planet} className="flex items-center justify-between p-2 bg-bg border border-border/70 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400" />
                        <span className="text-bright font-medium">{p.planet}</span>
                        <span className="text-[10px] text-dim">({p.periodDays} Earth days / orbit)</span>
                      </div>
                      <span className="font-bold text-cyan-400">{p.age} years</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Lifetime Milestones Tracker */}
            <div className="p-5 bg-surface border border-border rounded-xl space-y-4">
              <div className="flex items-center gap-2 text-amber-400">
                <Award size={18} />
                <h4 className="text-sm font-mono font-bold text-bright">Next Major Lifetime Milestones</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 font-mono text-xs">
                {stats.milestones.map((m) => (
                  <div
                    key={m.name}
                    className={`p-3 rounded-lg border ${
                      m.passed
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-bg border-border/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-bright">{m.name}</span>
                      {m.passed ? (
                        <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                          <Check size={12} /> Achieved
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-400 font-semibold">
                          In {m.remainingDays.toLocaleString()} days
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-dim block">
                      {m.date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-surface border border-border rounded-xl text-center text-dim font-mono text-xs">
            Please enter a valid date of birth earlier than the comparison date.
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
