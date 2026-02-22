const API_BASE = import.meta.env.VITE_API_BASE_URL?.trim() || "";

function errText(e) {
  return e?.message || "Unknown error";
}

export async function apiInfo() {
  const r = await fetch(`${API_BASE}/info`);
  if (!r.ok) throw new Error(`API /info failed (${r.status})`);
  return await r.json();
}

export async function apiExtract(file) {
  try {
    const fd = new FormData();
    fd.append("file", file);

    const r = await fetch(`${API_BASE}/extract`, {
      method: "POST",
      body: fd,
    });

    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data?.detail || `Extract failed (${r.status})`);
    return data;
  } catch (e) {
    throw new Error(`Upload/extraction failed: ${errText(e)}`);
  }
}

export async function apiScan(text, language) {
  try {
    const r = await fetch(`${API_BASE}/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, language }),
    });

    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data?.detail || `Scan failed (${r.status})`);
    return data;
  } catch (e) {
    throw new Error(`Scan failed: ${errText(e)}`);
  }
}
