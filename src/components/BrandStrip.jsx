import React from "react";

function FlagTile({ title, subtitle, children }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl border border-white/10 bg-black/30">
        {children}
      </div>
      <div className="leading-tight">
        <div className="text-xs font-semibold text-white">{title}</div>
        <div className="text-[11px] text-slate-400">{subtitle}</div>
      </div>
    </div>
  );
}

/** Lightweight decorative flags (not official), zero external assets */
function UAEFlag() {
  return (
    <svg viewBox="0 0 48 48" className="h-9 w-9" aria-hidden="true">
      <rect width="48" height="48" rx="10" fill="rgba(0,0,0,0.25)" />
      <rect x="10" y="14" width="28" height="6" rx="2" fill="#009A49" />
      <rect x="10" y="20" width="28" height="6" rx="2" fill="#FFFFFF" />
      <rect x="10" y="26" width="28" height="6" rx="2" fill="#000000" />
      <rect x="10" y="14" width="8" height="18" rx="2" fill="#FF0000" />
    </svg>
  );
}

function UKFlag() {
  return (
    <svg viewBox="0 0 48 48" className="h-9 w-9" aria-hidden="true">
      <rect width="48" height="48" rx="10" fill="#0A2A66" opacity="0.9" />
      {/* white diagonals */}
      <path d="M6 10 L10 6 L42 38 L38 42 Z" fill="#FFFFFF" opacity="0.9" />
      <path d="M38 6 L42 10 L10 42 L6 38 Z" fill="#FFFFFF" opacity="0.9" />
      {/* red diagonals */}
      <path d="M8 12 L12 8 L40 36 L36 40 Z" fill="#C8102E" opacity="0.95" />
      <path d="M36 8 L40 12 L12 40 L8 36 Z" fill="#C8102E" opacity="0.95" />
      {/* white cross */}
      <rect x="20" y="6" width="8" height="36" fill="#FFFFFF" />
      <rect x="6" y="20" width="36" height="8" fill="#FFFFFF" />
      {/* red cross */}
      <rect x="21.5" y="6" width="5" height="36" fill="#C8102E" />
      <rect x="6" y="21.5" width="36" height="5" fill="#C8102E" />
    </svg>
  );
}

function EUFlag() {
  return (
    <svg viewBox="0 0 48 48" className="h-9 w-9" aria-hidden="true">
      <rect width="48" height="48" rx="10" fill="#1E3A8A" opacity="0.95" />
      {/* ring of dots */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const cx = 24 + Math.cos(angle) * 10;
        const cy = 24 + Math.sin(angle) * 10;
        return <circle key={i} cx={cx} cy={cy} r="1.4" fill="#FBBF24" opacity="0.95" />;
      })}
    </svg>
  );
}

function USFlag() {
  return (
    <svg viewBox="0 0 48 48" className="h-9 w-9" aria-hidden="true">
      <rect width="48" height="48" rx="10" fill="rgba(0,0,0,0.25)" />
      {/* stripes */}
      {Array.from({ length: 7 }).map((_, i) => (
        <rect key={i} x="8" y={10 + i * 4} width="32" height="2.3" rx="1" fill="#E11D48" opacity="0.9" />
      ))}
      {/* blue canton */}
      <rect x="8" y="10" width="14" height="14" rx="2" fill="#1D4ED8" opacity="0.9" />
      {/* stars */}
      {Array.from({ length: 8 }).map((_, i) => {
        const x = 10 + (i % 4) * 3.1;
        const y = 12 + Math.floor(i / 4) * 3.4;
        return <circle key={i} cx={x} cy={y} r="0.7" fill="#FFFFFF" opacity="0.95" />;
      })}
    </svg>
  );
}

export default function BrandStrip({
  title = "Built for global investor contexts",
  subtitle = "Fast triage across key buyer regions with adaptable language + structured reporting.",
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-xs font-semibold text-white">{title}</div>
          <div className="mt-1 text-[11px] text-slate-400">{subtitle}</div>
        </div>
        <div className="text-[11px] text-slate-400">
          Decorative marks (not official flags).
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <FlagTile title="UAE investors" subtitle="Deal screening">
          <UAEFlag />
        </FlagTile>
        <FlagTile title="UK investors" subtitle="Due diligence prep">
          <UKFlag />
        </FlagTile>
        <FlagTile title="EU investors" subtitle="Cross-border clarity">
          <EUFlag />
        </FlagTile>
        <FlagTile title="US investors" subtitle="Risk summaries">
          <USFlag />
        </FlagTile>
      </div>
    </div>
  );
}
