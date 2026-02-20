import { supabase } from "./supabase";

export const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

async function getAccessToken() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data?.session?.access_token || null;
}

export async function apiFetch(path, options = {}) {
  if (!API_BASE) throw new Error("VITE_API_BASE_URL not configured");

  const token = await getAccessToken();
  const headers = new Headers(options.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  // Try parse json always
  let data = null;
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) data = await res.json().catch(() => null);
  else data = await res.text().catch(() => null);

  if (!res.ok) {
    const detail =
      (data && data.detail) ||
      (typeof data === "string" ? data : null) ||
      `Request failed (${res.status})`;
    const err = new Error(detail);
    err.status = res.status;
    err.payload = data;
    throw err;
  }

  return data;
}

export async function apiMe() {
  return apiFetch("/me");
}

export async function apiSaveProfile(profile) {
  return apiFetch("/profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });
}

export async function apiExtract(file) {
  const fd = new FormData();
  fd.append("file", file);
  return apiFetch("/extract", { method: "POST", body: fd });
}

export async function apiAnalyzeText(text, preferred_language = null) {
  return apiFetch("/analyze-text", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, preferred_language }),
  });
}
