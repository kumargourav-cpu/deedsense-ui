import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function ResultsPanel({ extractedText, apiResponse }) {
  const result = apiResponse?.result;
  const chartData = useMemo(() => {
    if (!result) return [];
    const score = Number(result.risk_score || 0);
    return [
      { name: "Risk", value: score },
      { name: "Confidence", value: Math.round(Number(result.confidence || 0) * 100) }
    ];
  }, [result]);

  return (
    <div className="rounded-3xl bg-white/5 p-5 ring-1 ring-white/10 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-base font-semibold text-white">Results</div>
          <div className="mt-1 text-sm text-slate-400">
            Actionable summary + signals (MVP). Plug your advanced model later.
          </div>
        </div>
        {result && (
          <div className="rounded-2xl bg-white/8 px-4 py-2 text-sm text-white ring-1 ring-white/10">
            Risk: <span className="font-semibold">{result.risk_label}</span>{" "}
            <span className="text-slate-300">({result.risk_score}/100)</span>
          </div>
        )}
      </div>

      {!result ? (
        <div className="mt-4 rounded-2xl bg-black/20 p-5 text-sm text-slate-400 ring-1 ring-white/10">
          Run a scan to see results here.
        </div>
      ) : (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl bg-black/20 p-4 ring-1 ring-white/10">
            <div className="text-sm font-semibold text-white">Summary</div>
            <div className="mt-2 text-sm text-slate-200">
              {result.summary || "—"}
            </div>

            <div className="mt-4 text-sm font-semibold text-white">Signals</div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-200">
              {(result.signals || []).length === 0 ? (
                <li className="text-slate-400">No strong manipulation signals detected.</li>
              ) : (
                (result.signals || []).map((s, i) => <li key={i}>{s}</li>)
              )}
            </ul>
          </div>

          <div className="rounded-2xl bg-black/20 p-4 ring-1 ring-white/10">
            <div className="text-sm font-semibold text-white">Charts</div>
            <div className="mt-3 h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-xs text-slate-400">
              Confidence shown as %. Risk shown as /100.
            </div>
          </div>

          <div className="lg:col-span-2 rounded-2xl bg-black/20 p-4 ring-1 ring-white/10">
            <div className="text-sm font-semibold text-white">Extracted text (copy-paste full file)</div>
            <textarea
              readOnly
              value={extractedText || ""}
              rows={8}
              className="mt-2 w-full resize-none rounded-2xl bg-white/5 p-3 text-xs text-slate-100 ring-1 ring-white/10"
            />
          </div>
        </div>
      )}
    </div>
  );
}
