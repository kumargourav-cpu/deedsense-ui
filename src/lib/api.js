// src/lib/api.js
const BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

function requireBase() {
  if (!BASE) {
    throw new Error(
      "VITE_API_BASE_URL is missing. Set it in Render UI env vars to https://deedsense-api.onrender.com"
    );
  }
}

async function readJsonOrText(res) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function normalizeError(payload, status) {
  // FastAPI often returns {detail: "..."} or {detail: {...}}
  const d = payload?.detail ?? payload?.error ?? payload?.message ?? payload?.raw;
  if (typeof d === "string") return d;
  if (d && typeof d === "object") return JSON.stringify(d, null, 2);
  return `Request failed (${status})`;
}

async function request(path, { method = "GET", body, headers = {}, form = false } = {}) {
  requireBase();
  const url = `${BASE}${path.startsWith("/") ? "" : "/"}${path}`;

  const opts = { method, headers: { ...headers } };

  if (body !== undefined) {
    if (form) {
      opts.body = body; // FormData
    } else {
      opts.headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify(body);
    }
  }

  let res;
  try {
    res = await fetch(url, opts);
  } catch (e) {
    // Most common: CORS or wrong URL
    throw new Error(
      `Failed to fetch. Check:\n- VITE_API_BASE_URL\n- API CORS (ALLOWED_ORIGINS)\n- API is up\n\nTechnical: ${e?.message || String(e)}`
    );
  }

  const payload = await readJsonOrText(res);

  if (!res.ok) {
    throw new Error(normalizeError(payload, res.status));
  }

  return payload;
}

// --- Exports used across UI ---
export function apiHealth() {
  return request("/health");
}

export function apiInfo() {
  return request("/info");
}

// POST /scan { text, language, meta? }
export function apiScan({ text, language, meta }) {
  return request("/scan", { method: "POST", body: { text, language, meta } });
}

// POST /extract multipart form-data file=<file>
export function apiExtract(file) {
  const fd = new FormData();
  fd.append("file", file);
  return request("/extract", { method: "POST", body: fd, form: true });
}
