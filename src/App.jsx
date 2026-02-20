// src/api.js

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "https://deedsense-api.onrender.com";

// Generic request handler
async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      credentials: "include",
      headers: {
        ...(options.headers || {}),
      },
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "API request failed");
    }

    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

// ===============================
// TEXT SCAN
// ===============================
export async function scanText(text) {
  if (!text || text.trim().length === 0) {
    throw new Error("No text provided for scan.");
  }

  return apiRequest("/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
}

// ===============================
// FILE UPLOAD (PDF / DOCX / IMAGE)
// ===============================
export async function extractFile(file) {
  if (!file) {
    throw new Error("No file selected.");
  }

  const formData = new FormData();
  formData.append("file", file);

  return apiRequest("/extract", {
    method: "POST",
    body: formData,
  });
}

// ===============================
// HEALTH CHECK
// ===============================
export async function checkHealth() {
  return apiRequest("/health");
}
