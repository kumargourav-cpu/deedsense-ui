// src/components/History.jsx
import React from "react";

export default function History({ items, onOpen }) {
  return (
    <div className="glass rounded-3xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-lg font-extrabold">Scan history</div>
          <div className="mt-1 text-sm text-slate-300">
            Your recent scans in this browser. (Later: sync per user with Postgres.)
          </div>
        </div>
      </div>

      <div className="hr" />

      {items.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
          No scans yet. Run your first scan to generate a history entry.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((it) => (
            <button
              key={it.id}
              className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:bg-white/10"
              onClick={() => onOpen(it)}
            >
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="text-sm font-bold text-slate-100">
                  {it.title || "Scan"}
                </div>
                <div className="text-xs text-slate-400">
                  {new Date(it.created_at).toLocaleString()}
                </div>
              </div>
              <div className="mt-2 line-clamp-2 text-sm text-slate-300">
                {it.preview}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="badge">Trust {Math.round(it.scores?.trust ?? 50)}%</span>
                <span className="badge">Risk {Math.round(it.scores?.risk ?? 50)}%</span>
                <span className="badge">Manipulation {Math.round(it.scores?.manipulation ?? 50)}%</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
