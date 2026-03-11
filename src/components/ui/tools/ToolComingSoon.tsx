import { useState, useEffect } from "react"
import { Link } from "react-router-dom"

interface ToolComingSoonProps {
  toolName?: string
  description?: string
  eta?: string
  features?: string[]
}

const GridMark = ({ size = 16, brightOp = 0.9, dimOp = 0.22 }: {
  size?: number; brightOp?: number; dimOp?: number
}) => (
  <div style={{
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: size * 0.15, width: size, height: size, flexShrink: 0,
  }}>
    {[brightOp, dimOp, dimOp, brightOp].map((op, i) => (
      <div key={i} style={{
        borderRadius: size * 0.13,
        background: `rgba(255,255,255,${op})`,
      }} />
    ))}
  </div>
)

export default function ToolComingSoon({
  toolName  = "Diff Viewer",
  description = "Side-by-side text and JSON diffing with syntax highlighting and change summaries.",
  eta       = "Q2 2025",
  features  = ["Line-by-line diff", "JSON aware", "Copy changes", "Side-by-side view"],
}: ToolComingSoonProps) {
  const [notified, setNotified] = useState(false)
  const [email,    setEmail]    = useState("")
  const [mounted,  setMounted]  = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <>
      {/*
        ── Full-bleed overlay ─────────────────────────────────────
        position:fixed + inset:0 escapes ANY parent container/padding.
        paddingTop:56px clears the sticky navbar (h-14 = 56px).
        zIndex:10 sits above layout content but below modals.
      */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 10,
        // paddingTop: 56,                  // navbar height
        background: "#0a0a0a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "auto",
        padding: "56px 24px 40px",
      }}>

        {/* Dot-grid bg */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }} />

        {/* Vignette edges */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 40%, rgba(0,0,0,0.7) 100%)",
        }} />

        {/* Top-right glow */}
        <div style={{
          position: "absolute", top: 0, right: 0, pointerEvents: "none",
          width: 500, height: 400,
          background: "radial-gradient(ellipse at top right, rgba(255,255,255,0.05) 0%, transparent 60%)",
        }} />

        {/* ── Content ── */}
        <div style={{
          position: "relative", zIndex: 1,
          width: "100%", maxWidth: 880,
          display: "grid",
          gridTemplateColumns: "1fr 160px",
          gap: "0 72px",
          alignItems: "center",
        }}>

          {/* LEFT */}
          <div>

            {/* Breadcrumb */}
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:40 }}>
              <GridMark size={13} />
              <span style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase",
                color: "rgba(255,255,255,0.22)",
              }}>Toolbox4Devs / Tools</span>
            </div>

            {/* Status badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 999, padding: "5px 14px", marginBottom: 24,
              background: "rgba(255,255,255,0.03)",
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "rgba(255,255,255,0.45)",
                animation: mounted ? "cs-blink 2s ease-in-out infinite" : "none",
              }} />
              <span style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase",
                color: "rgba(255,255,255,0.38)",
              }}>In development · {eta}</span>
            </div>

            {/* Tool name */}
            <h1 style={{
              fontFamily: "'Bebas Neue', Impact, sans-serif",
              fontSize: "clamp(56px, 9vw, 88px)",
              letterSpacing: "0.04em", lineHeight: 1,
              color: "#fff", margin: "0 0 14px",
              animation: mounted ? "cs-fadein 0.5s ease both" : "none",
            }}>
              {toolName}
            </h1>

            {/* Description */}
            <p style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: 15, lineHeight: 1.75,
              color: "rgba(255,255,255,0.35)",
              margin: "0 0 32px", maxWidth: 440,
            }}>
              {description}
            </p>

            {/* Divider */}
            <div style={{
              height: 1, background: "rgba(255,255,255,0.07)",
              marginBottom: 28,
            }} />

            {/* Feature chips */}
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:40 }}>
              {features.map((f, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 7,
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 6, padding: "6px 12px",
                  background: "rgba(255,255,255,0.025)",
                  animation: mounted ? "cs-fadein 0.4s ease both" : "none",
                  animationDelay: `${0.06 * i + 0.15}s`,
                  opacity: 0,
                }}>
                  <div style={{
                    width: 3, height: 3, borderRadius: "50%",
                    background: "rgba(255,255,255,0.3)",
                  }} />
                  <span style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: 11, color: "rgba(255,255,255,0.4)",
                    letterSpacing: "0.02em",
                  }}>{f}</span>
                </div>
              ))}
            </div>

            {/* Notify form */}
            {!notified ? (
              <div style={{ display:"flex", gap:8, maxWidth:420 }}>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && email && setNotified(true)}
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8, padding: "11px 16px",
                    color: "rgba(255,255,255,0.75)",
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: 13, outline: "none",
                  }}
                />
                <button
                  onClick={() => email && setNotified(true)}
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.13)",
                    borderRadius: 8, padding: "11px 22px",
                    color: "rgba(255,255,255,0.65)",
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: 11, letterSpacing: "0.2em",
                    textTransform: "uppercase", cursor: "pointer",
                    whiteSpace: "nowrap", transition: "all 0.15s",
                  }}
                >Notify me</button>
              </div>
            ) : (
              <div style={{
                display: "flex", alignItems: "center", gap: 12,
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8, padding: "12px 18px",
                background: "rgba(255,255,255,0.04)", maxWidth: 420,
              }}>
                <GridMark size={13} />
                <span style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: 12, color: "rgba(255,255,255,0.4)",
                }}>We'll let you know when {toolName} is ready.</span>
              </div>
            )}

            {/* Back link */}
            <div style={{ marginTop: 32 }}>
              <Link to="/tools" style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 11, letterSpacing: "0.1em",
                color: "rgba(255,255,255,0.2)",
                textDecoration: "none",
                display: "inline-flex", alignItems: "center", gap: 6,
                transition: "color 0.15s",
              }}>← back to tools</Link>
            </div>
          </div>

          {/* RIGHT — large pulsing grid mark */}
          <div style={{ position:"relative", display:"flex", flexDirection:"column", alignItems:"center" }}>
            <div style={{
              position: "absolute", inset: -32, borderRadius: 32, pointerEvents: "none",
              background: "radial-gradient(ellipse at center, rgba(255,255,255,0.04) 0%, transparent 70%)",
            }} />

            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr",
              gap: 9, padding: 13,
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 18,
              background: "rgba(255,255,255,0.02)",
              width: 140, height: 140,
            }}>
              {[true, false, false, true].map((bright, i) => (
                <div key={i} style={{
                  borderRadius: 7,
                  background: bright ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.18)",
                  animation: mounted ? "cs-gridpulse 2.4s ease-in-out infinite" : "none",
                  animationDelay: bright ? "0s" : "1.2s",
                }} />
              ))}
            </div>

            <div style={{
              marginTop: 14,
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 9, letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.15)",
              textAlign: "center",
            }}>under construction</div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes cs-blink {
          0%,100% { opacity:0.3; } 50% { opacity:1; }
        }
        @keyframes cs-fadein {
          from { opacity:0; transform:translateY(8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes cs-gridpulse {
          0%,100% { opacity:0.2; }
          50%      { opacity:1; }
        }
      `}</style>
    </>
  )
}