import React, { useMemo, useRef, useState } from "react";

export default function ScanForm({
  apiBase,
  token,
  onResult,
  onExtractedText,
  onDetectedLanguageCandidate,
  preferredLanguage,
}) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const fileRef = useRef(null);

  const canScan = useMemo(() => apiBase && token, [apiBase, token]);

  async function scanText() {
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch(`${apiBase}/analyze-text`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...(preferredLanguage?.iso1 ? { "X-Preferred-Language": preferredLanguage.iso1 } : {})
        },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || "Scan failed");
      onExtractedText(data.extracted_text || text);
      onResult(data);
      onDetectedLanguageCandidate(data.extracted_text || text);
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setBusy(false);
    }
  }

  async function scanFile() {
    setErr(null);
    setBusy(true);
    try {
      const file = fileRef.current?.files?.[0];
      if (!file) throw new Error("Choose a file first.");

      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch(`${apiBase}/extract-and-analyze`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || "Upload scan failed");

      onExtractedText(data.extracted_text || "");
      onResult(data);
      onDetectedLanguageCandidate(data.extracted_text || "");
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-3xl bg-white/5 p-5 ring-1 ring-white/10 backdrop-blur-xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-base font-semibold text-white">Scan a Listing / Deed / Message</div>
          <div className="mt-1 text-sm text-slate-400">
            Upload PDF/DOCX/Image or paste text. Works best for investor communications & terms.
          </div>
        </div>
        <div className="text-xs text-slate-400">
          API: <span className="text-slate-200">{apiBase || "Not set"}</span>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-black/20 p-4 ring-1 ring-white/10">
          <div className="text-sm font-semibold text-white">Upload (PDF / DOCX / PNG / JPG / TXT)</div>
          <div className="mt-2">
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
              className="w-full rounded-xl bg-white/5 p-3 text-sm text-slate-200 ring-1 ring-white/10"
            />
          </div>
          <button
            onClick={scanFile}
            disabled={!canScan || busy}
            className="mt-3 w-full rounded-2xl bg-emerald-500/15 px-4 py-3 text-sm font-semibold text-emerald-100 ring-1 ring-emerald-300/25 hover:bg-emerald-500/20 disabled:opacity-40"
          >
            {busy ? "Working..." : "Upload & Scan"}
          </button>
          {!canScan && (
            <div className="mt-2 text-xs text-amber-200/80">
              Sign in is required for scanning. (OTP login)
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-black/20 p-4 ring-1 ring-white/10">
          <div className="text-sm font-semibold text-white">Paste text</div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste listing description, broker messages, payment terms, WhatsApp chat, etc..."
            rows={7}
            className="mt-2 w-full resize-none rounded-2xl bg-white/5 p-3 text-sm text-slate-100 ring-1 ring-white/10 outline-none placeholder:text-slate-500 focus:ring-emerald-300/25"
          />
          <button
            onClick={scanText}
            disabled={!canScan || busy || !text.trim()}
            className="mt-3 w-full rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white ring-1 ring-white/15 hover:bg-white/12 disabled:opacity-40"
          >
            {busy ? "Working..." : "Scan pasted text"}
          </button>
        </div>
      </div>

      {err && (
        <div className="mt-4 rounded-2xl bg-red-500/10 p-4 text-sm text-red-100 ring-1 ring-red-400/20">
          {err}
        </div>
      )}

      <div className="mt-4 rounded-2xl bg-white/5 p-4 text-xs text-slate-400 ring-1 ring-white/10">
        <div className="font-semibold text-slate-200">Disclaimer</div>
        DeedSense provides risk signals based on patterns + AI logic. It is not legal advice and not a guarantee.
        Always verify via official documents, escrow/payment proof, and legal due diligence.
      </div>
    </div>
  );
}
