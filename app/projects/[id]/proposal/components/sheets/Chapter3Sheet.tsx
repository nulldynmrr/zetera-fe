import React from "react";
import { A4Sheet } from "../A4Sheet";
import { CustomSubChapterItem, PdfPageSelection } from "../../types";

interface Chapter3SheetProps {
  proposalData: any;
  customSubChapters: CustomSubChapterItem[];
  isEditMode: boolean;
  triggerAutoSave: () => void;
  pdfPageSelection: PdfPageSelection;
  pageNumberPos: string;
  marginPreset: "4333" | "4433";
  renderAcademicParagraphs: (rawText?: string, placeholder?: string) => React.ReactNode;
}

export function Chapter3Sheet({
  proposalData,
  customSubChapters,
  isEditMode,
  triggerAutoSave,
  pdfPageSelection,
  pageNumberPos,
  marginPreset,
  renderAcademicParagraphs,
}: Chapter3SheetProps) {
  const bab3Subs = customSubChapters.filter((s) => s.chapter === "bab3" && !s.hidden);

  return (
    <A4Sheet
      sheetId="sheet_bab3"
      isIncludedInPrint={pdfPageSelection.bab3}
      pageNumber="5"
      pageNumberPos={pageNumberPos}
      marginPreset={marginPreset}
    >
      <div
        id="section_bab3"
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
          BAB III<br />
          METODOLOGI PENELITIAN
        </div>

        <div id="sub_3_1" style={{ fontWeight: 700, marginBottom: 6 }}>
          3.1 Desain & Jenis Penelitian
        </div>
        {renderAcademicParagraphs(
          proposalData?.bab3?.desainPenelitian ||
            "Penelitian ini menggunakan pendekatan kuantitatif dengan desain studi deskriptif eksploratif untuk mengukur domain UX pada chatbot kesehatan mental."
        )}

        <div id="sub_3_2" style={{ fontWeight: 700, marginBottom: 6, marginTop: 10 }}>
          3.2 Subjek dan Objek Penelitian
        </div>
        {renderAcademicParagraphs(
          proposalData?.bab3?.populasiSampel ||
            "Populasi penelitian adalah mahasiswa aktif program studi S1 Informatika dengan teknik purposive sampling."
        )}

        <div id="sub_3_3" style={{ fontWeight: 700, marginBottom: 6, marginTop: 10 }}>
          3.3 Teknik Pengumpulan Data
        </div>
        {renderAcademicParagraphs(
          proposalData?.bab3?.teknikPengumpulanData ||
            "Pengumpulan data dilakukan menggunakan kuesioner terstruktur dengan skala Likert 5 poin (1 = Sangat Tidak Setuju, 5 = Sangat Setuju)."
        )}

        <div id="sub_3_4" style={{ fontWeight: 700, marginBottom: 6, marginTop: 10 }}>
          3.4 Teknik Analisis Data
        </div>
        {renderAcademicParagraphs(
          proposalData?.bab3?.teknikAnalisisData ||
            "Data dianalisis menggunakan statistik deskriptif (mean, standard deviation) dan uji komparatif non-parametrik/parametrik untuk menguji signifikansi skor antar domain."
        )}

        {/* Custom sub-chapters for BAB 3 */}
        {bab3Subs.map((s) => (
          <div key={s.id} id={s.id} style={{ marginTop: 10 }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{s.title}</div>
            {renderAcademicParagraphs(s.content)}
          </div>
        ))}
      </div>
    </A4Sheet>
  );
}
