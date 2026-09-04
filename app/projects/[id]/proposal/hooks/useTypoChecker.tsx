import { useState } from "react";
import React from "react";
import { TypoSuggestion, CustomSubChapterItem } from "../types";

export const INDONESIAN_TYPO_DICTIONARY: Record<string, { suggestion: string; reason: string }> = {
  menatal: { suggestion: "Mental", reason: "Kata baku untuk kondisi psikologis/kejiwaan adalah 'mental'" },
  datasbae: { suggestion: "Database", reason: "Typo ejaan dari basis data / database" },
  analisa: { suggestion: "Analisis", reason: "Bentuk baku KBBI adalah 'analisis' (bukan analisa)" },
  praktek: { suggestion: "Praktik", reason: "Bentuk baku KBBI adalah 'praktik' (bukan praktek)" },
  merubah: { suggestion: "Mengubah", reason: "Kata dasar 'ubah' berimbuhan me- menjadi 'mengubah'" },
  kuantitative: { suggestion: "Kuantitatif", reason: "Ejaan bahasa Indonesia baku adalah 'kuantitatif'" },
  kualitative: { suggestion: "Kualitatif", reason: "Ejaan bahasa Indonesia baku adalah 'kualitatif'" },
  metodelogi: { suggestion: "Metodologi", reason: "Bentuk baku KBBI adalah 'metodologi'" },
  hipotesa: { suggestion: "Hipotesis", reason: "Bentuk baku KBBI adalah 'hipotesis'" },
  kuisioner: { suggestion: "Kuesioner", reason: "Bentuk baku KBBI adalah 'kuesioner'" },
  efektifitas: { suggestion: "Efektivitas", reason: "Bentuk baku berakhiran -itas adalah 'efektivitas'" },
  aktifitas: { suggestion: "Aktivitas", reason: "Bentuk baku KBBI adalah 'aktivitas'" },
  resiko: { suggestion: "Risiko", reason: "Bentuk baku KBBI adalah 'risiko' (bukan resiko)" },
  standarisasi: { suggestion: "Standardisasi", reason: "Bentuk baku serapan adalah 'standardisasi'" },
  obyek: { suggestion: "Objek", reason: "Bentuk baku KBBI adalah 'objek' dengan huruf 'j'" },
  subyek: { suggestion: "Subjek", reason: "Bentuk baku KBBI adalah 'subjek' dengan huruf 'j'" },
  jadual: { suggestion: "Jadwal", reason: "Bentuk baku KBBI adalah 'jadwal'" },
  theori: { suggestion: "Teori", reason: "Bentuk baku serapan adalah 'teori'" },
  variable: { suggestion: "Variabel", reason: "Bentuk baku serapan adalah 'variabel'" },
};

export function useTypoChecker(
  proposalData: any,
  setProposalData: React.Dispatch<React.SetStateAction<any>>,
  customSubChapters: CustomSubChapterItem[],
  setCustomSubChapters: React.Dispatch<React.SetStateAction<CustomSubChapterItem[]>>,
  triggerAutoSave: () => void
) {
  const [showTypoTooltip, setShowTypoTooltip] = useState<TypoSuggestion | null>(null);

  const handleFixTypo = (wrongWord: string, correctWord: string) => {
    setProposalData((prev: any) => {
      if (!prev) return prev;
      const str = JSON.stringify(prev);
      const regex = new RegExp(`\\b${wrongWord}\\b`, "gi");
      const updated = str.replace(regex, correctWord);
      return JSON.parse(updated);
    });

    setCustomSubChapters((prev) =>
      prev.map((s) => {
        const regex = new RegExp(`\\b${wrongWord}\\b`, "gi");
        return {
          ...s,
          title: s.title.replace(regex, correctWord),
          content: s.content.replace(regex, correctWord),
        };
      })
    );

    setShowTypoTooltip(null);
    triggerAutoSave();
  };

  const handleFixAllTypos = () => {
    setProposalData((prev: any) => {
      if (!prev) return prev;
      let str = JSON.stringify(prev);
      Object.entries(INDONESIAN_TYPO_DICTIONARY).forEach(([wrong, info]) => {
        const regex = new RegExp(`\\b${wrong}\\b`, "gi");
        if (regex.test(str)) {
          str = str.replace(regex, info.suggestion);
        }
      });
      return JSON.parse(str);
    });

    setCustomSubChapters((prev) =>
      prev.map((s) => {
        let content = s.content;
        let title = s.title;
        Object.entries(INDONESIAN_TYPO_DICTIONARY).forEach(([wrong, info]) => {
          const regex = new RegExp(`\\b${wrong}\\b`, "gi");
          content = content.replace(regex, info.suggestion);
          title = title.replace(regex, info.suggestion);
        });
        return { ...s, title, content };
      })
    );

    triggerAutoSave();
    alert("Pemeriksaan selesai! Seluruh ejaan dan kata tidak baku berhasil diperbaiki otomatis.");
  };

  const renderTextWithTypoHighlights = (text: string) => {
    if (!text) return null;
    const words = text.split(/(\s+|[.,!?:;()"\n])/);
    return words.map((w, idx) => {
      const cleanWord = w.toLowerCase().replace(/[^a-z0-9]/g, "");
      const typoInfo = INDONESIAN_TYPO_DICTIONARY[cleanWord];
      if (typoInfo) {
        return (
          <span
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              const rect = e.currentTarget.getBoundingClientRect();
              setShowTypoTooltip({
                word: w,
                suggestion: typoInfo.suggestion,
                reason: typoInfo.reason,
                position: { x: rect.left, y: rect.bottom + 6 },
              });
            }}
            style={{
              textDecoration: "underline wavy #EF4444",
              cursor: "pointer",
              backgroundColor: "rgba(254, 242, 242, 0.7)",
              borderRadius: "2px",
            }}
            title={`Kemungkinan tidak baku: ${w} -> Disarankan: ${typoInfo.suggestion}`}
          >
            {w}
          </span>
        );
      }
      return <span key={idx}>{w}</span>;
    });
  };

  return {
    showTypoTooltip,
    setShowTypoTooltip,
    handleFixTypo,
    handleFixAllTypos,
    renderTextWithTypoHighlights,
  };
}
