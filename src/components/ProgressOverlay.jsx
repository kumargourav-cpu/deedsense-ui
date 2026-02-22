// src/components/ProgressOverlay.jsx
import React from "react";

export default function ProgressOverlay({ open, title, steps = [], activeIndex = 0, detail }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/70 px-4">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-2xl backdrop-blur">
        <div className="flex items-start gap-4">
          <div className="mt-1 h-10 w-10 shrink-0 rounded-2xl border border-white/10 bg-white/5 grid place-items-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-base font-extrabold text-white">
              {title || "Working…"}
            </div>
            {detail ? (
              <div className="mt-1 text-sm text-slate-300">
                {detail}
              </div>
            ) : null}

            <div className="mt-4 space-y-2">
              {steps.map((s, i) => {
                const done = i < activeIndex;
                const active = i === activeIndex;
                return (
                  <div
                    key={s}
                    className={[
                      "flex items-center gap-3 rounded-xl border px-3 py-2",
                      done ? "border-emerald-400/20 bg-emerald-400/5" : active ? "border-white/15 bg-white/5" : "border-white/10 bg-white/0",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "h-2.5 w-2.5 rounded-full",
                        done ? "bg-emerald-400" : active ? "bg-white" : "bg-white/20",
                      ].join(" ")}
                    />
                    <div className={done ? "text-sm text-emerald-200" : active ? "text-sm text-white" : "text-sm text-slate-300"}>
                      {s}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 text-xs text-slate-400">
              Please don’t refresh while processing. If it takes too long, the UI will time out and show an error.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
