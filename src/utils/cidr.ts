export interface CidrResult {
  ip: string
  prefix: number
  netmask: string
  wildcard: string
  networkAddress: string
  broadcastAddress: string
  firstUsableIp: string
  lastUsableIp: string
  totalHosts: number
  usableHosts: number
  ipClass: string
  ipType: 'Private' | 'Public' | 'Loopback' | 'Link-Local' | 'Multicast' | 'Reserved'
  ipBinary: string
  netmaskBinary: string
}

export function ipToNumber(ip: string): number {
  const octets = ip.trim().split('.').map(Number)
  if (octets.length !== 4 || octets.some(o => isNaN(o) || o < 0 || o > 255)) {
    throw new Error('Invalid IPv4 address format. Must be 4 octets between 0 and 255.')
  }
  return ((octets[0] << 24) >>> 0) + ((octets[1] << 16) >>> 0) + ((octets[2] << 8) >>> 0) + (octets[3] >>> 0)
}

export function numberToIp(num: number): string {
  const n = num >>> 0
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.')
}

export function numberToBinary(num: number): string {
  const n = num >>> 0
  const bin = n.toString(2).padStart(32, '0')
  return `${bin.slice(0, 8)}.${bin.slice(8, 16)}.${bin.slice(16, 24)}.${bin.slice(24, 32)}`
}

export function prefixToNetmask(prefix: number): number {
  if (prefix < 0 || prefix > 32) {
    throw new Error('CIDR prefix must be an integer between 0 and 32.')
  }
  if (prefix === 0) return 0
  return ((0xffffffff << (32 - prefix)) >>> 0)
}

export function calculateCidr(cidrInput: string): CidrResult {
  const clean = cidrInput.trim()
  const parts = clean.split('/')
  
  if (parts.length > 2) {
    throw new Error('Invalid CIDR notation. Expected format like 192.168.1.1/24')
  }

  const ipStr = parts[0]
  const prefixStr = parts[1] ?? '24'
  const prefix = parseInt(prefixStr, 10)

  if (isNaN(prefix) || prefix < 0 || prefix > 32) {
    throw new Error('Prefix length must be between 0 and 32.')
  }

  const ipNum = ipToNumber(ipStr)
  const maskNum = prefixToNetmask(prefix)
  const wildcardNum = (~maskNum) >>> 0
  const networkNum = (ipNum & maskNum) >>> 0
  const broadcastNum = (networkNum | wildcardNum) >>> 0

  const totalHosts = prefix === 32 ? 1 : Math.pow(2, 32 - prefix)
  let usableHosts = 0
  let firstUsableNum = networkNum
  let lastUsableNum = broadcastNum

  if (prefix === 32) {
    usableHosts = 1
    firstUsableNum = networkNum
    lastUsableNum = networkNum
  } else if (prefix === 31) {
    usableHosts = 2
    firstUsableNum = networkNum
    lastUsableNum = broadcastNum
  } else {
    usableHosts = Math.max(0, totalHosts - 2)
    firstUsableNum = (networkNum + 1) >>> 0
    lastUsableNum = (broadcastNum - 1) >>> 0
  }

  // Determine Class
  const firstOctet = (ipNum >>> 24) & 255
  let ipClass = 'Unknown'
  if (firstOctet >= 1 && firstOctet <= 126) ipClass = 'Class A'
  else if (firstOctet === 127) ipClass = 'Class A (Loopback)'
  else if (firstOctet >= 128 && firstOctet <= 191) ipClass = 'Class B'
  else if (firstOctet >= 192 && firstOctet <= 223) ipClass = 'Class C'
  else if (firstOctet >= 224 && firstOctet <= 239) ipClass = 'Class D (Multicast)'
  else if (firstOctet >= 240 && firstOctet <= 255) ipClass = 'Class E (Experimental)'

  // Determine Type / RFC Scope
  let ipType: CidrResult['ipType'] = 'Public'
  const secondOctet = (ipNum >>> 16) & 255
  if (firstOctet === 10) ipType = 'Private'
  else if (firstOctet === 172 && secondOctet >= 16 && secondOctet <= 31) ipType = 'Private'
  else if (firstOctet === 192 && secondOctet === 168) ipType = 'Private'
  else if (firstOctet === 127) ipType = 'Loopback'
  else if (firstOctet === 169 && secondOctet === 254) ipType = 'Link-Local'
  else if (firstOctet >= 224 && firstOctet <= 239) ipType = 'Multicast'
  else if (firstOctet >= 240) ipType = 'Reserved'

  return {
    ip: numberToIp(ipNum),
    prefix,
    netmask: numberToIp(maskNum),
    wildcard: numberToIp(wildcardNum),
    networkAddress: numberToIp(networkNum),
    broadcastAddress: numberToIp(broadcastNum),
    firstUsableIp: numberToIp(firstUsableNum),
    lastUsableIp: numberToIp(lastUsableNum),
    totalHosts,
    usableHosts,
    ipClass,
    ipType,
    ipBinary: numberToBinary(ipNum),
    netmaskBinary: numberToBinary(maskNum),
  }
}
