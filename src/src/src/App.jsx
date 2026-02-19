import React, { useEffect, useMemo, useRef, useState } from "react";
import { Chart } from "chart.js/auto";

const API_BASE = "https://trust-filter-ai.onrender.com"; // change to your new backend URL after deploy
const TOKEN_KEY = "deedsense_token";
const CLIENT_ID_KEY = "deedsense_client_id";

function getClientId() {
  let id = localStorage.getItem(CLIENT_ID_KEY);
  if (id) return id;
  id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(16).slice(2)}`;
  localStorage.setItem(CLIENT_ID_KEY, id);
  return id;
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(t) {
  if (!t) localStorage.removeItem(TOKEN_KEY);
  else localStorage.setItem(TOKEN_KEY, t);
}

function badge(score) {
  if (score >= 81) return "bg-red-600 text-white";
  if (score >= 61) return "bg-orange-500 text-white";
  if (score >= 41) return "bg-amber-400 text-slate-900";
  if (score >= 21) return "bg-sky-500 text-white";
  return "bg-emerald-500 text-white";
}

export default function App() {
  const clientId = useMemo(() => getClientId(), []);
  const [token, setTokenState] = useState(getToken());
  const [me, setMe] = useState({ authenticated: false });

  const [mode, setMode] = useState("scan"); // scan | auth
  const [authTab, setAuthTab] = useState("login"); // login | signup

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [allowImprove, setAllowImprove] = useState(false);

  const [category, setCategory] = useState("general");
  const [region, setRegion] = useState("global");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("Ready");

  const [result, setResult] = useState(null);
  const [freeLeft, setFreeLeft] = useState(null);
  const [usageInfo, setUsageInfo] = useState(null);

  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  async function apiFetch(path, options = {}) {
    const headers = options.headers || {};
    headers["Content-Type"] = "application/json";
    headers["X-Client-Id"] = clientId;
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return fetch(`${API_BASE}${path}`, { ...options, headers });
  }

  async function loadMe() {
    try {
      const r = await apiFetch("/me", { method: "GET", headers: { "X-Client-Id": clientId } });
      const j = await r.json();
      setMe(j);
    } catch {
      setMe({ authenticated: false });
    }
  }

  useEffect(() => { loadMe(); }, [token]);

  // Chart render
  useEffect(() => {
    if (!result?.risk_breakdown || !chartRef.current) return;

    const labels = Object.keys(result.risk_breakdown);
    const values = labels.map((k) => result.risk_breakdown[k]);

    if (chartInstance.current) chartInstance.current.destroy();

    chartInstance.current = new Chart(chartRef.current, {
      type: "bar",
      data: {
        labels,
        datasets: [{ label: "Risk Breakdown (0–25)", data: values }],
      },
      options: {
        responsive: true,
        scales: { y: { min: 0, max: 25 } },
      },
    });

    return () => chartInstance.current?.destroy();
  }, [result]);

  async function doLogin() {
    setStatus("Signing in...");
    const r = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Client-Id": clientId },
      body: JSON.stringify({ email, password }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      setStatus(j?.detail || "Login failed");
      return;
    }
    setToken(j.token);
    setTokenState(j.token);
    setMode("scan");
    setStatus("Signed in ✅");
  }

  async function doSignup() {
    setStatus("Creating account...");
    const r = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Client-Id": clientId },
      body: JSON.stringify({ email, password, allow_anonymized_improvement: allowImprove }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      setStatus(j?.detail || "Signup failed");
      return;
    }
    setToken(j.token);
    setTokenState(j.token);
    setMode("scan");
    setStatus("Account created ✅");
  }

  async function doAnalyze() {
    setResult(null);
    setStatus("Analyzing...");
    setUsageInfo(null);

    const r = await apiFetch("/analyze", {
      method: "POST",
      body: JSON.stringify({ content, category, region }),
    });

    if (r.status === 402) {
      const j = await r.json().catch(() => ({}));
      setStatus("Free limit reached");
      setResult({ paywall: true, message: j?.detail || "Upgrade needed" });
      setFreeLeft(0);
      return;
    }

    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      setStatus(j?.detail || "Analyze failed");
      return;
    }

    setResult(j);
    setFreeLeft(j.free_uses_left);
    setUsageInfo(j.usage_info);
    setStatus("Done ✅");
  }

  function logout() {
    setToken(null);
    setTokenState(null);
    setMe({ authenticated: false });
    setStatus("Signed out");
  }

  const scanDisabled = content.trim().length < 10;

  const pdfUrl = result?.scan_id
    ? `${API_BASE}/export/pdf/${result.scan_id}`
    : null;

  const chartUrl = result?.scan_id
    ? `${API_BASE}/export/chart/${result.scan_id}`
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-3xl font-extrabold tracking-tight">DeedSense AI</div>
            <div className="text-slate-300 mt-1">
              Global property transaction risk scoring for investors and brokers.
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-300">Status:</span>
            <span className="text-sm font-semibold">{status}</span>
          </div>
        </div>

        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">Scan</div>
              <div className="text-sm text-slate-300">
                Free left: <span className="font-semibold text-white">{freeLeft ?? "—"}</span>
              </div>
            </div>

            <div className="mt-3 grid sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-300">Category</label>
                <select
                  className="mt-1 w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="general">General</option>
                  <option value="purchase">Purchase</option>
                  <option value="rental">Rental</option>
                  <option value="offplan">Off-plan</option>
                  <option value="investment">Investment</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300">Region</label>
                <select
                  className="mt-1 w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                >
                  <option value="global">Global</option>
                  <option value="uae">UAE</option>
                  <option value="uk">UK</option>
                  <option value="us">US</option>
                  <option value="india">India</option>
                </select>
              </div>

              <div className="flex items-end justify-end gap-2">
                {!me.authenticated ? (
                  <button
                    onClick={() => setMode("auth")}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10"
                  >
                    Sign in
                  </button>
                ) : (
                  <button
                    onClick={logout}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10"
                  >
                    Sign out
                  </button>
                )}

                <button
                  disabled={scanDisabled}
                  onClick={doAnalyze}
                  className={`px-4 py-2 rounded-xl font-semibold ${
                    scanDisabled ? "bg-white/10 text-slate-400" : "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                  }`}
                >
                  Analyze
                </button>
              </div>
            </div>

            <textarea
              className="mt-3 w-full min-h-[170px] bg-black/30 border border-white/10 rounded-2xl px-4 py-3 text-slate-100 placeholder:text-slate-500"
              placeholder="Paste a broker message, contract clause, payment request, or listing conversation..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            <div className="mt-3 text-xs text-slate-300 leading-relaxed">
              <span className="font-semibold text-white">Disclaimer:</span> DeedSense AI provides risk screening, not legal/financial advice.
              Always verify identity, escrow, and contracts independently—especially before sending funds.
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur">
            <div className="text-lg font-semibold">Account</div>
            <div className="mt-2 text-sm text-slate-300">
              {me.authenticated ? (
                <>
                  Signed in as <span className="text-white font-semibold">{me.email}</span>
                  <div className="mt-2 text-xs text-slate-300">
                    Personalization: <span className="text-white font-semibold">ON</span> (based on your scan history)
                  </div>
                </>
              ) : (
                <>
                  You can scan <span className="text-white font-semibold">without sign-in</span>.
                  <div className="mt-2 text-xs text-slate-300">
                    Sign in to save history, export reports, and get personalized guidance.
                  </div>
                </>
              )}
            </div>

            {usageInfo && (
              <div className="mt-4 text-xs text-slate-300 bg-black/25 border border-white/10 rounded-xl p-3">
                <div><span className="text-white font-semibold">Usage</span></div>
                <div className="mt-1">Free total: {usageInfo.free_scans_total}</div>
                <div>Used: {usageInfo.free_scans_used}</div>
                <div>Mode: {usageInfo.identifier_type}</div>
              </div>
            )}

            <div className="mt-4 text-xs text-slate-400">
              API base: <span className="text-slate-200">{API_BASE}</span>
            </div>
          </div>
        </div>

        {/* AUTH MODAL */}
        {mode === "auth" && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-slate-950 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">Sign in / Sign up</div>
                <button onClick={() => setMode("scan")} className="text-slate-300 hover:text-white">✕</button>
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setAuthTab("login")}
                  className={`px-3 py-2 rounded-xl border ${authTab === "login" ? "bg-white/10 border-white/20" : "border-white/10"}`}
                >
                  Login
                </button>
                <button
                  onClick={() => setAuthTab("signup")}
                  className={`px-3 py-2 rounded-xl border ${authTab === "signup" ? "bg-white/10 border-white/20" : "border-white/10"}`}
                >
                  Sign up
                </button>
              </div>

              <div className="mt-4 grid gap-3">
                <input
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2"
                  placeholder="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                {authTab === "signup" && (
                  <label className="text-xs text-slate-300 flex gap-2 items-start">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={allowImprove}
                      onChange={(e) => setAllowImprove(e.target.checked)}
                    />
                    <span>
                      I agree to share <span className="text-white font-semibold">anonymized</span> data to improve detection (optional).
                      You can disable later.
                    </span>
                  </label>
                )}

                <button
                  onClick={authTab === "login" ? doLogin : doSignup}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl py-2"
                >
                  {authTab === "login" ? "Login" : "Create account"}
                </button>
              </div>

              <div className="mt-3 text-xs text-slate-400">
                Privacy note: personalization uses your scan history. We do not train any base model on your data without opt-in.
              </div>
            </div>
          </div>
        )}

        {/* RESULT */}
        {result && (
          <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur">
            {result.paywall ? (
              <div>
                <div className="text-xl font-bold">Free limit reached</div>
                <div className="text-slate-300 mt-2">{result.message}</div>
                <div className="mt-3 text-xs text-slate-400">
                  Tip: sign in to keep scan history and prepare for paid plans.
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xl font-bold">PTR Score</div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${badge(result.ptr_score)}`}>
                    {result.ptr_score}/100 — {result.risk_level}
                  </span>
                </div>

                <div className="mt-4 grid md:grid-cols-2 gap-4">
                  <div className="bg-black/25 border border-white/10 rounded-2xl p-4">
                    <div className="font-semibold">Risk breakdown</div>
                    <canvas ref={chartRef} className="mt-3"></canvas>
                    {chartUrl && (
                      <div className="mt-2 text-xs text-slate-400">
                        Server chart:{" "}
                        <a className="underline" href={chartUrl} target="_blank" rel="noreferrer">
                          open PNG
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="bg-black/25 border border-white/10 rounded-2xl p-4">
                    <div className="font-semibold">Exports</div>
                    <div className="mt-3 flex gap-2 flex-wrap">
                      {pdfUrl && (
                        <a
                          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10"
                          href={pdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => {
                            // include headers by opening through fetch? For MVP we keep it simple.
                            // In production we’ll generate a signed link or use cookies/JWT.
                          }}
                        >
                          Download PDF
                        </a>
                      )}
                      <button
                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10"
                        onClick={() => navigator.clipboard.writeText(result.investor_safe_reply || "")}
                      >
                        Copy safe reply
                      </button>
                    </div>

                    <div className="mt-3 text-xs text-slate-300">
                      Confidence: <span className="text-white font-semibold">{result.confidence_level}</span>
                    </div>
                    <div className="mt-2 text-xs text-slate-400">
                      {result.disclaimer}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid md:grid-cols-3 gap-4">
                  <div className="bg-black/25 border border-white/10 rounded-2xl p-4">
                    <div className="font-semibold">Red flags</div>
                    <ul className="mt-2 list-disc ml-5 text-slate-200 text-sm space-y-1">
                      {(result.red_flags_detected || []).slice(0, 12).map((x, i) => <li key={i}>{x}</li>)}
                    </ul>
                  </div>

                  <div className="bg-black/25 border border-white/10 rounded-2xl p-4">
                    <div className="font-semibold">Missing documentation</div>
                    <ul className="mt-2 list-disc ml-5 text-slate-200 text-sm space-y-1">
                      {(result.missing_documentation || []).slice(0, 12).map((x, i) => <li key={i}>{x}</li>)}
                    </ul>
                  </div>

                  <div className="bg-black/25 border border-white/10 rounded-2xl p-4">
                    <div className="font-semibold">Verification steps</div>
                    <ul className="mt-2 list-disc ml-5 text-slate-200 text-sm space-y-1">
                      {(result.verification_steps || []).slice(0, 12).map((x, i) => <li key={i}>{x}</li>)}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 bg-black/25 border border-white/10 rounded-2xl p-4">
                  <div className="font-semibold">Safe reply</div>
                  <textarea
                    className="mt-2 w-full bg-black/30 border border-white/10 rounded-2xl px-4 py-3 text-slate-100"
                    rows={5}
                    value={result.investor_safe_reply || ""}
                    readOnly
                  />
                  <div className="mt-2 text-xs text-slate-400">
                    Jurisdiction notes: {result.jurisdiction_notes || "Verify identity + escrow + contract terms."}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        <div className="mt-8 text-xs text-slate-400">
          DeedSense AI is designed for investor protection and compliance workflows. It does not replace legal advice.
        </div>
      </div>
    </div>
  );
}
