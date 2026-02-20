import React, { useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

export default function AuthModal({ open, onClose, onAuthed }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const valid = useMemo(() => /\S+@\S+\.\S+/.test(email.trim()), [email]);

  if (!open) return null;

  async function handleMagicLink() {
    if (!supabase) {
      setMsg("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Render.");
      return;
    }

    setBusy(true);
    setMsg("");
    try {
      const redirectTo = window.location.origin; // Render static site URL
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: redirectTo,
        },
      });
      if (error) throw error;

      setMsg("Magic link sent. Check your email and open the link to finish sign-in.");
    } catch (e) {
      setMsg(e?.message || "Auth failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRefreshSession() {
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();
    if (data?.session) {
      onAuthed?.(data.session);
      onClose();
    } else {
      setMsg("No active session yet. Open the magic link from your email, then click this.");
    }
  }

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/60 px-4">
      <div className="glass w-full max-w-lg rounded-3xl p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-base font-extrabold">Sign in / Sign up</div>
            <div className="mt-1 text-sm text-slate-300">
              You must sign in to use DeedSense. We use secure magic links (no password).
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
            We’ll send a secure sign-in link to your email. Open it, then return here.
          </div>
        </div>

        {msg ? (
          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
            {msg}
          </div>
        ) : null}

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button className="btn-ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>

          <button className="btn-ghost" onClick={handleRefreshSession} disabled={busy}>
            I opened the link
          </button>

          <button className="btn-primary" onClick={handleMagicLink} disabled={!valid || busy}>
            {busy ? "Sending..." : "Send Magic Link"}
          </button>
        </div>
      </div>
    </div>
  );
}
