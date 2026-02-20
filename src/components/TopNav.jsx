import React from "react";
import { LogIn, LogOut, ShieldCheck } from "lucide-react";

export default function TopNav({
  active,
  setActive,
  user,
  onOpenAuth,
  onSignOut
}) {
  const tabs = [
    { key: "scan", label: "Scan" },
    { key: "history", label: "History" },
    { key: "pricing", label: "Pricing" },
    { key: "about", label: "About" }
  ];

  return (
    <div className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
            <ShieldCheck className="h-5 w-5 text-emerald-200" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">DeedSense</div>
            <div className="text-xs text-slate-400">
              Trust & Manipulation Risk Scanner
            </div>
          </div>
        </div>

        <div className="hidden items-center gap-1 rounded-full bg-white/5 p-1 ring-1 ring-white/10 md:flex">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={[
                "rounded-full px-4 py-2 text-sm transition",
                active === t.key
                  ? "bg-white/12 text-white ring-1 ring-white/15"
                  : "text-slate-300 hover:bg-white/8"
              ].join(" ")}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <div className="hidden text-xs text-slate-400 md:block">
                {user.email}
              </div>
              <button
                onClick={onSignOut}
                className="inline-flex items-center gap-2 rounded-xl bg-white/8 px-3 py-2 text-sm text-white ring-1 ring-white/10 hover:bg-white/12"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </>
          ) : (
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/15 px-3 py-2 text-sm text-emerald-100 ring-1 ring-emerald-300/25 hover:bg-emerald-500/20"
            >
              <LogIn className="h-4 w-4" />
              Sign in
            </button>
          )}
        </div>
      </div>

      {/* mobile tabs */}
      <div className="mx-auto max-w-6xl px-4 pb-3 md:hidden">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={[
                "whitespace-nowrap rounded-full px-4 py-2 text-sm ring-1 transition",
                active === t.key
                  ? "bg-white/12 text-white ring-white/15"
                  : "bg-white/5 text-slate-300 ring-white/10 hover:bg-white/8"
              ].join(" ")}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
