import { describe, it, expect } from 'vitest'
import { decodePemCertificate } from '../utils/x509Decoder'

const TEST_CERT = `-----BEGIN CERTIFICATE-----
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

describe('X.509 Certificate Decoder', () => {
  it('parses PEM certificate and extracts Subject, Issuer and SANs', async () => {
    const cert = await decodePemCertificate(TEST_CERT)

    expect(cert.version).toBe(3)
    expect(cert.subject.commonName).toBe('api.toolbox4devs.com')
    expect(cert.subject.organization).toBe('ToolBox4Devs')
    expect(cert.subject.country).toBe('US')
    expect(cert.issuer.commonName).toBe('api.toolbox4devs.com')
    expect(cert.signatureAlgorithm).toContain('RSA')
    expect(cert.publicKeySize).toContain('2048-bit RSA')
    expect(cert.sha256Fingerprint).toBeDefined()
    expect(cert.sha256Fingerprint.length).toBeGreaterThan(20)
    expect(cert.subjectAltNames).toContain('DNS:api.toolbox4devs.com')
    expect(cert.subjectAltNames).toContain('DNS:toolbox4devs.com')
    expect(cert.isCA).toBe(true)
  })

  it('calculates validity dates properly', async () => {
    const cert = await decodePemCertificate(TEST_CERT)
    expect(cert.validFrom.getUTCFullYear()).toBe(2026)
    expect(cert.validTo.getUTCFullYear()).toBe(2027)
  })

  it('throws descriptive error on invalid PEM', async () => {
    await expect(decodePemCertificate('not-a-certificate')).rejects.toThrow()
  })
})
