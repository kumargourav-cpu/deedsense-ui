import React, { useEffect, useState } from "react";

export default function History({ apiBase, token }) {
  const [items, setItems] = useState([]);
  const [note, setNote] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    (async () => {
      setErr(null);
      setNote(null);
      setItems([]);
      if (!apiBase || !token) {
        setNote("Sign in to view scan history.");
        return;
      }
      try {
        const res = await fetch(`${apiBase}/history`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.detail || "Failed to fetch history");
        setItems(data.items || []);
        if (data.note) setNote(data.note);
      } catch (e) {
        setErr(String(e.message || e));
      }
    })();
  }, [apiBase, token]);

  return (
    <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur-xl">
      <div className="text-lg font-semibold text-white">Scan History</div>
      <div className="mt-1 text-sm text-slate-400">
        Saved history depends on API Postgres config + subscription logic.
      </div>

      {note && (
        <div className="mt-4 rounded-2xl bg-white/5 p-4 text-sm text-slate-200 ring-1 ring-white/10">
          {note}
        </div>
      )}

      {err && (
        <div className="mt-4 rounded-2xl bg-red-500/10 p-4 text-sm text-red-100 ring-1 ring-red-400/20">
          {err}
        </div>
      )}

      <div className="mt-4 space-y-3">
        {items.length === 0 && !note && !err ? (
          <div className="rounded-2xl bg-black/20 p-4 text-sm text-slate-400 ring-1 ring-white/10">
            No scans saved yet.
          </div>
        ) : (
          items.map((it) => (
            <div key={it.id} className="rounded-2xl bg-black/20 p-4 ring-1 ring-white/10">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-semibold text-white">
                  {it.input_type?.toUpperCase()} {it.filename ? `• ${it.filename}` : ""}
                </div>
                <div className="text-xs text-slate-400">
                  {it.created_at}
                </div>
              </div>
              <div className="mt-2 text-sm text-slate-200">
                Risk: <span className="font-semibold">{it.result_json?.risk_label}</span>{" "}
                <span className="text-slate-400">({it.result_json?.risk_score}/100)</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
