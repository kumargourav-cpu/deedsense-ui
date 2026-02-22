import React, { useMemo, useRef, useState } from "react";
import { apiExtract, apiScan } from "../lib/api.js";

const MAX_PASTE_CHARS = 250000;

function prettyBytes(bytes) {
  if (!bytes && bytes !== 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let b = bytes;
  let i = 0;
  while (b >= 1024 && i < units.length - 1) {
    b /= 1024;
    i++;
  }
  return `${b.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export default function ScanForm({ language, onResult, onProgress }) {
  const fileRef = useRef(null);

  const [mode, setMode] = useState("file"); // "file" | "paste"
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const canScan = useMemo(() => {
    if (busy) return false;
    if (mode === "file") return !!file;
    const t = (text || "").trim();
    return t.length >= 10;
  }, [busy, mode, file, text]);

  function reset() {
    setErr("");
    setBusy(false);
  }

  async function runScan() {
    reset();
    setBusy(true);

    try {
      // Step 1: get text (either extract from file or use pasted text)
      let extractedText = "";

      if (mode === "file") {
        if (!file) throw new Error("Please choose a file first.");

        onProgress?.({
          open: true,
          title: "Uploading & extracting",
          steps: [
            "Uploading file securely",
            "Detecting file type",
            "Extracting text (OCR if needed)",
          ],
          activeIndex: 1,
          pct: 20,
        });

        const extracted = await apiExtract(file);

        extractedText = extracted?.extracted_text || "";
        if (!extractedText || extractedText.trim().length < 10) {
          throw new Error(
            "No readable text found. If this is a scanned file, ensure the scan is clear and OCR is enabled."
          );
        }

        onProgress?.({
          open: true,
          title: "Text extracted",
          steps: [
            "Uploading file securely",
            "Extracting text (OCR if needed)",
            "Preparing analysis",
          ],
          activeIndex: 2,
          pct: 55,
        });
      } else {
        extractedText = (text || "").slice(0, MAX_PASTE_CHARS);
        if (extractedText.trim().length < 10) {
          throw new Error("Paste at least a few lines to analyze.");
        }

        onProgress?.({
          open: true,
          title: "Preparing analysis",
          steps: ["Validating input", "Preparing analysis", "Running scan"],
          activeIndex: 1,
          pct: 35,
        });
      }

      // Step 2: scan
      onProgress?.({
        open: true,
        title: "Scanning risk signals",
        steps: [
          "Parsing content structure",
          "Detecting persuasion/manipulation patterns",
          "Generating report + charts",
        ],
        activeIndex: 2,
        pct: 75,
      });

      const scanRes = await apiScan(extractedText, language);

      onProgress?.({
        open: true,
        title: "Finalizing",
        steps: ["Generating report + charts", "Finishing", "Ready"],
        activeIndex: 2,
        pct: 92,
      });

      onResult?.({
        extracted_text: scanRes?.extracted_text || extractedText,
        result: scanRes?.result || scanRes,
      });

      onProgress?.({ open: false });
    } catch (e) {
      setErr(e?.message || "Scan failed.");
      onProgress?.({ open: false });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="glass rounded-3xl p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-lg font-extrabold text-white">
            Scan a Listing / Deed / Message
          </div>
          <div className="mt-1 text-sm text-slate-300">
            UAE + international property investors • detect manipulation • summarize risks
          </div>
        </div>

        <div className="flex gap-2">
          <button
            className={"btn " + (mode === "file" ? "btn-primary" : "btn-ghost")}
            onClick={() => setMode("file")}
            disabled={busy}
          >
            Upload
          </button>
          <button
            className={"btn " + (mode === "paste" ? "btn-primary" : "btn-ghost")}
            onClick={() => setMode("paste")}
            disabled={busy}
          >
            Paste
          </button>
        </div>
      </div>

      {mode === "file" ? (
        <div className="mt-4">
          <div className="label mb-2">Upload file</div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.docx,.txt,.png,.jpg,.jpeg,.webp"
              className="block w-full text-sm text-slate-300 file:mr-3 file:rounded-xl file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-white hover:file:bg-white/15"
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                setFile(f);
                setErr("");
              }}
              disabled={busy}
            />
            <button
              className="btn btn-ghost"
              onClick={() => {
                setFile(null);
                setErr("");
                if (fileRef.current) fileRef.current.value = "";
              }}
              disabled={busy}
            >
              Clear
            </button>
          </div>

          {file ? (
            <div className="mt-2 text-xs text-slate-400">
              Selected: <span className="text-slate-200">{file.name}</span>{" "}
              <span className="opacity-70">({prettyBytes(file.size)})</span>
            </div>
          ) : (
            <div className="mt-2 text-xs text-slate-400">
              Supports PDF (scanned too), DOCX, TXT, PNG/JPG.
            </div>
          )}
        </div>
      ) : (
        <div className="mt-4">
          <div className="label mb-2">Paste content</div>
          <textarea
            className="textarea h-44"
            placeholder="Paste listing description, broker messages, payment terms, WhatsApp chat, etc..."
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_PASTE_CHARS))}
            disabled={busy}
          />
          <div className="mt-2 text-xs text-slate-400">
            Max {MAX_PASTE_CHARS.toLocaleString()} characters for safety.
          </div>
        </div>
      )}

      {err ? (
        <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
          {err}
        </div>
      ) : null}

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-slate-400">
          Tip: paste the broker’s message + payment plan + urgency language.
        </div>
        <button className="btn btn-primary" onClick={runScan} disabled={!canScan}>
          {busy ? "Scanning..." : "Scan"}
        </button>
      </div>
    </div>
  );
}
