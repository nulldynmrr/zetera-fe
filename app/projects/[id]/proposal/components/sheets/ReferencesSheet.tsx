import React from "react";
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
}: ReferencesSheetProps) {
  const isNumbered = citationStyle === "IEEE" || citationStyle === "VANCOUVER";

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

              return (
                <p
                  key={r.id || idx}
                  id={`ref-${isNumbered ? r.originalIndex : idx + 1}`}
                  onClick={(e) => handleJumpToCitationInText(r.originalIndex, r.authors, r.doi, e)}
                  style={{
                    textIndent: "-1.27cm",
                    paddingLeft: "1.27cm",
                    margin: 0,
                    lineHeight: 1.8,
                    scrollMarginTop: 80,
                    cursor: "pointer",
                    borderRadius: 4,
                    paddingTop: 3,
                    paddingBottom: 3,
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
              );
            })
          )}
        </div>
      </div>
    </A4Sheet>
  );
}
