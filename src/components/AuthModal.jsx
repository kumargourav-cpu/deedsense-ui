// src/components/AuthModal.jsx
import React, { useMemo, useState } from "react";

export default function AuthModal({ open, onClose, onFakeLogin }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const valid = useMemo(() => /\S+@\S+\.\S+/.test(email.trim()), [email]);

  if (!open) return null;

  async function handleMagicLink() {
    setBusy(true);
    setMsg("");
    try {
      // Placeholder: your real Supabase magic link can be wired later.
      // For now we simulate login so the UI works end-to-end.
      await new Promise((r) => setTimeout(r, 650));
      onFakeLogin({ email: email.trim() });
      setMsg("Signed in (demo). You can wire real OTP later.");
      onClose();
    } catch (e) {
      setMsg(e?.message || "Auth failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/60 px-4">
      <div className="glass w-full max-w-lg rounded-3xl p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-base font-extrabold">Sign in</div>
            <div className="mt-1 text-sm text-slate-300">
              Sign in to sync your scan history across devices and unlock unlimited plans.
            </div>
          </div>
          <button className="btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="mt-5">
          <div className="label mb-2">Email</div>
          <input
            className="input"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="mt-2 text-xs text-slate-400">
            For now this is a demo sign-in. Later you can connect Supabase OTP / Magic link.
          </div>
        </div>

        {msg ? <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-sm">{msg}</div> : null}

        <div className="mt-5 flex justify-end gap-2">
          <button className="btn-ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleMagicLink}
            disabled={!valid || busy}
          >
            {busy ? "Signing in..." : "Send Magic Link (Demo)"}
          </button>
        </div>
      </div>
    </div>
  );
}
