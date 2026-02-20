import React, { useEffect, useMemo, useState } from "react";
import TopNav from "./components/TopNav.jsx";
import ScanForm from "./components/ScanForm.jsx";
import ResultsPanel from "./components/ResultsPanel.jsx";
import ProgressOverlay from "./components/ProgressOverlay.jsx";

import History from "./pages/History.jsx";
import Pricing from "./pages/Pricing.jsx";
import About from "./pages/About.jsx";
import FAQ from "./pages/FAQ.jsx";
import Chat from "./pages/Chat.jsx";

import { t } from "./lib/i18n.js";
import { getApiBase } from "./lib/api.js";

const LS_KEY = "deedsense_history_v1";
const LS_LANG = "deedsense_lang_v1";

function makeId() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export default function App() {
  const [active, setActive] = useState("scan");
  const [lang, setLang] = useState(localStorage.getItem(LS_LANG) || "en");

  const [progressOpen, setProgressOpen] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [progressSteps, setProgressSteps] = useState([]);

  const [lastExtracted, setLastExtracted] = useState("");
  const [lastResult, setLastResult] = useState(null);
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(LS_LANG, lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(history.slice(0, 80)));
  }, [history]);

  function onProgress(open, idx, steps) {
    setProgressOpen(open);
    setProgressStep(idx || 0);
    setProgressSteps(steps || []);
  }

  function onNewResult({ extractedText, result, source }) {
    setLastExtracted(extractedText || "");
    setLastResult(result || null);

    const title =
      source?.type === "file"
        ? `File: ${source?.name || "upload"}`
        : "Pasted text";

    const item = {
      id: makeId(),
      createdAt: new Date().toISOString(),
      title,
      extractedText: extractedText || "",
      result: result || null,
    };

    setHistory((h) => [item, ...h].slice(0, 80));
    setActive("scan");
  }

  function selectHistoryItem(item) {
    setLastExtracted(item.extractedText || "");
    setLastResult(item.result || null);
    setActive("scan");
  }

  function clearHistory() {
    setHistory([]);
  }

  const footerDisclaimer = useMemo(() => {
    return `${t(lang, "disclaimerTitle")}: ${t(lang, "disclaimer")}`;
  }, [lang]);

  return (
    <div className="min-h-screen">
      <TopNav active={active} setActive={setActive} lang={lang} setLang={setLang} />
      <ProgressOverlay open={progressOpen} stepIndex={progressStep} steps={progressSteps} />

      <main className="mx-auto max-w-6xl px-4 py-6">
        {active === "scan" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="glass rounded-3xl p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-2xl font-black tracking-tight">Trust & Manipulation Risk Scanner</div>
                    <div className="mt-2 text-sm text-slate-300">
                      Upload or paste content. DeedSense extracts text, detects pressure patterns, highlights due diligence gaps,
                      and generates an investor-grade report with charts and checklists.
                    </div>
                  </div>
                  <div className="pill">API: {getApiBase().replace("https://", "")}</div>
                </div>
              </div>

              <ScanForm
                lang={lang}
                onResult={onNewResult}
                onProgress={onProgress}
              />
            </div>

            <ResultsPanel result={lastResult} extractedText={lastExtracted} />
          </div>
        ) : null}

        {active === "history" ? (
          <History items={history} onSelect={selectHistoryItem} onClear={clearHistory} />
        ) : null}

        {active === "pricing" ? <Pricing /> : null}
        {active === "about" ? <About /> : null}
        {active === "faq" ? <FAQ /> : null}
        {active === "chat" ? <Chat lang={lang} contextText={lastExtracted} /> : null}

        <footer className="mt-8 text-xs text-slate-400">
          <div className="hr mb-4" />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>© {new Date().getFullYear()} DeedSense • MVP build</div>
            <div className="max-w-3xl">{footerDisclaimer}</div>
          </div>
        </footer>
      </main>
    </div>
  );
}
