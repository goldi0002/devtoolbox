import { lazy } from "react"
import { ToolMeta } from "../tool-meta"

export const CIDR_CALCULATOR_META: ToolMeta = {
  slug: 'cidr-calculator',
  name: 'CIDR & Subnet Calculator',
  category: 'data-tools',
  tag: 'SUBNET',
  description: 'Calculate IPv4 CIDR blocks, usable host IP ranges, subnet masks, wildcard masks, and binary network breakdowns.',
  keywords: ['cidr calculator', 'subnet calculator', 'ipv4 subnetting', 'network address calculator', 'ip range calculator', 'wildcard mask'],
  status: 'available',
  toolComponent: lazy(() => import('../../components/tools/CidrCalculator')),
  seo: {
    title: 'CIDR & Subnet Calculator — IPv4 Network Addressing Tool',
    description: 'Calculate network address, broadcast address, netmask, wildcard mask, and usable host IP ranges from any IPv4 CIDR prefix in your browser.',
    extraKeywords: ['cidr table', 'subnet mask calculator', 'usable ip range', 'rfc 1918 private ip', 'network host count'],
  },
  about: {
    summary: 'The CIDR & Subnet Calculator parses any IPv4 address and CIDR prefix length (e.g. 192.168.1.0/24 or 10.0.0.0/16) to compute complete network boundaries, broadcast addresses, usable host ranges, and binary bit masks.',
    useCases: [
      'Configuring VPC subnets in AWS, GCP, or Azure cloud environments',
      'Designing on-premise local area networks and VLAN boundaries',
      'Determining available host IP ranges and broadcast targets',
      'Troubleshooting IP routing and netmask mismatches'
    ],
    features: [
      'Instant calculations for /0 through /32 CIDR prefixes',
      'Usable host counts and IP range boundaries',
      'Binary representation for IP addresses and subnet masks',
      'RFC 1918 Private, Loopback, Link-Local, and Multicast classification'
    ],
    notes: [
      '/31 subnets are treated as point-to-point links with 2 usable host addresses (RFC 3021)',
      '/32 represents a single host route'
    ],
    tip: 'Click any of the quick presets to test standard subnet sizes such as /24, /16, or /12.'
  }
}
