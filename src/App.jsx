import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import TopNav from "./components/TopNav.jsx";
import ProgressOverlay from "./components/ProgressOverlay.jsx";
import ScanForm from "./components/ScanForm.jsx";
import ResultsPanel from "./components/ResultsPanel.jsx";
import About from "./pages/About.jsx";
import Pricing from "./pages/Pricing.jsx";
import FAQ from "./pages/FAQ.jsx";
import History from "./pages/History.jsx";
import { LANGS } from "./lib/i18n.js";
import { apiHealth } from "./lib/api.js";

const LS_KEY = "deedsense_history_v1";

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveHistory(items) {
  localStorage.setItem(LS_KEY, JSON.stringify(items.slice(0, 120)));
}

export default function App() {
  const [language, setLanguage] = useState("en");
  const [health, setHealth] = useState(null);

  const [overlay, setOverlay] = useState({ open: false, step: 0 });
  const steps = useMemo(
    () => ["Uploading / reading input", "Extracting text (OCR if needed)", "Detecting signals", "Scoring categories", "Generating report"],
    []
  );

  const [result, setResult] = useState(null);

  const [history, setHistory] = useState(loadHistory());
  const navigate = useNavigate();

  useEffect(() => {
    apiHealth().then(setHealth).catch(() => setHealth(null));
  }, []);

  function onResult(data) {
    setResult(data);
    setOverlay({ open: false, step: 0 });
    navigate("/");
  }

  function saveCurrentToHistory() {
    if (!result) return;
    const item = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      filename: result.filename || null,
      input_type: result.input_type || "text",
      extracted_text: result.extracted_text || "",
      analysis: result.analysis || {},
      signals: result.signals || [],
      checklist: result.checklist || {},
      charts: result.charts || {},
      meta: result.meta || {}
    };
    const next = [item, ...history];
    setHistory(next);
    saveHistory(next);
    alert("Saved to history ✅");
  }

  function openHistoryItem(item) {
    setResult({
      filename: item.filename,
      input_type: item.input_type,
      detected_language: item.meta?.detected_language || "en",
      preferred_language: item.meta?.preferred_language || language,
      extracted_text: item.extracted_text,
      analysis: item.analysis,
      charts: item.charts,
      checklist: item.checklist,
      signals: item.signals,
      meta: item.meta
    });
    navigate("/");
  }

  function clearHistory() {
    if (!confirm("Clear history saved in this browser?")) return;
    setHistory([]);
    saveHistory([]);
  }

  return (
    <div className="min-h-screen">
      <div className="fixed inset-0 -z-10 bg-noise" />
      <TopNav language={language} onLanguageChange={setLanguage} langs={LANGS} />

      <ProgressOverlay open={overlay.open} stepIndex={overlay.step} steps={steps} />

      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="pill">
            API: <span className="ml-1 opacity-90">{import.meta.env.VITE_API_BASE_URL || "localhost"}</span>
          </div>
          <div className="flex gap-2">
            <span className="pill">PDF reports</span>
            <span className="pill">OCR enabled</span>
            <span className="pill">Local history</span>
            {health?.ok ? <span className="pill">API online</span> : <span className="pill">API status unknown</span>}
          </div>
        </div>

        <Routes>
          <Route
            path="/"
            element={
              <div className="grid lg:grid-cols-2 gap-4">
                <ScanForm
                  language={language}
                  onResult={(data) => {
                    // show overlay briefly in UI (client animation)
                    setOverlay({ open: true, step: 0 });
                    const timer = setInterval(() => {
                      setOverlay((s) => {
                        const next = Math.min(steps.length - 1, s.step + 1);
                        return { open: true, step: next };
                      });
                    }, 650);

                    setTimeout(() => {
                      clearInterval(timer);
                      onResult(data);
                    }, 2600);
                  }}
                />
                <ResultsPanel result={result} history={history} onSaveToHistory={saveCurrentToHistory} />
              </div>
            }
          />
          <Route path="/history" element={<History items={history} onOpen={openHistoryItem} onClear={clearHistory} />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<FAQ />} />
        </Routes>

        <div className="mt-8 text-center text-xs text-slate-400">
          <div>
            Disclaimer: DeedSense provides a risk signal based on text patterns and structured scoring. It is not legal advice,
            not a guarantee, and must be validated with official documents and due diligence.
          </div>
          <div className="mt-2">© {new Date().getFullYear()} DeedSense • MVP on Render</div>
        </div>
      </div>
    </div>
  );
}
