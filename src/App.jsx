import React, { useEffect, useMemo, useState } from "react";
import TopNav from "./components/TopNav.jsx";
import ScanForm from "./components/ScanForm.jsx";
import ResultsPanel from "./components/ResultsPanel.jsx";
import ProgressOverlay from "./components/ProgressOverlay.jsx";
import LanguagePrompt from "./components/LanguagePrompt.jsx";

import History from "./pages/History.jsx";
import Pricing from "./pages/Pricing.jsx";
import About from "./pages/About.jsx";
import FAQ from "./pages/FAQ.jsx";
import Chat from "./pages/Chat.jsx";

import { apiHealth, analyzeText, extractAndAnalyze } from "./lib/api.js";
import { downloadReportPDF } from "./lib/pdf.js";
import { detectLanguageRough } from "./lib/i18n.js";

export default function App() {
  const [tab, setTab] = useState("scan");
  const [lang, setLang] = useState("auto");
  const [busy, setBusy] = useState(false);

  const [progressOpen, setProgressOpen] = useState(false);
  const [progressIndex, setProgressIndex] = useState(0);

  const [health, setHealth] = useState(null);
  const [err, setErr] = useState("");
  const [data, setData] = useState(null);
  const [extractedText, setExtractedText] = useState("");

  const steps = useMemo(
    () => ["Preparing request", "Extracting text (OCR if needed)", "Analyzing risk signals", "Building report"],
    []
  );

  useEffect(() => {
    (async () => {
      try {
        const h = await apiHealth();
        setHealth(h);
      } catch {
        setHealth(null);
      }
    })();
  }, []);

  async function runScanText(text) {
    setErr("");
    setBusy(true);
    setProgressOpen(true);
    setProgressIndex(0);

    try {
      setProgressIndex(1);
      const chosen = lang === "auto" ? detectLanguageRough(text) : lang;
      setProgressIndex(2);

      const d = await analyzeText({ text, lang: chosen });
      setExtractedText(d.extracted_text || text);
      setData(d);

      setProgressIndex(3);
      setTimeout(() => setProgressOpen(false), 350);
    } catch (e) {
      setErr(e?.message || "Scan failed");
      setProgressOpen(false);
    } finally {
      setBusy(false);
    }
  }

  async function runScanFile(file) {
    setErr("");
    setBusy(true);
    setProgressOpen(true);
    setProgressIndex(0);

    try {
      setProgressIndex(1);
      const chosen = lang === "auto" ? "auto" : lang;

      setProgressIndex(2);
      const d = await extractAndAnalyze({ file, lang: chosen });

      setExtractedText(d.extracted_text || "");
      setData(d);

      setProgressIndex(3);
      setTimeout(() => setProgressOpen(false), 350);
    } catch (e) {
      setErr(e?.message || "Upload/extraction failed");
      setProgressOpen(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <TopNav tab={tab} setTab={setTab} />

      <div className="mx-auto max-w-6xl px-4 py-6 grid gap-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 space-y-4">
            <LanguagePrompt lang={lang} setLang={setLang} />

            <div className="card">
              <div className="label">API</div>
              <div className="mt-1 text-sm text-slate-200">
                {import.meta.env.VITE_API_BASE_URL || "https://deedsense-api.onrender.com"}
              </div>
              <div className="mt-3 text-xs text-slate-400">
                Health: {health?.ok ? "OK" : "Unknown"} • OCR: {health?.ocr ? "Enabled" : "Unknown"}
              </div>
            </div>

            {err ? (
              <div className="card border border-red-500/30">
                <div className="text-sm font-semibold text-red-200">Error</div>
                <div className="mt-2 text-sm text-red-100">{err}</div>
              </div>
            ) : null}
          </div>

          <div className="lg:col-span-2 space-y-4">
            {tab === "scan" ? (
              <>
                <ScanForm busy={busy} onScanText={runScanText} onScanFile={runScanFile} />
                <ResultsPanel
                  data={data}
                  extractedText={extractedText}
                  onDownloadPDF={() => downloadReportPDF({ title: "DeedSense Report" })}
                />
              </>
            ) : null}

            {tab === "history" ? <History /> : null}
            {tab === "pricing" ? <Pricing /> : null}
            {tab === "about" ? <About /> : null}
            {tab === "faq" ? <FAQ /> : null}
            {tab === "chat" ? <Chat /> : null}
          </div>
        </div>

        <div className="text-xs text-slate-400 mt-4">
          Disclaimer: DeedSense provides a risk signal based on text patterns and analysis. It is not legal advice, not a guarantee,
          and should be validated with official documents and independent due diligence.
        </div>
      </div>

      <ProgressOverlay open={progressOpen} title="Analyzing…" steps={steps} activeIndex={progressIndex} />
    </div>
  );
}
