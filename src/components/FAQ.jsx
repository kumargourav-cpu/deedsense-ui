import React from "react";

const items = [
  {
    q: "Is DeedSense legal advice?",
    a: "No. It provides risk signals and summaries to support due diligence."
  },
  {
    q: "Can it detect scams with 100% accuracy?",
    a: "No tool can. Use it to catch red flags faster, then verify with official documents."
  },
  {
    q: "What files are supported?",
    a: "PDF, DOCX, TXT, PNG, JPG, JPEG. Scanned PDFs/images use OCR."
  },
  {
    q: "Do you store my documents?",
    a: "In this MVP, the UI does not store documents. The API may store scan results for signed-in users if Postgres is enabled."
  }
];

export default function FAQ() {
  return (
    <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur-xl">
      <div className="text-lg font-semibold text-white">FAQs</div>
      <div className="mt-4 space-y-3">
        {items.map((it, idx) => (
          <div key={idx} className="rounded-2xl bg-black/20 p-4 ring-1 ring-white/10">
            <div className="text-sm font-semibold text-white">{it.q}</div>
            <div className="mt-1 text-sm text-slate-300">{it.a}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
