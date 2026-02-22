import React from "react";
import { NavLink } from "react-router-dom";
import Logo from "./Logo.jsx";

const NavItem = ({ to, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `px-3 py-2 rounded-full text-sm transition border ${
        isActive
          ? "border-white/15 bg-white/10 text-white"
          : "border-transparent text-slate-300 hover:text-white hover:bg-white/5"
      }`
    }
  >
    {children}
  </NavLink>
);

export default function TopNav({ language, onLanguageChange, langs }) {
  return (
    <div className="sticky top-0 z-50">
      <div className="bg-slate-950/70 backdrop-blur-xl border-b border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
          <Logo />
          <div className="hidden md:flex items-center gap-1">
            <NavItem to="/">Scan</NavItem>
            <NavItem to="/history">History</NavItem>
            <NavItem to="/pricing">Pricing</NavItem>
            <NavItem to="/about">About</NavItem>
            <NavItem to="/faq">FAQ</NavItem>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2">
              <span className="label">Language</span>
              <select
                className="input !py-2 !rounded-full !text-xs"
                value={language}
                onChange={(e) => onLanguageChange(e.target.value)}
              >
                {langs.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:hidden">
              <NavLink to="/" className="btn-ghost !py-2 !px-3">Scan</NavLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
