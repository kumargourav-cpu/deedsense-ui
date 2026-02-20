// src/lib/api.js
const API_BASE =
  (import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  "https://deedsense-api.onrender.com";

async function parseErr(res) {
  try {
    const j = await res.json();
    return j?.detail || j?.error || JSON.stringify(j);
  } catch {
    try {
      return await res.text();
    } catch {
      return "Unknown error";
    }
  }
}

async function request(path, opts = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...opts,
    credentials: "include",
  });
  if (!res.ok) throw new Error(await parseErr(res));
  return res.json();
}

export async function health() {
  return request("/health", { method: "GET" });
}

/**
 * Backend should expose:
 * POST /extract  (multipart/form-data: file) -> { text, meta }
 * POST /analyze  (application/json: { text, preferred_language? }) -> report JSON
 *
 * If your backend only has /analyze for text, upload will fail gracefully.
 */
export async function extractFile(file) {
  const fd = new FormData();
  fd.append("file", file);
  return request("/extract", { method: "POST", body: fd });
}

export async function analyzeText({ text, preferred_language }) {
  return request("/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, preferred_language }),
  });
}

export { API_BASE };
