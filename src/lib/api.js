const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://deedsense-api.onrender.com";

export async function apiHealth() {
  const r = await fetch(`${API_BASE}/health`);
  if (!r.ok) throw new Error("API health check failed");
  return r.json();
}

export async function analyzeText({ text, lang }) {
  const r = await fetch(`${API_BASE}/analyze-text`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, lang }),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.detail || "Analyze failed");
  return data;
}

export async function extractAndAnalyze({ file, lang }) {
  // UI expects /extract (your earlier UI error said /extract). We standardize on /extract here.
  const fd = new FormData();
  fd.append("file", file);
  if (lang) fd.append("lang", lang);

  const r = await fetch(`${API_BASE}/extract`, { method: "POST", body: fd });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.detail || "Upload/extraction failed");
  return data;
}

export async function getHistory() {
  const r = await fetch(`${API_BASE}/history`);
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.detail || "History failed");
  return data;
}
