import React, { useState } from "react";

export default function Chat() {
  const [msg, setMsg] = useState("");
  const [log, setLog] = useState([
    { role: "assistant", text: "Ask questions about a property deal, risks, or what to verify next. (MVP chat UI only)" }
  ]);

  function send() {
    if (!msg.trim()) return;
    setLog((x) => [...x, { role: "user", text: msg.trim() }, { role: "assistant", text: "MVP: Chat API not connected yet. Next step is to connect the backend model + safe web sources." }]);
    setMsg("");
  }

  return (
    <div className="card">
      <div className="text-sm font-extrabold">Chat</div>
      <div className="mt-2 text-xs text-slate-300">This is a UI shell. We’ll wire it to the backend after core scanning is stable.</div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-black/40 p-4 h-72 overflow-auto space-y-3">
        {log.map((m, i) => (
          <div key={i} className={`${m.role === "user" ? "text-right" : ""}`}>
            <div className={`inline-block rounded-2xl px-3 py-2 text-sm ${m.role === "user" ? "bg-white text-black" : "bg-white/10 border border-white/10"}`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <input className="input" value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Type your question..." />
        <button className="btn-primary" onClick={send}>Send</button>
      </div>
    </div>
  );
}
