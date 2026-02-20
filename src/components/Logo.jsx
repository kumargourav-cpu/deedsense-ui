import React from "react";

export default function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 border border-white/10">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M4 12.5C6.5 7 10 4 14 4c3.5 0 6 2.2 6 5.5 0 4.5-4.8 8.8-10.8 10.2" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M4.3 12.7c2.3 2.8 5.6 4.7 9.7 4.7 1.6 0 3.1-.3 4.4-.8" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </div>
      <div className="leading-tight">
        <div className="text-sm font-black tracking-tight">DeedSense</div>
        <div className="text-[11px] text-slate-400 -mt-0.5">Trust & Manipulation Risk Scanner</div>
      </div>
    </div>
  );
}
