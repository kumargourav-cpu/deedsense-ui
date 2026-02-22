import React, { useMemo, useState } from "react";

export default function ScanForm({ onScanText, onScanFile, busy }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);

  const canScan = useMemo(() => {
    if (busy) return false;
    if (file) return true;
    return text.trim().length >= 20;
  }, [busy, file, text]);

  return (
    <div className="card">
      <div className="text-sm font-extrabold">Scan a Listing / Deed / Message</div>
      <div className="text-xs text-slate-300 mt-1">
        Upload PDF/DOCX/TXT or images (PNG/JPEG). For scanned PDFs, OCR will be used.
      </div>

      <div className="mt-5 grid gap-4">
        <div>
          <div className="label mb-2">Upload file</div>
          <input
            className="input"
            type="file"
            accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          {file ? <div className="mt-2 text-xs text-slate-400">Selected: {file.name}</div> : null}
        </div>

        <div className="text-center text-xs text-slate-400">— OR —</div>

        <div>
          <div className="label mb-2">Paste text</div>
          <textarea
            className="input min-h-[150px]"
            placeholder="Paste listing text, broker message, payment plan terms, WhatsApp chat, etc..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <button className="btn-ghost" onClick={() => { setText(""); setFile(null); }} disabled={busy}>
            Clear
          </button>

          <button
            className="btn-primary"
            disabled={!canScan}
            onClick={() => {
              if (file) return onScanFile(file);
              return onScanText(text);
            }}
          >
            {busy ? "Scanning..." : "Scan"}
          </button>
        </div>
      </div>
    </div>
  );
}
