import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ---------- CONFIG ----------
const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "https://deedsense-api.onrender.com";

const FREE_SCANS_LIMIT = 5;
const LS_KEY = "deedsense_free_scans_used_v1";
const LS_AUTH = "deedsense_auth_v1";

// ---------- HELPERS ----------
function cn(...xs) {
  return xs.filter(Boolean).join(" ");
}

function nowISO() {
  return new Date().toISOString();
}

function safeJsonParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

function readTextFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = () => resolve(String(reader.result || ""));
    reader.readAsText(file);
  });
}

/**
 * Minimal PDF/DOCX handling for MVP:
 * - PDF/DOCX extraction in-browser usually needs extra libs.
 * - For “copy-paste ready MVP”, we do this:
 *   - If it's .txt/.md/.csv -> read text locally
 *   - If it's PDF/DOCX -> ask user to paste text OR upgrade later (backend extraction)
 */
function getFileTypeNotice(file) {
  const name = (file?.name || "").toLowerCase();
  if (name.endsWith(".pdf")) return "PDF detected. For best results in this MVP, paste the text OR implement backend PDF extraction.";
  if (name.endsWith(".doc") || name.endsWith(".docx")) return "DOC/DOCX detected. For best results in this MVP, paste the text OR implement backend DOCX extraction.";
  return "";
}

function getUsedFreeScans() {
  const raw = localStorage.getItem(LS_KEY);
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

function setUsedFreeScans(n) {
  localStorage.setItem(LS_KEY, String(n));
}

function getAuth() {
  const raw = localStorage.getItem(LS_AUTH);
  const obj = safeJsonParse(raw || "");
  if (obj && typeof obj === "object") return obj;
  return { isAuthed: false, email: "" };
}

function setAuth(authObj) {
  localStorage.setItem(LS_AUTH, JSON.stringify(authObj));
}

// Basic PDF report (no external libs) — prints as PDF via browser print dialog
function downloadAsPDF({ title, content }) {
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; padding: 24px; color: #0f172a; }
          h1 { margin: 0 0 12px; font-size: 20px; }
          .meta { color: #334155; font-size: 12px; margin-bottom: 16px; }
          pre { white-space: pre-wrap; word-wrap: break-word; background: #f1f5f9; padding: 14px; border-radius: 12px; border: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <div class="meta">Generated: ${new Date().toLocaleString()}</div>
        <pre>${content}</pre>
        <script>
          setTimeout(() => {
            window.print();
          }, 250);
        </script>
      </body>
    </html>
  `);
  w.document.close();
}

// ---------- MAIN APP ----------
export default function App() {
  const [auth, setAuthState] = useState(getAuth());
  const [activeTab, setActiveTab] = useState("scan"); // scan | history | pricing | about
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [fileNotice, setFileNotice] = useState("");

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [result, setResult] = useState(null);

  const [usedFreeScans, setUsedFreeScansState] = useState(getUsedFreeScans());
  const remainingFreeScans = Math.max(0, FREE_SCANS_LIMIT - usedFreeScans);

  const [history, setHistory] = useState([]);

  const scrollRef = useRef(null);

  useEffect(() => {
    setAuthState(getAuth());
    setUsedFreeScansState(getUsedFreeScans());
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [activeTab]);

  const chartData = useMemo(() => {
    // If your API returns: { scores: { risk: 0.7, clarity: 0.4, ... } }
    const scores = result?.scores;
    if (!scores || typeof scores !== "object") return [];
    return Object.entries(scores).map(([k, v]) => ({
      name: String(k),
      value: typeof v === "number" ? v : Number(v) || 0,
    }));
  }, [result]);

  const canScan = useMemo(() => {
    // If user is signed in, allow (later you can enforce plan)
    if (auth?.isAuthed) return true;
    return remainingFreeScans > 0;
  }, [auth, remainingFreeScans]);

  async function handleFileChange(e) {
    const f = e.target.files?.[0];
    setFile(f || null);
    setApiError("");
    setResult(null);

    if (!f) {
      setFileNotice("");
      return;
    }

    const notice = getFileTypeNotice(f);
    setFileNotice(notice);

    const name = (f.name || "").toLowerCase();
    if (name.endsWith(".txt") || name.endsWith(".md") || name.endsWith(".csv")) {
      const content = await readTextFile(f);
      setText(content);
    }
  }

  function addHistoryItem(item) {
    setHistory((prev) => [item, ...prev].slice(0, 50));
  }

  async function scan() {
    setApiError("");
    setResult(null);

    const payloadText = (text || "").trim();
    if (!payloadText) {
      setApiError("Please paste text OR upload a .txt file to scan.");
      return;
    }

    if (!canScan) {
      setApiError("Free scans finished. Please sign in to continue (pricing can be added next).");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: payloadText,
          mode: "property-trust",
          // You can pass user identity to build personalization on backend later:
          user: auth?.isAuthed ? { email: auth.email } : { guest: true },
          timestamp: nowISO(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg =
          data?.detail ||
          data?.error ||
          `API request failed: ${res.status} ${res.statusText}`;
        throw new Error(msg);
      }

      setResult(data);

      addHistoryItem({
        id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
        createdAt: new Date().toISOString(),
        preview: payloadText.slice(0, 120),
        result: data,
      });

      // consume free scan if guest
      if (!auth?.isAuthed) {
        const used = getUsedFreeScans();
        const next = used + 1;
        setUsedFreeScans(next);
        setUsedFreeScansState(next);
      }

      setActiveTab("scan");
    } catch (err) {
      setApiError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function signInFake(email) {
    const clean = String(email || "").trim();
    if (!clean || !clean.includes("@")) {
      alert("Enter a valid email to sign in.");
      return;
    }
    const next = { isAuthed: true, email: clean };
    setAuth(next);
    setAuthState(next);
  }

  function signOut() {
    const next = { isAuthed: false, email: "" };
    setAuth(next);
    setAuthState(next);
  }

  function resetFreeScans() {
    // dev helper
    setUsedFreeScans(0);
    setUsedFreeScansState(0);
  }

  const headerTitle = useMemo(() => {
    if (activeTab === "scan") return "Scan a Listing / Deed / Message";
    if (activeTab === "history") return "Your Scan History";
    if (activeTab === "pricing") return "Pricing & Plans";
    if (activeTab === "about") return "About DeedSense";
    return "DeedSense";
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-[420px] w-[920px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute top-1/3 right-[-200px] h-[420px] w-[520px] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-[-220px] left-[-200px] h-[520px] w-[620px] rounded-full bg-fuchsia-500/10 blur-3xl" />
      </div>

      {/* Top Nav */}
      <header className="sticky top-0 z-40 border-b border-slate-800/70 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-lg shadow-indigo-500/20">
              <span className="text-lg font-black text-slate-950">DS</span>
            </div>
            <div>
              <div className="text-sm text-slate-300">DeedSense</div>
              <div className="text-xs text-slate-500">
                Trust & Manipulation Risk Scanner for Property Investors
              </div>
            </div>
          </div>

          <nav className="hidden items-center gap-2 md:flex">
            <TopNavButton active={activeTab === "scan"} onClick={() => setActiveTab("scan")}>
              Scan
            </TopNavButton>
            <TopNavButton active={activeTab === "history"} onClick={() => setActiveTab("history")}>
              History
            </TopNavButton>
            <TopNavButton active={activeTab === "pricing"} onClick={() => setActiveTab("pricing")}>
              Pricing
            </TopNavButton>
            <TopNavButton active={activeTab === "about"} onClick={() => setActiveTab("about")}>
              About
            </TopNavButton>
          </nav>

          <div className="flex items-center gap-2">
            {!auth?.isAuthed ? (
              <LoginDropdown onSignIn={signInFake} />
            ) : (
              <div className="flex items-center gap-2">
                <span className="hidden text-xs text-slate-400 sm:inline">
                  Signed in as <span className="text-slate-200">{auth.email}</span>
                </span>
                <button
                  onClick={signOut}
                  className="rounded-xl border border-slate-800/70 bg-slate-900/40 px-3 py-2 text-xs text-slate-200 hover:bg-slate-900/70"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="mx-auto grid max-w-7xl grid-cols-12 gap-4 px-4 py-6">
        {/* Sidebar */}
        <aside className="col-span-12 md:col-span-3">
          <div className="rounded-3xl border border-slate-800/70 bg-slate-950/50 p-4 shadow-xl shadow-black/20">
            <div className="text-xs font-semibold text-slate-400">MENU</div>

            <div className="mt-3 grid gap-2">
              <SideButton active={activeTab === "scan"} onClick={() => setActiveTab("scan")}>
                Scan
              </SideButton>
              <SideButton active={activeTab === "history"} onClick={() => setActiveTab("history")}>
                History
              </SideButton>
              <SideButton active={activeTab === "pricing"} onClick={() => setActiveTab("pricing")}>
                Pricing
              </SideButton>
              <SideButton active={activeTab === "about"} onClick={() => setActiveTab("about")}>
                About
              </SideButton>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-800/70 bg-slate-900/30 p-3">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-400">Free scans</div>
                <div className="text-xs font-semibold text-slate-200">
                  {auth?.isAuthed ? "Unlimited (Signed In)" : `${remainingFreeScans}/${FREE_SCANS_LIMIT}`}
                </div>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                  style={{
                    width: auth?.isAuthed
                      ? "100%"
                      : `${Math.min(100, (remainingFreeScans / FREE_SCANS_LIMIT) * 100)}%`,
                  }}
                />
              </div>

              {!auth?.isAuthed && (
                <div className="mt-2 text-[11px] text-slate-500">
                  Guest mode uses free scans per browser. Sign in to continue.
                </div>
              )}

              <button
                onClick={resetFreeScans}
                className="mt-3 w-full rounded-xl border border-slate-800/70 bg-slate-900/40 px-3 py-2 text-xs text-slate-300 hover:bg-slate-900/70"
                title="Dev helper"
              >
                Reset free scans (dev)
              </button>
            </div>

            <div className="mt-6 text-[11px] text-slate-500">
              <div className="font-semibold text-slate-400">Disclaimer</div>
              DeedSense provides a risk signal based on text patterns and AI analysis. It is not legal advice,
              not a guarantee, and should be validated with documents and due diligence.
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="col-span-12 md:col-span-9">
          <div
            ref={scrollRef}
            className="rounded-3xl border border-slate-800/70 bg-slate-950/50 p-5 shadow-xl shadow-black/20"
          >
            <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <div className="text-xl font-semibold">{headerTitle}</div>
                <div className="mt-1 text-sm text-slate-400">
                  UAE + international property investors • detect manipulation • summarize risks
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full border border-slate-800/70 bg-slate-900/30 px-3 py-1 text-xs text-slate-300">
                  API: {API_BASE.replace("https://", "")}
                </span>
              </div>
            </div>

            {/* Tabs Content */}
            {activeTab === "scan" && (
              <div className="mt-6 grid gap-4">
                <div className="grid gap-4 lg:grid-cols-2">
                  {/* Input Card */}
                  <Card>
                    <CardTitle>Input</CardTitle>
                    <CardSubTitle>Paste text or upload a file (TXT best for MVP)</CardSubTitle>

                    <div className="mt-4 grid gap-3">
                      <label className="text-xs text-slate-400">Upload</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          onChange={handleFileChange}
                          accept=".txt,.md,.csv,.pdf,.doc,.docx"
                          className="block w-full text-xs text-slate-300 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-900/60 file:px-4 file:py-2 file:text-xs file:text-slate-200 hover:file:bg-slate-900"
                        />
                      </div>
                      {file && (
                        <div className="text-xs text-slate-400">
                          Selected: <span className="text-slate-200">{file.name}</span>
                        </div>
                      )}
                      {!!fileNotice && (
                        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                          {fileNotice}
                        </div>
                      )}

                      <label className="mt-2 text-xs text-slate-400">Paste content</label>
                      <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Paste listing description, broker message, deed notes, payment plan terms, WhatsApp chat, etc..."
                        className="h-56 w-full rounded-2xl border border-slate-800/70 bg-slate-950/40 p-3 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/10"
                      />

                      {apiError && (
                        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-200">
                          {apiError}
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-2">
                        <button
                          onClick={() => {
                            setText("");
                            setFile(null);
                            setFileNotice("");
                            setResult(null);
                            setApiError("");
                          }}
                          className="rounded-xl border border-slate-800/70 bg-slate-900/40 px-4 py-2 text-sm text-slate-200 hover:bg-slate-900/70"
                        >
                          Clear
                        </button>

                        <button
                          onClick={scan}
                          disabled={loading}
                          className={cn(
                            "rounded-xl px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg",
                            loading
                              ? "bg-slate-500 cursor-not-allowed"
                              : "bg-gradient-to-r from-indigo-500 to-cyan-400 hover:opacity-95"
                          )}
                        >
                          {loading ? "Scanning..." : auth?.isAuthed ? "Scan" : `Scan (Free ${remainingFreeScans})`}
                        </button>
                      </div>

                      {!auth?.isAuthed && (
                        <div className="text-[11px] text-slate-500">
                          Guest mode: up to {FREE_SCANS_LIMIT} scans. We do not store personal data in this demo UI.
                          (You can add proper auth + database later.)
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Output Card */}
                  <Card>
                    <CardTitle>Results</CardTitle>
                    <CardSubTitle>Actionable summary + risk signals + confidence</CardSubTitle>

                    <div className="mt-4">
                      {!result ? (
                        <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 p-4 text-sm text-slate-400">
                          Run a scan to see results here.
                          <div className="mt-2 text-xs text-slate-500">
                            Tip: paste the broker’s message + payment plan + any urgency language.
                          </div>
                        </div>
                      ) : (
                        <div className="grid gap-4">
                          {/* Summary */}
                          <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 p-4">
                            <div className="text-xs font-semibold text-slate-400">SUMMARY</div>
                            <div className="mt-2 text-sm text-slate-200 whitespace-pre-wrap">
                              {result.summary || result.verdict || "No summary returned."}
                            </div>

                            <div className="mt-4 grid grid-cols-3 gap-2">
                              <MiniStat
                                label="Risk"
                                value={String(result.risk_level || result.risk || "—")}
                              />
                              <MiniStat
                                label="Confidence"
                                value={String(result.confidence || "—")}
                              />
                              <MiniStat
                                label="Flags"
                                value={String(
                                  Array.isArray(result.flags) ? result.flags.length : result.flag_count || "—"
                                )}
                              />
                            </div>
                          </div>

                          {/* Flags */}
                          <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 p-4">
                            <div className="flex items-center justify-between">
                              <div className="text-xs font-semibold text-slate-400">DETECTED FLAGS</div>
                              <button
                                onClick={() =>
                                  downloadAsPDF({
                                    title: "DeedSense Report",
                                    content: JSON.stringify(result, null, 2),
                                  })
                                }
                                className="rounded-xl border border-slate-800/70 bg-slate-900/40 px-3 py-2 text-xs text-slate-200 hover:bg-slate-900/70"
                              >
                                Download PDF
                              </button>
                            </div>

                            <div className="mt-3">
                              {Array.isArray(result.flags) && result.flags.length > 0 ? (
                                <div className="grid gap-2">
                                  {result.flags.slice(0, 10).map((f, i) => (
                                    <div
                                      key={i}
                                      className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-3"
                                    >
                                      <div className="text-sm font-semibold text-slate-200">
                                        {f.title || f.type || `Flag ${i + 1}`}
                                      </div>
                                      <div className="mt-1 text-xs text-slate-400 whitespace-pre-wrap">
                                        {f.explanation || f.reason || f.detail || ""}
                                      </div>
                                      {!!f.severity && (
                                        <div className="mt-2 text-[11px] text-slate-500">
                                          Severity: <span className="text-slate-300">{String(f.severity)}</span>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-sm text-slate-400">
                                  No flags returned yet.
                                  <div className="mt-2 text-xs text-slate-500">
                                    If your API includes a <span className="text-slate-200 font-semibold">flags</span>{" "}
                                    array, it will show here automatically.
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Chart */}
                          <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 p-4">
                            <div className="text-xs font-semibold text-slate-400">SCORE BREAKDOWN</div>
                            {chartData.length === 0 ? (
                              <div className="mt-3 text-sm text-slate-400">
                                No scores returned yet. If your API response includes a{" "}
                                <span className="text-slate-200 font-semibold">scores</span> object, the chart will appear.
                              </div>
                            ) : (
                              <div className="mt-4 h-64 rounded-2xl border border-slate-800/60 bg-slate-950/40 p-2">
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={chartData}>
                                    <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" />
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            )}
                          </div>

                          {/* Raw JSON */}
                          <details className="rounded-2xl border border-slate-800/70 bg-slate-950/30 p-4">
                            <summary className="cursor-pointer text-xs font-semibold text-slate-300">
                              View raw JSON
                            </summary>
                            <pre className="mt-3 overflow-auto rounded-2xl border border-slate-800/70 bg-slate-950/50 p-3 text-xs text-slate-200">
                              {JSON.stringify(result, null, 2)}
                            </pre>
                          </details>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>

                {/* Disclaimer */}
                <div className="rounded-3xl border border-slate-800/70 bg-slate-950/50 p-4 text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Usage note:</span> This tool is designed for investors to
                  quickly spot manipulation and risk signals in listing text, broker messages, and payment terms.
                  Always verify via official documents, escrow/payment proof, and legal due diligence.
                </div>
              </div>
            )}

            {activeTab === "history" && (
              <div className="mt-6">
                {history.length === 0 ? (
                  <div className="rounded-3xl border border-slate-800/70 bg-slate-950/30 p-6 text-sm text-slate-400">
                    No scans yet. Run your first scan from the Scan tab.
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {history.map((h) => (
                      <div
                        key={h.id}
                        className="rounded-3xl border border-slate-800/70 bg-slate-950/30 p-4"
                      >
                        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                          <div>
                            <div className="text-sm font-semibold text-slate-200">
                              {new Date(h.createdAt).toLocaleString()}
                            </div>
                            <div className="mt-1 text-xs text-slate-400">{h.preview}...</div>
                          </div>
                          <button
                            className="rounded-xl border border-slate-800/70 bg-slate-900/40 px-3 py-2 text-xs text-slate-200 hover:bg-slate-900/70"
                            onClick={() => {
                              setResult(h.result);
                              setActiveTab("scan");
                            }}
                          >
                            Open result
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "pricing" && (
              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                <PlanCard
                  title="Starter (Free)"
                  price="AED 0"
                  desc="Perfect for first-time investors"
                  bullets={[
                    "5 free scans (guest mode)",
                    "Basic risk summary",
                    "PDF download",
                    "No account required",
                  ]}
                  cta="Use Free Scans"
                  onClick={() => setActiveTab("scan")}
                />
                <PlanCard
                  title="Investor Pro"
                  price="AED 79/mo"
                  desc="For active buyers and agents"
                  highlight
                  bullets={[
                    "Unlimited scans",
                    "Save history across devices",
                    "Advanced scoring + charts",
                    "Priority model routing",
                  ]}
                  cta={auth?.isAuthed ? "You’re Signed In" : "Sign in to Upgrade"}
                  onClick={() => setActiveTab("scan")}
                />
                <PlanCard
                  title="Enterprise API"
                  price="Custom"
                  desc="For portals, brokerages, compliance"
                  bullets={[
                    "API keys + rate limits",
                    "Team workspace",
                    "Audit logs",
                    "SLA support",
                  ]}
                  cta="Contact Sales"
                  onClick={() => alert("Next step: add a Contact Sales form / email link.")}
                />

                <div className="lg:col-span-3 rounded-3xl border border-slate-800/70 bg-slate-950/30 p-5 text-sm text-slate-300">
                  <div className="font-semibold text-slate-200">Next (when you’re ready):</div>
                  <ul className="mt-2 list-disc pl-5 text-slate-400">
                    <li>Add real auth (Google / email OTP)</li>
                    <li>Add file extraction in backend (PDF/DOCX)</li>
                    <li>Add user profiles & personalization model memory</li>
                    <li>Add Stripe subscriptions</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === "about" && (
              <div className="mt-6 grid gap-4">
                <div className="rounded-3xl border border-slate-800/70 bg-slate-950/30 p-6">
                  <div className="text-lg font-semibold">What is DeedSense?</div>
                  <div className="mt-2 text-sm text-slate-400">
                    DeedSense is a trust and manipulation-risk scanner built for UAE + international property investors.
                    It helps you detect urgency traps, contradictory terms, missing proof signals, and persuasion tactics
                    inside broker messages, listing descriptions, and payment plan summaries.
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-3xl border border-slate-800/70 bg-slate-950/30 p-6">
                    <div className="text-sm font-semibold text-slate-200">What it does well</div>
                    <ul className="mt-3 list-disc pl-5 text-sm text-slate-400">
                      <li>Fast “first scan” of risk signals</li>
                      <li>Summaries + flags that a human can verify</li>
                      <li>Great for WhatsApp messages & listing pages</li>
                    </ul>
                  </div>

                  <div className="rounded-3xl border border-slate-800/70 bg-slate-950/30 p-6">
                    <div className="text-sm font-semibold text-slate-200">What it cannot do</div>
                    <ul className="mt-3 list-disc pl-5 text-sm text-slate-400">
                      <li>It cannot guarantee fraud detection</li>
                      <li>It cannot replace legal due diligence</li>
                      <li>It depends heavily on the text you provide</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="mx-auto max-w-7xl px-4 pb-10">
        <div className="mt-6 flex flex-col items-start justify-between gap-2 border-t border-slate-800/70 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center">
          <div>© {new Date().getFullYear()} DeedSense • Built on Render • MVP UI</div>
          <div className="text-slate-600">Not legal advice • Use at your own risk</div>
        </div>
      </footer>
    </div>
  );
}

// ---------- COMPONENTS ----------
function TopNavButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-xl px-3 py-2 text-sm transition",
        active
          ? "bg-slate-900/60 text-slate-100 border border-slate-800/70"
          : "text-slate-400 hover:text-slate-200"
      )}
    >
      {children}
    </button>
  );
}

function SideButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full rounded-2xl px-4 py-3 text-left text-sm transition",
        active
          ? "border border-slate-800/70 bg-slate-900/50 text-slate-100"
          : "border border-transparent bg-transparent text-slate-400 hover:border-slate-800/70 hover:bg-slate-900/30 hover:text-slate-200"
      )}
    >
      {children}
    </button>
  );
}

function Card({ children }) {
  return (
    <div className="rounded-3xl border border-slate-800/70 bg-slate-950/30 p-5">
      {children}
    </div>
  );
}

function CardTitle({ children }) {
  return <div className="text-sm font-semibold text-slate-200">{children}</div>;
}

function CardSubTitle({ children }) {
  return <div className="mt-1 text-xs text-slate-500">{children}</div>;
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-3">
      <div className="text-[11px] text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-200">{value}</div>
    </div>
  );
}

function PlanCard({ title, price, desc, bullets, cta, onClick, highlight }) {
  return (
    <div
      className={cn(
        "rounded-3xl border bg-slate-950/30 p-6",
        highlight
          ? "border-indigo-500/40 shadow-lg shadow-indigo-500/10"
          : "border-slate-800/70"
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-lg font-semibold text-slate-100">{title}</div>
          <div className="mt-1 text-xs text-slate-500">{desc}</div>
        </div>
        {highlight && (
          <div className="rounded-full bg-indigo-500/20 px-3 py-1 text-[11px] text-indigo-200 border border-indigo-500/30">
            Most Popular
          </div>
        )}
      </div>

      <div className="mt-5 text-3xl font-black">{price}</div>

      <ul className="mt-4 list-disc pl-5 text-sm text-slate-400">
        {bullets.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>

      <button
        onClick={onClick}
        className={cn(
          "mt-6 w-full rounded-2xl px-4 py-3 text-sm font-semibold",
          highlight
            ? "bg-gradient-to-r from-indigo-500 to-cyan-400 text-slate-950 hover:opacity-95"
            : "border border-slate-800/70 bg-slate-900/40 text-slate-200 hover:bg-slate-900/70"
        )}
      >
        {cta}
      </button>
    </div>
  );
}

function LoginDropdown({ onSignIn }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-xl border border-slate-800/70 bg-slate-900/40 px-3 py-2 text-xs text-slate-200 hover:bg-slate-900/70"
      >
        Sign in
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-800/70 bg-slate-950/95 p-3 shadow-2xl shadow-black/40 backdrop-blur">
          <div className="text-xs font-semibold text-slate-300">Quick sign in (demo)</div>
          <div className="mt-1 text-[11px] text-slate-500">
            This is a UI-only sign-in for MVP. Real auth can be added later.
          </div>

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="mt-3 w-full rounded-xl border border-slate-800/70 bg-slate-950/60 px-3 py-2 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/10"
          />

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => {
                onSignIn(email);
                setOpen(false);
              }}
              className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-3 py-2 text-sm font-semibold text-slate-950 hover:opacity-95"
            >
              Continue
            </button>
            <button
              onClick={() => setOpen(false)}
              className="rounded-xl border border-slate-800/70 bg-slate-900/40 px-3 py-2 text-sm text-slate-200 hover:bg-slate-900/70"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
