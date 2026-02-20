import React, { useMemo, useState, useEffect } from "react";
import {
  ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, CartesianGrid,
  AreaChart, Area
} from "recharts";
import { downloadReportPdf } from "../lib/pdf.js";

function labelColor(label) {
  if (label === "Low") return "bg-emerald-400/20 text-emerald-200 border-emerald-300/20";
  if (label === "Guarded") return "bg-amber-400/20 text-amber-200 border-amber-300/20";
  if (label === "High") return "bg-orange-400/20 text-orange-200 border-orange-300/20";
  return "bg-rose-400/20 text-rose-200 border-rose-300/20";
}

// Lightweight client-side signal scoring across chunks (for charts)
// Not the same as backend score; this is a “where it spikes” visualization.
const KW = {
  urgency: ["limited time", "only today", "last chance", "final offer", "book now", "act now", "24 hours"],
  scarcity: ["last unit", "exclusive", "not available later"],
  guarantees: ["guaranteed returns", "100% guarantee", "no risk", "risk-free", "profit guaranteed"],
  anti_dd: ["no questions asked", "trust me", "don't worry", "no need to verify"],
  payment: ["cash only", "crypto", "untraceable", "non-refundable", "no refund", "pay to personal", "personal account"]
};

function countHits(text, list) {
  const t = (text || "").toLowerCase();
  let c = 0;
  for (const k of list) if (t.includes(k)) c++;
  return c;
}

function chunkSignals(extractedText) {
  const t = String(extractedText || "");
  const chunkSize = 420;
  const chunks = [];
  for (let i = 0; i < t.length; i += chunkSize) {
    chunks.push(t.slice(i, i + chunkSize));
  }
  if (chunks.length === 0) chunks.push(t);

  return chunks.map((c, idx) => {
    const urg = countHits(c, KW.urgency);
    const sca = countHits(c, KW.scarcity);
    const gue = countHits(c, KW.guarantees);
    const anti = countHits(c, KW.anti_dd);
    const pay = countHits(c, KW.payment);

    // intensity: weighted
    const intensity = urg * 6 + sca * 5 + gue * 7 + anti * 7 + pay * 8;
    const density = urg + sca + gue + anti + pay;

    return {
      idx: idx + 1,
      intensity,
      density,
      urgency: urg,
      scarcity: sca,
      guarantees: gue,
      anti: anti,
      payment: pay
    };
  });
}

export default function ResultsPanel({ result, extractedText }) {
  const dims = result?.dimensions || {};

  const radarData = useMemo(() => {
    return Object.keys(dims).map((k) => ({ k, v: dims[k] }));
  }, [dims]);

  const barData = useMemo(() => {
    return radarData.map((d) => ({ name: d.k, score: d.v }));
  }, [radarData]);

  const signalSeries = useMemo(() => chunkSignals(extractedText), [extractedText]);

  // Checklist completion (interactive)
  const checklist = useMemo(() => (result?.verification_checklist || []), [result]);
  const [checks, setChecks] = useState({});

  useEffect(() => {
    // reset checks when a new result arrives
    setChecks({});
  }, [result?.created_at]);

  const completion = useMemo(() => {
    if (!checklist.length) return 0;
    const done = checklist.reduce((acc, c) => acc + (checks[c.item] ? 1 : 0), 0);
    return Math.round((done / checklist.length) * 100);
  }, [checklist, checks]);

  if (!result) {
    return (
      <div className="glass rounded-3xl p-6">
        <div className="text-sm text-slate-300">
          Run a scan to see your investor-grade report here.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="glass rounded-3xl p-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-lg font-black tracking-tight">Risk Report</div>
          <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${labelColor(result.risk_label)}`}>
            {result.risk_label_local || result.risk_label} • {result.risk_score}/100
          </span>
          <span className="pill">Confidence: {Math.round((result.confidence || 0) * 100)}%</span>
          <span className="pill">Detected: {result.lang_detected?.toUpperCase?.() || "—"}</span>

          <div className="ml-auto flex items-center gap-2">
            <button
              className="btn-ghost"
              onClick={() =>
                downloadReportPdf({
                  reportTitle: `Risk Report — ${result.risk_label} (${result.risk_score}/100)`,
                  result,
                  extractedText,
                  checklistState: checks
                })
              }
            >
              Download PDF
            </button>
          </div>
        </div>

        <div className="mt-4 text-sm text-slate-200 leading-relaxed">
          <div dangerouslySetInnerHTML={{ __html: (result.summary || "").replaceAll("**", "<b>").replaceAll("</b><b>", "") }} />
        </div>
      </div>

      {/* Core charts */}
      <div className="glass rounded-3xl p-6">
        <div className="text-base font-extrabold">Charts</div>
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-bold">Risk Radar</div>
            <div className="h-64 mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="k" tick={{ fill: "rgba(226,232,240,0.75)", fontSize: 11 }} />
                  <Radar dataKey="v" stroke="white" fill="white" fillOpacity={0.15} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-xs text-slate-400 mt-2">
              Higher values represent stronger language-based risk signals.
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-bold">Category Bars</div>
            <div className="h-64 mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis dataKey="name" tick={{ fill: "rgba(226,232,240,0.7)", fontSize: 10 }} interval={0} />
                  <YAxis tick={{ fill: "rgba(226,232,240,0.7)", fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="score" fill="white" opacity={0.35} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-xs text-slate-400 mt-2">
              Use this to prioritize what to verify first.
            </div>
          </div>
        </div>

        {/* New charts */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-bold">Trendline (Signal Intensity)</div>
            <div className="h-64 mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={signalSeries}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="idx" tick={{ fill: "rgba(226,232,240,0.7)", fontSize: 10 }} />
                  <YAxis tick={{ fill: "rgba(226,232,240,0.7)", fontSize: 10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="intensity" stroke="white" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="text-xs text-slate-400 mt-2">
              Shows where risk-signals spike from start → end of the document.
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-bold">Signal Density (Clusters)</div>
            <div className="h-64 mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={signalSeries}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="idx" tick={{ fill: "rgba(226,232,240,0.7)", fontSize: 10 }} />
                  <YAxis tick={{ fill: "rgba(226,232,240,0.7)", fontSize: 10 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="density" stroke="white" fill="white" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="text-xs text-slate-400 mt-2">
              Density = how many “risk keywords” appear per chunk (not a verdict, just clustering).
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm font-bold">What’s driving density?</div>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
            {[
              ["urgency", "Urgency"],
              ["scarcity", "Scarcity"],
              ["guarantees", "Guarantees"],
              ["anti", "Anti-DD"],
              ["payment", "Payments"]
            ].map(([k, label]) => {
              const total = signalSeries.reduce((acc, r) => acc + (r[k] || 0), 0);
              return (
                <div key={k} className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <div className="text-slate-400">{label}</div>
                  <div className="text-base font-black mt-1">{total}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Flags */}
      <div className="glass rounded-3xl p-6">
        <div className="text-base font-extrabold">Top Flags</div>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          {(result.top_flags || []).slice(0, 10).map((f, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs text-slate-400 uppercase tracking-wide">{f.dimension}</div>
              <div className="mt-1 text-sm text-slate-200">{f.note}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="glass rounded-3xl p-6">
        <div className="text-base font-extrabold">Recommendations</div>
        <div className="mt-3 space-y-3">
          {(result.recommendations || []).map((r, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="font-bold">{r.title}</div>
                <span className="pill">{r.priority}</span>
              </div>
              <div className="mt-2 text-sm text-slate-200 leading-relaxed">{r.details}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Checklist with completion */}
      <div className="glass rounded-3xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-base font-extrabold">Verification Checklist</div>
            <div className="text-sm text-slate-300 mt-1">
              Tick items as you confirm them. Completion is saved for this session (and included in the PDF).
            </div>
          </div>
          <span className="pill">Completion: {completion}%</span>
        </div>

        <div className="mt-4 h-2 rounded-full bg-white/10 overflow-hidden">
          <div className="h-2 bg-white rounded-full transition-all" style={{ width: `${completion}%` }} />
        </div>

        <div className="mt-4 space-y-2">
          {(result.verification_checklist || []).map((c, i) => (
            <label key={i} className="flex gap-3 items-start rounded-2xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition cursor-pointer">
              <input
                type="checkbox"
                className="mt-1"
                checked={!!checks[c.item]}
                onChange={(e) => setChecks((s) => ({ ...s, [c.item]: e.target.checked }))}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold">{c.category}: {c.item}</div>
                  <span className="pill">Priority {c.priority}</span>
                </div>
                <div className="mt-2 text-sm text-slate-200">{c.why}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Extracted text */}
      <div className="glass rounded-3xl p-6">
        <div className="text-base font-extrabold">Extracted Text (Preview)</div>
        <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-4">
          <pre className="whitespace-pre-wrap text-xs text-slate-200 leading-relaxed">
            {(extractedText || "").slice(0, 6000)}
            {extractedText?.length > 6000 ? "\n\n[Preview truncated]" : ""}
          </pre>
        </div>
      </div>
    </div>
  );
}
