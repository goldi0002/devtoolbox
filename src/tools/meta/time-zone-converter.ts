import { lazy } from 'react'
import type { ToolMeta } from '../tool-meta'

export const TIME_ZONE_CONVERTER_META: ToolMeta = {
  slug: 'time-zone-converter',
  name: 'Time Zone Converter & Meeting Planner',
  description: 'Pick a date and time in one time zone and see it in other zones, with a 24-hour planner that highlights working hours. Daylight saving aware, all in your browser.',
  category: 'data-tools',
  tag: 'time',
  icon: 'Globe',
  keywords: [
    'time zone converter',
    'timezone converter',
    'world clock',
    'meeting planner',
    'time zone meeting planner',
    'convert time zones',
    'daylight saving time',
    'dst converter',
    'utc converter',
    'iana time zone',
  ],
  toolComponent: lazy(() => import('../../components/tools/data-tools/TimeZoneConverter')),
  about: {
    summary: 'Time Zone Converter shows one moment in several time zones at once. Choose a source zone, a date and a time, then add or remove zones. The converter uses your browser\'s own time zone rules, so daylight saving changes are applied for the exact date you pick. The meeting planner lays the 24 hours of the chosen day across every zone and highlights local working hours. Nothing is uploaded.',
    useCases: [
      'Finding a meeting time that works for a distributed team.',
      'Checking what time a deadline or release falls in another country.',
      'Confirming how a daylight saving change moves a schedule.',
      'Writing a one-line time summary for a calendar invite or chat message.',
    ],
    features: [
      'Converts one wall-clock time into any number of zones, with each zone\'s UTC offset.',
      'Flags times that do not exist (clocks jump forward) or happen twice (clocks fall back).',
      'Marks zones that are currently on daylight saving time.',
      'Searches zones by city or IANA name, such as "kolkata" or "America/Chicago".',
      'Meeting planner grid with shaded working hours, adjustable start and end.',
      'Copy a one-line summary of the conversion.',
    ],
    tip: 'Set the source zone to the zone where the meeting is organized, then check the planner for hours that are shaded in every row.',
  },
  addedAt: '2026-11-17',
  complexity: 'moderate',
  isNew: true,
  status: 'stable',
  seo: {
    title: 'Time Zone Converter & Meeting Planner — Compare world clocks online',
    description: 'Convert a date and time across time zones, with DST handling and a meeting planner that highlights working hours. 100% client-side and private.',
    extraKeywords: [
      'time zone converter online',
      'world clock converter',
      'meeting time zone planner',
      'daylight saving time converter',
      'what time is it in another time zone',
    ],
  },
  guide: {
    steps: [
      {
        name: 'Set the source time',
        text: 'Choose the source zone, then enter the date and time in that zone. Now fills in the current time in the source zone when you want the present moment.',
      },
      {
        name: 'Add or remove zones',
        text: 'Search for a city or IANA name, such as Kolkata or Europe/Paris, and press Add. Remove deletes a zone from the table and the planner.',
      },
      {
        name: 'Read the conversion table',
        text: 'Each row shows the local date and time, the UTC offset and whether that zone is on daylight saving time right now. A "+1 day" or "-1 day" note marks a different calendar date.',
      },
      {
        name: 'Plan the meeting',
        text: 'The planner shows 24 consecutive hours starting at midnight of the source day. Each column is the same moment in every zone. Shaded cells fall within the working hours you set, which apply to each zone\'s local clock.',
      },
      {
        name: 'Copy the summary',
        text: 'Copy summary places one line on your clipboard with the source time and each zone\'s time, ready to paste into a message or invite.',
      },
    ],
    faqs: [
      {
        question: 'Does it handle daylight saving time?',
        answer: 'Yes. Offsets come from your browser\'s time zone rules for the exact date you enter. A time that does not exist during a spring-forward change is shown shifted forward and flagged. A time that occurs twice during a fall-back change is shown as its first occurrence and flagged.',
      },
      {
        question: 'Where does the list of time zones come from?',
        answer: 'From your browser, through Intl.supportedValuesOf("timeZone"). If the browser does not provide that list, a built-in list of common zones is used. No time zone database is downloaded.',
      },
      {
        question: 'Why does the planner start at midnight in the source zone?',
        answer: 'Each column is one hour after the previous one, starting at local midnight of the chosen date in the source zone. That keeps every column aligned to the same moment across all rows, so a shaded column in every row is a time everyone can attend.',
      },
      {
        question: 'Is my data sent anywhere?',
        answer: 'No. Every conversion runs in your browser. Nothing you enter is sent to a server.',
      },
    ],
    example: {
      title: 'Convert a New York meeting to London and Kolkata.',
      input: 'America/New_York, 2026-03-29 09:00\nZones: Europe/London, Asia/Kolkata',
      output: '2026-03-29 09:00 America/New_York (UTC-04:00) = Europe/London 14:00 (UTC+01:00); Asia/Kolkata 18:30 (UTC+05:30)',
      inputLabel: 'Source time and zones',
      outputLabel: 'Summary line',
    },
  },
}
