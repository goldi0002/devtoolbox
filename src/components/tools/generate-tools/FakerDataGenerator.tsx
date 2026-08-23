import { useMemo, useState } from 'react'
import ToolLayout from '../../ToolLayout'
import OutputPanel from '../../ui/OutputPanel'
import StatCard from '../../ui/StatCard'
import TipsCard from '../../ui/TipsCard'
import ToggleGroup from '../../ui/ToggleGroup'
import { RefreshCw } from 'lucide-react'

type DataType = 'all' | 'names' | 'emails' | 'phones' | 'addresses' | 'companies' | 'dates' | 'ips' | 'colors' | 'usernames' | 'sentences' | 'uuids'
type OutputFormat = 'json' | 'csv' | 'lines'

const DATA_TYPE_OPTIONS = [
  { value: 'all' as const, label: 'All Fields' },
  { value: 'names' as const, label: 'Names' },
  { value: 'emails' as const, label: 'Emails' },
  { value: 'phones' as const, label: 'Phones' },
  { value: 'addresses' as const, label: 'Addresses' },
  { value: 'companies' as const, label: 'Companies' },
  { value: 'dates' as const, label: 'Dates' },
  { value: 'ips' as const, label: 'IPs' },
  { value: 'colors' as const, label: 'Colors' },
  { value: 'usernames' as const, label: 'Usernames' },
  { value: 'sentences' as const, label: 'Sentences' },
  { value: 'uuids' as const, label: 'UUIDs' },
]

const FORMAT_OPTIONS = [
  { value: 'json' as const, label: 'JSON' },
  { value: 'csv' as const, label: 'CSV' },
  { value: 'lines' as const, label: 'Lines' },
]

// ── Pure client-side faker data pools ──────────────────────────────────────

const FIRST_NAMES = [
  'James','Mary','Robert','Patricia','John','Jennifer','Michael','Linda','David','Elizabeth',
  'William','Barbara','Richard','Susan','Joseph','Jessica','Thomas','Sarah','Charles','Karen',
  'Emma','Liam','Olivia','Noah','Ava','Sophia','Isabella','Mia','Charlotte','Amelia',
  'Aiden','Harper','Evelyn','Abigail','Emily','Ella','Madison','Luna','Chloe','Aria',
  'Yuki','Wei','Raj','Sofia','Omar','Fatima','Hiroshi','Priya','Andrei','Valentina',
  'Carlos','Ingrid','Ahmed','Mei','Kwame','Zara','Olga','Diego','Leila','Hassan',
]

const LAST_NAMES = [
  'Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez',
  'Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin',
  'Lee','Perez','Thompson','White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson',
  'Nakamura','Patel','Kim','Muller','Ivanov','Singh','Tanaka','Silva','Petrov','Fischer',
  'Fernandez','Cohen','Ali','Sato','Hansen','Dubois','Nguyen','Schmidt','Popov','Johansson',
]

const DOMAINS = [
  'gmail.com','yahoo.com','outlook.com','protonmail.com','icloud.com','fastmail.com',
  'example.com','company.org','startup.io','devteam.co','mail.dev','work.dev',
  'test.com','demo.app','beta.site','mailtest.io','inbox.dev','code.org',
]

const STREET_NAMES = [
  'Main','Oak','Maple','Cedar','Pine','Elm','Washington','Park','Lake','Sunset',
  'Broadway','Market','Highland','Forest','River','Spring','Valley','Harbor','Meadow','Summit',
]

const STREET_TYPES = ['St','Ave','Blvd','Dr','Rd','Ln','Way','Ct','Pl','Trl']

const CITIES = [
  'San Francisco','New York','London','Tokyo','Berlin','Sydney','Toronto','Paris','Amsterdam','Seoul',
  'Singapore','Stockholm','Austin','Portland','Chicago','Seattle','Denver','Miami','Boston','Nashville',
]

const STATES = [
  'CA','NY','TX','FL','IL','PA','OH','GA','NC','MI',
  'NJ','VA','WA','AZ','MA','TN','IN','MO','MD','WI',
  'England','Ontario','Queensland','Bavaria','Île-de-France','Tokyo','Seoul','Stockholm','NSW','BC',
]

const COUNTRIES = [
  'United States','United Kingdom','Canada','Germany','Japan','Australia','France','Netherlands',
  'South Korea','Sweden','Brazil','India','Italy','Spain','Mexico','Singapore','Norway','Switzerland',
]

const COMPANIES = [
  'Acme Corp','Globex Industries','Initech','Umbrella Co','Hooli','Pied Piper','Stark Industries',
  'Wayne Enterprises','Wonka Industries','Aperture Science','Cyberdyne','Massive Dynamic',
  'Soylent Corp','Tyrell Corporation','Virtucon','Oscorp','LexCorp','Dharma Initiative',
  'Gringotts','Stark Industries','Wonka','Waystar Royco','Lumon Industries','Prestige Worldwide',
]

const TITLES = [
  'Software Engineer','Product Manager','Data Scientist','UX Designer','DevOps Engineer',
  'Frontend Developer','Backend Developer','Full Stack Engineer','Engineering Manager','CTO',
  'Technical Lead','System Architect','Security Engineer','ML Engineer','Site Reliability Engineer',
  'Cloud Architect','QA Engineer','Scrum Master','VP of Engineering','Head of Product',
]

const ADJECTIVES = [
  'quick','bright','calm','eager','fair','gentle','happy','keen','mild','neat',
  'proud','quiet','rapid','sharp','tall','vivid','warm','young','bold','clean',
  'dense','elite','fixed','grand','heavy','inner','large','major','noble','prime',
]

const NOUNS = [
  'river','ocean','stone','flame','wind','peak','wave','storm','cloud','frost',
  'blaze','forge','glade','ridge','grove','meadow','creek','harbor','summit','vista',
  'pixel','block','cloud','stack','panel','scope','prism','vigor','quest','honor',
]

const LOREM_WORDS = [
  'lorem','ipsum','dolor','sit','amet','consectetur','adipiscing','elit','sed','do',
  'eiusmod','tempor','incididunt','ut','labore','et','dolore','magna','aliqua','enim',
  'ad','minim','veniam','quis','nostrud','exercitation','ullamco','laboris','nisi','aliquip',
  'ex','ea','commodo','consequat','duis','aute','irure','reprehenderit','voluptate','velit',
  'esse','cillum','fugiat','nulla','pariatur','excepteur','sint','occaecat','cupidatat','non',
  'proident','sunt','culpa','qui','officia','deserunt','mollit','anim','id','est',
  'laborum','developer','engineer','protocol','server','client','database','function','array','string',
  'boolean','integer','object','module','package','repository','interface','component','service','system',
]

// ── Seeded pseudo-random number generator (Mulberry32) ─────────────────────

function mulberry32(seed: number): () => number {
  let a = seed | 0
  return () => {
    a |= 0
    a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

let rng = mulberry32(Date.now())

function randInt(min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min
}

function pick<T>(arr: readonly T[]): T {
  return arr[randInt(0, arr.length - 1)]
}

function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (rng() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function hexColor(): string {
  return '#' + Array.from({ length: 6 }, () => '0123456789abcdef'[randInt(0, 15)]).join('')
}

function ipV4(): string {
  return `${randInt(1, 223)}.${randInt(0, 255)}.${randInt(0, 255)}.${randInt(1, 254)}`
}

function generateRecord(seedOffset: number, dataType: DataType): Record<string, string> {
  rng = mulberry32(Date.now() + seedOffset * 7919)

  const firstName = pick(FIRST_NAMES)
  const lastName = pick(LAST_NAMES)
  const record: Record<string, string> = {}

  const want = (type: string) => dataType === 'all' || dataType === type

  if (want('names')) {
    record['first_name'] = firstName
    record['last_name'] = lastName
    record['full_name'] = `${firstName} ${lastName}`
  }

  if (want('emails')) {
    const domain = pick(DOMAINS)
    const cleanFirst = firstName.toLowerCase().replace(/[^a-z]/g, '')
    const cleanLast = lastName.toLowerCase().replace(/[^a-z]/g, '')
    const formats = [
      `${cleanFirst}.${cleanLast}@${domain}`,
      `${cleanFirst}${randInt(1, 999)}@${domain}`,
      `${cleanFirst[0]}${cleanLast}@${domain}`,
      `${cleanFirst}_${cleanLast}@${domain}`,
    ]
    record['email'] = pick(formats)
  }

  if (want('phones')) {
    const fmt = pick(['+1-XXX-XXX-XXXX', '+44-XXXX-XXXXXX', '+49-XXX-XXXXXXXX', '+81-XX-XXXX-XXXX'])
    record['phone'] = fmt.replace(/X/g, () => String(randInt(0, 9)))
  }

  if (want('addresses')) {
    record['street'] = `${randInt(1, 9999)} ${pick(STREET_NAMES)} ${pick(STREET_TYPES)}`
    record['city'] = pick(CITIES)
    record['state'] = pick(STATES)
    record['country'] = pick(COUNTRIES)
    record['zip'] = `${randInt(10000, 99999)}`
  }

  if (want('companies')) {
    record['company'] = pick(COMPANIES)
    record['title'] = pick(TITLES)
  }

  if (want('dates')) {
    const year = randInt(1970, 2025)
    const month = String(randInt(1, 12)).padStart(2, '0')
    const day = String(randInt(1, 28)).padStart(2, '0')
    record['date'] = `${year}-${month}-${day}`
  }

  if (want('ips')) {
    record['ipv4'] = ipV4()
  }

  if (want('colors')) {
    record['hex_color'] = hexColor()
  }

  if (want('usernames')) {
    const cleanFirst = firstName.toLowerCase().replace(/[^a-z]/g, '')
    const cleanLast = lastName.toLowerCase().replace(/[^a-z]/g, '')
    const formats = [
      `${cleanFirst}${cleanLast}`,
      `${cleanFirst}.${cleanLast}`,
      `${cleanFirst}${randInt(1, 999)}`,
      `${cleanFirst}_${pick(ADJECTIVES)}`,
    ]
    record['username'] = pick(formats)
  }

  if (want('sentences')) {
    const len = randInt(6, 14)
    const words = Array.from({ length: len }, () => pick(LOREM_WORDS))
    words[0] = words[0][0].toUpperCase() + words[0].slice(1)
    record['sentence'] = words.join(' ') + '.'
  }

  if (want('uuids')) {
    record['uuid'] = uuidv4()
  }

  return record
}

function formatJson(records: Record<string, string>[]): string {
  return JSON.stringify(records, null, 2)
}

function formatCsv(records: Record<string, string>[]): string {
  const allKeys = new Set<string>()
  records.forEach(r => Object.keys(r).forEach(k => allKeys.add(k)))
  const headers = Array.from(allKeys)
  const escapeCsv = (val: string) => {
    if (val.includes(',') || val.includes('"') || val.includes('\n')) {
      return `"${val.replace(/"/g, '""')}"`
    }
    return val
  }
  const lines = [headers.map(escapeCsv).join(',')]
  records.forEach(r => {
    lines.push(headers.map(h => escapeCsv(r[h] ?? '')).join(','))
  })
  return lines.join('\n')
}

function formatLines(records: Record<string, string>[], dataType: DataType): string {
  if (dataType === 'names') return records.map(r => r['full_name']).join('\n')
  if (dataType === 'emails') return records.map(r => r['email']).join('\n')
  if (dataType === 'phones') return records.map(r => r['phone']).join('\n')
  if (dataType === 'ips') return records.map(r => r['ipv4']).join('\n')
  if (dataType === 'colors') return records.map(r => r['hex_color']).join('\n')
  if (dataType === 'uuids') return records.map(r => r['uuid']).join('\n')
  if (dataType === 'usernames') return records.map(r => r['username']).join('\n')
  if (dataType === 'sentences') return records.map(r => r['sentence']).join('\n')
  return records.map(r => {
    const vals = Object.values(r)
    return vals.length === 1 ? vals[0] : vals.join(' | ')
  }).join('\n')
}

export default function FakerDataGenerator() {
  const [count, setCount] = useState(5)
  const [dataType, setDataType] = useState<DataType>('all')
  const [format, setFormat] = useState<OutputFormat>('json')
  const [seed, setSeed] = useState(0)

  const output = useMemo(() => {
    const records = Array.from({ length: Math.min(Math.max(count, 1), 100) }, (_, i) =>
      generateRecord(i + seed, dataType)
    )
    if (format === 'json') return formatJson(records)
    if (format === 'csv') return formatCsv(records)
    return formatLines(records, dataType)
  }, [count, dataType, format, seed])

  const regenerate = () => setSeed(s => s + 1)

  const activeFields = useMemo(() => {
    const record = generateRecord(0, dataType)
    return Object.keys(record)
  }, [dataType])

  return (
    <ToolLayout
      title="Faker Data Generator"
      description="Generate realistic fake names, emails, phones, addresses, and more for testing"
      tag="generate"
    >
      <div className="space-y-5 animate-fade-in">
        {/* Controls */}
        <div className="card space-y-4 bg-surface/40 border border-border/80">
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <h3 className="text-xs font-semibold font-mono text-dim tracking-wider uppercase">
              Generation Settings
            </h3>
            <button
              type="button"
              onClick={regenerate}
              className="flex items-center gap-1.5 text-xs font-mono text-accent hover:text-accent/80 transition-colors"
              title="Regenerate with new random data"
            >
              <RefreshCw size={12} />
              Regenerate
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Count */}
            <div>
              <label className="block text-xs font-mono text-dim mb-1.5">Records (1–100)</label>
              <input
                type="number"
                min={1}
                max={100}
                value={count}
                onChange={e => {
                  const v = parseInt(e.target.value, 10)
                  if (!isNaN(v)) setCount(Math.max(1, Math.min(100, v)))
                }}
                className="input-base w-full"
              />
            </div>

            {/* Data Type */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-mono text-dim mb-1.5">Data Type</label>
              <div className="flex flex-wrap gap-1.5">
                <ToggleGroup options={DATA_TYPE_OPTIONS} value={dataType} onChange={setDataType} />
              </div>
            </div>
          </div>

          {/* Format */}
          <div>
            <label className="block text-xs font-mono text-dim mb-1.5">Output Format</label>
            <div className="flex gap-1.5">
              <ToggleGroup options={FORMAT_OPTIONS} value={format} onChange={setFormat} />
            </div>
          </div>
        </div>

        {/* Output + Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <OutputPanel
              label={`Generated ${count} ${dataType === 'all' ? 'records' : dataType}`}
              value={output}
              heightClass="h-[350px]"
              surface="surface"
              language={format === 'json' ? 'json' : 'text'}
            />
          </div>
          <div className="space-y-3">
            <StatCard label="Records" value={`${count}`} />
            <StatCard label="Fields" value={`${activeFields.length}`} />
            <StatCard label="Format" value={format.toUpperCase()} />
            <StatCard
              label="Data Type"
              value={dataType === 'all' ? 'All Fields' : dataType.charAt(0).toUpperCase() + dataType.slice(1)}
            />
            <div className="border border-border rounded px-3 py-2">
              <div className="text-subtle mb-1">Active Fields</div>
              <div className="flex flex-wrap gap-1">
                {activeFields.map(f => (
                  <span key={f} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-accent/10 text-accent">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <TipsCard
          title="About Fake Data Generation"
          items={[
            'All data is generated entirely in your browser using a seeded pseudo-random number generator — no network requests are made.',
            'Use JSON format for API mock data, CSV for spreadsheet imports, or Lines for simple lists and test fixtures.',
            'Click Regenerate to create a fresh set of random data, or change the count to generate up to 100 records at once.',
            'Perfect for populating test databases, seeding demo applications, and building realistic UI prototypes.',
          ]}
        />
      </div>
    </ToolLayout>
  )
}
