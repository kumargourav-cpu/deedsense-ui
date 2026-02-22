import React from "react";

const faqs = [
  { q: "Is DeedSense legal advice?", a: "No. It’s a risk signal + screening assistant. Always verify with official documents and qualified professionals." },
  { q: "What can I upload?", a: "PDF, DOCX, TXT, PNG, JPG/JPEG. Scanned PDFs/images use OCR to extract text." },
  { q: "Why do you show a risk score?", a: "Scores help compare deals quickly. The score is based on detected language patterns and missing clarity indicators." },
  { q: "Can this detect scams with 100% accuracy?", a: "No tool can guarantee that. Think of it as an early warning system to guide your next verification steps." },
  { q: "What should I do if the tool flags 'guaranteed returns'?", a: "Request written proof, verify legal structure, check disclaimers, and validate with the developer’s official documentation." },
  { q: "Will this work outside UAE?", a: "Yes. Language patterns and manipulation tactics are universal. Country-specific compliance checks can be added later." },
  { q: "Do you store my documents?", a: "In the current MVP, the API may store a scan history only if a database is enabled. You control that at deployment." },
  { q: "Can teams use it?", a: "Yes — Enterprise is designed for teams, API integration, and custom scoring rules." }
];

export default function FAQ() {
  return (
    <div className="card">
      <div className="text-sm font-extrabold">FAQs</div>
      <div className="mt-4 space-y-3">
        {faqs.map((f, i) => (
          <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="font-semibold">{f.q}</div>
            <div className="mt-2 text-sm text-slate-200">{f.a}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
