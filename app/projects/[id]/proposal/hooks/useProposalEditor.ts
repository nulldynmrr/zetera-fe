import { useState, useEffect, useRef, useCallback } from "react";
import React from "react";
import { api, UserProfile, getToken, TOKEN_KEY } from "@/lib/api-client";
import {
  TabKey,
  TemplateType,
  ReferenceItem,
  CustomSubChapterItem,
  CoverData,
  ApprovalData,
  AbstractData,
  AppendixData,
  PdfPageSelection,
  AiChatMessage,
} from "../types";

export function useProposalEditor(projectId: string) {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("bab1");

  const [project, setProject] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [references, setReferences] = useState<ReferenceItem[]>([]);
  const [proposalData, setProposalData] = useState<any>(null);

  // Template and Logo
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showIdentityModal, setShowIdentityModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>("TELKOM_FIF");
  const [logoLoadError, setLogoLoadError] = useState(false);

  // ── Cover & Identitas ──
  const [coverData, setCoverData] = useState<CoverData>({
    title: "",
    author: "",
    nim: "",
    prodi: "",
    fakultas: "",
    universitas: "",
    kota: "Bandung",
    year: `${new Date().getFullYear()}`,
  });

  // ── Lembar Persetujuan (FIF LaTeX Standard) ──
  const [approvalData, setApprovalData] = useState<ApprovalData>({
    titleEng: "",
    kota: "Bandung",
    dateDay: "2",
    dateMonth: "Oktober",
    dateYear: "2026",
    pembimbing1: "",
    nipPembimbing1: "",
    pembimbing2: "",
    nipPembimbing2: "",
    kaprodi: "",
    nipKaprodi: "",
  });

  // ── Abstrak & Keywords ──
  const [abstractData, setAbstractData] = useState<AbstractData>({
    indo: "",
    keywordsIndo: "",
    eng: "",
    keywordsEng: "",
  });

  // ── Gaya Sitasi Proyek ──
  const [citationStyle, setCitationStyle] = useState<string>("IEEE");

  // ── Lampiran ──
  const [appendixData, setAppendixData] = useState<AppendixData>({
    title: "Lampiran: Instrumen Kuesioner Penelitian & Panduan Wawancara",
    content:
      "Berikut merupakan instrumen pengumpulan data skala Likert terstruktur yang digunakan dalam pengujian variabel penelitian:\n\n1. Bagian A: Data Demografis Responden (Usia, Jenis Kelamin, Pendidikan)\n2. Bagian B: Skala Variabel Independen (Instrumen teruji validitas)\n3. Bagian C: Skala Variabel Dependen (Instrumen pengukuran baku)",
  });

  // ── A4 Page Settings: Margin 4-3-3-3 & Page Numbering ──
  const [marginPreset, setMarginPreset] = useState<"4333" | "4433">("4333");
  const [pageNumberPos, setPageNumberPos] = useState<
    "bottom-right" | "bottom-center" | "bottom-left" | "top-right" | "top-center"
  >("bottom-right");
  const [showPageSetupModal, setShowPageSetupModal] = useState(false);

  // ── Live Editor State ──
  const [isEditMode, setIsEditMode] = useState(true);
  const [saveDraftStatus, setSaveDraftStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [lastSavedTime, setLastSavedTime] = useState<string | null>("Baru saja");
  const [activeAlign, setActiveAlign] = useState<"left" | "center" | "right" | "justify">("justify");
  const [paragraphStyle, setParagraphStyle] = useState<"indent" | "block">("indent");

  // Font & View
  const [selectedFont, setSelectedFont] = useState("Times New Roman");
  const [selectedFontSize, setSelectedFontSize] = useState(12);
  const [selectedStyle, setSelectedStyle] = useState("Normal Text");
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showPdfExportModal, setShowPdfExportModal] = useState(false);
  const [pdfPageSelection, setPdfPageSelection] = useState<PdfPageSelection>({
    cover: true,
    approval: true,
    abstract: true,
    bab1: true,
    bab2: true,
    bab3: true,
    references: true,
    appendix: true,
  });

  // 3-Column Layout Toggles
  const [showOutlineSidebar, setShowOutlineSidebar] = useState(true);
  const [showAiAssistant, setShowAiAssistant] = useState(true);

  // AI Assistant Companion State
  const [aiActiveTab, setAiActiveTab] = useState<"chat" | "tulis" | "tinjau" | "riset">("chat");
  const [aiInputPrompt, setAiInputPrompt] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiChatMessages, setAiChatMessages] = useState<AiChatMessage[]>([
    {
      sender: "ai",
      text: "Hai! Saya asisten riset AI Zetera siap membantu penulisan skripsi & proposal Anda. Anda dapat meminta saya untuk menyusun latar belakang, membuat kerangka pemikiran, atau mencari referensi jurnal relevan.",
      time: "10:25 AM",
    },
  ]);

  // Sub-chapters state
  const [customSubChapters, setCustomSubChapters] = useState<CustomSubChapterItem[]>([]);
  const [structureChapter, setStructureChapter] = useState<"bab1" | "bab2" | "bab3">("bab1");
  const [showCitationPickerModal, setShowCitationPickerModal] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // Autosave timer
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load Initial Data
  const loadProposalData = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      setError("");
      const res = await api.proposal.get(projectId);
      if (res.success && res.data) {
        setProject(res.data.project);
        setProfile(res.data.profile);

        const initialRefs: ReferenceItem[] = (res.data.literatureMatrix || []).map((j: any) => ({
          id: j.id,
          title: j.title,
          authors: j.authors || "Penulis",
          year: j.year || new Date().getFullYear(),
          publication: j.publication || "Jurnal Ilmiah",
          doi: j.doi || "-",
          selected: true,
          keyFindings: j.keyFindings || "",
          mappedVariables: j.mappedVariables || "",
          methodology: j.methodology || "",
        }));

        setReferences(initialRefs);

        setCoverData({
          title:
            res.data.project?.title ||
            "Pengalaman Pengguna terhadap Chatbot Pendamping Kesehatan Mental Berbasis Teknologi: Studi Kasus pada Mahasiswa Informatika",
          author: res.data.profile?.namaLengkap || res.data.project?.nama || "Andi Pratama",
          nim: res.data.profile?.nim || "1301220001",
          prodi: res.data.profile?.programStudi || res.data.project?.prodi || "S1 Teknik Informatika",
          fakultas: res.data.profile?.fakultas || "Fakultas Informatika",
          universitas: res.data.profile?.universitas || "Universitas Telkom",
          kota: res.data.profile?.kota || "Bandung",
          year: `${new Date().getFullYear()}`,
        });

        if (res.data.project?.citationStyle) {
          setCitationStyle(res.data.project.citationStyle.toUpperCase());
        }

        // RESTORE SAVED DRAFT FROM DATABASE IF AVAILABLE
        if (res.data.savedDraft) {
          const draft = res.data.savedDraft;
          if (draft.proposalData) setProposalData(draft.proposalData);
          if (draft.coverData) setCoverData(draft.coverData);
          if (draft.approvalData) setApprovalData(draft.approvalData);
          if (draft.abstractData) setAbstractData(draft.abstractData);
          if (draft.appendixData) setAppendixData(draft.appendixData);
          if (draft.customSubChapters) setCustomSubChapters(draft.customSubChapters);
          if (draft.marginPreset) setMarginPreset(draft.marginPreset);
          if (draft.pageNumberPos) setPageNumberPos(draft.pageNumberPos);
          if (draft.selectedTemplate) setSelectedTemplate(draft.selectedTemplate);
          if (draft.references && Array.isArray(draft.references)) setReferences(draft.references);
          if (draft.lastSavedAt) {
            const d = new Date(draft.lastSavedAt);
            setLastSavedTime(
              d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
            );
          }
        }

        // Sinkronkan draf sub-bab dari Outline Blueprint jika proposalData belum diisi
        if (res.data.outlineItems && res.data.outlineItems.length > 0) {
          const findNotes = (id: string) => {
            return (res.data.outlineItems || []).find((i: any) => i.itemId === id)?.userNotes?.trim() || "";
          };

          const notes1_1 = findNotes("1.1");
          const notes1_2 = findNotes("1.2");
          const notes1_3 = findNotes("1.3");
          const notes1_4 = findNotes("1.4");
          const notes2_1 = findNotes("2.1");
          const notes2_2 = findNotes("2.2");
          const notes2_3 = findNotes("2.3");
          const notes3_1 = findNotes("3.1");
          const notes3_2 = findNotes("3.2");
          const notes3_3 = findNotes("3.3");
          const notes3_4 = findNotes("3.4");

          setProposalData((prev: any) => ({
            ...(prev || {}),
            bab1: {
              ...(prev?.bab1 || {}),
              ...(notes1_1 && !prev?.bab1?.latarBelakang ? { latarBelakang: notes1_1 } : {}),
              ...(notes1_2 && !prev?.bab1?.rumusanMasalah ? { rumusanMasalah: notes1_2 } : {}),
              ...(notes1_3 && !prev?.bab1?.tujuanPenelitian ? { tujuanPenelitian: notes1_3 } : {}),
              ...(notes1_4 && !prev?.bab1?.manfaatPenelitian ? { manfaatPenelitian: notes1_4 } : {}),
            },
            bab2: {
              ...(prev?.bab2 || {}),
              ...(notes2_1 && !prev?.bab2?.landasanTeori ? { landasanTeori: notes2_1 } : {}),
              ...(notes2_2 && !prev?.bab2?.penelitianTerdahulu ? { penelitianTerdahulu: notes2_2 } : {}),
              ...(notes2_3 && !prev?.bab2?.kerangkaPemikiran ? { kerangkaPemikiran: notes2_3 } : {}),
            },
            bab3: {
              ...(prev?.bab3 || {}),
              ...(notes3_1 && !prev?.bab3?.desainPenelitian ? { desainPenelitian: notes3_1 } : {}),
              ...(notes3_2 && !prev?.bab3?.populasiSampel ? { populasiSampel: notes3_2 } : {}),
              ...(notes3_3 && !prev?.bab3?.teknikPengumpulanData ? { teknikPengumpulanData: notes3_3 } : {}),
              ...(notes3_4 && !prev?.bab3?.teknikAnalisisData ? { teknikAnalisisData: notes3_4 } : {}),
            },
          }));
        }
      }
    } catch (err: any) {
      setError(err.message || "Gagal memuat data proposal");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadProposalData();
  }, [loadProposalData]);

  // Handle Save Draft Directly to Database
  const handleSaveDraft = useCallback(async () => {
    setSaveDraftStatus("saving");
    try {
      const draftPayload = {
        proposalData,
        approvalData,
        abstractData,
        appendixData,
        customSubChapters,
        references,
        marginPreset,
        pageNumberPos,
        selectedTemplate,
        lastSavedAt: new Date().toISOString(),
      };

      if (typeof window !== "undefined") {
        localStorage.setItem(`zetera_proposal_draft_${projectId}`, JSON.stringify(draftPayload));
      }

      const res = await api.proposal.save(projectId, draftPayload);
      if (res.success) {
        setSaveDraftStatus("saved");
        const d = new Date();
        setLastSavedTime(d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }));
        setTimeout(() => setSaveDraftStatus("idle"), 3000);
      } else {
        setSaveDraftStatus("idle");
      }
    } catch (e) {
      console.error("Error saving proposal to database:", e);
      setSaveDraftStatus("idle");
    }
  }, [
    projectId,
    proposalData,
    approvalData,
    abstractData,
    appendixData,
    customSubChapters,
    references,
    marginPreset,
    pageNumberPos,
    selectedTemplate,
  ]);

  // Debounced auto-save
  const triggerAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      handleSaveDraft();
    }, 2500);
  }, [handleSaveDraft]);

  // Handle Full AI Generation
  const handleGenerateProposal = async () => {
    try {
      setGenerating(true);
      setError("");
      setShowConfigModal(false);

      const activeRefs = references.filter((r) => r.selected);

      const res = await api.proposal.generate(projectId, {
        templateType: selectedTemplate,
        activeReferences: activeRefs,
      });

      if (res.success && res.data) {
        setProposalData(res.data);
        setActiveTab("bab1");
        api.proposal.save(projectId, {
          proposalData: res.data,
          approvalData,
          abstractData,
          appendixData,
          customSubChapters,
          references,
          marginPreset,
          pageNumberPos,
          selectedTemplate,
        });
      }
    } catch (err: any) {
      setError(err.message || "Gagal menyusun proposal AI");
    } finally {
      setGenerating(false);
    }
  };

  // Download Docx
  const handleDownloadDocx = async () => {
    try {
      const token =
        getToken() ||
        (typeof window !== "undefined"
          ? localStorage.getItem(TOKEN_KEY) || localStorage.getItem("token")
          : "");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      const res = await fetch(`${apiUrl}/api/projects/${projectId}/proposal/export-docx`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || "Gagal mengunduh berkas Word (.docx)");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Proposal_Skripsi_${(coverData?.title || "Draft").replace(/[^a-zA-Z0-9]/g, "_").slice(0, 35)}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setShowExportMenu(false);
    } catch (err: any) {
      alert(err.message || "Gagal mengunduh dokumen Word");
    }
  };

  // Download LaTeX Zip
  const handleDownloadLatexZip = async (template: TemplateType = selectedTemplate) => {
    try {
      const token =
        getToken() ||
        (typeof window !== "undefined"
          ? localStorage.getItem(TOKEN_KEY) || localStorage.getItem("token")
          : "");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      const res = await fetch(
        `${apiUrl}/api/projects/${projectId}/proposal/export-latex?template=${template}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || "Gagal mengunduh paket LaTeX (.zip)");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Proposal_Latex_${(coverData?.title || "Draft").replace(/[^a-zA-Z0-9]/g, "_").slice(0, 35)}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setShowExportMenu(false);
    } catch (err: any) {
      alert(err.message || "Gagal mengunduh paket LaTeX");
    }
  };

  // Reference toggles
  const handleToggleRef = (id: string) => {
    setReferences((prev) => prev.map((r) => (r.id === id ? { ...r, selected: !r.selected } : r)));
    triggerAutoSave();
  };

  const handleDeleteRef = (id: string) => {
    setReferences((prev) => prev.filter((r) => r.id !== id));
    triggerAutoSave();
  };

  // Navigation scroll helper
  const handleNavigateToSection = (tabId: TabKey, elementId?: string) => {
    setActiveTab(tabId);
    setTimeout(() => {
      if (elementId) {
        const el = document.getElementById(elementId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.style.transition = "all 0.35s ease";
          const prevBg = el.style.backgroundColor;
          el.style.backgroundColor = "rgba(99, 102, 241, 0.18)";
          el.style.borderRadius = "4px";
          el.style.padding = "2px 6px";
          setTimeout(() => {
            el.style.backgroundColor = prevBg || "transparent";
          }, 1400);
        }
      } else {
        const topEl = document.getElementById(`section_${tabId}`);
        if (topEl) {
          topEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    }, 120);
  };

  // Citation Jumping
  const handleJumpToRef = (refIndexOrId: number | string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const targetEl =
      document.getElementById(`ref-${refIndexOrId}`) || document.getElementById(`ref_${refIndexOrId}`);

    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
      targetEl.style.transition = "all 0.3s ease";
      targetEl.style.backgroundColor = "#FEF08A";
      targetEl.style.boxShadow = "0 0 0 4px #FDE047";
      targetEl.style.borderRadius = "6px";
      setTimeout(() => {
        targetEl.style.backgroundColor = "transparent";
        targetEl.style.boxShadow = "none";
      }, 2500);
    } else {
      const sectionRef = document.getElementById("section_references");
      if (sectionRef) sectionRef.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleJumpToCitationInText = (refIndex: number, authors?: string, doi?: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const firstAuthorWord = (authors || "")
      .replace(/^(\[\d+\]|\d+[\.\)\t\s]+)/, "")
      .split(/et\s+al|,/i)[0]
      ?.trim()
      ?.split(/\s+/)[0]
      ?.toLowerCase();

    const matchingElements = Array.from(
      document.querySelectorAll(`[data-cite-ref="${refIndex}"], [data-cite-auth*="${firstAuthorWord || "___"}"]`)
    ) as HTMLElement[];

    if (matchingElements.length > 0) {
      matchingElements[0].scrollIntoView({ behavior: "smooth", block: "center" });
      matchingElements.forEach((el) => {
        el.style.transition = "all 0.3s ease";
        el.style.backgroundColor = "#FEF08A";
        el.style.boxShadow = "0 0 0 4px #FDE047";
        el.style.borderRadius = "4px";
      });

      setTimeout(() => {
        matchingElements.forEach((el) => {
          el.style.backgroundColor = "transparent";
          el.style.boxShadow = "none";
        });
      }, 2500);
    } else {
      const bab1 = document.getElementById("section_bab1");
      if (bab1) bab1.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // AI Companion Chat
  const handleAiChatMessage = async () => {
    if (!aiInputPrompt.trim() || isAiThinking) return;

    const userMsg = aiInputPrompt.trim();
    setAiInputPrompt("");
    const currentTime = new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

    setAiChatMessages((prev) => [...prev, { sender: "user", text: userMsg, time: currentTime }]);
    setIsAiThinking(true);

    try {
      const res = await api.proposal.chat(projectId, {
        command: userMsg,
        sectionId: activeTab,
        currentContent: typeof proposalData[activeTab as keyof typeof proposalData] === "string"
          ? (proposalData[activeTab as keyof typeof proposalData] as string)
          : "",
        conversationHistory: aiChatMessages.map((m) => ({
          role: m.sender === "user" ? "user" : "assistant",
          content: m.text,
        })),
      });

      const replyText =
        res?.explanation ||
        res?.revisedContent ||
        "Maaf, saya tidak dapat merumuskan respons untuk saat ini.";

      setAiChatMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: replyText,
          time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          revisedContent: res?.revisedContent,
          explanation: res?.explanation,
          usedCitations: res?.usedCitations,
        },
      ]);
    } catch (err: any) {
      setAiChatMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: `Gagal memproses permintaan: ${err.message || "Terjadi kesalahan pada AI Server"}.`,
          time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsAiThinking(false);
    }
  };

  return {
    loading,
    generating,
    error,
    setError,
    activeTab,
    setActiveTab,
    project,
    profile,
    references,
    setReferences,
    proposalData,
    setProposalData,
    showConfigModal,
    setShowConfigModal,
    showIdentityModal,
    setShowIdentityModal,
    selectedTemplate,
    setSelectedTemplate,
    logoLoadError,
    setLogoLoadError,
    coverData,
    setCoverData,
    approvalData,
    setApprovalData,
    abstractData,
    setAbstractData,
    appendixData,
    setAppendixData,
    citationStyle,
    setCitationStyle,
    marginPreset,
    setMarginPreset,
    pageNumberPos,
    setPageNumberPos,
    showPageSetupModal,
    setShowPageSetupModal,
    isEditMode,
    setIsEditMode,
    saveDraftStatus,
    lastSavedTime,
    activeAlign,
    setActiveAlign,
    paragraphStyle,
    setParagraphStyle,
    selectedFont,
    setSelectedFont,
    selectedFontSize,
    setSelectedFontSize,
    selectedStyle,
    setSelectedStyle,
    zoomLevel,
    setZoomLevel,
    isFullscreen,
    setIsFullscreen,
    showExportMenu,
    setShowExportMenu,
    showPdfExportModal,
    setShowPdfExportModal,
    pdfPageSelection,
    setPdfPageSelection,
    showOutlineSidebar,
    setShowOutlineSidebar,
    showAiAssistant,
    setShowAiAssistant,
    aiActiveTab,
    setAiActiveTab,
    aiInputPrompt,
    setAiInputPrompt,
    isAiThinking,
    aiChatMessages,
    setAiChatMessages,
    customSubChapters,
    setCustomSubChapters,
    structureChapter,
    setStructureChapter,
    showCitationPickerModal,
    setShowCitationPickerModal,
    copiedText,
    setCopiedText,
    loadProposalData,
    handleSaveDraft,
    triggerAutoSave,
    handleGenerateProposal,
    handleDownloadDocx,
    handleDownloadLatexZip,
    handleToggleRef,
    handleDeleteRef,
    handleNavigateToSection,
    handleJumpToRef,
    handleJumpToCitationInText,
    handleAiChatMessage,
    getPageNumber: (tab: TabKey) => {
      switch (tab) {
        case "cover":
          return null;
        case "approval":
          return "ii";
        case "abstract":
          return "iii";
        case "bab1":
          return "1";
        case "bab2":
          return "2";
        case "matrix":
          return "3";
        case "bab3":
          return "4";
        case "references":
          return "5";
        case "appendix":
          return "6";
        default:
          return "1";
      }
    },
    ...(() => {
      const docText = [
        abstractData.indo,
        abstractData.eng,
        proposalData?.bab1?.latarBelakang,
        proposalData?.bab1?.manfaatPenelitian?.teoretis,
        proposalData?.bab1?.manfaatPenelitian?.praktis,
        ...(proposalData?.bab1?.identifikasiMasalah || []),
        ...(proposalData?.bab1?.rumusanMasalah || []),
        ...(proposalData?.bab1?.tujuanPenelitian || []),
        proposalData?.bab2?.landasanTeori,
        proposalData?.bab2?.kerangkaKonseptual,
        ...(proposalData?.bab2?.hipotesis || []),
        proposalData?.bab3?.desainPenelitian,
        proposalData?.bab3?.populasiSampel,
        proposalData?.bab3?.teknikPengumpulanData,
        proposalData?.bab3?.teknikAnalisisData,
        ...(customSubChapters || []).map((c) => c.content),
      ]
        .filter(Boolean)
        .join(" ");

      const rawLatar = proposalData?.bab1?.latarBelakang || "";
      const paras = rawLatar.split(/\n+/).map((p: string) => p.trim()).filter(Boolean);
      const total = paras.length;

      let l1 = rawLatar;
      let l2 = "";
      let l3 = "";

      if (total > 18) {
        const third = Math.ceil(total / 3);
        l1 = paras.slice(0, third).join("\n\n");
        l2 = paras.slice(third, third * 2).join("\n\n");
        l3 = paras.slice(third * 2).join("\n\n");
      } else if (total > 9) {
        const mid = Math.ceil(total / 2);
        l1 = paras.slice(0, mid).join("\n\n");
        l2 = paras.slice(mid).join("\n\n");
      }

      // References
      const seenDois = new Set<string>();
      const seenTitles = new Set<string>();
      const uniqueRefs: (ReferenceItem & { originalIndex: number })[] = [];

      references.forEach((r, idx) => {
        if (!r.selected) return;
        const normDoi = (r.doi || "").trim().toLowerCase().replace(/^https?:\/\/doi\.org\//, "");
        const normTitle = (r.title || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");

        const hasValidDoi = normDoi && normDoi !== "-" && normDoi !== "null";
        if (hasValidDoi && seenDois.has(normDoi)) return;
        if (normTitle && seenTitles.has(normTitle)) return;

        if (hasValidDoi) seenDois.add(normDoi);
        if (normTitle) seenTitles.add(normTitle);

        uniqueRefs.push({ ...r, originalIndex: idx + 1 });
      });

      const isRefCited = (r: ReferenceItem, origIdx: number) => {
        if (docText.includes(`[${origIdx + 1}]`)) return true;

        const cleaned = (r.authors || "").replace(/^(\[\d+\]|\d+[\.\)\t\s]+)/, "").trim();
        const authorsList = cleaned.split(/,\s*(?:and\s+|&\s*)?|\s+and\s+|\s*&\s*/i);
        for (const auth of authorsList) {
          const surname = auth.replace(/et\s+al/i, "").trim().split(/\s+/).pop();
          if (surname && surname.length > 2) {
            const reg = new RegExp(`\\b${surname}\\b`, "i");
            if (reg.test(docText)) return true;
          }
        }
        return false;
      };

      const citedRefs = uniqueRefs.filter((r) => isRefCited(r, r.originalIndex - 1));
      const isNumbered = citationStyle === "IEEE" || citationStyle === "VANCOUVER";

      const sortedCitedRefs = isNumbered
        ? citedRefs
        : [...citedRefs].sort((a, b) => (a.authors || "").localeCompare(b.authors || ""));

      const words = docText.trim() ? docText.trim().split(/\s+/).length : 0;

      return {
        fullDocText: docText,
        latarPage1: l1,
        latarPage2: l2,
        latarPage3: l3,
        citedReferencesList: sortedCitedRefs,
        wordCount: Math.max(850, words),
        charCount: Math.max(5400, docText.length),
      };
    })(),
  };
}
