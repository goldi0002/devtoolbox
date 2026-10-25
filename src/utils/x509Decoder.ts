export interface DistinguishedName {
  commonName?: string
  organization?: string
  organizationalUnit?: string
  country?: string
  stateOrProvince?: string
  locality?: string
  emailAddress?: string
  raw: string
}

export interface DecodedCertificate {
  version: number
  serialNumberHex: string
  serialNumberDec: string
  issuer: DistinguishedName
  subject: DistinguishedName
  validFrom: Date
  validTo: Date
  daysRemaining: number
  status: 'valid' | 'expired' | 'not-yet-valid'
  signatureAlgorithm: string
  publicKeyAlgorithm: string
  publicKeySize: string
  subjectAltNames: string[]
  sha256Fingerprint: string
  sha1Fingerprint: string
  isCA: boolean
  keyUsages: string[]
}

// Common OID mapping
const OID_MAP: Record<string, string> = {
  '2.5.4.3': 'CN',
  '2.5.4.10': 'O',
  '2.5.4.11': 'OU',
  '2.5.4.6': 'C',
  '2.5.4.8': 'ST',
  '2.5.4.7': 'L',
  '1.2.840.113549.1.9.1': 'emailAddress',

  // Signature Algorithms
  '1.2.840.113549.1.1.1': 'RSA Encryption',
  '1.2.840.113549.1.1.4': 'MD5 with RSA',
  '1.2.840.113549.1.1.5': 'SHA-1 with RSA',
  '1.2.840.113549.1.1.11': 'SHA-256 with RSA',
  '1.2.840.113549.1.1.12': 'SHA-384 with RSA',
  '1.2.840.113549.1.1.13': 'SHA-512 with RSA',
  '1.2.840.10045.2.1': 'EC Public Key',
  '1.2.840.10045.4.3.2': 'ECDSA with SHA-256',
  '1.2.840.10045.4.3.3': 'ECDSA with SHA-384',
  '1.2.840.10045.4.3.4': 'ECDSA with SHA-512',
  '1.3.101.112': 'Ed25519',

  // Named Curves
  '1.2.840.10045.3.1.7': 'prime256v1 (secp256r1 / P-256)',
  '1.3.132.0.34': 'secp384r1 (P-384)',
  '1.3.132.0.35': 'secp521r1 (P-521)',

  // Extensions
  '2.5.29.14': 'Subject Key Identifier',
  '2.5.29.15': 'Key Usage',
  '2.5.29.17': 'Subject Alternative Name',
  '2.5.29.19': 'Basic Constraints',
  '2.5.29.35': 'Authority Key Identifier',
  '2.5.29.37': 'Extended Key Usage'
}

interface Asn1Node {
  tag: number
  length: number
  headerLength: number
  raw: Uint8Array
  children?: Asn1Node[]
}

function parseAsn1(bytes: Uint8Array, offset = 0, maxLen = bytes.length): Asn1Node | null {
  if (offset >= maxLen) return null

  const tag = bytes[offset]
  let headerLen = 1
  let len = bytes[offset + 1]

  if (len === undefined) return null

  if (len & 0x80) {
    const numLenBytes = len & 0x7f
    headerLen += 1 + numLenBytes
    len = 0
    for (let i = 0; i < numLenBytes; i++) {
      len = (len << 8) | bytes[offset + 2 + i]
    }
  } else {
    headerLen += 1
  }

  const totalLen = headerLen + len
  const raw = bytes.subarray(offset + headerLen, offset + totalLen)
  const node: Asn1Node = { tag, length: len, headerLength: headerLen, raw }

  // Tag 0x30 (SEQUENCE), 0x31 (SET), or context-specific constructed (0xa0, 0xa3, etc.)
  const isConstructed = Boolean(tag & 0x20)
  if (isConstructed && len > 0) {
    node.children = []
    let childOffset = offset + headerLen
    const end = childOffset + len
    while (childOffset < end) {
      const child = parseAsn1(bytes, childOffset, end)
      if (!child) break
      node.children.push(child)
      childOffset += child.headerLength + child.length
    }
  }

  return node
}

function parseOid(bytes: Uint8Array): string {
  if (bytes.length === 0) return ''
  const first = bytes[0]
  const oids: number[] = [Math.floor(first / 40), first % 40]

  let val = 0
  for (let i = 1; i < bytes.length; i++) {
    const b = bytes[i]
    val = (val << 7) | (b & 0x7f)
    if (!(b & 0x80)) {
      oids.push(val)
      val = 0
    }
  }
  return oids.join('.')
}

function parseString(bytes: Uint8Array): string {
  try {
    return new TextDecoder('utf-8').decode(bytes)
  } catch {
    return String.fromCharCode(...bytes)
  }
}

function parseDate(node: Asn1Node): Date {
  const str = parseString(node.raw)
  if (node.tag === 0x17) {
    // UTCTime: YYMMDDHHMMSSZ
    let year = parseInt(str.substring(0, 2), 10)
    year += year >= 50 ? 1900 : 2000
    const month = parseInt(str.substring(2, 4), 10) - 1
    const day = parseInt(str.substring(4, 6), 10)
    const hour = parseInt(str.substring(6, 8), 10)
    const min = parseInt(str.substring(8, 10), 10)
    const sec = parseInt(str.substring(10, 12), 10)
    return new Date(Date.UTC(year, month, day, hour, min, sec))
  } else {
    // GeneralizedTime: YYYYMMDDHHMMSSZ
    const year = parseInt(str.substring(0, 4), 10)
    const month = parseInt(str.substring(4, 6), 10) - 1
    const day = parseInt(str.substring(6, 8), 10)
    const hour = parseInt(str.substring(8, 10), 10)
    const min = parseInt(str.substring(10, 12), 10)
    const sec = parseInt(str.substring(12, 14), 10)
    return new Date(Date.UTC(year, month, day, hour, min, sec))
  }
}

function parseDistinguishedName(node: Asn1Node): DistinguishedName {
  const result: DistinguishedName = { raw: '' }
  const parts: string[] = []

  if (!node.children) return result

  for (const setNode of node.children) {
    if (!setNode.children) continue
    for (const seqNode of setNode.children) {
      if (!seqNode.children || seqNode.children.length < 2) continue
      const oidNode = seqNode.children[0]
      const valNode = seqNode.children[1]

      const oid = parseOid(oidNode.raw)
      const val = parseString(valNode.raw)
      const label = OID_MAP[oid] || oid

      if (label === 'CN') result.commonName = val
      else if (label === 'O') result.organization = val
      else if (label === 'OU') result.organizationalUnit = val
      else if (label === 'C') result.country = val
      else if (label === 'ST') result.stateOrProvince = val
      else if (label === 'L') result.locality = val
      else if (label === 'emailAddress') result.emailAddress = val

      parts.push(`${label}=${val}`)
    }
  }

  result.raw = parts.join(', ')
  return result
}

function formatHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0').toUpperCase())
    .join(':')
}

export async function decodePemCertificate(pem: string): Promise<DecodedCertificate> {
  // Strip PEM armor
  const cleaned = pem
    .replace(/-----BEGIN [A-Z0-9\s_-]+-----/g, '')
    .replace(/-----END [A-Z0-9\s_-]+-----/g, '')
    .replace(/\s+/g, '')

  if (!cleaned) {
    throw new Error('No base64 certificate content found between PEM header and footer.')
  }

  const binaryString = atob(cleaned)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }

  // Calculate cryptographic fingerprints
  const sha256Buffer = await crypto.subtle.digest('SHA-256', bytes)
  const sha256Fingerprint = formatHex(new Uint8Array(sha256Buffer))

  const sha1Buffer = await crypto.subtle.digest('SHA-1', bytes)
  const sha1Fingerprint = formatHex(new Uint8Array(sha1Buffer))

  const root = parseAsn1(bytes)
  if (!root || !root.children || root.children.length < 3) {
    throw new Error('Invalid ASN.1 X.509 Certificate structure.')
  }

  // TBSCertificate is the first child
  const tbs = root.children[0]
  if (!tbs || !tbs.children || tbs.children.length < 6) {
    throw new Error('Invalid TBSCertificate sequence.')
  }

  let index = 0

  // Optional Version [0] EXPLICIT
  let version = 1
  if ((tbs.children[index].tag & 0x1f) === 0) {
    const versionNode = tbs.children[index]
    if (versionNode.children && versionNode.children.length > 0) {
      version = (versionNode.children[0].raw[0] ?? 0) + 1
    }
    index++
  }

  // Serial Number
  const serialNode = tbs.children[index++]
  const serialHex = formatHex(serialNode.raw)
  let serialDec = '0'
  try {
    let big = BigInt(0)
    for (const b of serialNode.raw) {
      big = (big << BigInt(8)) | BigInt(b)
    }
    serialDec = big.toString()
  } catch {
    serialDec = serialHex
  }

  // Signature Algorithm identifier in TBS
  const sigAlgNode = tbs.children[index++]
  let signatureAlgorithm = 'Unknown'
  if (sigAlgNode.children && sigAlgNode.children.length > 0) {
    const oid = parseOid(sigAlgNode.children[0].raw)
    signatureAlgorithm = OID_MAP[oid] || oid
  }

  // Issuer Name
  const issuerNode = tbs.children[index++]
  const issuer = parseDistinguishedName(issuerNode)

  // Validity Sequence [notBefore, notAfter]
  const validityNode = tbs.children[index++]
  let validFrom = new Date()
  let validTo = new Date()
  if (validityNode.children && validityNode.children.length >= 2) {
    validFrom = parseDate(validityNode.children[0])
    validTo = parseDate(validityNode.children[1])
  }

  // Subject Name
  const subjectNode = tbs.children[index++]
  const subject = parseDistinguishedName(subjectNode)

  // SubjectPublicKeyInfo
  const spkiNode = tbs.children[index++]
  let publicKeyAlgorithm = 'Unknown'
  let publicKeySize = 'Unknown'

  if (spkiNode.children && spkiNode.children.length >= 2) {
    const algNode = spkiNode.children[0]
    if (algNode.children && algNode.children.length > 0) {
      const pkOid = parseOid(algNode.children[0].raw)
      publicKeyAlgorithm = OID_MAP[pkOid] || pkOid
      if (algNode.children.length > 1) {
        const curveOid = parseOid(algNode.children[1].raw)
        if (OID_MAP[curveOid]) {
          publicKeySize = OID_MAP[curveOid]
        }
      }
    }

    const bitStringNode = spkiNode.children[1]
    if (publicKeyAlgorithm.includes('RSA')) {
      // RSA BitString contains an inner sequence { modulus INTEGER, publicExponent INTEGER }
      const keyBytes = bitStringNode.raw.subarray(1) // skip unused bits byte
      const keySeq = parseAsn1(keyBytes)
      if (keySeq && keySeq.children && keySeq.children.length > 0) {
        let modBytes = keySeq.children[0].raw
        if (modBytes[0] === 0x00) modBytes = modBytes.subarray(1)
        const bitCount = modBytes.length * 8
        publicKeySize = `${bitCount}-bit RSA`
      }
    }
  }

  // Extensions (optional [3] EXPLICIT tag 0xa3)
  const subjectAltNames: string[] = []
  const keyUsages: string[] = []
  let isCA = false

  while (index < tbs.children.length) {
    const extContainer = tbs.children[index++]
    if ((extContainer.tag & 0x1f) === 3 && extContainer.children) {
      // Inner sequence of Extension
      const extsSeq = extContainer.children[0]
      if (extsSeq && extsSeq.children) {
        for (const ext of extsSeq.children) {
          if (!ext.children || ext.children.length < 2) continue
          const extOid = parseOid(ext.children[0].raw)
          const extValueNode = ext.children.at(-1)!

          // Parse OCTET STRING wrapping the extension
          const extParsed = parseAsn1(extValueNode.raw)
          if (!extParsed) continue

          if (extOid === '2.5.29.17') {
            // Subject Alternative Name: GeneralNames SEQUENCE
            if (extParsed.children) {
              for (const gn of extParsed.children) {
                const gnTag = gn.tag & 0x1f
                const val = parseString(gn.raw)
                if (gnTag === 2) {
                  subjectAltNames.push(`DNS:${val}`)
                } else if (gnTag === 7) {
                  if (gn.raw.length === 4) {
                    subjectAltNames.push(`IP:${Array.from(gn.raw).join('.')}`)
                  } else {
                    subjectAltNames.push(`IP:${formatHex(gn.raw)}`)
                  }
                } else {
                  subjectAltNames.push(val)
                }
              }
            }
          } else if (extOid === '2.5.29.19') {
            // Basic Constraints
            if (extParsed.children && extParsed.children.length > 0) {
              if (extParsed.children[0].tag === 0x01 && extParsed.children[0].raw[0] !== 0) {
                isCA = true
              }
            }
          } else if (extOid === '2.5.29.15') {
            // Key Usage BIT STRING
            const usageBits = extParsed.raw[1] || 0
            if (usageBits & 0x80) keyUsages.push('Digital Signature')
            if (usageBits & 0x40) keyUsages.push('Non Repudiation')
            if (usageBits & 0x20) keyUsages.push('Key Encipherment')
            if (usageBits & 0x10) keyUsages.push('Data Encipherment')
            if (usageBits & 0x08) keyUsages.push('Key Agreement')
            if (usageBits & 0x04) keyUsages.push('Certificate Signing')
            if (usageBits & 0x02) keyUsages.push('CRL Signing')
          }
        }
      }
    }
  }

  const now = new Date()
  let status: 'valid' | 'expired' | 'not-yet-valid' = 'valid'
  if (now > validTo) status = 'expired'
  else if (now < validFrom) status = 'not-yet-valid'

  const msRemaining = validTo.getTime() - now.getTime()
  const daysRemaining = Math.max(0, Math.floor(msRemaining / (1000 * 60 * 60 * 24)))

  return {
    version,
    serialNumberHex: serialHex,
    serialNumberDec: serialDec,
    issuer,
    subject,
    validFrom,
    validTo,
    daysRemaining,
    status,
    signatureAlgorithm,
    publicKeyAlgorithm,
    publicKeySize,
    subjectAltNames,
    sha256Fingerprint,
    sha1Fingerprint,
    isCA,
    keyUsages
  }
}
