import React, { useMemo, useRef, useState } from "react";
import { apiAnalyze, apiExtract, apiScan } from "../lib/api.js";

export default function ScanForm({ language, onResult }) {
  const [mode, setMode] = useState("upload"); // upload | paste
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [extracted, setExtracted] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const inputRef = useRef(null);

  const canScan = useMemo(() => {
    if (mode === "paste") return text.trim().length >= 20;
    return !!file;
  }, [mode, text, file]);

  async function handleExtract() {
    setErr("");
    setBusy(true);
    try {
      const data = await apiExtract(file);
      setExtracted(data);
      setText(data.extracted_text || "");
    } catch (e) {
      setErr(e?.message || "Extraction failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleScan() {
    setErr("");
    setBusy(true);

    try {
      let data;
      if (mode === "paste") {
        data = await apiAnalyze(text, language);
      } else {
        // Prefer scan endpoint to do extract+analyze together:
        data = await apiScan(file, language);
      }
      onResult(data);
    } catch (e) {
      setErr(e?.message || "Scan failed.");
    } finally {
      setBusy(false);
    }
  }

  function clearAll() {
    setFile(null);
    setText("");
    setExtracted(null);
    setErr("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-extrabold">Scan a Listing / Deed / Message</div>
          <div className="mt-1 text-sm text-slate-300">
            Upload a document or paste text. You’ll get risk signals, a checklist, and an investor-style summary.
          </div>
        </div>
        <div className="pill">OCR Enabled</div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          className={mode === "upload" ? "btn-primary" : "btn-ghost"}
          onClick={() => setMode("upload")}
          disabled={busy}
        >
          Upload file
        </button>
        <button
          className={mode === "paste" ? "btn-primary" : "btn-ghost"}
          onClick={() => setMode("paste")}
          disabled={busy}
        >
          Paste text
        </button>
        <button className="btn-ghost ml-auto" onClick={clearAll} disabled={busy}>
          Clear
        </button>
      </div>

      <div className="hr" />

      {mode === "upload" ? (
        <div className="grid gap-3">
          <div>
            <div className="label mb-2">Upload (PDF / DOCX / TXT / PNG / JPG)</div>
            <input
              ref={inputRef}
              type="file"
              className="input"
              accept=".pdf,.docx,.txt,.png,.jpg,.jpeg,.webp"
              onChange={(e) => {
                setFile(e.target.files?.[0] || null);
                setExtracted(null);
                setText("");
              }}
              disabled={busy}
            />
            <div className="mt-2 text-xs text-slate-400">
              For scanned PDFs, OCR will run automatically. If your document is large, keep it under ~12MB.
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button className="btn-ghost" onClick={handleExtract} disabled={!file || busy}>
              Extract text
            </button>
            <button className="btn-primary" onClick={handleScan} disabled={!canScan || busy}>
              {busy ? "Scanning…" : "Scan"}
            </button>
          </div>

          {extracted ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-bold">Extraction Preview</div>
                <div className="pill">
                  {extracted.input_type} • detected {extracted.detected_language}
                </div>
              </div>
              <textarea className="input mt-3 min-h-[160px]" value={text} onChange={(e) => setText(e.target.value)} />
              <div className="mt-2 text-xs text-slate-400">
                You can edit extracted text before scanning (useful if OCR captured noise).
              </div>
              <div className="mt-3">
                <button className="btn-primary" onClick={() => apiAnalyze(text, language).then(onResult)} disabled={busy || text.trim().length < 20}>
                  Scan extracted text
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-3">
          <div>
            <div className="label mb-2">Paste content</div>
            <textarea
              className="input min-h-[220px]"
              placeholder="Paste listing description, broker message, payment plan, deed notes, etc…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={busy}
            />
            <div className="mt-2 text-xs text-slate-400">
              Tip: Include payment terms + urgency language + fees + handover claims for strongest analysis.
            </div>
          </div>

          <div className="flex gap-2">
            <button className="btn-primary" onClick={handleScan} disabled={!canScan || busy}>
              {busy ? "Scanning…" : "Scan"}
            </button>
          </div>
        </div>
      )}

      {err ? (
        <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
          {err}
        </div>
      ) : null}
    </div>
  );
}
