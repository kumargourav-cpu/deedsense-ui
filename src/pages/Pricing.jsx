import React, { useMemo, useState } from "react";

const currencies = [
  { code: "AED", symbol: "AED", fx: 1 },
  { code: "USD", symbol: "$", fx: 0.2723 },
  { code: "EUR", symbol: "€", fx: 0.251 },
  { code: "INR", symbol: "₹", fx: 22.6 }
];

export default function Pricing() {
  const [cur, setCur] = useState("AED");

  const c = useMemo(() => currencies.find((x) => x.code === cur) || currencies[0], [cur]);

  const price = (aed) => {
    const v = aed * c.fx;
    const rounded = cur === "INR" ? Math.round(v) : Math.round(v * 100) / 100;
    return `${c.symbol} ${rounded}`;
  };

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-extrabold">Pricing</div>
          <div className="text-xs text-slate-300 mt-1">Stripe later — this is a product pricing page for MVP.</div>
        </div>
        <select className="input max-w-[160px]" value={cur} onChange={(e) => setCur(e.target.value)}>
          {currencies.map((x) => (
            <option key={x.code} value={x.code}>{x.code}</option>
          ))}
        </select>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-5 border border-white/10">
          <div className="text-sm font-extrabold">Free</div>
          <div className="mt-2 text-2xl font-black">{price(0)}</div>
          <div className="mt-2 text-xs text-slate-300">5 scans / month</div>
          <ul className="mt-4 text-sm text-slate-200 space-y-2 list-disc pl-5">
            <li>Upload + OCR</li>
            <li>Risk score + signals</li>
            <li>PDF report download</li>
          </ul>
        </div>

        <div className="glass rounded-2xl p-5 border border-white/10">
          <div className="text-sm font-extrabold">Pro</div>
          <div className="mt-2 text-2xl font-black">{price(149)}<span className="text-sm font-semibold text-slate-300"> / month</span></div>
          <div className="mt-2 text-xs text-slate-300">Unlimited scans</div>
          <ul className="mt-4 text-sm text-slate-200 space-y-2 list-disc pl-5">
            <li>Unlimited scans</li>
            <li>History + analytics</li>
            <li>Priority OCR queue</li>
          </ul>
        </div>

        <div className="glass rounded-2xl p-5 border border-white/10">
          <div className="text-sm font-extrabold">Enterprise</div>
          <div className="mt-2 text-2xl font-black">{price(1499)}<span className="text-sm font-semibold text-slate-300"> / month</span></div>
          <div className="mt-2 text-xs text-slate-300">API + integration</div>
          <ul className="mt-4 text-sm text-slate-200 space-y-2 list-disc pl-5">
            <li>API access + rate limits</li>
            <li>Team accounts</li>
            <li>Custom scoring + compliance rules</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
