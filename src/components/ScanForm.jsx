import React, { useMemo, useRef, useState } from "react";
import { apiScanMultipart } from "../lib/api";
import { t } from "../lib/i18n";

const MAX_FILE = 15 * 1024 * 1024;
const ALLOWED = ["application/pdf", "text/plain", "image/png", "image/jpeg", "image/webp", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

export default function ScanForm({ plan, language, onResult, setProgress }) {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const canScan = useMemo(() => !!file || text.trim().length > 40, [file, text]);

  function validateFile(nextFile) {
    if (!nextFile) return "Please select a file.";
    if (nextFile.size > MAX_FILE) return "File is too large. Maximum size is 15MB.";
    if (!ALLOWED.includes(nextFile.type) && !nextFile.name.match(/\.(pdf|docx|txt|png|jpg|jpeg|webp)$/i)) {
      return "Unsupported file type.";
    }
    return "";
  }

  async function handleScan() {
    setError("");
    try {
      if (file) {
        const v = validateFile(file);
        if (v) throw new Error(v);
      }
      if (!file) throw new Error("Please upload a file to scan.");

      setProgress({ open: true, activeIndex: 0, detail: "Uploading file" });
      const data = await apiScanMultipart({ file, plan, language });
      setProgress({ open: true, activeIndex: 4, detail: "Rendering report" });
      onResult?.(data);
    } catch (e) {
      setError(e.message || "Scan failed");
    } finally {
      setProgress({ open: false });
    }
  }

  return (
    <section className="glass-card p-6">
      <h2 className="text-2xl font-bold text-white">{t(language, "scan")}</h2>
      <p className="mt-1 text-sm text-slate-300">{t(language, "appSubtitle")}</p>

      <label className="upload-zone mt-4 block cursor-pointer">
        <input ref={fileRef} type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <p className="font-semibold text-white">{file?.name || t(language, "chooseFile")}</p>
        <p className="mt-1 text-xs text-slate-300">{t(language, "supportedFiles")}</p>
      </label>

      <textarea className="input mt-4 h-28" value={text} onChange={(e) => setText(e.target.value)} placeholder={t(language, "pasteFallback")} />

      {error ? <div className="mt-3 rounded-xl border border-rose-300/30 bg-rose-500/15 p-3 text-sm text-rose-100">{error}</div> : null}

      <div className="mt-4 flex gap-2">
        <button className="btn-ghost" onClick={() => { setFile(null); setText(""); if (fileRef.current) fileRef.current.value = ""; }}>{t(language, "clear")}</button>
        <button className="btn-primary" disabled={!canScan} onClick={handleScan}>{t(language, "scanNow")}</button>
      </div>
    </section>
  );
}
