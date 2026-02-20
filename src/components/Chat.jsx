import React, { useState } from "react";
import { chat } from "../lib/api.js";

export default function Chat({ lang, contextText }) {
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [thread, setThread] = useState([
    {
      role: "assistant",
      text:
        "Ask me anything about risks, verification, payment safety, or how to compare properties. " +
        "This MVP chat is offline (no web browsing yet). Share your context for best answers.",
    },
  ]);

  async function send() {
    const m = msg.trim();
    if (!m) return;
    setMsg("");
    setThread((t) => [...t, { role: "user", text: m }]);
    setBusy(true);
    try {
      const res = await chat({ message: m, contextText: contextText || "", outLang: lang });
      setThread((t) => [...t, { role: "assistant", text: res.reply }]);
    } catch (e) {
      setThread((t) => [...t, { role: "assistant", text: `Error: ${e.message}` }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="glass rounded-3xl p-6">
      <div className="text-lg font-black">Chat</div>
      <div className="text-sm text-slate-300 mt-2">
        Investor questions • due diligence guidance • clause understanding • negotiation prompts
      </div>

      <div className="hr my-5" />

      <div className="rounded-2xl border border-white/10 bg-black/20 p-4 h-[420px] overflow-auto space-y-3">
        {thread.map((m, i) => (
          <div key={i} className={`max-w-[90%] ${m.role === "user" ? "ml-auto" : ""}`}>
            <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed border border-white/10 ${
              m.role === "user" ? "bg-white text-slate-950" : "bg-white/5 text-slate-200"
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {busy ? <div className="text-xs text-slate-400">Thinking…</div> : null}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          className="input"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder="Ask: ‘Top red flags?’ ‘What should I verify?’ ‘How to compare payment plans?’"
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button className="btn-primary" onClick={send} disabled={busy}>Send</button>
      </div>

      <div className="text-xs text-slate-400 mt-3">
        Web research mode (with verified links) can be added later.
      </div>
    </div>
  );
}
