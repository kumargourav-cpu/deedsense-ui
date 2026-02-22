import React from "react";
import BrandStrip from "../components/BrandStrip";

function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-slate-200">
      {children}
    </span>
  );
}

function Card({ title, subtitle, children }) {
  return (
    <div className="glass rounded-3xl p-6">
      <div className="text-base font-extrabold text-white">{title}</div>
      {subtitle ? <div className="mt-1 text-sm text-slate-300">{subtitle}</div> : null}
      <div className="mt-5">{children}</div>
    </div>
  );
}

function FAQItem({ q, a }) {
  return (
    <details className="group rounded-2xl border border-white/10 bg-white/5 p-4">
      <summary className="cursor-pointer list-none text-sm font-semibold text-white">
        <div className="flex items-center justify-between gap-3">
          <span>{q}</span>
          <span className="text-slate-400 transition group-open:rotate-45">+</span>
        </div>
      </summary>
      <div className="mt-3 text-sm text-slate-300 leading-relaxed">{a}</div>
    </details>
  );
}

export default function About() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-10">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-3xl font-black tracking-tight text-white">About DeedSense</div>
          <div className="mt-2 max-w-2xl text-sm text-slate-300">
            DeedSense helps property investors and buyers quickly spot manipulation signals, hidden
            risk language, missing deal details, and pressure tactics — from listings, broker
            messages, payment plans, and scanned documents.
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge>OCR Enabled</Badge>
          <Badge>Privacy-first mode</Badge>
          <Badge>PDF reports</Badge>
          <Badge>Multi-language</Badge>
          <Badge>Investor-grade summaries</Badge>
        </div>
      </div>

      {/* Brand strip (SVG flags) */}
      <div className="mt-6">
        <BrandStrip />
      </div>

      {/* What it is */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card
          title="What DeedSense does"
          subtitle="A structured trust + risk scan, designed for fast investor decision-making."
        >
          <ul className="space-y-3 text-sm text-slate-300">
            <li>
              <span className="font-semibold text-white">Extracts text</span> from PDFs, DOCX, images
              (JPG/PNG), and plain text — including scanned PDFs via OCR.
            </li>
            <li>
              <span className="font-semibold text-white">Detects risk signals</span> like urgency
              pressure, unrealistic guarantees, ambiguous pricing, missing fees, and vague handover
              language.
            </li>
            <li>
              <span className="font-semibold text-white">Creates an investor-ready report</span>:
              executive summary, risk categories, highlights, checklist, charts, and next steps.
            </li>
            <li>
              <span className="font-semibold text-white">Keeps scan history</span> so you can track
              patterns across deals and agents over time.
            </li>
          </ul>
        </Card>

        <Card
          title="Who it’s for"
          subtitle="Built for end-users first, then expands into B2B + enterprise workflows."
        >
          <div className="grid grid-cols-1 gap-3 text-sm text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs font-bold text-white">Investors</div>
              <div className="mt-1">
                Screen deals faster, compare opportunities, and avoid emotional decisions under
                pressure.
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs font-bold text-white">Buyers</div>
              <div className="mt-1">
                Understand what’s missing before you pay a booking amount or sign terms.
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs font-bold text-white">Agents / Brokers</div>
              <div className="mt-1">
                Improve clarity, reduce objections, and communicate more transparently.
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs font-bold text-white">Enterprise / Platforms</div>
              <div className="mt-1">
                Add a trust layer to listings, portals, CRMs, or compliance flows via API.
              </div>
            </div>
          </div>
        </Card>

        <Card
          title="Trust badges"
          subtitle="Designed to be safe, explainable, and usable in real workflows."
        >
          <div className="flex flex-wrap gap-2">
            <Badge>OCR Enabled</Badge>
            <Badge>Scanned PDF support</Badge>
            <Badge>DOCX + Image extraction</Badge>
            <Badge>Client-side PDF download</Badge>
            <Badge>Explainable signals</Badge>
            <Badge>Checklist-style output</Badge>
            <Badge>Charts & scoring</Badge>
            <Badge>Rate-limit ready</Badge>
            <Badge>Abuse protections ready</Badge>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            <div className="font-semibold text-white">Privacy-first mode</div>
            <div className="mt-1">
              You can run scans without uploading sensitive personal information. Always avoid
              sharing passport/ID numbers, bank details, or confidential contracts unless required.
            </div>
          </div>
        </Card>
      </div>

      {/* Use cases */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card
          title="High-value use cases"
          subtitle="Where DeedSense delivers the biggest advantage."
        >
          <div className="grid grid-cols-1 gap-3 text-sm text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs font-bold text-white">1) Listing sanity check</div>
              <div className="mt-1">
                Detect vague pricing, missing fees, unrealistic ROI, and forced urgency language.
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs font-bold text-white">2) Payment plan screening</div>
              <div className="mt-1">
                Identify red flags around timelines, penalties, refund ambiguity, handover terms,
                and installment phrasing.
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs font-bold text-white">3) Broker message analysis</div>
              <div className="mt-1">
                Highlight manipulation patterns: pressure, scarcity, “guarantees,” social proof,
                and over-reassurance.
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs font-bold text-white">4) Compare multiple options</div>
              <div className="mt-1">
                Run multiple scans and compare risk profiles using charts and history.
              </div>
            </div>
          </div>
        </Card>

        {/* Enterprise CTA */}
        <div className="glass rounded-3xl p-6">
          <div className="text-base font-extrabold text-white">
            Contact / Request Enterprise Demo
          </div>
          <div className="mt-1 text-sm text-slate-300">
            Want DeedSense inside your CRM, portal, or workflow? We can offer API integration,
            admin dashboards, multi-user roles, and enterprise controls.
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              <div className="text-xs font-bold text-white">Enterprise API</div>
              <div className="mt-1">
                Bulk scans, structured outputs, and integration-ready endpoints.
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              <div className="text-xs font-bold text-white">Admin controls</div>
              <div className="mt-1">
                Rate limiting, access control, audit logs, and team usage analytics.
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              <div className="text-xs font-bold text-white">Custom rules</div>
              <div className="mt-1">
                Tune signals and checklists for UAE / global investor contexts.
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              <div className="text-xs font-bold text-white">Security</div>
              <div className="mt-1">
                Abuse protection, request signing, and environment isolation patterns.
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <a
              className="btn-primary"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                alert("Hook this button to your contact form or Calendly later.");
              }}
            >
              Request a demo
            </a>
            <a
              className="btn-ghost"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                alert("Hook this button to your email support later.");
              }}
            >
              Contact sales
            </a>
          </div>

          <div className="mt-4 text-[11px] text-slate-400">
            Tip: add a simple “Contact” page later and route this CTA there.
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-10">
        <div className="text-xl font-black text-white">FAQs</div>
        <div className="mt-2 max-w-3xl text-sm text-slate-300">
          Quick answers to common investor questions about how DeedSense works and how to use it
          responsibly.
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-2">
          <FAQItem
            q="Is DeedSense legal advice?"
            a="No. DeedSense produces a risk signal based on language patterns and analysis. Always validate using official documents, escrow/payment proof, and qualified legal due diligence."
          />
          <FAQItem
            q="Can it read scanned PDFs?"
            a="Yes — scanned PDFs are processed using OCR (optical character recognition). Best results come from clear scans with readable text (not blurry photos)."
          />
          <FAQItem
            q="What should I scan for best results?"
            a="Paste or upload the listing description + broker messages + payment plan text. The more context you provide, the stronger the report becomes."
          />
          <FAQItem
            q="Does a low risk score mean the deal is safe?"
            a="No. Low risk means fewer language-based red flags detected. It does not confirm legitimacy. Always verify title documents, escrow accounts, fees, timelines, and the counterparty."
          />
          <FAQItem
            q="Will DeedSense store my documents?"
            a="In MVP mode, storage depends on your setup. For production, you can enable privacy-first configuration, minimize retention, and store only hashes + results if needed."
          />
          <FAQItem
            q="Can I export a report?"
            a="Yes — DeedSense supports report-style output and can offer client-side PDF download for sharing with partners or decision makers."
          />
        </div>
      </div>

      {/* Bottom disclaimer */}
      <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
        <div className="font-semibold text-white">Disclaimer</div>
        <div className="mt-1">
          DeedSense provides a risk signal based on text patterns and AI-style analysis. It is not
          legal advice, not a guarantee, and should be validated with documents and due diligence.
          Never rely on a score alone to transfer funds or sign binding terms.
        </div>
      </div>
    </div>
  );
}
