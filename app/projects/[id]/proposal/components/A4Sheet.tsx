import React from "react";

interface A4SheetProps {
  pageNumber?: string | null;
  pageNumberPos: string;
  marginPreset: "4333" | "4433";
  sheetId?: string;
  isIncludedInPrint?: boolean;
  children: React.ReactNode;
}

export function A4Sheet({
  pageNumber,
  pageNumberPos,
  marginPreset,
  sheetId,
  isIncludedInPrint = true,
  children,
}: A4SheetProps) {
  return (
    <div
      id={sheetId}
      className={`a4-print-sheet ${marginPreset === "4433" ? "a4-print-sheet-4433" : ""} ${
        !isIncludedInPrint ? "sheet-hidden-for-print" : ""
      }`}
      style={{
        width: "210mm",
        minHeight: "297mm",
        height: "auto",
        overflow: "visible",
        background: "#ffffff",
        border: "none",
        borderRadius: 0,
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.12), 0 2px 8px rgba(0, 0, 0, 0.05)",
        padding: marginPreset === "4333" ? "3cm 3cm 3cm 4cm" : "4cm 3cm 3cm 4cm",
        color: "#000000",
        lineHeight: 1.8,
        fontSize: "12pt",
        fontFamily: '"Times New Roman", Times, "Latin Modern Roman", Georgia, serif',
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box",
        marginBottom: 32,
      }}
    >
      {/* Top Page Number */}
      {pageNumberPos.startsWith("top") && pageNumber && (
        <div
          className="print-page-number"
          style={{
            display: "flex",
            justifyContent:
              pageNumberPos === "top-right"
                ? "flex-end"
                : pageNumberPos === "top-center"
                ? "center"
                : "flex-start",
            fontSize: "12pt",
            fontWeight: 700,
            fontFamily: '"Times New Roman", Times, serif',
            color: "#000000",
            marginBottom: 16,
            paddingBottom: 2,
          }}
        >
          <span>{pageNumber}</span>
        </div>
      )}

      <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "auto", overflow: "visible" }}>
        {children}
      </div>

      {/* Bottom Page Number */}
      {pageNumberPos.startsWith("bottom") && pageNumber && (
        <div
          className="print-page-number"
          style={{
            display: "flex",
            justifyContent:
              pageNumberPos === "bottom-right"
                ? "flex-end"
                : pageNumberPos === "bottom-center"
                ? "center"
                : "flex-start",
            fontSize: "12pt",
            fontWeight: 700,
            fontFamily: '"Times New Roman", Times, serif',
            color: "#000000",
            marginTop: 16,
            paddingTop: 6,
          }}
        >
          <span>{pageNumber}</span>
        </div>
      )}
    </div>
  );
}
