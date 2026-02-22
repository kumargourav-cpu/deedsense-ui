import React from "react";
import { LANGS } from "../lib/i18n.js";

export default function LanguagePrompt({ lang, setLang }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-extrabold">Language</div>
          <div className="text-xs text-slate-300 mt-1">
            Choose output language. “Auto-detect” will try to match the document language.
          </div>
        </div>
        <select className="input max-w-[220px]" value={lang} onChange={(e) => setLang(e.target.value)}>
          {LANGS.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
