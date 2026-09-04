import React from "react";
import { A4Sheet } from "../A4Sheet";
import { CustomSubChapterItem, PdfPageSelection, ReferenceItem } from "../../types";

interface Chapter2SheetProps {
  proposalData: any;
  references: ReferenceItem[];
  customSubChapters: CustomSubChapterItem[];
  isEditMode: boolean;
  triggerAutoSave: () => void;
  pdfPageSelection: PdfPageSelection;
  pageNumberPos: string;
  marginPreset: "4333" | "4433";
  renderAcademicParagraphs: (rawText?: string, placeholder?: string) => React.ReactNode;
}

export function Chapter2Sheet({
  proposalData,
  references,
  customSubChapters,
  isEditMode,
  triggerAutoSave,
  pdfPageSelection,
  pageNumberPos,
  marginPreset,
  renderAcademicParagraphs,
}: Chapter2SheetProps) {
  const bab2Subs = customSubChapters.filter((s) => s.chapter === "bab2" && !s.hidden);

  return (
    <>
      {/* ── PAGE: BAB II TINJAUAN PUSTAKA & MATRIKS (HALAMAN 1) ── */}
      <A4Sheet
        sheetId="sheet_bab2_p1"
        isIncludedInPrint={pdfPageSelection.bab2}
        pageNumber="3"
        pageNumberPos={pageNumberPos}
        marginPreset={marginPreset}
      >
        <div
          id="section_bab2"
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
            BAB II<br />
            TINJAUAN PUSTAKA & KERANGKA PEMIKIRAN
          </div>

          <div id="sub_2_1" style={{ fontWeight: 700, marginBottom: 8 }}>
            2.1 Landasan Teori & Variabel Riset
          </div>
          {renderAcademicParagraphs(
            proposalData?.bab2?.landasanTeori ||
              "User Experience didefinisikan sebagai konstruk multidimensi yang mencakup acceptability, usability, usefulness, dan integration menurut Malik et al. [4]. Pengukuran dilakukan melalui skala Likert yang menghasilkan data numerik untuk analisis statistik."
          )}

          <div id="section_matrix" style={{ marginTop: 14, marginBottom: 14 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>
              2.2 Matriks Penelitian Terdahulu (State of the Art)
            </div>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "9pt",
                margin: "8px 0",
              }}
            >
              <thead>
                <tr style={{ background: "#F8FAFC" }}>
                  <th
                    style={{
                      border: "1px solid #334155",
                      padding: "5px 6px",
                      width: "5%",
                      textAlign: "center",
                      fontWeight: 700,
                    }}
                  >
                    No
                  </th>
                  <th
                    style={{
                      border: "1px solid #334155",
                      padding: "5px 6px",
                      width: "22%",
                      textAlign: "center",
                      fontWeight: 700,
                    }}
                  >
                    Penulis & Tahun
                  </th>
                  <th
                    style={{
                      border: "1px solid #334155",
                      padding: "5px 6px",
                      width: "30%",
                      textAlign: "center",
                      fontWeight: 700,
                    }}
                  >
                    Judul Artikel & Publikasi
                  </th>
                  <th
                    style={{
                      border: "1px solid #334155",
                      padding: "5px 6px",
                      width: "20%",
                      textAlign: "center",
                      fontWeight: 700,
                    }}
                  >
                    Variabel & Metode
                  </th>
                  <th
                    style={{
                      border: "1px solid #334155",
                      padding: "5px 6px",
                      width: "23%",
                      textAlign: "center",
                      fontWeight: 700,
                    }}
                  >
                    Temuan Utama / Bukti
                  </th>
                </tr>
              </thead>
              <tbody>
                {references.slice(0, 5).map((ref, idx) => {
                  const pubName =
                    (ref.publication || "")
                      .replace(/\s*\(OpenAlex\)/gi, "")
                      .replace(/OpenAlex/gi, "Jurnal Ilmiah Terindeks")
                      .trim() ||
                    (ref.doi ? "Jurnal Ilmiah Nasional Terakreditasi" : "Publikasi Ilmiah Akademik");

                  return (
                    <tr key={ref.id}>
                      <td
                        style={{
                          border: "1px solid #64748B",
                          padding: "5px 6px",
                          textAlign: "center",
                        }}
                      >
                        {idx + 1}
                      </td>
                      <td style={{ border: "1px solid #64748B", padding: "5px 6px" }}>
                        {ref.authors} ({ref.year})
                      </td>
                      <td style={{ border: "1px solid #64748B", padding: "5px 6px" }}>
                        {ref.title}
                        <br />
                        <em>[{pubName}]</em>
                      </td>
                      <td style={{ border: "1px solid #64748B", padding: "5px 6px" }}>
                        {ref.mappedVariables || "Variabel Riset"}
                        <br />({ref.methodology || "Studi Empiris"})
                      </td>
                      <td style={{ border: "1px solid #64748B", padding: "5px 6px" }}>
                        {ref.keyFindings || "Temuan empiris relevan"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </A4Sheet>

      {/* ── PAGE: BAB II KERANGKA KONSEPTUAL & HIPOTESIS (HALAMAN 2) ── */}
      <A4Sheet
        sheetId="sheet_bab2_p2"
        isIncludedInPrint={pdfPageSelection.bab2}
        pageNumber="4"
        pageNumberPos={pageNumberPos}
        marginPreset={marginPreset}
      >
        <div
          id="section_bab2_p2"
          contentEditable={isEditMode}
          suppressContentEditableWarning
          onBlur={triggerAutoSave}
          style={{ textAlign: "justify", outline: "none" }}
        >
          <div id="sub_2_2" style={{ fontWeight: 700, marginBottom: 8, marginTop: 0 }}>
            2.3 Kerangka Konseptual & Diagram Alur
          </div>
          {renderAcademicParagraphs(
            proposalData?.bab2?.kerangkaKonseptual ||
              "Input berupa interaksi mahasiswa Informatika dengan chatbot; proses berupa pengisian kuesioner UX; output berupa skor domain acceptability, usability, usefulness, dan integration yang dianalisis secara deskriptif dan inferensial."
          )}

          <div id="sub_2_3" style={{ fontWeight: 700, marginBottom: 8, marginTop: 16 }}>
            2.4 Hipotesis Penelitian
          </div>
          {proposalData?.bab2?.hipotesis && proposalData.bab2.hipotesis.length > 0 ? (
            <div style={{ paddingLeft: "1.27cm", marginBottom: 14, lineHeight: 1.8 }}>
              {proposalData.bab2.hipotesis.map((h: string, idx: number) => (
                <div
                  key={idx}
                  style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 4 }}
                >
                  <span style={{ minWidth: 28, fontWeight: 600 }}>
                    {h.match(/^H\d+:/) ? "" : `${idx + 1}.`}
                  </span>
                  <span style={{ flex: 1, textAlign: "justify" }}>{h}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ paddingLeft: "1.27cm", marginBottom: 14, lineHeight: 1.8 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
                <span style={{ minWidth: 28, fontWeight: 600 }}>H1:</span>
                <span style={{ flex: 1, textAlign: "justify" }}>
                  Terdapat perbedaan signifikan pada penilaian domain usability dibandingkan domain
                  integration.
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
                <span style={{ minWidth: 28, fontWeight: 600 }}>H0:</span>
                <span style={{ flex: 1, textAlign: "justify" }}>
                  Tidak terdapat perbedaan signifikan pada penilaian antar domain pengalaman pengguna.
                </span>
              </div>
            </div>
          )}

          {/* Custom sub-chapters for BAB 2 */}
          {bab2Subs.map((s) => (
            <div key={s.id} id={s.id} style={{ marginTop: 14 }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>{s.title}</div>
              {renderAcademicParagraphs(s.content)}
            </div>
          ))}
        </div>
      </A4Sheet>
    </>
  );
}
