import React from "react";

const FAQS = [
  {
    q: "Is DeedSense legal advice?",
    a: "No. DeedSense provides language-based risk signals and verification suggestions. Always validate using official documents, escrow proofs, and professional due diligence."
  },
  {
    q: "What should I paste for best results?",
    a: "Paste the full listing description + broker message + payment plan terms + any urgency language. The more complete the text, the better the signal quality."
  },
  {
    q: "How does the score work?",
    a: "The score summarizes risk signals found in language patterns: pressure tactics, unverifiable claims, missing documentation cues, and payment risk instructions. It’s a triage tool, not a verdict."
  },
  {
    q: "Does a low score mean it’s safe?",
    a: "No. A low score only means the language itself isn’t strongly manipulative. Many risks exist outside text (fake documents, impersonation, hidden fees). Always verify."
  },
  {
    q: "Can it read scanned PDFs and images?",
    a: "Yes. If a PDF has little extractable text, DeedSense automatically uses OCR. Images (PNG/JPG/JPEG) also use OCR."
  },
  {
    q: "What documents are most important to verify?",
    a: "Title deed/Oqood, SPA/MOU, project registration details, beneficiary verification (payment recipient), agent license, and the refund/cancellation clauses."
  },
  {
    q: "What are common manipulation patterns in real estate deals?",
    a: "False urgency (“only today”), scarcity (“last unit”), overconfidence (“guaranteed returns”), discouraging verification, and pushing payments quickly."
  },
  {
    q: "Can I use this for countries outside UAE?",
    a: "Yes. The risk signals are language-based and broadly applicable. The verification checklist should be adapted to the local registry and legal process."
  },
  {
    q: "Do you store my files?",
    a: "In this build, scan history is stored in your browser only. The API can optionally store anonymized scan results if you enable Postgres later."
  },
  {
    q: "Can DeedSense recommend properties with links?",
    a: "Chat currently runs in offline MVP mode (no web search). We can add a verified web research mode later that returns sources + links."
  }
];

export default function FAQ() {
  return (
    <div className="glass rounded-3xl p-6">
      <div className="text-lg font-black">FAQ</div>
      <div className="text-sm text-slate-300 mt-2">
        Practical questions investors usually ask.
      </div>

      <div className="hr my-5" />

      <div className="space-y-3">
        {FAQS.map((f, i) => (
          <details key={i} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <summary className="cursor-pointer font-semibold">{f.q}</summary>
            <div className="mt-3 text-sm text-slate-200 leading-relaxed">{f.a}</div>
          </details>
        ))}
      </div>
    </div>
  );
}
