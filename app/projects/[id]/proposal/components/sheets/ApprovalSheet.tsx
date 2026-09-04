import React from "react";
import { A4Sheet } from "../A4Sheet";
import { CoverData, ApprovalData, PdfPageSelection } from "../../types";

interface ApprovalSheetProps {
  coverData: CoverData;
  approvalData: ApprovalData;
  profile?: any;
  project?: any;
  isEditMode: boolean;
  triggerAutoSave: () => void;
  pdfPageSelection: PdfPageSelection;
  pageNumberPos: string;
  marginPreset: "4333" | "4433";
}

export function ApprovalSheet({
  coverData,
  approvalData,
  profile,
  project,
  isEditMode,
  triggerAutoSave,
  pdfPageSelection,
  pageNumberPos,
  marginPreset,
}: ApprovalSheetProps) {
  return (
    <A4Sheet
      sheetId="sheet_approval"
      isIncludedInPrint={pdfPageSelection.approval}
      pageNumber="i"
      pageNumberPos={pageNumberPos}
      marginPreset={marginPreset}
    >
      <div
        id="section_approval"
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
            marginBottom: 20,
          }}
        >
          LEMBAR PERSETUJUAN PROPOSAL TUGAS AKHIR
        </div>
        <div
          style={{
            textAlign: "center",
            fontSize: "12pt",
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          {coverData.title || project?.title || "(Judul Proposal Tugas Akhir)"}
        </div>
        <div
          style={{
            textAlign: "center",
            fontSize: "11pt",
            fontStyle: "italic",
            marginBottom: 24,
          }}
        >
          {approvalData.titleEng ||
            `A Research Proposal on ${coverData.title || project?.title || "Research Topic"}`}
        </div>

        <p style={{ textIndent: "1.27cm", lineHeight: 1.8 }}>
          Proposal Tugas Akhir ini diajukan sebagai usulan resmi pembuatan Tugas Akhir pada Program Studi Sarjana{" "}
          {coverData.prodi || profile?.programStudi || project?.prodi || "........................"},{" "}
          Fakultas {coverData.fakultas || profile?.fakultas || "........................"},{" "}
          {coverData.universitas || profile?.universitas || "........................"}.
        </p>

        <div style={{ marginTop: 24, textAlign: "center", fontWeight: 600 }}>
          {approvalData.kota || coverData.kota || profile?.kota || "Bandung"},{" "}
          {approvalData.dateDay || "2"} {approvalData.dateMonth || "Oktober"}{" "}
          {approvalData.dateYear || "2026"}
        </div>

        <div
          style={{
            marginTop: 36,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            textAlign: "center",
            gap: 20,
          }}
        >
          <div>
            <div>Calon Pembimbing 1,</div>
            <div style={{ height: 60 }} />
            <div style={{ fontWeight: 700 }}>
              {approvalData.pembimbing1 || "(..................................................)"}
            </div>
            <div>
              {approvalData.nipPembimbing1
                ? `NIP: ${approvalData.nipPembimbing1}`
                : "NIP: ...................................."}
            </div>
          </div>
          <div>
            <div>Calon Pembimbing 2,</div>
            <div style={{ height: 60 }} />
            <div style={{ fontWeight: 700 }}>
              {approvalData.pembimbing2 || "(..................................................)"}
            </div>
            <div>
              {approvalData.nipPembimbing2
                ? `NIP: ${approvalData.nipPembimbing2}`
                : "NIP: ...................................."}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 40, textAlign: "center" }}>
          <div>Mengetahui,</div>
          <div>
            Ketua Program Studi Sarjana{" "}
            {coverData.prodi || profile?.programStudi || project?.prodi || "........................"}
          </div>
          <div style={{ height: 60 }} />
          <div style={{ fontWeight: 700 }}>
            {approvalData.kaprodi || "(..................................................)"}
          </div>
          <div>
            {approvalData.nipKaprodi
              ? `NIP: ${approvalData.nipKaprodi}`
              : "NIP: ...................................."}
          </div>
        </div>
      </div>
    </A4Sheet>
  );
}
