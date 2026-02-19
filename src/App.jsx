import React, { useEffect, useMemo, useRef, useState } from "react";
import jsPDF from "jspdf";

/**
 * DeedSense UI (MVP)
 * - Guest scans: 5 free scans stored in localStorage per browser
 * - Optional sign-in (local-only for MVP)
 * - Upload TXT + paste text
 * - Calls API: POST {API_BASE}/analyze
 * - Downloads results to PDF
 */

const API_BASE =
  (import.meta?.env?.VITE_API_BASE?.trim() || "https://deedsense-api.onrender.com").replace(/\/$/, "");

const LS = {
  scansUsed: "deedsense_scans_used_v1",
  user: "deedsense_user_v1",
};

const FREE_SCANS = 5;

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function safeJsonParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

function formatPct(x) {
  if (typeof x !== "number" || Number.isNaN(x)) return "—";
  return `${Math.round(clamp(x, 0, 1) * 100)}%`;
}

function getRiskLabel(score01) {
  const s = clamp(score01 ?? 0, 0, 1);
  if (s < 0.25) return { label: "Low", badge: "bg-emerald-50 text-emerald-700 ring-emerald-200" };
  if (s < 0.55) return { label: "Medium", badge: "bg-amber-50 text-amber-700 ring-amber-200" };
  return { label: "High", badge: "bg-rose-50 text-rose-700 ring-rose-200" };
}

function LogoMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white grid place-items-center shadow-soft">
        <span className="font-semibold tracking-tight">DS</span>
      </div>
      <div className="leading-tight">
        <div className="text-lg font-semibold tracking-tight">DeedSense</div>
        <div className="text-xs text-slate-500 -mt-0.5">Trust & Manipulation Scanner</div>
      </div>
    </div>
  );
}

function TopNav({ active, onNav, user, onOpenSignIn }) {
  const items = [
    { key: "scan", label: "Scan" },
    { key: "history", label: "Scan History" },
    { key: "pricing", label: "Pricing" },
    { key: "about", label: "About" },
  ];

  return (
    <div className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/75 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <button onClick={() => onNav("scan")} className="text-left">
          <LogoMark />
        </button>

        <div className="hidden md:flex items-center gap-2">
          {items.map((it) => (
            <button
              key={it.key}
              onClick={() => onNav(it.key)}
              className={[
                "px-3 py-2 rounded-xl text-sm font-medium transition",
                active === it.key
                  ? "bg-slate-900 text-white shadow-soft"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
              ].join(" ")}
            >
              {it.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 text-slate-700">
              <span className="text-sm font-medium">{user.email}</span>
              <span className="text-xs text-slate-500">• signed in</span>
            </div>
          ) : (
            <button
              onClick={onOpenSignIn}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-semibold"
            >
              Sign in
            </button>
          )}

          <div className="md:hidden">
            <MobileMenu active={active} onNav={onNav} />
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileMenu({ active, onNav }) {
  const [open, setOpen] = useState(false);
  const items = [
    { key: "scan", label: "Scan" },
    { key: "history", label: "Scan History" },
    { key: "pricing", label: "Pricing" },
    { key: "about", label: "About" },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="px-3 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold shadow-soft"
      >
        MENU
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-slate-200 bg-white shadow-soft overflow-hidden">
          {items.map((it) => (
            <button
              key={it.key}
              onClick={() => {
                onNav(it.key);
                setOpen(false);
              }}
              className={[
                "w-full text-left px-4 py-3 text-sm font-medium transition",
                active === it.key ? "bg-slate-900 text-white" : "hover:bg-slate-50 text-slate-700",
              ].join(" ")}
            >
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Banner({ scansLeft, scansUsed, user, onResetDev }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-soft overflow-hidden">
      <div className="px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div className="text-sm text-slate-700">
          <span className="font-semibold">Free scans:</span>{" "}
          <span className="font-semibold">{scansLeft}</span>
          <span className="text-slate-400"> / {FREE_SCANS}</span>{" "}
          <span className="text-slate-400">•</span>{" "}
          <span className="text-slate-600">
            {user ? "Signed-in mode active." : "Guest mode active."}
          </span>{" "}
          {!user && (
            <span className="text-slate-600">
              <span className="text-slate-400"> </span>
              <span className="font-medium">Sign in</span> for continuity across devices.
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:block text-xs text-slate-500">
            API: <span className="font-mono">{API_BASE.replace(/^https?:\/\//, "")}</span>
          </div>
          <button
            onClick={onResetDev}
            className="px-3 py-2 rounded-xl text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50"
            title="Dev only: resets guest scans in this browser"
          >
            Reset free scans (dev)
          </button>
        </div>
      </div>

      <div className="px-4 py-3 bg-slate-50 border-t border-slate-200">
        <div className="text-sm">
          <span className="font-semibold text-slate-800">Disclaimer:</span>{" "}
          <span className="text-slate-600">
            DeedSense provides a risk signal based on text patterns and AI analysis. It is{" "}
            <span className="font-semibold">not legal advice</span>, not a guarantee, and should be validated with
            official documents and due diligence.
          </span>
        </div>
      </div>
    </div>
  );
}

function Card({ title, subtitle, children, right }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-soft">
      <div className="px-5 py-4 border-b border-slate-200 flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-slate-900">{title}</div>
          {subtitle && <div className="mt-1 text-xs text-slate-500">{subtitle}</div>}
        </div>
        {right}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function RiskGauge({ riskScore01 }) {
  const s = clamp(typeof riskScore01 === "number" ? riskScore01 : 0, 0, 1);
  const angle = -90 + s * 180; // from -90 (left) to +90 (right)
  const { label, badge } = getRiskLabel(s);

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-24 w-48">
        <svg viewBox="0 0 200 120" className="h-24 w-48">
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#e2e8f0" strokeWidth="16" />
          <path d="M 20 100 A 80 80 0 0 1 90 30" fill="none" stroke="#22c55e" strokeWidth="16" />
          <path d="M 90 30 A 80 80 0 0 1 140 50" fill="none" stroke="#f59e0b" strokeWidth="16" />
          <path d="M 140 50 A 80 80 0 0 1 180 100" fill="none" stroke="#ef4444" strokeWidth="16" />
          <g transform={`translate(100 100) rotate(${angle})`}>
            <line x1="0" y1="0" x2="70" y2="0" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
            <circle cx="0" cy="0" r="7" fill="#0f172a" />
          </g>
        </svg>
        <div className="absolute inset-x-0 bottom-0 text-center text-xs text-slate-500">
          Risk score: <span className="font-semibold text-slate-800">{formatPct(s)}</span>
        </div>
      </div>

      <div className="min-w-[120px]">
        <div className="text-sm font-semibold text-slate-900">Confidence</div>
        <div className="mt-1 text-xs text-slate-500">How strong the signal is</div>
        <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full ring-1 ${badge}`}>
          <span className="text-sm font-semibold">{label}</span>
        </div>
      </div>
    </div>
  );
}

function SignInModal({ open, onClose, onSignIn }) {
  const [email, setEmail] = useState("");
  const [agree, setAgree] = useState(true);

  useEffect(() => {
    if (!open) return;
    setEmail("");
    setAgree(true);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-soft border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Sign in (MVP)</div>
            <div className="text-xs text-slate-500 mt-1">This is a lightweight demo sign-in stored in your browser.</div>
          </div>
          <button onClick={onClose} className="px-3 py-2 rounded-xl hover:bg-slate-100 text-sm font-semibold">
            ✕
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="you@company.com"
              type="email"
            />
          </div>

          <label className="flex items-start gap-3 text-xs text-slate-600">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              I understand DeedSense provides risk signals only, not legal advice. I will verify with documents and due
              diligence.
            </span>
          </label>

          <button
            onClick={() => onSignIn(email)}
            disabled={!email || !agree}
            className={[
              "w-full px-4 py-2.5 rounded-xl text-sm font-semibold shadow-soft transition",
              !email || !agree
                ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-95",
            ].join(" ")}
          >
            Continue
          </button>

          <div className="text-[11px] text-slate-500 leading-relaxed">
            Note: This MVP sign-in is not a secure auth system. For production, use OAuth (Google/Apple), JWT sessions,
            and a real database.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [active, setActive] = useState("scan");
  const [signInOpen, setSignInOpen] = useState(false);
  const [user, setUser] = useState(() => safeJsonParse(localStorage.getItem(LS.user) || "null"));

  const [scansUsed, setScansUsed] = useState(() => {
    const n = Number(localStorage.getItem(LS.scansUsed) || "0");
    return Number.isFinite(n) ? n : 0;
  });

  const scansLeft = Math.max(0, FREE_SCANS - scansUsed);

  const [pasteText, setPasteText] = useState("");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [result, setResult] = useState(null);

  const fileInputRef = useRef(null);

  const canScan = useMemo(() => {
    const hasText = (pasteText || "").trim().length > 10;
    if (user) return hasText; // signed-in: unlimited in MVP UI (your API may still have costs)
    return hasText && scansLeft > 0;
  }, [pasteText, scansLeft, user]);

  // Save history in-memory (MVP). You can wire to backend later.
  const [history, setHistory] = useState([]);

  function onNav(key) {
    setActive(key);
    setErr("");
  }

  function resetGuestScansDev() {
    localStorage.setItem(LS.scansUsed, "0");
    setScansUsed(0);
  }

  function signIn(email) {
    const u = { email: email.trim().toLowerCase(), at: new Date().toISOString() };
    localStorage.setItem(LS.user, JSON.stringify(u));
    setUser(u);
    setSignInOpen(false);
  }

  function signOut() {
    localStorage.removeItem(LS.user);
    setUser(null);
  }

  async function readTxtFile(file) {
    // MVP: only text-like files
    const text = await file.text();
    return text;
  }

  async function onPickFile(e) {
    setErr("");
    const f = e.target.files?.[0];
    if (!f) return;

    setFileName(f.name);

    // For MVP, accept txt/markdown/json/csv etc.
    const ok =
      f.type.startsWith("text/") ||
      /\.(txt|md|csv|json|log)$/i.test(f.name);

    if (!ok) {
      setErr("For MVP, upload TXT/MD/CSV/JSON only. For PDF/DOCX, add server-side extraction later.");
      return;
    }

    const text = await readTxtFile(f);
    setPasteText(text.slice(0, 250000)); // safety cap
  }

  async function runScan() {
    setErr("");
    setResult(null);

    const content = (pasteText || "").trim();
    if (content.length <= 10) {
      setErr("Paste at least a few lines of content to analyze.");
      return;
    }

    if (!user && scansLeft <= 0) {
      setErr("Guest free scans are finished. Sign in to continue (or reset dev scans).");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        text: content,
        meta: {
          product: "DeedSense",
          mode: user ? "signed_in" : "guest",
          source: "ui",
        },
      };

      const r = await fetch(`${API_BASE}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await r.json().catch(() => ({}));

      if (!r.ok) {
        const msg = data?.detail || data?.error || `Request failed (${r.status})`;
        throw new Error(msg);
      }

      // Normalize expected fields (works even if your API returns different names)
      const normalized = normalizeResult(data);

      setResult(normalized);

      // guest scan count
      if (!user) {
        const next = scansUsed + 1;
        localStorage.setItem(LS.scansUsed, String(next));
        setScansUsed(next);
      }

      // add to history (MVP local)
      setHistory((h) => [
        {
          id: crypto.randomUUID(),
          at: new Date().toISOString(),
          preview: content.slice(0, 120),
          result: normalized,
        },
        ...h,
      ]);
    } catch (e) {
      setErr(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  function normalizeResult(raw) {
    // Try common shapes:
    // - { summary, risk_score, confidence, signals: [], scores: {...}, details }
    // - { result: {...} }
    const r = raw?.result ? raw.result : raw;

    const riskScore =
      typeof r?.risk_score === "number"
        ? r.risk_score
        : typeof r?.riskScore === "number"
        ? r.riskScore
        : typeof r?.scores?.overall === "number"
        ? r.scores.overall
        : 0.35;

    const confidence =
      typeof r?.confidence === "number"
        ? r.confidence
        : typeof r?.confidence_score === "number"
        ? r.confidence_score
        : 0.6;

    const summary =
      r?.summary ||
      r?.actionable_summary ||
      "Risk signals generated. Review highlights and verify against official documents.";

    const signals =
      Array.isArray(r?.signals) ? r.signals :
      Array.isArray(r?.risk_signals) ? r.risk_signals :
      Array.isArray(r?.flags) ? r.flags :
      [];

    const details =
      r?.details ||
      r?.analysis ||
      r?.explanation ||
      "";

    const scores = (r?.scores && typeof r.scores === "object") ? r.scores : null;

    return {
      summary,
      risk_score: clamp(riskScore, 0, 1),
      confidence: clamp(confidence, 0, 1),
      signals: signals.slice(0, 12),
      details,
      scores,
      raw: r
    };
  }

  function downloadPDF() {
    if (!result) return;

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 48;
    let y = margin;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("DeedSense Report", margin, y);
    y += 18;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y);
    y += 18;

    doc.setTextColor(20);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Summary", margin, y);
    y += 14;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const summaryLines = doc.splitTextToSize(result.summary || "", 500);
    doc.text(summaryLines, margin, y);
    y += summaryLines.length * 14 + 10;

    doc.setFont("helvetica", "bold");
    doc.text("Scores", margin, y);
    y += 14;

    doc.setFont("helvetica", "normal");
    doc.text(`Risk score: ${Math.round(result.risk_score * 100)}%`, margin, y);
    y += 14;
    doc.text(`Confidence: ${Math.round(result.confidence * 100)}%`, margin, y);
    y += 18;

    doc.setFont("helvetica", "bold");
    doc.text("Signals", margin, y);
    y += 14;

    doc.setFont("helvetica", "normal");
    const sigs = (result.signals || []).length ? result.signals : ["No explicit signals returned."];
    sigs.forEach((s) => {
      const line = typeof s === "string" ? `• ${s}` : `• ${s?.title || s?.label || "Signal"}`;
      const wrapped = doc.splitTextToSize(line, 500);
      doc.text(wrapped, margin, y);
      y += wrapped.length * 14;
      if (y > 740) {
        doc.addPage();
        y = margin;
      }
    });

    y += 12;
    doc.setTextColor(120);
    doc.setFontSize(9);
    doc.text(
      "Disclaimer: DeedSense provides risk signals only. Not legal advice. Verify with official documents and due diligence.",
      margin,
      y
    );

    doc.save("deedsense-report.pdf");
  }

  return (
    <div className="min-h-screen">
      <TopNav
        active={active}
        onNav={onNav}
        user={user}
        onOpenSignIn={() => setSignInOpen(true)}
      />

      <SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} onSignIn={signIn} />

      {/* Hero */}
      <div className="mx-auto max-w-6xl px-4 pt-10 pb-6">
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 shadow-soft overflow-hidden">
          <div className="px-6 py-8 md:px-10 md:py-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-100 text-xs font-semibold">
                UAE + Global Property Investors
                <span className="text-blue-300">•</span>
                Detect manipulation
                <span className="text-blue-300">•</span>
                Summarize risks fast
              </div>

              <h1 className="mt-4 text-2xl md:text-4xl font-semibold tracking-tight text-slate-900">
                Trust & Manipulation Risk Scanner for Property Investors
              </h1>

              <p className="mt-3 text-slate-600 leading-relaxed">
                Paste a listing description, broker WhatsApp message, payment plan terms, or deed notes.
                DeedSense highlights urgency tactics, missing specifics, contradictions, and risk signals — so you can
                ask sharper questions before paying anything.
              </p>

              <div className="mt-5">
                <Banner scansLeft={scansLeft} scansUsed={scansUsed} user={user} onResetDev={resetGuestScansDev} />
              </div>

              {user && (
                <div className="mt-3">
                  <button
                    onClick={signOut}
                    className="text-sm font-semibold text-slate-600 hover:text-slate-900"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="mx-auto max-w-6xl px-4 pb-16">
        {active === "scan" && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Input */}
            <div className="lg:col-span-2 space-y-6">
              <Card
                title="Scan a Listing / Deed / Message"
                subtitle="Upload TXT (best for MVP) or paste content below"
                right={
                  <div className="text-xs text-slate-500">
                    <span className="font-semibold">API:</span>{" "}
                    <span className="font-mono">{API_BASE.replace(/^https?:\/\//, "")}</span>
                  </div>
                }
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-4 text-left transition"
                    >
                      <div className="text-sm font-semibold text-slate-900">Upload Document</div>
                      <div className="mt-1 text-xs text-slate-500">TXT/MD/CSV/JSON</div>
                      <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                        {fileName ? fileName : "No file chosen"}
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        const example = `Broker: "Price will increase tonight. Pay 10% now to lock it."
Payment plan: "2% monthly until handover" (no dates mentioned)
Listing: "Direct from developer" but also "commission applies"`;
                        setPasteText(example);
                        setErr("");
                      }}
                      className="rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-4 text-left transition"
                    >
                      <div className="text-sm font-semibold text-slate-900">Quick Example</div>
                      <div className="mt-1 text-xs text-slate-500">Loads a sample text</div>
                      <div className="mt-3 text-xs text-slate-500">
                        Great for testing your API end-to-end.
                      </div>
                    </button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.md,.csv,.json,.log,text/plain,text/markdown,text/csv,application/json"
                    className="hidden"
                    onChange={onPickFile}
                  />

                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-700">Paste content</label>
                      <button
                        onClick={() => {
                          setPasteText("");
                          setFileName("");
                          setErr("");
                          setResult(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-900"
                      >
                        Clear
                      </button>
                    </div>

                    <textarea
                      value={pasteText}
                      onChange={(e) => setPasteText(e.target.value)}
                      placeholder="Paste listing description, broker message, deed notes, payment plan terms, WhatsApp chat, etc..."
                      className="mt-2 w-full min-h-[220px] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                    />
                    <div className="mt-2 text-[11px] text-slate-500">
                      Tip: paste the broker’s message + payment plan + urgency language.
                    </div>
                  </div>

                  {err && (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                      <span className="font-semibold">Error:</span> {err}
                    </div>
                  )}

                  <button
                    onClick={runScan}
                    disabled={!canScan || loading}
                    className={[
                      "w-full rounded-2xl px-4 py-3 text-sm font-semibold shadow-soft transition",
                      !canScan || loading
                        ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-95",
                    ].join(" ")}
                  >
                    {loading ? "Scanning..." : user ? "Scan Now" : `Scan (Free ${scansLeft})`}
                  </button>

                  <div className="text-[11px] text-slate-500 leading-relaxed">
                    Guest mode: up to <span className="font-semibold">{FREE_SCANS}</span> scans per browser.
                    Signed-in users can continue (MVP UI).
                    <br />
                    We recommend adding real auth + database for production.
                  </div>
                </div>
              </Card>

              <Card
                title="Usage note"
                subtitle="Designed for investors to spot manipulation patterns quickly"
              >
                <ul className="list-disc pl-5 text-sm text-slate-600 space-y-2">
                  <li>Identify urgency pressure, missing specifics, vague claims, contradictions.</li>
                  <li>Use as a pre-screen before calls, booking forms, deposits, or transfers.</li>
                  <li>
                    Always verify through official documents, escrow/payment proof, and legal due diligence.
                  </li>
                </ul>
              </Card>
            </div>

            {/* Results */}
            <div className="lg:col-span-3 space-y-6">
              <Card
                title="Results"
                subtitle="Actionable summary + risk signals + confidence"
                right={
                  <div className="flex items-center gap-2">
                    <button
                      onClick={downloadPDF}
                      disabled={!result}
                      className={[
                        "px-3 py-2 rounded-xl text-sm font-semibold border transition",
                        result
                          ? "border-slate-200 bg-white hover:bg-slate-50"
                          : "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed",
                      ].join(" ")}
                    >
                      Download PDF
                    </button>
                  </div>
                }
              >
                {!result ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
                    <div className="text-sm font-semibold text-slate-900">Run a scan to see results here.</div>
                    <div className="mt-2 text-sm text-slate-600">
                      Paste the listing + payment plan + urgency language, then scan.
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="text-sm font-semibold text-slate-900">Summary</div>
                        <div className="mt-2 text-sm text-slate-700 leading-relaxed">
                          {result.summary}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <RiskGauge riskScore01={result.risk_score} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="text-sm font-semibold text-slate-900">Risk Signals</div>
                        <div className="mt-2 text-xs text-slate-500">
                          Flags you should question before paying anything
                        </div>

                        <div className="mt-4 space-y-2">
                          {(result.signals || []).length === 0 ? (
                            <div className="text-sm text-slate-500">
                              No explicit signals returned by API.
                            </div>
                          ) : (
                            result.signals.map((s, i) => {
                              const title = typeof s === "string" ? s : (s?.title || s?.label || "Signal");
                              const sev = typeof s === "object" ? (s?.severity || s?.level) : null;

                              const pill =
                                sev === "high"
                                  ? "bg-rose-50 text-rose-700 ring-rose-200"
                                  : sev === "medium"
                                  ? "bg-amber-50 text-amber-700 ring-amber-200"
                                  : "bg-slate-50 text-slate-700 ring-slate-200";

                              return (
                                <div
                                  key={i}
                                  className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2"
                                >
                                  <div className="text-sm text-slate-800">{title}</div>
                                  <div className={`shrink-0 px-2 py-1 rounded-full ring-1 text-xs font-semibold ${pill}`}>
                                    {sev ? String(sev).toUpperCase() : "FLAG"}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="text-sm font-semibold text-slate-900">Details</div>
                        <div className="mt-2 text-xs text-slate-500">
                          Extra explanation (if your API returns it)
                        </div>

                        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <pre className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                            {result.details ? result.details : "No detailed explanation returned yet."}
                          </pre>
                        </div>

                        <div className="mt-4 text-[11px] text-slate-500 leading-relaxed">
                          If your API returns structured scores like{" "}
                          <span className="font-mono">scores: {"{ overall, urgency, ambiguity, contradiction }"}</span>,
                          we can add beautiful charts next.
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="text-xs text-slate-600 leading-relaxed">
                        <span className="font-semibold text-slate-800">Reminder:</span> This is a risk signal, not a verdict.
                        Verify via official documents, developer confirmations, escrow/payment proof, and legal due diligence.
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              <Card
                title="Scan History (MVP)"
                subtitle="Stored only in this browser session (wire to DB later)"
              >
                {history.length === 0 ? (
                  <div className="text-sm text-slate-600">
                    No history yet. Run a scan to populate this list.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {history.slice(0, 6).map((h) => (
                      <button
                        key={h.id}
                        onClick={() => setResult(h.result)}
                        className="w-full text-left rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-3 transition"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-semibold text-slate-900">
                            {new Date(h.at).toLocaleString()}
                          </div>
                          <div className="text-xs text-slate-500">
                            Risk: <span className="font-semibold text-slate-800">{formatPct(h.result?.risk_score)}</span>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-slate-600">
                          {h.preview}{h.preview.length >= 120 ? "…" : ""}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}

        {active === "history" && (
          <div className="space-y-6">
            <Card title="Scan History" subtitle="MVP history list (browser session)">
              <div className="text-sm text-slate-600">
                For production: store history in Postgres per user + allow filtering by project/developer/country.
              </div>
            </Card>
          </div>
        )}

        {active === "pricing" && (
          <div className="space-y-6">
            <Card title="Pricing (suggested)" subtitle="Investor-first, then expand to B2B">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="text-sm font-semibold">Free</div>
                  <div className="mt-1 text-xs text-slate-500">Guest mode</div>
                  <div className="mt-4 text-3xl font-semibold">0</div>
                  <ul className="mt-4 text-sm text-slate-600 space-y-2 list-disc pl-5">
                    <li>{FREE_SCANS} scans per browser</li>
                    <li>Basic signals</li>
                    <li>PDF export</li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-soft">
                  <div className="text-sm font-semibold text-blue-900">Pro</div>
                  <div className="mt-1 text-xs text-blue-700">Individual investors</div>
                  <div className="mt-4 text-3xl font-semibold text-blue-900">$19</div>
                  <div className="text-xs text-blue-700">/ month</div>
                  <ul className="mt-4 text-sm text-blue-900/80 space-y-2 list-disc pl-5">
                    <li>Unlimited scans</li>
                    <li>Saved history</li>
                    <li>Comparisons across listings</li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="text-sm font-semibold">Enterprise API</div>
                  <div className="mt-1 text-xs text-slate-500">Agencies + portals</div>
                  <div className="mt-4 text-3xl font-semibold">Custom</div>
                  <ul className="mt-4 text-sm text-slate-600 space-y-2 list-disc pl-5">
                    <li>API keys + rate limits</li>
                    <li>Audit logs</li>
                    <li>On-prem / VPC options</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        )}

        {active === "about" && (
          <div className="space-y-6">
            <Card title="About DeedSense" subtitle="What it is (and what it is not)">
              <div className="text-sm text-slate-600 leading-relaxed space-y-3">
                <p>
                  DeedSense is designed for UAE and global property investors to detect manipulation and risk signals in
                  listing text, broker messages, and payment terms.
                </p>
                <p>
                  It does <span className="font-semibold">not</span> replace legal due diligence. It helps you ask better
                  questions earlier.
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 text-center text-xs text-slate-500">
          © 2026 DeedSense • Built on Render • MVP UI <br />
          Not legal advice • Use at your own risk
        </div>
      </div>
    </div>
  );
}
