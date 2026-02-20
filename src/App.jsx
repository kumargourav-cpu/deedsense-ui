// src/api.js

const API_BASE =
  (import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  "https://deedsense-api.onrender.com";

async function parseError(res) {
  try {
    const data = await res.json();
    return data?.detail || data?.error || JSON.stringify(data);
  } catch {
    try {
      return await res.text();
    } catch {
      return "Unknown error";
    }
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    credentials: "include",
  });

  if (!res.ok) {
    const msg = await parseError(res);
    throw new Error(`${res.status} ${res.statusText}: ${msg}`);
  }

  return res.json();
}

export async function health() {
  return request("/health", { method: "GET" });
}

export async function extractFile(file) {
  const fd = new FormData();
  fd.append("file", file);

  return request("/extract", {
    method: "POST",
    body: fd,
  });
}

export async function analyzeText(text) {
  return request("/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
}
