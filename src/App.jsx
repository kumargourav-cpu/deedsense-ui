// src/App.jsx
import React, { useEffect, useMemo, useState } from "react";
import TopNav from "./components/TopNav";
import ScanForm from "./components/ScanForm";
import ResultsPanel from "./components/ResultsPanel";
import History from "./components/History";
import Pricing from "./components/Pricing";
import About from "./components/About";
import FAQ from "./components/FAQ";
import AuthModal from "./components/AuthModal";
import LanguagePrompt from "./components/LanguagePrompt";

import { analyzeText, extractFile } from "./lib/api";
import { detectLanguageHeuristic, LANGUAGE_CHOICES } from "./lib/lang";

const LS_HISTORY = "deedsense_history_v1";
const LS_FREE = "deedsense_free_scans_v1";
const LS_LANG = "deedsense_lang_pref_v1";
const FREE_LIMIT = 5;

function loadHistory() {
  try {
    const v = JSON.parse(localStorage.getItem(LS_HISTORY) || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function saveHistory(items) {
  localStorage.setItem(LS_HISTORY, JSON.stringify(items.slice(0, 50)));
}

function loadFreeScans() {
  const raw = localStorage.getItem(LS_FREE);
  if (!raw) return FREE_LIMIT;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : FREE_LIMIT;
}

function saveFreeScans(n) {
  localStorage.setItem(LS_FREE, String(n));
}

function loadLangPref() {
  const raw = localStorage.getItem(LS_LANG);
  return raw || "en";
}

function saveLangPref(code) {
  localStorage.setItem(LS_LANG, code);
}

function makeId() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export default function App() {
  const [active, setActive] = useState("scan");

  const [user, setUser] = useState(null); // demo user object {email}
  const [authOpen, setAuthOpen] = useState(false);

  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState(null);
  const [extractedMeta, setExtractedMeta] = useState(null);

  const [history, setHistory] = useState(() => loadHistory());
  const [freeScansLeft, setFreeScansLeft] = useState(() => loadFreeScans());

  const [langPref, setLangPref] = useState(() => loadLangPref());
  const [langPromptOpen, setLangPromptOpen] = useState(false);
  const [detectedLang, setDetectedLang] = useState(null);

  const langLabel = useMemo(() => {
    return LANGUAGE_CHOICES.find((l) => l.code === langPref)?.name || "English";
  }, [langPref]);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  useEffect(() => {
    saveFreeScans(freeScansLeft);
  }, [freeScansLeft]);

  useEffect(() => {
    saveLangPref(langPref);
  }, [langPref]);

  function openHistoryItem(item) {
    setReport(item.report);
    setExtractedMeta(item.extractedMeta || null);
    setActive("scan");
  }

  function synthTitleFromText(t) {
    const s = (t || "").trim().replace(/\s+/g, " ");
    return s.slice(0, 64) + (s.length > 64 ? "…" : "");
  }

  async function handleUpload(file) {
    setError("");
    setReport(null);
    setExtractedMeta(null);

    setBusy(true);
    try {
      const res = await extractFile(file);
      const extractedText = res?.text || "";
      setText(extractedText);

      setExtractedMeta({
        source: file?.name || "upload",
        pages: res?.meta?.pages,
        ocr: res?.meta?.ocr,
      });

      // language detect prompt
      const det = detectLanguageHeuristic(extractedText);
      setDetectedLang(det);
      if (det?.code && det.code !== langPref) setLangPromptOpen(true);
    } catch (e) {
      setError(
        `Upload/extraction failed. Your API must expose POST /extract. Details: ${e?.message || e}`
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleScan() {
    setError("");
    setReport(null);

    const content = (text || "").trim();
    if (content.length < 30) {
      setError("Paste at least ~30 characters to scan.");
      return;
    }

    if (!user && freeScansLeft <= 0) {
      setError("Free scans are finished for guest mode. Please sign in to continue.");
      return;
    }

    // prompt language detection (only if user hasn't already chosen)
    const det = detectLanguageHeuristic(content);
    setDetectedLang(det);
    if (det?.code && det.code !== langPref) {
      setLangPromptOpen(true);
      // still continue with scan using current preference; user can change before next scan
    }

    setBusy(true);
    try {
      const r = await analyzeText({ text: content, preferred_language: langPref });
      setReport(r);

      const scores = r?.scores || {
        trust: r?.trust_score ?? 50,
        risk: r?.risk_score ?? 50,
        manipulation: r?.manipulation_score ?? 50,
      };

      const item = {
        id: makeId(),
        created_at: new Date().toISOString(),
        title: r?.title || "Scan",
        preview: synthTitleFromText(content),
        scores,
        report: r,
        extractedMeta,
      };

      setHistory((prev) => [item, ...prev].slice(0, 50));

      if (!user) setFreeScansLeft((n) => Math.max(0, n - 1));
    } catch (e) {
      setError(e?.message || "Scan failed.");
    } finally {
      setBusy(false);
    }
  }

  function signOut() {
    setUser(null);
  }

  return (
    <div className="min-h-screen">
      <TopNav
        brand="DeedSense"
        active={active}
        setActive={setActive}
        user={user}
        onSignIn={() => setAuthOpen(true)}
        onSignOut={signOut}
        freeScansLeft={user ? "∞" : freeScansLeft}
      />

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onFakeLogin={(u) => setUser(u)}
      />

      <LanguagePrompt
        open={langPromptOpen}
        detected={detectedLang}
        value={langPref}
        onChange={(code) => setLangPref(code)}
        onClose={() => setLangPromptOpen(false)}
      />

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* HERO */}
        <div className="mb-6">
          <div className="glass rounded-3xl p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-2xl font-extrabold tracking-tight">
                  Investor-grade trust & manipulation scanning
                </div>
                <div className="mt-2 max-w-3xl text-sm text-slate-300">
                  Paste a listing, broker message, payment plan terms, or upload a PDF/image.
                  DeedSense highlights persuasion tactics, hidden risk signals, and what to verify next.
                </div>
              </div>
              <div className="flex gap-2">
                <button className="btn-ghost" onClick={() => setActive("pricing")}>
                  View pricing
                </button>
                <button className="btn-primary" onClick={() => setActive("scan")}>
                  Start scanning
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* PAGES */}
        {active === "scan" ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-4">
              <ScanForm
                text={text}
                setText={setText}
                onScan={handleScan}
                onUpload={handleUpload}
                busy={busy}
                error={error}
                freeScansLeft={freeScansLeft}
                user={user}
                preferredLanguageLabel={langLabel}
              />
            </div>

            <div className="space-y-4">
              <ResultsPanel report={report} extractedMeta={extractedMeta} />
            </div>
          </div>
        ) : null}

        {active === "history" ? (
          <History items={history} onOpen={openHistoryItem} />
        ) : null}

        {active === "pricing" ? <Pricing /> : null}
        {active === "about" ? <About /> : null}
        {active === "faq" ? <FAQ /> : null}

        <div className="mt-8 text-center text-xs text-slate-500">
          © 2026 DeedSense • Not legal advice • Use at your own risk
        </div>
      </main>
    </div>
  );
}
