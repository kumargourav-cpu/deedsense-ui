import React from "react";
import FAQ from "./FAQ.jsx";

export default function About() {
  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur-xl">
        <div className="text-lg font-semibold text-white">About DeedSense</div>
        <div className="mt-2 text-sm text-slate-300 leading-relaxed">
          DeedSense is a trust & manipulation risk scanner designed for property investors (UAE + worldwide).
          It helps you quickly spot urgency pressure, suspicious guarantees, unclear payment terms, and
          persuasion patterns commonly used in misleading listings or broker messages.
          <br /><br />
          Ideal for: international investors, end-buyers, family offices, brokers who want to build trust,
          compliance teams, and real estate marketplaces.
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {[
            ["Broker WhatsApp scans", "Detect urgency and manipulative language fast."],
            ["Payment plan review", "Spot hidden ambiguity, pressure, or unrealistic claims."],
            ["Listing analysis", "Summarize red flags before you waste time."],
            ["Document OCR", "Extract text from scanned PDFs/images to scan."],
          ].map(([title, desc]) => (
            <div key={title} className="rounded-2xl bg-black/20 p-4 ring-1 ring-white/10">
              <div className="text-sm font-semibold text-white">{title}</div>
              <div className="mt-1 text-sm text-slate-300">{desc}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-2xl bg-amber-500/10 p-4 ring-1 ring-amber-300/20 text-sm text-amber-100">
          Always verify via official documents, escrow/payment proof, and legal due diligence.
        </div>
      </div>

      <FAQ />
    </div>
  );
}
