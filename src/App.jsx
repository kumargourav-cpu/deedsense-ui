// src/App.jsx
import React, { useEffect, useMemo, useState } from "react";
import TopNav from "./components/TopNav.jsx";
import ProgressOverlay from "./components/ProgressOverlay.jsx";
import ScanForm from "./components/ScanForm.jsx";
import ResultsPanel from "./components/ResultsPanel.jsx";

import About from "./pages/About.jsx";
import Pricing from "./pages/Pricing.jsx";
import FAQ from "./pages/FAQ.jsx";
import History from "./pages/History.jsx";
import Compare from "./pages/Compare.jsx";

import { apiHealth, apiInfo } from "./lib/api.js";

const LS_HISTORY = "deedsense_history_v3";
const LS_PLAN = "deedsense_plan_v1";

function monthKey() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function defaultUsage() {
  return { month: monthKey(), used: 0 };
}

export default function App() {
  const [route, setRoute] = useState("scan"); // scan|history|compare|pricing|about|faq
  const [busy, setBusy] = useState(false);
  const [busySteps, setBusySteps] = useState([]);
  const [result, setResult] = useState(null);

  const [plan, setPlan] = useState(() => localStorage.getItem(LS_PLAN) || "basic"); // basic|pro|enterprise
  const [usage, setUsage] = useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem("deedsense_usage_v1") || "null");
      if (!raw || raw.month !== monthKey()) return defaultUsage();
      return raw;
    } catch {
      return defaultUsage();
    }
  });

  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(LS_HISTORY) || "[]");
    } catch {
      return [];
    }
  });

  const [apiStatus, setApiStatus] = useState({ ok: null, info: null, err: null });

  useEffect(() => {
    localStorage.setItem(LS_PLAN, plan);
  }, [plan]);

  useEffect(() => {
    localStorage.setItem(LS_HISTORY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem("deedsense_usage_v1", JSON.stringify(usage));
  }, [usage]);

  useEffect(() => {
    // health ping
    (async () => {
      try {
        const h = await apiHealth();
        const i = await apiInfo();
        setApiStatus({ ok: true, info: { ...h, ...i }, err: null });
      } catch (e) {
        setApiStatus({ ok: false, info: null, err: e?.message || String(e) });
      }
    })();
  }, []);

  const freeLimit = 5;

  const canScan = useMemo(() => {
    if (plan === "basic") {
      const mk = monthKey();
      const used = usage.month === mk ? usage.used : 0;
      return used < freeLimit;
    }
    return true;
  }, [plan, usage]);

  function bumpUsageIfNeeded() {
    if (plan !== "basic") return;
    const mk = monthKey();
    setUsage((u) => {
      const base = u.month === mk ? u : defaultUsage();
      return { month: mk, used: base.used + 1 };
    });
  }

  function saveToHistory(entry) {
    setHistory((prev) => [entry, ...prev].slice(0, 200));
  }

  function onScanComplete(payload, meta) {
    // payload: { extracted_text, result, input_type, filename, ... }
    const ts = new Date().toISOString();

    const entry = {
      id: crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
      ts,
      plan,
      ...meta, // property/developer/country/project/folder/tags
      input_type: payload.input_type || meta?.input_type || "text",
      filename: payload.filename || meta?.filename || null,
      extracted_text: payload.extracted_text || "",
      result: payload.result || payload,
    };

    setResult(entry);
    saveToHistory(entry);
    bumpUsageIfNeeded();
    setRoute("scan");
  }

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100">
      <TopNav
        route={route}
        setRoute={setRoute}
        plan={plan}
        setPlan={setPlan}
        usage={usage}
        freeLimit={freeLimit}
        canScan={canScan}
      />

      <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-6">
        {/* API Status strip */}
        <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${apiStatus.ok ? "bg-emerald-400" : apiStatus.ok === false ? "bg-rose-400" : "bg-slate-500"}`} />
              <span className="text-slate-200">
                API{" "}
                {apiStatus.ok === null ? "checking…" : apiStatus.ok ? "online" : "offline"}
              </span>
              {apiStatus.ok && apiStatus.info?.supported_uploads ? (
                <span className="text-slate-400">
                  • Uploads: {apiStatus.info.supported_uploads.join(", ")}
                </span>
              ) : null}
            </div>
            {apiStatus.err ? (
              <div className="text-rose-300 whitespace-pre-wrap">{apiStatus.err}</div>
            ) : (
              <div className="text-slate-400">
                {import.meta.env.VITE_API_BASE_URL || "VITE_API_BASE_URL not set"}
              </div>
            )}
          </div>
        </div>

        {route === "scan" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <ScanForm
                canScan={canScan}
                plan={plan}
                freeLeft={
                  plan === "basic"
                    ? Math.max(0, freeLimit - (usage.month === monthKey() ? usage.used : 0))
                    : null
                }
                setBusy={setBusy}
                setBusySteps={setBusySteps}
                onComplete={onScanComplete}
              />
            </div>

            <div className="lg:col-span-7">
              <ResultsPanel
                entry={result}
                allHistory={history}
                onGoCompare={() => setRoute("compare")}
              />
            </div>
          </div>
        )}

        {route === "history" && (
          <History history={history} setHistory={setHistory} />
        )}

        {route === "compare" && (
          <Compare history={history} />
        )}

        {route === "pricing" && <Pricing plan={plan} setPlan={setPlan} />}
        {route === "about" && <About />}
        {route === "faq" && <FAQ />}

        <footer className="mt-10 border-t border-white/10 pt-6 text-xs text-slate-400">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>© 2026 DeedSense • MVP (Render)</div>
            <div className="max-w-3xl">
              <span className="font-semibold text-slate-300">Disclaimer:</span>{" "}
              DeedSense provides risk signals based on text patterns and AI-assisted analysis. It is not legal advice, not
              a guarantee, and must be validated through official documents and due diligence.
            </div>
          </div>
        </footer>
      </main>

      <ProgressOverlay open={busy} steps={busySteps} />
    </div>
  );
}
