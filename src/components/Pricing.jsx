import React, { useMemo, useState } from "react";

const rates = {
  USD: 1,
  AED: 3.6725,
  EUR: 0.92,
  INR: 83.2,
  GBP: 0.79,
  CAD: 1.35,
  AUD: 1.52
};

export default function Pricing() {
  const [cur, setCur] = useState("USD");

  const fmt = (usd) => {
    const val = usd * (rates[cur] || 1);
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: cur,
      maximumFractionDigits: cur === "INR" ? 0 : 2
    }).format(val);
  };

  const plans = useMemo(() => ([
    {
      name: "Free",
      badge: "Starter",
      priceMonthlyUsd: 0,
      priceYearlyUsd: 0,
      features: ["5 scans/month", "Upload + paste text", "Basic risk signals", "No history"]
    },
    {
      name: "Pro",
      badge: "Best value",
      priceMonthlyUsd: 19,
      priceYearlyUsd: 190,
      features: ["Unlimited scans", "History + tags", "PDF/DOCX/Image OCR", "Priority model"]
    },
    {
      name: "Enterprise",
      badge: "B2B API",
      priceMonthlyUsd: 199,
      priceYearlyUsd: 1990,
      features: ["API integration", "Admin controls", "Team access", "Custom rules + SLAs"]
    }
  ]), []);

  return (
    <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur-xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-lg font-semibold text-white">Pricing</div>
          <div className="mt-1 text-sm text-slate-400">
            Stripe is not connected yet — prices shown for future setup.
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Currency</span>
          <select
            value={cur}
            onChange={(e) => setCur(e.target.value)}
            className="rounded-xl bg-white/5 px-3 py-2 text-sm text-white ring-1 ring-white/10"
          >
            {Object.keys(rates).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {plans.map((p) => (
          <div
            key={p.name}
            className={[
              "rounded-3xl p-5 ring-1 backdrop-blur-xl",
              p.name === "Pro"
                ? "bg-emerald-500/10 ring-emerald-300/25"
                : "bg-black/20 ring-white/10"
            ].join(" ")}
          >
            <div className="flex items-center justify-between">
              <div className="text-base font-semibold text-white">{p.name}</div>
              <div className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200 ring-1 ring-white/10">
                {p.badge}
              </div>
            </div>

            <div className="mt-4 text-sm text-slate-400">Monthly</div>
            <div className="text-2xl font-semibold text-white">{fmt(p.priceMonthlyUsd)}</div>

            <div className="mt-3 text-sm text-slate-400">Yearly</div>
            <div className="text-xl font-semibold text-white">{fmt(p.priceYearlyUsd)}</div>

            <ul className="mt-4 space-y-2 text-sm text-slate-200">
              {p.features.map((f, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-emerald-200/70" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <button
              className="mt-5 w-full rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white ring-1 ring-white/15 hover:bg-white/12"
            >
              {p.name === "Free" ? "Use Free" : "Coming soon"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
