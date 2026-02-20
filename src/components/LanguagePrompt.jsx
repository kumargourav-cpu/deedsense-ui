// src/components/LanguagePrompt.jsx
import React from "react";
import { LANGUAGE_CHOICES } from "../lib/lang";

export default function LanguagePrompt({ open, detected, value, onChange, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/60 px-4">
      <div className="glass w-full max-w-lg rounded-3xl p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-base font-extrabold">Language detected</div>
            <div className="mt-1 text-sm text-slate-300">
              We detected <b>{detected?.name || "a language"}</b>. Should DeedSense respond in that language?
            </div>
          </div>
          <button className="btn-ghost" onClick={onClose}>Close</button>
        </div>

        <div className="mt-4">
          <div className="label mb-2">Preferred reply language</div>
          <select
            className="input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          >
            {LANGUAGE_CHOICES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.name}
              </option>
            ))}
          </select>
          <div className="mt-2 text-xs text-slate-400">
            You can change this anytime. We’ll use this preference for future scans in this browser.
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button className="btn-ghost" onClick={() => onChange("en")}>
            Use English
          </button>
          <button className="btn-primary" onClick={onClose}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
