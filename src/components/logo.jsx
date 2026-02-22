import React from "react";

export default function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-2xl border border-white/10 bg-white/5 grid place-items-center shadow-glow">
        <span className="text-sm font-black tracking-tight">DS</span>
      </div>
      <div className="leading-tight">
        <div className="text-sm font-extrabold tracking-tight">DeedSense</div>
        <div className="text-[11px] text-slate-300/80">
          Trust & Manipulation Risk Scanner
        </div>
      </div>
    </div>
  );
}
