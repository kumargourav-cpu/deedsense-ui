import React, { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import jsPDF from "jspdf";

// ✅ Set your API base here (or via Render env var VITE_API_BASE_URL)
const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://deedsense-api.onrender.com";

// Free scans in Guest mode
const FREE_GUEST_SCANS = 5;
const GUEST_KEY = "deedsense_guest_scans_used_v1";

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

  // TXT / MD
  if (name.endsWith(".txt") || name.endsWith(".md")) {
    return await file.text();
  }

  // PDF (client-side extraction using pdfjs)
  if (name.endsWith(".pdf")) {
    const pdfjsLib = await import("pdfjs-dist/build/pdf");
    // Worker from CDN (keeps Vite + Render simple)
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

  throw new Error("Unsupported file type. Upload .txt, .md, or .pdf");
}

function normalizeResult(data) {
  // Your backend may return different keys. We normalize “common shapes”.
  // If nothing matches, we still show Raw JSON.
  const scores =
    data?.scores ||
    data?.score_breakdown ||
    data?.trust_scores ||
    null;

  const summary =
    data?.summary ||
    data?.verdict ||
    data?.overall_summary ||
    "";

  const risks =
    data?.risks ||
    data?.red_flags ||
    data?.issues ||
    [];

  const recommendations =
    data?.recommendations ||
    data?.next_steps ||
    data?.actions ||
    [];

  return { scores, summary, risks, recommendations, raw: data };
}

function toChartData(scores) {
  if (!scores || typeof scores !== "object") return [];
  return Object.entries(scores).map(([k, v]) => ({
    name: k.replaceAll("_", " "),
    value: typeof v === "number" ? v : Number(v) || 0
  }));
}

function prettyJSON(obj) {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(obj);
  }
}

export default function App() {
  const [mode, setMode] = useState("guest"); // guest | signin (UI only for now)
  const [email, setEmail] = useState("");
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [result, setResult] = useState(null);

  const guestUsed = useMemo(() => getGuestUsed(), [result, busy]);
  const guestRemaining = Math.max(0, FREE_GUEST_SCANS - guestUsed);

  const chartData = useMemo(() => {
    const normalized = result ? normalizeResult(result) : null;
    return normalized?.scores ? toChartData(normalized.scores) : [];
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
      setErr("Please paste/upload more text (minimum ~50 characters).");
      return;
    }

    // Guest free scan gate
    if (mode === "guest" && guestRemaining <= 0) {
      setErr("Guest free scans finished. Please sign in (coming next) or reset guest for testing.");
      return;
    }

    try {
      setBusy(true);

      // Count usage BEFORE calling API (so even failures show usage? If you prefer, move after success.)
      if (mode === "guest") incGuestUsed();

      const resp = await fetch(`${API_BASE}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: trimmed,
          context: {
            domain: "property-investment",
            region: "global",
            // optional: email in future sign-in mode
            user_hint: mode === "signin" ? email : "guest"
          }
        })
      });

      if (!resp.ok) {
        const t = await resp.text();
        throw new Error(`Scan failed (${resp.status}). ${t}`);
      }

      const data = await resp.json();
      setResult(data);
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

  const normalized = result ? normalizeResult(result) : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-sm text-slate-400">A defensible trust scan for investors</div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              DeedSense <span className="text-emerald-400">Trust Scan</span>
            </h1>
          </div>

          <div className="flex gap-2">
            <button
              className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                mode === "guest" ? "bg-emerald-500 text-slate-950" : "bg-slate-800"
              }`}
              onClick={() => setMode("guest")}
            >
              Guest Mode
            </button>
            <button
              className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                mode === "signin" ? "bg-emerald-500 text-slate-950" : "bg-slate-800"
              }`}
              onClick={() => setMode("signin")}
            >
              Sign In (UI only)
            </button>
          </div>
        </div>

        {/* Disclaimers */}
        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="text-sm text-slate-300">
            <span className="font-semibold text-amber-300">Disclaimer:</span> This tool provides an AI-assisted risk/credibility scan.
            It is <span className="font-semibold">not legal, financial, or investment advice</span>. Always verify with official documents,
            licensed brokers, and legal counsel.
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Usage: Paste text or upload a document → Run Scan → Review scores, red flags, recommendations → Export as PDF.
          </div>
        </div>

        {/* Mode block */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 md:col-span-1">
            <h2 className="text-lg font-bold">Access</h2>

            {mode === "guest" ? (
              <>
                <div className="mt-2 text-sm text-slate-300">
                  Guest scans remaining:{" "}
                  <span className="font-bold text-emerald-300">{guestRemaining}</span> / {FREE_GUEST_SCANS}
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    className="rounded-xl bg-slate-800 px-3 py-2 text-xs font-semibold"
                    onClick={() => {
                      resetGuestUsed();
                      setResult(null);
                      setErr("");
                    }}
                  >
                    Reset guest counter (testing)
                  </button>
                </div>
                <div className="mt-3 text-xs text-slate-400">
                  (Next: real Sign-in + billing. For now, guest limit is enforced in-browser.)
                </div>
              </>
            ) : (
              <>
                <div className="mt-2 text-sm text-slate-300">
                  Sign-in UI is shown here, but backend auth is not wired yet.
                </div>
                <label className="mt-3 block text-xs text-slate-400">Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                />
                <div className="mt-3 text-xs text-slate-400">
                  If you want, I’ll add real sign-in using Supabase (fastest) or JWT + PostgreSQL.
                </div>
              </>
            )}
          </div>

          {/* Input */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 md:col-span-2">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h2 className="text-lg font-bold">Input</h2>

              <div className="flex flex-wrap gap-2">
                <label className="cursor-pointer rounded-xl bg-slate-800 px-3 py-2 text-xs font-semibold">
                  Upload (.pdf / .txt / .md)
                  <input type="file" className="hidden" onChange={onPickFile} />
                </label>

                <button
                  onClick={runScan}
                  disabled={busy}
                  className={`rounded-xl px-4 py-2 text-sm font-bold ${
                    busy ? "bg-slate-700" : "bg-emerald-500 text-slate-950"
                  }`}
                >
                  {busy ? "Scanning..." : "Run Trust Scan"}
                </button>

                <button
                  onClick={downloadPDF}
                  disabled={!result}
                  className={`rounded-xl px-4 py-2 text-sm font-bold ${
                    result ? "bg-slate-200 text-slate-950" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  Download PDF
                </button>
              </div>
            </div>

            {fileName ? (
              <div className="mt-2 text-xs text-slate-400">Loaded file: {fileName}</div>
            ) : null}

            <textarea
              className="mt-4 h-56 w-full rounded-2xl border border-slate-700 bg-slate-950 p-4 text-sm leading-relaxed"
              placeholder="Paste listing text, contract clauses, broker messages, developer claims, payment plan details, or email threads..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            {err ? (
              <div className="mt-3 rounded-xl border border-red-900 bg-red-950/40 p-3 text-sm text-red-200">
                {err}
              </div>
            ) : null}

            <div className="mt-3 text-xs text-slate-400">
              API connected to: <span className="text-slate-200">{API_BASE}</span>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 md:col-span-2">
            <h2 className="text-lg font-bold">Results</h2>

            {!result ? (
              <div className="mt-2 text-sm text-slate-400">Run a scan to see results.</div>
            ) : (
              <>
                <div className="mt-3 rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <div className="text-sm font-semibold text-slate-200">Summary</div>
                  <div className="mt-2 text-sm text-slate-300">
                    {normalized?.summary ? normalized.summary : "No summary returned by API."}
                  </div>
                </div>

                {Array.isArray(normalized?.risks) && normalized.risks.length > 0 ? (
                  <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950 p-4">
                    <div className="text-sm font-semibold text-slate-200">Top Risks / Flags</div>
                    <div className="mt-2 space-y-2">
                      {normalized.risks.slice(0, 8).map((r, idx) => (
                        <div key={idx} className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-sm font-bold">{r?.label || r?.title || "Risk"}</div>
                            <div className="text-xs rounded-full bg-amber-400/20 px-2 py-1 text-amber-200">
                              {r?.severity || r?.level || "check"}
                            </div>
                          </div>
                          {r?.explanation || r?.why || r?.details ? (
                            <div className="mt-1 text-xs text-slate-300">
                              {r?.explanation || r?.why || r?.details}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {Array.isArray(normalized?.recommendations) && normalized.recommendations.length > 0 ? (
                  <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950 p-4">
                    <div className="text-sm font-semibold text-slate-200">Recommendations</div>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
                      {normalized.recommendations.slice(0, 10).map((x, idx) => (
                        <li key={idx}>{String(x)}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <details className="mt-4 rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-slate-200">
                    View Raw JSON
                  </summary>
                  <pre className="mt-3 overflow-auto rounded-xl bg-slate-900/40 p-3 text-xs text-slate-300">
                    {prettyJSON(result)}
                  </pre>
                </details>
              </>
            )}
          </div>

          {/* Charts */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 md:col-span-1">
            <h2 className="text-lg font-bold">Scores</h2>

            {chartData.length === 0 ? (
              <div className="mt-2 text-sm text-slate-400">
                No score breakdown returned yet. (If your API returns `scores`, charts will auto-appear.)
              </div>
            ) : (
              <div className="mt-3 h-64 rounded-2xl border border-slate-800 bg-slate-950 p-2">
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

            <div className="mt-3 text-xs text-slate-400">
              Tip: if you want “green/yellow/red” bands, tell me the exact score range you want (0–100 or 0–1).
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} DeedSense • Trust Scan • Investor-first risk clarity
        </div>
      </div>
    </div>
  );
}
