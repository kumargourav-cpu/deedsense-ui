// src/components/ResultsPanel.jsx
import React, { useMemo } from "react";

function pct(n) {
  const v = Number.isFinite(n) ? n : 0;
  return Math.max(0, Math.min(100, Math.round(v)));
}

function scoreColor(score) {
  const s = pct(score);
  if (s >= 70) return "from-emerald-400 to-emerald-600";
  if (s >= 45) return "from-amber-400 to-amber-600";
  return "from-rose-400 to-rose-600";
}

function normalizeReport(report) {
  // We adapt to whatever your API returns.
  // If minimal, we still show structured sections.
  const r = report || {};

  const scores = r.scores || r.score || {};
  const risk = scores.risk ?? r.risk_score ?? r.risk ?? 50;
  const trust = scores.trust ?? r.trust_score ?? r.trust ?? 50;
  const manipulation = scores.manipulation ?? r.manipulation_score ?? r.manipulation ?? 50;

  return {
    title: r.title || "DeedSense Risk Report",
    summary:
      r.summary ||
      r.executive_summary ||
      "Run a scan to generate an investor-grade summary, red flags, and due diligence checklist.",
    key_findings: r.key_findings || r.findings || [],
    red_flags: r.red_flags || r.flags || r.risks || [],
    due_diligence: r.due_diligence || r.checklist || [],
    recommendations: r.recommendations || r.next_steps || [],
    confidence: r.confidence ?? r.confidence_score ?? 0.62,
    scores: {
      risk,
      trust,
      manipulation,
    },
    raw: r,
  };
}

export default function ResultsPanel({ report, extractedMeta }) {
  const R = useMemo(() => normalizeReport(report), [report]);

  const hasReport = !!report;

  return (
    <div className="glass rounded-3xl p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-lg font-extrabold">Results</div>
          <div className="mt-1 text-sm text-slate-300">
            Actionable summary + manipulation signals + investor checklist
          </div>
        </div>
        {extractedMeta ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-slate-300">
            <div className="font-semibold text-slate-200">Extraction</div>
            <div className="mt-1">
              {extractedMeta?.source || "Uploaded file"} •{" "}
              {extractedMeta?.pages ? `${extractedMeta.pages} pages` : "text"}
              {extractedMeta?.ocr ? " • OCR enabled" : ""}
            </div>
          </div>
        ) : null}
      </div>

      <div className="hr" />

      {!hasReport ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
          Run a scan to see:
          <ul className="mt-2 list-disc pl-6 text-slate-300">
            <li>Executive summary (what matters in 15 seconds)</li>
            <li>Manipulation & urgency patterns</li>
            <li>Hidden risk signals (payments, fees, timelines)</li>
            <li>Due diligence checklist (documents to demand)</li>
            <li>Investor next steps (what to verify)</li>
          </ul>
        </div>
      ) : (
        <>
          {/* Score cards */}
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { k: "Trust", v: R.scores.trust, hint: "Higher is better" },
              { k: "Risk", v: R.scores.risk, hint: "Higher = more risk" },
              { k: "Manipulation", v: R.scores.manipulation, hint: "Pressure + persuasion patterns" },
            ].map((s) => (
              <div key={s.k} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold">{s.k}</div>
                  <div className="text-xs text-slate-400">{s.hint}</div>
                </div>
                <div className="mt-3">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full bg-gradient-to-r ${scoreColor(s.v)}`}
                      style={{ width: `${pct(s.v)}%` }}
                    />
                  </div>
                  <div className="mt-2 text-2xl font-extrabold">{pct(s.v)}%</div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-bold">Executive summary</div>
            <div className="mt-2 whitespace-pre-wrap text-sm text-slate-200">
              {R.summary}
            </div>
            <div className="mt-3 text-xs text-slate-400">
              Confidence: <b className="text-slate-200">{Math.round((R.confidence || 0.62) * 100)}%</b>
              {" "}• Always validate with primary documents.
            </div>
          </div>

          {/* Findings */}
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm font-bold">Key findings</div>
              <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-slate-200">
                {(Array.isArray(R.key_findings) ? R.key_findings : [])
                  .slice(0, 10)
                  .map((x, i) => (
                    <li key={i}>{String(x)}</li>
                  ))}
                {(!R.key_findings || R.key_findings.length === 0) ? (
                  <li className="text-slate-400">No structured findings returned — your API can add a `key_findings: []` array for richer output.</li>
                ) : null}
              </ul>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm font-bold">Red flags & risk signals</div>
              <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-slate-200">
                {(Array.isArray(R.red_flags) ? R.red_flags : [])
                  .slice(0, 12)
                  .map((x, i) => (
                    <li key={i}>{String(x)}</li>
                  ))}
                {(!R.red_flags || R.red_flags.length === 0) ? (
                  <li className="text-slate-400">No red flags returned — your API can add a `red_flags: []` array and `scores` for charts.</li>
                ) : null}
              </ul>
            </div>
          </div>

          {/* Due diligence + Recommendations */}
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm font-bold">Due diligence checklist</div>
              <div className="mt-2 text-xs text-slate-400">
                Documents you should request or verify before paying any booking amount:
              </div>
              <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-slate-200">
                {(Array.isArray(R.due_diligence) ? R.due_diligence : [])
                  .slice(0, 12)
                  .map((x, i) => (
                    <li key={i}>{String(x)}</li>
                  ))}
                {(!R.due_diligence || R.due_diligence.length === 0) ? (
                  <>
                    <li>Official SPA / Sale agreement draft</li>
                    <li>Payment plan with all fees (DLD/RERA/admin/agent/maintenance)</li>
                    <li>Escrow proof / account details</li>
                    <li>Developer/agent license verification</li>
                    <li>Handover timeline + penalty clauses</li>
                    <li>Oqood/Title deed status (as applicable)</li>
                  </>
                ) : null}
              </ul>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm font-bold">Recommended next steps</div>
              <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-slate-200">
                {(Array.isArray(R.recommendations) ? R.recommendations : [])
                  .slice(0, 12)
                  .map((x, i) => (
                    <li key={i}>{String(x)}</li>
                  ))}
                {(!R.recommendations || R.recommendations.length === 0) ? (
                  <>
                    <li>Ask for the full fee breakdown (not just “starting price”).</li>
                    <li>Request written confirmation of refund/cancellation rules.</li>
                    <li>Verify escrow + developer registration before any transfer.</li>
                    <li>Compare the message against official brochure / SPA terms.</li>
                  </>
                ) : null}
              </ul>
            </div>
          </div>

          {/* Raw JSON toggle */}
          <details className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4">
            <summary className="cursor-pointer text-sm font-bold text-slate-200">
              Advanced (raw report JSON)
            </summary>
            <pre className="mt-3 overflow-auto rounded-2xl border border-white/10 bg-black/30 p-3 text-xs text-slate-200">
{JSON.stringify(R.raw, null, 2)}
            </pre>
          </details>
        </>
      )}
    </div>
  );
}
