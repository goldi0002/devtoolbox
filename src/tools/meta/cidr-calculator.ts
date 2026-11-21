import { lazy } from "react"
import { ToolMeta } from "../tool-meta"

export const CIDR_CALCULATOR_META: ToolMeta = {
  slug: 'cidr-calculator',
  name: 'CIDR & Subnet Calculator',
  category: 'data-tools',
  tag: 'SUBNET',
  description: 'Calculate IPv4 CIDR blocks, usable host IP ranges, subnet masks, wildcard masks, and binary network breakdowns.',
  keywords: ['cidr calculator', 'subnet calculator', 'ipv4 subnetting', 'network address calculator', 'ip range calculator', 'wildcard mask'],
  status: 'stable',
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
  },
  guide: {
    "steps": [
      {
        "name": "Enter an address and prefix",
        "text": "Type an IPv4 address with a CIDR prefix into IP Address / CIDR Prefix, such as 192.168.1.0/24. If you leave out the prefix, /24 is assumed."
      },
      {
        "name": "Read the network boundaries",
        "text": "Check Network Address and Broadcast Address."
      },
      {
        "name": "Check the usable range",
        "text": "Use First Usable Host IP, Last Usable Host IP and Usable Hosts."
      },
      {
        "name": "Compare the masks",
        "text": "Compare Subnet Mask and Wildcard Mask, then open the Binary Bit Breakdown to see each bit."
      }
    ],
    "faqs": [
      {
        "question": "How are usable hosts counted?",
        "answer": "For most prefixes it is the total address count minus the network and broadcast addresses. A /31 is treated as a point-to-point link with 2 usable addresses, and a /32 is a single host route with 1."
      },
      {
        "question": "What counts as Private?",
        "answer": "The RFC 1918 ranges 10.0.0.0/8, 172.16.0.0/12 and 192.168.0.0/16 are Private. 127.x is Loopback, 169.254.x.x is Link-Local, 224 to 239 is Multicast, 240 and above is Reserved, and everything else is Public."
      },
      {
        "question": "Does it support IPv6?",
        "answer": "No. Only IPv4 addresses with a prefix from 0 to 32 are accepted."
      },
      {
        "question": "What happens with an invalid entry?",
        "answer": "The tool shows an error message instead of results, for example when an octet is above 255 or the prefix is outside 0 to 32."
      }
    ],
    "example": {
      "title": "Work out the network for 192.168.1.0/24.",
      "input": "192.168.1.0/24",
      "output": "Network Address: 192.168.1.0\nBroadcast Address: 192.168.1.255\nFirst Usable Host IP: 192.168.1.1\nLast Usable Host IP: 192.168.1.254\nUsable Hosts: 254\nSubnet Mask: 255.255.255.0\nWildcard Mask: 0.0.0.255",
      "inputLabel": "IP Address / CIDR Prefix",
      "outputLabel": "Results"
    }
  },
}
