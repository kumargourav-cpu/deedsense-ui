import React, { useEffect, useMemo, useState } from "react";
import TopNav from "./components/TopNav.jsx";
import AuthModal from "./components/AuthModal.jsx";
import ScanForm from "./components/ScanForm.jsx";
import ResultsPanel from "./components/ResultsPanel.jsx";
import Pricing from "./components/Pricing.jsx";
import About from "./components/About.jsx";
import History from "./components/History.jsx";

import { supabase } from "./lib/supabase";
import { detectLanguage, loadPreferredLanguage, savePreferredLanguage } from "./lib/lang";
import LanguagePrompt from "./components/LanguagePrompt.jsx";

export default function App() {
  const apiBase = import.meta.env.VITE_API_BASE; // e.g. https://deedsense-api.onrender.com

  const [active, setActive] = useState("scan");
  const [authOpen, setAuthOpen] = useState(false);

  const [session, setSession] = useState(null);
  const token = session?.access_token || null;
  const user = session?.user || null;

  const [apiResponse, setApiResponse] = useState(null);
  const [extractedText, setExtractedText] = useState("");

  const [preferredLanguage, setPreferredLanguage] = useState(loadPreferredLanguage());
  const [detectedCandidate, setDetectedCandidate] = useState(null);

  const languageForUI = useMemo(() => preferredLanguage?.name || "English", [preferredLanguage]);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session || null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s || null);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSession(null);
  }

  function onDetectedLanguageCandidate(text) {
    const detected = detectLanguage(text);
    if (!detected) return;
    // If already chosen, don't nag
    if (preferredLanguage?.iso1 || preferredLanguage?.name) return;
    setDetectedCandidate(detected);
  }

  function acceptLanguage(detected) {
    setPreferredLanguage(detected);
    savePreferredLanguage(detected);
    setDetectedCandidate(null);
  }

  function declineLanguage() {
    savePreferredLanguage({ name: "English", iso1: "en" });
    setPreferredLanguage({ name: "English", iso1: "en" });
    setDetectedCandidate(null);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <TopNav
        active={active}
        setActive={setActive}
        user={user}
        onOpenAuth={() => setAuthOpen(true)}
        onSignOut={signOut}
      />

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />

      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Header band */}
        <div className="rounded-3xl bg-gradient-to-r from-emerald-400/10 via-white/5 to-indigo-400/10 p-6 ring-1 ring-white/10 backdrop-blur-xl">
          <div className="text-2xl font-semibold">DeedSense</div>
          <div className="mt-1 text-sm text-slate-300">
            Trust & Manipulation Risk Scanner for Property Investors (UAE + worldwide)
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-300">
            <span className="rounded-full bg-white/8 px-3 py-1 ring-1 ring-white/10">
              Preferred language: <span className="font-semibold">{languageForUI}</span>
            </span>
            <span className="rounded-full bg-white/8 px-3 py-1 ring-1 ring-white/10">
              API: <span className="font-semibold">{apiBase || "NOT SET"}</span>
            </span>
            {!user && (
              <span className="rounded-full bg-amber-500/10 px-3 py-1 ring-1 ring-amber-300/20 text-amber-100">
                Sign in required to scan (OTP)
              </span>
            )}
          </div>
        </div>

        {/* Language permission prompt */}
        <div className="mt-4">
          <LanguagePrompt
            detected={detectedCandidate}
            onAccept={acceptLanguage}
            onDecline={declineLanguage}
          />
        </div>

        <div className="mt-4 space-y-4">
          {active === "scan" && (
            <>
              <ScanForm
                apiBase={apiBase}
                token={token}
                onResult={setApiResponse}
                onExtractedText={setExtractedText}
                onDetectedLanguageCandidate={onDetectedLanguageCandidate}
                preferredLanguage={preferredLanguage}
              />
              <ResultsPanel extractedText={extractedText} apiResponse={apiResponse} />
            </>
          )}

          {active === "history" && <History apiBase={apiBase} token={token} />}

          {active === "pricing" && <Pricing />}

          {active === "about" && <About />}
        </div>

        <div className="mt-8 text-center text-xs text-slate-500">
          © 2026 DeedSense • MVP UI • Not legal advice • Use at your own risk
        </div>
      </div>
    </div>
  );
}
