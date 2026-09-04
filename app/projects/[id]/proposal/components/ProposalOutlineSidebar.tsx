import React from "react";
import { FileText, Plus, Sparkles } from "lucide-react";
import { TabKey, CustomSubChapterItem, ReferenceItem } from "../types";

interface ProposalOutlineSidebarProps {
  activeTab: TabKey;
  handleNavigateToSection: (tabId: TabKey, elementId?: string) => void;
  references: ReferenceItem[];
  customSubChapters: CustomSubChapterItem[];
  setShowAddSubChapterModal: (show: boolean) => void;
  handleGenerateProposal: () => void;
}

export function ProposalOutlineSidebar({
  activeTab,
  handleNavigateToSection,
  references,
  customSubChapters,
  setShowAddSubChapterModal,
  handleGenerateProposal,
}: ProposalOutlineSidebarProps) {
  const activeRefsCount = references.filter((r) => r.selected).length;

  const chapters = [
    { id: "cover" as TabKey, label: "Halaman Sampul / Cover", subs: [] },
    { id: "approval" as TabKey, label: "Lembar Persetujuan", subs: [] },
    { id: "abstract" as TabKey, label: "Abstrak & Keywords", subs: [] },
    {
      id: "bab1" as TabKey,
      label: "BAB I PENDAHULUAN",
      subs: [
        { label: "1.1 Latar Belakang", elementId: "sub_1_1" },
        { label: "1.2 Identifikasi Masalah", elementId: "sub_1_2" },
        { label: "1.3 Rumusan Masalah", elementId: "sub_1_3" },
        { label: "1.4 Tujuan Penelitian", elementId: "sub_1_4" },
        { label: "1.5 Manfaat Penelitian", elementId: "sub_1_5" },
      ],
    },
    {
      id: "bab2" as TabKey,
      label: "BAB II TINJAUAN PUSTAKA",
      subs: [
        { label: "2.1 Landasan Teori", elementId: "sub_2_1" },
        { label: "2.2 Kerangka Berpikir", elementId: "sub_2_2" },
        { label: "2.3 Hipotesis Penelitian", elementId: "sub_2_3" },
      ],
    },
    {
      id: "matrix" as TabKey,
      label: "Matriks Literatur Scopus/SINTA",
      subs: [],
    },
    {
      id: "bab3" as TabKey,
      label: "BAB III METODOLOGI PENELITIAN",
      subs: [
        { label: "3.1 Jenis Penelitian & Desain", elementId: "sub_3_1" },
        { label: "3.2 Populasi dan Sampel", elementId: "sub_3_2" },
        { label: "3.3 Teknik Pengumpulan Data", elementId: "sub_3_3" },
        { label: "3.4 Teknik Analisis Data", elementId: "sub_3_4" },
      ],
    },
    { id: "references" as TabKey, label: `Daftar Pustaka (${activeRefsCount})`, subs: [] },
    { id: "appendix" as TabKey, label: "Lampiran Kuesioner", subs: [] },
  ];

  return (
    <aside
      id="left_outline_sidebar"
      className="no-print"
      style={{
        width: 250,
        background: "#FFFFFF",
        borderRight: "1px solid #E2E8F0",
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 105px)",
        position: "sticky",
        top: 105,
        zIndex: 20,
      }}
    >
      {/* Outline Header */}
      <div
        style={{
          padding: "14px 18px",
          borderBottom: "1px solid #F1F5F9",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 800,
            color: "#64748B",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          OUTLINE
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button
            type="button"
            onClick={() => setShowAddSubChapterModal(true)}
            style={{
              background: "#F1F5F9",
              border: "none",
              borderRadius: 6,
              padding: "4px 6px",
              cursor: "pointer",
              color: "#334155",
            }}
            title="Tambah Sub-Bab Baru"
          >
            <Plus size={13} />
          </button>
          <button
            type="button"
            onClick={handleGenerateProposal}
            style={{
              background: "#EEEAFE",
              border: "none",
              borderRadius: 6,
              padding: "4px 6px",
              cursor: "pointer",
              color: "#4338CA",
            }}
            title="AI Generate Outline"
          >
            <Sparkles size={13} />
          </button>
        </div>
      </div>

      {/* Tree Navigation Chapters */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "12px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#94A3B8",
            textTransform: "uppercase",
            padding: "4px 6px",
            marginBottom: 2,
          }}
        >
          SKRIPSI
        </div>

        {chapters.map((item) => {
          const isActive = activeTab === item.id;
          const chapterCustomSubs = customSubChapters.filter(
            (c) => c.chapter === item.id && !c.hidden
          );

          return (
            <div key={item.id} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div
                onClick={() => handleNavigateToSection(item.id, `section_${item.id}`)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "7px 10px",
                  borderRadius: 8,
                  background: isActive ? "#EEEAFE" : "transparent",
                  color: isActive ? "#4338CA" : "#334155",
                  cursor: "pointer",
                  fontWeight: isActive ? 700 : 600,
                  fontSize: 12.5,
                  transition: "all 0.15s ease",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  <FileText size={14} color={isActive ? "#4338CA" : "#94A3B8"} />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</span>
                </div>
              </div>

              {/* Sub-chapters list */}
              {(item.subs.length > 0 || chapterCustomSubs.length > 0) && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    paddingLeft: 22,
                    gap: 2,
                    marginBottom: 4,
                  }}
                >
                  {item.subs.map((sub, sIdx) => (
                    <div
                      key={sIdx}
                      onClick={() => handleNavigateToSection(item.id, sub.elementId)}
                      style={{
                        padding: "4px 8px",
                        borderRadius: 6,
                        fontSize: 11.5,
                        color: "#64748B",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLElement).style.color = "#4338CA";
                        (e.target as HTMLElement).style.background = "#F8FAFC";
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLElement).style.color = "#64748B";
                        (e.target as HTMLElement).style.background = "transparent";
                      }}
                    >
                      <span style={{ color: "#CBD5E1" }}>•</span>
                      <span>{sub.label}</span>
                    </div>
                  ))}

                  {/* Custom sub-chapters added by user */}
                  {chapterCustomSubs.map((cSub) => (
                    <div
                      key={cSub.id}
                      onClick={() => handleNavigateToSection(item.id, cSub.id)}
                      style={{
                        padding: "4px 8px",
                        borderRadius: 6,
                        fontSize: 11.5,
                        color: "#4338CA",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontWeight: 600,
                      }}
                    >
                      <span>⚡</span>
                      <span>{cSub.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Add Sub-chapter button */}
      <div style={{ padding: "12px 14px", borderTop: "1px solid #F1F5F9" }}>
        <button
          type="button"
          onClick={() => setShowAddSubChapterModal(true)}
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: 8,
            border: "1px dashed #CBD5E1",
            background: "#F8FAFC",
            color: "#4338CA",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <Plus size={13} />
          <span>Tambah Bab / Sub-Bab</span>
        </button>
      </div>
    </aside>
  );
}
