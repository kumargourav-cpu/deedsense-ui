// src/components/ResultsPanel.jsx
import React, { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

function safe(n, d = 0) {
  const x = Number(n);
  return Number.isFinite(x) ? x : d;
}

function pretty(obj) {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(obj);
  }
}

// Simple highlight (enterprise-ready baseline)
const PHRASES = [
  { p: "limited time", w: 15 },
  { p: "last unit", w: 15 },
  { p: "guaranteed returns", w: 20 },
  { p: "book now", w: 10 },
  { p: "no questions asked", w: 10 },
  { p: "act now", w: 10 },
  { p: "final chance", w: 12 },
];

function highlightText(text) {
  if (!text) return null;
  const lower = text.toLowerCase();
  const hits = PHRASES.filter(x => lower.includes(x.p));
  if (hits.length === 0) return <div className="whitespace-pre-wrap">{text}</div>;

  // naive highlighter (non-overlapping, phrase-based)
  let parts = [text];
  hits.forEach(({ p }) => {
    const next = [];
    parts.forEach((chunk) => {
      if (typeof chunk !== "string") return next.push(chunk);
      const re = new RegExp(`(${p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig");
      const split = chunk.split(re);
      split.forEach((s, i) => {
        if (i % 2 === 1) {
          next.push(
            <mark key={`${p}-${i}-${Math.random()}`} className="rounded px-1 bg-amber-200 text-amber-900">
              {s}
            </mark>
          );
        } else if (s) next.push(s);
      });
    });
    parts = next;
  });

  return <div className="whitespace-pre-wrap leading-relaxed">{parts}</div>;
}

function scoreExplain(text = "") {
  const t = text.toLowerCase();
  const contributors = [];
  let total = 0;
  for (const { p, w } of PHRASES) {
    if (t.includes(p)) {
      contributors.push({ phrase: p, weight: w });
      total += w;
    }
  }
  total = Math.min(total, 100);
  return { total, contributors };
}

export default function ResultsPanel({ entry, allHistory, onGoCompare }) {
  const [showExplain, setShowExplain] = useState(false);

  const extracted = entry?.extracted_text || "";
  const r = entry?.result || null;

  const riskScore = safe(r?.risk_score, 0);
  const riskLabel = r?.risk_label || "—";
  const signals = Array.isArray(r?.signals) ? r.signals : [];

  const explain = useMemo(() => scoreExplain(extracted), [extracted]);

  // Trendline: last 12 scans risk
  const trend = useMemo(() => {
    const arr = (allHistory || []).slice(0, 12).reverse();
    return arr.map((h, idx) => ({
      name: String(idx + 1),
      score: safe(h?.result?.risk_score, 0),
    }));
  }, [allHistory]);

  // Signal density: count occurrences of known phrases
  const density = useMemo(() => {
    const t = extracted.toLowerCase();
    return PHRASES.map(({ p, w }) => ({
      phrase: p,
      count: t.split(p).length - 1,
      weight: w,
    })).filter(x => x.count > 0);
  }, [extracted]);

  // Checklist completion (simple heuristic)
  const checklist = useMemo(() => {
    const t = extracted.toLowerCase();
    const items = [
      { k: "price", ok: t.includes("aed") || t.includes("$") || t.includes("price") },
      { k: "payment plan", ok: t.includes("payment") || t.includes("installment") },
      { k: "handover", ok: t.includes("handover") || t.includes("completion") },
      { k: "escrow", ok: t.includes("escrow") },
      { k: "title deed", ok: t.includes("title deed") || t.includes("deed") },
      { k: "fees", ok: t.includes("dld") || t.includes("fee") || t.includes("commission") },
    ];
    const done = items.filter(i => i.ok).length;
    return { items, done, total: items.length, pct: Math.round((done / items.length) * 100) };
  }, [extracted]);

  const pieData = [
    { name: "Risk", value: riskScore },
    { name: "Residual", value: Math.max(0, 100 - riskScore) },
  ];

  const pieColors = ["#ef4444", "#22c55e"];

  function exportPdfClientSide() {
    // “Client-side PDF” without extra deps: open a print-ready window.
    // Users choose “Save as PDF”.
    const html = `
      <html><head><title>DeedSense Report</title>
      <style>
        body{font-family:Arial; padding:24px; color:#0f172a;}
        h1{margin:0 0 8px}
        .muted{color:#64748b}
        .card{border:1px solid #e2e8f0; border-radius:12px; padding:14px; margin:12px 0;}
        pre{white-space:pre-wrap; word-break:break-word;}
      </style></head><body>
      <h1>DeedSense Report</h1>
      <div class="muted">${new Date().toLocaleString()}</div>
      <div class="card"><b>Risk Score:</b> ${riskScore} / 100 • <b>Label:</b> ${riskLabel}</div>
      <div class="card"><b>Signals</b><pre>${signals.join("\n")}</pre></div>
      <div class="card"><b>Summary</b><pre>${r?.summary || ""}</pre></div>
      <div class="card"><b>Extracted Text</b><pre>${(extracted || "").slice(0, 20000)}</pre></div>
      <div class="card"><b>Raw JSON</b><pre>${pretty(r)}</pre></div>
      <script>window.print()</script>
      </body></html>
    `;
    const w = window.open("", "_blank");
    w.document.open();
    w.document.write(html);
    w.document.close();
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-extrabold">Results</div>
            <div className="mt-1 text-sm text-slate-300">
              Enterprise-style breakdown: score • evidence • charts • checklist • actions
            </div>
          </div>

          <div className="flex gap-2">
            <button
              className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
              onClick={exportPdfClientSide}
              disabled={!entry}
              title={!entry ? "Run a scan first" : "Print → Save as PDF"}
            >
              Download report (PDF)
            </button>
            <button
              className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
              onClick={onGoCompare}
            >
              Compare scans
            </button>
          </div>
        </div>

        {!entry ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
            Run a scan to see results here.
          </div>
        ) : (
          <>
            {/* Score row */}
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-white p-4 text-slate-900 shadow">
                <div className="text-xs font-semibold text-slate-500">Risk score</div>
                <div className="mt-1 text-3xl font-black">
                  <span className={riskScore >= 50 ? "text-rose-600" : riskScore >= 20 ? "text-amber-600" : "text-emerald-600"}>
                    {riskScore}
                  </span>
                  <span className="text-slate-400 text-base font-semibold"> / 100</span>
                </div>
                <div className="mt-2 text-sm">
                  Label:{" "}
                  <span className="font-bold">
                    {riskLabel}
                  </span>
                </div>

                <button
                  className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold hover:bg-slate-100"
                  onClick={() => setShowExplain((s) => !s)}
                >
                  Explain score
                </button>
              </div>

              <div className="rounded-2xl bg-white p-4 text-slate-900 shadow md:col-span-2">
                <div className="text-xs font-semibold text-slate-500">Risk gauge</div>
                <div className="mt-2 h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} dataKey="value" innerRadius={45} outerRadius={70}>
                        {pieData.map((_, idx) => (
                          <Cell key={idx} fill={pieColors[idx % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: "white", borderRadius: 12, border: "1px solid #e2e8f0" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Tip: Use “Evidence highlighting” below to validate which phrases triggered the score.
                </div>
              </div>
            </div>

            {/* Explain score drawer */}
            {showExplain ? (
              <div className="mt-4 rounded-2xl bg-white p-4 text-slate-900 shadow">
                <div className="flex items-center justify-between">
                  <div className="font-extrabold">Explain score</div>
                  <button
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold hover:bg-slate-100"
                    onClick={() => setShowExplain(false)}
                  >
                    Close
                  </button>
                </div>
                <div className="mt-2 text-sm text-slate-600">
                  Top contributors (heuristic weights). Your model can later replace these.
                </div>
                <div className="mt-3 grid gap-2">
                  {explain.contributors.length === 0 ? (
                    <div className="text-sm text-slate-600">No known high-pressure phrases detected.</div>
                  ) : (
                    explain.contributors.map((c) => (
                      <div
                        key={c.phrase}
                        className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                      >
                        <div className="text-sm font-semibold">{c.phrase}</div>
                        <div className="text-sm font-black text-rose-600">+{c.weight}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : null}

            {/* Trendline + density */}
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-white p-4 text-slate-900 shadow">
                <div className="text-xs font-semibold text-slate-500">Trendline (recent scans)</div>
                <div className="mt-2 h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trend}>
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip contentStyle={{ background: "white", borderRadius: 12, border: "1px solid #e2e8f0" }} />
                      <Line type="monotone" dataKey="score" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-4 text-slate-900 shadow">
                <div className="text-xs font-semibold text-slate-500">Signal density</div>
                <div className="mt-2 h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={density}>
                      <XAxis dataKey="phrase" hide />
                      <YAxis allowDecimals={false} />
                      <Tooltip contentStyle={{ background: "white", borderRadius: 12, border: "1px solid #e2e8f0" }} />
                      <Bar dataKey="count" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  Higher density = more repeated pressure terms.
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div className="mt-4 rounded-2xl bg-white p-4 text-slate-900 shadow">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-slate-500">Checklist completion</div>
                <div className="text-sm font-black">{checklist.pct}%</div>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${checklist.pct}%` }} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3">
                {checklist.items.map((it) => (
                  <div
                    key={it.k}
                    className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                      it.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-slate-50 text-slate-600"
                    }`}
                  >
                    {it.k}
                  </div>
                ))}
              </div>
            </div>

            {/* Signals + summary */}
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-white p-4 text-slate-900 shadow">
                <div className="text-xs font-semibold text-slate-500">Signals</div>
                <div className="mt-2 space-y-2">
                  {signals.length === 0 ? (
                    <div className="text-sm text-slate-600">No signals returned.</div>
                  ) : (
                    signals.map((s, idx) => (
                      <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                        {s}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-2xl bg-white p-4 text-slate-900 shadow">
                <div className="text-xs font-semibold text-slate-500">Summary + tips</div>
                <div className="mt-2 text-sm whitespace-pre-wrap text-slate-700">
                  {r?.summary || "No summary returned."}
                </div>
                <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                  <b>Tip:</b> Ask for escrow proof, payment receipts, title deed / Oqood (UAE), developer official confirmation, and verify commissions & fees in writing.
                </div>
              </div>
            </div>

            {/* Evidence highlighting */}
            <div className="mt-4 rounded-2xl bg-white p-4 text-slate-900 shadow">
              <div className="text-xs font-semibold text-slate-500">Evidence highlighting (extracted text)</div>
              <div className="mt-2 max-h-72 overflow-auto rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800">
                {highlightText(extracted)}
              </div>
            </div>

            {/* Raw JSON */}
            <div className="mt-4 rounded-2xl bg-white p-4 text-slate-900 shadow">
              <div className="text-xs font-semibold text-slate-500">Raw result JSON</div>
              <pre className="mt-2 max-h-64 overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
                {pretty(r)}
              </pre>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
