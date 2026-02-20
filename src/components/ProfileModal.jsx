import React, { useMemo, useState } from "react";

export default function ProfileModal({ open, onClose, onSave }) {
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("");
  const [investorType, setInvestorType] = useState("Investor");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const valid = useMemo(() => {
    return fullName.trim().length >= 2 && country.trim().length >= 2 && investorType.trim().length >= 2;
  }, [fullName, country, investorType]);

  if (!open) return null;

  async function submit() {
    setBusy(true);
    setMsg("");
    try {
      await onSave?.({
        full_name: fullName.trim(),
        country: country.trim(),
        investor_type: investorType.trim(),
      });
      onClose?.();
    } catch (e) {
      setMsg(e?.message || "Failed to save profile.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/70 px-4">
      <div className="glass w-full max-w-xl rounded-3xl p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-base font-extrabold">Complete your profile</div>
            <div className="mt-1 text-sm text-slate-300">
              Before scanning, we require a profile to reduce abuse and improve reporting relevance.
            </div>
          </div>
          <button className="btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <div className="label mb-2">Full name</div>
            <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g., Kumar Gourav" />
          </div>

          <div>
            <div className="label mb-2">Country</div>
            <input className="input" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g., UAE / India / UK" />
          </div>

          <div className="sm:col-span-2">
            <div className="label mb-2">I am a</div>
            <select className="input" value={investorType} onChange={(e) => setInvestorType(e.target.value)}>
              <option>Investor</option>
              <option>End Buyer</option>
              <option>Agent / Broker</option>
              <option>Developer</option>
              <option>Property Manager</option>
              <option>Other</option>
            </select>
          </div>
        </div>

        {msg ? <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-sm">{msg}</div> : null}

        <div className="mt-6 flex justify-end gap-2">
          <button className="btn-ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button className="btn-primary" onClick={submit} disabled={!valid || busy}>
            {busy ? "Saving..." : "Save profile"}
          </button>
        </div>

        <div className="mt-4 text-xs text-slate-400">
          Security note: profiles + sign-in help prevent automated abuse, scraping, and brute-force attempts.
        </div>
      </div>
    </div>
  );
}
