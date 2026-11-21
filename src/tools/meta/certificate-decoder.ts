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
  guide: {
    "steps": [
      {
        "name": "Paste a PEM certificate",
        "text": "Paste the -----BEGIN CERTIFICATE----- block into Paste PEM Certificate (X.509 / SSL / TLS), or click a Load Sample button."
      },
      {
        "name": "Review the subject and issuer",
        "text": "Common Name (CN), Organization (O) and the other name fields are listed for the subject and the issuer."
      },
      {
        "name": "Check names and the key",
        "text": "Subject Alternative Names (SANs), the public key algorithm, the key size or curve and the signature algorithm are shown."
      },
      {
        "name": "Read the validity and fingerprints",
        "text": "The status strip shows whether the certificate is valid, expired or not yet valid, and the SHA-256 and SHA-1 fingerprints are listed."
      }
    ],
    "faqs": [
      {
        "question": "Does it verify the certificate chain?",
        "answer": "No. The decoder reads the certificate contents and dates. It does not verify the signature, the chain of trust, or whether a host presents this certificate."
      },
      {
        "question": "How is the validity status worked out?",
        "answer": "It compares the certificate's dates with today's date and reports valid, expired or not yet valid, with the days remaining."
      },
      {
        "question": "Can it decode a private key?",
        "answer": "No. The tool is for X.509 certificate PEM blocks and does not decode private keys."
      },
      {
        "question": "Is the certificate uploaded?",
        "answer": "No. Parsing and the fingerprints are computed in your browser with WebCrypto, with no network calls."
      }
    ],
    "example": {
      "title": "Decode a self-signed ECDSA certificate.",
      "input": "-----BEGIN CERTIFICATE-----\nMIIB2TCCAYCgAwIBAgIUEJJOFlrMytgBPL2LwNGKQ2PBQpswCgYIKoZIzj0EAwIw\nLTEVMBMGA1UEAwwMZXhhbXBsZS50ZXN0MRQwEgYDVQQKDAtFeGFtcGxlIEluYzAe\nFw0yNjExMjExMTU5MDRaFw0yNzExMjExMTU5MDRaMC0xFTATBgNVBAMMDGV4YW1w\nbGUudGVzdDEUMBIGA1UECgwLRXhhbXBsZSBJbmMwWTATBgcqhkjOPQIBBggqhkjO\nPQMBBwNCAARotq0R+G84RSiqbW4Lsj9FgSwi1+Kj5kmV5m+dpdP2wnIt8UPLaQkR\n17Bx/kKgIP489rIfnbC8laTpUZ/vIQc2o34wfDAdBgNVHQ4EFgQUhkELRvbPGr+C\nBUyvLxzizsFPbJowHwYDVR0jBBgwFoAUhkELRvbPGr+CBUyvLxzizsFPbJowDwYD\nVR0TAQH/BAUwAwEB/zApBgNVHREEIjAgggxleGFtcGxlLnRlc3SCEHd3dy5leGFt\ncGxlLnRlc3QwCgYIKoZIzj0EAwIDRwAwRAIgYO0zOkMYRTo/5drAvCPOfYPRe+lv\nMhzGwla8/uDtOsACIBBCQjU/oCRmU4BvPe91ISEEfIed+XWWX9DDwJDAZBtb\n-----END CERTIFICATE-----",
      "output": "Subject CN: example.test, O: Example Inc; SANs: DNS:example.test, DNS:www.example.test; Key: EC P-256 (prime256v1); Signature: ECDSA with SHA-256",
      "inputLabel": "PEM certificate",
      "outputLabel": "Decoded fields"
    }
  },
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
