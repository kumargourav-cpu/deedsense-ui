import React, { useState } from "react";

const API_BASE = "https://deedsense-api.onrender.com";

const exchangeRates = {
  USD: 1,
  EUR: 0.92,
  AED: 3.67,
  INR: 83,
  GBP: 0.78,
  SGD: 1.34,
  AUD: 1.52,
};

export default function App() {
  const [activeTab, setActiveTab] = useState("scan");
  const [currency, setCurrency] = useState("USD");
  const [billing, setBilling] = useState("monthly");

  const convert = (usd) => {
    return (usd * exchangeRates[currency]).toFixed(0);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-8 py-4 border-b border-slate-800">
        <h1 className="text-xl font-bold text-blue-400">DeedSense</h1>

        <div className="space-x-6 hidden md:flex">
          <button onClick={() => setActiveTab("scan")}>Scan</button>
          <button onClick={() => setActiveTab("pricing")}>Pricing</button>
          <button onClick={() => setActiveTab("about")}>About</button>
          <button onClick={() => setActiveTab("faq")}>FAQ</button>
        </div>

        <button className="bg-blue-500 px-4 py-2 rounded-xl">
          Sign In
        </button>
      </nav>

      {/* CONTENT */}
      <div className="p-8 max-w-6xl mx-auto">

        {activeTab === "scan" && (
          <div>
            <h2 className="text-3xl font-bold mb-4">
              Trust & Manipulation Risk Scanner
            </h2>
            <textarea
              className="w-full h-40 bg-slate-900 border border-slate-700 rounded-xl p-4"
              placeholder="Paste listing description, broker message..."
            />
            <button className="mt-4 bg-blue-500 px-6 py-3 rounded-xl">
              Scan
            </button>
          </div>
        )}

        {activeTab === "pricing" && (
          <div>
            <h2 className="text-3xl font-bold mb-6">Pricing</h2>

            <div className="flex justify-between mb-6">
              <div>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="bg-slate-800 p-2 rounded-lg"
                >
                  {Object.keys(exchangeRates).map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <button
                  onClick={() => setBilling("monthly")}
                  className={`px-4 py-2 ${billing === "monthly" ? "bg-blue-500" : "bg-slate-800"} rounded-l-lg`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBilling("yearly")}
                  className={`px-4 py-2 ${billing === "yearly" ? "bg-blue-500" : "bg-slate-800"} rounded-r-lg`}
                >
                  Yearly
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">

              {/* FREE */}
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700">
                <h3 className="text-xl font-bold mb-2">Starter</h3>
                <p className="text-4xl font-bold mb-4">0 {currency}</p>
                <ul className="space-y-2 text-slate-400">
                  <li>✔ 5 Free Scans</li>
                  <li>✔ Guest Mode</li>
                  <li>✔ Basic Risk Score</li>
                  <li>✖ No History</li>
                </ul>
                <button className="mt-6 w-full bg-slate-700 py-2 rounded-lg">
                  Get Started
                </button>
              </div>

              {/* PRO */}
              <div className="bg-blue-900 p-6 rounded-2xl border border-blue-500">
                <h3 className="text-xl font-bold mb-2">Pro Investor</h3>
                <p className="text-4xl font-bold mb-4">
                  {convert(billing === "monthly" ? 29 : 290)} {currency}
                </p>
                <ul className="space-y-2 text-slate-200">
                  <li>✔ Unlimited Scans</li>
                  <li>✔ Scan History</li>
                  <li>✔ PDF Reports</li>
                  <li>✔ Priority Support</li>
                </ul>
                <button className="mt-6 w-full bg-blue-500 py-2 rounded-lg">
                  Upgrade
                </button>
              </div>

              {/* ENTERPRISE */}
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700">
                <h3 className="text-xl font-bold mb-2">Enterprise</h3>
                <p className="text-4xl font-bold mb-4">
                  {convert(199)} {currency}
                </p>
                <ul className="space-y-2 text-slate-400">
                  <li>✔ API Integration</li>
                  <li>✔ CRM Integration</li>
                  <li>✔ Bulk Upload</li>
                  <li>✔ Dedicated Support</li>
                </ul>
                <button className="mt-6 w-full bg-slate-700 py-2 rounded-lg">
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "about" && (
          <div>
            <h2 className="text-3xl font-bold mb-4">About DeedSense</h2>
            <p className="text-slate-400 leading-7">
              DeedSense is an AI-powered Trust & Manipulation Risk Scanner built for global property investors.
              It analyzes listing descriptions, broker messages, and payment terms to detect
              urgency pressure, scarcity tactics, ambiguous clauses, and manipulation signals.
            </p>
          </div>
        )}

        {activeTab === "faq" && (
          <div>
            <h2 className="text-3xl font-bold mb-4">FAQs</h2>
            <div className="space-y-4 text-slate-400">
              <p><strong>Is this legal advice?</strong><br/>No. It provides risk signals only.</p>
              <p><strong>Does it verify ownership?</strong><br/>No. Always check official land records.</p>
              <p><strong>Can brokers use it?</strong><br/>Yes, ethical brokers use it for transparency.</p>
            </div>
          </div>
        )}

      </div>

      <footer className="text-center text-slate-600 py-6 border-t border-slate-800">
        © 2026 DeedSense • Not Legal Advice
      </footer>

    </div>
  );
}
