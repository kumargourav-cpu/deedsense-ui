import React from "react";

export default function ProgressOverlay({ open, steps = [], activeIndex = 0, title = "Working..." }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-black/70 grid place-items-center px-4">
      <div className="glass w-full max-w-xl rounded-3xl p-6">
        <div className="text-base font-extrabold">{title}</div>
        <div className="mt-1 text-sm text-slate-300">
          Please don’t close the tab while we extract + analyze.
        </div>

        <div className="mt-5 space-y-3">
          {steps.map((s, idx) => {
            const done = idx < activeIndex;
            const active = idx === activeIndex;
            return (
              <div key={s} className="flex items-center gap-3">
                <div
                  className={`h-3 w-3 rounded-full ${
                    done ? "bg-white" : active ? "bg-white/60 animate-pulse" : "bg-white/20"
                  }`}
                />
                <div className={`text-sm ${done ? "text-slate-200" : active ? "text-white" : "text-slate-400"}`}>
                  {s}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 h-2 w-full rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-500"
            style={{ width: `${Math.min(100, ((activeIndex + 1) / Math.max(steps.length, 1)) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
