/**
 * Academic Text & Math Cleaner (Frontend)
 * Membersihkan artifact font encoding PDF seperti mathematical italic/bold symbols
 * ('푥' -> 'x', '푦' -> 'y', '푟' -> 'r', '푝' -> 'p', '푋' -> 'X', '푌' -> 'Y')
 * dan ligatur.
 */

export function sanitizeAcademicText(text: string | null | undefined): string {
  if (!text || typeof text !== "string") return "";

  return text
    // 1. Map BMP shift math alphanumeric artifact (\uD400 - \uD47F)
    .replace(/[\uD400-\uD47F]/g, (c) => {
      const code = c.charCodeAt(0);
      if (code >= 0xd400 && code <= 0xd419) return String.fromCharCode(65 + code - 0xd400); // A-Z Bold
      if (code >= 0xd41a && code <= 0xd433) return String.fromCharCode(97 + code - 0xd41a); // a-z Bold
      if (code >= 0xd434 && code <= 0xd44d) return String.fromCharCode(65 + code - 0xd434); // A-Z Italic
      if (code >= 0xd44e && code <= 0xd467) return String.fromCharCode(97 + code - 0xd44e); // a-z Italic
      return c;
    })
    // 2. Map SMP Mathematical Alphanumeric Symbols (U+1D400 to U+1D7FF)
    .replace(/[\uD835][\uDC00-\uDFFF]/gu, (c) => {
      try {
        return c.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
      } catch (_) {
        return c;
      }
    })
    // 3. Normalisasi ligatur umum font akademis
    .replace(/\uFB00/g, "ff")
    .replace(/\uFB01/g, "fi")
    .replace(/\uFB02/g, "fl")
    .replace(/\uFB03/g, "ffi")
    .replace(/\uFB04/g, "ffl")
    .replace(/\uFB05/g, "ft")
    .replace(/\uFB06/g, "st")
    // 4. Bersihkan non-printable control characters
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .replace(/[ \t]{3,}/g, "  ");
}

/**
 * Merapikan paragraf naskah akademis:
 * 1. Menggabungkan kata terpotong tanda hubung (hyphenation: "keseha-\ntan" -> "kesehatan")
 * 2. Menggabungkan single newline dalam 1 kalimat menjadi kalimat mengalir
 * 3. Menjaga double newline (\n\n) sebagai pemisah paragraf asli
 */
export function formatAcademicParagraphs(text: string | null | undefined): string[] {
  if (!text) return [];
  const sanitized = sanitizeAcademicText(text);

  // 1. Perbaiki pemotongan kata di ujung baris ("kata-\nlanjutan" -> "katalanjutan")
  const dehyphenated = sanitized.replace(/(\b[a-zA-Z]{2,})-\s*\n\s*([a-zA-Z]{2,}\b)/g, "$1$2");

  // 2. Perbaiki URL yang terpotong enter ("https://doi.org/\n10.xxx" -> "https://doi.org/10.xxx")
  const fixedUrls = dehyphenated.replace(/(https?:\/\/[^\s]+)\s*\n\s*([^\s]+)/gi, (match, p1, p2) => {
    if (/^[a-zA-Z0-9/._-]+$/.test(p2)) {
      return `${p1}${p2}`;
    }
    return match;
  });

  // 3. Pisahkan berdasarkan paragraf asli (double newline atau indentasi)
  const rawParagraphs = fixedUrls.split(/\n\s*\n+/);

  return rawParagraphs
    .map((p) => {
      // Gabungkan single newlines dalam satu paragraf menjadi spasi
      return p
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
    })
    .filter((p) => p.length > 0);
}

/**
 * Format Daftar Pustaka (Bibliography / References):
 * Memisahkan dan merapikan setiap entri rujukan referensi sesuai kaidah sitasi akademis.
 */
export function formatBibliographyEntries(text: string | null | undefined): string[] {
  if (!text) return [];
  const sanitized = sanitizeAcademicText(text);

  // Gabungkan kata terpotong tanda hubung
  const dehyphenated = sanitized.replace(/(\b[a-zA-Z]{2,})-\s*\n\s*([a-zA-Z]{2,}\b)/g, "$1$2");

  // Gabungkan URL terpotong enter
  const fixedUrls = dehyphenated.replace(/(https?:\/\/[^\s]+)\s*\n\s*([^\s]+)/gi, "$1$2");

  const lines = fixedUrls
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const entries: string[] = [];
  let currentEntry = "";

  // Pola awal entri baru daftar pustaka:
  // 1. [1], [2] atau 1., 2.
  // 2. Nama Penulis (Tahun): "Ayunigtyas, D., ... (2018)" atau "Dewi, I. G. ... (2021)"
  // 3. Nama Penulis: "Diananda, A."
  const isNewEntryPattern = (line: string) => {
    // Numbered: [1] or 1. or (1)
    if (/^(?:\[\d+\]|\d+\.|\(\d+\))\s+/.test(line)) return true;
    // Author with year: Surname, X. Y. (20xx) or Surname, X. (19xx)
    if (/^[A-Z][a-zA-Z'’\-]+,\s+[A-Z0-9.\s,&]+(?:\(\d{4}\)|\.\s*\d{4}|\.\s*\([12]\d{3}\))/.test(line)) return true;
    // Standard Author start: Surname, I.
    if (/^[A-Z][a-zA-Z'’\-]+,\s+[A-Z]\./.test(line)) return true;
    return false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (isNewEntryPattern(line)) {
      if (currentEntry.trim().length > 0) {
        entries.push(currentEntry.trim().replace(/\s+/g, " "));
      }
      currentEntry = line;
    } else {
      if (!currentEntry) {
        currentEntry = line;
      } else {
        // Sambungkan baris lanjutan ke entri rujukan sebelumnya
        currentEntry += " " + line;
      }
    }
  }

  if (currentEntry.trim().length > 0) {
    entries.push(currentEntry.trim().replace(/\s+/g, " "));
  }

  // Jika pola tidak memecah sama sekali (misal format non-standar), pisahkan per paragraf
  if (entries.length <= 1 && text.includes("\n\n")) {
    return formatAcademicParagraphs(text);
  }

  return entries;
}
