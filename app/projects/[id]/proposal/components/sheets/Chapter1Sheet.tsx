import React from "react";
import { A4Sheet } from "../A4Sheet";
import { CustomSubChapterItem, PdfPageSelection } from "../../types";

interface Chapter1SheetProps {
  proposalData: any;
  customSubChapters: CustomSubChapterItem[];
  isEditMode: boolean;
  triggerAutoSave: () => void;
  pdfPageSelection: PdfPageSelection;
  pageNumberPos: string;
  marginPreset: "4333" | "4433";
  paragraphStyle: "indent" | "block";
  renderAcademicParagraphs: (rawText?: string, placeholder?: string) => React.ReactNode;
  latarPage1: string;
  latarPage2: string;
  latarPage3: string;
}

export function Chapter1Sheet({
  proposalData,
  customSubChapters,
  isEditMode,
  triggerAutoSave,
  pdfPageSelection,
  pageNumberPos,
  marginPreset,
  paragraphStyle,
  renderAcademicParagraphs,
  latarPage1,
  latarPage2,
  latarPage3,
}: Chapter1SheetProps) {
  const bab1Subs = customSubChapters.filter((s) => s.chapter === "bab1" && !s.hidden);

  return (
    <>
      {/* ── PAGE 4: BAB I PENDAHULUAN (HALAMAN 1) ── */}
      <A4Sheet
        sheetId="sheet_bab1_p1"
        isIncludedInPrint={pdfPageSelection.bab1}
        pageNumber="1"
        pageNumberPos={pageNumberPos}
        marginPreset={marginPreset}
      >
        <div
          id="section_bab1"
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
            BAB I<br />
            PENDAHULUAN
          </div>

          <div id="sub_1_1" style={{ fontWeight: 700, marginBottom: 8 }}>
            1.1 Latar Belakang Masalah
          </div>
          {renderAcademicParagraphs(latarPage1 || proposalData?.bab1?.latarBelakang)}
        </div>
      </A4Sheet>

      {/* ── PAGE 5: BAB I (HALAMAN 2: LANJUTAN LATAR BELAKANG JIKA PANJANG) ── */}
      {latarPage2 ? (
        <A4Sheet
          sheetId="sheet_bab1_p2"
          isIncludedInPrint={pdfPageSelection.bab1}
          pageNumber="2"
          pageNumberPos={pageNumberPos}
          marginPreset={marginPreset}
        >
          <div
            id="section_bab1_p2"
            contentEditable={isEditMode}
            suppressContentEditableWarning
            onBlur={triggerAutoSave}
            style={{ textAlign: "justify", outline: "none" }}
          >
            <div style={{ fontWeight: 700, marginBottom: 8, color: "#64748B", fontSize: "10.5pt" }}>
              1.1 Latar Belakang Masalah (Lanjutan)
            </div>
            {renderAcademicParagraphs(latarPage2)}
          </div>
        </A4Sheet>
      ) : null}

      {/* ── PAGE 5b: BAB I (HALAMAN 3: LANJUTAN LATAR BELAKANG JIKA SANGAT PANJANG) ── */}
      {latarPage3 ? (
        <A4Sheet
          sheetId="sheet_bab1_p3"
          isIncludedInPrint={pdfPageSelection.bab1}
          pageNumber="2b"
          pageNumberPos={pageNumberPos}
          marginPreset={marginPreset}
        >
          <div
            id="section_bab1_p3"
            contentEditable={isEditMode}
            suppressContentEditableWarning
            onBlur={triggerAutoSave}
            style={{ textAlign: "justify", outline: "none" }}
          >
            <div style={{ fontWeight: 700, marginBottom: 8, color: "#64748B", fontSize: "10.5pt" }}>
              1.1 Latar Belakang Masalah (Lanjutan)
            </div>
            {renderAcademicParagraphs(latarPage3)}
          </div>
        </A4Sheet>
      ) : null}

      {/* ── HALAMAN SUB-BAB INTI BAB I: 1.2 s/d 1.5 ── */}
      <A4Sheet
        sheetId="sheet_bab1_subs"
        isIncludedInPrint={pdfPageSelection.bab1}
        pageNumber={latarPage3 ? "3" : latarPage2 ? "2" : "2"}
        pageNumberPos={pageNumberPos}
        marginPreset={marginPreset}
      >
        <div
          id="section_bab1_subs"
          contentEditable={isEditMode}
          suppressContentEditableWarning
          onBlur={triggerAutoSave}
          style={{ textAlign: "justify", outline: "none" }}
        >
          <div id="sub_1_2" style={{ fontWeight: 700, marginBottom: 6, marginTop: 0 }}>
            1.2 Identifikasi Masalah
          </div>
          {proposalData?.bab1?.identifikasiMasalah &&
          proposalData.bab1.identifikasiMasalah.length > 0 ? (
            <div style={{ paddingLeft: "1.27cm", marginBottom: 10, lineHeight: 1.75 }}>
              {proposalData.bab1.identifikasiMasalah.map((im: string, idx: number) => (
                <div
                  key={idx}
                  style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 3 }}
                >
                  <span style={{ minWidth: 18 }}>{idx + 1}.</span>
                  <span style={{ flex: 1, textAlign: "justify" }}>{im.replace(/^\d+\.\s*/, "")}</span>
                </div>
              ))}
            </div>
          ) : null}

          <div id="sub_1_3" style={{ fontWeight: 700, marginBottom: 6, marginTop: 10 }}>
            1.3 Rumusan Masalah
          </div>
          {proposalData?.bab1?.rumusanMasalah && proposalData.bab1.rumusanMasalah.length > 0 ? (
            <div style={{ paddingLeft: "1.27cm", marginBottom: 10, lineHeight: 1.75 }}>
              {proposalData.bab1.rumusanMasalah.map((r: string, idx: number) => (
                <div
                  key={idx}
                  style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 3 }}
                >
                  <span style={{ minWidth: 18 }}>{idx + 1}.</span>
                  <span style={{ flex: 1, textAlign: "justify" }}>{r.replace(/^\d+\.\s*/, "")}</span>
                </div>
              ))}
            </div>
          ) : null}

          <div id="sub_1_4" style={{ fontWeight: 700, marginBottom: 6, marginTop: 10 }}>
            1.4 Tujuan Penelitian
          </div>
          {proposalData?.bab1?.tujuanPenelitian && proposalData.bab1.tujuanPenelitian.length > 0 ? (
            <div style={{ paddingLeft: "1.27cm", marginBottom: 10, lineHeight: 1.75 }}>
              {proposalData.bab1.tujuanPenelitian.map((t: string, idx: number) => (
                <div
                  key={idx}
                  style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 3 }}
                >
                  <span style={{ minWidth: 18 }}>{idx + 1}.</span>
                  <span style={{ flex: 1, textAlign: "justify" }}>{t.replace(/^\d+\.\s*/, "")}</span>
                </div>
              ))}
            </div>
          ) : null}

          <div id="sub_1_5" style={{ fontWeight: 700, marginBottom: 6, marginTop: 10 }}>
            1.5 Manfaat Penelitian
          </div>
          <p
            style={{
              textIndent: paragraphStyle === "indent" ? "1.27cm" : "0",
              marginBottom: 3,
              lineHeight: 1.75,
            }}
          >
            <strong>1.5.1 Manfaat Teoretis:</strong>{" "}
            {proposalData?.bab1?.manfaatPenelitian?.teoretis ||
              "Penelitian ini memberikan kontribusi empiris kuantitatif terhadap literatur pengalaman pengguna chatbot kesehatan mental pada populasi mahasiswa teknik informatika di Indonesia."}
          </p>
          <p
            style={{
              textIndent: paragraphStyle === "indent" ? "1.27cm" : "0",
              marginBottom: 10,
              lineHeight: 1.75,
            }}
          >
            <strong>1.5.2 Manfaat Praktis:</strong>{" "}
            {proposalData?.bab1?.manfaatPenelitian?.praktis ||
              "Hasil penelitian dapat menjadi masukan bagi pengembang chatbot untuk meningkatkan kualitas interaksi, privasi, dan respons terhadap kebutuhan mahasiswa Informatika."}
          </p>

          {/* Custom sub-chapters for BAB 1 */}
          {bab1Subs.map((s) => (
            <div key={s.id} id={s.id} style={{ marginTop: 10 }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{s.title}</div>
              {renderAcademicParagraphs(s.content)}
            </div>
          ))}
        </div>
      </A4Sheet>
    </>
  );
}
