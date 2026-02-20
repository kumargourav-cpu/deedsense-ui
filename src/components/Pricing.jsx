// src/components/Pricing.jsx
import React, { useMemo, useState } from "react";

const CURRENCIES = [
  { code: "USD", symbol: "$", rate: 1 },
  { code: "AED", symbol: "AED", rate: 3.67 },
  { code: "EUR", symbol: "€", rate: 0.92 },
  { code: "INR", symbol: "₹", rate: 83.0 },
  { code: "GBP", symbol: "£", rate: 0.79 },
  { code: "SAR", symbol: "SAR", rate: 3.75 },
];

function money(amountUSD, cur) {
  const n = amountUSD * cur.rate;
  // Format: INR no decimals, others 2 decimals
  const decimals = cur.code === "INR" ? 0 : 2;
  return `${cur.symbol} ${n.toFixed(decimals)}`;
}

export default function Pricing() {
  const [currency, setCurrency] = useState("USD");
  const cur = useMemo(() => CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0], [currency]);

  const plans = [
    {
      name: "Starter",
      priceMonthlyUSD: 0,
      priceYearlyUSD: 0,
      highlight: "Free",
      bullets: [
        "5 free scans (guest mode per browser)",
        "Upload + paste text scanning",
        "Investor-grade report + checklist",
        "No API integration",
      ],
      cta: "Use for free",
    },
    {
      name: "Pro Investor",
      priceMonthlyUSD: 29,
      priceYearlyUSD: 240, // 20/mo billed yearly
      highlight: "Most popular",
      bullets: [
        "Unlimited scans",
        "Priority extraction (PDF/Images)",
        "History + saved reports",
        "Language preference + faster processing",
      ],
      cta: "Upgrade (later)",
      popular: true,
    },
    {
      name: "Enterprise",
      priceMonthlyUSD: 399,
      priceYearlyUSD: 3990,
      highlight: "B2B API",
      bullets: [
        "API integration for your portal/CRM",
        "Team accounts + admin roles",
        "Custom risk rules & compliance flags",
        "SLA + dedicated onboarding",
      ],
      cta: "Contact sales",
    },
  ];

  return (
    <div className="glass rounded-3xl p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-lg font-extrabold">Pricing</div>
          <div className="mt-1 text-sm text-slate-300">
            Start free → scale to unlimited → enterprise API integration.
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Currency conversion is approximate and for display only.
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="label">Currency</div>
          <select className="input w-[160px]" value={currency} onChange={(e) => setCurrency(e.target.value)}>
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="hr" />

      <div className="grid gap-3 md:grid-cols-3">
        {plans.map((p) => (
          <div
            key={p.name}
            className={`rounded-3xl border p-5 ${
              p.popular
                ? "border-sky-400/40 bg-gradient-to-b from-white/10 to-white/5"
                : "border-white/10 bg-white/5"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-base font-extrabold">{p.name}</div>
                <div className="mt-1 text-xs text-slate-400">{p.highlight}</div>
              </div>
              {p.popular ? (
                <span className="badge border-sky-400/30 bg-sky-400/10">Recommended</span>
              ) : null}
            </div>

            <div className="mt-4">
              <div className="text-xs text-slate-400">Monthly</div>
              <div className="text-2xl font-extrabold">
                {money(p.priceMonthlyUSD, cur)}
                <span className="text-sm text-slate-400"> / mo</span>
              </div>

              <div className="mt-3 text-xs text-slate-400">Yearly</div>
              <div className="text-xl font-extrabold">
                {money(p.priceYearlyUSD, cur)}
                <span className="text-sm text-slate-400"> / yr</span>
              </div>
            </div>

            <ul className="mt-4 list-disc space-y-1 pl-6 text-sm text-slate-200">
              {p.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>

            <button
              className={p.popular ? "btn-primary mt-5 w-full" : "btn-ghost mt-5 w-full"}
              onClick={() => alert("Payments (Stripe) will be added later. For now this is UI-ready.")}
            >
              {p.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
