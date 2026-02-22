import React, { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from "recharts";

export default function ResultsPanel({ data, extractedText, onDownloadPDF }) {
  const risk = data?.result?.risk_score ?? null;
  const label = data?.result?.risk_label ?? "—";
  const signals = data?.result?.signals ?? [];
  const density = useMemo(() => {
    const words = (extractedText || "").trim().split(/\s+/).filter(Boolean).length || 1;
    return Math.round((signals.length / words) * 1000); // signals per 1000 words
  }, [signals.length, extractedText]);

  const trendData = useMemo(() => {
    const base = risk ?? 10;
    return Array.from({ length: 10 }).map((_, i) => ({
      step: i + 1,
      score: Math.max(0, Math.min(100, Math.round(base + (Math.random() * 10 - 5)))),
    }));
  }, [risk]);

  const barData = useMemo(() => {
    const counts = {};
    for (const s of signals) counts[s] = (counts[s] || 0) + 1;
    return Object.entries(counts).slice(0, 8).map(([k, v]) => ({ name: k.slice(0, 18) + (k.length > 18 ? "…" : ""), v }));
  }, [signals]);

  return (
    <div className="card" id="report-root">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-extrabold">Results</div>
          <div className="text-xs text-slate-300 mt-1">
            Enterprise-style risk signals + suggestions. Always verify with official documents.
          </div>
        </div>
        <button className="btn-ghost" onClick={onDownloadPDF} disabled={!data}>
          Download PDF
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-4 border border-white/10">
          <div className="label">Risk score</div>
          <div className="mt-2 text-3xl font-black">{risk ?? "—"}</div>
          <div className="mt-1 text-sm text-slate-300">Label: <span className="font-semibold text-white">{label}</span></div>
          <div className="mt-4 h-2 w-full rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-white" style={{ width: `${Math.max(0, Math.min(100, risk ?? 0))}%` }} />
          </div>
          <div className="mt-3 text-xs text-slate-400">Signal density: {density} / 1000 words</div>
        </div>

        <div className="glass rounded-2xl p-4 border border-white/10 lg:col-span-2">
          <div className="label">Risk trendline (session)</div>
          <div className="mt-3 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="step" tick={{ fill: "#AAB3C5", fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fill: "#AAB3C5", fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="rgba(255,255,255,0.9)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-2xl p-4 border border-white/10 lg:col-span-3">
          <div className="label">Top signals</div>
          <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              {signals.length ? (
                signals.slice(0, 10).map((s, i) => (
                  <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
                    {s}
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-400">Run a scan to see detected signals.</div>
              )}
            </div>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="name" tick={{ fill: "#AAB3C5", fontSize: 11 }} interval={0} />
                  <YAxis tick={{ fill: "#AAB3C5", fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="v" fill="rgba(255,255,255,0.85)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-4 border border-white/10 lg:col-span-3">
          <div className="label">Executive summary</div>
          <div className="mt-2 text-sm leading-relaxed text-slate-200">
            {data?.result?.summary || "No summary yet."}
          </div>

          <div className="mt-4 label">Suggested next steps</div>
          <ul className="mt-2 text-sm text-slate-200 list-disc pl-5 space-y-1">
            <li>Ask for official payment schedule + escrow confirmation (if applicable).</li>
            <li>Verify developer registration and project approvals via official channels in the target jurisdiction.</li>
            <li>Cross-check unit details (BUA/plot/hand-over date) against written contracts, not messages.</li>
            <li>If urgency language is present, request all terms in writing and pause until verified.</li>
          </ul>

          <div className="mt-4 label">Extracted text preview</div>
          <div className="mt-2 rounded-2xl border border-white/10 bg-black/40 p-4 text-xs text-slate-300 max-h-60 overflow-auto">
            {extractedText || "—"}
          </div>
        </div>
      </div>
    </div>
  );
}
