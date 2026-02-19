import React, { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import jsPDF from "jspdf";

// ✅ Render env var (recommended). Fallback to your API.
const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://deedsense-api.onrender.com";

const FREE_GUEST_SCANS = 5;
const GUEST_KEY = "deedsense_guest_scans_used_v2";

function getGuestUsed() {
  const v = Number(localStorage.getItem(GUEST_KEY) || "0");
  return Number.isFinite(v) ? v : 0;
}
function incGuestUsed() {
  const next = getGuestUsed() + 1;
  localStorage.setItem(GUEST_KEY, String(next));
  return next;
}
function resetGuestUsed() {
  localStorage.setItem(GUEST_KEY, "0");
}

async function extractTextFromFile(file) {
  const name = file.name.toLowerCase();

  if (name.endsWith(".txt") || name.endsWith(".md")) return await file.text();

  if (name.endsWith(".pdf")) {
    const pdfjsLib = await import("pdfjs-dist/build/pdf");
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://unpkg.com/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs";

    const buf = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise;

    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map((it) => it.str);
      fullText += strings.join(" ") + "\n\n";
    }
    return fullText.trim();
  }

  throw new Error("Unsupported file type. Upload .pdf, .txt, or .md");
}

function normalizeResult(data) {
  const scores = data?.scores || data?.score_breakdown || data?.trust_scores || null;
  const summary = data?.summary || data?.verdict || data?.overall_summary || "";
  const risks = data?.risks || data?.red_flags || data?.issues || [];
  const recommendations = data?.recommendations || data?.next_steps || data?.actions || [];
  return { scores, summary, risks, recommendations, raw: data };
}

function toChartData(scores) {
  if (!scores || typeof scores !== "object") return [];
  return Object.entries(scores).map(([k, v]) => ({
    name: k.replaceAll("_", " "),
    value: typeof v === "number" ? v : Number(v) || 0,
  }));
}

function prettyJSON(obj) {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(obj);
  }
}

function Badge({ children, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-800/60 text-slate-200 border-slate-700/60",
    emerald: "bg-emerald-500/10 text-emerald-200 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-200 border-amber-500/20",
    red: "bg-red-500/10 text-red-200 border-red-500/20",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs ${tones[tone]}`}>
      {children}
    </span>
  );
}

function Button({ children, variant = "primary", className = "", ...props }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-[0_10px_30px_rgba(16,185,129,0.25)]",
    dark: "bg-slate-900/70 text-slate-100 border border-slate-700/60 hover:bg-slate-900",
    ghost: "bg-transparent text-slate-200 hover:bg-slate-800/40 border border-slate-700/40",
    light: "bg-white text-slate-950 hover:bg-slate-100",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-slate-800/60 bg-slate-900/35 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.30)] ${className}`}>
      {children}
    </div>
  );
}

export default function App() {
  const [menu, setMenu] = useState("Scan"); // Scan | History | Pricing | Docs
  const [mode, setMode] = useState("guest"); // guest | signin-ui
  const [email, setEmail] = useState("");
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [result, setResult] = useState(null);

  const guestUsed = useMemo(() => getGuestUsed(), [result, busy]);
  const guestRemaining = Math.max(0, FREE_GUEST_SCANS - guestUsed);

  const normalized = useMemo(() => (result ? normalizeResult(result) : null), [result]);

  const chartData = useMemo(() => {
    if (!normalized?.scores) return [];
    return toChartData(normalized.scores);
  }, [normalized]);

  const trustScore = useMemo(() => {
    // Optional: if your API includes an overall trust score. Otherwise null.
    const raw = result?.trust_score ?? result?.overall_score ?? null;
    if (raw === null || raw === undefined) return null;
    const n = typeof raw === "number" ? raw : Number(raw);
    return Number.isFinite(n) ? n : null;
  }, [result]);

  async function onPickFile(e) {
    setErr("");
    setResult(null);

    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    try {
      setBusy(true);
      const extracted = await extractTextFromFile(file);
      setText(extracted);
    } catch (ex) {
      setErr(ex?.message || "Could not read file.");
    } finally {
      setBusy(false);
    }
  }

  async function runScan() {
    setErr("");
    setResult(null);

    const trimmed = (text || "").trim();
    if (trimmed.length < 50) {
      setErr("Please paste/upload more content (minimum ~50 characters).");
      return;
    }

    if (mode === "guest" && guestRemaining <= 0) {
      setErr("Your 5 free guest scans are finished. Switch to Sign In (next step) or reset for testing.");
      return;
    }

    try {
      setBusy(true);
      if (mode === "guest") incGuestUsed();

      const resp = await fetch(`${API_BASE}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: trimmed,
          context: {
            domain: "property-investment",
            region: "global",
            user_hint: mode === "signin-ui" ? email : "guest",
          },
        }),
      });

      if (!resp.ok) {
        const t = await resp.text();
        throw new Error(`Scan failed (${resp.status}). ${t}`);
      }

      const data = await resp.json();
      setResult(data);
      setMenu("Scan");
    } catch (ex) {
      setErr(ex?.message || "Unknown error");
    } finally {
      setBusy(false);
    }
  }

  function downloadPDF() {
    if (!result) return;
    const n = normalizeResult(result);

    const doc = new jsPDF();
    const now = new Date().toLocaleString();

    doc.setFontSize(16);
    doc.text("DeedSense — Trust Scan Report", 14, 18);

    doc.setFontSize(10);
    doc.text(`Generated: ${now}`, 14, 26);
    doc.text(`Mode: ${mode === "guest" ? "Guest" : "Signed-in (UI only)"}`, 14, 32);

    doc.setFontSize(12);
    doc.text("Summary", 14, 44);
    doc.setFontSize(10);
    const summaryText = (n.summary || "No summary returned by API.").toString();
    doc.text(doc.splitTextToSize(summaryText, 180), 14, 52);

    let y = 70;

    if (n.scores) {
      doc.setFontSize(12);
      doc.text("Scores", 14, y);
      y += 8;

      doc.setFontSize(10);
      for (const [k, v] of Object.entries(n.scores)) {
        doc.text(`${k}: ${String(v)}`, 14, y);
        y += 6;
        if (y > 275) {
          doc.addPage();
          y = 20;
        }
      }
    }

    if (Array.isArray(n.risks) && n.risks.length) {
      if (y > 240) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(12);
      doc.text("Top Risks / Flags", 14, y);
      y += 8;

      doc.setFontSize(10);
      n.risks.slice(0, 10).forEach((r, idx) => {
        const line = `${idx + 1}. ${r?.label || r?.title || "Risk"} — ${r?.severity || r?.level || ""}`;
        doc.text(doc.splitTextToSize(line, 180), 14, y);
        y += 10;
        const expl = r?.explanation || r?.why || r?.details;
        if (expl) {
          doc.text(doc.splitTextToSize(String(expl), 180), 14, y);
          y += 10;
        }
        if (y > 275) {
          doc.addPage();
          y = 20;
        }
      });
    }

    doc.save("deedsense-report.pdf");
  }

  const headerMenu = ["Scan", "History", "Pricing", "Docs"];

  return (
    <div className="min-h-screen text-slate-100">
      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.18),transparent_45%),radial-gradient(ellipse_at_bottom,rgba(56,189,248,0.14),transparent_50%)]" />
        <div className="absolute inset-0 opacity-[0.55] [background-image:linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:52px_52px]" />
      </div>

      {/* Top Nav */}
      <div className="sticky top-0 z-20 border-b border-slate-800/60 bg-slate-950/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-400/10 border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.20)] grid place-items-center">
              <span className="text-emerald-300 font-black">D</span>
            </div>
            <div className="leading-tight">
              <div className="font-extrabold tracking-tight text-slate-100">
                DeedSense <span className="text-emerald-300">AI</span>
              </div>
              <div className="text-xs text-slate-400">Trust scan for global property investors</div>
            </div>
          </div>

          {/* Menu */}
          <div className="hidden md:flex items-center gap-1">
            {headerMenu.map((item) => (
              <button
                key={item}
                onClick={() => setMenu(item)}
                className={`rounded-xl px-3 py-2 text-sm transition-all ${
                  menu === item ? "bg-slate-800/60 text-slate-100 border border-slate-700/50" : "text-slate-300 hover:bg-slate-800/30"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <Badge tone="emerald">{mode === "guest" ? `${guestRemaining} free scans` : "Signed-in (UI)"}</Badge>

            {mode === "guest" ? (
              <Button variant="ghost" onClick={() => setMode("signin-ui")} className="hidden sm:inline-flex">
                Sign in
              </Button>
            ) : (
              <Button variant="ghost" onClick={() => setMode("guest")} className="hidden sm:inline-flex">
                Guest
              </Button>
            )}

            <Button variant="primary" onClick={() => setMenu("Scan")}>
              New scan
            </Button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-800/60 bg-slate-900/30 p-6 md:p-8 backdrop-blur-xl shadow-[0_20px_70px_rgba(0,0,0,0.45)]">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />

          <div className="relative">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2">
                  <Badge tone="amber">Beta</Badge>
                  <Badge>Not legal advice</Badge>
                </div>

                <h1 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight">
                  Scan listings, broker claims, clauses & payment plans —{" "}
                  <span className="text-emerald-300">spot manipulation fast.</span>
                </h1>

                <p className="mt-3 max-w-2xl text-sm md:text-base text-slate-300">
                  Investor-grade trust signals for worldwide property + UAE real estate. Paste text or upload a PDF and get a structured
                  risk summary, score breakdown, and recommended verification steps.
                </p>
              </div>

              <div className="flex flex-col gap-2 md:items-end">
                <div className="text-xs text-slate-400">API</div>
                <div className="rounded-xl border border-slate-800/60 bg-slate-950/50 px-3 py-2 text-xs text-slate-300">
                  {API_BASE}
                </div>
                <div className="text-[11px] text-slate-500">Tip: set VITE_API_BASE_URL in Render</div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
              <Card className="p-4">
                <div className="text-xs text-slate-400">What it does</div>
                <div className="mt-1 font-semibold">Detects red flags & pressure tactics</div>
                <div className="mt-2 text-sm text-slate-300">
                  Finds urgency traps, vague promises, missing verification, and risky wording patterns.
                </div>
              </Card>

              <Card className="p-4">
                <div className="text-xs text-slate-400">Best for</div>
                <div className="mt-1 font-semibold">Investors, agencies, & compliance teams</div>
                <div className="mt-2 text-sm text-slate-300">
                  Create a consistent review standard across listings, emails, brochures and proposals.
                </div>
              </Card>

              <Card className="p-4">
                <div className="text-xs text-slate-400">Output</div>
                <div className="mt-1 font-semibold">Scores + Summary + Actions</div>
                <div className="mt-2 text-sm text-slate-300">
                  Export a PDF report for client records and internal review.
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Menu pages */}
        {menu !== "Scan" ? (
          <div className="mt-6">
            <Card className="p-6">
              <div className="text-xs text-slate-400">Menu</div>
              <div className="mt-1 text-2xl font-bold">{menu}</div>
              <div className="mt-2 text-slate-300 text-sm">
                This page is a placeholder. Tell me what you want here and I’ll build it:
                <ul className="mt-2 list-disc pl-5 space-y-1 text-slate-300">
                  {menu === "History" && (
                    <>
                      <li>Show last scans (from Postgres)</li>
                      <li>Search by property / broker / developer</li>
                      <li>Export previous reports</li>
                    </>
                  )}
                  {menu === "Pricing" && (
                    <>
                      <li>Free: 5 scans</li>
                      <li>Pro: unlimited scans + PDF + saved history</li>
                      <li>Enterprise: API + team seats + compliance logs</li>
                    </>
                  )}
                  {menu === "Docs" && (
                    <>
                      <li>API endpoints</li>
                      <li>How scoring works</li>
                      <li>Disclaimers + compliance</li>
                    </>
                  )}
                </ul>
              </div>
              <div className="mt-5 flex gap-2">
                <Button variant="primary" onClick={() => setMenu("Scan")}>Go to Scan</Button>
                <Button variant="ghost" onClick={() => setMenu("Scan")}>Back</Button>
              </div>
            </Card>
          </div>
        ) : null}

        {/* Scan section */}
        {menu === "Scan" ? (
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Left: Access + Controls */}
            <Card className="p-5 md:col-span-1">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-slate-400">Access</div>
                  <div className="mt-1 text-lg font-bold">Mode</div>
                </div>
                <Badge tone={mode === "guest" ? "emerald" : "amber"}>
                  {mode === "guest" ? "Guest" : "Sign-in UI"}
                </Badge>
              </div>

              <div className="mt-4 space-y-3">
                {mode === "guest" ? (
                  <>
                    <div className="rounded-2xl border border-slate-800/60 bg-slate-950/40 p-4">
                      <div className="text-sm text-slate-200">
                        Free scans remaining:{" "}
                        <span className="text-emerald-300 font-extrabold">{guestRemaining}</span> / {FREE_GUEST_SCANS}
                      </div>
                      <div className="mt-2 text-xs text-slate-400">
                        Guest limit is stored in your browser (temporary). Next we’ll enforce server-side via Redis.
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button variant="ghost" onClick={() => resetGuestUsed()} className="w-full">
                          Reset counter (testing)
                        </Button>
                      </div>
                    </div>

                    <Button variant="dark" className="w-full" onClick={() => setMode("signin-ui")}>
                      Switch to Sign in
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="rounded-2xl border border-slate-800/60 bg-slate-950/40 p-4">
                      <div className="text-sm text-slate-200 font-semibold">Sign in (UI only)</div>
                      <div className="mt-2 text-xs text-slate-400">
                        You asked for pro UI. Auth backend is next step (Supabase/JWT).
                      </div>
                      <label className="mt-3 block text-xs text-slate-400">Email</label>
                      <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="mt-1 w-full rounded-xl border border-slate-700/60 bg-slate-950 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                    </div>

                    <Button variant="dark" className="w-full" onClick={() => setMode("guest")}>
                      Back to Guest
                    </Button>
                  </>
                )}

                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
                  <div className="text-sm font-semibold text-amber-200">Disclaimer</div>
                  <div className="mt-1 text-xs text-amber-100/90">
                    AI-assisted scan only — not legal/financial advice. Verify with official documents and licensed professionals.
                  </div>
                </div>
              </div>
            </Card>

            {/* Middle: Input */}
            <Card className="p-5 md:col-span-2">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-xs text-slate-400">Input</div>
                  <div className="mt-1 text-lg font-bold">Upload or paste</div>
                  <div className="mt-1 text-sm text-slate-300">
                    Upload PDF/TXT/MD or paste property details, contract clauses, broker messages, or payment plan claims.
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <label className="cursor-pointer">
                    <div className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700/60 bg-slate-950/40 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-900/50 transition">
                      Upload
                      <input type="file" className="hidden" onChange={onPickFile} />
                    </div>
                  </label>

                  <Button variant="primary" onClick={runScan} disabled={busy}>
                    {busy ? "Scanning..." : "Run Scan"}
                  </Button>

                  <Button variant="light" onClick={downloadPDF} disabled={!result}>
                    Download PDF
                  </Button>
                </div>
              </div>

              {fileName ? (
                <div className="mt-3 text-xs text-slate-400">
                  Loaded file: <span className="text-slate-200 font-semibold">{fileName}</span>
                </div>
              ) : null}

              <div className="mt-4">
                <textarea
                  className="h-56 w-full rounded-2xl border border-slate-700/60 bg-slate-950/40 p-4 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-emerald-500/25 transition"
                  placeholder="Paste the listing text / brochure claims / contract clause / broker messages here…"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </div>

              {err ? (
                <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
                  {err}
                </div>
              ) : null}

              {/* Results */}
              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* Summary & flags */}
                <div className="md:col-span-2 space-y-4">
                  <Card className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-slate-400">Result</div>
                        <div className="mt-1 text-lg font-bold">Summary</div>
                      </div>
                      {trustScore !== null ? (
                        <Badge tone={trustScore >= 70 ? "emerald" : trustScore >= 45 ? "amber" : "red"}>
                          Trust {trustScore}
                        </Badge>
                      ) : (
                        <Badge>AI output</Badge>
                      )}
                    </div>

                    {!result ? (
                      <div className="mt-3 text-sm text-slate-400">Run a scan to see results.</div>
                    ) : (
                      <div className="mt-3 text-sm text-slate-300">
                        {normalized?.summary ? normalized.summary : "No summary returned by API."}
                      </div>
                    )}
                  </Card>

                  {Array.isArray(normalized?.risks) && normalized.risks.length > 0 ? (
                    <Card className="p-5">
                      <div className="text-xs text-slate-400">Signals</div>
                      <div className="mt-1 text-lg font-bold">Top risks / flags</div>

                      <div className="mt-3 space-y-2">
                        {normalized.risks.slice(0, 8).map((r, idx) => (
                          <div
                            key={idx}
                            className="rounded-2xl border border-slate-800/60 bg-slate-950/40 p-4 hover:bg-slate-950/60 transition"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="text-sm font-semibold text-slate-100">
                                {r?.label || r?.title || "Risk"}
                              </div>
                              <Badge tone="amber">{r?.severity || r?.level || "check"}</Badge>
                            </div>
                            {r?.explanation || r?.why || r?.details ? (
                              <div className="mt-1 text-xs text-slate-300">
                                {r?.explanation || r?.why || r?.details}
                              </div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </Card>
                  ) : null}

                  {Array.isArray(normalized?.recommendations) && normalized.recommendations.length > 0 ? (
                    <Card className="p-5">
                      <div className="text-xs text-slate-400">Actions</div>
                      <div className="mt-1 text-lg font-bold">Recommended next steps</div>
                      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-300">
                        {normalized.recommendations.slice(0, 10).map((x, idx) => (
                          <li key={idx}>{String(x)}</li>
                        ))}
                      </ul>
                    </Card>
                  ) : null}

                  {result ? (
                    <details className="rounded-2xl border border-slate-800/60 bg-slate-900/35 p-5">
                      <summary className="cursor-pointer text-sm font-semibold text-slate-200">
                        View Raw JSON
                      </summary>
                      <pre className="mt-3 overflow-auto rounded-2xl bg-slate-950/50 p-4 text-xs text-slate-300">
                        {prettyJSON(result)}
                      </pre>
                    </details>
                  ) : null}
                </div>

                {/* Chart */}
                <div className="md:col-span-1">
                  <Card className="p-5">
                    <div className="text-xs text-slate-400">Breakdown</div>
                    <div className="mt-1 text-lg font-bold">Score chart</div>

                    {chartData.length === 0 ? (
                      <div className="mt-3 text-sm text-slate-400">
                        No `scores` returned yet. If your API returns `scores: {{...}}`, the chart will appear automatically.
                      </div>
                    ) : (
                      <div className="mt-4 h-64 rounded-2xl border border-slate-800/60 bg-slate-950/40 p-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData}>
                            <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    <div className="mt-4 text-xs text-slate-400">
                      Pro UI done ✅ Next: real login + history + server-side free scan enforcement.
                    </div>
                  </Card>
                </div>
              </div>
            </Card>
          </div>
        ) : null}

        {/* Footer */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-800/60 pt-6 md:flex-row">
          <div className="text-xs text-slate-500">
            © {new Date().getFullYear()} DeedSense • Trust scan for investors • Not legal advice
          </div>
          <div className="flex gap-2">
            <Badge>Global + UAE-ready</Badge>
            <Badge tone="emerald">PDF export</Badge>
            <Badge tone="amber">Beta</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
