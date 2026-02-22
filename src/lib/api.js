// src/lib/api.js
// Central API wrapper for DeedSense UI
// Make sure Render UI has: VITE_API_BASE_URL=https://deedsense-api.onrender.com

const BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

function mustHaveBase() {
  if (!BASE) {
    throw new Error(
      "VITE_API_BASE_URL is missing. Set it in Render UI env vars (e.g. https://deedsense-api.onrender.com)"
    );
  }
}

async function parseJsonSafe(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { raw: text };
  }
}

async function request(path, { method = "GET", body, headers = {}, isForm = false } = {}) {
  mustHaveBase();
  const url = `${BASE}${path.startsWith("/") ? "" : "/"}${path}`;

  const opts = { method, headers: { ...headers } };

  if (body !== undefined) {
    if (isForm) {
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
    throw new Error(`Failed to fetch: ${e?.message || e}`);
  }

  const data = await parseJsonSafe(res);

  if (!res.ok) {
    const msg =
      data?.detail ||
      data?.error ||
      data?.message ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data;
}

/**
 * GET /health
 */
export async function apiHealth() {
  return request("/health");
}

/**
 * POST /scan
 * Body: { text: string, language?: string }
 * Response: { extracted_text?, result: {...}, ... }
 */
export async function apiScan({ text, language }) {
  return request("/scan", {
    method: "POST",
    body: { text, language },
  });
}

/**
 * POST /extract
 * FormData: file=<Upload>
 * Response: { extracted_text, result, filename, input_type, ... }
 */
export async function apiExtract(file) {
  const fd = new FormData();
  fd.append("file", file);
  return request("/extract", {
    method: "POST",
    body: fd,
    isForm: true,
  });
}

/**
 * Optional alias used by older UI code.
 * Many of your previous builds imported apiAnalyze; keep it as a wrapper.
 */
export async function apiAnalyze({ text, language }) {
  return apiScan({ text, language });
}

// Some older code expects apiExtractAndAnalyze; keep a compatible alias.
export async function apiExtractAndAnalyze(file) {
  return apiExtract(file);
}
