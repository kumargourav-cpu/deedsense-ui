import React, { useMemo, useState } from "react";

const currencies = [
  { code: "AED", symbol: "AED", fx: 1 },
  { code: "USD", symbol: "$", fx: 0.2723 },
  { code: "EUR", symbol: "€", fx: 0.2510 },
  { code: "INR", symbol: "₹", fx: 22.6 },
  { code: "GBP", symbol: "£", fx: 0.215 },
  { code: "SAR", symbol: "SAR", fx: 1.02 },
];

function fmt(priceAED, cur) {
  const v = priceAED * cur.fx;
  if (cur.code === "INR") return `${cur.symbol} ${Math.round(v).toLocaleString()}`;
  return `${cur.symbol} ${v.toFixed(0)}`;
}

export default function Pricing() {
  const [cur, setCur] = useState(currencies[0]);
  const [billing, setBilling] = useState("monthly"); // monthly | yearly

  const plans = useMemo(() => {
    const proAED = billing === "monthly" ? 149 : 149 * 10; // yearly discount
    const teamAED = billing === "monthly" ? 499 : 499 * 10;
    const entAED = billing === "monthly" ? 2500 : 2500 * 10;

    return [
      {
        name: "Free",
        priceAED: 0,
        badge: "Start here",
        features: [
          "5 scans (per browser)",
          "PDF / DOCX / TXT / PNG / JPG support",
          "OCR for scanned docs",
          "Full risk report + charts",
          "Local scan history",
        ],
      },
      {
        name: "Pro",
        priceAED: proAED,
        badge: "Most popular",
        features: [
          "Unlimited scans",
          "Priority extraction & faster reports",
          "Advanced verification checklist",
          "Export report (phase 2)",
          "Email summaries (phase 2)",
        ],
      },
      {
        name: "Business",
        priceAED: teamAED,
        badge: "Teams",
        features: [
          "Unlimited scans",
          "Team workspace (phase 2)",
          "Shared history (phase 2)",
          "Custom templates (phase 2)",
          "Support SLA (phase 2)",
        ],
      },
      {
        name: "Enterprise",
        priceAED: entAED,
        badge: "API + Integrations",
        features: [
          "Unlimited scans + API access",
          "Integrate in CRM / portals",
          "Custom risk policy rules",
          "Audit log (phase 2)",
          "Dedicated onboarding",
        ],
      },
    ];
  }, [billing]);

  return (
    <div className="space-y-4">
      <div className="glass rounded-3xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-lg font-black">Pricing</div>
            <div className="text-sm text-slate-300 mt-1">
              MVP pricing view only. Payments (Stripe) can be added later.
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
              value={cur.code}
              onChange={(e) => setCur(currencies.find((c) => c.code === e.target.value))}
            >
              {currencies.map((c) => <option key={c.code} value={c.code}>{c.code}</option>)}
            </select>

            <div className="flex rounded-xl border border-white/10 overflow-hidden">
              <button
                className={`px-3 py-2 text-sm font-semibold ${billing === "monthly" ? "bg-white text-slate-950" : "bg-white/0"}`}
                onClick={() => setBilling("monthly")}
              >
                Monthly
              </button>
              <button
                className={`px-3 py-2 text-sm font-semibold ${billing === "yearly" ? "bg-white text-slate-950" : "bg-white/0"}`}
                onClick={() => setBilling("yearly")}
              >
                Yearly (save ~2 months)
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {plans.map((p) => (
          <div key={p.name} className="glass rounded-3xl p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-base font-black">{p.name}</div>
                <div className="text-xs text-slate-400 mt-1">{p.badge}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black">{fmt(p.priceAED, cur)}</div>
                <div className="text-xs text-slate-400">{p.priceAED === 0 ? "Limited scans" : billing}</div>
              </div>
            </div>

            <div className="hr my-5" />

            <ul className="space-y-2">
              {p.features.map((f, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-200">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-white/70" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <button className="btn-primary w-full mt-6">
              {p.priceAED === 0 ? "Use Free" : "Choose Plan (Later)"}
            </button>

            <div className="text-xs text-slate-400 mt-3">
              Currency conversion is approximate for display only.
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
