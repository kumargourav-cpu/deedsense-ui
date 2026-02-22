import React from "react";

const QA = [
  {
    q: "Is DeedSense legal advice?",
    a: "No. It provides a structured risk signal and checklist. Always validate with official documents and professional due diligence."
  },
  {
    q: "What can I scan?",
    a: "Listing descriptions, broker messages, payment plan terms, deed notes, screenshots, and scanned PDFs (OCR)."
  },
  {
    q: "Does it work on scanned PDFs?",
    a: "Yes — if OCR is enabled on the API (Docker build with Tesseract + Poppler)."
  },
  {
    q: "Why do I sometimes get a 'Medium/High' risk score?",
    a: "Usually because of urgency/scarcity pressure, guarantee claims, missing key details (fees/terms), or ambiguous language."
  },
  {
    q: "Do you store my uploaded documents?",
    a: "In this no-login build, history is stored locally in your browser. The API processes your upload and returns results."
  },
  {
    q: "How can agencies use this?",
    a: "As a first-pass screening tool, internal training aid, and a standard due-diligence checklist generator."
  },
  {
    q: "Can I export a report?",
    a: "Yes — Download report as PDF from the Results panel (client-side)."
  }
];

export default function FAQ() {
  return (
    <div className="card p-6">
      <div className="text-xl font-extrabold">FAQs</div>
      <div className="mt-2 text-sm text-slate-300">
        Answers to common questions from investors and agency teams.
      </div>

      <div className="mt-6 grid gap-2">
        {QA.map((x) => (
          <div key={x.q} className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm font-extrabold">{x.q}</div>
            <div className="mt-2 text-sm text-slate-300 leading-relaxed">{x.a}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
