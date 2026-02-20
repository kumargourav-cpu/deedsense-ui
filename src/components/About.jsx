// src/components/About.jsx
import React from "react";

export default function About() {
  return (
    <div className="glass rounded-3xl p-5">
      <div>
        <div className="text-lg font-extrabold">About DeedSense</div>
        <div className="mt-1 text-sm text-slate-300">
          DeedSense (also branded as DeepSense internally) is a trust & manipulation risk scanner built for
          property investors — UAE and global — to quickly spot persuasion tactics, hidden risks, and weak terms
          in listings, broker messages, and payment plan language.
        </div>
      </div>

      <div className="hr" />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm font-bold">Why this matters</div>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-slate-200">
            <li>Most investor losses start with <b>miscommunication</b>, not fraud.</li>
            <li>Pressure language can push buyers into rushed payments or weak terms.</li>
            <li>Hidden fees and vague timelines often appear in “friendly” chat messages.</li>
            <li>Scanned PDFs and brochures can hide critical clauses in plain sight.</li>
          </ul>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm font-bold">Who uses it</div>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-slate-200">
            <li>Individual investors & first-time buyers</li>
            <li>Real estate agencies (trust-building at scale)</li>
            <li>Developer sales teams (clean messaging audits)</li>
            <li>Portals / marketplaces (automated trust scoring)</li>
            <li>Legal / compliance teams (triage before review)</li>
          </ul>
        </div>
      </div>

      <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm font-bold">Typical use cases</div>
        <div className="mt-2 grid gap-3 md:grid-cols-3">
          {[
            { t: "Listing risk scan", d: "Scan listing text for urgency, exaggeration, missing terms, and misleading positioning." },
            { t: "Broker message audit", d: "Detect manipulation patterns, pressure tactics, and vague commitments in WhatsApp/email." },
            { t: "Payment plan review", d: "Flag unclear fees, risky timelines, weak refund clauses, and missing escrow clarity." },
            { t: "Due diligence checklist", d: "Generate what documents to request next and what to verify before paying." },
            { t: "Internal QA for agencies", d: "Standardize how listings are written and reduce compliance exposure." },
            { t: "Enterprise API scoring", d: "Integrate a trust/risk signal into portals, CRMs, and investor dashboards." },
          ].map((c) => (
            <div key={c.t} className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <div className="text-sm font-bold">{c.t}</div>
              <div className="mt-1 text-xs text-slate-300">{c.d}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm font-bold">Important disclaimer</div>
        <div className="mt-2 text-sm text-slate-200">
          DeedSense provides a <b>risk signal</b> based on text patterns and AI analysis. It is not legal advice,
          not a guarantee of outcome, and must be validated with official documents and professional due diligence.
        </div>
      </div>
    </div>
  );
}
