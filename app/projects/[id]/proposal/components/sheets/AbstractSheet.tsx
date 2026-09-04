import React from "react";
import { A4Sheet } from "../A4Sheet";
import { AbstractData, PdfPageSelection } from "../../types";

interface AbstractSheetProps {
  abstractData: AbstractData;
  isEditMode: boolean;
  triggerAutoSave: () => void;
  pdfPageSelection: PdfPageSelection;
  pageNumberPos: string;
  marginPreset: "4333" | "4433";
  renderAcademicParagraphs: (rawText?: string, placeholder?: string) => React.ReactNode;
}

export function AbstractSheet({
  abstractData,
  isEditMode,
  triggerAutoSave,
  pdfPageSelection,
  pageNumberPos,
  marginPreset,
  renderAcademicParagraphs,
}: AbstractSheetProps) {
  return (
    <A4Sheet
      sheetId="sheet_abstract"
      isIncludedInPrint={pdfPageSelection.abstract}
      pageNumber="ii"
      pageNumberPos={pageNumberPos}
      marginPreset={marginPreset}
    >
      <div
        id="section_abstract"
        contentEditable={isEditMode}
        suppressContentEditableWarning
        onBlur={triggerAutoSave}
        style={{ textAlign: "justify", outline: "none" }}
      >
        <div
          style={{
            textAlign: "center",
            fontSize: "13pt",
            fontWeight: 700,
            textTransform: "uppercase",
            marginBottom: 14,
          }}
        >
          ABSTRAK
        </div>
        {renderAcademicParagraphs(abstractData.indo)}
        {abstractData.keywordsIndo && (
          <div style={{ marginBottom: 24, marginTop: 4 }}>
            <strong>Kata Kunci:</strong> <em>{abstractData.keywordsIndo}</em>
          </div>
        )}

        <div
          style={{
            textAlign: "center",
            fontSize: "13pt",
            fontWeight: 700,
            textTransform: "uppercase",
            marginBottom: 14,
          }}
        >
          ABSTRACT
        </div>
        <div style={{ fontStyle: "italic" }}>
          {renderAcademicParagraphs(abstractData.eng)}
        </div>
        {abstractData.keywordsEng && (
          <div style={{ marginTop: 4 }}>
            <strong>Keywords:</strong> <em>{abstractData.keywordsEng}</em>
          </div>
        )}
      </div>
    </A4Sheet>
  );
}
