// src/components/ScanForm.jsx
import React, { useMemo, useState } from "react";

export default function ScanForm({
  text,
  setText,
  onScan,
  onUpload,
  busy,
  error,
  freeScansLeft,
  user,
  preferredLanguageLabel,
}) {
  const [fileName, setFileName] = useState("");

  const canScan = useMemo(() => (text || "").trim().length >= 30, [text]);

  return (
    <div className="glass rounded-3xl p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-lg font-extrabold">Scan a Listing / Deed / Broker Message</div>
          <div className="mt-1 text-sm text-slate-300">
            UAE + international property investors • detect manipulation • summarize risks • due diligence checklist
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="badge">Preferred reply: <b className="ml-1">{preferredLanguageLabel}</b></span>
            <span className="badge">{user ? "Signed in" : "Guest mode"}</span>
            <span className="badge">Free scans left: <b className="ml-1">{freeScansLeft}</b></span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-slate-300 md:max-w-sm">
          <div className="font-semibold text-slate-200">Disclaimer</div>
          <div className="mt-1">
            DeedSense provides a risk signal based on text patterns and AI analysis. It is not legal advice,
            not a guarantee, and must be verified via official documents and due diligence.
          </div>
        </div>
      </div>

      <div className="hr" />

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <div className="label mb-2">Upload (PDF / DOCX / JPG / PNG)</div>
          <div className="flex items-center gap-2">
            <input
              className="input"
              type="file"
              accept=".pdf,.doc,.docx,image/jpeg,image/png,text/plain"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                setFileName(f.name);
                onUpload(f);
              }}
            />
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Upload triggers safe text extraction (OCR for images/scanned PDFs if your backend supports it).
            <span className="ml-2 text-slate-500">{fileName ? `Selected: ${fileName}` : ""}</span>
          </div>
        </div>

        <div>
          <div className="label mb-2">Paste content</div>
          <textarea
            className="input min-h-[140px] resize-y"
            placeholder="Paste listing description, broker message, deed notes, payment plan terms, WhatsApp chat, etc..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="mt-2 text-xs text-slate-400">
            Tip: paste the broker’s message + payment plan + any urgency language + commission notes.
          </div>
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          <b>Error:</b> {error}
        </div>
      ) : null}

      <div className="mt-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="text-xs text-slate-400">
          Usage note: Always verify via official documents, escrow/payment proof, RERA/authority checks,
          and legal due diligence.
        </div>

        <div className="flex gap-2">
          <button
            className="btn-ghost"
            onClick={() => setText("")}
            disabled={busy}
          >
            Clear
          </button>
          <button
            className="btn-primary"
            onClick={onScan}
            disabled={busy || !canScan || (!user && freeScansLeft <= 0)}
            title={!canScan ? "Paste at least ~30 characters to scan" : ""}
          >
            {busy ? "Scanning..." : user ? "Scan Now" : `Scan (Free ${freeScansLeft})`}
          </button>
        </div>
      </div>
    </div>
  );
}
