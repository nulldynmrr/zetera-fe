import React from "react";
import { A4Sheet } from "../A4Sheet";
import { AppendixData, PdfPageSelection } from "../../types";

interface AppendixSheetProps {
  appendixData: AppendixData;
  isEditMode: boolean;
  triggerAutoSave: () => void;
  pdfPageSelection: PdfPageSelection;
  pageNumberPos: string;
  marginPreset: "4333" | "4433";
}

export function AppendixSheet({
  appendixData,
  isEditMode,
  triggerAutoSave,
  pdfPageSelection,
  pageNumberPos,
  marginPreset,
}: AppendixSheetProps) {
  if (!appendixData) return null;

  return (
    <A4Sheet
      sheetId="sheet_appendix"
      isIncludedInPrint={pdfPageSelection.appendix}
      pageNumber="5"
      pageNumberPos={pageNumberPos}
      marginPreset={marginPreset}
    >
      <div
        id="section_appendix"
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
            marginBottom: 24,
          }}
        >
          LAMPIRAN
        </div>
        <div style={{ fontWeight: 700, marginBottom: 10, fontSize: "12pt" }}>
          {appendixData.title}
        </div>
        <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>{appendixData.content}</div>
      </div>
    </A4Sheet>
  );
}
