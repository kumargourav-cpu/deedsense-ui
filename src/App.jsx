import React, { useMemo, useState } from "react";

const API_BASE = "https://deedsense-api.onrender.com";

function classNames(...xs) {
  return xs.filter(Boolean).join(" ");
}

export default function App() {
  const [activeTab, setActiveTab] = useState("scan"); // scan | history | pricing | about
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [result, setResult] = useState(null);

  const [connected, setConnected] = useState(false);
  const [checking, setChecking] = useState(false);

  const canScan = useMemo(() => {
    return !loading && (text.trim().length > 0 || !!file);
  }, [loading, text, file]);

  async function checkHealth() {
    try {
      setChecking(true);
      const r = await fetch(`${API_BASE}/health`, { method: "GET" });
      const j = await r.json();
      setConnected(Boolean(j?.ok));
    } catch {
      setConnected(false);
    } finally {
      setChecking(false);
    }
  }

  React.useEffect(() => {
    checkHealth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onScan() {
    setApiError("");
    setResult(null);

    if (!canScan) return;

    try {
      setLoading(true);

      // If file is selected → upload endpoint
      if (file) {
        const fd = new FormData();
        fd.append("file", file);

        const r = await fetch(`${API_BASE}/analyze-file`, {
          method: "POST",
          body: fd,
        });

        const j = await r.json();
        if (!r.ok) {
          throw new Error(j?.detail || "Upload scan failed");
        }
        setResult(j);
        return;
      }

      // Else text-only endpoint
      const r = await fetch(`${API_BASE}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, source: "text" }),
      });

      const j = await r.json();
      if (!r.ok) {
        throw new Error(j?.detail || "Text scan failed");
      }
      setResult(j);
    } catch (e) {
      setApiError(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function resetInputs() {
    setText("");
    setFile(null);
    setResult(null);
    setApiError("");
  }

  const risk = result?.result?.overall_risk_score ?? null;
  const confidence = result?.result?.confidence ?? null;
  const summary = result?.result?.summary ?? null;
  const scores = result?.result?.scores ?? null;
  const signals = result?.result?.signals ?? null;
  const recommendations = result?.result?.recommendations ?? null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-lg shadow-indigo-500/20">
              <span className="font-black">DS</span>
            </div>
            <div>
              <div className="text-lg font-semibold leading-tight">DeedSense</div>
              <div className="text-xs text-slate-400">
                Trust & Manipulation Risk Scanner for Property Investors
              </div>
            </div>
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            {[
              { id: "scan", label: "Scan" },
              { id: "history", label: "History" },
              { id: "pricing", label: "Pricing" },
              { id: "about", label: "About" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={classNames(
                  "rounded-xl px-4 py-2 text-sm transition",
                  activeTab === t.id
                    ? "bg-white/10 text-white"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                )}
              >
                {t.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs">
              <span
                className={classNames(
                  "inline-flex h-2 w-2 rounded-full",
                  connected ? "bg-emerald-400" : "bg-rose-400"
                )}
              />
              <span className="text-slate-400">
                {checking ? "Checking…" : connected ? "Connected" : "Disconnected"}
              </span>
            </div>
            <button className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10">
              Sign in
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="mx-auto max-w-6xl px-4 pb-3 md:hidden">
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: "scan", label: "Scan" },
              { id: "history", label: "History" },
              { id: "pricing", label: "Pricing" },
              { id: "about", label: "About" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={classNames(
                  "rounded-xl px-3 py-2 text-xs transition",
                  activeTab === t.id ? "bg-white/10" : "bg-white/5 hover:bg-white/10"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {activeTab === "scan" && (
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Left: Input */}
            <section className="lg:col-span-7">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/20">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">Scan a Listing / Deed / Message</h2>
                    <p className="mt-1 text-sm text-slate-400">
                      UAE + international property investors • detect manipulation • summarize risks
                    </p>
                  </div>
                  <button
                    onClick={resetInputs}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs hover:bg-white/10"
                  >
                    Clear
                  </button>
                </div>

                {/* Upload */}
                <div className="mt-5 grid gap-3">
                  <label className="text-sm font-medium text-slate-200">Upload</label>
                  <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-4">
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt,image/png,image/jpeg"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-xl file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-white/15"
                    />
                    <p className="mt-2 text-xs text-slate-400">
                      Supports PDF (including scanned), DOCX, TXT, JPG, PNG
                    </p>
                    {file && (
                      <div className="mt-3 text-xs text-slate-300">
                        Selected: <span className="font-semibold">{file.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Or paste text */}
                <div className="mt-6 grid gap-3">
                  <label className="text-sm font-medium text-slate-200">Paste content</label>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={10}
                    placeholder="Paste listing description, broker message, deed notes, payment plan terms, WhatsApp chat, etc..."
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs text-slate-400">
                      Tip: paste broker message + payment plan + any urgency language.
                    </div>
                    <button
                      onClick={onScan}
                      disabled={!canScan}
                      className={classNames(
                        "rounded-xl px-5 py-2 text-sm font-semibold transition",
                        canScan
                          ? "bg-gradient-to-r from-indigo-500 to-cyan-400 text-slate-950 hover:opacity-95"
                          : "bg-white/10 text-slate-400 cursor-not-allowed"
                      )}
                    >
                      {loading ? "Scanning…" : "Scan"}
                    </button>
                  </div>

                  {apiError && (
                    <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-200">
                      {apiError}
                      <div className="mt-2 text-xs text-rose-200/80">
                        If uploading fails, confirm your API is live and CORS is set correctly.
                      </div>
                    </div>
                  )}
                </div>

                {/* Disclaimer */}
                <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-sm font-semibold">Disclaimer</div>
                  <p className="mt-1 text-xs text-slate-400">
                    DeedSense provides a risk signal based on text patterns and AI analysis. It is not legal advice,
                    not a guarantee, and should be validated with documents and due diligence.
                  </p>
                </div>
              </div>
            </section>

            {/* Right: Results */}
            <section className="lg:col-span-5">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/20">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Results</h3>
                    <p className="mt-1 text-sm text-slate-400">
                      Actionable summary + risk signals + confidence
                    </p>
                  </div>
                  <button
                    onClick={checkHealth}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs hover:bg-white/10"
                  >
                    Refresh status
                  </button>
                </div>

                {!result && (
                  <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/30 p-4 text-sm text-slate-400">
                    Run a scan to see results here.
                  </div>
                )}

                {result && (
                  <div className="mt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                        <div className="text-xs text-slate-400">Overall risk</div>
                        <div className="mt-1 text-2xl font-bold">
                          {risk !== null ? `${risk}/100` : "—"}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                        <div className="text-xs text-slate-400">Confidence</div>
                        <div className="mt-1 text-2xl font-bold">
                          {confidence !== null ? `${Math.round(confidence * 100)}%` : "—"}
                        </div>
                      </div>
                    </div>

                    {result?.extraction_method && (
                      <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4 text-sm">
                        <div className="text-xs text-slate-400">Extraction method</div>
                        <div className="mt-1 font-semibold text-slate-200">
                          {result.extraction_method}
                        </div>
                        <div className="mt-1 text-xs text-slate-400">
                          (pdf_text_layer = selectable text, pdf_ocr = scanned PDF OCR)
                        </div>
                      </div>
                    )}

                    {summary && (
                      <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                        <div className="text-sm font-semibold">Summary</div>
                        <div className="mt-2 text-sm text-slate-200 whitespace-pre-wrap">
                          {typeof summary === "string" ? summary : JSON.stringify(summary, null, 2)}
                        </div>
                      </div>
                    )}

                    {scores && (
                      <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                        <div className="text-sm font-semibold">Scores</div>
                        <div className="mt-3 space-y-2">
                          {Object.entries(scores).map(([k, v]) => {
                            const n = Number(v) || 0;
                            return (
                              <div key={k}>
                                <div className="flex items-center justify-between text-xs text-slate-400">
                                  <span className="capitalize">{k.replaceAll("_", " ")}</span>
                                  <span className="text-slate-300">{n}</span>
                                </div>
                                <div className="mt-1 h-2 w-full rounded-full bg-white/10">
                                  <div
                                    className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                                    style={{ width: `${Math.min(100, Math.max(0, n))}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {Array.isArray(signals) && signals.length > 0 && (
                      <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                        <div className="text-sm font-semibold">Signals</div>
                        <div className="mt-3 space-y-3">
                          {signals.slice(0, 6).map((s, idx) => (
                            <div key={idx} className="rounded-xl border border-white/10 bg-white/5 p-3">
                              <div className="text-sm font-semibold text-slate-200">
                                {s?.label || "Signal"}
                              </div>
                              {s?.evidence && (
                                <div className="mt-1 text-xs text-slate-300">
                                  “{s.evidence}”
                                </div>
                              )}
                              {s?.why_it_matters && (
                                <div className="mt-2 text-xs text-slate-400">
                                  {s.why_it_matters}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {Array.isArray(recommendations) && recommendations.length > 0 && (
                      <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                        <div className="text-sm font-semibold">Recommendations</div>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-200">
                          {recommendations.slice(0, 8).map((r, idx) => (
                            <li key={idx}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-400">
                      Usage note: Designed for investors to quickly spot manipulation and risk signals in listing text,
                      broker messages, and payment terms. Always verify via official documents, escrow/payment proof,
                      and legal due diligence.
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {activeTab === "history" && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold">Scan History</h2>
            <p className="mt-2 text-sm text-slate-400">
              In production, history should be stored per signed-in user (e.g., Postgres) and filterable by
              developer/project/country. For this MVP UI, enable after auth.
            </p>
            <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/30 p-4 text-sm text-slate-400">
              No history available in guest mode.
            </div>
          </div>
        )}

        {activeTab === "pricing" && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold">Pricing</h2>
            <p className="mt-2 text-sm text-slate-400">Add your pricing tiers here.</p>
          </div>
        )}

        {activeTab === "about" && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold">About</h2>
            <p className="mt-2 text-sm text-slate-400">
              DeedSense is a trust & manipulation risk scanner for property investors. It surfaces risk signals from
              listings, broker messages, and payment terms to improve due diligence.
            </p>
          </div>
        )}

        <footer className="mt-10 text-center text-xs text-slate-500">
          © 2026 DeedSense • MVP UI • Not legal advice • Use at your own risk
        </footer>
      </main>
    </div>
  );
}
