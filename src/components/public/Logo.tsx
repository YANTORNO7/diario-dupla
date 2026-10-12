import Link from "next/link"

export default function Logo({ size = "default" }: { size?: "small" | "default" | "large" }) {
  const sizes = {
    small: { text: "text-3xl", stripe: 5, px: "px-3", py: "py-0.5", gap: 2 },
    default: { text: "text-5xl", stripe: 7, px: "px-5", py: "py-1", gap: 3 },
    large: { text: "text-7xl", stripe: 10, px: "px-6", py: "py-1.5", gap: 4 },
  }
  const s = sizes[size]

  return (
    <Link href="/" className="inline-block group">
      <div className="inline-block" style={{ transform: "skewX(-6deg)" }}>
        <div className={`bg-negro ${s.px} ${s.py}`}>
          <span
            className={`font-titular ${s.text} text-white tracking-tight block`}
            style={{ transform: "skewX(6deg)" }}
          >
            DUPLA
          </span>
        </div>
        <div className="flex" style={{ gap: s.gap, marginTop: s.gap }}>
          <div className="flex flex-1" style={{ gap: 1 }}>
            <div className="flex-1 bg-celeste" style={{ height: s.stripe }} />
            <div className="flex-[0.5] bg-white" style={{ height: s.stripe }} />
            <div className="flex-1 bg-celeste" style={{ height: s.stripe }} />
          </div>
          <div className="flex flex-1" style={{ gap: 1 }}>
            <div className="flex-1 bg-verde" style={{ height: s.stripe }} />
            <div className="flex-[0.5] bg-amarelo" style={{ height: s.stripe }} />
            <div className="flex-1 bg-verde" style={{ height: s.stripe }} />
          </div>
        </div>
      </div>
    </Link>
  )
}
