import React, { useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { downloadReportAsPDF } from "../lib/pdf.js";

function pctColor(value) {
  if (value >= 70) return "text-red-200";
  if (value >= 40) return "text-amber-200";
  return "text-emerald-200";
}

export default function ResultsPanel({ result, history, onSaveToHistory }) {
  const charts = result?.charts || {};
  const exec = result?.analysis || {};
  const checklist = result?.checklist || {};
  const signals = result?.signals || [];
  const extractedText = result?.extracted_text || "";

  const categoryData = charts?.categoryBreakdown || [];
  const checklistCompletion = charts?.checklistCompletion?.value ?? 0;
  const signalDensity = charts?.signalDensity?.value ?? 0;

  const radarData = useMemo(() => {
    return categoryData.map((d) => ({ subject: d.label, A: d.value, fullMark: 100 }));
  }, [categoryData]);

  const trend = useMemo(() => {
    // Use local history for trendline
    return (history || []).slice(0, 25).reverse().map((h) => ({
      timestamp: new Date(h.createdAt).toLocaleDateString(),
      risk_score: h?.analysis?.risk_score ?? h?.analysis?.executive?.risk_score ?? h?.analysis?.risk_score ?? h?.risk_score ?? h?.result?.analysis?.risk_score ?? 0,
      confidence: h?.analysis?.confidence ?? 0.5
    }));
  }, [history]);

  function doDownloadPDF() {
    const html = `
      <h1>DeedSense Report</h1>
      <div class="muted">Generated: ${new Date().toLocaleString()}</div>

      <div class="card">
        <div><span class="pill">Risk</span> <b>${exec.risk_label || "-"}</b> • Score: <b>${exec.risk_score ?? "-"}</b> • Confidence: <b>${exec.confidence ?? "-"}</b></div>
        <div class="muted" style="margin-top:8px;">${exec.what_it_means || ""}</div>
      </div>

      <div class="card">
        <b>Key signals</b>
        <ul>
          ${(signals || []).slice(0, 12).map(s => `<li>${s.label} (weight ${s.weight})</li>`).join("")}
        </ul>
      </div>

      <div class="card">
        <b>Checklist</b>
        <ul>
          ${Object.entries(checklist).map(([k,v]) => `<li>${v ? "✅" : "❌"} ${k}</li>`).join("")}
        </ul>
      </div>

      <div class="card">
        <b>Extracted text (snippet)</b>
        <pre>${escapeHtml(extractedText.slice(0, 4000))}</pre>
        <div class="muted">Note: truncated for report readability.</div>
      </div>

      <div class="muted">Disclaimer: Not legal advice. Validate claims via official documents and due diligence.</div>
    `;
    downloadReportAsPDF({ title: "DeedSense Report", html });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (m) => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[m]));
  }

  if (!result) {
    return (
      <div className="card p-6">
        <div className="text-sm text-slate-300">
          Run a scan to see results here.
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-lg font-extrabold">Results</div>
            <div className="mt-1 text-sm text-slate-300">
              Actionable summary + risk signals + checklist + investor-grade visuals.
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="btn-ghost" onClick={onSaveToHistory}>
              Save to history
            </button>
            <button className="btn-primary" onClick={doDownloadPDF}>
              Download report (PDF)
            </button>
          </div>
        </div>

        <div className="hr" />

        <div className="grid md:grid-cols-3 gap-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="label">Risk</div>
            <div className={`mt-2 text-2xl font-black ${pctColor(exec.risk_score ?? 0)}`}>
              {exec.risk_label || "—"}
            </div>
            <div className="mt-1 text-sm text-slate-300">
              Score: <span className="font-bold">{exec.risk_score ?? "—"}</span>/100
            </div>
            <div className="mt-2 text-xs text-slate-400">{exec.what_it_means || ""}</div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="label">Checklist completion</div>
            <div className="mt-2 text-2xl font-black">{checklistCompletion}%</div>
            <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-white/30" style={{ width: `${checklistCompletion}%` }} />
            </div>
            <div className="mt-2 text-xs text-slate-400">
              Higher completion generally improves clarity and reduces ambiguity risk.
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="label">Signal density</div>
            <div className="mt-2 text-2xl font-black">{signalDensity}</div>
            <div className="mt-1 text-sm text-slate-300">signals per 1,000 words</div>
            <div className="mt-2 text-xs text-slate-400">
              High density indicates pressure tactics or marketing-heavy claims.
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm font-extrabold">Category Breakdown</div>
            <div className="pill">Heatmap-style scoring</div>
          </div>
          <div className="mt-4 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="label" tick={{ fill: "rgba(226,232,240,0.8)", fontSize: 11 }} />
                <YAxis tick={{ fill: "rgba(226,232,240,0.6)", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#0b1220", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm font-extrabold">Risk Profile (Radar)</div>
            <div className="pill">Investor view</div>
          </div>
          <div className="mt-4 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid opacity={0.2} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "rgba(226,232,240,0.75)", fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "rgba(226,232,240,0.5)", fontSize: 10 }} />
                <Radar dataKey="A" />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-sm font-extrabold">Checklist</div>
            <div className="mt-1 text-xs text-slate-400">What key items were detected in the text?</div>
          </div>
          <div className="pill">Due diligence starter</div>
        </div>

        <div className="mt-4 grid md:grid-cols-2 gap-2">
          {Object.entries(checklist).map(([k, v]) => (
            <div key={k} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="text-sm">{k}</div>
              <div className={`text-xs font-bold ${v ? "text-emerald-200" : "text-red-200"}`}>
                {v ? "Present" : "Missing"}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-sm font-extrabold">Signals</div>
            <div className="mt-1 text-xs text-slate-400">Why the model flagged this content.</div>
          </div>
          <div className="pill">{signals.length} detected</div>
        </div>

        <div className="mt-4 grid gap-2">
          {signals.slice(0, 18).map((s, idx) => (
            <div key={idx} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-semibold">{s.label}</div>
                <div className="pill">weight {s.weight}</div>
              </div>
              <div className="mt-2 text-xs text-slate-400">
                Category: <span className="text-slate-200">{s.category}</span> • Evidence: <span className="text-slate-200">{s.evidence}</span>
              </div>
            </div>
          ))}
          {signals.length === 0 ? (
            <div className="text-sm text-slate-300">No strong risk phrases detected. Still verify documents and terms.</div>
          ) : null}
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-sm font-extrabold">Trendline (Local)</div>
            <div className="mt-1 text-xs text-slate-400">Your scan history trend (stored in this browser).</div>
          </div>
          <div className="pill">{trend.length} points</div>
        </div>

        <div className="mt-4 h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="timestamp" tick={{ fill: "rgba(226,232,240,0.7)", fontSize: 11 }} />
              <YAxis tick={{ fill: "rgba(226,232,240,0.6)", fontSize: 11 }} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: "#0b1220", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
              <Line type="monotone" dataKey="risk_score" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-6">
        <div className="text-sm font-extrabold">Extracted Text (editable copy)</div>
        <div className="mt-2 text-xs text-slate-400">
          Useful for compliance notes or sharing internally.
        </div>
        <textarea className="input mt-3 min-h-[240px]" value={extractedText} readOnly />
      </div>
    </div>
  );
}
