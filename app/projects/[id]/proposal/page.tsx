"use client";

import React from "react";
import { useParams } from "next/navigation";
import {
  Sparkles,
  Download,
  FileEdit,
  Search,
  Wand2,
  Printer,
  RefreshCw,
} from "lucide-react";

import { useProposalEditor } from "./hooks/useProposalEditor";
import { useTypoChecker } from "./hooks/useTypoChecker";

import { ProposalRibbon } from "./components/ProposalRibbon";
import { ProposalOutlineSidebar } from "./components/ProposalOutlineSidebar";
import { ProposalAiSidebar } from "./components/ProposalAiSidebar";

import { CoverSheet } from "./components/sheets/CoverSheet";
import { ApprovalSheet } from "./components/sheets/ApprovalSheet";
import { AbstractSheet } from "./components/sheets/AbstractSheet";
import { Chapter1Sheet } from "./components/sheets/Chapter1Sheet";
import { Chapter2Sheet } from "./components/sheets/Chapter2Sheet";
import { Chapter3Sheet } from "./components/sheets/Chapter3Sheet";
import { ReferencesSheet } from "./components/sheets/ReferencesSheet";
import { AppendixSheet } from "./components/sheets/AppendixSheet";

import { IdentityModal } from "./components/modals/IdentityModal";
import { PageSetupModal } from "./components/modals/PageSetupModal";
import { AddSubChapterModal } from "./components/modals/AddSubChapterModal";
import { CitationPickerModal } from "./components/modals/CitationPickerModal";
import { PdfExportModal } from "./components/modals/PdfExportModal";
import { TypoTooltip } from "./components/modals/TypoTooltip";
import { SwitchTemplateModal } from "./components/modals/SwitchTemplateModal";

export default function ProposalPage() {
  const params = useParams();
  const projectId = (params?.id as string) || "";

  const editor = useProposalEditor(projectId);

  const typo = useTypoChecker(
    editor.proposalData,
    editor.setProposalData,
    editor.customSubChapters,
    editor.setCustomSubChapters,
    editor.triggerAutoSave
  );

  const [showAddSubChapterModal, setShowAddSubChapterModal] = React.useState(false);

  // Insert AI draft to active document chapter
  const handleInsertAiDraftToDocument = (text: string) => {
    if (editor.activeTab === "bab2") {
      editor.setProposalData((prev: any) => ({
        ...prev,
        bab2: {
          ...prev?.bab2,
          landasanTeori: prev?.bab2?.landasanTeori ? `${prev.bab2.landasanTeori}\n\n${text}` : text,
        },
      }));
    } else if (editor.activeTab === "bab3") {
      editor.setProposalData((prev: any) => ({
        ...prev,
        bab3: {
          ...prev?.bab3,
          desainPenelitian: prev?.bab3?.desainPenelitian ? `${prev.bab3.desainPenelitian}\n\n${text}` : text,
        },
      }));
    } else if (editor.activeTab === "abstract") {
      editor.setAbstractData((prev) => ({
        ...prev,
        indo: prev.indo ? `${prev.indo}\n\n${text}` : text,
      }));
    } else {
      editor.setProposalData((prev: any) => ({
        ...prev,
        bab1: {
          ...prev?.bab1,
          latarBelakang: prev?.bab1?.latarBelakang ? `${prev.bab1.latarBelakang}\n\n${text}` : text,
        },
      }));
    }
    editor.triggerAutoSave();
  };

  // Render text with typographical highlights and indent styling
  const renderAcademicParagraphs = (rawText?: string, placeholder?: string) => {
    if (!rawText || !rawText.trim()) {
      if (placeholder) {
        return (
          <p
            style={{
              textIndent: editor.paragraphStyle === "indent" ? "1.27cm" : "0",
              marginBottom: editor.paragraphStyle === "indent" ? "0px" : "14px",
              lineHeight: 1.8,
              color: editor.isEditMode ? "#94a3b8" : "inherit",
              minHeight: "1.5em",
            }}
          >
            {placeholder}
          </p>
        );
      }
      return null;
    }

    const paragraphs = rawText.split(/\n+/).map((p) => p.trim()).filter(Boolean);

    return (
      <div>
        {paragraphs.map((para, idx) => (
          <p
            key={idx}
            style={{
              textIndent: editor.paragraphStyle === "indent" ? "1.27cm" : "0",
              marginBottom: editor.paragraphStyle === "indent" ? "0px" : "14px",
              lineHeight: 1.8,
              textAlign: "justify",
            }}
          >
            {typo.renderTextWithTypoHighlights(para) || para}
          </p>
        ))}
      </div>
    );
  };

  if (editor.loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "#F8FAFC",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#64748B" }}>
          <RefreshCw size={20} className="animate-spin" color="#059669" />
          <span style={{ fontSize: 13.5, fontWeight: 600 }}>Memuat Draf Studio Proposal...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#F8FAFC",
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* ── TOP NAV STUDIO HEADER & FORMATTING RIBBON ── */}
      <ProposalRibbon
        projectId={projectId}
        projectTitle={editor.project?.title || editor.coverData.title}
        activeTemplate={editor.activeTemplate}
        onOpenSwitchTemplate={() => editor.setShowSwitchTemplateModal(true)}
        isEditMode={editor.isEditMode}
        setIsEditMode={editor.setIsEditMode}
        saveDraftStatus={editor.saveDraftStatus}
        lastSavedTime={editor.lastSavedTime}
        handleSaveDraft={editor.handleSaveDraft}
        selectedFont={editor.selectedFont}
        setSelectedFont={editor.setSelectedFont}
        selectedFontSize={editor.selectedFontSize}
        setSelectedFontSize={editor.setSelectedFontSize}
        selectedStyle={editor.selectedStyle}
        setSelectedStyle={editor.setSelectedStyle}
        activeAlign={editor.activeAlign}
        setActiveAlign={editor.setActiveAlign}
        paragraphStyle={editor.paragraphStyle}
        setParagraphStyle={editor.setParagraphStyle}
        zoomLevel={editor.zoomLevel}
        setZoomLevel={editor.setZoomLevel}
        showOutlineSidebar={editor.showOutlineSidebar}
        setShowOutlineSidebar={editor.setShowOutlineSidebar}
        showAiAssistant={editor.showAiAssistant}
        setShowAiAssistant={editor.setShowAiAssistant}
        showExportMenu={editor.showExportMenu}
        setShowExportMenu={editor.setShowExportMenu}
        handleDownloadDocx={editor.handleDownloadDocx}
        handleDownloadLatexZip={editor.handleDownloadLatexZip}
        selectedTemplate={editor.selectedTemplate}
        setSelectedTemplate={editor.setSelectedTemplate}
        setShowPdfExportModal={editor.setShowPdfExportModal}
        handleGenerateProposal={editor.handleGenerateProposal}
        generating={editor.generating}
        setShowPageSetupModal={editor.setShowPageSetupModal}
        setShowIdentityModal={editor.setShowIdentityModal}
        setShowCitationPickerModal={editor.setShowCitationPickerModal}
        handleFixAllTypos={typo.handleFixAllTypos}
        citationStyle={editor.citationStyle}
      />

      {/* ── MAIN STUDIO 3-COLUMN LAYOUT ── */}
      <div style={{ display: "flex", flex: 1, position: "relative" }}>
        {/* Left Outline Sidebar */}
        {editor.showOutlineSidebar && (
          <ProposalOutlineSidebar
            activeTab={editor.activeTab}
            handleNavigateToSection={editor.handleNavigateToSection}
            references={editor.references}
            customSubChapters={editor.customSubChapters}
            setShowAddSubChapterModal={setShowAddSubChapterModal}
            handleGenerateProposal={editor.handleGenerateProposal}
          />
        )}

        {/* Center Canvas */}
        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "24px 20px 80px",
            overflowY: "auto",
            minWidth: 0,
            background: "#E2E8F0",
          }}
        >
          {/* Centimeter Ruler */}
          <div
            id="centimeter_ruler"
            className="no-print"
            style={{
              width: "100%",
              maxWidth: "210mm",
              background: "#F8FAFC",
              border: "1px solid #CBD5E1",
              borderBottom: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "4px 12px",
              fontSize: 10,
              fontFamily: "monospace",
              color: "#64748B",
              userSelect: "none",
            }}
          >
            <span>0</span>
            <span>|</span>
            <span>1</span>
            <span>|</span>
            <span>2</span>
            <span>|</span>
            <span>3</span>
            <span>|</span>
            <span>4 (Margin Kiri)</span>
            <span>|</span>
            <span>6</span>
            <span>|</span>
            <span>8</span>
            <span>|</span>
            <span>10</span>
            <span>|</span>
            <span>12</span>
            <span>|</span>
            <span>14</span>
            <span>|</span>
            <span>16</span>
            <span>17 cm</span>
          </div>

          {/* AI Synthesis Banner when empty */}
          {!editor.proposalData?.bab1?.latarBelakang && (
            <div
              id="banner_sintesis"
              className="no-print"
              style={{
                width: "100%",
                maxWidth: "210mm",
                margin: "0 0 24px 0",
                background: "linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)",
                border: "1.5px dashed #10B981",
                borderRadius: 12,
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 18,
                boxShadow: "0 4px 16px rgba(16, 185, 129, 0.12)",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                  <span style={{ fontSize: 18 }}>✨</span>
                  <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#065F46" }}>
                    Research Blueprint &amp; {editor.references.length} Jurnal Evidence Siap
                    Disintesis!
                  </h4>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 12.5,
                    color: "#047857",
                    lineHeight: 1.5,
                    maxWidth: 540,
                  }}
                >
                  Klik tombol di samping untuk menyusun draf naskah Bab 1, 2, dan 3 yang spesifik
                  sesuai topik <strong>&quot;{editor.project?.title || editor.coverData.title}&quot;</strong>{" "}
                  lengkap dengan sitasi jurnal {editor.citationStyle}.
                </p>
              </div>

              <button
                type="button"
                onClick={editor.handleGenerateProposal}
                disabled={editor.generating}
                style={{
                  background: "#059669",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 18px",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: editor.generating ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  whiteSpace: "nowrap",
                  boxShadow: "0 4px 12px rgba(5, 150, 105, 0.25)",
                  transition: "all 0.15s ease",
                }}
              >
                {editor.generating ? (
                  <RefreshCw size={15} className="animate-spin" />
                ) : (
                  <Sparkles size={15} />
                )}
                <span>{editor.generating ? "Sedang Menyusun..." : "Sintesis Proposal AI ✨"}</span>
              </button>
            </div>
          )}

          {/* ════ CONTINUOUS MULTI-PAGE ACADEMIC MANUSCRIPT ════ */}
          <div
            id="proposal-print-area"
            style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}
          >
            {/* Sheet 1: Cover */}
            <CoverSheet
              coverData={editor.coverData}
              profile={editor.profile}
              project={editor.project}
              isEditMode={editor.isEditMode}
              triggerAutoSave={editor.triggerAutoSave}
              pdfPageSelection={editor.pdfPageSelection}
              pageNumberPos={editor.pageNumberPos}
              marginPreset={editor.marginPreset}
              logoLoadError={editor.logoLoadError}
              setLogoLoadError={editor.setLogoLoadError}
            />

            {/* Sheet 2: Lembar Persetujuan */}
            <ApprovalSheet
              coverData={editor.coverData}
              approvalData={editor.approvalData}
              profile={editor.profile}
              project={editor.project}
              isEditMode={editor.isEditMode}
              triggerAutoSave={editor.triggerAutoSave}
              pdfPageSelection={editor.pdfPageSelection}
              pageNumberPos={editor.pageNumberPos}
              marginPreset={editor.marginPreset}
            />

            {/* Sheet 3: Abstrak */}
            <AbstractSheet
              abstractData={editor.abstractData}
              isEditMode={editor.isEditMode}
              triggerAutoSave={editor.triggerAutoSave}
              pdfPageSelection={editor.pdfPageSelection}
              pageNumberPos={editor.pageNumberPos}
              marginPreset={editor.marginPreset}
              renderAcademicParagraphs={renderAcademicParagraphs}
            />

            {/* Sheet 4: Bab I Pendahuluan */}
            <Chapter1Sheet
              proposalData={editor.proposalData}
              customSubChapters={editor.customSubChapters}
              isEditMode={editor.isEditMode}
              triggerAutoSave={editor.triggerAutoSave}
              pdfPageSelection={editor.pdfPageSelection}
              pageNumberPos={editor.pageNumberPos}
              marginPreset={editor.marginPreset}
              paragraphStyle={editor.paragraphStyle}
              renderAcademicParagraphs={renderAcademicParagraphs}
              latarPage1={editor.latarPage1}
              latarPage2={editor.latarPage2}
              latarPage3={editor.latarPage3}
            />

            {/* Sheet 5: Bab II Tinjauan Pustaka & Matriks */}
            <Chapter2Sheet
              proposalData={editor.proposalData}
              references={editor.references}
              customSubChapters={editor.customSubChapters}
              isEditMode={editor.isEditMode}
              triggerAutoSave={editor.triggerAutoSave}
              pdfPageSelection={editor.pdfPageSelection}
              pageNumberPos={editor.pageNumberPos}
              marginPreset={editor.marginPreset}
              renderAcademicParagraphs={renderAcademicParagraphs}
            />

            {/* Sheet 6: Bab III Metodologi */}
            <Chapter3Sheet
              proposalData={editor.proposalData}
              customSubChapters={editor.customSubChapters}
              isEditMode={editor.isEditMode}
              triggerAutoSave={editor.triggerAutoSave}
              pdfPageSelection={editor.pdfPageSelection}
              pageNumberPos={editor.pageNumberPos}
              marginPreset={editor.marginPreset}
              renderAcademicParagraphs={renderAcademicParagraphs}
            />

            {/* Sheet 7: Daftar Pustaka */}
            <ReferencesSheet
              citedReferencesList={editor.citedReferencesList}
              citationStyle={editor.citationStyle}
              isEditMode={editor.isEditMode}
              triggerAutoSave={editor.triggerAutoSave}
              pdfPageSelection={editor.pdfPageSelection}
              pageNumberPos={editor.pageNumberPos}
              marginPreset={editor.marginPreset}
              handleJumpToCitationInText={editor.handleJumpToCitationInText}
            />

            {/* Sheet 8: Lampiran */}
            <AppendixSheet
              appendixData={editor.appendixData}
              isEditMode={editor.isEditMode}
              triggerAutoSave={editor.triggerAutoSave}
              pdfPageSelection={editor.pdfPageSelection}
              pageNumberPos={editor.pageNumberPos}
              marginPreset={editor.marginPreset}
            />
          </div>

          {/* Canvas Bottom Info Bar */}
          <div
            id="canvas_info_bar"
            className="no-print"
            style={{
              width: "100%",
              maxWidth: "210mm",
              background: "#FFFFFF",
              border: "1px solid #CBD5E1",
              borderRadius: 8,
              padding: "6px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: 11.5,
              color: "#64748B",
              fontWeight: 500,
            }}
          >
            <div suppressHydrationWarning>
              Page {editor.getPageNumber(editor.activeTab) || "1"} of 6 • Words:{" "}
              {editor.wordCount.toLocaleString()} • Characters:{" "}
              {editor.charCount.toLocaleString()}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span>🌐 Indonesian</span>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <button
                  type="button"
                  onClick={() => editor.setZoomLevel(Math.max(50, editor.zoomLevel - 10))}
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  -
                </button>
                <span>{editor.zoomLevel}%</span>
                <button
                  type="button"
                  onClick={() => editor.setZoomLevel(Math.min(150, editor.zoomLevel + 10))}
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Right AI Companion Panel */}
        <ProposalAiSidebar
          showAiAssistant={editor.showAiAssistant}
          setShowAiAssistant={editor.setShowAiAssistant}
          aiActiveTab={editor.aiActiveTab}
          setAiActiveTab={editor.setAiActiveTab}
          profileName={editor.profile?.namaLengkap}
          projectTitle={editor.project?.title || editor.coverData.title}
          aiInputPrompt={editor.aiInputPrompt}
          setAiInputPrompt={editor.setAiInputPrompt}
          isAiThinking={editor.isAiThinking}
          aiChatMessages={editor.aiChatMessages}
          activeTab={editor.activeTab}
          handleSendAiMessage={editor.handleAiChatMessage}
          handleInsertAiDraftToDocument={handleInsertAiDraftToDocument}
          setLastSavedTime={editor.lastSavedTime ? () => {} : () => {}}
        />
      </div>

      {/* ── FLOATING ACTION BAR FOR QUICK ACTIONS ── */}
      <div
        id="floating_action_bar"
        className="no-print floating-action-bar"
        style={{
          position: "fixed",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          background: "#FFFFFF",
          borderRadius: 9999,
          border: "1px solid #CBD5E1",
          padding: "6px 10px",
          display: "flex",
          alignItems: "center",
          gap: 6,
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.15)",
          zIndex: 35,
        }}
      >
        <button
          type="button"
          onClick={() => editor.handleGenerateProposal()}
          style={{
            background: "#F8FAFC",
            border: "none",
            borderRadius: 9999,
            padding: "6px 12px",
            fontSize: 12,
            fontWeight: 600,
            color: "#334155",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <Sparkles size={13} color="#4338CA" />
          <span>Generate Outline</span>
        </button>

        <button
          type="button"
          onClick={() => setShowAddSubChapterModal(true)}
          style={{
            background: "#F8FAFC",
            border: "none",
            borderRadius: 9999,
            padding: "6px 12px",
            fontSize: 12,
            fontWeight: 600,
            color: "#334155",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <FileEdit size={13} color="#059669" />
          <span>Generate Sub-Bab</span>
        </button>

        <button
          type="button"
          onClick={() => editor.handleNavigateToSection("matrix", "section_matrix")}
          style={{
            background: "#F8FAFC",
            border: "none",
            borderRadius: 9999,
            padding: "6px 12px",
            fontSize: 12,
            fontWeight: 600,
            color: "#334155",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <Search size={13} color="#2563EB" />
          <span>Cari Referensi</span>
        </button>

        <button
          type="button"
          onClick={() => {
            editor.setAiInputPrompt("Tolong perbaiki kalimat ini agar lebih baku secara akademis...");
            editor.setShowAiAssistant(true);
          }}
          style={{
            background: "#F8FAFC",
            border: "none",
            borderRadius: 9999,
            padding: "6px 12px",
            fontSize: 12,
            fontWeight: 600,
            color: "#334155",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <Wand2 size={13} color="#D97706" />
          <span>Paraphrase</span>
        </button>

        <button
          type="button"
          onClick={editor.handleDownloadDocx}
          style={{
            background: "#F8FAFC",
            border: "none",
            borderRadius: 9999,
            padding: "6px 12px",
            fontSize: 12,
            fontWeight: 600,
            color: "#334155",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <Download size={13} color="#0284C7" />
          <span>Export DOCX</span>
        </button>

        <button
          type="button"
          onClick={() => editor.setShowPdfExportModal(true)}
          style={{
            background: "#F8FAFC",
            border: "none",
            borderRadius: 9999,
            padding: "6px 12px",
            fontSize: 12,
            fontWeight: 600,
            color: "#334155",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <Printer size={13} color="#DC2626" />
          <span>Export PDF</span>
        </button>
      </div>

      {/* ════ MODALS ════ */}
      <IdentityModal
        showIdentityModal={editor.showIdentityModal}
        setShowIdentityModal={editor.setShowIdentityModal}
        coverData={editor.coverData}
        setCoverData={editor.setCoverData}
        approvalData={editor.approvalData}
        setApprovalData={editor.setApprovalData}
        triggerAutoSave={editor.triggerAutoSave}
        activeTemplate={editor.activeTemplate}
        variableValues={editor.variableValues}
        onSaveVariableValues={editor.handleSaveVariableValues}
      />

      <SwitchTemplateModal
        isOpen={editor.showSwitchTemplateModal}
        onClose={() => editor.setShowSwitchTemplateModal(false)}
        projectId={projectId}
        activeTemplate={editor.activeTemplate}
        onTemplateSwitched={(newTpl) => {
          editor.setActiveTemplate(newTpl);
          if (newTpl.formatType === "DOCX") {
            editor.setSelectedTemplate("GENERAL_ID");
          } else {
            editor.setSelectedTemplate("TELKOM_FIF");
          }
          editor.triggerAutoSave();
        }}
      />

      <PageSetupModal
        showPageSetupModal={editor.showPageSetupModal}
        setShowPageSetupModal={editor.setShowPageSetupModal}
        marginPreset={editor.marginPreset}
        setMarginPreset={editor.setMarginPreset}
        pageNumberPos={editor.pageNumberPos}
        setPageNumberPos={editor.setPageNumberPos}
        triggerAutoSave={editor.triggerAutoSave}
      />

      <AddSubChapterModal
        showAddSubChapterModal={showAddSubChapterModal}
        setShowAddSubChapterModal={setShowAddSubChapterModal}
        customSubChapters={editor.customSubChapters}
        setCustomSubChapters={editor.setCustomSubChapters}
        triggerAutoSave={editor.triggerAutoSave}
        projectTitle={editor.project?.title || editor.coverData.title}
      />

      <CitationPickerModal
        showCitationPickerModal={editor.showCitationPickerModal}
        setShowCitationPickerModal={editor.setShowCitationPickerModal}
        citationStyle={editor.citationStyle}
        activeTab={editor.activeTab}
        references={editor.references}
        handleInsertAiDraftToDocument={handleInsertAiDraftToDocument}
        setLastSavedTime={() => {}}
      />

      <PdfExportModal
        showPdfExportModal={editor.showPdfExportModal}
        setShowPdfExportModal={editor.setShowPdfExportModal}
        pdfPageSelection={editor.pdfPageSelection}
        setPdfPageSelection={editor.setPdfPageSelection}
        marginPreset={editor.marginPreset}
        setMarginPreset={editor.setMarginPreset}
        pageNumberPos={editor.pageNumberPos}
        setPageNumberPos={editor.setPageNumberPos}
      />

      <TypoTooltip
        showTypoTooltip={typo.showTypoTooltip}
        setShowTypoTooltip={typo.setShowTypoTooltip}
        handleFixTypo={typo.handleFixTypo}
      />

      {/* ════ GLOBAL PRINT STYLESHEET ════ */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          html, body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            min-width: 100% !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print,
          #studio_top_header,
          #top_ribbon,
          #left_outline_sidebar,
          #ai_companion_panel,
          #centimeter_ruler,
          #canvas_info_bar,
          #banner_sintesis,
          #floating_action_bar,
          .floating-action-bar,
          button,
          input,
          select,
          nav,
          aside,
          header,
          [role="dialog"] {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            width: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            overflow: hidden !important;
          }
          main {
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            display: block !important;
          }
          #proposal-print-area {
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }
          .a4-print-sheet {
            width: 210mm !important;
            max-width: 210mm !important;
            min-height: 297mm !important;
            height: auto !important;
            margin: 0 auto !important;
            padding: 3cm 3cm 3cm 4cm !important;
            background: #ffffff !important;
            box-shadow: none !important;
            border: none !important;
            box-sizing: border-box !important;
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: auto !important;
            break-inside: auto !important;
            display: flex !important;
            flex-direction: column !important;
            overflow: visible !important;
          }
          .a4-print-sheet-4433 {
            padding: 4cm 3cm 3cm 4cm !important;
          }
          .sheet-hidden-for-print {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            overflow: hidden !important;
          }
          p, div {
            orphans: 3 !important;
            widows: 3 !important;
          }
          a, span, p, div, h1, h2, h3, h4, th, td, em, strong {
            color: #000000 !important;
            text-shadow: none !important;
            box-shadow: none !important;
            text-decoration: none !important;
            background: transparent !important;
          }
          table {
            border-collapse: collapse !important;
            page-break-inside: avoid !important;
          }
          table, th, td {
            border-color: #000000 !important;
          }
        }
      `}</style>
    </div>
  );
}
