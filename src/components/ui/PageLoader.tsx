// PageLoader.tsx
export default function PageLoader() {
  // Diagonal pair: [0,3] are bright, [1,2] are dim — matches your SVG exactly
  const delays = [0, 0.3, 0.6, 0.3] // corners pulse in diagonal pairs

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-8 bg-[#0a0a0a]">

      {/* Grid logo — animated */}
      <div className="grid grid-cols-2 gap-[5px] p-[10px] rounded-xl bg-white/[0.03] border border-white/[0.06]"
           style={{ width: 72, height: 72 }}>
        {[0, 1, 2, 3].map(i => {
          const isBright = i === 0 || i === 3   // top-left, bottom-right
          return (
            <div
              key={i}
              className="rounded-[3px]"
              style={{
                background: isBright ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
                animation: 'gridPulse 1.6s ease-in-out infinite',
                animationDelay: `${delays[i]}s`,
              }}
            />
          )
        })}
      </div>

      {/* Label */}
      <span
        className="text-[10px] uppercase tracking-[0.35em] text-white/25"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          animation: 'fadeShift 1.6s ease-in-out infinite',
        }}
      >
        Loading
      </span>

      <style>{`
        @keyframes gridPulse {
          0%, 100% { opacity: 0.15; transform: scale(0.92); }
          50%       { opacity: 1;    transform: scale(1);    }
        }
        @keyframes fadeShift {
          0%, 100% { opacity: 0.2; }
          50%       { opacity: 0.6; }
        }
      `}</style>
    </div>
  )
}