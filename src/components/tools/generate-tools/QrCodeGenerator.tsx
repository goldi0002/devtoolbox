import React, { useState, useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import SectionPanel from '../../ui/SectionPanel'
import TextInputField from '../../ui/TextInputField'
import TextAreaField from '../../ui/TextAreaField'
import CopyButton from '../../CopyButton'
import { Download, RefreshCw, QrCode as QrCodeIcon, Globe, Wifi, Mail, Phone, MessageSquare, Copy, Check } from 'lucide-react'

type InputType = 'text' | 'url' | 'wifi' | 'email' | 'phone' | 'sms'
type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H'

export default function QrCodeGenerator() {
  const [inputType, setInputType] = useState<InputType>('url')
  const [textValue, setTextValue] = useState('https://toolbox4devs.com')
  
  // Structured input states
  const [wifiSsid, setWifiSsid] = useState('MyHomeWiFi')
  const [wifiPassword, setWifiPassword] = useState('SuperSecretPass')
  const [wifiEncryption, setWifiEncryption] = useState<'WPA' | 'WEP' | 'nopass'>('WPA')
  const [wifiHidden, setWifiHidden] = useState(false)

  const [emailTo, setEmailTo] = useState('support@example.com')
  const [emailSubject, setEmailSubject] = useState('Hello from ToolBox4Devs')
  const [emailBody, setEmailBody] = useState('I am reaching out regarding...')

  const [phoneTel, setPhoneTel] = useState('+1234567890')

  const [smsPhone, setSmsPhone] = useState('+1234567890')
  const [smsMessage, setSmsMessage] = useState('Hello, check this out!')

  // Customization states
  const [fgColor, setFgColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [transparentBg, setTransparentBg] = useState(false)
  const [errorLevel, setErrorLevel] = useState<ErrorCorrectionLevel>('M')
  const [margin, setMargin] = useState<number>(4)
  const [size, setSize] = useState<number>(360)
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'svg' | 'jpeg'>('png')

  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [qrSvgString, setQrSvgString] = useState<string>('')
  const [renderError, setRenderError] = useState<string | null>(null)
  const [copiedDataUrl, setCopiedDataUrl] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Compute payload string
  const computedPayload = React.useMemo(() => {
    switch (inputType) {
      case 'url':
      case 'text':
        return textValue.trim()
      case 'wifi':
        return `WIFI:T:${wifiEncryption};S:${wifiSsid};P:${wifiEncryption === 'nopass' ? '' : wifiPassword};H:${wifiHidden ? 'true' : 'false'};;`
      case 'email':
        return `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`
      case 'phone':
        return `tel:${phoneTel.replace(/\s+/g, '')}`
      case 'sms':
        return `smsto:${smsPhone.replace(/\s+/g, '')}:${smsMessage}`
      default:
        return textValue
    }
  }, [inputType, textValue, wifiSsid, wifiPassword, wifiEncryption, wifiHidden, emailTo, emailSubject, emailBody, phoneTel, smsPhone, smsMessage])

  // Generate QR code data URL and SVG
  useEffect(() => {
    let isMounted = true

    if (!computedPayload) {
      setQrDataUrl('')
      setQrSvgString('')
      setRenderError('Please enter text or data to generate a QR code.')
      return
    }

    const effectiveBgColor = transparentBg ? '#00000000' : bgColor

    const qrOptions = {
      errorCorrectionLevel: errorLevel,
      margin: margin,
      width: size,
      color: {
        dark: fgColor,
        light: effectiveBgColor
      }
    }

    // Generate PNG Data URL
    QRCode.toDataURL(computedPayload, qrOptions)
      .then(url => {
        if (isMounted) {
          setQrDataUrl(url)
          setRenderError(null)
        }
      })
      .catch(err => {
        if (isMounted) {
          setRenderError(err?.message || 'Failed to generate QR code')
          setQrDataUrl('')
        }
      })

    // Generate SVG string
    QRCode.toString(computedPayload, { ...qrOptions, type: 'svg' })
      .then(svg => {
        if (isMounted) {
          setQrSvgString(svg)
        }
      })
      .catch(() => {
        // Fallback silently
      })

    return () => {
      isMounted = false
    }
  }, [computedPayload, fgColor, bgColor, transparentBg, errorLevel, margin, size])

  // Download Handler
  const handleDownload = async () => {
    if (!computedPayload) return

    const effectiveBgColor = transparentBg ? '#00000000' : bgColor

    if (downloadFormat === 'svg') {
      try {
        const svgData = await QRCode.toString(computedPayload, {
          errorCorrectionLevel: errorLevel,
          margin: margin,
          width: size,
          type: 'svg',
          color: {
            dark: fgColor,
            light: effectiveBgColor
          }
        })
        const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `qrcode-${Date.now()}.svg`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } catch (err) {
        console.error(err)
      }
      return
    }

    // Raster Download (PNG or JPEG)
    try {
      const mimeType = downloadFormat === 'jpeg' ? 'image/jpeg' : 'image/png'
      const dataUrl = await QRCode.toDataURL(computedPayload, {
        errorCorrectionLevel: errorLevel,
        margin: margin,
        width: size * 2, // High DPI export
        type: mimeType as 'image/png' | 'image/jpeg',
        color: {
          dark: fgColor,
          light: downloadFormat === 'jpeg' ? (transparentBg ? '#ffffff' : bgColor) : effectiveBgColor
        }
      })
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `qrcode-${Date.now()}.${downloadFormat}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (err) {
      console.error(err)
    }
  }

  // Copy Data URL
  const handleCopyDataUrl = () => {
    if (!qrDataUrl) return
    navigator.clipboard.writeText(qrDataUrl)
    setCopiedDataUrl(true)
    setTimeout(() => setCopiedDataUrl(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Type Selector Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-surface border border-border rounded-lg">
        {[
          { id: 'url', label: 'URL / Link', icon: Globe },
          { id: 'text', label: 'Plain Text', icon: QrCodeIcon },
          { id: 'wifi', label: 'Wi-Fi Network', icon: Wifi },
          { id: 'email', label: 'Email', icon: Mail },
          { id: 'phone', label: 'Phone Number', icon: Phone },
          { id: 'sms', label: 'SMS Message', icon: MessageSquare },
        ].map(item => {
          const Icon = item.icon
          const isActive = inputType === item.id
          return (
            <button
              key={item.id}
              onClick={() => setInputType(item.id as InputType)}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                isActive
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-subtle hover:text-bright hover:bg-hover'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Data Input & Customization (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Data Payload Input */}
          <SectionPanel title="1. QR Code Content">
            <div className="space-y-4">
              {inputType === 'url' && (
                <div>
                  <TextInputField
                    label="Website URL"
                    value={textValue}
                    onChange={setTextValue}
                    placeholder="https://example.com"
                  />
                  <p className="text-[11px] text-muted mt-1.5">
                    Include the protocol (e.g., https://) for automatic mobile browser redirection.
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
                    <span>Supports unicode, emojis, and multiline text</span>
                  </div>
                </div>
              )}

              {inputType === 'wifi' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <TextInputField
                      label="Network SSID (Name)"
                      value={wifiSsid}
                      onChange={setWifiSsid}
                      placeholder="MyWiFiNetwork"
                    />
                    <div>
                      <label className="block text-xs font-medium text-subtle mb-1.5">Security / Encryption</label>
                      <select
                        value={wifiEncryption}
                        onChange={e => setWifiEncryption(e.target.value as 'WPA' | 'WEP' | 'nopass')}
                        className="w-full bg-surface border border-border text-bright rounded px-3 py-2 text-xs focus:outline-none focus:border-accent"
                      >
                        <option value="WPA">WPA / WPA2 / WPA3 (Standard)</option>
                        <option value="WEP">WEP (Legacy)</option>
                        <option value="nopass">None (Open Network)</option>
                      </select>
                    </div>
                  </div>

                  {wifiEncryption !== 'nopass' && (
                    <TextInputField
                      label="Wi-Fi Password"
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
                    placeholder="Meeting inquiry"
                  />
                  <TextAreaField
                    label="Message Body (Optional)"
                    value={emailBody}
                    onChange={setEmailBody}
                    placeholder="Write your email template..."
                    rows={3}
                  />
                </div>
              )}

              {inputType === 'phone' && (
                <div>
                  <TextInputField
                    label="Phone Number"
                    value={phoneTel}
                    onChange={setPhoneTel}
                    placeholder="+1 (555) 000-0000"
                    type="tel"
                  />
                  <p className="text-[11px] text-muted mt-1.5">
                    Include country code for universal international dialing.
                  </p>
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
                    label="SMS Message Content"
                    value={smsMessage}
                    onChange={setSmsMessage}
                    placeholder="Type SMS text..."
                    rows={3}
                  />
                </div>
              )}

              {/* Payload Preview */}
              <div className="pt-2 border-t border-border">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] font-mono text-muted uppercase tracking-wider">Raw Encoded Payload:</span>
                  <CopyButton text={computedPayload} label="Copy Payload" />
                </div>
                <div className="p-2 bg-surface-dark border border-border rounded font-mono text-xs text-dim break-all select-all">
                  {computedPayload || '<Empty>'}
                </div>
              </div>
            </div>
          </SectionPanel>

          {/* Styling & Customization */}
          <SectionPanel title="2. Design & Output Options">
            <div className="space-y-4">
              {/* Colors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-subtle mb-1.5">Foreground (QR Pattern)</label>
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
                    <label className="block text-xs font-medium text-subtle">Background Color</label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-muted hover:text-bright select-none">
                      <input
                        type="checkbox"
                        checked={transparentBg}
                        onChange={e => setTransparentBg(e.target.checked)}
                        className="rounded border-border text-accent focus:ring-accent"
                      />
                      <span>Transparent</span>
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
                        transparentBg ? 'opacity-40 cursor-not-allowed' : ''
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Error Correction & Margin */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-subtle mb-1.5">
                    Error Correction Level
                  </label>
                  <select
                    value={errorLevel}
                    onChange={e => setErrorLevel(e.target.value as ErrorCorrectionLevel)}
                    className="w-full bg-surface border border-border text-bright rounded px-3 py-2 text-xs focus:outline-none focus:border-accent"
                  >
                    <option value="L">Level L (~7% recovery - Highest density)</option>
                    <option value="M">Level M (~15% recovery - Standard)</option>
                    <option value="Q">Level Q (~25% recovery - High reliability)</option>
                    <option value="H">Level H (~30% recovery - Max resilience)</option>
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

              {/* Quick Presets */}
              <div className="pt-2">
                <span className="block text-xs font-medium text-subtle mb-2">Color Themes:</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Classic Black', fg: '#000000', bg: '#ffffff', trans: false },
                    { label: 'Cyber Dark', fg: '#3b82f6', bg: '#0f172a', trans: false },
                    { label: 'Emerald Forest', fg: '#059669', bg: '#ecfdf5', trans: false },
                    { label: 'Transparent Indigo', fg: '#6366f1', bg: '#ffffff', trans: true },
                    { label: 'High Contrast Amber', fg: '#d97706', bg: '#fffbeb', trans: false },
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

        {/* Right Column: Live QR Preview & Download (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <SectionPanel title="Live Preview & Export">
            <div className="flex flex-col items-center justify-center p-6 bg-surface-dark border border-border rounded-lg">
              {renderError ? (
                <div className="py-12 text-center text-xs text-red-400 max-w-xs">
                  <p className="font-semibold mb-1">Rendering Error</p>
                  <p className="text-muted">{renderError}</p>
                </div>
              ) : qrDataUrl ? (
                <div className="relative group">
                  <div
                    className="p-4 rounded-xl shadow-lg border border-border flex items-center justify-center transition-transform duration-200"
                    style={{
                      backgroundColor: transparentBg ? 'transparent' : bgColor,
                      backgroundImage: transparentBg
                        ? 'linear-gradient(45deg, #18181b 25%, transparent 25%), linear-gradient(-45deg, #18181b 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #18181b 75%), linear-gradient(-45deg, transparent 75%, #18181b 75%)'
                        : undefined,
                      backgroundSize: '16px 16px',
                      backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px'
                    }}
                  >
                    <img
                      src={qrDataUrl}
                      alt="Generated QR Code"
                      className="w-56 h-56 object-contain image-rendering-pixelated"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center text-xs text-muted">
                  Generating preview...
                </div>
              )}

              {/* Status Badge */}
              <div className="mt-4 flex items-center gap-2 text-[11px] text-muted">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Error Level: <strong>{errorLevel}</strong></span>
                <span>•</span>
                <span>Margin: <strong>{margin}</strong></span>
                <span>•</span>
                <span>100% In-Browser</span>
              </div>
            </div>

            {/* Export Controls */}
            <div className="mt-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-subtle mb-1">Export Resolution</label>
                  <select
                    value={size}
                    onChange={e => setSize(parseInt(e.target.value, 10))}
                    className="w-full bg-surface border border-border text-bright rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-accent"
                  >
                    <option value={200}>200 × 200 px (Small)</option>
                    <option value={360}>360 × 360 px (Medium)</option>
                    <option value={600}>600 × 600 px (HD - 600px)</option>
                    <option value={1200}>1200 × 1200 px (Ultra HD - Print)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-subtle mb-1">File Format</label>
                  <select
                    value={downloadFormat}
                    onChange={e => setDownloadFormat(e.target.value as 'png' | 'svg' | 'jpeg')}
                    className="w-full bg-surface border border-border text-bright rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-accent"
                  >
                    <option value="png">PNG (Lossless Raster)</option>
                    <option value="svg">SVG (Infinite Vector)</option>
                    <option value="jpeg">JPEG (Standard Image)</option>
                  </select>
                </div>
              </div>

              {/* Primary Download Button */}
              <button
                type="button"
                onClick={handleDownload}
                disabled={!qrDataUrl && !qrSvgString}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent/90 text-white text-xs font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download {downloadFormat.toUpperCase()} Image</span>
              </button>

              {/* Secondary Actions */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyDataUrl}
                  disabled={!qrDataUrl}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-surface hover:bg-hover border border-border text-subtle hover:text-bright text-xs font-medium rounded transition-colors"
                >
                  {copiedDataUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedDataUrl ? 'Copied Data URL' : 'Copy Data URL'}</span>
                </button>

                {qrSvgString ? (
                  <CopyButton text={qrSvgString} label="Copy Raw SVG" />
                ) : (
                  <button
                    disabled
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-surface border border-border text-muted text-xs font-medium rounded opacity-50"
                  >
                    Copy Raw SVG
                  </button>
                )}
              </div>
            </div>
          </SectionPanel>

          {/* Quick FAQ / Tips */}
          <div className="p-4 bg-surface border border-border rounded-lg text-xs space-y-2">
            <h4 className="font-semibold text-bright">Scanning Tips:</h4>
            <ul className="text-muted space-y-1 list-disc list-inside">
              <li>Keep high contrast between the pattern and background color.</li>
              <li>Use <strong>Level H</strong> error correction if you plan to print on stickers or textured surfaces.</li>
              <li>Choose <strong>SVG format</strong> for sharp, infinite vector scaling on billboards and physical print.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
