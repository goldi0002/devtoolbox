import React, { useState, useEffect, useMemo, useRef } from 'react'
import SectionPanel from '../../ui/SectionPanel'
import TextInputField from '../../ui/TextInputField'
import TextAreaField from '../../ui/TextAreaField'
import CopyButton from '../../CopyButton'
import {
  generateCustomSvg,
  generateEps,
  generateRasterDataUrl,
  analyzePayloadSafety,
  ErrorCorrectionLevel,
  ModuleShape,
  EyeShape,
  QrVectorOptions
} from '../../../utils/qrVectorEngine'
import {
  Download,
  QrCode as QrCodeIcon,
  Globe,
  Wifi,
  Mail,
  Phone,
  MessageSquare,
  Copy,
  Check,
  ShieldCheck,
  Sliders,
  Sparkles,
  Layers,
  FileCode,
  Image as ImageIcon,
  AlertTriangle,
  Upload,
  RefreshCw,
  Eye,
  CreditCard,
  MapPin
} from 'lucide-react'

type InputType = 'url' | 'text' | 'wifi' | 'vcard' | 'email' | 'phone' | 'sms' | 'crypto' | 'geo'
type ExportFormat = 'svg' | 'eps' | 'png' | 'jpeg'

const PRESET_LOGOS = [
  { id: 'globe', label: 'Web / Link', icon: Globe },
  { id: 'wifi', label: 'Wi-Fi', icon: Wifi },
  { id: 'mail', label: 'Email', icon: Mail },
  { id: 'phone', label: 'Phone', icon: Phone },
  { id: 'shield', label: 'Secure', icon: ShieldCheck },
  { id: 'crypto', label: 'Bitcoin', icon: CreditCard },
]

export default function QrCodeGenerator() {
  const [inputType, setInputType] = useState<InputType>('url')
  const [textValue, setTextValue] = useState('https://toolbox4devs.com')

  // Wi-Fi states
  const [wifiSsid, setWifiSsid] = useState('Office_Guest_WiFi')
  const [wifiPassword, setWifiPassword] = useState('SecurePass2026')
  const [wifiEncryption, setWifiEncryption] = useState<'WPA' | 'WEP' | 'nopass'>('WPA')
  const [wifiHidden, setWifiHidden] = useState(false)

  // vCard Contact states
  const [vcardName, setVcardName] = useState('Alex Morgan')
  const [vcardOrg, setVcardOrg] = useState('DevStudio Inc.')
  const [vcardTitle, setVcardTitle] = useState('Lead Software Engineer')
  const [vcardPhone, setVcardPhone] = useState('+1 (555) 234-5678')
  const [vcardEmail, setVcardEmail] = useState('alex@example.com')
  const [vcardUrl, setVcardUrl] = useState('https://example.com')

  // Email states
  const [emailTo, setEmailTo] = useState('contact@toolbox4devs.com')
  const [emailSubject, setEmailSubject] = useState('Inquiry from QR code')
  const [emailBody, setEmailBody] = useState('Hello, I scanned your vector QR code...')

  // Phone & SMS
  const [phoneTel, setPhoneTel] = useState('+1234567890')
  const [smsPhone, setSmsPhone] = useState('+1234567890')
  const [smsMessage, setSmsMessage] = useState('Hello! Check out ToolBox4Devs.')

  // Crypto & Geo
  const [cryptoCoin, setCryptoCoin] = useState<'bitcoin' | 'ethereum' | 'solana'>('bitcoin')
  const [cryptoAddress, setCryptoAddress] = useState('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')
  const [cryptoAmount, setCryptoAmount] = useState('')
  const [geoLat, setGeoLat] = useState('37.7749')
  const [geoLng, setGeoLng] = useState('-122.4194')

  // Customization & Vector States
  const [fgColor, setFgColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [transparentBg, setTransparentBg] = useState(false)
  const [errorLevel, setErrorLevel] = useState<ErrorCorrectionLevel>('M')
  const [moduleShape, setModuleShape] = useState<ModuleShape>('square')
  const [eyeShape, setEyeShape] = useState<EyeShape>('square')
  const [margin, setMargin] = useState<number>(4)
  const [exportSize, setExportSize] = useState<number>(1024)
  const [downloadFormat, setDownloadFormat] = useState<ExportFormat>('svg')

  // Center Logo
  const [hasLogo, setHasLogo] = useState(false)
  const [selectedLogoPreset, setSelectedLogoPreset] = useState<string>('globe')
  const [customLogoUrl, setCustomLogoUrl] = useState<string>('')

  // Generated outputs
  const [svgOutput, setSvgOutput] = useState<string>('')
  const [pngPreviewUrl, setPngPreviewUrl] = useState<string>('')
  const [epsOutput, setEpsOutput] = useState<string>('')
  const [renderError, setRenderError] = useState<string | null>(null)
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Compute standard payload string
  const computedPayload = useMemo(() => {
    switch (inputType) {
      case 'url':
      case 'text':
        return textValue.trim()
      case 'wifi':
        return `WIFI:T:${wifiEncryption};S:${wifiSsid};P:${wifiEncryption === 'nopass' ? '' : wifiPassword};H:${wifiHidden ? 'true' : 'false'};;`
      case 'vcard':
        return [
          'BEGIN:VCARD',
          'VERSION:3.0',
          `FN:${vcardName}`,
          `ORG:${vcardOrg}`,
          `TITLE:${vcardTitle}`,
          `TEL;TYPE=CELL:${vcardPhone}`,
          `EMAIL:${vcardEmail}`,
          `URL:${vcardUrl}`,
          'END:VCARD'
        ].join('\n')
      case 'email':
        return `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`
      case 'phone':
        return `tel:${phoneTel.replace(/\s+/g, '')}`
      case 'sms':
        return `smsto:${smsPhone.replace(/\s+/g, '')}:${smsMessage}`
      case 'crypto':
        if (cryptoCoin === 'bitcoin') {
          return `bitcoin:${cryptoAddress}${cryptoAmount ? `?amount=${cryptoAmount}` : ''}`
        } else if (cryptoCoin === 'ethereum') {
          return `ethereum:${cryptoAddress}${cryptoAmount ? `?value=${cryptoAmount}` : ''}`
        }
        return `solana:${cryptoAddress}${cryptoAmount ? `?amount=${cryptoAmount}` : ''}`
      case 'geo':
        return `geo:${geoLat},${geoLng}?q=${geoLat},${geoLng}`
      default:
        return textValue
    }
  }, [
    inputType,
    textValue,
    wifiSsid,
    wifiPassword,
    wifiEncryption,
    wifiHidden,
    vcardName,
    vcardOrg,
    vcardTitle,
    vcardPhone,
    vcardEmail,
    vcardUrl,
    emailTo,
    emailSubject,
    emailBody,
    phoneTel,
    smsPhone,
    smsMessage,
    cryptoCoin,
    cryptoAddress,
    cryptoAmount,
    geoLat,
    geoLng
  ])

  // Payload safety analysis
  const safetyReport = useMemo(() => {
    return analyzePayloadSafety(computedPayload)
  }, [computedPayload])

  // QR Vector Options
  const vectorOptions: QrVectorOptions = useMemo(() => {
    // If center logo is active, boost error correction level to 'H' (30% redundancy)
    const effectiveError = hasLogo ? 'H' : errorLevel
    return {
      text: computedPayload,
      errorCorrectionLevel: effectiveError,
      margin,
      size: 400,
      fgColor,
      bgColor,
      transparentBg,
      moduleShape,
      eyeShape,
      centerLogo: hasLogo ? {
        type: customLogoUrl ? 'custom' : 'preset',
        presetId: selectedLogoPreset,
        dataUrl: customLogoUrl
      } : undefined
    }
  }, [
    computedPayload,
    errorLevel,
    margin,
    fgColor,
    bgColor,
    transparentBg,
    moduleShape,
    eyeShape,
    hasLogo,
    selectedLogoPreset,
    customLogoUrl
  ])

  // Generate SVG, EPS, and PNG preview
  useEffect(() => {
    if (!computedPayload) {
      setSvgOutput('')
      setPngPreviewUrl('')
      setEpsOutput('')
      setRenderError('Please enter text or data to generate your QR code.')
      return
    }

    try {
      const svg = generateCustomSvg(vectorOptions)
      const eps = generateEps(vectorOptions)
      setSvgOutput(svg)
      setEpsOutput(eps)
      setRenderError(null)

      // Generate raster preview
      generateRasterDataUrl(vectorOptions, 'png', 1)
        .then(url => setPngPreviewUrl(url))
        .catch(err => {
          console.error(err)
        })
    } catch (err: any) {
      setRenderError(err?.message || 'Failed to generate QR code vector')
      setSvgOutput('')
      setPngPreviewUrl('')
      setEpsOutput('')
    }
  }, [computedPayload, vectorOptions])

  // Custom Logo file upload handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setCustomLogoUrl(event.target.result)
        setHasLogo(true)
      }
    }
    reader.readAsDataURL(file)
  }

  // Master Download Action
  const handleDownload = async () => {
    if (!computedPayload) return

    const baseFileName = `qrcode-${Date.now()}`

    if (downloadFormat === 'svg') {
      const blob = new Blob([svgOutput], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${baseFileName}.svg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      return
    }

    if (downloadFormat === 'eps') {
      const blob = new Blob([epsOutput], { type: 'application/postscript;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${baseFileName}.eps`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      return
    }

    // High-Res PNG or JPEG raster download
    try {
      const mime = downloadFormat === 'jpeg' ? 'jpeg' : 'png'
      const multiplier = Math.max(1, Math.round(exportSize / 400))
      const dataUrl = await generateRasterDataUrl(vectorOptions, mime, multiplier)
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `${baseFileName}.${downloadFormat}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (err) {
      console.error(err)
    }
  }

  // Clipboard Copiers
  const handleCopySvg = () => {
    if (!svgOutput) return
    navigator.clipboard.writeText(svgOutput)
    setCopiedFormat('svg')
    setTimeout(() => setCopiedFormat(null), 2000)
  }

  const handleCopyEps = () => {
    if (!epsOutput) return
    navigator.clipboard.writeText(epsOutput)
    setCopiedFormat('eps')
    setTimeout(() => setCopiedFormat(null), 2000)
  }

  const handleCopyPngDataUrl = () => {
    if (!pngPreviewUrl) return
    navigator.clipboard.writeText(pngPreviewUrl)
    setCopiedFormat('dataUrl')
    setTimeout(() => setCopiedFormat(null), 2000)
  }

  return (
    <div className="space-y-6">
      {/* ── Privacy & Safety Guarantee Banner ─────────────────────── */}
      <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2.5 text-emerald-300 font-medium">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <span className="font-semibold text-emerald-200">100% Safe &amp; Static QR Generator:</span>
            <span className="text-emerald-300/90 ml-1.5 hidden sm:inline">
              Pure client-side ISO/IEC 18004. Never expires, zero redirect middleman, zero tracking.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-emerald-400/80 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
          <span>Infinite Vector (SVG / EPS)</span>
          <span>•</span>
          <span>Transparent PNG</span>
        </div>
      </div>

      {/* ── Input Type Selector Tabs ──────────────────────────────── */}
      <div className="flex flex-wrap gap-1.5 p-1.5 bg-surface border border-border rounded-xl">
        {[
          { id: 'url', label: 'URL / Link', icon: Globe },
          { id: 'text', label: 'Plain Text', icon: QrCodeIcon },
          { id: 'wifi', label: 'Wi-Fi Network', icon: Wifi },
          { id: 'vcard', label: 'vCard Contact', icon: CreditCard },
          { id: 'email', label: 'Email', icon: Mail },
          { id: 'phone', label: 'Phone', icon: Phone },
          { id: 'sms', label: 'SMS Message', icon: MessageSquare },
          { id: 'crypto', label: 'Crypto Address', icon: CreditCard },
          { id: 'geo', label: 'Location Map', icon: MapPin },
        ].map(item => {
          const Icon = item.icon
          const isActive = inputType === item.id
          return (
            <button
              key={item.id}
              onClick={() => setInputType(item.id as InputType)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                isActive
                  ? 'bg-accent text-white shadow-xs font-semibold'
                  : 'text-subtle hover:text-bright hover:bg-hover'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>

      {/* ── Main Content Grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Data Payload & Vector Customization (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Payload Input */}
          <SectionPanel title="1. QR Code Content & Safety Verification">
            <div className="space-y-4">
              {inputType === 'url' && (
                <div>
                  <TextInputField
                    label="Target Website URL"
                    value={textValue}
                    onChange={setTextValue}
                    placeholder="https://example.com/page"
                  />
                  <p className="text-[11px] text-muted mt-1.5">
                    Include the protocol (<code>https://</code>) for instant browser navigation when scanned.
                  </p>
                </div>
              )}

              {inputType === 'text' && (
                <div>
                  <TextAreaField
                    label="Text or Payload"
                    value={textValue}
                    onChange={setTextValue}
                    placeholder="Enter any text, raw data, or JSON payload..."
                    rows={4}
                  />
                  <div className="flex justify-between items-center text-[11px] text-muted mt-1.5">
                    <span>{textValue.length} characters</span>
                    <span>Supports UTF-8, emojis, and multiline text</span>
                  </div>
                </div>
              )}

              {inputType === 'wifi' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <TextInputField
                      label="Wi-Fi SSID (Network Name)"
                      value={wifiSsid}
                      onChange={setWifiSsid}
                      placeholder="MyOfficeWiFi"
                    />
                    <div>
                      <label className="block text-xs font-medium text-subtle mb-1.5">Security Type</label>
                      <select
                        value={wifiEncryption}
                        onChange={e => setWifiEncryption(e.target.value as 'WPA' | 'WEP' | 'nopass')}
                        className="w-full bg-surface border border-border text-bright rounded px-3 py-2 text-xs focus:outline-none focus:border-accent"
                      >
                        <option value="WPA">WPA / WPA2 / WPA3 (Recommended)</option>
                        <option value="WEP">WEP (Legacy)</option>
                        <option value="nopass">Open Network (No Password)</option>
                      </select>
                    </div>
                  </div>

                  {wifiEncryption !== 'nopass' && (
                    <TextInputField
                      label="Network Password"
                      value={wifiPassword}
                      onChange={setWifiPassword}
                      type="text"
                      placeholder="Enter network password"
                    />
                  )}

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-subtle hover:text-bright select-none pt-1">
                    <input
                      type="checkbox"
                      checked={wifiHidden}
                      onChange={e => setWifiHidden(e.target.checked)}
                      className="rounded border-border text-accent focus:ring-accent"
                    />
                    <span>Hidden SSID network</span>
                  </label>
                </div>
              )}

              {inputType === 'vcard' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <TextInputField
                      label="Full Name"
                      value={vcardName}
                      onChange={setVcardName}
                      placeholder="Jane Doe"
                    />
                    <TextInputField
                      label="Organization / Company"
                      value={vcardOrg}
                      onChange={setVcardOrg}
                      placeholder="Acme Corp"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <TextInputField
                      label="Job Title"
                      value={vcardTitle}
                      onChange={setVcardTitle}
                      placeholder="Product Architect"
                    />
                    <TextInputField
                      label="Phone Number"
                      value={vcardPhone}
                      onChange={setVcardPhone}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <TextInputField
                      label="Email Address"
                      value={vcardEmail}
                      onChange={setVcardEmail}
                      placeholder="jane@example.com"
                    />
                    <TextInputField
                      label="Website / Portfolio"
                      value={vcardUrl}
                      onChange={setVcardUrl}
                      placeholder="https://janedoe.me"
                    />
                  </div>
                </div>
              )}

              {inputType === 'email' && (
                <div className="space-y-3">
                  <TextInputField
                    label="Recipient Email"
                    value={emailTo}
                    onChange={setEmailTo}
                    placeholder="contact@company.com"
                    type="email"
                  />
                  <TextInputField
                    label="Subject (Optional)"
                    value={emailSubject}
                    onChange={setEmailSubject}
                    placeholder="QR Code Inquiry"
                  />
                  <TextAreaField
                    label="Message Body (Optional)"
                    value={emailBody}
                    onChange={setEmailBody}
                    placeholder="Write your email body..."
                    rows={3}
                  />
                </div>
              )}

              {inputType === 'phone' && (
                <div>
                  <TextInputField
                    label="Telephone Number"
                    value={phoneTel}
                    onChange={setPhoneTel}
                    placeholder="+1 (555) 000-0000"
                    type="tel"
                  />
                </div>
              )}

              {inputType === 'sms' && (
                <div className="space-y-3">
                  <TextInputField
                    label="Recipient Phone Number"
                    value={smsPhone}
                    onChange={setSmsPhone}
                    placeholder="+1 (555) 000-0000"
                    type="tel"
                  />
                  <TextAreaField
                    label="SMS Text Message"
                    value={smsMessage}
                    onChange={setSmsMessage}
                    placeholder="Type SMS text..."
                    rows={3}
                  />
                </div>
              )}

              {inputType === 'crypto' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-subtle mb-1.5">Cryptocurrency</label>
                      <select
                        value={cryptoCoin}
                        onChange={e => setCryptoCoin(e.target.value as any)}
                        className="w-full bg-surface border border-border text-bright rounded px-3 py-2 text-xs focus:outline-none focus:border-accent"
                      >
                        <option value="bitcoin">Bitcoin (BTC)</option>
                        <option value="ethereum">Ethereum (ETH)</option>
                        <option value="solana">Solana (SOL)</option>
                      </select>
                    </div>
                    <TextInputField
                      label="Requested Amount (Optional)"
                      value={cryptoAmount}
                      onChange={setCryptoAmount}
                      placeholder="0.05"
                    />
                  </div>
                  <TextInputField
                    label="Wallet Receiving Address"
                    value={cryptoAddress}
                    onChange={setCryptoAddress}
                    placeholder="1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
                  />
                </div>
              )}

              {inputType === 'geo' && (
                <div className="grid grid-cols-2 gap-3">
                  <TextInputField
                    label="Latitude"
                    value={geoLat}
                    onChange={setGeoLat}
                    placeholder="37.7749"
                  />
                  <TextInputField
                    label="Longitude"
                    value={geoLng}
                    onChange={setGeoLng}
                    placeholder="-122.4194"
                  />
                </div>
              )}

              {/* Safety Alerts */}
              {safetyReport.warnings.length > 0 && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs font-mono text-amber-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-400">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Safety Notice</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-300/90">
                    {safetyReport.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Encoded Payload Inspector */}
              <div className="pt-2 border-t border-border">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] font-mono text-muted uppercase tracking-wider">Raw Encoded Payload:</span>
                  <CopyButton text={computedPayload} label="Copy Payload" />
                </div>
                <div className="p-2 bg-surface-dark border border-border rounded font-mono text-xs text-dim break-all select-all max-h-24 overflow-y-auto">
                  {computedPayload || '<Empty>'}
                </div>
              </div>
            </div>
          </SectionPanel>

          {/* Section 2: Vector Customization & Styling */}
          <SectionPanel title="2. Vector Shapes & Styling">
            <div className="space-y-4">
              {/* Module Shape & Corner Eyes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-subtle mb-1.5">Module Shape</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: 'square', label: 'Square' },
                      { id: 'dots', label: 'Dots' },
                      { id: 'rounded', label: 'Rounded' },
                      { id: 'squircle', label: 'Squircle' },
                    ].map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setModuleShape(s.id as ModuleShape)}
                        className={`px-2 py-1.5 text-xs font-medium rounded border transition-all text-center ${
                          moduleShape === s.id
                            ? 'bg-accent/20 border-accent text-accent font-semibold'
                            : 'bg-surface border-border text-subtle hover:text-bright hover:bg-hover'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-subtle mb-1.5">Corner Eye Style</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'square', label: 'Square' },
                      { id: 'rounded', label: 'Rounded' },
                      { id: 'circle', label: 'Circle' },
                    ].map(e => (
                      <button
                        key={e.id}
                        type="button"
                        onClick={() => setEyeShape(e.id as EyeShape)}
                        className={`px-2 py-1.5 text-xs font-medium rounded border transition-all text-center ${
                          eyeShape === e.id
                            ? 'bg-accent/20 border-accent text-accent font-semibold'
                            : 'bg-surface border-border text-subtle hover:text-bright hover:bg-hover'
                        }`}
                      >
                        {e.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Color Customization */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-medium text-subtle mb-1.5">Pattern (Foreground)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={fgColor}
                      onChange={e => setFgColor(e.target.value)}
                      className="h-8 w-10 p-0.5 border border-border rounded cursor-pointer bg-surface"
                    />
                    <input
                      type="text"
                      value={fgColor}
                      onChange={e => setFgColor(e.target.value)}
                      className="input-base font-mono text-xs flex-1 uppercase"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-medium text-subtle">Background</label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-muted hover:text-bright select-none">
                      <input
                        type="checkbox"
                        checked={transparentBg}
                        onChange={e => setTransparentBg(e.target.checked)}
                        className="rounded border-border text-accent focus:ring-accent"
                      />
                      <span className="font-semibold text-accent">Transparent BG</span>
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgColor}
                      disabled={transparentBg}
                      onChange={e => setBgColor(e.target.value)}
                      className={`h-8 w-10 p-0.5 border border-border rounded cursor-pointer bg-surface ${
                        transparentBg ? 'opacity-40 cursor-not-allowed' : ''
                      }`}
                    />
                    <input
                      type="text"
                      value={transparentBg ? 'TRANSPARENT' : bgColor}
                      disabled={transparentBg}
                      onChange={e => setBgColor(e.target.value)}
                      className={`input-base font-mono text-xs flex-1 uppercase ${
                        transparentBg ? 'opacity-40 cursor-not-allowed text-accent font-semibold' : ''
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Error Correction & Margin */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-medium text-subtle">Error Correction</label>
                    {hasLogo && (
                      <span className="text-[10px] text-emerald-400 font-mono">Auto-Locked to H (30%)</span>
                    )}
                  </div>
                  <select
                    value={hasLogo ? 'H' : errorLevel}
                    disabled={hasLogo}
                    onChange={e => setErrorLevel(e.target.value as ErrorCorrectionLevel)}
                    className="w-full bg-surface border border-border text-bright rounded px-3 py-2 text-xs focus:outline-none focus:border-accent disabled:opacity-60"
                  >
                    <option value="L">Level L (~7% redundancy - Highest density)</option>
                    <option value="M">Level M (~15% redundancy - Standard)</option>
                    <option value="Q">Level Q (~25% redundancy - High reliability)</option>
                    <option value="H">Level H (~30% redundancy - Max resilience for print)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-subtle mb-1.5">
                    Quiet Zone Margin ({margin} modules)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="8"
                    step="1"
                    value={margin}
                    onChange={e => setMargin(parseInt(e.target.value, 10))}
                    className="w-full accent-accent mt-2 cursor-pointer"
                  />
                </div>
              </div>

              {/* Quick Themes */}
              <div className="pt-2">
                <span className="block text-xs font-medium text-subtle mb-2">Preset Color Themes:</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Classic Ink', fg: '#000000', bg: '#ffffff', trans: false },
                    { label: 'Transparent Indigo', fg: '#4f46e5', bg: '#ffffff', trans: true },
                    { label: 'Cyber Dark', fg: '#38bdf8', bg: '#090d16', trans: false },
                    { label: 'Forest Green', fg: '#059669', bg: '#ecfdf5', trans: false },
                    { label: 'Transparent Crimson', fg: '#e11d48', bg: '#ffffff', trans: true },
                  ].map(preset => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setFgColor(preset.fg)
                        setBgColor(preset.bg)
                        setTransparentBg(preset.trans)
                      }}
                      className="px-2.5 py-1 text-[11px] font-medium rounded border border-border bg-surface hover:bg-hover text-subtle hover:text-bright transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </SectionPanel>
        </div>

        {/* Right Column: Live Vector Preview & Multi-Format Download (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <SectionPanel title="Live Preview & Vector Export">
            <div className="flex flex-col items-center justify-center p-6 bg-surface-dark border border-border rounded-xl">
              {renderError ? (
                <div className="py-12 text-center text-xs text-red-400 max-w-xs">
                  <p className="font-semibold mb-1">Rendering Notice</p>
                  <p className="text-muted">{renderError}</p>
                </div>
              ) : svgOutput ? (
                <div className="relative group">
                  <div
                    className="p-4 rounded-xl shadow-lg border border-border flex items-center justify-center transition-transform duration-200"
                    style={{
                      backgroundColor: transparentBg ? 'transparent' : bgColor,
                      backgroundImage: transparentBg
                        ? 'linear-gradient(45deg, #1e1e24 25%, transparent 25%), linear-gradient(-45deg, #1e1e24 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1e1e24 75%), linear-gradient(-45deg, transparent 75%, #1e1e24 75%)'
                        : undefined,
                      backgroundSize: '16px 16px',
                      backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px'
                    }}
                  >
                    {/* Render live SVG element */}
                    <div
                      className="w-56 h-56 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                      dangerouslySetInnerHTML={{ __html: svgOutput }}
                    />
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center text-xs text-muted">
                  Generating vector preview...
                </div>
              )}

              {/* Status Metadata Badges */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] text-muted font-mono">
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>ISO/IEC 18004</span>
                </span>
                <span>•</span>
                <span>ECC: <strong>{hasLogo ? 'H (30%)' : errorLevel}</strong></span>
                <span>•</span>
                <span>{transparentBg ? 'Transparent' : 'Solid BG'}</span>
              </div>
            </div>

            {/* Export & Resolution Settings */}
            <div className="mt-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-subtle mb-1">Target Format</label>
                  <select
                    value={downloadFormat}
                    onChange={e => setDownloadFormat(e.target.value as ExportFormat)}
                    className="w-full bg-surface border border-border text-bright rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-accent"
                  >
                    <option value="svg">SVG (Infinite Vector)</option>
                    <option value="eps">EPS (PostScript / Illustrator)</option>
                    <option value="png">PNG (Lossless Raster)</option>
                    <option value="jpeg">JPEG (Standard Image)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-subtle mb-1">Resolution (Raster)</label>
                  <select
                    value={exportSize}
                    onChange={e => setExportSize(parseInt(e.target.value, 10))}
                    disabled={downloadFormat === 'svg' || downloadFormat === 'eps'}
                    className="w-full bg-surface border border-border text-bright rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-accent disabled:opacity-50"
                  >
                    <option value={512}>512 × 512 px (Standard)</option>
                    <option value={1024}>1024 × 1024 px (HD Web)</option>
                    <option value={2048}>2048 × 2048 px (2K Print)</option>
                    <option value={4096}>4096 × 4096 px (4K Ultra Print)</option>
                  </select>
                </div>
              </div>

              {/* Primary Download Button */}
              <button
                type="button"
                onClick={handleDownload}
                disabled={!svgOutput}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent/90 text-white text-xs font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download {downloadFormat.toUpperCase()} Vector / Image</span>
              </button>

              {/* Quick Copy Buttons */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopySvg}
                  disabled={!svgOutput}
                  className="flex items-center justify-center gap-1.5 px-2.5 py-2 bg-surface hover:bg-hover border border-border text-subtle hover:text-bright text-xs font-medium rounded-lg transition-colors disabled:opacity-40"
                  title="Copy raw Scalable Vector Graphics markup"
                >
                  {copiedFormat === 'svg' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileCode className="w-3.5 h-3.5 text-sky-400" />}
                  <span>{copiedFormat === 'svg' ? 'Copied SVG!' : 'Copy SVG'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyEps}
                  disabled={!epsOutput}
                  className="flex items-center justify-center gap-1.5 px-2.5 py-2 bg-surface hover:bg-hover border border-border text-subtle hover:text-bright text-xs font-medium rounded-lg transition-colors disabled:opacity-40"
                  title="Copy Encapsulated PostScript EPS code"
                >
                  {copiedFormat === 'eps' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Layers className="w-3.5 h-3.5 text-amber-400" />}
                  <span>{copiedFormat === 'eps' ? 'Copied EPS!' : 'Copy EPS'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyPngDataUrl}
                  disabled={!pngPreviewUrl}
                  className="flex items-center justify-center gap-1.5 px-2.5 py-2 bg-surface hover:bg-hover border border-border text-subtle hover:text-bright text-xs font-medium rounded-lg transition-colors disabled:opacity-40"
                  title="Copy Base64 Data URL"
                >
                  {copiedFormat === 'dataUrl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFormat === 'dataUrl' ? 'Copied URL!' : 'Copy URI'}</span>
                </button>
              </div>
            </div>
          </SectionPanel>

          {/* Quick FAQ / Vector Guide */}
          <div className="p-4 bg-surface border border-border rounded-xl text-xs space-y-2.5 font-sans">
            <h4 className="font-semibold text-bright flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>Why Use Vector (SVG / EPS)?</span>
            </h4>
            <ul className="text-muted space-y-1.5 list-disc list-inside text-[11px] leading-relaxed">
              <li>
                <strong>SVG &amp; EPS</strong> scale infinitely with zero pixelation or blurriness — essential for billboard signage, packaging, stickers, and t-shirts.
              </li>
              <li>
                <strong>EPS (Encapsulated PostScript)</strong> is natively supported by Adobe Illustrator, InDesign, CorelDRAW, and high-end CMYK print presses.
              </li>
              <li>
                <strong>Transparent Background</strong> allows placing QR codes seamlessly over gradients, custom flyer templates, and dark user interfaces.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
