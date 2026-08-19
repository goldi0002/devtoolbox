import { lazy } from "react"
import { ToolMeta } from "../tool-meta"

export const AGE_CALCULATOR_META: ToolMeta = {
  slug: 'age-calculator',
  name: 'Age & Lifetime Milestone Calculator',
  category: 'data-tools',
  tag: 'AGE',
  description: 'Calculate your exact age down to the second, total days, hours, minutes, heartbeats, breaths, next birthday countdown, and planetary ages.',
  keywords: ['age calculator', 'calculate age', 'date of birth calculator', 'birthday countdown', 'days lived', 'hours lived', 'minutes lived', 'planetary age'],
  status: 'stable',
  isNew: true,
  toolComponent: lazy(() => import('../../components/tools/data-tools/AgeCalculator')),
  seo: {
    title: 'Age & Lifetime Milestone Calculator (Years, Months, Days, Hours, Seconds)',
    description: 'Calculate your exact chronological age in years, months, days, hours, minutes, and seconds with live ticking updates, birthday countdowns, and planetary orbits.',
    extraKeywords: ['exact age in seconds', 'how many days old am i', 'total hours alive', 'next birthday countdown', 'milestone calculator'],
  },
  about: {
    summary: 'The Age & Lifetime Milestone Calculator accurately computes elapsed time between a birth date and any target date down to the millisecond. It provides granular breakdowns into years, months, weeks, days, hours, minutes, and seconds, alongside biological milestones and planetary ages.',
    useCases: [
      'Finding your exact chronological age down to the second with live clock ticking',
      'Calculating total hours, minutes, seconds, and milliseconds lived so far',
      'Tracking the exact countdown (days, hours, minutes, seconds) to your next birthday',
      'Estimating biological metrics like total heartbeats, breaths taken, and sleep hours',
      'Discovering your age on other planets in the solar system (Mercury, Venus, Mars, Jupiter, Saturn)'
    ],
    features: [
      'Live real-time ticking clock showing exact years, months, days, hours, minutes, and seconds',
      'Complete unit conversions: total days, weeks, hours, minutes, seconds, and milliseconds',
      'Next birthday countdown and day of the week determination',
      'Astrological Western and Chinese zodiac profile matching',
      'Estimated heartbeats, breaths taken, and sleep hours lived',
      'Planetary solar orbit age conversions and milestone achievement trackers (10k days, 1 billion seconds)'
    ],
    notes: [
      'Accounts accurately for varying month lengths and leap years',
      'All calculations run 100% locally in your browser with zero network requests'
    ],
    tip: 'Click any sample preset to explore age calculations for different generations and historical milestones.'
  }
}
