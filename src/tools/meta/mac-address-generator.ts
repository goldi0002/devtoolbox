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
