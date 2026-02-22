import React from "react";
import { LANGUAGES, PLAN_OPTIONS } from "../lib/i18n";

export default function TopNav({ plan, setPlan, language, setLanguage }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#070A12]/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <div>
          <h1 className="text-xl font-black text-white">DeedSense</h1>
          <p className="text-xs text-slate-400">Smart-style risk intelligence</p>
        </div>

        <div className="glass-card flex items-center gap-2 p-1">
          {PLAN_OPTIONS.map((p) => (
            <button key={p} onClick={() => setPlan(p)} className={`rounded-xl px-4 py-2 text-sm font-semibold capitalize transition ${plan === p ? "bg-cyan-400/20 text-cyan-100" : "text-slate-300 hover:bg-white/10"}`}>
              {p}
            </button>
          ))}
        </div>

        <select className="input w-auto min-w-36" value={language} onChange={(e) => setLanguage(e.target.value)}>
          {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
        </select>
      </div>
    </header>
  );
}
