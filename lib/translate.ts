/**
 * Free Client-Side Translation Helper (Non-AI / Library-Based)
 * Menggunakan Google Translate GTX public client endpoint & MyMemory fallback.
 * Tanpa biaya API token / kredit AI dan bekerja instan di sisi klien.
 */

const translationCache = new Map<string, string>();

/**
 * Deteksi apakah teks berbahasa Inggris berdasarkan kata kunci dan pola kalimat
 */
export function isEnglishText(text: string): boolean {
  if (!text || typeof text !== "string") return false;
  const clean = text.trim();
  if (clean.length < 6) return false;

  // Daftar stop words bahasa Inggris yang sangat umum dalam literatur ilmiah
  const englishPattern =
    /\b(the|and|of|in|is|that|with|for|as|on|by|at|from|this|which|was|were|has|have|had|been|their|are|an|be|or|it|we|our|can|all|not|its|more|also|development|significant|changes|various|aspects|human|life|including|education|psychology|research|study|analysis|effect|impact|results|findings|model|method|data|paper|journal|article|suggests|demonstrates|explored|evaluated)\b/gi;

  const matches = clean.match(englishPattern) || [];

  // Jika terdapat minimal 2 kata bahasa Inggris khas, atau karakter dominan ASCII dan minimal 1 kata Inggris
  return matches.length >= 2 || (matches.length >= 1 && /^[a-zA-Z0-9\s.,'"()\-–—;:!?%]+$/.test(clean));
}

/**
 * Menerjemahkan teks bahasa Inggris ke Bahasa Indonesia secara instan
 */
export async function translateEnglishToIndonesian(text: string): Promise<string> {
  const clean = text.trim();
  if (!clean) return text;

  // Cek cache in-memory
  if (translationCache.has(clean)) {
    return translationCache.get(clean)!;
  }

  // 1. Primary Method: Google Translate GTX Endpoint (Gratis, Cepat, Akurasi Tinggi)
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=id&dt=t&q=${encodeURIComponent(clean)}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const translated = data[0].map((item: any) => item[0]).filter(Boolean).join(" ");
        if (translated && translated.trim()) {
          const result = translated.trim();
          translationCache.set(clean, result);
          return result;
        }
      }
    }
  } catch (err) {
    console.warn("[Translate] GTX error, mencoba fallback:", err);
  }

  // 2. Fallback Method: MyMemory Free Translation API
  try {
    const fallbackUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(clean)}&langpair=en|id`;
    const fbRes = await fetch(fallbackUrl);
    if (fbRes.ok) {
      const fbData = await fbRes.json();
      if (fbData?.responseData?.translatedText) {
        const translated = fbData.responseData.translatedText.trim();
        if (translated) {
          translationCache.set(clean, translated);
          return translated;
        }
      }
    }
  } catch (err) {
    console.error("[Translate] Fallback MyMemory gagal:", err);
  }

  return clean;
}
