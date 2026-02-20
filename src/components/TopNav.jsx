// src/components/TopNav.jsx
import React from "react";

export default function TopNav({
  brand = "DeedSense",
  active,
  setActive,
  user,
  onSignIn,
  onSignOut,
  freeScansLeft,
}) {
  const tabs = [
    { key: "scan", label: "Scan" },
    { key: "history", label: "History" },
    { key: "pricing", label: "Pricing" },
    { key: "about", label: "About" },
    { key: "faq", label: "FAQs" },
  ];

  return (
    <div className="sticky top-0 z-50 border-b border-white/10 bg-black/20 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <button
          className="flex items-center gap-3"
          onClick={() => setActive("scan")}
          title="Go to Scan"
        >
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-sky-500/90 to-violet-500/90 p-[1px]">
            <div className="glass flex h-full w-full items-center justify-center rounded-2xl">
              <span className="text-sm font-black tracking-tight">DS</span>
            </div>
          </div>
          <div className="text-left leading-tight">
            <div className="text-sm font-extrabold tracking-tight">{brand}</div>
            <div className="text-[11px] text-slate-400">
              Trust & Manipulation Risk Scanner for Property Investors
            </div>
          </div>
        </button>

        <div className="hidden items-center gap-2 md:flex">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                active === t.key
                  ? "bg-white/10 text-white"
                  : "text-slate-300 hover:bg-white/5"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="badge hidden sm:inline-flex">
            Free scans: <b className="ml-1">{freeScansLeft}</b>
          </span>

          {user ? (
            <>
              <span className="hidden md:inline-flex text-xs text-slate-300">
                {user.email}
              </span>
              <button className="btn-ghost" onClick={onSignOut}>
                Sign out
              </button>
            </>
          ) : (
            <button className="btn-primary" onClick={onSignIn}>
              Sign in
            </button>
          )}
        </div>
      </div>

      {/* Mobile tabs */}
      <div className="mx-auto max-w-6xl px-4 pb-3 md:hidden">
        <div className="glass flex flex-wrap gap-2 rounded-2xl p-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                active === t.key
                  ? "bg-white/10 text-white"
                  : "text-slate-300 hover:bg-white/5"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
