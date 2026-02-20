import React, { useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

export default function AuthModal({ open, onClose }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);
  const canUse = useMemo(() => !!supabase, []);

  if (!open) return null;

  async function sendOTP() {
    setStatus(null);
    if (!supabase) {
      setStatus("Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
      return;
    }
    if (!email.includes("@")) {
      setStatus("Enter a valid email.");
      return;
    }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin
      }
    });
    if (error) setStatus(error.message);
    else setStatus("✅ Magic link sent. Check your inbox (and spam).");
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-3xl bg-slate-950/70 p-5 ring-1 ring-white/10 backdrop-blur-xl">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-lg font-semibold text-white">Sign in</div>
            <div className="mt-1 text-sm text-slate-400">
              Email OTP (magic link). No password.
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl bg-white/5 px-3 py-2 text-sm text-slate-200 ring-1 ring-white/10 hover:bg-white/8"
          >
            Close
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <label className="block text-sm text-slate-300">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full rounded-2xl bg-white/5 px-4 py-3 text-white ring-1 ring-white/10 outline-none placeholder:text-slate-500 focus:ring-emerald-300/25"
          />

          <button
            disabled={!canUse}
            onClick={sendOTP}
            className="w-full rounded-2xl bg-emerald-500/15 px-4 py-3 text-sm font-semibold text-emerald-100 ring-1 ring-emerald-300/25 hover:bg-emerald-500/20 disabled:opacity-40"
          >
            Send magic link
          </button>

          {status && (
            <div className="rounded-2xl bg-white/5 p-3 text-sm text-slate-200 ring-1 ring-white/10">
              {status}
            </div>
          )}

          <div className="text-xs text-slate-500">
            By signing in, you agree this tool provides risk signals only — not legal advice.
          </div>
        </div>
      </div>
    </div>
  );
}
