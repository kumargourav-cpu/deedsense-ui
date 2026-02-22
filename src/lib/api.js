const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:10000";

async function safeJson(res) {
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { raw: text }; }
}

export async function apiHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`Health failed (${res.status})`);
  return safeJson(res);
}

export async function apiExtract(file) {
  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch(`${API_BASE}/extract`, {
    method: "POST",
    body: fd
  });

  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.detail || `Extract failed (${res.status})`);
  return data;
}

export async function apiAnalyze(text, preferred_language) {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, preferred_language })
  });

  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.detail || `Analyze failed (${res.status})`);
  return data;
}

export async function apiScan(file, preferred_language) {
  const fd = new FormData();
  fd.append("file", file);
  if (preferred_language) fd.append("preferred_language", preferred_language);

  const res = await fetch(`${API_BASE}/scan`, {
    method: "POST",
    body: fd
  });

  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.detail || `Scan failed (${res.status})`);
  return data;
}
