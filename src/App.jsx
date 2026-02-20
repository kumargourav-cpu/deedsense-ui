import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabase";
import { apiAnalyzeText, apiExtract, apiMe, apiSaveProfile, API_BASE } from "./lib/api";

import TopNav from "./components/TopNav";
import ScanForm from "./components/ScanForm";
import ResultsPanel from "./components/ResultsPanel";
import History from "./components/History";
import Pricing from "./components/Pricing";
import About from "./components/About";
import FAQ from "./components/FAQ";
import AuthModal from "./components/AuthModal";
import ProfileModal from "./components/ProfileModal";
import LanguagePrompt from "./components/LanguagePrompt";

const PAGES = ["Scan", "History", "Pricing", "About", "FAQ"];

export default function App() {
  const [page, setPage] = useState("Scan");

  const [session, setSession] = useState(null);
  const [me, setMe] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [result, setResult] = useState(null);

  const [langPromptOpen, setLangPromptOpen] = useState(false);
  const [preferredLang, setPreferredLang] = useState(null);
  const [detectedLang, setDetectedLang] = useState(null);

  const signedIn = !!session;
  const profileComplete = !!me?.profile_complete;

  // -----------------------------
  // Auth bootstrap
  // -----------------------------
  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setSession(data?.session || null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession || null);
    });

    return () => sub?.subscription?.unsubscribe?.();
  }, []);

  // -----------------------------
  // Load /me when signed in
  // -----------------------------
  useEffect(() => {
    async function load() {
      if (!signedIn) {
        setMe(null);
        return;
      }
      try {
        const data = await apiMe();
        setMe(data);

        // force profile completion if needed
        if (data?.signed_in && !data?.profile_complete) setProfileOpen(true);
      } catch (e) {
        setError(e.message || "Failed to load user info.");
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signedIn]);

  // Force auth before any use
  useEffect(() => {
    if (!signedIn) setAuthOpen(true);
  }, [signedIn]);

  // -----------------------------
  // Handlers
  // -----------------------------
  async function handleSaveProfile(profile) {
    await apiSaveProfile(profile);
    const data = await apiMe();
    setMe(data);
  }

  async function handleUpload(file) {
    setError("");
    setBusy(true);
    setResult(null);
    try {
      const out = await apiExtract(file); // expects { text, meta }
      const t = out?.text || "";
      setExtractedText(t);

      // Optional: naive language detection prompt trigger
      const hasArabic = /[\u0600-\u06FF]/.test(t);
      const lang = hasArabic ? "Arabic" : "English";
      setDetectedLang(lang);

      // Ask permission to respond in detected language
      setLangPromptOpen(true);
    } catch (e) {
      if (e.message === "PROFILE_REQUIRED") setProfileOpen(true);
      else if ((e.message || "").includes("Sign in required")) setAuthOpen(true);
      else setError(`Upload/extraction failed: ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function handleScan(text) {
    setError("");
    setBusy(true);
    setResult(null);
    try {
      const out = await apiAnalyzeText(text, preferredLang);
      setResult(out);
    } catch (e) {
      if (e.message === "PROFILE_REQUIRED") setProfileOpen(true);
      else if ((e.message || "").includes("Sign in required")) setAuthOpen(true);
      else setError(e.message || "Scan failed.");
    } finally {
      setBusy(false);
    }
  }

  function renderPage() {
    if (page === "History") return <History me={me} />;
    if (page === "Pricing") return <Pricing me={me} />;
    if (page === "About") return <About />;
    if (page === "FAQ") return <FAQ />;
    return (
      <div className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
        <ScanForm
          apiBase={API_BASE}
          busy={busy}
          error={error}
          extractedText={extractedText}
          onExtractFile={handleUpload}
          onScan={handleScan}
          requireAuth={true}
          signedIn={signedIn}
          profileComplete={profileComplete}
          onOpenAuth={() => setAuthOpen(true)}
          onOpenProfile={() => setProfileOpen(true)}
          setExtractedText={setExtractedText}
        />
        <ResultsPanel result={result} />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <TopNav
        page={page}
        setPage={setPage}
        pages={PAGES}
        signedIn={signedIn}
        userEmail={me?.user?.email || session?.user?.email}
        profileComplete={profileComplete}
        onSignIn={() => setAuthOpen(true)}
        onCompleteProfile={() => setProfileOpen(true)}
        onSignOut={async () => {
          if (supabase) await supabase.auth.signOut();
          setSession(null);
          setMe(null);
          setAuthOpen(true);
        }}
      />

      <main className="mx-auto max-w-6xl px-4 pb-20 pt-6">{renderPage()}</main>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthed={(sess) => {
          setSession(sess);
          setAuthOpen(false);
        }}
      />

      <ProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        onSave={handleSaveProfile}
      />

      <LanguagePrompt
        open={langPromptOpen}
        detectedLanguage={detectedLang}
        onClose={() => setLangPromptOpen(false)}
        onAllow={(lang) => {
          setPreferredLang(lang);
          setLangPromptOpen(false);
        }}
        onDeny={() => {
          setPreferredLang(null);
          setLangPromptOpen(false);
        }}
      />
    </div>
  );
}
