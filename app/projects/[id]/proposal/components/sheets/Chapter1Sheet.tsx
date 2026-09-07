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
  customBabTitle?: string;
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
  customBabTitle,
}: Chapter1SheetProps) {
  const bab1Subs = customSubChapters.filter((s) => s.chapter === "bab1" && !s.hidden);

  interface ParsedSubChapter {
    intro: string;
    items: string[];
  }

  const parseIntroAndList = (val: any): ParsedSubChapter => {
    if (!val) return { intro: "", items: [] };

    if (typeof val === "object" && !Array.isArray(val)) {
      if (val.pengantar || val.intro || val.items) {
        return {
          intro: (val.pengantar || val.intro || "").trim(),
          items: Array.isArray(val.items)
            ? val.items.map((x: any) => String(x).replace(/^(\d+[\.\)]|[-*•])\s*/, "").trim()).filter(Boolean)
            : [],
        };
      }
    }

    const rawLines: string[] = [];
    if (Array.isArray(val)) {
      for (const item of val) {
        if (typeof item === "string") {
          rawLines.push(...item.split(/\n+/).map((s) => s.trim()).filter(Boolean));
        }
      }
    } else if (typeof val === "string") {
      rawLines.push(...val.split(/\n+/).map((s) => s.trim()).filter(Boolean));
    }

    if (rawLines.length === 0) return { intro: "", items: [] };

    const introLines: string[] = [];
    const items: string[] = [];
    let foundFirstNumbered = false;

    for (const line of rawLines) {
      const isNumbered = /^(\d+[\.\)]|[-*•])\s+/.test(line);
      if (isNumbered) {
        foundFirstNumbered = true;
        items.push(line.replace(/^(\d+[\.\)]|[-*•])\s*/, "").trim());
      } else if (!foundFirstNumbered) {
        introLines.push(line);
      } else {
        if (items.length > 0) {
          items[items.length - 1] += " " + line;
        } else {
          items.push(line);
        }
      }
    }

    if (items.length === 0 && introLines.length > 1) {
      const first = introLines[0];
      if (first.endsWith(":") || first.toLowerCase().includes("sebagai berikut") || first.toLowerCase().includes("yaitu")) {
        return {
          intro: first,
          items: introLines.slice(1).map((s) => s.replace(/^(\d+[\.\)]|[-*•])\s*/, "").trim()),
        };
      }
      return { intro: "", items: introLines };
    }

    return {
      intro: introLines.join("\n"),
      items,
    };
  };

  const identifikasiData = parseIntroAndList(proposalData?.bab1?.identifikasiMasalah);
  const rumusanData = parseIntroAndList(proposalData?.bab1?.rumusanMasalah);
  const batasanData = parseIntroAndList(proposalData?.bab1?.batasanMasalah);
  const tujuanData = parseIntroAndList(proposalData?.bab1?.tujuanPenelitian);
  const hasBatasan = batasanData.items.length > 0 || !!batasanData.intro;

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
            {customBabTitle || "PENDAHULUAN"}
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

      {/* ── HALAMAN SUB-BAB INTI BAB I: 1.2 s/d 1.6 ── */}
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
          {identifikasiData.intro ? (
            <p
              style={{
                textIndent: paragraphStyle === "indent" ? "1.27cm" : "0",
                marginBottom: 6,
                lineHeight: 1.75,
                whiteSpace: "pre-line",
              }}
            >
              {identifikasiData.intro}
            </p>
          ) : null}
          {identifikasiData.items.length > 0 ? (
            <div style={{ paddingLeft: "1.27cm", marginBottom: 10, lineHeight: 1.75 }}>
              {identifikasiData.items.map((im: string, idx: number) => (
                <div
                  key={idx}
                  style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 4 }}
                >
                  <span style={{ minWidth: 18 }}>{idx + 1}.</span>
                  <span style={{ flex: 1, textAlign: "justify" }}>{im}</span>
                </div>
              ))}
            </div>
          ) : null}

          <div id="sub_1_3" style={{ fontWeight: 700, marginBottom: 6, marginTop: 10 }}>
            1.3 Rumusan Masalah
          </div>
          {rumusanData.intro ? (
            <p
              style={{
                textIndent: paragraphStyle === "indent" ? "1.27cm" : "0",
                marginBottom: 6,
                lineHeight: 1.75,
                whiteSpace: "pre-line",
              }}
            >
              {rumusanData.intro}
            </p>
          ) : null}
          {rumusanData.items.length > 0 ? (
            <div style={{ paddingLeft: "1.27cm", marginBottom: 10, lineHeight: 1.75 }}>
              {rumusanData.items.map((r: string, idx: number) => (
                <div
                  key={idx}
                  style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 4 }}
                >
                  <span style={{ minWidth: 18 }}>{idx + 1}.</span>
                  <span style={{ flex: 1, textAlign: "justify" }}>{r}</span>
                </div>
              ))}
            </div>
          ) : null}

          {/* ── 1.4 Batasan Masalah (Jika ada) ── */}
          {hasBatasan ? (
            <>
              <div id="sub_1_4" style={{ fontWeight: 700, marginBottom: 6, marginTop: 10 }}>
                1.4 Batasan Masalah
              </div>
              {batasanData.intro ? (
                <p
                  style={{
                    textIndent: paragraphStyle === "indent" ? "1.27cm" : "0",
                    marginBottom: 6,
                    lineHeight: 1.75,
                    whiteSpace: "pre-line",
                  }}
                >
                  {batasanData.intro}
                </p>
              ) : null}
              {batasanData.items.length > 0 ? (
                <div style={{ paddingLeft: "1.27cm", marginBottom: 10, lineHeight: 1.75 }}>
                  {batasanData.items.map((bm: string, idx: number) => (
                    <div
                      key={idx}
                      style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 4 }}
                    >
                      <span style={{ minWidth: 18 }}>{idx + 1}.</span>
                      <span style={{ flex: 1, textAlign: "justify" }}>{bm}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </>
          ) : null}

          <div
            id={hasBatasan ? "sub_1_5" : "sub_1_4"}
            style={{ fontWeight: 700, marginBottom: 6, marginTop: 10 }}
          >
            {hasBatasan ? "1.5 Tujuan Penelitian" : "1.4 Tujuan Penelitian"}
          </div>
          {tujuanData.intro ? (
            <p
              style={{
                textIndent: paragraphStyle === "indent" ? "1.27cm" : "0",
                marginBottom: 6,
                lineHeight: 1.75,
                whiteSpace: "pre-line",
              }}
            >
              {tujuanData.intro}
            </p>
          ) : null}
          {tujuanData.items.length > 0 ? (
            <div style={{ paddingLeft: "1.27cm", marginBottom: 10, lineHeight: 1.75 }}>
              {tujuanData.items.map((t: string, idx: number) => (
                <div
                  key={idx}
                  style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 4 }}
                >
                  <span style={{ minWidth: 18 }}>{idx + 1}.</span>
                  <span style={{ flex: 1, textAlign: "justify" }}>{t}</span>
                </div>
              ))}
            </div>
          ) : null}

          <div
            id={hasBatasan ? "sub_1_6" : "sub_1_5"}
            style={{ fontWeight: 700, marginBottom: 6, marginTop: 10 }}
          >
            {hasBatasan ? "1.6 Manfaat Penelitian" : "1.5 Manfaat Penelitian"}
          </div>
          <p
            style={{
              textIndent: paragraphStyle === "indent" ? "1.27cm" : "0",
              marginBottom: 3,
              lineHeight: 1.75,
            }}
          >
            <strong>{hasBatasan ? "1.6.1 Manfaat Teoretis:" : "1.5.1 Manfaat Teoretis:"}</strong>{" "}
            {proposalData?.bab1?.manfaatPenelitian?.teoretis ||
              "Penelitian ini memberikan kontribusi empiris terhadap literatur dan pengembangan keilmuan di bidang terkait."}
          </p>
          <p
            style={{
              textIndent: paragraphStyle === "indent" ? "1.27cm" : "0",
              marginBottom: 10,
              lineHeight: 1.75,
            }}
          >
            <strong>{hasBatasan ? "1.6.2 Manfaat Praktis:" : "1.5.2 Manfaat Praktis:"}</strong>{" "}
            {proposalData?.bab1?.manfaatPenelitian?.praktis ||
              "Hasil penelitian dapat menjadi rujukan praktis dan solusi terapan bagi objek penelitian dan pemangku kepentingan."}
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
