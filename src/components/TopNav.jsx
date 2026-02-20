import React from "react";
import Logo from "./Logo.jsx";
import { LANGS, t } from "../lib/i18n.js";

export default function TopNav({ active, setActive, lang, setLang }) {
  const tabs = [
    { key: "scan", label: t(lang, "scan") },
    { key: "history", label: t(lang, "history") },
    { key: "pricing", label: t(lang, "pricing") },
    { key: "about", label: t(lang, "about") },
    { key: "faq", label: t(lang, "faq") },
    { key: "chat", label: t(lang, "chat") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-4">
        <Logo />

        <nav className="hidden md:flex items-center gap-1 ml-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition ${
                active === tab.key ? "bg-white text-slate-950" : "hover:bg-white/5 text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden sm:block text-xs text-slate-400 mr-2">{t(lang, "language")}</div>
          <select
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none"
            value={lang}
            onChange={(e) => setLang(e.target.value)}
          >
            {LANGS.map((l) => (
              <option key={l.code} value={l.code}>
                {l.name}
              </option>
            ))}
          </select>

          <div className="md:hidden">
            <select
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none"
              value={active}
              onChange={(e) => setActive(e.target.value)}
            >
              {tabs.map((tab) => (
                <option key={tab.key} value={tab.key}>
                  {tab.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}
