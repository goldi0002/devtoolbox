import { useState, useEffect } from 'react'
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Key,
  Copy,
  Check,
  Calendar,
  Globe,
  Layers,
  FileText,
  RefreshCw,
  Cpu
} from 'lucide-react'
import { decodePemCertificate, DecodedCertificate } from '../../../utils/x509Decoder'

const SAMPLE_LETS_ENCRYPT = `-----BEGIN CERTIFICATE-----
MIIEKjCCAxKgAwIBAgIUZErqvf09qXDGZLEzoYBqk40Ws6gwDQYJKoZIhvcNAQEL
BQAwgYYxCzAJBgNVBAYTAlVTMRMwEQYDVQQIDApDYWxpZm9ybmlhMRYwFAYDVQQH
DA1TYW4gRnJhbmNpc2NvMRUwEwYDVQQKDAxUb29sQm94NERldnMxFDASBgNVBAsM
C0VuZ2luZWVyaW5nMR0wGwYDVQQDDBRhcGkudG9vbGJveDRkZXZzLmNvbTAeFw0y
NjEwMjUwNzAxMDFaFw0yNzEwMjUwNzAxMDFaMIGGMQswCQYDVQQGEwJVUzETMBEG
A1UECAwKQ2FsaWZvcm5pYTEWMBQGA1UEBwwNU2FuIEZyYW5jaXNjbzEVMBMGA1UE
CgwMVG9vbEJveDREZXZzMRQwEgYDVQQLDAtFbmdpbmVlcmluZzEdMBsGA1UEAwwU
YXBpLnRvb2xib3g0ZGV2cy5jb20wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEK
AoIBAQCyOCBhgI00jMYvQzTXGBzgQHsA/vJHmrxroh+g3xF5n0+ouJRlz/Ox1x4C
H0hYhawTB6Sf/45BMbS4lDjhrytxhxc5fr+R+OroOfwqVrJ+ElGVWoUYC4RrL4qz
AUpBsbf9bfESKf+P+aL0jsEZAgZ1n9g5RYaeHg0uzhLDG3xk2fK9LZ5rQiaIkFGj
HDlCLa2kYpZ5mMWHG9uNXg2UEJDH/JbFxmnmMhyDHufvZkbKW1mTT5CxDjVD/Ya3
dIOhdQqCU0ZdNrHW+srDaICBfQf2Ph3Z1K2KvCepXRVaCVIvI4fauNd7rxhPItx6
LhQBMIRdX5hg2jjgW7UJVI4j5Ro3AgMBAAGjgY0wgYowHQYDVR0OBBYEFPjeQjqs
fEypW/+hqh6wFCpfDcP6MB8GA1UdIwQYMBaAFPjeQjqsfEypW/+hqh6wFCpfDcP6
MA8GA1UdEwEB/wQFMAMBAf8wNwYDVR0RBDAwLoIUYXBpLnRvb2xib3g0ZGV2cy5j
b22CEHRvb2xib3g0ZGV2cy5jb22HBH8AAAEwDQYJKoZIhvcNAQELBQADggEBAGRS
jHzBO9cQNj+SvCOjf5NCYF3YkOufCnHiZU9eCh0XWj1uXvUoK/1fKDd22j6myyii
FEFCQGBghhbUrnjIObsF1EfPhGZ90hkDpTaYntyiXo7Um36N31glw2VzY4inNKPR
bwj1i0o6/691D1CdoIyRddQuC6LV9y8+anHDW4hFxjirjs3eoCYNjiCUM6UhK9MY
JZqcgzM8CHgW0LdnwkGF2/ZR1P2n8GTQOUWv+TfHkk0ZlOeNe1hWdueesLaOmw2a
rcGjTT5GYM9wKvhFvqwNA3Ffb2l0D1V6HAQ8bYdLHblKMif4FmqdwVeDwvrRxCFJ
FXqVxQLilRgdqvsZ12k=
-----END CERTIFICATE-----`

const SAMPLE_SELF_SIGNED = `-----BEGIN CERTIFICATE-----
MIIDUTCCAjmgAwIBAgIUHfTMu9RpPdH6d86qaVaFhrXKgDMwDQYJKoZIhvcNAQEL
BQAwKjESMBAGA1UEAwwJbG9jYWxob3N0MRQwEgYDVQQKDAtEZXZlbG9wbWVudDAe
Fw0yNjEwMjUwNzAxMTZaFw0zNjEwMjIwNzAxMTZaMCoxEjAQBgNVBAMMCWxvY2Fs
aG9zdDEUMBIGA1UECgwLRGV2ZWxvcG1lbnQwggEiMA0GCSqGSIb3DQEBAQUAA4IB
DwAwggEKAoIBAQC6sspMwzUG1IIK5/uRp4sW3NczSG5sJ02bIIzrfNZlCEOHq9w+
QKSPywMmsJJ24P15PNsyhLLSy2dZk5m0akmlR+fbqE9Rh7bKUzRMlSxuns53dYtj
0Sfywy9scUSAP6ke1KOjlzQqXiMa3wfw1patkV/IPle0s/fegnu0pG+ltKoWZl4h
t8pLONHMOH8SC5/lgfPO0A/yR+hQVolzs2dJUpg9PrMMLjtQSnxBLLDdZi6QRIhm
Tr48UXVSg05rY/I7KnnovR7lsxZd1eMDYJuSEy0I2HAE6nhib3ZxLhKH6lxi242s
jG3uNpQEAPFYlM87NylXodfL7K0jJVDAeZ3LAgMBAAGjbzBtMB0GA1UdDgQWBBSr
JoK0worQMcjQWqp4nYcD6Paf+DAfBgNVHSMEGDAWgBSrJoK0worQMcjQWqp4nYcD
6Paf+DAPBgNVHRMBAf8EBTADAQH/MBoGA1UdEQQTMBGCCWxvY2FsaG9zdIcEfwAA
ATANBgkqhkiG9w0BAQsFAAOCAQEAHIJz29xX3rEjiuQ898Zy05xXKea+Eaor73zC
Wki+x8lep6hH+4WoLHELFMyev1dVgsF9pTEiEgKZAxnC36olMad4JcAX/6HZ6n8N
HY8wE8c/mC0d5lCa1IXoumlIos17PQczN9MdBNMiE82tnyIzUr7jzoiFUYdKeOpx
6Ua1dHOcnKOWGB+YxifrovmUlVTMvhOCx+/jggfOlUmciu2cgzUf2U0+ApT3ycS3
Y3edZAwZW/nXyocZFq/R3VP1NhUUZ/KROsu5hV+W7jAQyShEWtO6CzBKcUPH05Yk
rBhfdKLHT4DKusiPl0PNgSX1bYtMU4wTkZrEVU1m2W0m9dbirA==
-----END CERTIFICATE-----`

export default function CertificateDecoder() {
  const [pemInput, setPemInput] = useState<string>(SAMPLE_LETS_ENCRYPT)
  const [decoded, setDecoded] = useState<DecodedCertificate | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copiedSha256, setCopiedSha256] = useState(false)
  const [copiedSha1, setCopiedSha1] = useState(false)

  useEffect(() => {
    let isCancelled = false
    if (!pemInput.trim()) {
      setDecoded(null)
      setError(null)
      return
    }

    decodePemCertificate(pemInput)
      .then(cert => {
        if (!isCancelled) {
          setDecoded(cert)
          setError(null)
        }
      })
      .catch(err => {
        if (!isCancelled) {
          setDecoded(null)
          setError(err instanceof Error ? err.message : 'Failed to parse certificate')
        }
      })

    return () => {
      isCancelled = true
    }
  }, [pemInput])

  const copyToClipboard = async (text: string, type: 'sha256' | 'sha1') => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === 'sha256') {
        setCopiedSha256(true)
        setTimeout(() => setCopiedSha256(false), 2000)
      } else {
        setCopiedSha1(true)
        setTimeout(() => setCopiedSha1(false), 2000)
      }
    } catch {
      // ignore
    }
  }

  return (
    <div className="space-y-6">

      {/* Preset Controls */}
      <div className="surface-panel p-4 rounded-lg flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-dim">Load Sample:</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPemInput(SAMPLE_LETS_ENCRYPT)}
              className="chip text-[11px]"
            >
              Let&apos;s Encrypt TLS Cert
            </button>
            <button
              type="button"
              onClick={() => setPemInput(SAMPLE_SELF_SIGNED)}
              className="chip text-[11px]"
            >
              Self-Signed Dev Cert
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setPemInput('')}
          className="chip text-[11px] text-muted hover:text-dim flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" />
          Clear
        </button>
      </div>

      {/* Certificate PEM Input */}
      <div className="surface-panel p-4 rounded-lg space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold font-sans text-bright flex items-center gap-2">
            <FileText className="w-4 h-4 text-accent" />
            <span>Paste PEM Certificate (X.509 / SSL / TLS)</span>
          </label>
          <span className="text-[10px] font-mono text-muted">
            {pemInput.length} characters · 100% Client-Side Decoded
          </span>
        </div>

        <textarea
          rows={6}
          value={pemInput}
          onChange={e => setPemInput(e.target.value)}
          placeholder="-----BEGIN CERTIFICATE-----&#10;Paste your base64 PEM encoded certificate here...&#10;-----END CERTIFICATE-----"
          className="w-full font-mono text-xs p-3 bg-bg border border-border rounded text-bright focus:outline-none focus:border-accent resize-y leading-relaxed"
        />

        {error && (
          <div className="flex items-center gap-2 p-2.5 rounded bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-mono">
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Decoded Inspection Panels */}
      {decoded && (
        <div className="space-y-4 animate-fade-in">

          {/* Top Status & Validity Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Status card */}
            <div className="surface-panel p-4 rounded-lg flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  decoded.status === 'valid'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}
              >
                {decoded.status === 'valid' ? (
                  <ShieldCheck className="w-5 h-5" />
                ) : (
                  <ShieldAlert className="w-5 h-5" />
                )}
              </div>
              <div>
                <span className="text-[10px] font-mono text-muted uppercase tracking-wider block">
                  Certificate Status
                </span>
                <span
                  className={`text-sm font-semibold capitalize ${
                    decoded.status === 'valid' ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {decoded.status}
                </span>
                <span className="text-xs text-dim block mt-0.5">
                  {decoded.status === 'valid'
                    ? `${decoded.daysRemaining} days remaining`
                    : 'Expired or not yet in validity window'}
                </span>
              </div>
            </div>

            {/* Valid From */}
            <div className="surface-panel p-4 rounded-lg flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-sky-400 border border-border shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="truncate">
                <span className="text-[10px] font-mono text-muted uppercase tracking-wider block">
                  Valid From (Not Before)
                </span>
                <span className="text-xs font-medium text-bright block truncate font-mono">
                  {decoded.validFrom.toUTCString()}
                </span>
                <span className="text-[11px] text-muted block truncate">
                  Local: {decoded.validFrom.toLocaleDateString()} {decoded.validFrom.toLocaleTimeString()}
                </span>
              </div>
            </div>

            {/* Valid To */}
            <div className="surface-panel p-4 rounded-lg flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-amber-400 border border-border shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="truncate">
                <span className="text-[10px] font-mono text-muted uppercase tracking-wider block">
                  Valid To (Not After)
                </span>
                <span className="text-xs font-medium text-bright block truncate font-mono">
                  {decoded.validTo.toUTCString()}
                </span>
                <span className="text-[11px] text-muted block truncate">
                  Local: {decoded.validTo.toLocaleDateString()} {decoded.validTo.toLocaleTimeString()}
                </span>
              </div>
            </div>

          </div>

          {/* Subject & Issuer Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Subject Card */}
            <div className="surface-panel p-4 rounded-lg space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-xs font-semibold font-sans text-bright flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-accent" />
                  Subject (Issued To)
                </span>
                <span className="text-[10px] font-mono text-muted">v{decoded.version}</span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-subtle block text-[11px]">Common Name (CN)</span>
                  <span className="text-bright font-mono font-medium">
                    {decoded.subject.commonName || '—'}
                  </span>
                </div>
                {decoded.subject.organization && (
                  <div>
                    <span className="text-subtle block text-[11px]">Organization (O)</span>
                    <span className="text-bright font-mono">{decoded.subject.organization}</span>
                  </div>
                )}
                {decoded.subject.organizationalUnit && (
                  <div>
                    <span className="text-subtle block text-[11px]">Organizational Unit (OU)</span>
                    <span className="text-bright font-mono">{decoded.subject.organizationalUnit}</span>
                  </div>
                )}
                <div className="flex gap-4">
                  {decoded.subject.country && (
                    <div>
                      <span className="text-subtle block text-[11px]">Country (C)</span>
                      <span className="text-bright font-mono">{decoded.subject.country}</span>
                    </div>
                  )}
                  {decoded.subject.stateOrProvince && (
                    <div>
                      <span className="text-subtle block text-[11px]">State / Province (ST)</span>
                      <span className="text-bright font-mono">{decoded.subject.stateOrProvince}</span>
                    </div>
                  )}
                  {decoded.subject.locality && (
                    <div>
                      <span className="text-subtle block text-[11px]">Locality (L)</span>
                      <span className="text-bright font-mono">{decoded.subject.locality}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Issuer Card */}
            <div className="surface-panel p-4 rounded-lg space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-xs font-semibold font-sans text-bright flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-sky-400" />
                  Issuer (Authority)
                </span>
                {decoded.isCA && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 text-[10px] font-mono border border-amber-500/20">
                    Certificate Authority (CA)
                  </span>
                )}
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-subtle block text-[11px]">Common Name (CN)</span>
                  <span className="text-bright font-mono font-medium">
                    {decoded.issuer.commonName || '—'}
                  </span>
                </div>
                {decoded.issuer.organization && (
                  <div>
                    <span className="text-subtle block text-[11px]">Organization (O)</span>
                    <span className="text-bright font-mono">{decoded.issuer.organization}</span>
                  </div>
                )}
                <div className="flex gap-4">
                  {decoded.issuer.country && (
                    <div>
                      <span className="text-subtle block text-[11px]">Country (C)</span>
                      <span className="text-bright font-mono">{decoded.issuer.country}</span>
                    </div>
                  )}
                  {decoded.issuer.stateOrProvince && (
                    <div>
                      <span className="text-subtle block text-[11px]">State (ST)</span>
                      <span className="text-bright font-mono">{decoded.issuer.stateOrProvince}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Subject Alternative Names (SANs) */}
          {decoded.subjectAltNames.length > 0 && (
            <div className="surface-panel p-4 rounded-lg space-y-2">
              <span className="text-xs font-semibold font-sans text-bright flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-accent" />
                Subject Alternative Names (SANs) ({decoded.subjectAltNames.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {decoded.subjectAltNames.map((san, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-surface border border-border text-xs font-mono text-dim hover:text-bright transition-colors"
                  >
                    {san}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Key & Cryptographic Parameters */}
          <div className="surface-panel p-4 rounded-lg space-y-3">
            <span className="text-xs font-semibold font-sans text-bright flex items-center gap-1.5 border-b border-border pb-2">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              Cryptographic & Key Specifications
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
              <div>
                <span className="text-subtle block text-[11px]">Signature Algorithm</span>
                <span className="text-bright">{decoded.signatureAlgorithm}</span>
              </div>
              <div>
                <span className="text-subtle block text-[11px]">Public Key Algorithm</span>
                <span className="text-bright">{decoded.publicKeyAlgorithm}</span>
              </div>
              <div>
                <span className="text-subtle block text-[11px]">Key Size / Curve</span>
                <span className="text-bright">{decoded.publicKeySize}</span>
              </div>
              <div>
                <span className="text-subtle block text-[11px]">Key Usages</span>
                <span className="text-bright">
                  {decoded.keyUsages.length > 0 ? decoded.keyUsages.join(', ') : 'Standard'}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-border/60">
              <span className="text-subtle block text-[11px] font-mono">Serial Number</span>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-0.5 font-mono text-xs">
                <span className="text-bright break-all">Hex: {decoded.serialNumberHex}</span>
                <span className="text-muted hidden sm:inline">|</span>
                <span className="text-dim">Dec: {decoded.serialNumberDec}</span>
              </div>
            </div>
          </div>

          {/* Cryptographic Fingerprints */}
          <div className="surface-panel p-4 rounded-lg space-y-3">
            <span className="text-xs font-semibold font-sans text-bright flex items-center gap-1.5 border-b border-border pb-2">
              <Cpu className="w-3.5 h-3.5 text-accent" />
              Certificate Fingerprints (Computed locally with WebCrypto)
            </span>

            <div className="space-y-2">
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-subtle mb-1">
                  <span>SHA-256 Fingerprint</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(decoded.sha256Fingerprint, 'sha256')}
                    className="flex items-center gap-1 text-dim hover:text-bright"
                  >
                    {copiedSha256 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSha256 ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-2 rounded bg-bg border border-border font-mono text-xs text-bright break-all select-all">
                  {decoded.sha256Fingerprint}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-subtle mb-1">
                  <span>SHA-1 Fingerprint</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(decoded.sha1Fingerprint, 'sha1')}
                    className="flex items-center gap-1 text-dim hover:text-bright"
                  >
                    {copiedSha1 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSha1 ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-2 rounded bg-bg border border-border font-mono text-xs text-bright break-all select-all">
                  {decoded.sha1Fingerprint}
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  )
}
