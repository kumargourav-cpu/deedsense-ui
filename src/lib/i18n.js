export const LANGS = [
  { code: "auto", label: "Auto-detect" },
  { code: "en", label: "English" },
  { code: "ar", label: "Arabic" },
  { code: "hi", label: "Hindi" },
  { code: "ur", label: "Urdu" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "it", label: "Italian" },
  { code: "es", label: "Spanish" },
];

export function detectLanguageRough(text = "") {
  // Very light heuristic (no heavy libs). API can do true detection later.
  const t = text.trim();
  if (!t) return "auto";
  if (/[ء-ي]/.test(t)) return "ar";
  if (/[अ-ह]/.test(t)) return "hi";
  if (/[؀-ۿ]/.test(t)) return "ur";
  return "en";
}
