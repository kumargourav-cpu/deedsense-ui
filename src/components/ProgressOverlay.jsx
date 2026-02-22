import React from "react";

export default function ProgressOverlay({ open, stepIndex = 0, steps = [] }) {
  if (!open) return null;

  const pct = steps.length ? Math.round(((stepIndex + 1) / steps.length) * 100) : 35;

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/60 px-4">
      <div className="glass w-full max-w-xl rounded-3xl p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-base font-extrabold">Processing…</div>
            <div className="mt-1 text-sm text-slate-300">
              We’re extracting text and generating a structured risk report.
            </div>
          </div>
          <div className="pill">Secure scan</div>
        </div>

        <div className="mt-5">
          <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-white/30 transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-300/80">
            <span>{pct}%</span>
            <span className="animate-pulse">Working…</span>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {steps.map((s, i) => (
            <div
              key={s}
              className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm ${
                i === stepIndex
                  ? "border-white/15 bg-white/10"
                  : i < stepIndex
                  ? "border-white/10 bg-white/5 text-slate-200"
                  : "border-white/10 bg-transparent text-slate-400"
              }`}
            >
              <span>{s}</span>
              <span className="text-xs">
                {i < stepIndex ? "Done" : i === stepIndex ? "Now" : "Next"}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 text-xs text-slate-400">
          Tip: If your PDF is scanned, OCR may take longer depending on pages and clarity.
        </div>
      </div>
    </div>
  );
}
