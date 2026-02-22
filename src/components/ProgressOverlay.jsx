import React from "react";

export const PROGRESS_STEPS = ["Uploading", "Extracting", "Analyzing", "Scoring", "Rendering"];

export default function ProgressOverlay({ open, activeIndex = 0, detail }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-[#03040a]/80 p-4 backdrop-blur-sm">
      <div className="glass-card w-full max-w-xl p-6">
        <div className="shimmer mb-4 h-1.5 w-full rounded-full" />
        <h3 className="text-xl font-bold text-white">Building premium report</h3>
        <p className="mt-1 text-sm text-slate-300">{detail}</p>
        <div className="mt-4 space-y-2">
          {PROGRESS_STEPS.map((step, idx) => (
            <div key={step} className={`rounded-xl border px-3 py-2 text-sm ${idx <= activeIndex ? "border-cyan-300/40 bg-cyan-500/10 text-cyan-100" : "border-white/10 text-slate-400"}`}>
              {step}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
