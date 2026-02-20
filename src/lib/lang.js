// src/lib/lang.js

export function detectLanguageHeuristic(text) {
  const t = (text || "").slice(0, 2000);

  // Arabic script
  if (/[؀-ۿ]/.test(t)) return { code: "ar", name: "Arabic" };
  // Devanagari (Hindi)
  if (/[ऀ-ॿ]/.test(t)) return { code: "hi", name: "Hindi" };
  // Cyrillic
  if (/[Ѐ-ӿ]/.test(t)) return { code: "ru", name: "Russian" };
  // CJK
  if (/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(t))
    return { code: "zh", name: "Chinese/Japanese" };

  // Simple English/European heuristic
  const lower = t.toLowerCase();
  const englishHits =
    (lower.match(/\b(the|and|with|for|from|this|that|you|your|is|are|will)\b/g) || [])
      .length;

  const italianHits =
    (lower.match(/\b(il|lo|la|gli|le|un|una|che|per|con|senza|anche)\b/g) || [])
      .length;

  const frenchHits =
    (lower.match(/\b(le|la|les|un|une|des|pour|avec|sans|est|vous)\b/g) || [])
      .length;

  if (italianHits > englishHits && italianHits > 3) return { code: "it", name: "Italian" };
  if (frenchHits > englishHits && frenchHits > 3) return { code: "fr", name: "French" };
  return { code: "en", name: "English" };
}

export const LANGUAGE_CHOICES = [
  { code: "en", name: "English" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
  { code: "it", name: "Italian" },
  { code: "fr", name: "French" },
  { code: "es", name: "Spanish" },
  { code: "de", name: "German" },
];
