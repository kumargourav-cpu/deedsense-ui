import React from "react";
import { ShieldCheck, FileText, ScanLine, Globe2, Building2 } from "lucide-react";

export default function About() {
  return (
    <div className="grid gap-4">
      <div className="card p-6">
        <div className="text-xl font-extrabold">About DeedSense</div>
        <div className="mt-2 text-sm text-slate-300 leading-relaxed">
          DeedSense is a trust & manipulation risk scanner designed for property investors and real estate teams.
          It helps you quickly spot pressure tactics, vague terms, suspicious guarantees, missing documents, and
          clarity gaps in listing text, broker messages, payment plan language, and scanned documents (OCR).
        </div>

        <div className="mt-5 grid md:grid-cols-3 gap-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 font-bold"><ScanLine size={18}/> OCR Enabled</div>
            <div className="mt-2 text-sm text-slate-300">
              Upload PDFs and images. If your document is scanned, OCR runs automatically.
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 font-bold"><ShieldCheck size={18}/> Privacy-first mode</div>
            <div className="mt-2 text-sm text-slate-300">
              In this build, scan history is stored locally in your browser (no login required).
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 font-bold"><FileText size={18}/> PDF Reports</div>
            <div className="mt-2 text-sm text-slate-300">
              Download a boardroom-ready report in one click (client-side).
            </div>
          </div>
        </div>
      </div>

      {/* Brand strip (clean) */}
      <div className="card p-6">
        <div className="label">Built for</div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="pill"><Globe2 size={14}/> UAE investors</span>
          <span className="pill"><Globe2 size={14}/> UK investors</span>
          <span className="pill"><Globe2 size={14}/> EU investors</span>
          <span className="pill"><Globe2 size={14}/> US investors</span>
          <span className="pill"><Building2 size={14}/> Agencies & broker teams</span>
        </div>

        <div className="mt-4 text-sm text-slate-300">
          Whether you’re screening off-plan listings, verifying payment plan language, or checking a broker message
          for pressure tactics, DeedSense gives you a structured starting point for due diligence.
        </div>
      </div>

      {/* Enterprise CTA */}
      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-lg font-extrabold">Contact / Request Enterprise Demo</div>
            <div className="mt-1 text-sm text-slate-300">
              Want API integration, team dashboards, or compliance-grade audit trails?
            </div>
          </div>
          <a
            className="btn-primary"
            href="mailto:demo@deedsense.ai?subject=Enterprise%20Demo%20Request%20-%20DeedSense"
          >
            Request demo
          </a>
        </div>

        <div className="mt-4 grid md:grid-cols-3 gap-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-bold">API integration</div>
            <div className="mt-1 text-sm text-slate-300">Embed scan inside portals, CRMs, or listing workflows.</div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-bold">Team history</div>
            <div className="mt-1 text-sm text-slate-300">Shared scan history + tags by developer/project/country.</div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-bold">Admin controls</div>
            <div className="mt-1 text-sm text-slate-300">Rate limits, roles, exports, and compliance logs.</div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="text-sm font-extrabold">Disclaimer</div>
        <div className="mt-2 text-sm text-slate-300">
          DeedSense provides a risk signal based on text patterns and structured analysis. It is not legal advice,
          not a guarantee, and should be validated with official documents and professional due diligence.
        </div>
      </div>
    </div>
  );
}
