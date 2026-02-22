import BrandStrip from "../components/BrandStrip";
import React from "react";

function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
      {children}
    </span>
  );
}

function Badge({ title, desc }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs font-semibold text-white">{title}</div>
      <div className="mt-1 text-[11px] leading-relaxed text-slate-300">{desc}</div>
    </div>
  );
}

function BrandMark({ code, label }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-black/30 text-xs font-extrabold tracking-wider text-white">
        {code}
      </div>
      <div className="leading-tight">
        <div className="text-xs font-semibold text-white">{label}</div>
        <div className="text-[11px] text-slate-400">Investor workflows</div>
      </div>
    </div>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <div className="glass rounded-2xl border border-white/10 p-5">
      <div className="text-sm font-extrabold">{title}</div>
      {subtitle ? <div className="mt-1 text-xs text-slate-300">{subtitle}</div> : null}
      <div className="mt-4">{children}</div>
    </div>
  );
}

export default function About() {
  return (
    <div className="card">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="max-w-3xl">
          <div className="text-sm font-extrabold">About DeedSense</div>

          <div className="mt-2 text-sm text-slate-200 leading-relaxed">
            DeedSense is a <span className="font-semibold text-white">Trust & Manipulation Risk Scanner</span> built for{" "}
            <span className="font-semibold text-white">UAE + international property investors</span>. It helps you
            quickly screen listings, broker messages, payment terms, and deal notes to detect manipulation patterns,
            clarity gaps, and risk signals—before you spend time (or money) on deeper due diligence.
          </div>

          {/* Trust Badges */}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Badge
              title="OCR Enabled"
              desc="Reads scanned PDFs & images via OCR (quality-dependent)."
            />
            <Badge
              title="Privacy-first mode"
              desc="Can run without storing full content; use hashed metadata + retention policies."
            />
            <Badge
              title="PDF Reports"
              desc="Export a structured report for sharing with stakeholders."
            />
          </div>
        </div>

        {/* Quick Feature Pills */}
        <div className="flex flex-wrap gap-2 md:justify-end">
          <Pill>PDF/DOCX/TXT</Pill>
          <Pill>OCR Images</Pill>
          <Pill>Risk Signals</Pill>
          <Pill>Charts</Pill>
          <Pill>Checklist</Pill>
          <Pill>Export</Pill>
        </div>
      </div>

      {/* Brand strip */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs font-semibold text-white">Built for global investor contexts</div>
            <div className="mt-1 text-[11px] text-slate-400">
              Clean, fast triage across major buyer regions — adaptable language + structured risk reporting.
            </div>
          </div>
          <div className="text-[11px] text-slate-400">
            Regions shown are examples; DeedSense is not tied to a single market.
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <BrandMark code="UAE" label="UAE investors" />
          <BrandMark code="UK" label="UK investors" />
          <BrandMark code="EU" label="EU investors" />
          <BrandMark code="US" label="US investors" />
        </div>
      </div>

      {/* Main grid */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Section
          title="What problem does it solve?"
          subtitle="Real estate risk often hides in language: urgency, vagueness, missing terms, unrealistic claims."
        >
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-200">
            <li>
              Flags pressure tactics like <span className="font-semibold">“limited time”</span>,{" "}
              <span className="font-semibold">“last unit”</span>, or rushed booking requests.
            </li>
            <li>
              Highlights <span className="font-semibold">missing details</span> commonly left out in chats (handover,
              escrow, refund conditions, fees, service charges).
            </li>
            <li>
              Detects <span className="font-semibold">high-risk promises</span> like guaranteed returns or “no risk”
              messaging.
            </li>
            <li>
              Produces a structured summary so you can ask sharper questions and move faster.
            </li>
          </ul>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-300">
            Outcome: DeedSense helps you convert “gut feeling” into <span className="text-white font-semibold">specific verification questions</span>.
          </div>
        </Section>

        <Section
          title="Who should use DeedSense?"
          subtitle="Designed for investors, end-users, and teams doing first-pass deal screening."
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              ["Investors", "Compare multiple deals fast and avoid pressure traps."],
              ["End buyers", "Validate clarity of terms before committing."],
              ["Agencies", "Add a trust layer to your client experience."],
              ["Operations teams", "Standardize deal intake and first review."],
              ["Family offices", "Quick triage before legal and financial review."],
              ["International buyers", "Spot inconsistencies across messages/docs."],
            ].map(([t, d]) => (
              <div key={t} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm font-semibold text-white">{t}</div>
                <div className="mt-1 text-xs text-slate-300">{d}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="How it works"
          subtitle="A practical workflow: extract → analyze → report → next steps."
        >
          <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-200">
            <li>
              <span className="font-semibold">Input</span>: paste text or upload PDF/DOCX/TXT/PNG/JPG.
            </li>
            <li>
              <span className="font-semibold">Extraction</span>: standard text extraction; OCR for scanned files/images.
            </li>
            <li>
              <span className="font-semibold">Analysis</span>: identifies risk signals, confidence, severity, and next steps.
            </li>
            <li>
              <span className="font-semibold">Output</span>: summary, charts, and a downloadable PDF report.
            </li>
          </ol>

          <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4 text-xs text-slate-300">
            Tip: For strongest results, include the broker message + payment plan text + any urgency language.
          </div>
        </Section>

        <Section
          title="Examples of real-world use cases"
          subtitle="Where DeedSense pays off in minutes."
        >
          <ul className="space-y-3 text-sm text-slate-200">
            {[
              ["Payment plan sanity-check", "Spot missing refund conditions, penalty clauses, unclear milestone triggers."],
              ["Pressure + urgency detection", "Catch scarcity/urgency framing and convert it into verification questions."],
              ["Listing vs. message mismatch", "Flag inconsistencies across sources for structured follow-up."],
              ["Team screening / intake", "Standardize first-pass review before legal and financial checks."],
            ].map(([t, d]) => (
              <li key={t} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="font-semibold text-white">{t}</div>
                <div className="mt-1 text-xs text-slate-300">{d}</div>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          title="What DeedSense is NOT"
          subtitle="Keeps expectations realistic and the platform credible."
        >
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-200">
            <li>Not legal advice.</li>
            <li>Not a guarantee of legitimacy or outcomes.</li>
            <li>Not a substitute for escrow verification or contract review.</li>
            <li>Not a “trust badge”—it’s decision support based on signals.</li>
          </ul>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-300">
            Best practice: use DeedSense to <span className="text-white font-semibold">ask better questions</span>, then validate via official documents and independent due diligence.
          </div>
        </Section>

        <Section
          title="Privacy & data handling (MVP)"
          subtitle="You can run in no-storage mode or later harden for enterprise."
        >
          <div className="text-sm text-slate-200 leading-relaxed">
            In MVP mode, you can operate with minimal retention (e.g., store only scan results or hashes). In production,
            you can add per-user access control, encryption-at-rest, audit logs, and retention policies aligned to your
            compliance needs.
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm font-semibold text-white">Recommended</div>
              <div className="mt-1 text-xs text-slate-300">
                Store history with strict retention + role access (enterprise mode).
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm font-semibold text-white">Optional</div>
              <div className="mt-1 text-xs text-slate-300">
                “No storage” mode for sensitive users; keep results only in-session.
              </div>
            </div>
          </div>
        </Section>
      </div>

      {/* Enterprise CTA */}
      <div className="mt-6 rounded-3xl border border-white/10 bg-gradient-to-r from-white/10 via-white/5 to-transparent p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <div className="text-sm font-extrabold text-white">Contact / Request Enterprise Demo</div>
            <div className="mt-1 text-xs text-slate-300 leading-relaxed">
              Want DeedSense for your brokerage, portal, or investor desk? Enterprise includes API integration, team
              accounts, compliance controls, custom scoring, retention policies, and branded reporting.
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <Pill>API Integration</Pill>
              <Pill>Team Dashboard</Pill>
              <Pill>Audit Logs</Pill>
              <Pill>Custom Policies</Pill>
              <Pill>Branded Reports</Pill>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            {/* These buttons are UI-only for now; wire to email/form later */}
            <button
              className="btn-primary"
              onClick={() => {
                const subject = encodeURIComponent("DeedSense Enterprise Demo Request");
                const body = encodeURIComponent(
                  "Hi DeedSense Team,\n\nI’d like to request an enterprise demo.\n\nCompany/Team:\nUse case:\nPreferred region(s):\nExpected monthly volume:\n\nThanks,"
                );
                window.location.href = `mailto:hello@deedsense.ai?subject=${subject}&body=${body}`;
              }}
            >
              Request Demo
            </button>

            <button
              className="btn-ghost"
              onClick={() => {
                navigator.clipboard?.writeText("hello@deedsense.ai");
              }}
              title="Copies hello@deedsense.ai"
            >
              Copy Email
            </button>
          </div>
        </div>

        <div className="mt-3 text-[11px] text-slate-400">
          Note: Replace <span className="text-slate-200">hello@deedsense.ai</span> with your real email address.
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 text-xs text-slate-400">
        Disclaimer: DeedSense provides a risk signal based on text patterns and analysis. It is not legal advice, not a
        guarantee, and should be validated with official documents and independent due diligence.
      </div>
    </div>
  );
}
