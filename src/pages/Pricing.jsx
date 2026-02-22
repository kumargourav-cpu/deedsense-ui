import React, { useMemo, useState } from "react";

const CURRENCIES = {
  AED: { symbol: "AED", rate: 1 },
  USD: { symbol: "$", rate: 0.2723 },
  EUR: { symbol: "€", rate: 0.25 },
  INR: { symbol: "₹", rate: 22.6 },
  GBP: { symbol: "£", rate: 0.215 }
};

export default function Pricing() {
  const [currency, setCurrency] = useState("AED");
  const [billing, setBilling] = useState("monthly"); // monthly/yearly

  const price = useMemo(() => {
    const r = CURRENCIES[currency]?.rate || 1;
    const baseMonthlyAED = 149;
    const baseYearlyAED = 1490;
    const pro = billing === "monthly" ? baseMonthlyAED : baseYearlyAED;
    const ent = billing === "monthly" ? 1499 : 14990;

    return {
      pro: Math.round(pro * r),
      ent: Math.round(ent * r)
    };
  }, [currency, billing]);

  return (
    <div className="grid gap-4">
      <div className="card p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-xl font-extrabold">Pricing</div>
            <div className="mt-2 text-sm text-slate-300">
              Start free, upgrade for unlimited scans and team features.
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="pill">
              Billing:
              <button className={billing === "monthly" ? "ml-2 font-bold" : "ml-2 opacity-70"} onClick={() => setBilling("monthly")}>Monthly</button>
              <span className="opacity-40 mx-1">|</span>
              <button className={billing === "yearly" ? "font-bold" : "opacity-70"} onClick={() => setBilling("yearly")}>Yearly</button>
            </div>

            <select className="input !py-2 !rounded-full !text-xs" value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {Object.keys(CURRENCIES).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card
          title="Free"
          price="0"
          currency={currency}
          subtitle="For individuals testing the tool"
          items={[
            "OCR scans (limited)",
            "Local history (browser)",
            "PDF report download",
            "Basic charts"
          ]}
          cta="Use Free"
        />

        <Card
          title="Pro"
          price={String(price.pro)}
          currency={currency}
          subtitle="For active investors & agents"
          items={[
            "Unlimited scans",
            "Advanced charts + comparisons (next)",
            "Priority extraction + higher limits",
            "Enhanced report templates"
          ]}
          cta="Upgrade (Later)"
          note="Payments not enabled in this build"
        />

        <Card
          title="Enterprise"
          price={String(price.ent)}
          currency={currency}
          subtitle="For portals, brokerages, compliance teams"
          items={[
            "API integration",
            "Team dashboard + admin panel",
            "Audit logs + role controls",
            "Custom OCR/language pipelines"
          ]}
          cta="Request Demo"
          href="mailto:demo@deedsense.ai?subject=Enterprise%20Demo%20Request%20-%20DeedSense"
        />
      </div>

      <div className="card p-6">
        <div className="text-sm font-extrabold">Feature comparison</div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-[720px] w-full text-sm">
            <thead>
              <tr className="text-left text-slate-300">
                <th className="py-2">Feature</th>
                <th className="py-2">Free</th>
                <th className="py-2">Pro</th>
                <th className="py-2">Enterprise</th>
              </tr>
            </thead>
            <tbody className="text-slate-200">
              {[
                ["OCR (PDF/images)", "✅", "✅", "✅"],
                ["PDF reports", "✅", "✅", "✅"],
                ["Local history", "✅", "✅", "✅"],
                ["Team history", "—", "Soon", "✅"],
                ["API access", "—", "Soon", "✅"],
                ["Admin controls", "—", "—", "✅"]
              ].map((row) => (
                <tr key={row[0]} className="border-t border-white/10">
                  <td className="py-3">{row[0]}</td>
                  <td className="py-3">{row[1]}</td>
                  <td className="py-3">{row[2]}</td>
                  <td className="py-3">{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 text-xs text-slate-400">
          Note: Payments are not enabled in this build. Pricing is displayed for product positioning only.
        </div>
      </div>
    </div>
  );
}

function Card({ title, price, currency, subtitle, items, cta, href, note }) {
  return (
    <div className="card p-6">
      <div className="text-lg font-extrabold">{title}</div>
      <div className="mt-1 text-sm text-slate-300">{subtitle}</div>
      <div className="mt-5 text-3xl font-black">
        <span className="text-slate-300 text-sm mr-2">{currency}</span>
        {price}
      </div>

      <div className="mt-4 grid gap-2">
        {items.map((x) => (
          <div key={x} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
            {x}
          </div>
        ))}
      </div>

      {note ? <div className="mt-4 text-xs text-slate-400">{note}</div> : null}

      {href ? (
        <a className="btn-primary w-full mt-5" href={href}>{cta}</a>
      ) : (
        <button className="btn-primary w-full mt-5">{cta}</button>
      )}
    </div>
  );
}
