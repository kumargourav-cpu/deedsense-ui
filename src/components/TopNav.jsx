import React from "react";
import Logo from "./Logo.jsx";

export default function TopNav({ tab, setTab }) {
  const items = [
    { key: "scan", label: "Scan" },
    { key: "history", label: "History" },
    { key: "pricing", label: "Pricing" },
    { key: "about", label: "About" },
    { key: "faq", label: "FAQ" },
    { key: "chat", label: "Chat" },
  ];

  return (
    <div className="sticky top-0 z-40 border-b border-white/10 bg-black/30 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between gap-4">
        <Logo />
        <div className="hidden md:flex items-center gap-2">
          {items.map((it) => (
            <button
              key={it.key}
              onClick={() => setTab(it.key)}
              className={`btn-ghost ${tab === it.key ? "bg-white/10" : ""}`}
            >
              {it.label}
            </button>
          ))}
        </div>
        <div className="md:hidden">
          <select
            className="input py-2"
            value={tab}
            onChange={(e) => setTab(e.target.value)}
          >
            {items.map((it) => (
              <option key={it.key} value={it.key}>
                {it.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
