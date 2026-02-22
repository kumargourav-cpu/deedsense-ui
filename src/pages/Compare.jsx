// src/pages/Compare.jsx
import React, { useMemo, useState } from "react";

function diffWords(a, b) {
  // Simple diff: not perfect, but stable without dependencies.
  const A = (a || "").split(/\s+/);
  const B = (b || "").split(/\s+/);
  const setB = new Set(B);
  const setA = new Set(A);

  return {
    removed: A.filter((w) => w && !setB.has(w)).slice(0, 300),
    added: B.filter((w) => w && !setA.has(w)).slice(0, 300),
  };
}

export default function Compare({ history }) {
  const [leftId, setLeftId] = useState(history?.[0]?.id || "");
  const [rightId, setRightId] = useState(history?.[1]?.id || "");

  const left = useMemo(() => history.find((h) => h.id === leftId), [history, leftId]);
  const right = useMemo(() => history.find((h) => h.id === rightId), [history, rightId]);

  const d = useMemo(() => diffWords(left?.extracted_text, right?.extracted_text), [left, right]);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <div className="text-lg font-extrabold">Compare scans</div>
      <div className="mt-1 text-sm text-slate-300">
        Side-by-side comparison + change summary (added/removed text signals).
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <div className="text-xs font-semibold text-slate-300 mb-1">Left scan</div>
          <select
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none"
            value={leftId}
            onChange={(e) => setLeftId(e.target.value)}
          >
            {history.map((h) => (
              <option key={h.id} value={h.id}>
                {h.folder ? `[${h.folder}] ` : ""}{h.property || h.filename || h.input_type} • {new Date(h.ts).toLocaleString()}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="text-xs font-semibold text-slate-300 mb-1">Right scan</div>
          <select
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none"
            value={rightId}
            onChange={(e) => setRightId(e.target.value)}
          >
            {history.map((h) => (
              <option key={h.id} value={h.id}>
                {h.folder ? `[${h.folder}] ` : ""}{h.property || h.filename || h.input_type} • {new Date(h.ts).toLocaleString()}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-4 text-slate-900 shadow">
          <div className="text-xs font-semibold text-slate-500">Left</div>
          <div className="mt-2 text-sm">
            Score: <b>{left?.result?.risk_score ?? "—"}</b> • {left?.result?.risk_label ?? "—"}
          </div>
          <div className="mt-3 max-h-64 overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs whitespace-pre-wrap">
            {left?.extracted_text || "—"}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 text-slate-900 shadow">
          <div className="text-xs font-semibold text-slate-500">Right</div>
          <div className="mt-2 text-sm">
            Score: <b>{right?.result?.risk_score ?? "—"}</b> • {right?.result?.risk_label ?? "—"}
          </div>
          <div className="mt-3 max-h-64 overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs whitespace-pre-wrap">
            {right?.extracted_text || "—"}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-4 text-slate-900 shadow">
          <div className="text-xs font-semibold text-slate-500">Added (right vs left)</div>
          <div className="mt-2 text-xs text-emerald-700">
            {d.added.length ? d.added.join(" ") : "No major additions detected."}
          </div>
        </div>
        <div className="rounded-2xl bg-white p-4 text-slate-900 shadow">
          <div className="text-xs font-semibold text-slate-500">Removed (left vs right)</div>
          <div className="mt-2 text-xs text-rose-700">
            {d.removed.length ? d.removed.join(" ") : "No major removals detected."}
          </div>
        </div>
      </div>
    </div>
  );
}
