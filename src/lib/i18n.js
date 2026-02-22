export const LANGS = [
  { code: "en", label: "English" },
  { code: "ar", label: "Arabic (العربية)" },
  { code: "hi", label: "Hindi (हिंदी)" },
  { code: "fr", label: "French (Français)" },
  { code: "de", label: "German (Deutsch)" },
  { code: "it", label: "Italian (Italiano)" },
  { code: "es", label: "Spanish (Español)" }
];

export function prettyLang(code) {
  return LANGS.find((l) => l.code === code)?.label || code || "Unknown";
}
