// src/components/FAQ.jsx
import React from "react";

const FAQS = [
  {
    q: "Is DeedSense a “Trustpilot for real estate”?",
    a: "Not exactly. Trustpilot is reviews-based. DeedSense analyzes text (listings, chats, brochures) to detect persuasion tactics, missing terms, and risk signals. It’s more like a due-diligence accelerator + messaging risk scanner.",
  },
  {
    q: "Can it analyze UAE properties and global listings?",
    a: "Yes. The patterns (pressure language, vague promises, missing fees, unclear timeline) apply worldwide. UAE investors benefit because many deals happen fast and over messaging platforms.",
  },
  {
    q: "Is it legal advice?",
    a: "No. It’s a risk signal. Always verify with official documents and legal/regulated checks before paying.",
  },
  {
    q: "Why do scams feel so convincing?",
    a: "Because they use urgency, authority cues, scarcity, and social proof. DeedSense flags these persuasion patterns when they appear in text.",
  },
  {
    q: "Does it support PDF and images?",
    a: "Yes—if your backend has OCR + PDF extraction enabled. The UI is ready. If your API /extract is not deployed yet, upload will show a clear error.",
  },
  {
    q: "What should I paste for best results?",
    a: "Paste the broker’s message + payment plan terms + fee breakdown + any timeline/hand-over promises. The more context, the better.",
  },
  {
    q: "Do you store my documents?",
    a: "In this MVP, history is stored in your browser. For production, you can store encrypted reports per signed-in user. (We can implement a privacy-first design.)",
  },
  {
    q: "What’s the difference between Risk and Manipulation scores?",
    a: "Risk focuses on deal/term uncertainty. Manipulation focuses on persuasion tactics (pressure, urgency, promises, vague commitments). Trust is the opposite signal (clarity, transparency, verifiability).",
  },
  {
    q: "Can agencies use this tool to build trust with clients?",
    a: "Yes. Agencies can scan their own listings for compliance and transparency before publishing — and show clients a trust/risk report to improve confidence.",
  },
  {
    q: "Will there be an enterprise API?",
    a: "Yes. Enterprise plans can integrate scoring into portals/CRMs, allow team dashboards, admin rules, and SLA-based service.",
  },
];

export default function FAQ() {
  return (
    <div className="glass rounded-3xl p-5">
      <div>
        <div className="text-lg font-extrabold">FAQs</div>
        <div className="mt-1 text-sm text-slate-300">
          Quick answers about what DeedSense is (and what it is not).
        </div>
      </div>

      <div className="hr" />

      <div className="space-y-3">
        {FAQS.map((f, i) => (
          <details
            key={i}
            className="rounded-2xl border border-white/10 bg-white/5 p-4"
          >
            <summary className="cursor-pointer text-sm font-bold text-slate-100">
              {f.q}
            </summary>
            <div className="mt-2 text-sm text-slate-200">{f.a}</div>
          </details>
        ))}
      </div>
    </div>
  );
}
