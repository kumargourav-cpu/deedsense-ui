import React from "react";

export default function History({ items = [], onSelect, onClear }) {
  return (
    <div className="glass rounded-3xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-lg font-black">Scan History</div>
          <div className="text-sm text-slate-300 mt-1">
            Stored locally in your browser (no login). Clear anytime.
          </div>
        </div>
        <button className="btn-ghost" onClick={onClear}>Clear history</button>
      </div>

      <div className="hr my-5" />

      {items.length === 0 ? (
        <div className="text-sm text-slate-300">No scans yet. Run your first scan from the Scan tab.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map((h) => (
            <button
              key={h.id}
              onClick={() => onSelect(h)}
              className="text-left rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="font-bold">{h.title}</div>
                <span className="pill">{h.result?.risk_label} • {h.result?.risk_score}</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">{new Date(h.createdAt).toLocaleString()}</div>
              <div className="text-sm text-slate-200 mt-3 line-clamp-3">
                {h.result?.summary?.replaceAll("**", "") || ""}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
