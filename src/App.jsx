import React, { useEffect, useState } from "react";
import TopNav from "./components/TopNav";
import ScanForm from "./components/ScanForm";
import ProgressOverlay from "./components/ProgressOverlay";
import ResultsPanel from "./components/ResultsPanel";
import DownloadModal from "./components/DownloadModal";
import { apiHealth } from "./lib/api";
import { t } from "./lib/i18n";

const LS_LAST = "deedsense_last_result_v1";
const LS_HISTORY = "deedsense_history_v1";

export default function App() {
  const [plan, setPlan] = useState("basic");
  const [language, setLanguage] = useState("en");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [progress, setProgress] = useState({ open: false, activeIndex: 0, detail: "" });
  const [apiOk, setApiOk] = useState(null);
  const [downloadOpen, setDownloadOpen] = useState(false);

  useEffect(() => {
    try {
      const last = JSON.parse(localStorage.getItem(LS_LAST) || "null");
      if (last) setResult(last);
      const hist = JSON.parse(localStorage.getItem(LS_HISTORY) || "[]");
      setHistory(Array.isArray(hist) ? hist : []);
    } catch {
      setResult(null);
      setHistory([]);
    }
  }, []);

  useEffect(() => {
    apiHealth().then(() => setApiOk(true)).catch(() => setApiOk(false));
  }, []);

  function handleResult(next) {
    setResult(next);
    const entry = { at: Date.now(), plan, language, report: next?.report || next };
    const nextHistory = [entry, ...history].slice(0, 20);
    setHistory(nextHistory);
    localStorage.setItem(LS_LAST, JSON.stringify(next));
    localStorage.setItem(LS_HISTORY, JSON.stringify(nextHistory));
  }

  return (
    <div className="min-h-screen bg-shell px-4 pb-12">
      <TopNav plan={plan} setPlan={setPlan} language={language} setLanguage={setLanguage} />
      <main className="mx-auto mt-6 grid max-w-7xl gap-6 lg:grid-cols-12">
        <section className="lg:col-span-5">
          <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-slate-300">API: {apiOk === null ? "checking" : apiOk ? "online" : "offline"}</div>
          <ScanForm plan={plan} language={language} onResult={handleResult} setProgress={setProgress} />
          <button className="btn-primary mt-4 w-full" onClick={() => setDownloadOpen(true)} disabled={!result}>{t(language, "download")}</button>
        </section>
        <section className="lg:col-span-7">
          <ResultsPanel result={result} language={language} plan={plan} />
        </section>
      </main>
      <ProgressOverlay {...progress} />
      <DownloadModal open={downloadOpen} onClose={() => setDownloadOpen(false)} report={result} language={language} />
    </div>
  );
}
