import React from "react";
import Logo from "./Logo.jsx";

export default function TopNav({ active, setActive }) {
  const items = [
    { key: "scan", label: "Scan" },
    { key: "history", label: "Scan History" },
    { key: "pricing", label: "Pricing" },
    { key: "about", label: "About" },
    { key: "faq", label: "FAQ" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Logo />
          <div className="hidden sm:block">
            <div className="text-sm font-extrabold tracking-wide text-white">
              DeedSense
            </div>
            <div className="text-xs text-slate-400">
              Trust & Manipulation Risk Scanner
            </div>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {items.map((it) => (
            <button
              key={it.key}
              onClick={() => setActive(it.key)}
              className={
                "rounded-xl px-3 py-2 text-sm transition " +
                (active === it.key
                  ? "bg-white/10 text-white"
                  : "text-slate-300 hover:bg-white/5 hover:text-white")
              }
            >
              {it.label}
            </button>
          ))}
        </nav>

        <div className="md:hidden">
          <select
            className="rounded-xl bg-white/5 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10"
            value={active}
            onChange={(e) => setActive(e.target.value)}
          >
            {items.map((it) => (
              <option key={it.key} value={it.key}>
                {it.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
