import React from "react";

export default function LanguagePrompt({ detected, onAccept, onDecline }) {
  if (!detected) return null;

  return (
    <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
      <div className="text-sm text-white">
        Detected language: <span className="font-semibold">{detected.name}</span>
      </div>
      <div className="mt-1 text-xs text-slate-400">
        Should DeedSense show summaries in your preferred language?
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => onAccept(detected)}
          className="rounded-xl bg-emerald-500/15 px-3 py-2 text-sm text-emerald-100 ring-1 ring-emerald-300/25 hover:bg-emerald-500/20"
        >
          Yes, reply in {detected.name}
        </button>
        <button
          onClick={onDecline}
          className="rounded-xl bg-white/6 px-3 py-2 text-sm text-slate-200 ring-1 ring-white/10 hover:bg-white/10"
        >
          No, keep English
        </button>
      </div>
    </div>
  );
}
