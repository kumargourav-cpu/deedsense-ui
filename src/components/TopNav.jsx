// src/components/TopNav.jsx
import React from "react";
import Logo from "./Logo.jsx";

export default function TopNav({ route, setRoute, plan, setPlan, usage, freeLimit, canScan }) {
  const used = usage?.used ?? 0;
  const left = Math.max(0, freeLimit - used);

  const tabs = [
    ["scan", "Scan"],
    ["history", "Scan history"],
    ["compare", "Compare"],
    ["pricing", "Pricing"],
    ["about", "About"],
    ["faq", "FAQ"],
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#070A12]/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <Logo />
          <div className="hidden sm:block">
            <div className="text-sm font-black">DeedSense</div>
            <div className="text-xs text-slate-400">Trust & Manipulation Risk Scanner</div>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-1">
          {tabs.map(([k, label]) => (
            <button
              key={k}
              onClick={() => setRoute(k)}
              className={`rounded-2xl px-3 py-2 text-sm font-semibold border ${
                route === k ? "border-white/20 bg-white/10" : "border-white/10 bg-transparent hover:bg-white/5"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <select
            className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none"
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            title="Plan selection (no payment yet)"
          >
            <option value="basic">Basic (5 scans)</option>
            <option value="pro">Pro (unlimited)</option>
            <option value="enterprise">Enterprise (unlimited)</option>
          </select>

          <div className="hidden md:block rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
            {plan === "basic" ? (
              <>Free scans: <b className="text-slate-100">{left}/{freeLimit}</b> • {canScan ? "Ready" : "Limit reached"}</>
            ) : (
              <>Unlimited scans • {plan.toUpperCase()}</>
            )}
          </div>

          <div className="lg:hidden">
            {/* Minimal mobile nav */}
            <select
              className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none"
              value={route}
              onChange={(e) => setRoute(e.target.value)}
            >
              {tabs.map(([k, label]) => (
                <option key={k} value={k}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}
