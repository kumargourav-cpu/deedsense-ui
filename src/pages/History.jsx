import React, { useMemo, useState } from "react";

export default function History({ items, onOpen, onClear }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return (items || []).filter((x) => {
      const blob = JSON.stringify(x).toLowerCase();
      return blob.includes(s);
    });
  }, [items, q]);

  return (
    <div className="grid gap-4">
      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xl font-extrabold">Scan History</div>
            <div className="mt-2 text-sm text-slate-300">
              Stored locally in this browser (no login). Use search to quickly find past scans.
            </div>
          </div>

          <div className="flex gap-2">
            <button className="btn-ghost" onClick={onClear}>Clear history</button>
          </div>
        </div>

        <div className="mt-4">
          <input className="input" placeholder="Search (developer, risk label, signals…)" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      <div className="grid gap-3">
        {filtered.map((x) => (
          <button
            key={x.id}
            className="card p-5 text-left hover:bg-white/6 transition"
            onClick={() => onOpen(x)}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-extrabold">
                {x.filename || "Pasted text"} • {x.input_type}
              </div>
              <div className="pill">
                {x.analysis?.risk_label || "—"} • score {x.analysis?.risk_score ?? "—"}
              </div>
            </div>
            <div className="mt-2 text-xs text-slate-400">
              {new Date(x.createdAt).toLocaleString()}
            </div>
            <div className="mt-2 text-sm text-slate-300 line-clamp-2">
              {(x.extracted_text || "").slice(0, 220)}…
            </div>
          </button>
        ))}

        {filtered.length === 0 ? (
          <div className="card p-6 text-sm text-slate-300">
            No history yet. Run a scan on the Scan page.
          </div>
        ) : null}
      </div>
    </div>
  );
}
