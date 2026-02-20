import { franc } from "franc-min";
import langs from "langs";

// Map franc 3-letter code -> language name + ISO1 if available
export function detectLanguage(text) {
  const t = (text || "").trim();
  if (t.length < 25) return null;

  const code3 = franc(t, { minLength: 20 });
  if (!code3 || code3 === "und") return null;

  const lang = langs.where("3", code3);
  if (!lang) return null;

  return {
    code3,
    name: lang.name,
    iso1: (lang["1"] || "").toLowerCase() || null
  };
}

// very simple "preferred language" choice storage (browser)
export function loadPreferredLanguage() {
  try {
    return JSON.parse(localStorage.getItem("deedsense_lang_pref") || "null");
  } catch {
    return null;
  }
}

export function savePreferredLanguage(pref) {
  localStorage.setItem("deedsense_lang_pref", JSON.stringify(pref));
}
