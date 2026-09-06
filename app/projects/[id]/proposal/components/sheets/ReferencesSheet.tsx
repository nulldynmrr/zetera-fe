import React, { useState } from "react";
import { GripVertical } from "lucide-react";
import { A4Sheet } from "../A4Sheet";
import { PdfPageSelection, ReferenceItem } from "../../types";

interface ReferencesSheetProps {
  citedReferencesList: (ReferenceItem & { originalIndex: number })[];
  citationStyle: string;
  isEditMode: boolean;
  triggerAutoSave: () => void;
  pdfPageSelection: PdfPageSelection;
  pageNumberPos: string;
  marginPreset: "4333" | "4433";
  handleJumpToCitationInText: (
    refIndex: number,
    authors?: string,
    doi?: string,
    e?: React.MouseEvent
  ) => void;
  onReorderReferences?: (newOrder: ReferenceItem[]) => void;
}

export function ReferencesSheet({
  citedReferencesList,
  citationStyle,
  isEditMode,
  triggerAutoSave,
  pdfPageSelection,
  pageNumberPos,
  marginPreset,
  handleJumpToCitationInText,
  onReorderReferences,
}: ReferencesSheetProps) {
  const isNumbered = citationStyle === "IEEE" || citationStyle === "VANCOUVER";
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx);
  };

  const handleDrop = (targetIdx: number) => {
    if (draggedIdx === null || draggedIdx === targetIdx) {
      setDraggedIdx(null);
      setDragOverIdx(null);
      return;
    }

    const next = [...citedReferencesList];
    const [moved] = next.splice(draggedIdx, 1);
    next.splice(targetIdx, 0, moved);

    if (onReorderReferences) {
      onReorderReferences(next);
    }
    triggerAutoSave();
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  return (
    <A4Sheet
      sheetId="sheet_references"
      isIncludedInPrint={pdfPageSelection.references}
      pageNumber="6"
      pageNumberPos={pageNumberPos}
      marginPreset={marginPreset}
    >
      <div
        id="section_references"
        contentEditable={isEditMode}
        suppressContentEditableWarning
        onBlur={triggerAutoSave}
        style={{ textAlign: "justify", outline: "none" }}
      >
        <div
          style={{
            textAlign: "center",
            fontSize: "14pt",
            fontWeight: 700,
            textTransform: "uppercase",
            marginBottom: 20,
          }}
        >
          DAFTAR PUSTAKA
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {citedReferencesList.length === 0 ? (
            <p
              style={{
                fontStyle: "italic",
                color: "#64748B",
                margin: "12px 0",
                textAlign: "center",
              }}
            >
              (Belum ada rujukan yang disitasi di dalam naskah. Rujukan akan otomatis muncul di sini
              saat dikutip).
            </p>
          ) : (
            citedReferencesList.map((r, idx) => {
              const pubName =
                (r.publication || "")
                  .replace(/\s*\(OpenAlex\)/gi, "")
                  .replace(/OpenAlex/gi, "Jurnal Ilmiah Terindeks")
                  .trim() ||
                (r.doi ? "Jurnal Ilmiah Nasional Terakreditasi" : "Publikasi Ilmiah Akademik");

              const isDraggingThis = draggedIdx === idx;
              const isOverThis = dragOverIdx === idx;

              return (
                <div
                  key={r.id || idx}
                  draggable={isEditMode}
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverIdx(idx);
                  }}
                  onDragLeave={() => {
                    if (dragOverIdx === idx) setDragOverIdx(null);
                  }}
                  onDrop={() => handleDrop(idx)}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 6,
                    padding: "3px 4px",
                    borderRadius: 4,
                    background: isOverThis ? "#eff6ff" : "transparent",
                    borderTop: isOverThis ? "2px solid #3b82f6" : "2px solid transparent",
                    opacity: isDraggingThis ? 0.4 : 1,
                    transition: "all 0.15s ease",
                  }}
                >
                  {isEditMode && (
                    <span
                      title="Geser (drag & drop) untuk memindahkan urutan rujukan"
                      style={{
                        cursor: "grab",
                        color: "#94a3b8",
                        display: "inline-flex",
                        alignItems: "center",
                        marginTop: 5,
                        flexShrink: 0,
                        userSelect: "none",
                      }}
                    >
                      <GripVertical size={13} />
                    </span>
                  )}
                  <p
                    id={`ref-${isNumbered ? r.originalIndex : idx + 1}`}
                    onClick={(e) => handleJumpToCitationInText(r.originalIndex, r.authors, r.doi, e)}
                    style={{
                      flex: 1,
                      textIndent: "-1.27cm",
                      paddingLeft: "1.27cm",
                      margin: 0,
                      lineHeight: 1.8,
                      scrollMarginTop: 80,
                      cursor: "pointer",
                      borderRadius: 4,
                      paddingTop: 2,
                      paddingBottom: 2,
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(99, 102, 241, 0.07)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                    title="Klik rujukan ini untuk melompat kembali ke kalimat sitasi di naskah bab"
                  >
                    {isNumbered ? <strong>[{idx + 1}] </strong> : null}
                    {r.authors} ({r.year}). {r.title}. <em>{pubName}</em>.
                    {r.doi && r.doi !== "-" ? (
                      <a
                        href={r.doi.startsWith("http") ? r.doi : `https://doi.org/${r.doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#0284c7", textDecoration: "none", marginLeft: 4 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        https://doi.org/{r.doi.replace(/^https?:\/\/doi\.org\//, "")}
                      </a>
                    ) : null}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </A4Sheet>
  );
}
