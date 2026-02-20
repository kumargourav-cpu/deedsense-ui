import React from "react";

export default function About() {
  return (
    <div className="glass rounded-3xl p-6 space-y-6">
      <div>
        <div className="text-lg font-black">About DeedSense</div>
        <div className="text-sm text-slate-300 mt-2 leading-relaxed">
          DeedSense is a trust and manipulation-risk scanner designed for property investors and buyers.
          It analyzes listing text, broker messages, payment terms, and document language to detect patterns that
          often correlate with mis-selling: urgency pressure, scarcity tricks, unverifiable claims, documentation gaps,
          and risky payment instructions.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="font-bold">Who is it for?</div>
          <ul className="mt-3 space-y-2 text-sm text-slate-200">
            <li>• International property investors (UAE + global)</li>
            <li>• End-users buying for residence</li>
            <li>• Real estate teams that need faster screening</li>
            <li>• Anyone comparing payment plans and contract terms</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="font-bold">What it is (and isn’t)</div>
          <div className="text-sm text-slate-200 mt-3 leading-relaxed">
            DeedSense provides <b>language-based risk signals</b>. It does not replace legal review,
            escrow verification, registry checks, or professional due diligence.
            Think of it as an investor-grade “first filter” that helps you ask the right questions faster.
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="font-bold">Use cases</div>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-200">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="font-semibold">Broker message screening</div>
            <div className="text-slate-300 mt-1">Spot urgency and manipulation patterns before you commit.</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="font-semibold">Payment plan review</div>
            <div className="text-slate-300 mt-1">Highlight non-refundable deposits and risky payment routing.</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="font-semibold">Contract clause triage</div>
            <div className="text-slate-300 mt-1">Prioritize clauses that require legal focus.</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="font-semibold">Scanned docs & images</div>
            <div className="text-slate-300 mt-1">OCR extraction for scanned PDFs and photos.</div>
          </div>
        </div>
      </div>

      <div className="text-xs text-slate-400">
        Roadmap: exports, advanced policies, verified web research mode, team workspaces, and enterprise API integrations.
      </div>
    </div>
  );
}
