import React from "react";
import { GraduationCap } from "lucide-react";
import { A4Sheet } from "../A4Sheet";
import { CoverData, PdfPageSelection } from "../../types";

interface CoverSheetProps {
  coverData: CoverData;
  profile?: any;
  project?: any;
  isEditMode: boolean;
  triggerAutoSave: () => void;
  pdfPageSelection: PdfPageSelection;
  pageNumberPos: string;
  marginPreset: "4333" | "4433";
  logoLoadError: boolean;
  setLogoLoadError: (err: boolean) => void;
}

export function CoverSheet({
  coverData,
  profile,
  project,
  isEditMode,
  triggerAutoSave,
  pdfPageSelection,
  pageNumberPos,
  marginPreset,
  logoLoadError,
  setLogoLoadError,
}: CoverSheetProps) {
  const getFullImageUrl = (url?: string | null) => {
    if (!url) return null;
    if (url.startsWith("http") || url.startsWith("blob:") || url.startsWith("data:")) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  return (
    <A4Sheet
      sheetId="sheet_cover"
      isIncludedInPrint={pdfPageSelection.cover}
      pageNumber={null}
      pageNumberPos={pageNumberPos}
      marginPreset={marginPreset}
    >
      <div
        id="section_cover"
        contentEditable={isEditMode}
        suppressContentEditableWarning
        onBlur={triggerAutoSave}
        style={{
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: "220mm",
          outline: "none",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "14pt",
              fontWeight: 700,
              textTransform: "uppercase",
              marginBottom: 24,
              lineHeight: 1.4,
            }}
          >
            {coverData.title}
          </div>
          <div
            style={{
              fontSize: "12pt",
              fontWeight: 700,
              color: "#000000",
              letterSpacing: "0.02em",
            }}
          >
            PROPOSAL PENELITIAN TUGAS AKHIR
          </div>
          <div style={{ fontSize: "11pt", color: "#475569", marginTop: 2 }}>
            (Usulan Penelitian Sarjana)
          </div>
        </div>

        <div
          style={{
            margin: "24px 0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {profile?.logoUrl || project?.logoUrl ? (
            <img
              src={
                getFullImageUrl(profile?.logoUrl || project?.logoUrl) || "/Tel-U-Logo.png"
              }
              alt="Logo Resmi Kampus"
              style={{
                maxWidth: 130,
                maxHeight: 130,
                objectFit: "contain",
                marginBottom: 6,
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
                setLogoLoadError(true);
              }}
            />
          ) : (
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: 12,
                background: "#F8FAFC",
                border: "1.5px solid #CBD5E1",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "#475569",
                padding: 8,
                textAlign: "center",
              }}
            >
              <GraduationCap size={36} color="#4338CA" />
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  marginTop: 4,
                  color: "#334155",
                }}
              >
                {coverData.universitas || "Logo Kampus"}
              </span>
            </div>
          )}
        </div>

        <div>
          <div style={{ fontSize: "12pt", marginBottom: 4 }}>Disusun Oleh:</div>
          <div style={{ fontSize: "13pt", fontWeight: 700, letterSpacing: "0.03em" }}>
            {(coverData.author || profile?.namaLengkap || project?.nama || "").toUpperCase() ||
              "(NAMA MAHASISWA)"}
          </div>
          <div style={{ fontSize: "12pt", fontWeight: 700 }}>
            NIM: {coverData.nim || profile?.nim || "(NIM)"}
          </div>
        </div>

        <div style={{ marginTop: 32 }}>
          {coverData.prodi || profile?.programStudi || project?.prodi ? (
            <div style={{ fontSize: "12pt", fontWeight: 700 }}>
              PROGRAM STUDI SARJANA{" "}
              {(coverData.prodi || profile?.programStudi || project?.prodi || "").toUpperCase()}
            </div>
          ) : null}
          {coverData.fakultas || profile?.fakultas ? (
            <div style={{ fontSize: "12pt", fontWeight: 700 }}>
              {(coverData.fakultas || profile?.fakultas || "").toUpperCase()}
            </div>
          ) : null}
          {coverData.universitas || profile?.universitas ? (
            <div style={{ fontSize: "12pt", fontWeight: 700 }}>
              {(coverData.universitas || profile?.universitas || "").toUpperCase()}
            </div>
          ) : null}
          <div style={{ fontSize: "12pt", fontWeight: 700, marginTop: 4 }}>
            {(coverData.kota || profile?.kota || "BANDUNG").toUpperCase()}{" "}
            {coverData.year || `${new Date().getFullYear()}`}
          </div>
        </div>
      </div>
    </A4Sheet>
  );
}
