import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip,
} from "recharts";

function labelColor(label) {
  if (label === "Low") return "bg-emerald-400/20 text-emerald-200 border-emerald-300/20";
  if (label === "Guarded") return "bg-amber-400/20 text-amber-200 border-amber-300/20";
  if (label === "High") return "bg-orange-400/20 text-orange-200 border-orange-300/20";
  return "bg-rose-400/20 text-rose-200 border-rose-300/20";
}

export default function ResultsPanel({ result, extractedText }) {
  const dims = result?.dimensions || {};
  const radarData = useMemo(() => {
    return Object.keys(dims).map((k) => ({ k, v: dims[k] }));
  }, [dims]);

  const barData = useMemo(() => {
    return radarData.map((d) => ({ name: d.k, score: d.v }));
  }, [radarData]);

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
      <div className="glass rounded-3xl p-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-lg font-black tracking-tight">Risk Report</div>
          <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${labelColor(result.risk_label)}`}>
            {result.risk_label_local || result.risk_label} • {result.risk_score}/100
          </span>
          <span className="pill">Confidence: {Math.round((result.confidence || 0) * 100)}%</span>
          <span className="pill">Detected: {result.lang_detected?.toUpperCase?.() || "—"}</span>
        </div>

        <div className="mt-4 text-sm text-slate-200 leading-relaxed">
          <div dangerouslySetInnerHTML={{ __html: (result.summary || "").replaceAll("**", "<b>").replaceAll("</b><b>", "") }} />
        </div>

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
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
      </div>

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

      <div className="glass rounded-3xl p-6">
        <div className="text-base font-extrabold">Verification Checklist</div>
        <div className="mt-3 space-y-2">
          {(result.verification_checklist || []).map((c, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold">{c.category}: {c.item}</div>
                <span className="pill">Priority {c.priority}</span>
              </div>
              <div className="mt-2 text-sm text-slate-200">{c.why}</div>
            </div>
          ))}
        </div>
      </div>

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
