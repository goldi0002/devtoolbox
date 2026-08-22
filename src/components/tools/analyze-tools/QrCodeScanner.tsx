import { useState, useEffect, useRef, useCallback } from 'react'
import jsQR from 'jsqr'
import { Link } from 'react-router-dom'
import {
  Camera,
  Upload,
  QrCode,
  Copy,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Video,
  X,
  Sparkles,
  Wifi,
  Mail,
  Phone,
  MessageSquare,
  MapPin,
  User,
  FileText,
  VideoOff,
  Image as ImageIcon
} from 'lucide-react'
import SectionPanel from '../../ui/SectionPanel'
import CopyButton from '../../CopyButton'

// ── Types & Interfaces ───────────────────────────────────────────────────────

type ScanMode = 'camera' | 'file'

interface WiFiConfig {
  ssid: string
  password?: string
  encryption?: string
  hidden?: boolean
}

interface ContactConfig {
  name?: string
  phone?: string
  email?: string
  org?: string
  title?: string
  url?: string
  address?: string
}

interface EmailConfig {
  to: string
  subject?: string
  body?: string
}

interface SmsConfig {
  phone: string
  message?: string
}

interface DecodedResult {
  rawText: string
  type: 'url' | 'wifi' | 'contact' | 'email' | 'phone' | 'sms' | 'geo' | 'text'
  parsedWifi?: WiFiConfig
  parsedContact?: ContactConfig
  parsedEmail?: EmailConfig
  parsedSms?: SmsConfig
  parsedGeo?: { lat: string; lng: string }
}

// ── Synthesis Audio Beep ─────────────────────────────────────────────────────

const playBeep = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioCtx.createOscillator()
    const gainNode = audioCtx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioCtx.destination)

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime) // Clean high pitched beep (A5)
    gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12)

    oscillator.start()
    oscillator.stop(audioCtx.currentTime + 0.12)
  } catch (e) {
    console.warn('AudioContext beep blocked or unsupported:', e)
  }
}

// ── Parsing Parsers ──────────────────────────────────────────────────────────

const parseWiFi = (raw: string): WiFiConfig | undefined => {
  if (!raw.startsWith('WIFI:')) return undefined
  const ssidMatch = raw.match(/S:([^;]+)/)
  const passwordMatch = raw.match(/P:([^;]*)/)
  const encryptionMatch = raw.match(/T:([^;]+)/)
  const hiddenMatch = raw.match(/H:(true|false)/)

  if (!ssidMatch) return undefined

  return {
    ssid: ssidMatch[1],
    password: passwordMatch ? passwordMatch[1] : undefined,
    encryption: encryptionMatch ? encryptionMatch[1] : 'nopass',
    hidden: hiddenMatch ? hiddenMatch[1] === 'true' : false,
  }
}

const parseVCard = (raw: string): ContactConfig | undefined => {
  if (!raw.includes('BEGIN:VCARD')) return undefined

  const contact: ContactConfig = {}
  const fnMatch = raw.match(/FN:([^\r\n]+)/)
  const nMatch = raw.match(/N:([^\r\n]+)/)
  const telMatch = raw.match(/TEL(?:;[^:]*)?:([^\r\n]+)/)
  const emailMatch = raw.match(/EMAIL(?:;[^:]*)?:([^\r\n]+)/)
  const orgMatch = raw.match(/ORG:([^\r\n]+)/)
  const titleMatch = raw.match(/TITLE:([^\r\n]+)/)
  const urlMatch = raw.match(/URL(?:;[^:]*)?:([^\r\n]+)/)
  const adrMatch = raw.match(/ADR(?:;[^:]*)?:([^\r\n]+)/)

  if (fnMatch) {
    contact.name = fnMatch[1]
  } else if (nMatch) {
    // format N: Last;First;;; -> First Last
    const parts = nMatch[1].split(';').filter(Boolean)
    contact.name = parts.reverse().join(' ').trim()
  }

  if (telMatch) contact.phone = telMatch[1].trim()
  if (emailMatch) contact.email = emailMatch[1].trim()
  if (orgMatch) contact.org = orgMatch[1].replace(/;/g, ' ').trim()
  if (titleMatch) contact.title = titleMatch[1].trim()
  if (urlMatch) contact.url = urlMatch[1].trim()
  if (adrMatch) contact.address = adrMatch[1].replace(/;/g, ' ').trim()

  return contact
}

const parseEmail = (raw: string): EmailConfig | undefined => {
  if (raw.toLowerCase().startsWith('mailto:')) {
    try {
      const url = new URL(raw)
      const to = url.pathname
      const subject = url.searchParams.get('subject') || undefined
      const body = url.searchParams.get('body') || undefined
      return { to, subject, body }
    } catch {
      // Manual backup parse
      const clean = raw.substring(7)
      const parts = clean.split('?')
      const to = parts[0]
      let subject: string | undefined
      let body: string | undefined
      if (parts[1]) {
        const queryParts = parts[1].split('&')
        queryParts.forEach(qp => {
          const [k, v] = qp.split('=')
          if (k.toLowerCase() === 'subject' && v) subject = decodeURIComponent(v)
          if (k.toLowerCase() === 'body' && v) body = decodeURIComponent(v)
        })
      }
      return { to, subject, body }
    }
  }

  // Simple direct email string
  if (raw.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
    return { to: raw }
  }

  return undefined
}

const parseSms = (raw: string): SmsConfig | undefined => {
  if (raw.toLowerCase().startsWith('sms:') || raw.toLowerCase().startsWith('smsto:')) {
    const schemeLen = raw.toLowerCase().startsWith('sms:') ? 4 : 6
    const clean = raw.substring(schemeLen)
    const delimiterIndex = clean.indexOf(':')
    if (delimiterIndex === -1) {
      return { phone: clean }
    } else {
      const phone = clean.substring(0, delimiterIndex)
      const message = clean.substring(delimiterIndex + 1)
      return { phone, message }
    }
  }
  return undefined
}

const parseGeo = (raw: string): { lat: string; lng: string } | undefined => {
  if (raw.toLowerCase().startsWith('geo:')) {
    const clean = raw.substring(4)
    const coords = clean.split('?')[0].split(',')
    if (coords.length >= 2) {
      return { lat: coords[0].trim(), lng: coords[1].trim() }
    }
  }
  return undefined
}

const parseResult = (text: string): DecodedResult => {
  const trimmed = text.trim()

  // 1. Wi-Fi
  const wifi = parseWiFi(trimmed)
  if (wifi) {
    return { rawText: text, type: 'wifi', parsedWifi: wifi }
  }

  // 2. Contact
  const contact = parseVCard(trimmed)
  if (contact) {
    return { rawText: text, type: 'contact', parsedContact: contact }
  }

  // 3. Email
  const email = parseEmail(trimmed)
  if (email) {
    return { rawText: text, type: 'email', parsedEmail: email }
  }

  // 4. SMS
  const sms = parseSms(trimmed)
  if (sms) {
    return { rawText: text, type: 'sms', parsedSms: sms }
  }

  // 5. Geo Location
  const geo = parseGeo(trimmed)
  if (geo) {
    return { rawText: text, type: 'geo', parsedGeo: geo }
  }

  // 6. Phone
  if (trimmed.toLowerCase().startsWith('tel:')) {
    return { rawText: text, type: 'phone' }
  }

  // 7. URL
  if (trimmed.match(/^https?:\/\//i) || trimmed.match(/^www\./i) || (trimmed.includes('.') && !trimmed.includes(' ') && trimmed.length > 4 && trimmed.indexOf('.') < trimmed.length - 2)) {
    // Add prefix if missing
    let secureUrl = trimmed
    if (trimmed.match(/^www\./i)) {
      secureUrl = 'https://' + trimmed
    } else if (!trimmed.match(/^https?:\/\//i)) {
      secureUrl = 'https://' + trimmed
    }
    // Verify it is a plausible URL structure
    try {
      new URL(secureUrl)
      return { rawText: secureUrl, type: 'url' }
    } catch {
      // fallback
    }
  }

  return { rawText: text, type: 'text' }
}

// ── Component Implementation ─────────────────────────────────────────────────

export default function QrCodeScanner() {
  const [mode, setMode] = useState<ScanMode>('file')

  // Scanner States
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('')
  const [isScanning, setIsScanning] = useState(true)

  // File Upload States
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)

  // Result State
  const [decodedResult, setDecodedResult] = useState<DecodedResult | null>(null)

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationFrameId = useRef<number | null>(null)
  const lastScanTime = useRef<number>(0)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const requestedDeviceIdRef = useRef<string>('')

  // ── Camera Enumerate Devices ───────────────────────────────────────────────

  const loadDevices = useCallback(async () => {
    try {
      const deviceInfos = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = deviceInfos.filter(d => d.kind === 'videoinput')
      setDevices(videoDevices)

      // Auto-select a back/environment camera if possible, or default to first
      if (videoDevices.length > 0) {
        setSelectedDeviceId(prev => {
          if (prev) return prev
          const backCam = videoDevices.find(
            d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('environment')
          )
          return backCam ? backCam.deviceId : videoDevices[0].deviceId
        })
      }
    } catch (e) {
      console.warn('Enumerate devices failed:', e)
    }
  }, [])

  // Stop camera stream safely
  const stopCamera = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current)
      animationFrameId.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    requestedDeviceIdRef.current = ''
    setCameraActive(false)
  }, [])

  // Start camera stream dynamically
  const startCamera = useCallback(async () => {
    const currentRequestedId = selectedDeviceId || 'environment'

    // If we opened 'environment' and now we have a specific deviceId assigned, check if we can bridge them
    if (streamRef.current) {
      if (requestedDeviceIdRef.current === 'environment' && selectedDeviceId) {
        requestedDeviceIdRef.current = selectedDeviceId
      }
    }

    // If we are already active on the requested device, do not restart
    if (streamRef.current && requestedDeviceIdRef.current === currentRequestedId) {
      setIsScanning(true)
      return
    }

    // Stop current stream before starting a new requested device ID
    stopCamera()
    setCameraError(null)

    // Set requested ID before asynchronous call to prevent concurrent overlapping starts
    requestedDeviceIdRef.current = currentRequestedId

    try {
      const constraints: MediaStreamConstraints = {
        video: selectedDeviceId
          ? { deviceId: selectedDeviceId }
          : {
              facingMode: { ideal: 'environment' },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream
      setCameraActive(true)
      setIsScanning(true)

      // Bind the stream if videoRef is already available
      if (videoRef.current) {
        if (videoRef.current.srcObject !== stream) {
          videoRef.current.srcObject = stream
        }
        videoRef.current.setAttribute('playsinline', 'true')
        videoRef.current.play().catch(playErr => {
          if (playErr.name !== 'AbortError') {
            console.warn('Benign video play exception caught:', playErr)
          }
        })
      }

      // Enumerate devices again after permission granted to retrieve actual device labels
      await loadDevices()
    } catch (err: any) {
      console.error('Camera access failed:', err)
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Permission denied. Please grant camera access in your browser settings.')
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No video input device detected on this system.')
      } else {
        setCameraError(`Could not access camera: ${err.message || 'Unknown error'}`)
      }
      setCameraActive(false)
    }
  }, [selectedDeviceId, stopCamera, loadDevices])

  // Process and decode camera frames
  useEffect(() => {
    if (!cameraActive || !isScanning) return

    const tick = () => {
      if (!videoRef.current || !canvasRef.current || !cameraActive || !isScanning) return

      if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const now = Date.now()
        // Throttle scans to once every 120ms to save CPU power
        if (now - lastScanTime.current > 120) {
          lastScanTime.current = now

          const canvas = canvasRef.current
          const ctx = canvas.getContext('2d', { willReadFrequently: true })

          if (ctx) {
            let width = videoRef.current.videoWidth
            let height = videoRef.current.videoHeight

            // Scale down high-resolution frames for ultra-fast, robust mobile scanning
            const maxScanDimension = 800
            if (width > maxScanDimension || height > maxScanDimension) {
              if (width > height) {
                height = Math.round((height * maxScanDimension) / width)
                width = maxScanDimension
              } else {
                width = Math.round((width * maxScanDimension) / height)
                height = maxScanDimension
              }
            }

            canvas.width = width
            canvas.height = height

            ctx.drawImage(videoRef.current, 0, 0, width, height)
            const imageData = ctx.getImageData(0, 0, width, height)

            try {
              const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: 'dontInvert',
              })

              if (code && code.data) {
                playBeep()
                setDecodedResult(parseResult(code.data))
                setIsScanning(false) // pause scanning on hit
              }
            } catch (err) {
              console.error('jsQR frame decoding error:', err)
            }
          }
        }
      }

      if (cameraActive && isScanning) {
        animationFrameId.current = requestAnimationFrame(tick)
      }
    }

    animationFrameId.current = requestAnimationFrame(tick)

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [cameraActive, isScanning])

  // Backup binder to handle race conditions where videoRef becomes available after startCamera completes
  useEffect(() => {
    const video = videoRef.current
    const stream = streamRef.current
    if (cameraActive && video && stream) {
      if (video.srcObject !== stream) {
        video.srcObject = stream
        video.setAttribute('playsinline', 'true')
        video.play().catch(playErr => {
          if (playErr.name !== 'AbortError') {
            console.warn('Backup video play exception caught:', playErr)
          }
        })
      } else if (video.paused) {
        video.play().catch(playErr => {
          if (playErr.name !== 'AbortError') {
            console.warn('Backup video play exception caught:', playErr)
          }
        })
      }
    }
  }, [cameraActive])

  // Auto-start camera when switching to camera mode, and stop when switching away or on unmount
  useEffect(() => {
    if (mode === 'camera') {
      startCamera()
    } else {
      stopCamera()
    }
    return () => {
      stopCamera()
    }
  }, [mode, startCamera, stopCamera])

  // ── File Scanning Handler ──────────────────────────────────────────────────

  const decodeFile = (file: File) => {
    setFileError(null)
    setDecodedResult(null)

    const reader = new FileReader()
    reader.onload = e => {
      const dataUrl = e.target?.result as string
      setFilePreview(dataUrl)

      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          setFileError('Could not instantiate internal 2D drawing context.')
          return
        }

        // Limit maximum size to prevent high-res images from taking too much memory
        let width = img.width
        let height = img.height
        const maxDimension = 1600
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width)
            width = maxDimension
          } else {
            width = Math.round((width * maxDimension) / height)
            height = maxDimension
          }
        }

        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)

        try {
          const imageData = ctx.getImageData(0, 0, width, height)
          const code = jsQR(imageData.data, imageData.width, imageData.height)

          if (code && code.data) {
            playBeep()
            setDecodedResult(parseResult(code.data))
          } else {
            setFileError(
              'No QR code could be detected in this image. Please check that the image is clear and is not blurry.'
            )
          }
        } catch (err) {
          console.error(err)
          setFileError('Failed to parse image pixels.')
        }
      }
      img.onerror = () => {
        setFileError('Failed to load selected image file.')
      }
      img.src = dataUrl
    }
    reader.readAsDataURL(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      decodeFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type.startsWith('image/')) {
        setSelectedFile(file)
        decodeFile(file)
      } else {
        setFileError('Please drop a valid image file.')
      }
    }
  }

  const clearFile = () => {
    setSelectedFile(null)
    setFilePreview(null)
    setFileError(null)
    setDecodedResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Resume camera scanning helper
  const handleResumeCameraScan = () => {
    setDecodedResult(null)
    setIsScanning(true)
  }

  // ── Result Action Helpers ──────────────────────────────────────────────────

  const renderParsedDetails = () => {
    if (!decodedResult) return null

    switch (decodedResult.type) {
      case 'wifi': {
        const wifi = decodedResult.parsedWifi!
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-accent font-medium text-sm">
              <Wifi size={16} />
              <span>Wi-Fi Connection Details</span>
            </div>
            <div className="border border-border/80 rounded-lg overflow-hidden bg-surface/30 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-border/40 px-3 py-2 gap-1 sm:gap-0">
                <span className="text-subtle font-mono uppercase tracking-wider">Network SSID</span>
                <span className="sm:col-span-2 text-bright font-mono break-all">{wifi.ssid}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-border/40 px-3 py-2 gap-1 sm:gap-0">
                <span className="text-subtle font-mono uppercase tracking-wider">Security</span>
                <span className="sm:col-span-2 text-bright font-mono uppercase">{wifi.encryption}</span>
              </div>
              {wifi.password && (
                <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-border/40 px-3 py-2 items-start sm:items-center gap-1 sm:gap-0">
                  <span className="text-subtle font-mono uppercase tracking-wider">Password</span>
                  <div className="sm:col-span-2 flex items-center justify-between gap-2">
                    <span className="text-bright font-mono select-all break-all">{wifi.password}</span>
                    <CopyButton text={wifi.password} />
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-3 px-3 py-2 gap-1 sm:gap-0">
                <span className="text-subtle font-mono uppercase tracking-wider">Hidden SSID</span>
                <span className="sm:col-span-2 text-dim font-sans">{wifi.hidden ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>
        )
      }

      case 'contact': {
        const contact = decodedResult.parsedContact!
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-accent font-medium text-sm">
              <User size={16} />
              <span>Contact (vCard) Information</span>
            </div>
            <div className="border border-border/80 rounded-lg overflow-hidden bg-surface/30 text-xs space-y-px">
              {contact.name && (
                <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-border/40 px-3 py-2 gap-1 sm:gap-0">
                  <span className="text-subtle font-mono uppercase tracking-wider">Full Name</span>
                  <span className="sm:col-span-2 text-bright font-sans font-medium">{contact.name}</span>
                </div>
              )}
              {contact.org && (
                <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-border/40 px-3 py-2 gap-1 sm:gap-0">
                  <span className="text-subtle font-mono uppercase tracking-wider">Organization</span>
                  <span className="sm:col-span-2 text-dim font-sans">{contact.org}</span>
                </div>
              )}
              {contact.title && (
                <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-border/40 px-3 py-2 gap-1 sm:gap-0">
                  <span className="text-subtle font-mono uppercase tracking-wider">Job Title</span>
                  <span className="sm:col-span-2 text-dim font-sans">{contact.title}</span>
                </div>
              )}
              {contact.phone && (
                <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-border/40 px-3 py-2 items-start sm:items-center gap-1 sm:gap-0">
                  <span className="text-subtle font-mono uppercase tracking-wider">Phone</span>
                  <div className="sm:col-span-2 flex items-center justify-between gap-1.5">
                    <a href={`tel:${contact.phone}`} className="text-accent hover:underline font-mono select-all">
                      {contact.phone}
                    </a>
                    <CopyButton text={contact.phone} />
                  </div>
                </div>
              )}
              {contact.email && (
                <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-border/40 px-3 py-2 items-start sm:items-center gap-1 sm:gap-0">
                  <span className="text-subtle font-mono uppercase tracking-wider">Email</span>
                  <div className="sm:col-span-2 flex items-center justify-between gap-1.5">
                    <a href={`mailto:${contact.email}`} className="text-accent hover:underline font-mono select-all">
                      {contact.email}
                    </a>
                    <CopyButton text={contact.email} />
                  </div>
                </div>
              )}
              {contact.url && (
                <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-border/40 px-3 py-2 items-start sm:items-center gap-1 sm:gap-0">
                  <span className="text-subtle font-mono uppercase tracking-wider">Website</span>
                  <div className="sm:col-span-2 flex items-center justify-between gap-1.5">
                    <a
                      href={contact.url}
                      target="_blank"
                      referrerPolicy="no-referrer"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline font-mono select-all break-all"
                    >
                      {contact.url}
                    </a>
                    <CopyButton text={contact.url} />
                  </div>
                </div>
              )}
              {contact.address && (
                <div className="grid grid-cols-1 sm:grid-cols-3 px-3 py-2 gap-1 sm:gap-0">
                  <span className="text-subtle font-mono uppercase tracking-wider">Address</span>
                  <span className="sm:col-span-2 text-dim font-sans">{contact.address}</span>
                </div>
              )}
            </div>
          </div>
        )
      }

      case 'email': {
        const email = decodedResult.parsedEmail!
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-accent font-medium text-sm">
              <Mail size={16} />
              <span>Email Message</span>
            </div>
            <div className="border border-border/80 rounded-lg overflow-hidden bg-surface/30 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-border/40 px-3 py-2 gap-1 sm:gap-0">
                <span className="text-subtle font-mono uppercase tracking-wider">To</span>
                <span className="sm:col-span-2 text-bright font-mono break-all">{email.to}</span>
              </div>
              {email.subject && (
                <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-border/40 px-3 py-2 gap-1 sm:gap-0">
                  <span className="text-subtle font-mono uppercase tracking-wider">Subject</span>
                  <span className="sm:col-span-2 text-bright font-sans">{email.subject}</span>
                </div>
              )}
              {email.body && (
                <div className="grid grid-cols-1 sm:grid-cols-3 px-3 py-2 gap-1 sm:gap-0">
                  <span className="text-subtle font-mono uppercase tracking-wider">Body</span>
                  <span className="sm:col-span-2 text-dim font-sans whitespace-pre-wrap">{email.body}</span>
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <a
                href={decodedResult.rawText}
                className="inline-flex items-center gap-1.5 btn-primary text-xs font-mono"
              >
                <Mail size={14} />
                <span>Compose Email</span>
              </a>
            </div>
          </div>
        )
      }

      case 'sms': {
        const sms = decodedResult.parsedSms!
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-accent font-medium text-sm">
              <MessageSquare size={16} />
              <span>SMS Direct Action</span>
            </div>
            <div className="border border-border/80 rounded-lg overflow-hidden bg-surface/30 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-border/40 px-3 py-2 gap-1 sm:gap-0">
                <span className="text-subtle font-mono uppercase tracking-wider">Phone</span>
                <span className="sm:col-span-2 text-bright font-mono">{sms.phone}</span>
              </div>
              {sms.message && (
                <div className="grid grid-cols-1 sm:grid-cols-3 px-3 py-2 gap-1 sm:gap-0">
                  <span className="text-subtle font-mono uppercase tracking-wider">Message</span>
                  <span className="sm:col-span-2 text-dim font-sans whitespace-pre-wrap">{sms.message}</span>
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <a href={`sms:${sms.phone}`} className="inline-flex items-center gap-1.5 btn-primary text-xs font-mono">
                <MessageSquare size={14} />
                <span>Send SMS</span>
              </a>
            </div>
          </div>
        )
      }

      case 'geo': {
        const geo = decodedResult.parsedGeo!
        const mapUrl = `https://www.google.com/maps/search/?api=1&query=${geo.lat},${geo.lng}`
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-accent font-medium text-sm">
              <MapPin size={16} />
              <span>Geolocation Coordinates</span>
            </div>
            <div className="border border-border/80 rounded-lg overflow-hidden bg-surface/30 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-border/40 px-3 py-2 gap-1 sm:gap-0">
                <span className="text-subtle font-mono uppercase tracking-wider">Latitude</span>
                <span className="sm:col-span-2 text-bright font-mono">{geo.lat}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 px-3 py-2 gap-1 sm:gap-0">
                <span className="text-subtle font-mono uppercase tracking-wider">Longitude</span>
                <span className="sm:col-span-2 text-bright font-mono">{geo.lng}</span>
              </div>
            </div>
            <div className="flex justify-end">
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                referrerPolicy="no-referrer"
                className="inline-flex items-center gap-1.5 btn-primary text-xs font-mono"
              >
                <MapPin size={14} />
                <span>Open in Google Maps</span>
              </a>
            </div>
          </div>
        )
      }

      case 'phone': {
        return (
          <div className="flex justify-end">
            <a href={decodedResult.rawText} className="inline-flex items-center gap-1.5 btn-primary text-xs font-mono">
              <Phone size={14} />
              <span>Call Phone Number</span>
            </a>
          </div>
        )
      }

      case 'url': {
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 p-3 rounded-lg text-xs">
              <AlertTriangle size={15} className="shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block mb-0.5">Safety Check Reminder</span>
                <span>Before navigating, double-check that the URL looks genuine and secure.</span>
              </div>
            </div>
            <div className="flex justify-end">
              <a
                href={decodedResult.rawText}
                target="_blank"
                rel="noopener noreferrer"
                referrerPolicy="no-referrer"
                className="inline-flex items-center gap-1.5 btn-primary text-xs font-mono"
              >
                <span>Navigate to Link</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        )
      }

      default:
        return null
    }
  }

  // Helper for generating route URL back to generator
  const getGeneratorLink = () => {
    if (!decodedResult) return '/qr-code-generator'
    return `/qr-code-generator?text=${encodeURIComponent(decodedResult.rawText)}`
  }

  return (
    <div className="space-y-6">
      {/* Mode Selectors */}
      <div className="flex border-b border-border">
        <button
          onClick={() => {
            setMode('file')
            setDecodedResult(null)
          }}
          className={`px-4 py-3 text-xs font-mono border-b-2 flex items-center gap-2 transition-all duration-200
            ${
              mode === 'file'
                ? 'border-accent text-accent bg-accent/5'
                : 'border-transparent text-subtle hover:text-dim hover:bg-surface/30'
            }`}
        >
          <Upload size={14} />
          <span>Image File Upload</span>
        </button>
        <button
          onClick={() => {
            setMode('camera')
            setDecodedResult(null)
            loadDevices()
          }}
          className={`px-4 py-3 text-xs font-mono border-b-2 flex items-center gap-2 transition-all duration-200
            ${
              mode === 'camera'
                ? 'border-accent text-accent bg-accent/5'
                : 'border-transparent text-subtle hover:text-dim hover:bg-surface/30'
            }`}
        >
          <Camera size={14} />
          <span>Live Camera Scan</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Workspaces */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {mode === 'file' ? (
            <SectionPanel label="Input Image File">
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 min-h-[300px]
                  ${
                    selectedFile
                      ? 'border-accent/40 bg-accent/5 hover:bg-accent/10'
                      : 'border-border hover:border-muted hover:bg-surface/30'
                  }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                {filePreview ? (
                  <div className="space-y-4 max-w-full" onClick={e => e.stopPropagation()}>
                    <div className="relative mx-auto max-h-[180px] rounded-md overflow-hidden border border-border bg-black/25 flex items-center justify-center p-2">
                      <img
                        src={filePreview}
                        alt="Preview of uploaded QR"
                        className="max-h-[160px] max-w-full object-contain"
                      />
                      <button
                        onClick={clearFile}
                        className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-red-500 text-white rounded-full p-1 transition-all"
                        title="Remove image"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-bright font-mono font-medium max-w-[260px] truncate mx-auto">
                        {selectedFile?.name}
                      </p>
                      <p className="text-[10px] text-muted font-mono uppercase mt-0.5">
                        {(selectedFile!.size / 1024).toFixed(1)} KB · Click to swap image
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-3 bg-surface border border-border rounded-lg">
                      <ImageIcon className="text-muted w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-bright font-sans">
                        Drag and drop your QR Code image here
                      </p>
                      <p className="text-xs text-subtle font-sans mt-1">
                        or <span className="text-accent underline font-medium">browse local files</span>
                      </p>
                    </div>
                    <p className="text-[10px] text-muted font-mono mt-4">
                      Supports PNG, JPEG, SVG, WEBP, GIF
                    </p>
                  </div>
                )}
              </div>

              {fileError && (
                <div className="mt-3 flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs">
                  <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                  <span>{fileError}</span>
                </div>
              )}
            </SectionPanel>
          ) : (
            <SectionPanel
              label="Live Webcam Viewer"
              extra={
                cameraActive &&
                devices.length > 1 && (
                  <select
                    value={selectedDeviceId}
                    onChange={e => {
                      setSelectedDeviceId(e.target.value)
                    }}
                    className="select-base py-0.5 px-2 text-xs font-mono max-w-[150px] sm:max-w-[200px]"
                  >
                    {devices.map(device => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Camera ${devices.indexOf(device) + 1}`}
                      </option>
                    ))}
                  </select>
                )
              }
            >
              <div className="relative rounded-lg overflow-hidden border border-border bg-black/60 w-full aspect-square sm:aspect-video flex flex-col items-center justify-center min-h-[260px] sm:min-h-[360px]">
                <video
                  ref={videoRef}
                  className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
                  playsInline
                  autoPlay
                  muted
                />
                <canvas ref={canvasRef} className="hidden" />

                {cameraActive ? (
                  <>
                    {/* Animated Scanning Guides */}
                    {isScanning && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        {/* Shimmer/Pulse scan box */}
                        <div className="w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] border-2 border-accent/70 rounded-xl relative shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)] animate-pulse-slow">
                          {/* Top left corner */}
                          <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-accent" />
                          {/* Top right corner */}
                          <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-accent" />
                          {/* Bottom left corner */}
                          <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-accent" />
                          {/* Bottom right corner */}
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-accent" />
                          {/* Scanning light animation bar */}
                          <div className="absolute left-1 right-1 h-0.5 bg-accent/90 shadow-[0_0_10px_#5d5fef] top-0 animate-scanning-line" />
                        </div>
                        <div className="absolute bottom-4 left-0 right-0 text-center">
                          <span className="bg-black/80 text-accent font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-accent/20">
                            Align QR Code inside box
                          </span>
                        </div>
                      </div>
                    )}

                    {!isScanning && (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3">
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400">
                          <CheckCircle2 size={32} />
                        </div>
                        <div className="text-center px-4">
                          <p className="text-sm font-semibold text-bright">QR Code Decoded Successfully!</p>
                          <button
                            onClick={handleResumeCameraScan}
                            className="mt-3 btn-ghost inline-flex items-center gap-1.5 text-xs font-mono"
                          >
                            <RefreshCw size={12} />
                            <span>Scan Again</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-4 text-center px-6 py-8">
                    <div className="p-3.5 bg-surface border border-border rounded-xl">
                      <VideoOff className="text-muted w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-bright font-sans">Webcam scan is inactive</p>
                      <p className="text-xs text-subtle font-sans max-w-sm mt-1">
                        Webcam processing is executed strictly local to your browser. Click below to activate your
                        device camera.
                      </p>
                    </div>
                    <button
                      onClick={startCamera}
                      className="inline-flex items-center gap-1.5 btn-primary font-mono text-xs px-4 py-2 mt-2"
                    >
                      <Video size={14} />
                      <span>Start Camera Scanner</span>
                    </button>
                  </div>
                )}
              </div>

              {cameraError && (
                <div className="mt-3 flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs">
                  <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                  <span>{cameraError}</span>
                </div>
              )}

              {cameraActive && (
                <div className="flex justify-between items-center mt-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted font-mono">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span>Camera is running local-only</span>
                  </div>
                  <button
                    onClick={stopCamera}
                    className="text-xs text-red-400 hover:text-red-300 hover:underline font-mono"
                  >
                    Stop Feed
                  </button>
                </div>
              )}
            </SectionPanel>
          )}
        </div>

        {/* Output & Classification Workspace */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <SectionPanel
            label="Decoded Results"
            copyText={decodedResult?.rawText || ''}
            dot={decodedResult ? 'bg-emerald-400' : 'bg-muted'}
          >
            {decodedResult ? (
              <div className="space-y-5 animate-fade-in py-1">
                {/* Classification Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-muted uppercase tracking-wider">Detected Format</span>
                  <span className="inline-flex items-center gap-1 bg-accent/10 border border-accent/20 text-accent text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded">
                    <Sparkles size={11} />
                    <span>{decodedResult.type}</span>
                  </span>
                </div>

                {/* Raw Decoded Output */}
                <div>
                  <label className="block text-[10px] font-mono text-subtle uppercase tracking-wider mb-1.5">
                    Raw Decoded Text
                  </label>
                  <pre className="p-3 rounded-lg bg-surface/40 border border-border text-xs font-mono select-all text-bright whitespace-pre-wrap break-all max-h-[160px] overflow-y-auto">
                    {decodedResult.rawText}
                  </pre>
                </div>

                {/* Structured Fields / Action Buttons */}
                {renderParsedDetails()}

                {/* Universal Actions */}
                <div className="border-t border-border/40 pt-4 mt-2 flex flex-col sm:flex-row gap-2">
                  <Link
                    to={getGeneratorLink()}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 btn-ghost font-mono text-xs py-2"
                  >
                    <QrCode size={13} />
                    <span>Send to Generator</span>
                  </Link>
                  {mode === 'camera' && !isScanning && (
                    <button
                      onClick={handleResumeCameraScan}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 btn-secondary font-mono text-xs py-2"
                    >
                      <RefreshCw size={13} />
                      <span>Resume Scanning</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-8 min-h-[300px]">
                <div className="w-12 h-12 rounded-full border border-border bg-surface flex items-center justify-center text-muted mb-4">
                  <QrCode className="opacity-40" />
                </div>
                <h3 className="text-xs font-semibold text-bright font-sans">Awaiting Scan Target</h3>
                <p className="text-xs text-subtle font-sans max-w-[240px] mt-1.5">
                  Scan a QR code from your camera or select/drag an image file to extract and inspect the contents.
                </p>
              </div>
            )}
          </SectionPanel>
        </div>
      </div>
    </div>
  )
}
