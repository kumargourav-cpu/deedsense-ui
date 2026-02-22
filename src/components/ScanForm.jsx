// src/components/ScanForm.jsx
import React, { useMemo, useRef, useState } from "react";
import { apiExtract, apiScan } from "../lib/api.js";

const DEFAULT_LANG = "Auto";

const LANGS = ["Auto", "English", "Arabic", "Hindi", "Urdu", "French", "German", "Italian", "Spanish"];

export default function ScanForm({ canScan, plan, freeLeft, setBusy, setBusySteps, onComplete }) {
  const fileRef = useRef(null);

  const [mode, setMode] = useState("text"); // text|file
  const [language, setLanguage] = useState(DEFAULT_LANG);

  const [text, setText] = useState("");
  const [file, setFile] = useState(null);

  // Meta fields (enterprise-ready)
  const [folder, setFolder] = useState("");
  const [property, setProperty] = useState("");
  const [developer, setDeveloper] = useState("");
  const [country, setCountry] = useState("");
  const [project, setProject] = useState("");
  const [tags, setTags] = useState("");

  const [error, setError] = useState("");
  const [extractedPreview, setExtractedPreview] = useState(""); // show extracted text

  const disabledReason = useMemo(() => {
    if (!canScan) return "Free scans limit reached. Switch to Pro/Enterprise to continue (no payment required for now).";
    if (mode === "text" && text.trim().length < 20) return "Paste at least 20 characters to scan.";
    if (mode === "file" && !file) return "Upload a file to scan.";
    return "";
  }, [canScan, mode, text, file]);

  function buildMeta(extra = {}) {
    return {
      folder: folder.trim() || null,
      property: property.trim() || null,
      developer: developer.trim() || null,
      country: country.trim() || null,
      project: project.trim() || null,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      ...extra,
    };
  }

  function setSteps(arr) {
    setBusySteps(arr.map((label) => ({ label, done: false })));
  }

  function markStepDone(idx) {
    setBusySteps((prev) => prev.map((s, i) => (i === idx ? { ...s, done: true } : s)));
  }

  async function run() {
    setError("");
    setExtractedPreview("");

    setBusy(true);

    try {
      if (mode === "file") {
        setSteps([
          "Uploading file securely…",
          "Extracting text (PDF/DOCX/OCR)…",
          "Analyzing manipulation patterns…",
          "Generating risk breakdown + charts…",
          "Finalizing report…",
        ]);

        // 1) extract
        const ex = await apiExtract(file);
        markStepDone(0);
        markStepDone(1);

        const extracted = ex?.extracted_text || "";
        setExtractedPreview(extracted.slice(0, 1400));

        // 2) scan (some APIs return result already; but we also support separate /scan)
        let payload = ex;

        // If extract endpoint does NOT return result, call scan:
        if (!payload?.result) {
          const sc = await apiScan({
            text: extracted,
            language,
            meta: buildMeta({ input_type: ex?.input_type, filename: ex?.filename }),
          });
          payload = { ...ex, ...sc, extracted_text: extracted, result: sc?.result || sc };
        }

        markStepDone(2);
        markStepDone(3);
        markStepDone(4);

        onComplete(payload, buildMeta({ input_type: ex?.input_type, filename: ex?.filename }));
      } else {
        setSteps([
          "Normalizing text…",
          "Analyzing manipulation patterns…",
          "Scoring risk + confidence…",
          "Generating insights + charts…",
          "Finalizing report…",
        ]);

        const sc = await apiScan({
          text,
          language,
          meta: buildMeta({ input_type: "text" }),
        });

        markStepDone(0);
        markStepDone(1);
        markStepDone(2);
        markStepDone(3);
        markStepDone(4);

        onComplete(
          { extracted_text: text, result: sc?.result || sc, input_type: "text", filename: null },
          buildMeta({ input_type: "text" })
        );
      }
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.05)] backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-extrabold">Scan a Listing / Deed / Message</div>
          <div className="mt-1 text-sm text-slate-300">
            UAE + international investors • detect manipulation • summarize risks • evidence highlighting
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Plan: <span className="text-slate-200 font-semibold">{plan.toUpperCase()}</span>
            {plan === "basic" ? (
              <> • Free scans left: <span className="text-slate-200 font-semibold">{freeLeft}</span></>
            ) : (
              <> • Unlimited scans (selection-based for now)</>
            )}
          </div>
        </div>
      </div>

      {/* Mode */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          className={`rounded-2xl px-3 py-2 text-sm font-semibold border ${
            mode === "text"
              ? "border-white/20 bg-white/10"
              : "border-white/10 bg-transparent hover:bg-white/5"
          }`}
          onClick={() => setMode("text")}
        >
          Paste text
        </button>
        <button
          className={`rounded-2xl px-3 py-2 text-sm font-semibold border ${
            mode === "file"
              ? "border-white/20 bg-white/10"
              : "border-white/10 bg-transparent hover:bg-white/5"
          }`}
          onClick={() => setMode("file")}
        >
          Upload file
        </button>
      </div>

      {/* Language */}
      <div className="mt-4">
        <div className="text-xs font-semibold text-slate-300 mb-1">Output language</div>
        <select
          className="w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          {LANGS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        <div className="mt-2 text-xs text-slate-400">
          “Auto” will keep output in the dominant language detected in your text (best effort).
        </div>
      </div>

      {/* Inputs */}
      {mode === "text" ? (
        <div className="mt-4">
          <div className="text-xs font-semibold text-slate-300 mb-1">Paste content</div>
          <textarea
            className="h-40 w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-sm outline-none focus:border-white/20"
            placeholder="Paste listing description, broker message, deed notes, payment plan terms, WhatsApp chat…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
      ) : (
        <div className="mt-4">
          <div className="text-xs font-semibold text-slate-300 mb-1">Upload</div>
          <input
            ref={fileRef}
            type="file"
            className="block w-full text-sm text-slate-300"
            accept=".pdf,.docx,.txt,.png,.jpg,.jpeg,.webp"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <div className="mt-2 text-xs text-slate-400">
            Supported: PDF, DOCX, TXT, PNG/JPG (OCR). Scanned PDFs are OCR’d if needed.
          </div>

          {extractedPreview ? (
            <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3">
              <div className="text-xs font-semibold text-slate-300">Extracted text preview</div>
              <div className="mt-2 whitespace-pre-wrap text-xs text-slate-200 max-h-40 overflow-auto">
                {extractedPreview}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Metadata */}
      <div className="mt-4 grid grid-cols-1 gap-3">
        <div className="grid grid-cols-2 gap-3">
          <input
            className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none"
            placeholder="Deal folder (e.g. Marina-Unit-1204)"
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
          />
          <input
            className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none"
            placeholder="Property name (optional)"
            value={property}
            onChange={(e) => setProperty(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <input
            className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none"
            placeholder="Developer"
            value={developer}
            onChange={(e) => setDeveloper(e.target.value)}
          />
          <input
            className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none"
            placeholder="Country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
          <input
            className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none"
            placeholder="Project"
            value={project}
            onChange={(e) => setProject(e.target.value)}
          />
        </div>

        <input
          className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none"
          placeholder="Tags (comma-separated) e.g. offplan, payment-plan, urgent"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
      </div>

      {/* Error */}
      {error ? (
        <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-200 whitespace-pre-wrap">
          {error}
        </div>
      ) : null}

      {/* Actions */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="text-xs text-slate-400">
          Tip: paste broker message + payment plan + urgency language. Always verify with documents.
        </div>

        <button
          className={`rounded-2xl px-4 py-2 text-sm font-bold border ${
            disabledReason
              ? "cursor-not-allowed border-white/10 bg-white/5 text-slate-500"
              : "border-white/20 bg-white/10 hover:bg-white/15"
          }`}
          onClick={run}
          disabled={!!disabledReason}
          title={disabledReason}
        >
          Scan
        </button>
      </div>
    </div>
  );
}
