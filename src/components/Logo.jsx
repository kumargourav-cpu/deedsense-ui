import React from "react";

export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400/20 via-indigo-400/20 to-fuchsia-400/20 ring-1 ring-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M4.5 19.5V8.5L12 4l7.5 4.5v11"
            stroke="rgba(255,255,255,.85)"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M9 19.5v-7h6v7"
            stroke="rgba(255,255,255,.85)"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M7.5 10.2h9"
            stroke="rgba(255,255,255,.45)"
            strokeWidth="1.2"
          />
        </svg>
      </div>
      <div className="hidden sm:block">
        <div className="text-sm font-black tracking-wide text-white">
          DS
          <span className="ml-2 rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-slate-300 ring-1 ring-white/10">
            OCR
          </span>
        </div>
      </div>
    </div>
  );
}
