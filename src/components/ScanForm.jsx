// src/components/ScanForm.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { apiExtract, apiScan } from "../lib/api.js";

const LS_DRAFT = "deedsense_draft_v1";
const LS_LAST = "deedsense_last_result_v1";

function humanErr(e) {
  if (!e) return "Unknown error.";
  if (typeof e === "string") return e;
  return e?.message || e?.detail || JSON.stringify(e);
}

async function withTimeout(promise, ms = 60000) {
  let t;
  const timeout = new Promise((_, rej) => {
    t = setTimeout(() => rej(new Error(`Request timed out after ${Math.round(ms / 1000)}s`)), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(t);
  }
}

export default function ScanForm({
  language,
  plan,
  onResult,
  setProgress, // expects: (obj) => void
}) {
  const fileRef = useRef(null);

  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Optional “enterprise” metadata (kept lightweight)
  const [folder, setFolder] = useState("");
  const [developer, setDeveloper] = useState("");
  const [country, setCountry] = useState("");
  const [project, setProject] = useState("");

  const canScan = useMemo(() => {
    if (busy) return false;
    if (file) return true;
    return (text || "").trim().length >= 20;
  }, [busy, file, text]);

  // restore draft on load
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_DRAFT);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d?.text) setText(d.text);
      if (d?.folder) setFolder(d.folder);
      if (d?.developer) setDeveloper(d.developer);
      if (d?.country) setCountry(d.country);
      if (d?.project) setProject(d.project);
    } catch {}
  }, []);

  // persist draft
  useEffect(() => {
    try {
      localStorage.setItem(
        LS_DRAFT,
        JSON.stringify({ text, folder, developer, country, project })
      );
    } catch {}
  }, [text, folder, developer, country, project]);

  function openProgress(title, steps, activeIndex, detail) {
    setProgress?.({ open: true, title, steps, activeIndex, detail });
  }

  function updateProgress(activeIndex, detail) {
    setProgress?.((prev) => ({ ...(prev || {}), open: true, activeIndex, detail }));
  }

  function closeProgress() {
    setProgress?.({ open: false });
  }

  function clearAll() {
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
    setText("");
    setError("");
    try {
      localStorage.removeItem(LS_DRAFT);
    } catch {}
  }

  async function handleScan() {
    setError("");
    setBusy(true);

    const steps = file
      ? ["Validating file", "Extracting text (OCR if needed)", "Analyzing signals", "Building report"]
      : ["Validating input", "Analyzing signals", "Building report"];

    try {
      openProgress("Scanning…", steps, 0, file ? "Preparing file upload…" : "Preparing text…");

      const meta = { folder, developer, country, project };

      let extractedText = (text || "").trim();

      if (file) {
        // 1) extract
        updateProgress(0, "Uploading file…");
        const extractRes = await withTimeout(
          apiExtract({ file, language, plan, meta }),
          90000
        );

        extractedText =
          extractRes?.extracted_text ||
          extractRes?.text ||
          extractRes?.raw_text ||
          "";

        extractedText = (extractedText || "").trim();

        if (!extractedText || extractedText.length < 10) {
          throw new Error("No readable text found in the upload. Try a clearer scan or a text-based PDF.");
        }

        // put extracted text into the textbox so user can see it and it persists
        setText(extractedText);

        updateProgress(1, "Text extracted. Running analysis…");
      } else {
        updateProgress(0, "Running analysis…");
      }

      // 2) scan
      const scanRes = await withTimeout(
        apiScan({ text: extractedText, language, plan, meta }),
        90000
      );

      updateProgress(file ? 2 : 1, "Generating charts & report…");

      // persist last result (so refresh keeps it)
      try {
        localStorage.setItem(LS_LAST, JSON.stringify({ at: Date.now(), scanRes }));
      } catch {}

      // send up to App
      onResult?.(scanRes);

      updateProgress(file ? 3 : 2, "Done.");
      closeProgress();
    } catch (e) {
      closeProgress();
      setError(humanErr(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="glass rounded-3xl p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-lg font-extrabold text-white">Scan a Listing / Deed / Message</div>
          <div className="mt-1 text-sm text-slate-300">
            Upload a file (PDF/DOCX/TXT/PNG/JPG) or paste text. DeedSense extracts + highlights risk signals.
          </div>
        </div>

        <div className="flex gap-2">
          <button className="btn-ghost" onClick={clearAll} disabled={busy}>
            Clear
          </button>
          <button className="btn-primary" onClick={handleScan} disabled={!canScan}>
            {busy ? "Scanning…" : plan === "basic" ? "Scan (Basic)" : plan === "pro" ? "Scan (Pro)" : "Scan (Enterprise)"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-100">
          <div className="font-semibold">Scan failed</div>
          <div className="mt-1 opacity-90">{error}</div>
          <div className="mt-2 text-xs text-rose-100/80">
            Tip: open DevTools → Network → check /extract and /scan responses.
          </div>
        </div>
      ) : null}

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="label mb-2">Upload</div>
          <input
            ref={fileRef}
            type="file"
            className="block w-full text-sm text-slate-200"
            accept=".pdf,.docx,.txt,.png,.jpg,.jpeg,.webp,application/pdf,image/*,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <div className="mt-2 text-xs text-slate-400">
            Files don’t persist after refresh — we persist the extracted text + results instead.
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 lg:col-span-2">
          <div className="label mb-2">Paste content</div>
          <textarea
            className="input h-28 resize-none"
            placeholder="Paste listing description, broker message, payment plan terms, WhatsApp chat, etc…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="mt-2 text-xs text-slate-400">
            If you upload a file, extracted text will appear here (so you can review evidence highlights).
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="label mb-1">Deal folder</div>
          <input className="input" value={folder} onChange={(e) => setFolder(e.target.value)} placeholder="e.g., Lagoons Santorini 3BR" />
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="label mb-1">Developer</div>
          <input className="input" value={developer} onChange={(e) => setDeveloper(e.target.value)} placeholder="e.g., DAMAC" />
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="label mb-1">Country</div>
          <input className="input" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g., UAE" />
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="label mb-1">Project</div>
          <input className="input" value={project} onChange={(e) => setProject(e.target.value)} placeholder="e.g., Santorini" />
        </div>
      </div>

      <div className="mt-4 text-xs text-slate-400">
        When you click Scan, the system: validates → extracts/OCR (if file) → analyzes signals → generates report + charts.
      </div>
    </div>
  );
}
