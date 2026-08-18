import bcrypt from 'bcryptjs'

export interface ParsedBcrypt {
  valid: boolean
  version: string
  cost: number
  salt: string
  checksum: string
  raw: string
  error?: string
}

export async function hashPassword(password: string, rounds = 10): Promise<{ hash: string; timeMs: number }> {
  const start = performance.now()
  const salt = await bcrypt.genSalt(rounds)
  const hash = await bcrypt.hash(password, salt)
  const end = performance.now()
  return {
    hash,
    timeMs: Math.round(end - start)
  }
}

export async function verifyPassword(password: string, hash: string): Promise<{ match: boolean; timeMs: number }> {
  const start = performance.now()
  const match = await bcrypt.compare(password, hash)
  const end = performance.now()
  return {
    match,
    timeMs: Math.round(end - start)
  }
}

export function parseBcryptHash(hashStr: string): ParsedBcrypt {
  const clean = hashStr.trim()
  // Bcrypt format: $2[abxy]$[0-9]{2}$[./A-Za-z0-9]{53}
  const regex = /^\$(2[abxy])\$(\d{2})\$([./A-Za-z0-9]{22})([./A-Za-z0-9]{31})$/
  const match = clean.match(regex)

  if (!match) {
    return {
      valid: false,
      version: '',
      cost: 0,
      salt: '',
      checksum: '',
      raw: clean,
      error: 'Invalid bcrypt format. Expected $2a$, $2b$, or $2y$ prefix with 60 characters total.'
    }
  }

  const [, version, costStr, salt, checksum] = match
  const cost = parseInt(costStr, 10)

  return {
    valid: true,
    version: `$${version}$`,
    cost,
    salt,
    checksum,
    raw: clean
  }
}

export async function generateBcryptSalt(rounds = 10): Promise<string> {
  return bcrypt.genSalt(rounds)
}
