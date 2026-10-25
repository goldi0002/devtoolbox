import { lazy } from 'react'
import type { ToolMeta } from '../tool-meta'

export const CERTIFICATE_DECODER_META: ToolMeta = {
  slug: 'certificate-decoder',
  name: 'X.509 Certificate Decoder & Inspector',
  category: 'crypto-tools',
  tag: 'X.509 Cert',
  description: 'Decode and inspect PEM SSL/TLS X.509 certificates, SANs, validity dates, and fingerprints privately.',
  keywords: [
    'x509 certificate decoder',
    'ssl certificate decoder',
    'tls cert parser',
    'pem decoder',
    'certificate inspector',
    'view ssl certificate',
    'certificate fingerprint',
    'san inspector'
  ],
  status: 'stable',
  featured: true,
  isNew: true,
  complexity: 'moderate',
  addedAt: '2026-10-24',
  toolComponent: lazy(() => import('../../components/tools/crypto-tools/CertificateDecoder')),
  about: {
    summary:
      'The X.509 Certificate Decoder parses and inspects PEM-formatted SSL/TLS certificates completely inside browser memory using WebCrypto and a client-side ASN.1 parser. Inspect Common Names (CN), Organizations, Subject Alternative Names (SANs), validity periods, public key algorithms, and SHA-256 fingerprints with zero network calls.',
    useCases: [
      'Inspecting SSL/TLS certificate validity windows and remaining days before expiration',
      'Checking Subject Alternative Names (SANs) to verify domain and subdomain coverage',
      'Verifying certificate issuers, Distinguished Names, and intermediate CA chains',
      'Generating SHA-256 and SHA-1 certificate fingerprints for pinning and validation'
    ],
    features: [
      'Decodes standard PEM format X.509 certificates (SSL/TLS, CSR, and CA)',
      'Validity countdown with days remaining and expired/not-yet-valid status flags',
      'Detailed Subject and Issuer Distinguished Name extraction (CN, O, OU, C, ST, L)',
      'Subject Alternative Name (SAN) DNS and IP address extraction',
      'Public key type (RSA bit length, ECDSA curves) and signature algorithm identification',
      'Live SHA-256 and SHA-1 cryptographic fingerprint calculation via WebCrypto',
      '100% private and runs locally — certificates and keys never leave your machine'
    ],
    tip: 'Paste certificates directly from your server configuration or click "Let\'s Encrypt TLS Cert" to test instantly.'
  },
  seo: {
    title: 'X.509 Certificate Decoder — SSL/TLS PEM Certificate Inspector — ToolBox4Devs',
    description: 'Decode and inspect PEM X.509 SSL/TLS certificates, SANs, validity windows, and fingerprints online. 100% client-side privacy.',
    extraKeywords: [
      'x509 decoder online',
      'ssl cert decoder',
      'pem cert viewer',
      'parse ssl cert',
      'check certificate expiration date',
      'certificate san viewer'
    ]
  }
}
