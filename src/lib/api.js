const BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

function requireBase() {
  if (!BASE) throw new Error("VITE_API_BASE_URL is missing.");
}

async function readPayload(res) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { error: { code: "INVALID_JSON", message: text } };
  }
}

function ensureError(payload, status) {
  if (payload?.error) return payload.error;
  return {
    code: `HTTP_${status}`,
    message: payload?.detail || payload?.message || `Request failed (${status})`,
    details: payload,
  };
}

async function request(path, { method = "GET", body, headers = {} } = {}) {
  requireBase();
  const res = await fetch(`${BASE}${path.startsWith("/") ? path : `/${path}`}`, {
    method,
    headers,
    body,
  });
  const payload = await readPayload(res);
  if (!res.ok) {
    const err = ensureError(payload, res.status);
    throw new Error(err.message || "Unknown API error");
  }
  return payload;
}

export function apiHealth() {
  return request("/health");
}

export function apiScanMultipart({ file, plan, language = "en" }) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("plan", plan);
  fd.append("language", language);
  return request("/scan", { method: "POST", body: fd });
}
