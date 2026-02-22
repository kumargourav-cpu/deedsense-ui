import React, { useMemo } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import { t } from "../lib/i18n";

function safeArray(v) { return Array.isArray(v) ? v : []; }

export default function ResultsPanel({ result, plan, language }) {
  const report = result?.report || result || null;

  const radarData = useMemo(() => safeArray(report?.dimensions).slice(0, plan === "basic" ? 3 : 6).map((d) => ({ subject: d?.name || "Metric", value: Number(d?.score || 0) })), [report, plan]);
  const trendData = useMemo(() => safeArray(report?.trend).map((d, i) => ({ i, score: Number(d?.score || 0) })), [report]);

  if (!report) return <section className="glass-card p-6 text-slate-300">{t(language, "noReport")}</section>;

  const rationale = report?.rationale || {};
  const maxItems = plan === "basic" ? 2 : 5;

  return (
    <section className="glass-card p-6">
      <h2 className="text-2xl font-bold text-white">{t(language, "report")}</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="metric-card"><span>Rank</span><b>{report?.summary?.rank || "B"}</b></div>
        <div className="metric-card"><span>Overall Score</span><b>{report?.summary?.overall_score ?? 0}</b></div>
        <div className="metric-card"><span>Confidence</span><b>{report?.summary?.confidence ?? 0}%</b></div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="panel">
          <h3>{t(language, "summary")}</h3>
          <ul>{safeArray(rationale?.strengths).slice(0, maxItems).map((x) => <li key={x}>{x}</li>)}</ul>
          <ul>{safeArray(rationale?.risks).slice(0, maxItems).map((x) => <li key={x}>{x}</li>)}</ul>
        </div>
        {plan !== "basic" ? (
          <div className="panel h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}><PolarGrid /><PolarAngleAxis dataKey="subject" /><PolarRadiusAxis domain={[0, 100]} /><Radar dataKey="value" stroke="#67e8f9" fill="#22d3ee" fillOpacity={0.35} /></RadarChart>
            </ResponsiveContainer>
          </div>
        ) : null}
      </div>

      {plan !== "basic" ? (
        <div className="panel mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}><XAxis dataKey="i" /><YAxis domain={[0, 100]} /><Tooltip /><Line type="monotone" dataKey="score" stroke="#a78bfa" strokeWidth={3} dot={false} /></LineChart>
          </ResponsiveContainer>
        </div>
      ) : null}

      <div className="panel mt-4">
        <h3>{t(language, "recommendations")}</h3>
        <ul>{safeArray(rationale?.recommendations).slice(0, maxItems).map((x) => <li key={x}>{x}</li>)}</ul>
        <h3>{t(language, "nextActions")}</h3>
        <ul>{safeArray(rationale?.next_actions).slice(0, maxItems).map((x) => <li key={x}>{x}</li>)}</ul>
      </div>

      <div className="panel mt-4">
        <h3>{t(language, "planNotes")}</h3>
        <p>{plan === "basic" ? "Basic includes simplified dimensions and compact rationale." : plan === "pro" ? "Pro includes full scoring, rationale, radar and trend analytics." : "Enterprise includes pro features + integration readiness, audit hooks, and custom fields placeholders."}</p>
      </div>
    </section>
  );
}
