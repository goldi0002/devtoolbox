export default function ToolFallback() {
    return (
        <div className="h-64 flex flex-col items-center justify-center gap-4">
            <div className="flex items-center gap-[3px]">
                {[...Array(4)].map((_, i) => (
                    <span
                        key={i}
                        style={{
                            display: "inline-block",
                            width: 3,
                            borderRadius: 2,
                            background: "currentColor",
                            opacity: 0.2,
                            animation: "toolBar 1s ease-in-out infinite",
                            animationDelay: `${i * 0.15}s`,
                        }}
                    />
                ))}
            </div>
            <span
                style={{
                    fontFamily: "monospace",
                    fontSize: 10,
                    letterSpacing: "0.25em",
                    textTransform: "uppercase",
                    opacity: 0.35,
                }}
            >
                Loading tool
            </span>
        </div>
    )
}