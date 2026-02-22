import React from "react";

export default function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-2xl bg-white/10 border border-white/10 grid place-items-center">
        <div className="h-5 w-5 rounded-lg bg-white"></div>
      </div>
      <div className="leading-tight">
        <div className="text-sm font-extrabold tracking-wide">DeedSense</div>
        <div className="text-xs text-slate-300">Trust & Risk Scanner</div>
      </div>
    </div>
  );
}
