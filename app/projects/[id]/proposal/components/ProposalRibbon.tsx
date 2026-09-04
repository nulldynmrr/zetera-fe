import React from "react";
import Link from "next/link";
import {
  Sparkles,
  Download,
  FileText,
  Printer,
  ChevronDown,
  RefreshCw,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Indent,
  Outdent,
  Eye,
  Edit3,
  SlidersHorizontal,
  FileCode,
  Check,
  Building,
  Quote,
  Zap,
} from "lucide-react";
import { TemplateType } from "../types";

interface ProposalRibbonProps {
  projectId: string;
  projectTitle?: string;
  isEditMode: boolean;
  setIsEditMode: (val: boolean) => void;
  saveDraftStatus: "idle" | "saving" | "saved";
  lastSavedTime: string | null;
  handleSaveDraft: () => void;
  selectedFont: string;
  setSelectedFont: (font: string) => void;
  selectedFontSize: number;
  setSelectedFontSize: (size: number) => void;
  selectedStyle: string;
  setSelectedStyle: (style: string) => void;
  activeAlign: "left" | "center" | "right" | "justify";
  setActiveAlign: (align: "left" | "center" | "right" | "justify") => void;
  paragraphStyle: "indent" | "block";
  setParagraphStyle: (style: "indent" | "block") => void;
  zoomLevel: number;
  setZoomLevel: (zoom: number) => void;
  showOutlineSidebar: boolean;
  setShowOutlineSidebar: (show: boolean) => void;
  showAiAssistant: boolean;
  setShowAiAssistant: (show: boolean) => void;
  showExportMenu: boolean;
  setShowExportMenu: (show: boolean) => void;
  handleDownloadDocx: () => void;
  handleDownloadLatexZip: (template?: TemplateType) => void;
  selectedTemplate: TemplateType;
  setSelectedTemplate: (template: TemplateType) => void;
  setShowPdfExportModal: (show: boolean) => void;
  handleGenerateProposal: () => void;
  generating: boolean;
  setShowPageSetupModal: (show: boolean) => void;
  setShowIdentityModal: (show: boolean) => void;
  setShowCitationPickerModal: (show: boolean) => void;
  handleFixAllTypos: () => void;
  citationStyle: string;
}

export function ProposalRibbon({
  projectId,
  projectTitle,
  isEditMode,
  setIsEditMode,
  saveDraftStatus,
  lastSavedTime,
  handleSaveDraft,
  selectedFont,
  setSelectedFont,
  selectedFontSize,
  setSelectedFontSize,
  selectedStyle,
  setSelectedStyle,
  activeAlign,
  setActiveAlign,
  paragraphStyle,
  setParagraphStyle,
  zoomLevel,
  setZoomLevel,
  showOutlineSidebar,
  setShowOutlineSidebar,
  showAiAssistant,
  setShowAiAssistant,
  showExportMenu,
  setShowExportMenu,
  handleDownloadDocx,
  handleDownloadLatexZip,
  selectedTemplate,
  setSelectedTemplate,
  setShowPdfExportModal,
  handleGenerateProposal,
  generating,
  setShowPageSetupModal,
  setShowIdentityModal,
  setShowCitationPickerModal,
  handleFixAllTypos,
  citationStyle,
}: ProposalRibbonProps) {
  const handleExecFormat = (command: string, value: string | undefined = undefined) => {
    if (typeof document !== "undefined") {
      document.execCommand(command, false, value);
    }
  };

  return (
    <>
      {/* ── TOP NAV STUDIO HEADER ── */}
      <header
        id="studio_top_header"
        className="no-print"
        style={{
          background: "#FFFFFF",
          borderBottom: "1px solid #E2E8F0",
          padding: "10px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 56,
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Link
            href={`/projects/${projectId}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              textDecoration: "none",
              color: "#0F172A",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 7,
                background: "linear-gradient(135deg, #059669 0%, #10B981 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
              }}
            >
              <FileText size={16} />
            </div>
            <span>Zetera Studio</span>
          </Link>

          <span style={{ color: "#CBD5E1" }}>/</span>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#1E293B",
                maxWidth: 340,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {projectTitle || "Proposal Skripsi"}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "#64748B" }}>
              <span>
                {saveDraftStatus === "saving" ? (
                  <span style={{ color: "#D97706" }}>Menyimpan ke Database...</span>
                ) : saveDraftStatus === "saved" ? (
                  <span style={{ color: "#059669" }}>✓ Tersimpan di Database</span>
                ) : (
                  <span>Tersimpan {lastSavedTime || "otomatis"}</span>
                )}
              </span>
              <span>•</span>
              <span style={{ fontWeight: 700, color: "#4F46E5" }}>Sitasi: {citationStyle}</span>
            </div>
          </div>
        </div>

        {/* Action buttons on top right */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            onClick={() => setIsEditMode(!isEditMode)}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              border: "1px solid #CBD5E1",
              background: isEditMode ? "#EEF2FF" : "#F8FAFC",
              color: isEditMode ? "#4338CA" : "#64748B",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {isEditMode ? <Edit3 size={14} /> : <Eye size={14} />}
            <span>{isEditMode ? "Mode Edit" : "Mode Pratinjau"}</span>
          </button>

          {/* Export Dropdown */}
          <div style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setShowExportMenu(!showExportMenu)}
              style={{
                background: "#F8FAFC",
                border: "1px solid #CBD5E1",
                borderRadius: 8,
                padding: "6px 12px",
                fontSize: 12.5,
                fontWeight: 600,
                color: "#334155",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Download size={13} />
              <span>Export</span>
              <ChevronDown size={12} />
            </button>

            {showExportMenu && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "100%",
                  marginTop: 6,
                  width: 200,
                  background: "#FFFFFF",
                  borderRadius: 10,
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 10px 25px rgba(15, 23, 42, 0.15)",
                  zIndex: 50,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  padding: 4,
                }}
              >
                <button
                  type="button"
                  onClick={handleDownloadDocx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 12px",
                    border: "none",
                    background: "transparent",
                    fontSize: 12.5,
                    color: "#334155",
                    cursor: "pointer",
                    textAlign: "left",
                    borderRadius: 6,
                  }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.background = "#F1F5F9")}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.background = "transparent")}
                >
                  <FileText size={14} color="#2563EB" />
                  <span>Microsoft Word (.docx)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadLatexZip(selectedTemplate)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 12px",
                    border: "none",
                    background: "transparent",
                    fontSize: 12.5,
                    color: "#334155",
                    cursor: "pointer",
                    textAlign: "left",
                    borderRadius: 6,
                  }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.background = "#F1F5F9")}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.background = "transparent")}
                >
                  <FileCode size={14} color="#7C3AED" />
                  <span>Overleaf LaTeX (.zip)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowExportMenu(false);
                    setShowPdfExportModal(true);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 12px",
                    border: "none",
                    background: "transparent",
                    fontSize: 12.5,
                    color: "#334155",
                    cursor: "pointer",
                    textAlign: "left",
                    borderRadius: 6,
                  }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.background = "#F1F5F9")}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.background = "transparent")}
                >
                  <Printer size={14} color="#059669" />
                  <span>Cetak / Cetak PDF (A4)</span>
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleGenerateProposal}
            disabled={generating}
            style={{
              background: generating
                ? "#94A3B8"
                : "linear-gradient(135deg, #059669 0%, #10B981 100%)",
              color: "#FFFFFF",
              border: "none",
              borderRadius: 8,
              padding: "7px 14px",
              fontSize: 12.5,
              fontWeight: 700,
              cursor: generating ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "0 2px 8px rgba(5, 150, 105, 0.25)",
            }}
          >
            {generating ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
            <span>{generating ? "Menyusun..." : "Sintesis AI"}</span>
          </button>
        </div>
      </header>

      {/* ── TOP WORD-LIKE FORMATTING RIBBON ── */}
      <div
        id="top_ribbon"
        className="no-print"
        style={{
          background: "#FFFFFF",
          borderBottom: "1px solid #E2E8F0",
          padding: "6px 16px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          overflowX: "auto",
          height: 48,
          position: "sticky",
          top: 56,
          zIndex: 35,
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        }}
      >
        {/* Toggle Left Sidebar */}
        <button
          type="button"
          onClick={() => setShowOutlineSidebar(!showOutlineSidebar)}
          style={{
            padding: "5px 8px",
            borderRadius: 6,
            border: "1px solid #CBD5E1",
            background: showOutlineSidebar ? "#EEEAFE" : "#F8FAFC",
            color: showOutlineSidebar ? "#4338CA" : "#64748B",
            cursor: "pointer",
            fontSize: 11.5,
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
          title="Buka/Tutup Navigasi Outline Bab"
        >
          <SlidersHorizontal size={13} />
          <span>Outline</span>
        </button>

        <div style={{ width: 1, height: 20, background: "#E2E8F0", margin: "0 2px" }} />

        {/* Font Family Selector */}
        <select
          value={selectedFont}
          onChange={(e) => setSelectedFont(e.target.value)}
          style={{
            padding: "4px 8px",
            borderRadius: 6,
            border: "1px solid #CBD5E1",
            fontSize: 12,
            fontWeight: 600,
            background: "#F8FAFC",
            color: "#334155",
          }}
        >
          <option value="Times New Roman">Times New Roman</option>
          <option value="Arial">Arial</option>
          <option value="Calibri">Calibri</option>
          <option value="Georgia">Georgia</option>
        </select>

        {/* Font Size Stepper */}
        <div style={{ display: "flex", alignItems: "center", border: "1px solid #CBD5E1", borderRadius: 6, background: "#F8FAFC" }}>
          <button
            type="button"
            onClick={() => setSelectedFontSize(Math.max(8, selectedFontSize - 1))}
            style={{ border: "none", background: "transparent", padding: "3px 6px", cursor: "pointer", fontSize: 11, fontWeight: 700 }}
          >
            -
          </button>
          <span style={{ padding: "0 4px", fontSize: 12, fontWeight: 700, minWidth: 20, textAlign: "center" }}>
            {selectedFontSize}
          </span>
          <button
            type="button"
            onClick={() => setSelectedFontSize(Math.min(36, selectedFontSize + 1))}
            style={{ border: "none", background: "transparent", padding: "3px 6px", cursor: "pointer", fontSize: 11, fontWeight: 700 }}
          >
            +
          </button>
        </div>

        <div style={{ width: 1, height: 20, background: "#E2E8F0", margin: "0 2px" }} />

        {/* Formatting Buttons */}
        <button
          type="button"
          onClick={() => handleExecFormat("bold")}
          style={{ padding: "5px 7px", borderRadius: 6, border: "none", background: "#F8FAFC", cursor: "pointer", fontWeight: 800 }}
          title="Bold (Ctrl+B)"
        >
          <Bold size={13} />
        </button>
        <button
          type="button"
          onClick={() => handleExecFormat("italic")}
          style={{ padding: "5px 7px", borderRadius: 6, border: "none", background: "#F8FAFC", cursor: "pointer", fontStyle: "italic" }}
          title="Italic (Ctrl+I)"
        >
          <Italic size={13} />
        </button>
        <button
          type="button"
          onClick={() => handleExecFormat("underline")}
          style={{ padding: "5px 7px", borderRadius: 6, border: "none", background: "#F8FAFC", cursor: "pointer" }}
          title="Underline (Ctrl+U)"
        >
          <Underline size={13} />
        </button>

        <div style={{ width: 1, height: 20, background: "#E2E8F0", margin: "0 2px" }} />

        {/* Alignments */}
        <button
          type="button"
          onClick={() => {
            setActiveAlign("left");
            handleExecFormat("justifyLeft");
          }}
          style={{
            padding: "5px 7px",
            borderRadius: 6,
            border: "none",
            background: activeAlign === "left" ? "#EEEAFE" : "#F8FAFC",
            color: activeAlign === "left" ? "#4338CA" : "#334155",
            cursor: "pointer",
          }}
          title="Rata Kiri"
        >
          <AlignLeft size={13} />
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveAlign("center");
            handleExecFormat("justifyCenter");
          }}
          style={{
            padding: "5px 7px",
            borderRadius: 6,
            border: "none",
            background: activeAlign === "center" ? "#EEEAFE" : "#F8FAFC",
            color: activeAlign === "center" ? "#4338CA" : "#334155",
            cursor: "pointer",
          }}
          title="Rata Tengah"
        >
          <AlignCenter size={13} />
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveAlign("right");
            handleExecFormat("justifyRight");
          }}
          style={{
            padding: "5px 7px",
            borderRadius: 6,
            border: "none",
            background: activeAlign === "right" ? "#EEEAFE" : "#F8FAFC",
            color: activeAlign === "right" ? "#4338CA" : "#334155",
            cursor: "pointer",
          }}
          title="Rata Kanan"
        >
          <AlignRight size={13} />
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveAlign("justify");
            handleExecFormat("justifyFull");
          }}
          style={{
            padding: "5px 7px",
            borderRadius: 6,
            border: "none",
            background: activeAlign === "justify" ? "#EEEAFE" : "#F8FAFC",
            color: activeAlign === "justify" ? "#4338CA" : "#334155",
            cursor: "pointer",
          }}
          title="Rata Kiri Kanan (Justify)"
        >
          <AlignJustify size={13} />
        </button>

        <div style={{ width: 1, height: 20, background: "#E2E8F0", margin: "0 2px" }} />

        {/* Lists & Indents */}
        <button
          type="button"
          onClick={() => handleExecFormat("insertUnorderedList")}
          style={{ padding: "5px 7px", borderRadius: 6, border: "none", background: "#F8FAFC", cursor: "pointer" }}
          title="Bullet List"
        >
          <List size={13} />
        </button>
        <button
          type="button"
          onClick={() => handleExecFormat("insertOrderedList")}
          style={{ padding: "5px 7px", borderRadius: 6, border: "none", background: "#F8FAFC", cursor: "pointer" }}
          title="Numbered List"
        >
          <ListOrdered size={13} />
        </button>
        <button
          type="button"
          onClick={() => handleExecFormat("outdent")}
          style={{ padding: "5px 7px", borderRadius: 6, border: "none", background: "#F8FAFC", cursor: "pointer" }}
          title="Decrease Indent"
        >
          <Outdent size={13} />
        </button>
        <button
          type="button"
          onClick={() => handleExecFormat("indent")}
          style={{ padding: "5px 7px", borderRadius: 6, border: "none", background: "#F8FAFC", cursor: "pointer" }}
          title="Increase Indent"
        >
          <Indent size={13} />
        </button>

        <div style={{ width: 1, height: 20, background: "#E2E8F0", margin: "0 2px" }} />

        {/* Paragraf Style Toggle */}
        <button
          type="button"
          onClick={() => setParagraphStyle(paragraphStyle === "indent" ? "block" : "indent")}
          style={{
            padding: "4px 8px",
            borderRadius: 6,
            border: paragraphStyle === "indent" ? "1px solid #C7D2FE" : "1px solid #CBD5E1",
            background: paragraphStyle === "indent" ? "#EEF2FF" : "#F8FAFC",
            color: paragraphStyle === "indent" ? "#4338CA" : "#64748B",
            cursor: "pointer",
            fontSize: 11.5,
            fontWeight: 600,
          }}
          title="Gaya Paragraf: Menjorok (1.27cm) vs Rata Berjarak"
        >
          {paragraphStyle === "indent" ? "¶ Menjorok" : "¶ Rata Blok"}
        </button>

        {/* Sisipkan Sitasi */}
        <button
          type="button"
          onClick={() => setShowCitationPickerModal(true)}
          style={{
            padding: "4px 9px",
            borderRadius: 6,
            border: "1px solid #C7D2FE",
            background: "#EEF2FF",
            color: "#4338CA",
            cursor: "pointer",
            fontSize: 11.5,
            fontWeight: 700,
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
          title="Sisipkan Sitasi Jurnal"
        >
          <Quote size={12} />
          <span>+ Sitasi</span>
        </button>

        {/* Perbaiki Typo Otomatis */}
        <button
          type="button"
          onClick={handleFixAllTypos}
          style={{
            padding: "4px 9px",
            borderRadius: 6,
            border: "1px solid #FED7AA",
            background: "#FFF7ED",
            color: "#C2410C",
            cursor: "pointer",
            fontSize: 11.5,
            fontWeight: 700,
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
          title="Perbaiki Ejaan KBBI Otomatis"
        >
          <Zap size={12} />
          <span>Periksa KBBI</span>
        </button>

        {/* Modal Identitas Kampus */}
        <button
          type="button"
          onClick={() => setShowIdentityModal(true)}
          style={{
            padding: "4px 9px",
            borderRadius: 6,
            border: "1px solid #CBD5E1",
            background: "#F8FAFC",
            color: "#334155",
            cursor: "pointer",
            fontSize: 11.5,
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <Building size={12} />
          <span>Identitas</span>
        </button>

        {/* Page Setup Margin */}
        <button
          type="button"
          onClick={() => setShowPageSetupModal(true)}
          style={{
            padding: "4px 9px",
            borderRadius: 6,
            border: "1px solid #CBD5E1",
            background: "#F8FAFC",
            color: "#334155",
            cursor: "pointer",
            fontSize: 11.5,
            fontWeight: 600,
          }}
        >
          Margin A4
        </button>

        {/* Right AI Companion Toggle */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          <button
            type="button"
            onClick={() => setShowAiAssistant(!showAiAssistant)}
            style={{
              padding: "5px 9px",
              borderRadius: 6,
              border: "1px solid #C7D2FE",
              background: showAiAssistant ? "#EEF2FF" : "#F8FAFC",
              color: showAiAssistant ? "#4338CA" : "#64748B",
              cursor: "pointer",
              fontSize: 11.5,
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Sparkles size={12} color={showAiAssistant ? "#4338CA" : "#64748B"} />
            <span>AI Co-Writer</span>
          </button>
        </div>
      </div>
    </>
  );
}
