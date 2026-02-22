import React, { useEffect, useState } from "react";
import { getHistory } from "../lib/api.js";

export default function History() {
  const [items, setItems] = useState([]);
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const d = await getHistory();
        setItems(d.items || []);
        setNote(d.note || "");
      } catch (e) {
        setErr(e.message || "Failed to load history");
      }
    })();
  }, []);

  return (
    <div className="card">
      <div className="text-sm font-extrabold">Scan History</div>
      <div className="text-xs text-slate-300 mt-1">Stored by the API (or returns a note if DB not enabled).</div>

      {note ? <div className="mt-4 text-sm text-slate-400">{note}</div> : null}
      {err ? <div className="mt-4 text-sm text-red-300">{err}</div> : null}

      <div className="mt-5 space-y-3">
        {(items || []).length ? (
          items.map((it) => (
            <div key={it.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs text-slate-400">
                {it.created_at} • {it.input_type} • {it.filename || "text"}
              </div>
              <div className="mt-2 text-sm">
                Risk: <span className="font-semibold text-white">{it.result_json?.risk_score ?? "—"}</span> •{" "}
                {it.result_json?.risk_label ?? "—"}
              </div>
            </div>
          ))
        ) : (
          <div className="text-sm text-slate-400">No history yet.</div>
        )}
      </div>
    </div>
  );
}
