const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://deedsense-api.onrender.com";

export function getApiBase() {
  return API_BASE.replace(/\/+$/, "");
}

export async function analyzeText({ text, outLang }) {
  const res = await fetch(`${getApiBase()}/analyze-text`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, out_lang: outLang || "en" }),
  });
  if (!res.ok) throw new Error(await safeErr(res));
  return res.json();
}

export async function extractAndAnalyze({ file, outLang }) {
  const fd = new FormData();
  fd.append("out_lang", outLang || "en");
  fd.append("file", file);

  const res = await fetch(`${getApiBase()}/extract-and-analyze`, {
    method: "POST",
    body: fd,
  });
  if (!res.ok) throw new Error(await safeErr(res));
  return res.json();
}

export async function chat({ message, contextText, outLang }) {
  const res = await fetch(`${getApiBase()}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      context_text: contextText || "",
      out_lang: outLang || "en",
    }),
  });
  if (!res.ok) throw new Error(await safeErr(res));
  return res.json();
}

async function safeErr(res) {
  try {
    const j = await res.json();
    return j?.detail ? String(j.detail) : JSON.stringify(j);
  } catch {
    return `${res.status} ${res.statusText}`;
  }
}
