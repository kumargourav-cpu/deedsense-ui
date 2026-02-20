// src/App.jsx
import React, { useEffect, useMemo, useState } from "react";
import { analyzeText, extractFile, health } from "./api";

const TABS = ["Scan", "History", "Pricing", "About"];

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function riskLabel(score) {
  // score expected 0..100
  if (score >= 70) return { cls: "bad", text: "High risk" };
  if (score >= 40) return { cls: "warn", text: "Medium risk" };
  return { cls: "good", text: "Low risk" };
}

export default function App() {
  const [tab, setTab] = useState("Scan");

  const [apiOk, setApiOk] = useState(null);
  const [apiMsg, setApiMsg] = useState("");

  const [inputText, setInputText] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  // Simple local history (per browser). Later you can connect Postgres.
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("deedsense_history") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("deedsense_history", JSON.stringify(history));
  }, [history]);

  // Health check
  useEffect(() => {
    (async () => {
      try {
        const h = await health();
        setApiOk(!!h?.ok);
        setApiMsg(h?.message || "");
      } catch (e) {
        setApiOk(false);
        setApiMsg(e.message);
      }
    })();
  }, []);

  const canScan = useMemo(() => inputText.trim().length > 0 && !scanning, [inputText, scanning]);

  async function onUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setResult(null);
    setExtracting(true);

    try {
      const res = await extractFile(file);

      const text = (res?.text || "").trim();
      if (!text) {
        setError("No text could be extracted from this file. Try a text-based PDF or clearer image.");
        setInputText("");
        return;
      }
      setInputText(text);
    } catch (err) {
      setError(err.message || "File extraction failed");
    } finally {
      setExtracting(false);
      // allow re-upload same file
      e.target.value = "";
    }
  }

  async function onScan() {
    setError("");
    setResult(null);

    const text = inputText.trim();
    if (!text) {
      setError("Please paste text or upload a file first.");
      return;
    }

    setScanning(true);
    try {
      const res = await analyzeText(text);

      // Create a simple normalized risk score for display
      // If API returns its own score, we use it; otherwise fallback.
      const apiScore =
        typeof res?.score === "number"
          ? res.score
          : typeof res?.risk_score === "number"
          ? res.risk_score
          : null;

      const normalized = apiScore !== null ? clamp(Math.round(apiScore), 0, 100) : 50;

      const out = { ...res, _ui_risk_score: normalized };
      setResult(out);

      // Add to history
      setHistory((prev) => [
        {
          id: crypto?.randomUUID?.() || String(Date.now()),
          ts: new Date().toISOString(),
          preview: text.slice(0, 120),
          risk: normalized,
          raw: out,
        },
        ...prev,
      ]);
    } catch (err) {
      setError(err.message || "Scan failed");
    } finally {
      setScanning(false);
    }
  }

  function clearAll() {
    setInputText("");
    setResult(null);
    setError("");
  }

  function TopNav() {
    return (
      <div className="nav">
        <div className="brand">
          <div className="logo" />
          <div>
            <h1>DeedSense</h1>
            <p>Trust & Manipulation Risk Scanner for Property Investors</p>
          </div>
        </div>

        <div className="navlinks">
          {TABS.map((t) => (
            <button
              key={t}
              className={`pill ${tab === t ? "active" : ""}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="actions">
          {apiOk === null ? (
            <span className="badge">API: checking…</span>
          ) : apiOk ? (
            <span className="badge good">API: online</span>
          ) : (
            <span className="badge bad" title={apiMsg}>
              API: offline
            </span>
          )}

          {/* Placeholder auth button for now */}
          <button className="btn">Sign in</button>
        </div>
      </div>
    );
  }

  function ScanView() {
    const score = result?._ui_risk_score ?? null;
    const label = score !== null ? riskLabel(score) : null;

    return (
      <div className="grid">
        <div className="card">
          <h2>Scan a Listing / Deed / Broker Message</h2>
          <p className="sub">
            Upload a document or paste text. We extract and scan for urgency traps, vague claims,
            missing proof, pressure language, and risk signals (UAE + global investors).
          </p>

          <div className="row" style={{ justifyContent: "space-between" }}>
            <div>
              <div className="label">Upload (PDF / DOCX / JPG / PNG)</div>
              <input
                type="file"
                accept=".pdf,.doc,.docx,image/jpeg,image/png"
                onChange={onUpload}
                disabled={extracting || scanning}
              />
              <div className="small" style={{ marginTop: 6 }}>
                Tip: For best results, use text-based PDFs. Scanned PDFs require OCR on the API side.
              </div>
            </div>

            <div className="row">
              <button className="btn" onClick={clearAll} disabled={extracting || scanning}>
                Clear
              </button>
              <button
                className="btn primary"
                onClick={onScan}
                disabled={!canScan || extracting}
                title={!canScan ? "Paste or extract text first" : ""}
              >
                {scanning ? "Scanning…" : extracting ? "Extracting…" : "Scan"}
              </button>
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <div className="label">Paste / Extracted Text</div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste listing description, WhatsApp chat, payment plan terms, deed notes, etc…"
              disabled={extracting || scanning}
            />
          </div>

          {error ? (
            <div style={{ marginTop: 12 }} className="kv">
              <div className="k">Error</div>
              <div className="v" style={{ color: "var(--danger)" }}>
                {error}
              </div>
            </div>
          ) : null}

          <div style={{ marginTop: 12 }} className="small">
            <strong>Disclaimer:</strong> DeedSense provides a risk signal based on text patterns and AI analysis.
            It is not legal advice, not a guarantee, and should be validated with official documents and due diligence.
          </div>
        </div>

        <div className="card">
          <h2>Results</h2>
          <p className="sub">After scanning, you’ll see summary + risk signals + raw output.</p>

          {result ? (
            <>
              <div className="kv">
                <div className="k">Risk score</div>
                <div className="v">
                  <span className={`badge ${label.cls}`}>
                    {label.text} • {score}/100
                  </span>
                </div>
              </div>

              <div className="kv">
                <div className="k">What to do next</div>
                <div className="v">
                  Verify with official documents, escrow proof, RERA/land department checks, and legal review.
                </div>
              </div>

              <div className="label" style={{ marginTop: 10 }}>
                Raw response
              </div>
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </>
          ) : (
            <div className="small">Run a scan to see results here.</div>
          )}
        </div>
      </div>
    );
  }

  function HistoryView() {
    return (
      <div className="card" style={{ marginTop: 16 }}>
        <h2>Scan History</h2>
        <p className="sub">
          Stored locally in your browser for this MVP. (Later: store per signed-in user in Postgres.)
        </p>

        {history.length === 0 ? (
          <div className="small">No scans yet. Run your first scan from the Scan tab.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {history.slice(0, 25).map((h) => {
              const lbl = riskLabel(h.risk);
              return (
                <div key={h.id} className="kv">
                  <div className="k">
                    {new Date(h.ts).toLocaleString()}
                    <div style={{ marginTop: 6 }}>
                      <span className={`badge ${lbl.cls}`}>{lbl.text} • {h.risk}/100</span>
                    </div>
                  </div>
                  <div className="v">
                    <div style={{ marginBottom: 8, color: "var(--muted)" }}>{h.preview}…</div>
                    <button className="btn" onClick={() => { setTab("Scan"); setResult(h.raw); }}>
                      View result
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {history.length > 0 ? (
          <div style={{ marginTop: 12 }} className="row">
            <button
              className="btn"
              onClick={() => {
                setHistory([]);
                localStorage.removeItem("deedsense_history");
              }}
            >
              Clear history
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  function PricingView() {
    // Simple currency conversion table (manual MVP)
    const currencies = [
      { code: "USD", symbol: "$", m: 19, y: 190 },
      { code: "AED", symbol: "AED", m: 69, y: 690 },
      { code: "EUR", symbol: "€", m: 18, y: 180 },
      { code: "INR", symbol: "₹", m: 1499, y: 14999 },
      { code: "GBP", symbol: "£", m: 15, y: 150 },
    ];

    const [cur, setCur] = useState("USD");
    const c = currencies.find((x) => x.code === cur) || currencies[0];

    return (
      <div className="card" style={{ marginTop: 16 }}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <h2>Pricing</h2>
            <p className="sub">
              Start free. Upgrade for unlimited scans. Enterprise includes API integration (Stripe later).
            </p>
          </div>

          <div className="row">
            <span className="small">Currency</span>
            <select
              value={cur}
              onChange={(e) => setCur(e.target.value)}
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.06)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              {currencies.map((x) => (
                <option key={x.code} value={x.code} style={{ color: "black" }}>
                  {x.code}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
          <div className="card">
            <h2>Free</h2>
            <p className="sub">For quick checks & first-time users.</p>
            <div className="kv"><div className="k">Price</div><div className="v">0</div></div>
            <div className="kv"><div className="k">Scans</div><div className="v">5 free scans</div></div>
            <div className="kv"><div className="k">History</div><div className="v">Browser-only</div></div>
            <button className="btn primary" onClick={() => setTab("Scan")}>Start Free</button>
          </div>

          <div className="card">
            <h2>Pro</h2>
            <p className="sub">Unlimited scans for active investors.</p>
            <div className="kv"><div className="k">Monthly</div><div className="v">{c.symbol} {c.m}</div></div>
            <div className="kv"><div className="k">Yearly</div><div className="v">{c.symbol} {c.y} <span className="badge good">Save</span></div></div>
            <div className="kv"><div className="k">Scans</div><div className="v">Unlimited</div></div>
            <div className="kv"><div className="k">Support</div><div className="v">Priority email</div></div>
            <button className="btn primary" disabled title="Stripe later">Upgrade (soon)</button>
          </div>

          <div className="card">
            <h2>Enterprise</h2>
            <p className="sub">For portals, brokerages, banks, due diligence teams.</p>
            <div className="kv"><div className="k">From</div><div className="v">{c.symbol} {cur === "AED" ? "2500" : cur === "INR" ? "60000" : cur === "EUR" ? "650" : cur === "GBP" ? "550" : "700"} /mo</div></div>
            <div className="kv"><div className="k">API</div><div className="v">Yes (integration)</div></div>
            <div className="kv"><div className="k">SLA</div><div className="v">Custom</div></div>
            <button className="btn" disabled title="Contact flow later">Contact Sales (soon)</button>
          </div>
        </div>
      </div>
    );
  }

  function AboutView() {
    return (
      <div className="card" style={{ marginTop: 16 }}>
        <h2>About DeedSense</h2>
        <p className="sub">
          DeedSense helps property investors detect manipulation signals and risk patterns in listings,
          broker messages, payment terms, and deal summaries—across UAE and global markets.
        </p>

        <div className="kv">
          <div className="k">Who it’s for</div>
          <div className="v">Investors, home buyers, broker managers, portals, compliance teams.</div>
        </div>

        <div className="kv">
          <div className="k">Common use cases</div>
          <div className="v">
            Spot urgency traps • detect vague promises • summarize payment plan risks • compare multiple listings fast
          </div>
        </div>

        <h2 style={{ marginTop: 12 }}>FAQs</h2>
        <div className="small">
          <p><strong>Is this legal advice?</strong> No. Always validate through official documents and legal due diligence.</p>
          <p><strong>Can it analyze documents?</strong> Yes—upload PDF/DOCX/images and the API extracts text before scanning.</p>
          <p><strong>Does it work worldwide?</strong> Yes. The patterns are language-based and work broadly, with UAE-specific considerations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <TopNav />

      {tab === "Scan" && <ScanView />}
      {tab === "History" && <HistoryView />}
      {tab === "Pricing" && <PricingView />}
      {tab === "About" && <AboutView />}

      <div className="footer">
        © 2026 DeedSense • MVP UI • Not legal advice • Use at your own risk
      </div>
    </div>
  );
}
