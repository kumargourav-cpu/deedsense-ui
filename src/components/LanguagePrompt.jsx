import React from "react";

export default function LanguagePrompt({ open, detectedLanguage, onClose, onAllow, onDeny }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/70 px-4">
      <div className="glass w-full max-w-lg rounded-3xl p-6">
        <div className="text-base font-extrabold">Language detected</div>
        <div className="mt-2 text-sm text-slate-300">
          We detected <span className="font-semibold">{detectedLanguage || "a language"}</span> in your text/document.
          Do you want the report in the same language?
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button className="btn-ghost" onClick={onClose}>Close</button>
          <button className="btn-ghost" onClick={onDeny}>No, keep English</button>
          <button className="btn-primary" onClick={() => onAllow(detectedLanguage || "English")}>
            Yes, reply in {detectedLanguage || "that language"}
          </button>
        </div>

        <div className="mt-3 text-xs text-slate-400">
          You can change this anytime later in your profile/settings (coming soon).
        </div>
      </div>
    </div>
  );
}
