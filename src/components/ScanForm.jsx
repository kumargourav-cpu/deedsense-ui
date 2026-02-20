import React, { useState } from "react";
import { analyzeText, extractAndAnalyze } from "../lib/api.js";
import { t } from "../lib/i18n.js";

export default function ScanForm({ lang, onResult, onProgress }) {
  const [mode, setMode] = useState("upload"); // upload | paste
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [err, setErr] = useState("");

  const stepsUpload = [
    { title: "Uploading file", desc: "Securely transferring your document" },
    { title: "Extracting text", desc: "Reading PDF/DOCX/TXT content" },
    { title: "OCR (if needed)", desc: "Scanning images or scanned PDFs" },
    { title: "Detecting language", desc: "Selecting best analysis pathway" },
    { title: "Risk analysis", desc: "Pressure, claims, doc gaps, payment risks" },
    { title: "Building charts", desc: "Summarizing signals into visuals" },
    { title: "Finalizing report", desc: "Generating recommendations + checklist" },
  ];

  const stepsPaste = [
    { title: "Preparing text", desc: "Cleaning and structuring content" },
    { title: "Detecting language", desc: "Selecting best analysis pathway" },
    { title: "Risk analysis", desc: "Pressure, claims, doc gaps, payment risks" },
    { title: "Building charts", desc: "Summarizing signals into visuals" },
    { title: "Finalizing report", desc: "Generating recommendations + checklist" },
  ];

  async function runScan() {
    setErr("");
    try {
      if (mode === "upload") {
        if (!file) return setErr("Please choose a file first.");
        onProgress(true, 0, stepsUpload);

        for (let i = 0; i < stepsUpload.length - 1; i++) {
          onProgress(true, i, stepsUpload);
          await new Promise((r) => setTimeout(r, 220));
        }

        const data = await extractAndAnalyze({ file, outLang: lang });
        onProgress(false, 0, stepsUpload);
        onResult({ extractedText: data.extracted_text, result: data.result, source: { type: "file", name: data.filename } });
      } else {
        if ((text || "").trim().length < 10) return setErr("Paste at least a few lines of content.");
        onProgress(true, 0, stepsPaste);

        for (let i = 0; i < stepsPaste.length - 1; i++) {
          onProgress(true, i, stepsPaste);
          await new Promise((r) => setTimeout(r, 180));
        }

        const data = await analyzeText({ text, outLang: lang });
        onProgress(false, 0, stepsPaste);
        onResult({ extractedText: data.extracted_text, result: data.result, source: { type: "text" } });
      }
    } catch (e) {
      onProgress(false, 0, []);
      setErr(e?.message || "Scan failed.");
    }
  }

  return (
    <div className="glass rounded-3xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-lg font-black tracking-tight">Scan a Listing / Deed / Message</div>
          <div className="mt-1 text-sm text-slate-300">
            UAE + global investors • detect manipulation • surface due diligence gaps • prioritize verification
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className={`btn ${mode === "upload" ? "btn-primary" : "btn-ghost"}`} onClick={() => setMode("upload")}>
            {t(lang, "upload")}
          </button>
          <button className={`btn ${mode === "paste" ? "btn-primary" : "btn-ghost"}`} onClick={() => setMode("paste")}>
            {t(lang, "paste")}
          </button>
        </div>
      </div>

      <div className="hr my-5" />

      {mode === "upload" ? (
        <div className="space-y-3">
          <div className="label">Upload file</div>
          <input
            type="file"
            className="input py-2"
            accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <div className="text-xs text-slate-400">
            Supported: PDF (including scanned PDFs), DOCX, TXT, PNG, JPG/JPEG. OCR runs when needed.
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="label">Paste content</div>
          <textarea
            className="textarea"
            placeholder="Paste listing description, broker message, SPA clauses, payment plan terms, WhatsApp chat..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="flex items-center justify-between">
            <button className="btn-ghost" onClick={() => setText("")}>{t(lang, "clear")}</button>
            <div className="text-xs text-slate-400">{text.length} chars</div>
          </div>
        </div>
      )}

      {err ? (
        <div className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-400/10 p-3 text-sm text-rose-100">
          {err}
        </div>
      ) : null}

      <div className="mt-5 flex justify-end">
        <button className="btn-primary" onClick={runScan}>
          {t(lang, "run")}
        </button>
      </div>
    </div>
  );
}
