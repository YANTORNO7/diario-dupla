export default function TennisBall({ size = 14 }: { size?: number }) {
  const shadowW = Math.round(size * 0.57)
  const shadowH = Math.max(2, Math.round(size * 0.21))
  return (
    <span
      className="inline-flex flex-col items-center"
      style={{ width: size, verticalAlign: "middle", flexShrink: 0 }}
    >
      <span className="tennis-bounce" style={{ display: "block", lineHeight: 0 }}>
        <svg width={size} height={size} viewBox="0 0 14 14" aria-hidden="true">
          <circle cx="7" cy="7" r="7" fill="#D8F23C" />
          {/* seams */}
          <path d="M3 2 Q0 7 3 12"  fill="none" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
          <path d="M11 2 Q14 7 11 12" fill="none" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      </span>
      <span
        className="tennis-shadow"
        style={{
          display: "block",
          width: shadowW,
          height: shadowH,
          background: "rgba(0,0,0,0.3)",
          borderRadius: "50%",
          marginTop: 1,
        }}
      />
    </span>
  )
}
