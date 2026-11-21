import { lazy } from "react"
import type { ToolMeta } from "../tool-meta"

export const MAC_ADDRESS_GENERATOR_META: ToolMeta = {
  slug: 'mac-address-generator',
  name: 'MAC Address Generator',
  description: 'Generate valid unicast, multicast, locally administered, or vendor-specific MAC addresses in colon, hyphen, or dot formats.',
  category: 'generate-tools',
  tag: 'generate',
  toolComponent: lazy(() => import('../../components/tools/generate-tools/MacAddressGenerator')),
  keywords: [
    'mac address generator',
    'random mac address',
    'mac generator',
    'generate mac address',
    'hardware address generator',
    'ethernet mac generator',
    'mac address lookup',
    'random oui generator',
    'bulk mac address generator'
  ],
  about: {
    summary: 'The MAC Address Generator produces standards-compliant IEEE 802 Media Access Control (MAC) addresses with configurable separators (colon, hyphen, Cisco dot notation), case sensitivity, OUI vendor prefixes, and bulk batch generation.',
    useCases: [
      'Generating mock network hardware addresses for unit testing and CI/CD pipelines',
      'Testing DHCP server configurations, static lease bindings, and RADIUS authentication',
      'Configuring virtual machines (VMware, VirtualBox, KVM, Proxmox) with unique MAC IDs',
      'Validating network packet parsers, Wireshark filters, and switch CAM tables'
    ],
    features: [
      'Configurable delimiter styles: standard colon (00:1A:2B), hyphen (00-1A-2B), and Cisco dot (001a.2b3c.4d5e)',
      'Custom uppercase or lowercase hexadecimal casing',
      'Bulk generation with one-click copy and list download',
      '100% in-browser generation with zero network requests'
    ],
    tip: 'Use Cisco dot notation (xxxx.xxxx.xxxx) when provisioning Cisco IOS and network switch configurations.'
  },
  guide: {
    "steps": [
      {
        "name": "Choose how many",
        "text": "Enter a count from 1 to 1000 in Number of Addresses."
      },
      {
        "name": "Pick a format",
        "text": "Choose Colon, Hyphen, Dot or None for the separator style."
      },
      {
        "name": "Set the casing",
        "text": "Tick Uppercase for capital hex digits, or clear it for lowercase."
      },
      {
        "name": "Generate and copy",
        "text": "Click Generate MAC Addresses, then copy or download the list from the output panel."
      }
    ],
    "faqs": [
      {
        "question": "Are the addresses assigned to real devices?",
        "answer": "No. Every address is random. The first byte always has the locally administered bit set and the multicast bit cleared, so each address is a valid unicast address that is not tied to a manufacturer."
      },
      {
        "question": "Does it include vendor prefixes?",
        "answer": "No. The tool does not offer manufacturer (OUI) prefixes, so all six bytes are random."
      },
      {
        "question": "Can it generate multicast addresses?",
        "answer": "No. Only unicast addresses are produced."
      },
      {
        "question": "Is the output safe for security use?",
        "answer": "No. Addresses come from Math.random, which is not cryptographically secure, so do not rely on them for anything security-sensitive."
      }
    ],
    "example": {
      "title": "Generate two random dot-format addresses in uppercase.",
      "input": "Number of Addresses: 2\nFormat: Dot (XXXX.XXXX.XXXX)\nUppercase: on",
      "output": "Two lines of random addresses in XXXX.XXXX.XXXX form, for example:\n2A3F.91C0.B47E\n6E0D.5A72.C19B",
      "inputLabel": "Settings",
      "outputLabel": "Generated addresses"
    }
  },
  seo: {
    title: 'MAC Address Generator — Free Random Hardware & Ethernet Address Maker',
    description: 'Generate random MAC addresses with custom formats (colon, hyphen, dot notation), uppercase/lowercase casing, and bulk generation. 100% free and client-side.',
    extraKeywords: [
      'mac address generator online',
      'random mac address generator',
      'ethernet address generator',
      'generate random mac',
      'cisco mac address format generator'
    ]
  },
  isNew: true,
  status: 'stable',
}
