import React, { useState } from "react";
import { Zap, Sparkles, FileEdit, X, ArrowRight, RefreshCw } from "lucide-react";
import {
  CustomSubChapterItem,
  ACADEMIC_PRESET_ITEMS,
  AcademicPresetItem,
} from "../../types";

interface AddSubChapterModalProps {
  showAddSubChapterModal: boolean;
  setShowAddSubChapterModal: (show: boolean) => void;
  customSubChapters: CustomSubChapterItem[];
  setCustomSubChapters: React.Dispatch<React.SetStateAction<CustomSubChapterItem[]>>;
  triggerAutoSave: () => void;
  projectTitle?: string;
}

export function AddSubChapterModal({
  showAddSubChapterModal,
  setShowAddSubChapterModal,
  customSubChapters,
  setCustomSubChapters,
  triggerAutoSave,
  projectTitle,
}: AddSubChapterModalProps) {
  const [addSubModalTab, setAddSubModalTab] = useState<"presets" | "ai" | "custom">("presets");
  const [presetFilterChapter, setPresetFilterChapter] = useState<"all" | "bab1" | "bab2" | "bab3">("all");
  const [isAiSuggestingSubs, setIsAiSuggestingSubs] = useState(false);
  const [aiSuggestedSubsList, setAiSuggestedSubsList] = useState<
    { title: string; desc: string; content: string; chapter: "bab1" | "bab2" | "bab3" }[]
  >([]);

  const [newSubChapterTitle, setNewSubChapterTitle] = useState("");
  const [newSubChapterContent, setNewSubChapterContent] = useState("");
  const [selectedChapterForCustom, setSelectedChapterForCustom] = useState<"bab1" | "bab2" | "bab3">("bab1");

  if (!showAddSubChapterModal) return null;

  const handleInsertPresetSubChapter = (preset: AcademicPresetItem) => {
    const newSub: CustomSubChapterItem = {
      id: `sub_${Date.now()}`,
      chapter: preset.chapter,
      level: "subbab",
      prefix: preset.num,
      indentCm: 0,
      title: `${preset.num} ${preset.title}`,
      content: preset.content,
    };

    setCustomSubChapters((prev) => [...prev, newSub]);
    setShowAddSubChapterModal(false);
    triggerAutoSave();
  };

  const handleGenerateAiSubSuggestions = () => {
    setIsAiSuggestingSubs(true);
    setTimeout(() => {
      const generated = [
        {
          title: "Evaluasi Efektivitas Prompt AI dalam Pembelajaran",
          desc: "Kajian empiris mengenai frekuensi dan kualitas prompt mahasiswa",
          content:
            "Evaluasi efektivitas interaksi mahasiswa dengan tools kecerdasan buatan dinilai dari variasi prompt instruksi dan tingkat akurasi hasil sintesis tugas yang diperoleh.",
          chapter: "bab2" as const,
        },
        {
          title: "Matriks Komparasi Tools AI (ChatGPT, Copilot, Gemini)",
          desc: "Perbandingan fitur dan adopsi alat bantu AI di lingkungan kampus",
          content:
            "Analisis komparatif mengidentifikasi perbedaan kapabilitas masing-masing model LLM dalam mendukung pengerjaan tugas analitis dan komputasional mahasiswa.",
          chapter: "bab2" as const,
        },
        {
          title: "Distribusi Sampel Mahasiswa per Angkatan & Jurusan",
          desc: "Pengelompokan responden untuk memastikan representasi populasi yang seimbang",
          content:
            "Sampel penelitian didistribusikan secara proporsional berdasarkan program studi dan angkatan aktif guna meminimalisir bias demografis.",
          chapter: "bab3" as const,
        },
        {
          title: "Prosedur Pengujian Hipotesis Mediasi (Bootstrapping)",
          desc: "Pengujian efek tidak langsung variabel intervening dengan 5000 subsampel",
          content:
            "Signifikansi efek mediasi diuji menggunakan teknik non-parametrik bootstrapping dengan confidence interval 95% (two-tailed).",
          chapter: "bab3" as const,
        },
      ];
      setAiSuggestedSubsList(generated);
      setIsAiSuggestingSubs(false);
    }, 700);
  };

  const handleAddCustomSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubChapterTitle.trim()) return;

    const newSub: CustomSubChapterItem = {
      id: `sub_custom_${Date.now()}`,
      chapter: selectedChapterForCustom,
      level: "subbab",
      prefix: "",
      indentCm: 0,
      title: newSubChapterTitle.trim(),
      content: newSubChapterContent.trim(),
    };

    setCustomSubChapters((prev) => [...prev, newSub]);
    setNewSubChapterTitle("");
    setNewSubChapterContent("");
    setShowAddSubChapterModal(false);
    triggerAutoSave();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.5)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: 20,
      }}
    >
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 16,
          width: "100%",
          maxWidth: 680,
          padding: 24,
          border: "1px solid #E2E8F0",
          boxShadow: "0 20px 40px rgba(15, 23, 42, 0.2)",
          display: "flex",
          flexDirection: "column",
          maxHeight: "90vh",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: "linear-gradient(135deg, #4338CA 0%, #6366F1 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
              }}
            >
              <Zap size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: "#0F172A" }}>
                Tambah Sub-Bab Cepat &amp; Otomatis
              </h3>
              <p style={{ fontSize: 12, color: "#64748B", margin: "2px 0 0" }}>
                Pilih preset standar skripsi atau gunakan rekomendasi AI 1-klik tanpa repot atur
                penomoran manual.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowAddSubChapterModal(false)}
            style={{
              background: "#F1F5F9",
              border: "none",
              borderRadius: 8,
              padding: "6px 8px",
              cursor: "pointer",
              color: "#64748B",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Sub-Tabs: Presets (1-Click), Rekomendasi AI, Kustom */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr 0.8fr",
            gap: 6,
            background: "#F8FAFC",
            padding: 4,
            borderRadius: 10,
            marginBottom: 16,
            border: "1px solid #E2E8F0",
          }}
        >
          {[
            { id: "presets", label: "⚡ 1-Click Preset Populer" },
            { id: "ai", label: "✨ Rekomendasi Pintar AI" },
            { id: "custom", label: "✍️ Tulis Kustom" },
          ].map((t) => {
            const isSelected = addSubModalTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setAddSubModalTab(t.id as any);
                  if (t.id === "ai" && aiSuggestedSubsList.length === 0) {
                    handleGenerateAiSubSuggestions();
                  }
                }}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "none",
                  background: isSelected ? "#FFFFFF" : "transparent",
                  color: isSelected ? "#4338CA" : "#64748B",
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: 12,
                  cursor: "pointer",
                  boxShadow: isSelected ? "0 2px 8px rgba(0,0,0,0.05)" : "none",
                  transition: "all 0.15s ease",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: 1-CLICK PRESETS */}
        {addSubModalTab === "presets" && (
          <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
            {/* Chapter filter pills */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
              {[
                { id: "all", label: "Semua Bab" },
                { id: "bab1", label: "BAB I Pendahuluan" },
                { id: "bab2", label: "BAB II Kajian Pustaka" },
                { id: "bab3", label: "BAB III Metodologi" },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setPresetFilterChapter(f.id as any)}
                  style={{
                    padding: "5px 10px",
                    borderRadius: 20,
                    border: presetFilterChapter === f.id ? "1px solid #4338CA" : "1px solid #E2E8F0",
                    background: presetFilterChapter === f.id ? "#EEEAFE" : "#FFFFFF",
                    color: presetFilterChapter === f.id ? "#4338CA" : "#64748B",
                    fontSize: 11.5,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Grid Cards of Presets */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                paddingRight: 4,
                maxHeight: 360,
              }}
            >
              {ACADEMIC_PRESET_ITEMS.filter(
                (p) => presetFilterChapter === "all" || p.chapter === presetFilterChapter
              ).map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => handleInsertPresetSubChapter(preset)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1.5px solid #E2E8F0",
                    background: "#FAFAFA",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#4338CA";
                    e.currentTarget.style.background = "#FFFFFF";
                    e.currentTarget.style.boxShadow = "0 6px 16px rgba(67, 56, 202, 0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#E2E8F0";
                    e.currentTarget.style.background = "#FAFAFA";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 6,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 10.5,
                          fontWeight: 800,
                          padding: "2px 7px",
                          borderRadius: 6,
                          background: "#EEEAFE",
                          color: "#4338CA",
                        }}
                      >
                        {preset.num}
                      </span>
                      <span style={{ fontSize: 10, color: "#94A3B8", fontWeight: 600 }}>
                        {preset.badge}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>
                      {preset.title}
                    </div>
                    <div style={{ fontSize: 11, color: "#64748B", lineHeight: 1.35 }}>
                      {preset.desc}
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingTop: 8,
                      borderTop: "1px dashed #E2E8F0",
                    }}
                  >
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#4338CA" }}>
                      + Sisipkan 1-Klik
                    </span>
                    <ArrowRight size={13} color="#4338CA" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: AI SMART RECOMMENDATIONS */}
        {addSubModalTab === "ai" && (
          <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <div style={{ fontSize: 12, color: "#475569" }}>
                Disesuaikan dengan judul riset: <strong>&quot;{projectTitle || "Topik Riset"}&quot;</strong>
              </div>
              <button
                type="button"
                onClick={handleGenerateAiSubSuggestions}
                disabled={isAiSuggestingSubs}
                style={{
                  background: "#EEEAFE",
                  border: "none",
                  borderRadius: 8,
                  padding: "5px 10px",
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: "#4338CA",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <RefreshCw size={12} className={isAiSuggestingSubs ? "animate-spin" : ""} />
                <span>Regenerate Saran</span>
              </button>
            </div>

            {isAiSuggestingSubs ? (
              <div style={{ padding: 40, textAlign: "center", color: "#64748B" }}>
                <RefreshCw
                  size={24}
                  className="animate-spin"
                  style={{ margin: "0 auto 12px", color: "#4338CA" }}
                />
                <div style={{ fontSize: 13, fontWeight: 600 }}>
                  AI sedang menganalisis variabel &amp; metodologi proposal...
                </div>
              </div>
            ) : (
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  maxHeight: 360,
                }}
              >
                {aiSuggestedSubsList.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 10,
                      border: "1px solid #E2E8F0",
                      background: "#FAFAFA",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                        <span
                          style={{
                            fontSize: 10.5,
                            fontWeight: 800,
                            padding: "2px 6px",
                            borderRadius: 4,
                            background: "#DCFCE7",
                            color: "#166534",
                          }}
                        >
                          {item.chapter.toUpperCase()}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>
                          {item.title}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: "#64748B" }}>{item.desc}</div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const newSub: CustomSubChapterItem = {
                          id: `sub_ai_${Date.now()}_${idx}`,
                          chapter: item.chapter,
                          level: "subbab",
                          prefix: item.chapter === "bab2" ? "2.X" : "3.X",
                          indentCm: 0,
                          title: item.title,
                          content: item.content,
                        };
                        setCustomSubChapters((prev) => [...prev, newSub]);
                        setShowAddSubChapterModal(false);
                        triggerAutoSave();
                      }}
                      style={{
                        background: "#4338CA",
                        color: "#FFFFFF",
                        border: "none",
                        borderRadius: 8,
                        padding: "6px 12px",
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      + Masukkan
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CUSTOM MANUAL */}
        {addSubModalTab === "custom" && (
          <form
            onSubmit={handleAddCustomSub}
            style={{ display: "flex", flexDirection: "column", gap: 12 }}
          >
            <div>
              <label
                style={{ fontSize: 11.5, fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}
              >
                Pilih Bab Tujuan:
              </label>
              <select
                value={selectedChapterForCustom}
                onChange={(e) => setSelectedChapterForCustom(e.target.value as any)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid #CBD5E1",
                  fontSize: 13,
                  background: "#FFFFFF",
                }}
              >
                <option value="bab1">BAB I: Pendahuluan</option>
                <option value="bab2">BAB II: Tinjauan Pustaka</option>
                <option value="bab3">BAB III: Metodologi Penelitian</option>
              </select>
            </div>

            <div>
              <label
                style={{ fontSize: 11.5, fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}
              >
                Judul Sub-Bab Baru:
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 1.6 Batasan Masalah atau 2.5 Grand Theory"
                value={newSubChapterTitle}
                onChange={(e) => setNewSubChapterTitle(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid #CBD5E1",
                  fontSize: 13,
                }}
              />
              <span style={{ fontSize: 10.5, color: "#94A3B8", marginTop: 2, display: "block" }}>
                *Penomoran dan indentasi margin A4 akan diatur otomatis sesuai standar akademik.
              </span>
            </div>

            <div>
              <label
                style={{ fontSize: 11.5, fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}
              >
                Uraian Pembahasan Awal:
              </label>
              <textarea
                rows={4}
                placeholder="Tuliskan uraian pembahasan atau draft paragraf awal di sini..."
                value={newSubChapterContent}
                onChange={(e) => setNewSubChapterContent(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid #CBD5E1",
                  fontSize: 12.5,
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
              <button
                type="button"
                onClick={() => setShowAddSubChapterModal(false)}
                style={{
                  background: "#F1F5F9",
                  border: "1px solid #CBD5E1",
                  borderRadius: 8,
                  padding: "7px 14px",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                Batal
              </button>
              <button
                type="submit"
                style={{
                  background: "#4338CA",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: 8,
                  padding: "7px 18px",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                Simpan Sub-Bab
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
