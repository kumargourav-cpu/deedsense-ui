import React from "react";

export default function ProgressOverlay({ open, stepIndex = 0, steps = [] }) {
  if (!open) return null;
  const pct = steps.length ? Math.round(((stepIndex + 1) / steps.length) * 100) : 10;

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm grid place-items-center px-4">
      <div className="glass w-full max-w-xl rounded-3xl p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-base font-extrabold">Processing your scan</div>
            <div className="mt-1 text-sm text-slate-300">
              DeedSense is extracting, interpreting, and building an investor-grade report.
            </div>
          </div>
          <div className="pill">{pct}%</div>
        </div>

        <div className="mt-5">
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-2 bg-white rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="mt-4 space-y-2">
            {steps.map((s, idx) => {
              const active = idx === stepIndex;
              const done = idx < stepIndex;
              return (
                <div key={idx} className={`flex items-center gap-3 rounded-2xl px-4 py-3 border border-white/10 ${active ? "bg-white/10" : "bg-white/5"}`}>
                  <div className={`h-2.5 w-2.5 rounded-full ${done ? "bg-emerald-300" : active ? "bg-white shimmer" : "bg-white/20"}`} />
                  <div className="text-sm">
                    <span className="font-semibold">{s.title}</span>
                    <div className="text-xs text-slate-400 mt-0.5">{s.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 text-xs text-slate-400">
            Tip: scanned PDFs work best when the text is sharp (300 DPI), straight, and high contrast.
          </div>
        </div>
      </div>
    </div>
  );
}
