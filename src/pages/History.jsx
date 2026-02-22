// src/pages/History.jsx
import React, { useMemo, useState } from "react";

export default function History({ history, setHistory }) {
  const [q, setQ] = useState("");
  const [groupByFolder, setGroupByFolder] = useState(true);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return history;
    return history.filter((h) => {
      const hay = [
        h.folder, h.property, h.developer, h.country, h.project,
        ...(h.tags || []),
        h.filename, h.input_type,
        h.extracted_text?.slice(0, 1000),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(s);
    });
  }, [history, q]);

  const grouped = useMemo(() => {
    if (!groupByFolder) return { All: filtered };
    const map = {};
    for (const h of filtered) {
      const key = h.folder || "Unfiled";
      map[key] = map[key] || [];
      map[key].push(h);
    }
    return map;
  }, [filtered, groupByFolder]);

  function clearAll() {
    if (!confirm("Clear all local history?")) return;
    setHistory([]);
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-lg font-extrabold">Scan history</div>
          <div className="mt-1 text-sm text-slate-300">
            Stored locally in this browser (enterprise DB later). Supports folders + tags.
          </div>
        </div>
        <button
          className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
          onClick={clearAll}
        >
          Clear history
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <input
          className="w-full md:w-96 rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none"
          placeholder="Search folders, tags, developer, country, project…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={groupByFolder}
            onChange={(e) => setGroupByFolder(e.target.checked)}
          />
          Group by folder
        </label>
      </div>

      <div className="mt-4 space-y-5">
        {Object.entries(grouped).map(([folder, items]) => (
          <div key={folder} className="rounded-2xl border border-white/10 bg-black/10 p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="font-extrabold">{folder}</div>
              <div className="text-xs text-slate-400">{items.length} scans</div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3">
              {items.map((h) => (
                <div key={h.id} className="rounded-2xl bg-white p-4 text-slate-900 shadow">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-black">
                      {h.property || h.filename || h.input_type}
                    </div>
                    <div className="text-xs text-slate-500">{new Date(h.ts).toLocaleString()}</div>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    {h.developer ? <span className="rounded-full bg-slate-100 px-2 py-1">Developer: {h.developer}</span> : null}
                    {h.country ? <span className="rounded-full bg-slate-100 px-2 py-1">Country: {h.country}</span> : null}
                    {h.project ? <span className="rounded-full bg-slate-100 px-2 py-1">Project: {h.project}</span> : null}
                    {(h.tags || []).map((t) => (
                      <span key={t} className="rounded-full bg-indigo-50 px-2 py-1 text-indigo-700">
                        #{t}
                      </span>
                    ))}
                  </div>

                  <div className="mt-3 text-sm">
                    Score:{" "}
                    <span className="font-black">
                      {h?.result?.risk_score ?? "—"}
                    </span>{" "}
                    • {h?.result?.risk_label ?? "—"}
                  </div>

                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-semibold text-slate-700">
                      View extracted text
                    </summary>
                    <div className="mt-2 max-h-56 overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs whitespace-pre-wrap">
                      {h.extracted_text || "—"}
                    </div>
                  </details>
                </div>
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
            No scans found.
          </div>
        ) : null}
      </div>
    </div>
  );
}
