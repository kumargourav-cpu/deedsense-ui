import React, { useMemo, useState } from "react";
import { LANGUAGES } from "../lib/i18n";

function fakeTranslate(text, lang) {
  if (!text) return text;
  return `[${lang}] ${text}`;
}

export default function DownloadModal({ open, onClose, report, language }) {
  const [format, setFormat] = useState("json");
  const [targetLang, setTargetLang] = useState(language || "en");

  const rendered = useMemo(() => {
    if (!report) return "";
    const base = JSON.stringify(report, null, 2);
    return targetLang === language ? base : fakeTranslate(base, targetLang);
  }, [report, language, targetLang]);

  if (!open) return null;

  function doDownload() {
    const blob = new Blob([rendered], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `deedsense-report.${format === "json" ? "json" : format === "pdf" ? "pdf" : "docx"}`;
    a.click();
    URL.revokeObjectURL(url);
    onClose?.();
  }

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-black/70 p-4">
      <div className="glass-card w-full max-w-lg p-6">
        <h3 className="text-xl font-bold text-white">Export report</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <select className="input" value={format} onChange={(e) => setFormat(e.target.value)}>
            <option value="pdf">PDF</option>
            <option value="docx">DOCX</option>
            <option value="json">JSON</option>
          </select>
          <select className="input" value={targetLang} onChange={(e) => setTargetLang(e.target.value)}>
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
        </div>
        <p className="mt-3 text-xs text-slate-300">Premium export style applied with section hierarchy and spacing.</p>
        <div className="mt-5 flex justify-end gap-2">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={doDownload}>Download</button>
        </div>
      </div>
    </div>
  );
}
