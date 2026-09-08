import { useState, useEffect, useRef, useCallback } from "react";
import React from "react";
import { useSearchParams } from "next/navigation";
import { api, UserProfile, getToken, TOKEN_KEY, ProposalTemplate } from "@/lib/api-client";
import { notify } from "@/lib/notification";
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
  sanitizeAcademicText,
} from "../types";

export function useProposalEditor(projectId: string) {
  const searchParams = useSearchParams();
  const urlTab = (searchParams?.get("tab") as TabKey) || null;
  const urlSection = searchParams?.get("section") || null;

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>(urlTab || "bab1");

  useEffect(() => {
    if (urlTab) {
      setActiveTab(urlTab);
    }
    if (urlSection) {
      const timer = setTimeout(() => {
        const el = document.getElementById(urlSection);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.style.transition = "all 0.5s ease";
          el.style.backgroundColor = "rgba(16, 185, 129, 0.18)";
          el.style.borderRadius = "6px";
          setTimeout(() => {
            el.style.backgroundColor = "";
          }, 2500);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [urlTab, urlSection]);

  const [project, setProject] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [references, setReferences] = useState<ReferenceItem[]>([]);
  const [proposalData, setProposalData] = useState<any>(null);

  // Template and Logo
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showIdentityModal, setShowIdentityModal] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<ProposalTemplate | null>(null);
  const [variableValues, setVariableValues] = useState<Record<string, any>>({});
  const [showSwitchTemplateModal, setShowSwitchTemplateModal] = useState(false);
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
    kota: "",
    dateDay: "",
    dateMonth: "",
    dateYear: "",
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
  const [customBabTitles, setCustomBabTitles] = useState<Record<number, string>>({
    1: "PENDAHULUAN",
    2: "LANDASAN TEORI & TINJAUAN PUSTAKA",
    3: "METODOLOGI PENELITIAN",
  });
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
          universitas: res.data.profile?.universitas || "Universitas Terakreditasi",
          kota: res.data.profile?.kota || "Bandung",
          year: `${new Date().getFullYear()}`,
        });

        if (res.data.project?.citationStyle) {
          setCitationStyle(res.data.project.citationStyle.toUpperCase());
        }

        if (res.data.project?.template) {
          setActiveTemplate(res.data.project.template);
          if (res.data.project.template.formatType === "DOCX") {
            setSelectedTemplate("GENERAL_ID");
          } else {
            setSelectedTemplate("TELKOM_FIF");
          }
        }
        if (res.data.project?.variableValues) {
          setVariableValues(res.data.project.variableValues);
        }

        // Auto-load custom BAB titles
        const babMap: Record<number, string> = {};
        const sourceOutline = res.data.project?.customOutline;
        if (Array.isArray(sourceOutline) && sourceOutline.some((b: any) => b && (b.babNumber || b.subChapters))) {
          sourceOutline.forEach((b: any) => {
            if (b && b.babNumber && b.title) {
              babMap[b.babNumber] = b.title.toUpperCase();
            }
          });
        } else {
          try {
            const cached = localStorage.getItem(`zetera_custom_outline_${projectId}`);
            if (cached) {
              const parsed = JSON.parse(cached);
              if (Array.isArray(parsed)) {
                parsed.forEach((b: any) => {
                  if (b && b.babNumber && b.title) {
                    babMap[b.babNumber] = b.title.toUpperCase();
                  }
                });
              }
            }
          } catch (e) {}
        }
        if (Object.keys(babMap).length > 0) {
          setCustomBabTitles((prev) => ({ ...prev, ...babMap }));
        }

        // RESTORE SAVED DRAFT FROM DATABASE IF AVAILABLE
        if (res.data.savedDraft) {
          const draft = res.data.savedDraft;
          if (draft.proposalData) {
            setProposalData({
              ...draft.proposalData,
              bab1: {
                ...draft.proposalData?.bab1,
                latarBelakang: sanitizeAcademicText(draft.proposalData?.bab1?.latarBelakang),
              },
              bab2: {
                ...draft.proposalData?.bab2,
                landasanTeori: sanitizeAcademicText(draft.proposalData?.bab2?.landasanTeori),
                penelitianTerdahulu: sanitizeAcademicText(draft.proposalData?.bab2?.penelitianTerdahulu),
                kerangkaKonseptual: sanitizeAcademicText(draft.proposalData?.bab2?.kerangkaKonseptual),
              },
              bab3: {
                ...draft.proposalData?.bab3,
                desainPenelitian: sanitizeAcademicText(draft.proposalData?.bab3?.desainPenelitian),
                populasiSampel: sanitizeAcademicText(draft.proposalData?.bab3?.populasiSampel),
                teknikPengumpulanData: sanitizeAcademicText(draft.proposalData?.bab3?.teknikPengumpulanData),
                teknikAnalisisData: sanitizeAcademicText(draft.proposalData?.bab3?.teknikAnalisisData),
              },
            });
          }
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
          const items: any[] = res.data.outlineItems || [];
          const findNotes = (id: string, keyword: string) => {
            // 1. Exact itemId match (highest priority)
            const byId = items.find((i) => i.itemId === id);
            if (byId) return byId.userNotes?.trim() || "";

            // 2. Keyword match, but EXCLUDE Sistematika Penulisan (its content mentions all sub-chapter names)
            const byKeyword = items.find((i) => {
              if (!i.title) return false;
              const tLower = i.title.toLowerCase();
              const tagLower = (i.tag || "").toLowerCase();
              // Jangan masukkan item Sistematika Penulisan ke keyword search
              if (tLower.includes("sistematika") || tagLower.includes("sistematika")) return false;
              return tLower.includes(keyword.toLowerCase());
            });
            return byKeyword?.userNotes?.trim() || "";
          };

          const notesSistematika = (() => {
            const s = items.find((i) =>
              i.tag === "sistematika_penulisan" ||
              (i.title && i.title.toLowerCase().includes("sistematika"))
            );
            return s?.userNotes?.trim() || "";
          })();

          const parseList = (text: string): string[] => {
            if (!text) return [];
            return text
              .split(/\n+/)
              .map((line) => line.trim().replace(/^(\d+[\.\)\-:]|\*|\-)\s*/, "").trim())
              .filter(Boolean);
          };

          const notesLatar = findNotes("1.1", "latar");
          const notesIdentifikasi = findNotes("1.2", "identifikasi");
          const notesRumusan = findNotes("1.3", "rumusan");
          const notesBatasan = findNotes("1.4", "batasan");
          const notesTujuan = findNotes("1.5", "tujuan") || findNotes("1.4", "tujuan");
          const notesManfaat = findNotes("1.6", "manfaat") || findNotes("1.5", "manfaat");
          const notesTeori = findNotes("2.1", "landasan") || findNotes("2.1", "teori");
          const notesTerdahulu = findNotes("2.2", "terdahulu") || findNotes("2.2", "matriks");
          const notesKerangka = findNotes("2.3", "kerangka");
          const notesHipotesis = findNotes("2.4", "hipotesis");
          const notesDesain = findNotes("3.1", "desain") || findNotes("3.1", "jenis");
          const notesPopulasi = findNotes("3.2", "populasi") || findNotes("3.2", "sampel") || findNotes("3.2", "subjek");
          const notesPengumpulan = findNotes("3.3", "pengumpulan");
          const notesAnalisis = findNotes("3.4", "analisis");

          // Cek apakah user bernavigasi langsung dari Outline (?section=...)
          const isFromOutline = typeof window !== "undefined" && (window.location.search.includes("section=") || window.location.search.includes("tab="));

          setProposalData((prev: any) => ({
            ...(prev || {}),
            bab1: {
              ...(prev?.bab1 || {}),
              latarBelakang: (isFromOutline && notesLatar) ? notesLatar : (prev?.bab1?.latarBelakang || notesLatar || ""),
              ...(notesIdentifikasi && (isFromOutline || !prev?.bab1?.identifikasiMasalah || (Array.isArray(prev.bab1.identifikasiMasalah) && prev.bab1.identifikasiMasalah.length === 0))
                ? { identifikasiMasalah: notesIdentifikasi }
                : {}),
              ...(notesRumusan && (isFromOutline || !prev?.bab1?.rumusanMasalah || (Array.isArray(prev.bab1.rumusanMasalah) && prev.bab1.rumusanMasalah.length === 0))
                ? { rumusanMasalah: notesRumusan }
                : {}),
              ...(notesBatasan && (isFromOutline || !prev?.bab1?.batasanMasalah || (Array.isArray(prev.bab1.batasanMasalah) && prev.bab1.batasanMasalah.length === 0))
                ? { batasanMasalah: notesBatasan }
                : {}),
              ...(notesTujuan && (isFromOutline || !prev?.bab1?.tujuanPenelitian || (Array.isArray(prev.bab1.tujuanPenelitian) && prev.bab1.tujuanPenelitian.length === 0))
                ? { tujuanPenelitian: notesTujuan }
                : {}),
              ...(notesManfaat && (isFromOutline || !prev?.bab1?.manfaatPenelitian?.teoretis)
                ? {
                    manfaatPenelitian: {
                      teoretis: notesManfaat,
                      praktis: prev?.bab1?.manfaatPenelitian?.praktis || "Hasil penelitian dapat menjadi masukan praktis bagi akademisi dan praktisi bidang terkait.",
                    },
                  }
                : {}),
              // ✅ Sistematika Penulisan disimpan ke field tersendiri (BUKAN latarBelakang!)
              ...(notesSistematika && (isFromOutline || !prev?.bab1?.sistematikaPenulisan)
                ? { sistematikaPenulisan: notesSistematika }
                : {}),
            },
            bab2: {
              ...(prev?.bab2 || {}),
              landasanTeori: (isFromOutline && notesTeori) ? notesTeori : (prev?.bab2?.landasanTeori || notesTeori || ""),
              penelitianTerdahulu: (isFromOutline && notesTerdahulu) ? notesTerdahulu : (prev?.bab2?.penelitianTerdahulu || notesTerdahulu || ""),
              kerangkaKonseptual: (isFromOutline && notesKerangka) ? notesKerangka : (prev?.bab2?.kerangkaKonseptual || notesKerangka || ""),
              ...(notesHipotesis && (isFromOutline || !prev?.bab2?.hipotesis || prev.bab2.hipotesis.length === 0)
                ? { hipotesis: parseList(notesHipotesis) }
                : {}),
            },
            bab3: {
              ...(prev?.bab3 || {}),
              desainPenelitian: (isFromOutline && notesDesain) ? notesDesain : (prev?.bab3?.desainPenelitian || notesDesain || ""),
              populasiSampel: (isFromOutline && notesPopulasi) ? notesPopulasi : (prev?.bab3?.populasiSampel || notesPopulasi || ""),
              teknikPengumpulanData: (isFromOutline && notesPengumpulan) ? notesPengumpulan : (prev?.bab3?.teknikPengumpulanData || notesPengumpulan || ""),
              teknikAnalisisData: (isFromOutline && notesAnalisis) ? notesAnalisis : (prev?.bab3?.teknikAnalisisData || notesAnalisis || ""),
            },
          }));

          // Sinkronkan SEMUA sub-bab kustom atau sub-bab lain yang tidak ada di standar bawaan
          const standardIds = new Set(["1.1", "1.2", "1.3", "1.4", "1.5", "1.6", "2.1", "2.2", "2.3", "2.4", "3.1", "3.2", "3.3", "3.4"]);
          const extraItems = items.filter((i) => {
            if (standardIds.has(i.itemId)) return false;
            const tLower = (i.title || "").toLowerCase();
            const tagLower = (i.tag || "").toLowerCase();
            if (tLower.includes("manfaat") || tagLower.includes("manfaat")) return false;
            if (tLower.includes("tujuan") || tagLower.includes("tujuan")) return false;
            if (tLower.includes("batasan") || tagLower.includes("batasan")) return false;
            // ✅ KRITIS: Sistematika Penulisan dihandle tersendiri via sistematikaPenulisan field — jangan masukkan ke extraItems
            if (tLower.includes("sistematika") || tagLower.includes("sistematika") || i.tag === "sistematika_penulisan") return false;
            return true;
          });
          if (extraItems.length > 0) {
            setCustomSubChapters((prevSubs) => {
              const newSubs: CustomSubChapterItem[] = [...prevSubs];
              extraItems.forEach((item) => {
                const existingIdx = newSubs.findIndex((s) => s.id === item.itemId);
                if (existingIdx === -1) {
                  newSubs.push({
                    id: item.itemId,
                    chapter: item.bab === 1 ? "bab1" : item.bab === 2 ? "bab2" : "bab3",
                    level: "subbab",
                    indentCm: 0,
                    title: `${item.itemId} ${item.title}`,
                    content: item.userNotes || "",
                  });
                } else {
                  // Jika ada catatan baru dari outline yang belum tersimpan di custom sub-chapter, sinkronkan
                  if (item.userNotes && (!newSubs[existingIdx].content || newSubs[existingIdx].content.trim().length === 0)) {
                    newSubs[existingIdx] = {
                      ...newSubs[existingIdx],
                      title: `${item.itemId} ${item.title}`,
                      content: item.userNotes,
                    };
                  }
                }
              });
              return newSubs;
            });
          }
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
      let currentProposalData = proposalData ? { ...proposalData } : {};

      // Sync direct contentEditable paper edits from DOM if in browser
      if (typeof document !== "undefined") {
        const extractTextAndMedia = (containerId: string): string[] => {
          const el = document.getElementById(containerId);
          if (!el) return [];
          const items: string[] = [];
          const childNodes = Array.from(el.querySelectorAll("p, table, figure"));
          if (childNodes.length > 0) {
            childNodes.forEach((node) => {
              if (node.tagName.toLowerCase() === "table") {
                items.push(node.outerHTML);
              } else if (node.tagName.toLowerCase() === "figure") {
                const img = node.querySelector("img");
                const cap = node.querySelector("figcaption")?.textContent?.trim() || "";
                if (img) items.push(`![${cap}](${img.getAttribute("src") || ""})`);
              } else {
                const txt = node.textContent?.trim();
                // Exclude static headers from extracted paragraph body
                if (
                  txt &&
                  !/^BAB\s+[IVX0-9]+/i.test(txt) &&
                  !/^PENDAHULUAN/i.test(txt) &&
                  !/^1\.1\s+Latar\s+Belakang/i.test(txt) &&
                  !/^TINJAUAN\s+PUSTAKA/i.test(txt) &&
                  !/^METODOLOGI/i.test(txt)
                ) {
                  items.push(txt);
                }
              }
            });
          }
          return items;
        };

        const latarP1 = extractTextAndMedia("section_bab1");
        const latarP2 = extractTextAndMedia("section_bab1_p2");
        const latarP3 = extractTextAndMedia("section_bab1_p3");
        const combinedLatar = [...latarP1, ...latarP2, ...latarP3].join("\n\n").trim();
        if (combinedLatar && combinedLatar.length > 30) {
          currentProposalData = {
            ...currentProposalData,
            bab1: {
              ...currentProposalData?.bab1,
              latarBelakang: combinedLatar,
            },
          };
          setProposalData(currentProposalData);
        }
      }

      const draftPayload = {
        proposalData: currentProposalData,
        approvalData,
        abstractData,
        appendixData,
        customSubChapters,
        references,
        marginPreset,
        pageNumberPos,
        selectedTemplate,
        variableValues,
        templateId: activeTemplate?.id,
        coverData,
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
    variableValues,
    activeTemplate,
    coverData,
  ]);

  const handleSaveVariableValues = (newValues: Record<string, any>) => {
    setVariableValues((prev) => ({ ...prev, ...newValues }));
    triggerAutoSave();
  };

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
      notify.success("Unduhan Word Dimulai", "Dokumen Word proposal Anda sedang diunduh.");
    } catch (err: any) {
      notify.error("Gagal Mengunduh Word", err.message || "Terjadi kesalahan server");
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
      notify.success("Unduhan LaTeX Dimulai", "Paket ZIP LaTeX Overleaf siap diekstrak.");
    } catch (err: any) {
      notify.error("Gagal Mengunduh LaTeX", err.message || "Terjadi kesalahan server");
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

  const handleReorderReferences = useCallback(
    (newOrder: ReferenceItem[]) => {
      setReferences(newOrder);
      triggerAutoSave();
    },
    [triggerAutoSave]
  );

  const handleJumpToCitationInText = (
    refIndex: number,
    authors?: string,
    doi?: string,
    e?: React.MouseEvent,
    seqIndex?: number
  ) => {
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

    const selectors = [
      `[data-cite-ref="${refIndex}"]`,
      seqIndex ? `[data-cite-ref="${seqIndex}"]` : "",
      firstAuthorWord ? `[data-cite-auth*="${firstAuthorWord}"]` : "",
    ]
      .filter(Boolean)
      .join(", ");

    let matchingElements = Array.from(
      document.querySelectorAll(selectors)
    ) as HTMLElement[];

    // Jika belum ada di viewport (misal user sedang di tab references saat focusActiveChapter), alihkan tab ke bab1
    if (matchingElements.length === 0 && activeTab !== "bab1") {
      setActiveTab("bab1");
      setTimeout(() => {
        const reCheck = Array.from(document.querySelectorAll(selectors)) as HTMLElement[];
        if (reCheck.length > 0) {
          reCheck[0].scrollIntoView({ behavior: "smooth", block: "center" });
          reCheck.forEach((el) => {
            el.style.transition = "all 0.3s ease";
            el.style.backgroundColor = "#FEF08A";
            el.style.boxShadow = "0 0 0 5px #FDE047";
            el.style.borderRadius = "4px";
          });
          setTimeout(() => {
            reCheck.forEach((el) => {
              el.style.backgroundColor = "transparent";
              el.style.boxShadow = "none";
            });
          }, 2500);
        } else {
          const bab1 = document.getElementById("section_bab1");
          if (bab1) bab1.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 150);
      return;
    }

    if (matchingElements.length > 0) {
      matchingElements[0].scrollIntoView({ behavior: "smooth", block: "center" });
      matchingElements.forEach((el) => {
        el.style.transition = "all 0.3s ease";
        el.style.backgroundColor = "#FEF08A";
        el.style.boxShadow = "0 0 0 5px #FDE047";
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

      const cleanRevisedContent = sanitizeAcademicText(res?.revisedContent);
      const replyText =
        res?.explanation ||
        cleanRevisedContent ||
        "Maaf, saya tidak dapat merumuskan respons untuk saat ini.";

      setAiChatMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: replyText,
          time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          revisedContent: cleanRevisedContent || undefined,
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
    activeTemplate,
    setActiveTemplate,
    variableValues,
    setVariableValues,
    showSwitchTemplateModal,
    setShowSwitchTemplateModal,
    handleSaveVariableValues,
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
    customBabTitles,
    setCustomBabTitles,
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
    handleReorderReferences,
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
      const normalizeList = (val: any): string[] => {
        if (!val) return [];
        if (Array.isArray(val)) return val.filter((x): x is string => typeof x === "string");
        if (typeof val === "string") return [val];
        if (typeof val === "object") {
          return Object.values(val).filter((x): x is string => typeof x === "string");
        }
        return [];
      };

      const docText = [
        abstractData.indo,
        abstractData.eng,
        proposalData?.bab1?.latarBelakang,
        proposalData?.bab1?.manfaatPenelitian?.teoretis,
        proposalData?.bab1?.manfaatPenelitian?.praktis,
        ...normalizeList(proposalData?.bab1?.identifikasiMasalah),
        ...normalizeList(proposalData?.bab1?.rumusanMasalah),
        ...normalizeList(proposalData?.bab1?.tujuanPenelitian),
        proposalData?.bab2?.landasanTeori,
        proposalData?.bab2?.kerangkaKonseptual,
        ...normalizeList(proposalData?.bab2?.hipotesis),
        proposalData?.bab3?.desainPenelitian,
        proposalData?.bab3?.populasiSampel,
        proposalData?.bab3?.teknikPengumpulanData,
        proposalData?.bab3?.teknikAnalisisData,
        ...(customSubChapters || []).map((c) => c?.content || ""),
      ]
        .filter(Boolean)
        .join(" ");

      let rawLatar = sanitizeAcademicText(proposalData?.bab1?.latarBelakang || "");

      // Auto-heal orphaned table tags if previously cut or malformed
      if (rawLatar.includes("<td") && !rawLatar.includes("<table")) {
        rawLatar = `<table style="width: 100%; border-collapse: collapse; margin: 16px 0;" data-caption="Tabel"><tbody>\n<tr>\n${rawLatar}\n</tbody></table>`;
      }

      // Split into atomic academic blocks (paragraphs, full HTML tables, full SVGs, code blocks)
      const splitIntoAcademicBlocks = (text: string): string[] => {
        if (!text) return [];
        const result: string[] = [];
        // Match complete <table...>...</table> or <svg...>...</svg> or ```...```
        const blockRegex = /(<table[\s\S]*?<\/table>|<svg[\s\S]*?<\/svg>|```[\s\S]*?```)/gi;
        let lastIdx = 0;
        let m;
        while ((m = blockRegex.exec(text)) !== null) {
          const before = text.slice(lastIdx, m.index).trim();
          if (before) {
            const paras = before.split(/\n\s*\n+/).map((p) => p.trim()).filter(Boolean);
            result.push(...paras);
          }
          result.push(m[0].trim());
          lastIdx = blockRegex.lastIndex;
        }
        const remaining = text.slice(lastIdx).trim();
        if (remaining) {
          const paras = remaining.split(/\n\s*\n+/).map((p) => p.trim()).filter(Boolean);
          result.push(...paras);
        }
        return result.filter(Boolean);
      };

      const blocks = splitIntoAcademicBlocks(rawLatar);
      const totalBlocks = blocks.length;

      let l1 = rawLatar;
      let l2 = "";
      let l3 = "";

      // Distribute whole blocks across pages without ever cutting inside a table or block
      if (totalBlocks > 8 || rawLatar.length > 3200) {
        let currentLen = 0;
        const page1Blocks: string[] = [];
        const page2Blocks: string[] = [];
        const page3Blocks: string[] = [];
        const targetPerPage = Math.max(1400, Math.ceil(rawLatar.length / 3));

        for (const b of blocks) {
          const bLen = b.length;
          if (currentLen + bLen <= targetPerPage || page1Blocks.length === 0) {
            page1Blocks.push(b);
            currentLen += bLen;
          } else if (page2Blocks.length === 0 || (currentLen + bLen <= targetPerPage * 2 && page3Blocks.length === 0)) {
            page2Blocks.push(b);
            currentLen += bLen;
          } else {
            page3Blocks.push(b);
          }
        }

        l1 = page1Blocks.join("\n\n");
        l2 = page2Blocks.join("\n\n");
        l3 = page3Blocks.join("\n\n");
      } else if (totalBlocks > 4 || rawLatar.length > 1600) {
        let currentLen = 0;
        const page1Blocks: string[] = [];
        const page2Blocks: string[] = [];
        const targetPerPage = Math.max(1200, Math.ceil(rawLatar.length / 2));

        for (const b of blocks) {
          const bLen = b.length;
          if (currentLen + bLen <= targetPerPage || page1Blocks.length === 0) {
            page1Blocks.push(b);
            currentLen += bLen;
          } else {
            page2Blocks.push(b);
            currentLen += bLen;
          }
        }

        l1 = page1Blocks.join("\n\n");
        l2 = page2Blocks.join("\n\n");
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
            try {
              const escapedSurname = surname.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
              const reg = new RegExp(`\\b${escapedSurname}\\b`, "i");
              if (reg.test(docText)) return true;
            } catch (_) {}
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
