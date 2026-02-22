import React from "react";

export default function About() {
  return (
    <div className="card">
      <div className="text-sm font-extrabold">About DeedSense</div>
      <div className="mt-2 text-sm text-slate-200 leading-relaxed">
        DeedSense is a “trust + manipulation risk scanner” designed for property investors in the UAE and globally.
        It’s built to help you quickly spot pressure tactics, unrealistic guarantees, missing terms, ambiguous payment
        language, and credibility gaps — especially in short-form broker messages and listing descriptions where details
        are often incomplete.
      </div>

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-5 border border-white/10">
          <div className="label">Who it’s for</div>
          <ul className="mt-2 text-sm text-slate-200 list-disc pl-5 space-y-2">
            <li>International investors comparing multiple deals quickly</li>
            <li>End-users evaluating brokers/developers and payment terms</li>
            <li>Teams doing first-pass screening before legal review</li>
            <li>Agencies building a “trust-first” experience for clients</li>
          </ul>
        </div>

        <div className="glass rounded-2xl p-5 border border-white/10">
          <div className="label">What it does</div>
          <ul className="mt-2 text-sm text-slate-200 list-disc pl-5 space-y-2">
            <li>Extracts text from PDF/DOCX/TXT and scanned images using OCR</li>
            <li>Detects manipulation patterns: urgency, scarcity, guarantees, vagueness</li>
            <li>Produces an executive summary + practical next steps</li>
            <li>Generates a downloadable PDF report for sharing</li>
          </ul>
        </div>
      </div>

      <div className="mt-6 text-xs text-slate-300">
        Note: DeedSense provides a risk signal, not legal advice. Always verify via official documents, escrow/payment proof,
        and independent due diligence.
      </div>
    </div>
  );
}
