"use client";

import React, { useEffect, useState, use, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  Sparkles,
  Download,
  FileText,
  BookOpen,
  Layers,
  GraduationCap,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Printer,
  Table as TableIcon,
  RefreshCw,
  Award,
  Calendar,
  Building,
  User as UserIcon,
  Plus,
  Trash2,
  CheckSquare,
  Square,
  Settings2,
  FileCode,
  FolderArchive,
  Info,
  X,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Save,
  PlusCircle,
  FileEdit,
  Eye,
  Copy,
  Check,
  Type,
  Quote,
  Network,
  SlidersHorizontal,
  LayoutGrid,
  Zap,
  EyeOff,
  Edit3,
  ListTree,
  FilePlus,
  ArrowRight,
  Share2,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  MessageSquare,
  Send,
  Paperclip,
  Wand2,
  Search,
  CheckCheck,
  FileDown,
  ShieldAlert,
  ChevronDown,
  MoreVertical,
  Baseline,
  Highlighter,
  Indent,
  Outdent,
  Link2,
  Image as ImageIcon,
  Bot,
  HelpCircle,
} from "lucide-react";
import { api, UserProfile, getToken, TOKEN_KEY } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

type TabKey =
  | "cover"
  | "approval"
  | "abstract"
  | "bab1"
  | "bab2"
  | "matrix"
  | "bab3"
  | "references"
  | "appendix"
  | "latex";

type TemplateType = "TELKOM_FIF" | "GENERAL_ID";

interface ReferenceItem {
  id: string;
  title: string;
  authors: string;
  year: number;
  publication: string;
  doi: string;
  selected: boolean;
  keyFindings?: string;
  mappedVariables?: string;
  methodology?: string;
}

export interface CustomSubChapterItem {
  id: string;
  chapter: "bab1" | "bab2" | "bab3";
  level: string;
  prefix?: string;
  indentCm: number;
  title: string;
  content: string;
  hidden?: boolean;
}

export const ACADEMIC_NUMBERING_RULES = [
  { level: "subbab", name: "Nomor untuk subbab", format: "A., B., C., dst. (atau 1.X)", indentCm: 0, indentLabel: "0 cm", color: "#fef08a", textColor: "#854d0e", example: "A. Kajian Pustaka" },
  { level: "anak_subbab", name: "Nomor untuk anak subbab", format: "1., 2., 3., dst.", indentCm: 0.5, indentLabel: "0.5 cm", color: "#bbf7d0", textColor: "#166534", example: "1. Landasan Teori" },
  { level: "anak_subbab_1", name: "Nomor untuk anak subbab pertama", format: "a., b., c., dst.", indentCm: 1.0, indentLabel: "1 cm", color: "#a5f3fc", textColor: "#0e7490", example: "a. Definisi Variabel" },
  { level: "anak_subbab_2", name: "Nomor untuk anak subbab kedua", format: "1)., 2)., 3)., dst.", indentCm: 1.5, indentLabel: "1.5 cm", color: "#fbcfe8", textColor: "#9d174d", example: "1). Dimensi Indikator" },
  { level: "anak_subbab_3", name: "Nomor untuk anak subbab ketiga", format: "a)., b)., c)., dst.", indentCm: 2.0, indentLabel: "2 cm", color: "#fca5a5", textColor: "#991b1b", example: "a). Parameter Pengujian" },
  { level: "anak_subbab_4", name: "Nomor untuk anak subbab keempat", format: "(1)., (2)., (3)., dst.", indentCm: 2.5, indentLabel: "2.5 cm", color: "#5eead4", textColor: "#115e59", example: "(1). Skala Likert 5 Poin" },
  { level: "anak_subbab_5", name: "Nomor untuk anak subbab kelima", format: "(a)., (b)., (c)., dst.", indentCm: 3.0, indentLabel: "3 cm", color: "#cbd5e1", textColor: "#334155", example: "(a). Butir Kuesioner 1" },
];

function A4Sheet({
  pageNumber,
  pageNumberPos,
  marginPreset,
  sheetId,
  isIncludedInPrint = true,
  children,
}: {
  pageNumber?: string | null;
  pageNumberPos: string;
  marginPreset: "4333" | "4433";
  sheetId?: string;
  isIncludedInPrint?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      id={sheetId}
      className={`a4-print-sheet ${marginPreset === "4433" ? "a4-print-sheet-4433" : ""} ${!isIncludedInPrint ? "sheet-hidden-for-print" : ""
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

export default function ProposalPage() {
  const params = useParams();
  const projectId = (params?.id as string) || "";
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("bab1");

  const [project, setProject] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [references, setReferences] = useState<ReferenceItem[]>([]);
  const [proposalData, setProposalData] = useState<any>(null);

  // Template Modal state
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showIdentityModal, setShowIdentityModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>("TELKOM_FIF");
  const [logoLoadError, setLogoLoadError] = useState(false);

  // ── Data Cover & Identitas Mahasiswa/Kampus ──
  const [coverData, setCoverData] = useState({
    title: "",
    author: "",
    nim: "",
    prodi: "",
    fakultas: "",
    universitas: "",
    kota: "Bandung",
    year: `${new Date().getFullYear()}`,
  });

  // ── Lembar Persetujuan State (FIF LaTeX Standard) ──
  const [approvalData, setApprovalData] = useState({
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

  // ── Abstrak & Keywords State ──
  const [abstractData, setAbstractData] = useState({
    indo: "",
    keywordsIndo: "",
    eng: "",
    keywordsEng: "",
  });

  // ── Gaya Sitasi Proyek ──
  const [citationStyle, setCitationStyle] = useState<string>("IEEE");

  // ── Lampiran State ──
  const [appendixData, setAppendixData] = useState({
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

  // ── WORD-LIKE TOP RIBBON & LIVE EDITOR STATE ──
  const [isEditMode, setIsEditMode] = useState(true);
  const [saveDraftStatus, setSaveDraftStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [lastSavedTime, setLastSavedTime] = useState<string | null>("Baru saja");
  const [activeAlign, setActiveAlign] = useState<"left" | "center" | "right" | "justify">("justify");
  const [paragraphStyle, setParagraphStyle] = useState<"indent" | "block">("indent");

  // ── SMART INDONESIAN TYPO & SPELL CHECKER ENGINE ──
  const [showTypoTooltip, setShowTypoTooltip] = useState<{
    word: string;
    suggestion: string;
    reason: string;
    position: { x: number; y: number };
  } | null>(null);

  const INDONESIAN_TYPO_DICTIONARY: Record<string, { suggestion: string; reason: string }> = {
    menatal: { suggestion: "Mental", reason: "Kata baku untuk kondisi psikologis/kejiwaan adalah 'mental'" },
    datasbae: { suggestion: "Database", reason: "Typo ejaan dari basis data / database" },
    analisa: { suggestion: "Analisis", reason: "Bentuk baku KBBI adalah 'analisis' (bukan analisa)" },
    praktek: { suggestion: "Praktik", reason: "Bentuk baku KBBI adalah 'praktik' (bukan praktek)" },
    merubah: { suggestion: "Mengubah", reason: "Kata dasar 'ubah' berimbuhan me- menjadi 'mengubah'" },
    kuantitative: { suggestion: "Kuantitatif", reason: "Ejaan bahasa Indonesia baku adalah 'kuantitatif'" },
    kualitative: { suggestion: "Kualitatif", reason: "Ejaan bahasa Indonesia baku adalah 'kualitatif'" },
    metodelogi: { suggestion: "Metodologi", reason: "Bentuk baku KBBI adalah 'metodologi'" },
    hipotesa: { suggestion: "Hipotesis", reason: "Bentuk baku KBBI adalah 'hipotesis'" },
    kuisioner: { suggestion: "Kuesioner", reason: "Bentuk baku KBBI adalah 'kuesioner'" },
    efektifitas: { suggestion: "Efektivitas", reason: "Bentuk baku berakhiran -itas adalah 'efektivitas'" },
    aktifitas: { suggestion: "Aktivitas", reason: "Bentuk baku KBBI adalah 'aktivitas'" },
    resiko: { suggestion: "Risiko", reason: "Bentuk baku KBBI adalah 'risiko' (bukan resiko)" },
    standarisasi: { suggestion: "Standardisasi", reason: "Bentuk baku serapan adalah 'standardisasi'" },
    obyek: { suggestion: "Objek", reason: "Bentuk baku KBBI adalah 'objek' dengan huruf 'j'" },
    subyek: { suggestion: "Subjek", reason: "Bentuk baku KBBI adalah 'subjek' dengan huruf 'j'" },
    jadual: { suggestion: "Jadwal", reason: "Bentuk baku KBBI adalah 'jadwal'" },
    theori: { suggestion: "Teori", reason: "Bentuk baku serapan adalah 'teori'" },
    variable: { suggestion: "Variabel", reason: "Bentuk baku serapan adalah 'variabel'" },
  };

  // ── SMART 1-CLICK SUB-CHAPTER MODAL STATE ──
  const [addSubModalTab, setAddSubModalTab] = useState<"presets" | "ai" | "custom">("presets");
  const [presetFilterChapter, setPresetFilterChapter] = useState<"all" | "bab1" | "bab2" | "bab3">("all");
  const [isAiSuggestingSubs, setIsAiSuggestingSubs] = useState(false);
  const [aiSuggestedSubsList, setAiSuggestedSubsList] = useState<
    { title: string; desc: string; content: string; chapter: "bab1" | "bab2" | "bab3" }[]
  >([]);
  const [selectedFont, setSelectedFont] = useState("Times New Roman");
  const [selectedFontSize, setSelectedFontSize] = useState(12);
  const [selectedStyle, setSelectedStyle] = useState("Normal Text");
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showPdfExportModal, setShowPdfExportModal] = useState(false);
  const [pdfPageSelection, setPdfPageSelection] = useState<{
    cover: boolean;
    approval: boolean;
    abstract: boolean;
    bab1: boolean;
    bab2: boolean;
    bab3: boolean;
    references: boolean;
    appendix: boolean;
  }>({
    cover: true,
    approval: true,
    abstract: true,
    bab1: true,
    bab2: true,
    bab3: true,
    references: true,
    appendix: true,
  });

  // ── 3-COLUMN STUDIO LAYOUT TOGGLES ──
  const [showOutlineSidebar, setShowOutlineSidebar] = useState(true);
  const [showAiAssistant, setShowAiAssistant] = useState(true);

  // ── AI ASSISTANT COMPANION PANEL STATE ──
  const [aiActiveTab, setAiActiveTab] = useState<"chat" | "tulis" | "tinjau" | "riset">("chat");
  const [aiInputPrompt, setAiInputPrompt] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiChatMessages, setAiChatMessages] = useState<
    {
      sender: "ai" | "user";
      text: string;
      time: string;
      revisedContent?: string;
      explanation?: string;
      usedCitations?: string[];
    }[]
  >([
    {
      sender: "ai",
      text: "Hai! Saya asisten riset AI Zetera siap membantu penulisan skripsi & proposal Anda. Anda dapat meminta saya untuk menyusun latar belakang, membuat kerangka pemikiran, atau mencari referensi jurnal relevan.",
      time: "10:25 AM",
    },
  ]);

  // ── LEFT STRUCTURE & HIERARCHY OUTLINE SIDEBAR STATE ──
  const [structureChapter, setStructureChapter] = useState<"bab1" | "bab2" | "bab3">("bab1");
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [editSubTitle, setEditSubTitle] = useState("");
  const [editSubPrefix, setEditSubPrefix] = useState("");
  const [editSubLevel, setEditSubLevel] = useState("subbab");
  const [editSubContent, setEditSubContent] = useState("");
  const [showAddSubChapterModal, setShowAddSubChapterModal] = useState(false);
  const [newSubChapterLevel, setNewSubChapterLevel] = useState<string>("subbab");
  const [newSubChapterPrefix, setNewSubChapterPrefix] = useState<string>("");
  const [newSubChapterTitle, setNewSubChapterTitle] = useState("");
  const [newSubChapterContent, setNewSubChapterContent] = useState("");
  const [customSubChapters, setCustomSubChapters] = useState<CustomSubChapterItem[]>([]);
  const [showCitationPickerModal, setShowCitationPickerModal] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // New Reference manual input state
  const [newRefTitle, setNewRefTitle] = useState("");
  const [newRefAuthors, setNewRefAuthors] = useState("");
  const [newRefYear, setNewRefYear] = useState(`${new Date().getFullYear()}`);
  const [newRefPub, setNewRefPub] = useState("");
  const [newRefDoi, setNewRefDoi] = useState("");
  const [showAddRefForm, setShowAddRefForm] = useState(false);

  // Autosave Timer Ref
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load Initial Data with Database Draft Restore
  const loadProposalData = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.proposal.get(projectId);
      if (res.success && res.data) {
        setProject(res.data.project);
        setProfile(res.data.profile);

        // 1. Initial Reference List
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

        // 2. Inisialisasi coverData dari project & profile
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

        // 3. RESTORE SAVED DRAFT FROM DATABASE IF AVAILABLE
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

        // 4. Sinkronkan draf sub-bab dari Outline Blueprint jika proposalData belum diisi
        if (res.data.outlineItems && res.data.outlineItems.length > 0) {
          const findNotes = (id: string) => {
            return (res.data.outlineItems || []).find((i: any) => i.itemId === id)?.userNotes?.trim() || "";
          };

          const notes1_1 = findNotes("1.1");
          const notes1_2 = findNotes("1.2");
          const notes1_3 = findNotes("1.3");
          const notes1_4 = findNotes("1.4");
          const notes2_1 = findNotes("2.1");
          const notes2_3 = findNotes("2.3");
          const notes3_1 = findNotes("3.1");
          const notes3_2 = findNotes("3.2");
          const notes3_3 = findNotes("3.3");
          const notes3_4 = findNotes("3.4");

          setProposalData((prev: any) => ({
            ...prev,
            bab1: {
              ...(prev?.bab1 || {}),
              ...(notes1_1 && !prev?.bab1?.latarBelakang ? { latarBelakang: notes1_1 } : {}),
              ...(notes1_2 && (!prev?.bab1?.rumusanMasalah || prev?.bab1?.rumusanMasalah.length === 0)
                ? { rumusanMasalah: notes1_2.split(/\n+/).filter(Boolean) }
                : {}),
              ...(notes1_3 && (!prev?.bab1?.tujuanPenelitian || prev?.bab1?.tujuanPenelitian.length === 0)
                ? { tujuanPenelitian: notes1_3.split(/\n+/).filter(Boolean) }
                : {}),
              ...(notes1_4 && !prev?.bab1?.manfaatPenelitian?.teoretis
                ? { manfaatPenelitian: { ...(prev?.bab1?.manfaatPenelitian || {}), teoretis: notes1_4 } }
                : {}),
            },
            bab2: {
              ...(prev?.bab2 || {}),
              ...(notes2_1 && !prev?.bab2?.landasanTeori ? { landasanTeori: notes2_1 } : {}),
              ...(notes2_3 && !prev?.bab2?.kerangkaKonseptual ? { kerangkaKonseptual: notes2_3 } : {}),
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
  };

  useEffect(() => {
    loadProposalData();
  }, [projectId]);

  // Handle Save Directly to Database
  const handleSaveDraft = async () => {
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

      // 1. Save to Local Storage for offline cache
      if (typeof window !== "undefined") {
        localStorage.setItem(
          `zetera_proposal_draft_${projectId}`,
          JSON.stringify(draftPayload)
        );
      }

      // 2. Save directly to MySQL Database via API
      const res = await api.proposal.save(projectId, draftPayload);
      if (res.success) {
        setSaveDraftStatus("saved");
        const d = new Date();
        setLastSavedTime(
          d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
        );
        setTimeout(() => setSaveDraftStatus("idle"), 3000);
      } else {
        setSaveDraftStatus("idle");
      }
    } catch (e) {
      console.error("Error saving proposal to database:", e);
      setSaveDraftStatus("idle");
    }
  };

  // Debounced auto-save when editing
  const triggerAutoSave = () => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      handleSaveDraft();
    }, 2500);
  };

  // ── Bidirectional Citation Jumping (Kalimat Naskah ⇄ Daftar Pustaka) ──
  const handleJumpToRef = (refIndexOrId: number | string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const targetEl =
      document.getElementById(`ref-${refIndexOrId}`) ||
      document.getElementById(`ref_${refIndexOrId}`);

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

    // Temukan semua kalimat/elemen yang mengutip rujukan yang sama di seluruh naskah
    const matchingElements = Array.from(
      document.querySelectorAll(
        `[data-cite-ref="${refIndex}"], [data-cite-auth*="${firstAuthorWord || "___"}"]`
      )
    ) as HTMLElement[];

    if (matchingElements.length > 0) {
      // Gulir layar ke kemunculan pertama
      matchingElements[0].scrollIntoView({ behavior: "smooth", block: "center" });

      // Sorot SEMUA kalimat yang mengutip rujukan yang sama
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

  // ── Render Text With Interactive Clickable Citations ──
  const renderTextWithClickableCitations = (text: string) => {
    if (!text) return null;

    // Matches [1], [2], etc., or (Author et al., 2024), (Author, 2024)
    const citationRegex = /(\[\d+\]|\([^)]*?\b(?:19|20)\d{2}[a-z]?\))/g;
    const parts = text.split(citationRegex);

    return parts.map((part, pIdx) => {
      if (!part) return null;

      // Match [N] (IEEE/Vancouver)
      const matchNum = part.match(/^\[(\d+)\]$/);
      if (matchNum) {
        const refNum = parseInt(matchNum[1], 10);
        return (
          <span
            key={pIdx}
            id={`cite-ref-${refNum}`}
            data-cite-ref={refNum}
            onClick={(e) => handleJumpToRef(refNum, e)}
            style={{
              cursor: "pointer",
              color: "inherit",
              fontWeight: "inherit",
              background: "transparent",
              textDecoration: "none",
              transition: "all 0.15s ease",
              userSelect: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.textDecoration = "underline";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.textDecoration = "none";
            }}
            title={`Klik untuk melompat ke rujukan [${refNum}] di DAFTAR PUSTAKA`}
          >
            {part}
          </span>
        );
      }

      // Match (Author, Year) or (Author et al., Year)
      const matchAuthorYear = part.match(/^\(([^)]+?),\s*(\d{4}[a-z]?)\)$/);
      if (matchAuthorYear) {
        const authQuery = matchAuthorYear[1].trim().toLowerCase();
        const yrQuery = matchAuthorYear[2].trim();
        const firstWord = authQuery.split(/\s+/)[0];

        const matchedIdx = references.findIndex((r) => {
          const rAuth = (r.authors || "").toLowerCase();
          const rYr = `${r.year}`;
          return rYr === yrQuery && (rAuth.includes(firstWord) || authQuery.includes(rAuth.split(",")[0]?.split(" ")[0] || ""));
        });

        const targetRefNum = matchedIdx >= 0 ? matchedIdx + 1 : 1;

        return (
          <span
            key={pIdx}
            id={`cite-ref-${targetRefNum}`}
            data-cite-ref={targetRefNum}
            data-cite-auth={firstWord}
            onClick={(e) => handleJumpToRef(targetRefNum, e)}
            style={{
              cursor: "pointer",
              color: "inherit",
              fontWeight: "inherit",
              background: "transparent",
              textDecoration: "none",
              transition: "all 0.15s ease",
              userSelect: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.textDecoration = "underline";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.textDecoration = "none";
            }}
            title={`Klik untuk melompat ke rujukan ${part} di DAFTAR PUSTAKA`}
          >
            {part}
          </span>
        );
      }

      return <span key={pIdx}>{part}</span>;
    });
  };

  // ── Render Paragraf Akademik Konsisten (Menjorok Rapat vs Rata Blok Berjarak) ──
  const renderAcademicParagraphs = (rawText?: string, placeholder?: string) => {
    if (!rawText || !rawText.trim()) {
      if (placeholder) {
        return (
          <p
            style={{
              textIndent: paragraphStyle === "indent" ? "1.27cm" : "0",
              marginBottom: paragraphStyle === "indent" ? "0px" : "14px",
              lineHeight: 1.8,
              color: isEditMode ? "#94a3b8" : "inherit",
              minHeight: "1.5em",
            }}
          >
            {placeholder}
          </p>
        );
      }
      return <p style={{ minHeight: "1.5em", margin: 0 }}></p>;
    }

    const paras = rawText
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean);

    if (paras.length === 0) return <p style={{ minHeight: "1.5em", margin: 0 }}></p>;

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: paragraphStyle === "indent" ? "0px" : "14px", marginBottom: 14 }}>
        {paras.map((para, idx) => (
          <p
            key={idx}
            style={{
              textIndent: paragraphStyle === "indent" ? "1.27cm" : "0",
              margin: 0,
              lineHeight: 1.8,
              textAlign: "justify",
            }}
          >
            {renderTextWithClickableCitations(para)}
          </p>
        ))}
      </div>
    );
  };

  // Handle Toggle Reference
  const handleToggleRef = (id: string) => {
    setReferences((prev) =>
      prev.map((r) => (r.id === id ? { ...r, selected: !r.selected } : r))
    );
    triggerAutoSave();
  };

  // Handle Delete Reference from proposal list
  const handleDeleteRef = (id: string) => {
    setReferences((prev) => prev.filter((r) => r.id !== id));
    triggerAutoSave();
  };

  // Handle Add New Reference
  const handleAddCustomRef = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRefTitle.trim()) return;

    const newEntry: ReferenceItem = {
      id: `custom_${Date.now()}`,
      title: newRefTitle.trim(),
      authors: newRefAuthors.trim() || "Penulis",
      year: parseInt(newRefYear, 10) || new Date().getFullYear(),
      publication: newRefPub.trim() || "Jurnal Akademik",
      doi: newRefDoi.trim() || "-",
      selected: true,
      keyFindings: "Referensi tambahan mahasiswa untuk pengayaan naskah proposal.",
      mappedVariables: "Variabel Terkait",
      methodology: "Studi Literatur / Empiris",
    };

    setReferences((prev) => [newEntry, ...prev]);
    setNewRefTitle("");
    setNewRefAuthors("");
    setNewRefPub("");
    setNewRefDoi("");
    setShowAddRefForm(false);
    triggerAutoSave();
  };

  // Handle AI Full Generation
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
        // Save immediately to database
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

  // ── Helper to resolve full image URLs ──
  const getFullImageUrl = (url?: string | null) => {
    if (!url) return null;
    if (url.startsWith("http") || url.startsWith("blob:") || url.startsWith("data:")) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  // ── Reliable Fetch-based Docx Download ──
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

  // ── Reliable Fetch-based LaTeX ZIP Download ──
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

  // ── WORD-LIKE EDITOR FORMATTING HANDLERS ──
  const handleExecFormat = (command: string, value: string | undefined = undefined) => {
    if (typeof document !== "undefined") {
      document.execCommand(command, false, value);
    }
  };

  // ── AUTO-SCROLL TO SECTION / SUB-CHAPTER HANDLER ──
  const handleNavigateToSection = (tabId: TabKey, elementId?: string) => {
    setActiveTab(tabId);
    setTimeout(() => {
      if (elementId) {
        const el = document.getElementById(elementId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          // Highlight flash animation
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

  // ── ACADEMIC PRESET POPULAR SUB-CHAPTERS (1-CLICK SELECTION) ──
  const ACADEMIC_PRESET_ITEMS = [
    // BAB 1
    {
      id: "preset_1_2",
      chapter: "bab1" as const,
      num: "1.2",
      badge: "BAB 1",
      title: "Identifikasi Masalah",
      desc: "Menjabarkan butir-butir permasalahan riil di lapangan berdasarkan observasi awal & research gap.",
      content:
        "Berdasarkan uraian latar belakang, permasalahan yang dapat diidentifikasi adalah sebagai berikut:\n1. Belum optimalnya integrasi variabel dalam proses operasional akademik.\n2. Tingginya disparitas efektivitas akibat keterbatasan implementasi instrumen terstandar.\n3. Perlunya bukti empiris mengenai relasi kausalitas antar faktor pendukung.",
    },
    {
      id: "preset_1_5",
      chapter: "bab1" as const,
      num: "1.5",
      badge: "BAB 1",
      title: "Batasan Masalah & Asumsi Penelitian",
      desc: "Membatasi ruang lingkup objek, sampel responden, periode, dan konteks studi agar fokus.",
      content:
        "Agar penelitian lebih terarah dan mendalam, batasan masalah ditetapkan sebagai berikut:\n1. Penelitian difokuskan pada mahasiswa aktif program studi terkait.\n2. Periode pengumpulan data primer dilakukan selama semester berjalan.\n3. Variabel yang diuji dibatasi pada konstruk yang tertera pada model konseptual.",
    },
    {
      id: "preset_1_6",
      chapter: "bab1" as const,
      num: "1.6",
      badge: "BAB 1",
      title: "Sistematika Penulisan Tugas Akhir",
      desc: "Uraian ringkas alur isi Bab I hingga Bab V skripsi secara komprehensif.",
      content:
        "Sistematika penulisan proposal ini dibagi menjadi:\n- BAB I: Menguraikan latar belakang, rumusan masalah, tujuan, dan manfaat.\n- BAB II: Menguraikan tinjauan pustaka, matriks literatur, kerangka pemikiran, dan hipotesis.\n- BAB III: Menguraikan metodologi penelitian, populasi, sampel, instrumen, dan teknik analisis data.",
    },

    // BAB 2
    {
      id: "preset_2_1",
      chapter: "bab2" as const,
      num: "2.1",
      badge: "BAB 2",
      title: "Grand Theory & Middle Range Theory",
      desc: "Landasan teori induk (misal: TAM, UTAUT, RBV, Delone & McLean) yang memayungi variabel.",
      content:
        "Penelitian ini berpijak pada Grand Theory Technology Acceptance Model (Davis, 1989) yang menjelaskan bagaimana pengguna menerima dan menggunakan teknologi berdasarkan persepsi kebermanfaatan (perceived usefulness) dan kemudahan penggunaan (perceived ease of use).",
    },
    {
      id: "preset_2_2",
      chapter: "bab2" as const,
      num: "2.2",
      badge: "BAB 2",
      title: "Kajian Variabel Bebas & Terikat",
      desc: "Uraian teoretis mendalam mengenai dimensi, indikator, dan pengukuran tiap variabel.",
      content:
        "Kajian variabel penelitian mencakup pemetaan indikator teoretis yang teruji validitasnya pada penelitian terdahulu, dilengkapi dengan skala pengukuran Likert 5-poin.",
    },
    {
      id: "preset_2_4",
      chapter: "bab2" as const,
      num: "2.4",
      badge: "BAB 2",
      title: "Pengembangan Hipotesis & Logika Teoretis",
      desc: "Argumen penalaran kausalitas dan telaah komparasi empiris yang melahirkan H1, H2, dst.",
      content:
        "Pengembangan hipotesis dibangun atas telaah bukti empiris jurnal-jurnal bereputasi yang membuktikan adanya korelasi positif dan signifikan antar variabel yang diteliti.",
    },

    // BAB 3
    {
      id: "preset_3_2",
      chapter: "bab3" as const,
      num: "3.2",
      badge: "BAB 3",
      title: "Populasi, Sampel, dan Sampling (Rumus Slovin)",
      desc: "Kriteria inklusi/eksklusi responden, perhitungan ukuran sampel, dan teknik pengambilan sampel.",
      content:
        "Penentuan jumlah sampel menggunakan rumus Slovin dengan tingkat presisi kesalahan (e) sebesar 5%. Teknik pengambilan sampel dilakukan secara purposive sampling dengan kriteria responden aktif.",
    },
    {
      id: "preset_3_3",
      chapter: "bab3" as const,
      num: "3.3",
      badge: "BAB 3",
      title: "Definisi Operasional & Skala Pengukuran Likert",
      desc: "Tabel operasionalisasi variabel, dimensi butir kuesioner, dan penskalaan (1-5 Sangat Setuju).",
      content:
        "Setiap konstruk variabel dioperasionalkan ke dalam 4-5 butir pernyataan kuesioner berskala Likert 5 poin (1: Sangat Tidak Setuju, hingga 5: Sangat Setuju).",
    },
    {
      id: "preset_3_4",
      chapter: "bab3" as const,
      num: "3.4",
      badge: "BAB 3",
      title: "Uji Validitas & Reliabilitas Instrumen",
      desc: "Kriteria r-hitung vs r-tabel Pearson dan batas Cronbach's Alpha > 0.70.",
      content:
        "Pengujian instrumen dilakukan melalui uji validitas (Corrected Item-Total Correlation > r-tabel) dan uji reliabilitas dengan syarat koefisien Cronbach's Alpha > 0.70.",
    },
    {
      id: "preset_3_5",
      chapter: "bab3" as const,
      num: "3.5",
      badge: "BAB 3",
      title: "Teknik Analisis Regresi / PLS-SEM",
      desc: "Uji Measurement Model (Outer Model) dan Structural Model (Inner Model).",
      content:
        "Analisis data diuji menggunakan Structural Equation Modeling berbasis Partial Least Squares (PLS-SEM) dengan evaluasi outer model (Convergent Validity, Discriminant Validity, Composite Reliability) dan inner model (R-Square, f-Square, Path Coefficients).",
    },
  ];

  // 1-Click Preset Insert
  const handleInsertPresetSubChapter = (preset: (typeof ACADEMIC_PRESET_ITEMS)[0]) => {
    const newSub: CustomSubChapterItem = {
      id: `sub_${Date.now()}`,
      chapter: preset.chapter,
      level: "subbab",
      prefix: preset.num,
      indentCm: 0,
      title: `${preset.num} ${preset.title}`,
      content: preset.content,
    };

    setCustomSubChapters((prev) => [...prev, newSub]);
    setShowAddSubChapterModal(false);
    triggerAutoSave();
  };

  // AI Smart Suggestions Generator
  const handleGenerateAiSubSuggestions = () => {
    setIsAiSuggestingSubs(true);
    setTimeout(() => {
      const generated = [
        {
          title: "Evaluasi Efektivitas Prompt AI dalam Pembelajaran",
          desc: "Kajian empiris mengenai frekuensi dan kualitas prompt mahasiswa",
          content:
            "Evaluasi efektivitas interaksi mahasiswa dengan tools kecerdasan buatan dinilai dari variasi prompt instruksi dan tingkat akurasi hasil sintesis tugas yang diperoleh.",
          chapter: "bab2" as const,
        },
        {
          title: "Matriks Komparasi Tools AI (ChatGPT, Copilot, Gemini)",
          desc: "Perbandingan fitur dan adopsi alat bantu AI di lingkungan kampus",
          content:
            "Analisis komparatif mengidentifikasi perbedaan kapabilitas masing-masing model LLM dalam mendukung pengerjaan tugas analitis dan komputasional mahasiswa.",
          chapter: "bab2" as const,
        },
        {
          title: "Distribusi Sampel Mahasiswa per Angkatan & Jurusan",
          desc: "Pengelompokan responden untuk memastikan representasi populasi yang seimbang",
          content:
            "Sampel penelitian didistribusikan secara proporsional berdasarkan program studi dan angkatan aktif guna meminimalisir bias demografis.",
          chapter: "bab3" as const,
        },
        {
          title: "Prosedur Pengujian Hipotesis Mediasi (Bootstrapping)",
          desc: "Pengujian efek tidak langsung variabel intervening dengan 5000 subsampel",
          content:
            "Signifikansi efek mediasi diuji menggunakan teknik non-parametrik bootstrapping dengan confidence interval 95% (two-tailed).",
          chapter: "bab3" as const,
        },
      ];
      setAiSuggestedSubsList(generated);
      setIsAiSuggestingSubs(false);
    }, 700);
  };

  // ── FIX TYPO METHODS ──
  const handleFixTypo = (wrongWord: string, correctWord: string) => {
    setProposalData((prev: any) => {
      if (!prev) return prev;
      const str = JSON.stringify(prev);
      const regex = new RegExp(`\\b${wrongWord}\\b`, "gi");
      const updated = str.replace(regex, correctWord);
      return JSON.parse(updated);
    });

    setCustomSubChapters((prev) =>
      prev.map((s) => {
        const regex = new RegExp(`\\b${wrongWord}\\b`, "gi");
        return {
          ...s,
          title: s.title.replace(regex, correctWord),
          content: s.content.replace(regex, correctWord),
        };
      })
    );

    setShowTypoTooltip(null);
    triggerAutoSave();
    alert(`Berhasil memperbaiki kata "${wrongWord}" ➔ "${correctWord}"!`);
  };

  const handleFixAllTypos = () => {
    let replacedTotal = 0;
    setProposalData((prev: any) => {
      if (!prev) return prev;
      let str = JSON.stringify(prev);
      Object.entries(INDONESIAN_TYPO_DICTIONARY).forEach(([wrong, info]) => {
        const regex = new RegExp(`\\b${wrong}\\b`, "gi");
        if (regex.test(str)) {
          str = str.replace(regex, info.suggestion);
          replacedTotal++;
        }
      });
      return JSON.parse(str);
    });

    setCustomSubChapters((prev) =>
      prev.map((s) => {
        let content = s.content;
        let title = s.title;
        Object.entries(INDONESIAN_TYPO_DICTIONARY).forEach(([wrong, info]) => {
          const regex = new RegExp(`\\b${wrong}\\b`, "gi");
          content = content.replace(regex, info.suggestion);
          title = title.replace(regex, info.suggestion);
        });
        return { ...s, title, content };
      })
    );

    triggerAutoSave();
    alert(`Pemeriksaan selesai! Seluruh ejaan dan kata tidak baku berhasil diperbaiki otomatis.`);
  };

  // Helper parser for squiggly red underline on typos
  const renderTextWithTypoHighlights = (text: string) => {
    if (!text) return null;
    const words = text.split(/(\s+|[.,!?:;()"\n])/);
    return words.map((w, idx) => {
      const cleanWord = w.toLowerCase().replace(/[^a-z0-9]/g, "");
      const typoInfo = INDONESIAN_TYPO_DICTIONARY[cleanWord];
      if (typoInfo) {
        return (
          <span
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              const rect = e.currentTarget.getBoundingClientRect();
              setShowTypoTooltip({
                word: w,
                suggestion: typoInfo.suggestion,
                reason: typoInfo.reason,
                position: { x: rect.left, y: rect.bottom + 6 },
              });
            }}
            style={{
              textDecoration: "underline wavy #EF4444",
              textDecorationThickness: "2px",
              cursor: "pointer",
              backgroundColor: "rgba(239, 68, 68, 0.08)",
              borderRadius: 2,
              padding: "0 2px",
            }}
            title={`Typo terdeteksi: "${w}" ➔ Saran: "${typoInfo.suggestion}" (Klik untuk perbaiki)`}
          >
            {w}
          </span>
        );
      }
      return <React.Fragment key={idx}>{w}</React.Fragment>;
    });
  };

  const handleAddSubChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubChapterTitle.trim()) return;

    const currentChapter =
      activeTab === "bab1" || activeTab === "bab2" || activeTab === "bab3" ? activeTab : "bab1";
    const selectedRule =
      ACADEMIC_NUMBERING_RULES.find((r) => r.level === newSubChapterLevel) ||
      ACADEMIC_NUMBERING_RULES[0];

    const newSub: CustomSubChapterItem = {
      id: `sub_${Date.now()}`,
      chapter: currentChapter as "bab1" | "bab2" | "bab3",
      level: newSubChapterLevel,
      prefix: newSubChapterPrefix.trim() || undefined,
      indentCm: selectedRule.indentCm,
      title: newSubChapterTitle.trim(),
      content: newSubChapterContent.trim() || "Uraian pembahasan sub-bab baru...",
    };

    setCustomSubChapters((prev) => [...prev, newSub]);
    setNewSubChapterTitle("");
    setNewSubChapterPrefix("");
    setNewSubChapterContent("");
    setShowAddSubChapterModal(false);
    triggerAutoSave();
  };

  const handleToggleHideSubChapter = (id: string) => {
    setCustomSubChapters((prev) =>
      prev.map((s) => (s.id === id ? { ...s, hidden: !s.hidden } : s))
    );
    triggerAutoSave();
  };

  const handleInsertAiDraftToDocument = (text: string) => {
    if (!text) return;
    if (activeTab === "bab1") {
      setProposalData((prev: any) => ({
        ...prev,
        bab1: {
          ...prev?.bab1,
          latarBelakang: prev?.bab1?.latarBelakang ? `${prev.bab1.latarBelakang}\n\n${text}` : text,
        },
      }));
    } else if (activeTab === "bab2") {
      setProposalData((prev: any) => ({
        ...prev,
        bab2: {
          ...prev?.bab2,
          landasanTeori: prev?.bab2?.landasanTeori ? `${prev.bab2.landasanTeori}\n\n${text}` : text,
        },
      }));
    } else if (activeTab === "bab3") {
      setProposalData((prev: any) => ({
        ...prev,
        bab3: {
          ...prev?.bab3,
          desainPenelitian: prev?.bab3?.desainPenelitian ? `${prev.bab3.desainPenelitian}\n\n${text}` : text,
        },
      }));
    } else if (activeTab === "abstract") {
      setAbstractData((prev) => ({
        ...prev,
        indo: prev.indo ? `${prev.indo}\n\n${text}` : text,
      }));
    } else {
      setProposalData((prev: any) => ({
        ...prev,
        bab1: {
          ...prev?.bab1,
          latarBelakang: prev?.bab1?.latarBelakang ? `${prev.bab1.latarBelakang}\n\n${text}` : text,
        },
      }));
    }
    triggerAutoSave();
    setSaveDraftStatus("saved");
    setTimeout(() => setSaveDraftStatus("idle"), 2500);
  };

  const handleSendAiMessage = async () => {
    if (!aiInputPrompt.trim() || isAiThinking) return;
    const userText = aiInputPrompt.trim();
    const nowTime = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

    setAiChatMessages((prev) => [...prev, { sender: "user", text: userText, time: nowTime }]);
    setAiInputPrompt("");
    setIsAiThinking(true);

    // Ambil draft konten section aktif saat ini
    let currentContent = "";
    if (activeTab === "bab1") {
      currentContent = proposalData?.bab1?.latarBelakang || "";
    } else if (activeTab === "bab2") {
      currentContent = proposalData?.bab2?.landasanTeori || "";
    } else if (activeTab === "bab3") {
      currentContent = proposalData?.bab3?.desainPenelitian || "";
    } else if (activeTab === "abstract") {
      currentContent = abstractData.indo || "";
    }

    const conversationHistory = aiChatMessages.slice(-4).map((m) => ({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.text,
    }));

    try {
      const res = await api.proposal.chat(projectId, {
        sectionId: activeTab,
        command: userText,
        currentContent,
        conversationHistory,
      });

      if (res && res.revisedContent) {
        setAiChatMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: res.explanation ? `${res.explanation}\n\n${res.revisedContent}` : res.revisedContent,
            time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
            revisedContent: res.revisedContent,
            explanation: res.explanation,
            usedCitations: res.usedCitations,
          },
        ]);
      } else {
        setAiChatMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: res?.explanation || "AI Co-Writer telah menyelesaikan analisis.",
            time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    } catch (err: any) {
      setAiChatMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: `Gagal memproses bantuan AI: ${err.message || "Pastikan server backend terhubung."}`,
          time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsAiThinking(false);
    }
  };

  const getPageNumber = (tab: TabKey) => {
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
  };

  // ── Memoized Full Text and Cited References Calculation (High Performance) ──
  const fullDocText = useMemo(() => {
    return [
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
  }, [abstractData, proposalData, customSubChapters]);

  const citedReferencesList = useMemo(() => {
    if (!fullDocText) return [];

    const isRefCited = (r: ReferenceItem, origIdx: number) => {
      if (fullDocText.includes(`[${origIdx + 1}]`)) return true;

      const cleaned = (r.authors || "").replace(/^(\[\d+\]|\d+[\.\)\t\s]+)/, "").trim();
      const authorsList = cleaned.split(/,\s*(?:and\s+|&\s*)?|\s+and\s+|\s*&\s*/i);
      for (const auth of authorsList) {
        const surname = auth.replace(/et\s+al/i, "").trim().split(/\s+/).pop();
        if (surname && surname.length > 2) {
          const reg = new RegExp(`\\b${surname}\\b`, "i");
          if (reg.test(fullDocText)) return true;
        }
      }
      return false;
    };

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

    const citedRefs = uniqueRefs.filter((r) => isRefCited(r, r.originalIndex - 1));
    const isNumbered = citationStyle === "IEEE" || citationStyle === "VANCOUVER";

    return isNumbered
      ? citedRefs
      : [...citedRefs].sort((a, b) => (a.authors || "").localeCompare(b.authors || ""));
  }, [fullDocText, references, citationStyle]);

  // Word count & Char count (Memoized)
  const { wordCount, charCount } = useMemo(() => {
    const words = fullDocText.trim() ? fullDocText.trim().split(/\s+/).length : 0;
    return {
      wordCount: Math.max(850, words),
      charCount: Math.max(5400, fullDocText.length),
    };
  }, [fullDocText]);

  // ── Smart Pagination for BAB 1 Latar Belakang (split into multiple A4 pages) ──
  // A4 (210x297mm) with 3cm margins holds roughly 8-10 paragraphs per page at 12pt/1.8lh
  const { latarPage1, latarPage2, latarPage3 } = useMemo(() => {
    const raw = proposalData?.bab1?.latarBelakang || "";
    const paras = raw.split(/\n+/).map((p: string) => p.trim()).filter(Boolean);
    const total = paras.length;

    if (total <= 9) {
      return { latarPage1: raw, latarPage2: "", latarPage3: "" };
    }
    if (total <= 18) {
      const mid = Math.ceil(total / 2);
      return {
        latarPage1: paras.slice(0, mid).join("\n\n"),
        latarPage2: paras.slice(mid).join("\n\n"),
        latarPage3: "",
      };
    }
    // 19+ paragraphs: split into 3 pages
    const third = Math.ceil(total / 3);
    return {
      latarPage1: paras.slice(0, third).join("\n\n"),
      latarPage2: paras.slice(third, third * 2).join("\n\n"),
      latarPage3: paras.slice(third * 2).join("\n\n"),
    };
  }, [proposalData?.bab1?.latarBelakang]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F8FAFC",
        display: "flex",
        flexDirection: "column",
        fontFamily: "var(--font-body, 'Inter', -apple-system, sans-serif)",
        color: "#0F172A",
      }}
    >
      {/* ════════════════════════════════════════════════════════════════════════
          1. TOP APP HEADER (THESIS AI / GOOGLE DOCS STYLE)
         ════════════════════════════════════════════════════════════════════════ */}
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
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        {/* Left: Brand Logo & Title & File Menu */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link
            href="/dashboard"
            style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", color: "inherit" }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: "linear-gradient(135deg, #4338CA 0%, #6366F1 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                fontWeight: 800,
                fontSize: 16,
                boxShadow: "0 2px 8px rgba(67, 56, 202, 0.25)",
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#0F172A", lineHeight: 1.1 }}>
                Thesis AI
              </div>
              <div style={{ fontSize: 10, color: "#64748B", fontWeight: 500 }}>
                AI-Powered Thesis Writer
              </div>
            </div>
          </Link>

          <div style={{ width: 1, height: 26, background: "#E2E8F0" }} />

          {/* Document Title & File Menu Row */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                type="text"
                value={project?.title || coverData.title}
                onChange={(e) => {
                  setProject((prev: any) => ({ ...prev, title: e.target.value }));
                  triggerAutoSave();
                }}
                style={{
                  fontSize: 13.5,
                  fontWeight: 700,
                  color: "#0F172A",
                  border: "1px solid transparent",
                  borderRadius: 6,
                  padding: "2px 6px",
                  background: "transparent",
                  outline: "none",
                  maxWidth: 420,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                onFocus={(e) => (e.target.style.border = "1px solid #CBD5E1")}
                onBlur={(e) => (e.target.style.border = "1px solid transparent")}
              />

              {/* Live Database Saved Badge */}
              <div
                onClick={handleSaveDraft}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "3px 8px",
                  borderRadius: 9999,
                  background: saveDraftStatus === "saving" ? "#FEF3C7" : "#DCFCE7",
                  color: saveDraftStatus === "saving" ? "#D97706" : "#16A34A",
                  cursor: "pointer",
                }}
                title="Klik untuk Simpan Langsung ke Database"
              >
                {saveDraftStatus === "saving" ? (
                  <RefreshCw size={11} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={12} />
                )}
                <span>
                  {saveDraftStatus === "saving"
                    ? "Menyimpan ke DB..."
                    : `Saved ${lastSavedTime || "10:30 AM"}`}
                </span>
              </div>
            </div>

            {/* Google Docs Menus */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 12, color: "#64748B", marginTop: 2 }}>
              {["File", "Edit", "Insert", "Format", "Tools", "View", "Help"].map((m) => (
                <span
                  key={m}
                  style={{ cursor: "pointer", transition: "color 0.15s" }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#0F172A")}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "#64748B")}
                  onClick={() => {
                    if (m === "File" || m === "Tools") setShowExportMenu(!showExportMenu);
                    if (m === "Format") setShowPageSetupModal(true);
                  }}
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Header Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Undo / Redo */}
          <button
            type="button"
            onClick={() => handleExecFormat("undo")}
            style={{ background: "#F1F5F9", border: "1px solid #E2E8F0", borderRadius: 6, padding: "5px 8px", cursor: "pointer", color: "#475569" }}
            title="Undo"
          >
            <Undo2 size={13} />
          </button>
          <button
            type="button"
            onClick={() => handleExecFormat("redo")}
            style={{ background: "#F1F5F9", border: "1px solid #E2E8F0", borderRadius: 6, padding: "5px 8px", cursor: "pointer", color: "#475569" }}
            title="Redo"
          >
            <Redo2 size={13} />
          </button>

          {/* Tombol Pengaturan Identitas & Kampus */}
          <button
            type="button"
            onClick={() => setShowIdentityModal(true)}
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
            title="Ubah Nama, NIM, Universitas, Fakultas, Program Studi & Pembimbing"
          >
            <Building size={13} color="#4338CA" />
            <span>Info Kampus</span>
          </button>

          {/* Share */}
          <button
            type="button"
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
                alert("Tautan proposal disalin ke clipboard!");
              }
            }}
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
            <Share2 size={13} />
            <span>Share</span>
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
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", border: "none", background: "transparent", fontSize: 12.5, color: "#334155", cursor: "pointer", textAlign: "left", borderRadius: 6 }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.background = "#F1F5F9")}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.background = "transparent")}
                >
                  <FileText size={14} color="#2563EB" />
                  <span>Microsoft Word (.docx)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadLatexZip(selectedTemplate)}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", border: "none", background: "transparent", fontSize: 12.5, color: "#334155", cursor: "pointer", textAlign: "left", borderRadius: 6 }}
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
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", border: "none", background: "transparent", fontSize: 12.5, color: "#334155", cursor: "pointer", textAlign: "left", borderRadius: 6 }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.background = "#F1F5F9")}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.background = "transparent")}
                >
                  <Printer size={14} color="#059669" />
                  <span>Cetak / Cetak PDF (A4)</span>
                </button>
              </div>
            )}
          </div>

          {/* Main Action: Sintesis / Generate Proposal Lengkap AI */}
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
              padding: "6px 14px",
              fontSize: 12.5,
              fontWeight: 700,
              cursor: generating ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
              transition: "all 0.15s ease",
            }}
            title="Sintesis Proposal lengkap Bab 1-3 dari Research Blueprint & Jurnal Evidence"
          >
            {generating ? <RefreshCw size={14} className="animate-spin" /> : <Wand2 size={14} />}
            <span>{generating ? "Menyintesis Proposal..." : "Sintesis Proposal AI ✨"}</span>
          </button>

          {/* AI Assistant Toggle Button */}
          <button
            type="button"
            onClick={() => setShowAiAssistant(!showAiAssistant)}
            style={{
              background: showAiAssistant
                ? "linear-gradient(135deg, #4338CA 0%, #6366F1 100%)"
                : "#EEEAFE",
              color: showAiAssistant ? "#FFFFFF" : "#4338CA",
              border: "none",
              borderRadius: 8,
              padding: "6px 14px",
              fontSize: 12.5,
              fontWeight: 700,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              boxShadow: showAiAssistant ? "0 2px 10px rgba(67, 56, 202, 0.3)" : "none",
            }}
          >
            <Sparkles size={14} />
            <span>AI Assistant</span>
          </button>


          {/* User Avatar */}
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "#E2E8F0",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 12,
              color: "#334155",
            }}
          >
            {profile?.namaLengkap ? profile.namaLengkap.slice(0, 2).toUpperCase() : "AP"}
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════════════════════
          2. WYSIWYG WORD-STYLE FORMATTING RIBBON TOOLBAR
         ════════════════════════════════════════════════════════════════════════ */}
      <div
        id="top_ribbon"
        className="no-print"
        style={{
          background: "#FFFFFF",
          borderBottom: "1px solid #E2E8F0",
          padding: "6px 20px",
          display: "flex",
          alignItems: "center",
          gap: 6,
          flexWrap: "wrap",
          fontSize: 12,
        }}
      >
        {/* Style Dropdown */}
        <select
          value={selectedStyle}
          onChange={(e) => setSelectedStyle(e.target.value)}
          style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 12, fontWeight: 500, background: "#F8FAFC", color: "#334155" }}
        >
          <option value="Normal Text">Normal Text</option>
          <option value="Heading 1 (BAB)">Heading 1 (BAB)</option>
          <option value="Heading 2 (Sub-bab)">Heading 2 (Sub-bab)</option>
          <option value="Heading 3 (Anak Sub-bab)">Heading 3 (Anak Sub-bab)</option>
          <option value="Title">Title (Judul)</option>
        </select>

        {/* Font Family Dropdown */}
        <select
          value={selectedFont}
          onChange={(e) => setSelectedFont(e.target.value)}
          style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 12, fontWeight: 600, background: "#F8FAFC", color: "#334155" }}
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
          style={{ padding: "5px 7px", borderRadius: 6, border: "none", background: activeAlign === "left" ? "#EEEAFE" : "#F8FAFC", color: activeAlign === "left" ? "#4338CA" : "#334155", cursor: "pointer" }}
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
          style={{ padding: "5px 7px", borderRadius: 6, border: "none", background: activeAlign === "center" ? "#EEEAFE" : "#F8FAFC", color: activeAlign === "center" ? "#4338CA" : "#334155", cursor: "pointer" }}
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
          style={{ padding: "5px 7px", borderRadius: 6, border: "none", background: activeAlign === "right" ? "#EEEAFE" : "#F8FAFC", color: activeAlign === "right" ? "#4338CA" : "#334155", cursor: "pointer" }}
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
          style={{ padding: "5px 7px", borderRadius: 6, border: "none", background: activeAlign === "justify" ? "#EEEAFE" : "#F8FAFC", color: activeAlign === "justify" ? "#4338CA" : "#334155", cursor: "pointer" }}
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
            color: paragraphStyle === "indent" ? "#4338CA" : "#475569",
            cursor: "pointer",
            fontWeight: 700,
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            fontSize: 11.5,
          }}
          title={
            paragraphStyle === "indent"
              ? "Format: Paragraf Menjorok 1.27cm & Rapat Tanpa Jeda Baris (Standar Skripsi). Klik untuk beralih ke Rata Blok Berjarak."
              : "Format: Paragraf Rata Blok & Berjarak (Enter). Klik untuk beralih ke Menjorok Rapat."
          }
        >
          <FileText size={12} />
          <span>{paragraphStyle === "indent" ? "Menjorok (Rapat)" : "Rata Blok (Berjarak)"}</span>
        </button>

        <div style={{ width: 1, height: 20, background: "#E2E8F0", margin: "0 2px" }} />

        {/* Insert Elements & Typo Checker */}
        <button
          type="button"
          onClick={() => setShowCitationPickerModal(true)}
          style={{ padding: "5px 9px", borderRadius: 6, border: "1px solid #CBD5E1", background: "#F8FAFC", color: "#4338CA", cursor: "pointer", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}
          title="Sisipkan Sitasi Jurnal"
        >
          <Quote size={12} />
          <span>Sitasi</span>
        </button>

        <button
          type="button"
          onClick={handleFixAllTypos}
          style={{
            padding: "5px 10px",
            borderRadius: 6,
            border: "1px solid #FCA5A5",
            background: "#FEF2F2",
            color: "#DC2626",
            cursor: "pointer",
            fontWeight: 700,
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
          }}
          title="Pindai dan Perbaiki Ejaan / Typo Bahasa Indonesia Otomatis"
        >
          <ShieldAlert size={12} />
          <span>Cek Typo (KBBI)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("latex")}
          style={{ padding: "5px 9px", borderRadius: 6, border: "1px solid #CBD5E1", background: "#F8FAFC", color: "#334155", cursor: "pointer", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}
          title="Lihat Source LaTeX"
        >
          <FileCode size={12} />
          <span>LaTeX</span>
        </button>

        {/* Outline toggle button */}
        <button
          type="button"
          onClick={() => setShowOutlineSidebar(!showOutlineSidebar)}
          style={{
            marginLeft: "auto",
            padding: "4px 10px",
            borderRadius: 6,
            border: "1px solid #CBD5E1",
            background: showOutlineSidebar ? "#EEEAFE" : "#F8FAFC",
            color: showOutlineSidebar ? "#4338CA" : "#64748B",
            cursor: "pointer",
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <ListTree size={13} />
          <span>Outline Sidebar</span>
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          3. MAIN 3-COLUMN STUDIO LAYOUT
         ════════════════════════════════════════════════════════════════════════ */}
      <div style={{ display: "flex", flex: 1, minHeight: 0, position: "relative" }}>
        {/* ── LEFT COLUMN: OUTLINE & CHAPTER HIERARCHY TREE SIDEBAR ── */}
        {showOutlineSidebar && (
          <aside
            id="left_outline_sidebar"
            className="no-print"
            style={{
              width: 280,
              minWidth: 280,
              background: "#FFFFFF",
              borderRight: "1px solid #E2E8F0",
              display: "flex",
              flexDirection: "column",
              height: "calc(100vh - 105px)",
              position: "sticky",
              top: 105,
              zIndex: 20,
            }}
          >
            {/* Outline Header */}
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#64748B", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                OUTLINE
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button
                  type="button"
                  onClick={() => setShowAddSubChapterModal(true)}
                  style={{ background: "#F1F5F9", border: "none", borderRadius: 6, padding: "4px 6px", cursor: "pointer", color: "#334155" }}
                  title="Tambah Sub-Bab Baru"
                >
                  <Plus size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => handleGenerateProposal()}
                  style={{ background: "#EEEAFE", border: "none", borderRadius: 6, padding: "4px 6px", cursor: "pointer", color: "#4338CA" }}
                  title="AI Generate Outline"
                >
                  <Sparkles size={13} />
                </button>
              </div>
            </div>

            {/* Tree Navigation Chapters */}
            <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", padding: "4px 6px", marginBottom: 2 }}>
                SKRIPSI
              </div>

              {[
                { id: "cover", label: "Halaman Sampul / Cover", subs: [] },
                { id: "approval", label: "Lembar Persetujuan", subs: [] },
                { id: "abstract", label: "Abstrak & Keywords", subs: [] },
                {
                  id: "bab1",
                  label: "BAB I PENDAHULUAN",
                  subs: [
                    { label: "1.1 Latar Belakang", elementId: "sub_1_1" },
                    { label: "1.2 Identifikasi Masalah", elementId: "sub_1_2" },
                    { label: "1.3 Rumusan Masalah", elementId: "sub_1_3" },
                    { label: "1.4 Tujuan Penelitian", elementId: "sub_1_4" },
                    { label: "1.5 Manfaat Penelitian", elementId: "sub_1_5" },
                  ],
                },
                {
                  id: "bab2",
                  label: "BAB II TINJAUAN PUSTAKA",
                  subs: [
                    { label: "2.1 Landasan Teori", elementId: "sub_2_1" },
                    { label: "2.2 Kerangka Berpikir", elementId: "sub_2_2" },
                    { label: "2.3 Hipotesis Penelitian", elementId: "sub_2_3" },
                  ],
                },
                {
                  id: "matrix",
                  label: "Matriks Literatur Scopus/SINTA",
                  subs: [],
                },
                {
                  id: "bab3",
                  label: "BAB III METODOLOGI PENELITIAN",
                  subs: [
                    { label: "3.1 Jenis Penelitian & Desain", elementId: "sub_3_1" },
                    { label: "3.2 Populasi dan Sampel", elementId: "sub_3_2" },
                    { label: "3.3 Teknik Pengumpulan Data", elementId: "sub_3_3" },
                    { label: "3.4 Teknik Analisis Data", elementId: "sub_3_4" },
                  ],
                },
                { id: "references", label: `Daftar Pustaka (${references.filter((r) => r.selected).length})`, subs: [] },
                { id: "appendix", label: "Lampiran Kuesioner", subs: [] },
              ].map((item) => {
                const isActive = activeTab === item.id;
                const chapterCustomSubs = customSubChapters.filter((c) => c.chapter === item.id && !c.hidden);
                return (
                  <div key={item.id} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <div
                      onClick={() => handleNavigateToSection(item.id as TabKey, `section_${item.id}`)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "7px 10px",
                        borderRadius: 8,
                        background: isActive ? "#EEEAFE" : "transparent",
                        color: isActive ? "#4338CA" : "#334155",
                        cursor: "pointer",
                        fontWeight: isActive ? 700 : 600,
                        fontSize: 12.5,
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        <FileText size={14} color={isActive ? "#4338CA" : "#94A3B8"} />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</span>
                      </div>
                    </div>

                    {/* Sub-chapters list */}
                    {(item.subs.length > 0 || chapterCustomSubs.length > 0) && (
                      <div style={{ display: "flex", flexDirection: "column", paddingLeft: 22, gap: 2, marginBottom: 4 }}>
                        {item.subs.map((sub, sIdx) => (
                          <div
                            key={sIdx}
                            onClick={() => handleNavigateToSection(item.id as TabKey, sub.elementId)}
                            style={{
                              padding: "4px 8px",
                              borderRadius: 6,
                              fontSize: 11.5,
                              color: "#64748B",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              transition: "all 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                              (e.target as HTMLElement).style.color = "#4338CA";
                              (e.target as HTMLElement).style.background = "#F8FAFC";
                            }}
                            onMouseLeave={(e) => {
                              (e.target as HTMLElement).style.color = "#64748B";
                              (e.target as HTMLElement).style.background = "transparent";
                            }}
                          >
                            <span style={{ color: "#CBD5E1" }}>•</span>
                            <span>{sub.label}</span>
                          </div>
                        ))}

                        {/* Custom sub-chapters added by user */}
                        {chapterCustomSubs.map((cSub) => (
                          <div
                            key={cSub.id}
                            onClick={() => handleNavigateToSection(item.id as TabKey, cSub.id)}
                            style={{
                              padding: "4px 8px",
                              borderRadius: 6,
                              fontSize: 11.5,
                              color: "#4338CA",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              fontWeight: 600,
                            }}
                          >
                            <span>⚡</span>
                            <span>{cSub.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Add Sub-chapter button */}
            <div style={{ padding: "12px 14px", borderTop: "1px solid #F1F5F9" }}>
              <button
                type="button"
                onClick={() => setShowAddSubChapterModal(true)}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: 8,
                  border: "1px dashed #CBD5E1",
                  background: "#F8FAFC",
                  color: "#4338CA",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <Plus size={13} />
                <span>Tambah Bab / Sub-Bab</span>
              </button>
            </div>
          </aside>
        )}

        {/* ── CENTER COLUMN: INTERACTIVE A4 SHEET CANVAS WITH RULER ── */}
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
          {/* Top Horizontal Centimeter Ruler */}
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

          {/* ── BANNER AJAKAN SINTESIS AI DARI RESEARCH BLUEPRINT & JURNAL EVIDENCE ── */}
          {!proposalData?.bab1?.latarBelakang && (
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
                    Research Blueprint &amp; {references.length} Jurnal Evidence Siap Disintesis!
                  </h4>
                </div>
                <p style={{ margin: 0, fontSize: 12.5, color: "#047857", lineHeight: 1.5, maxWidth: 540 }}>
                  Klik tombol di samping untuk menyusun draf naskah Bab 1, 2, dan 3 yang spesifik sesuai topik <strong>&quot;{project?.title || coverData.title}&quot;</strong> lengkap dengan sitasi jurnal IEEE [1].
                </p>
              </div>

              <button
                type="button"
                onClick={handleGenerateProposal}
                disabled={generating}
                style={{
                  background: "#059669",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 18px",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: generating ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  whiteSpace: "nowrap",
                  boxShadow: "0 4px 12px rgba(5, 150, 105, 0.25)",
                  transition: "all 0.15s ease",
                }}
              >
                {generating ? <RefreshCw size={15} className="animate-spin" /> : <Sparkles size={15} />}
                <span>{generating ? "Sedang Menyusun..." : "Sintesis Proposal AI ✨"}</span>
              </button>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════
              CONTINUOUS MULTI-PAGE ACADEMIC MANUSCRIPT (TRUE WORD / DOCX REPLICA)
             ══════════════════════════════════════════════════════════════════════ */}
          <div id="proposal-print-area" style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>

            {/* ── PAGE 1: HALAMAN SAMPUL / COVER RESMI ── */}
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
                  <div style={{ fontSize: "14pt", fontWeight: 700, textTransform: "uppercase", marginBottom: 24, lineHeight: 1.4 }}>
                    {coverData.title}
                  </div>
                  <div style={{ fontSize: "12pt", fontWeight: 700, color: "#000000", letterSpacing: "0.02em" }}>
                    PROPOSAL PENELITIAN TUGAS AKHIR
                  </div>
                  <div style={{ fontSize: "11pt", color: "#475569", marginTop: 2 }}>(Usulan Penelitian Sarjana)</div>
                </div>

                <div style={{ margin: "24px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  {profile?.logoUrl || project?.logoUrl ? (
                    <img
                      src={
                        getFullImageUrl(profile?.logoUrl || project?.logoUrl) ||
                        "/Tel-U-Logo.png"
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
                      <span style={{ fontSize: 9, fontWeight: 700, marginTop: 4, color: "#334155" }}>
                        {coverData.universitas || "Logo Kampus"}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <div style={{ fontSize: "12pt", marginBottom: 4 }}>Disusun Oleh:</div>
                  <div style={{ fontSize: "13pt", fontWeight: 700, letterSpacing: "0.03em" }}>{(coverData.author || profile?.namaLengkap || project?.nama || "").toUpperCase() || "(NAMA MAHASISWA)"}</div>
                  <div style={{ fontSize: "12pt", fontWeight: 700 }}>NIM: {coverData.nim || profile?.nim || "(NIM)"}</div>
                </div>

                <div style={{ marginTop: 32 }}>
                  {coverData.prodi || profile?.programStudi || project?.prodi ? (
                    <div style={{ fontSize: "12pt", fontWeight: 700 }}>
                      PROGRAM STUDI SARJANA {(coverData.prodi || profile?.programStudi || project?.prodi || "").toUpperCase()}
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
                    {(coverData.kota || profile?.kota || "BANDUNG").toUpperCase()} {coverData.year || `${new Date().getFullYear()}`}
                  </div>
                </div>
              </div>
            </A4Sheet>

            {/* ── PAGE 2: LEMBAR PERSETUJUAN ── */}
            <A4Sheet
              sheetId="sheet_approval"
              isIncludedInPrint={pdfPageSelection.approval}
              pageNumber="i"
              pageNumberPos={pageNumberPos}
              marginPreset={marginPreset}
            >
              <div
                id="section_approval"
                contentEditable={isEditMode}
                suppressContentEditableWarning
                onBlur={triggerAutoSave}
                style={{ textAlign: "justify", outline: "none" }}
              >
                <div style={{ textAlign: "center", fontSize: "13pt", fontWeight: 700, textTransform: "uppercase", marginBottom: 20 }}>
                  LEMBAR PERSETUJUAN PROPOSAL TUGAS AKHIR
                </div>
                <div style={{ textAlign: "center", fontSize: "12pt", fontWeight: 700, marginBottom: 8 }}>
                  {coverData.title || project?.title || "(Judul Proposal Tugas Akhir)"}
                </div>
                <div style={{ textAlign: "center", fontSize: "11pt", fontStyle: "italic", marginBottom: 24 }}>
                  {approvalData.titleEng || `A Research Proposal on ${coverData.title || project?.title || "Research Topic"}`}
                </div>

                <p style={{ textIndent: "1.27cm", lineHeight: 1.8 }}>
                  Proposal Tugas Akhir ini diajukan sebagai usulan resmi pembuatan Tugas Akhir pada Program Studi Sarjana {coverData.prodi || profile?.programStudi || project?.prodi || "........................"}, Fakultas {coverData.fakultas || profile?.fakultas || "........................"}, {coverData.universitas || profile?.universitas || "........................"}.
                </p>

                <div style={{ marginTop: 24, textAlign: "center", fontWeight: 600 }}>
                  {approvalData.kota || coverData.kota || profile?.kota || "Bandung"}, {approvalData.dateDay || "2"} {approvalData.dateMonth || "Oktober"} {approvalData.dateYear || "2026"}
                </div>

                <div style={{ marginTop: 36, display: "grid", gridTemplateColumns: "1fr 1fr", textAlign: "center", gap: 20 }}>
                  <div>
                    <div>Calon Pembimbing 1,</div>
                    <div style={{ height: 60 }} />
                    <div style={{ fontWeight: 700 }}>{approvalData.pembimbing1 || "(..................................................)"}</div>
                    <div>{approvalData.nipPembimbing1 ? `NIP: ${approvalData.nipPembimbing1}` : "NIP: ...................................."}</div>
                  </div>
                  <div>
                    <div>Calon Pembimbing 2,</div>
                    <div style={{ height: 60 }} />
                    <div style={{ fontWeight: 700 }}>{approvalData.pembimbing2 || "(..................................................)"}</div>
                    <div>{approvalData.nipPembimbing2 ? `NIP: ${approvalData.nipPembimbing2}` : "NIP: ...................................."}</div>
                  </div>
                </div>

                <div style={{ marginTop: 40, textAlign: "center" }}>
                  <div>Mengetahui,</div>
                  <div>Ketua Program Studi Sarjana {coverData.prodi || profile?.programStudi || project?.prodi || "........................"}</div>
                  <div style={{ height: 60 }} />
                  <div style={{ fontWeight: 700 }}>{approvalData.kaprodi || "(..................................................)"}</div>
                  <div>{approvalData.nipKaprodi ? `NIP: ${approvalData.nipKaprodi}` : "NIP: ...................................."}</div>
                </div>
              </div>
            </A4Sheet>

            {/* ── PAGE 3: ABSTRAK & ABSTRACT ── */}
            <A4Sheet
              sheetId="sheet_abstract"
              isIncludedInPrint={pdfPageSelection.abstract}
              pageNumber="ii"
              pageNumberPos={pageNumberPos}
              marginPreset={marginPreset}
            >
              <div
                id="section_abstract"
                contentEditable={isEditMode}
                suppressContentEditableWarning
                onBlur={triggerAutoSave}
                style={{ textAlign: "justify", outline: "none" }}
              >
                <div style={{ textAlign: "center", fontSize: "13pt", fontWeight: 700, textTransform: "uppercase", marginBottom: 14 }}>
                  ABSTRAK
                </div>
                {renderAcademicParagraphs(abstractData.indo)}
                {abstractData.keywordsIndo && (
                  <div style={{ marginBottom: 24, marginTop: 4 }}>
                    <strong>Kata Kunci:</strong> <em>{abstractData.keywordsIndo}</em>
                  </div>
                )}

                <div style={{ textAlign: "center", fontSize: "13pt", fontWeight: 700, textTransform: "uppercase", marginBottom: 14 }}>
                  ABSTRACT
                </div>
                <div style={{ fontStyle: "italic" }}>
                  {renderAcademicParagraphs(abstractData.eng)}
                </div>
                {abstractData.keywordsEng && (
                  <div style={{ marginTop: 4 }}>
                    <strong>Keywords:</strong> <em>{abstractData.keywordsEng}</em>
                  </div>
                )}
              </div>
            </A4Sheet>

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
                <div style={{ textAlign: "center", fontSize: "14pt", fontWeight: 700, textTransform: "uppercase", marginBottom: 20 }}>
                  BAB I<br />PENDAHULUAN
                </div>

                <div id="sub_1_1" style={{ fontWeight: 700, marginBottom: 8 }}>1.1 Latar Belakang Masalah</div>
                {renderAcademicParagraphs(latarPage1 || proposalData?.bab1?.latarBelakang)}
              </div>
            </A4Sheet>

            {/* ── PAGE 5: BAB I (HALAMAN 2: LANJUTAN LATAR BELAKANG) ── */}
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
                  {renderAcademicParagraphs(latarPage2)}
                </div>
              </A4Sheet>
            ) : null}

            {/* ── PAGE 6 (atau 5): BAB I (HALAMAN 3: LANJUTAN + 1.2 - 1.5) ── */}
            <A4Sheet
              sheetId="sheet_bab1_p3"
              isIncludedInPrint={pdfPageSelection.bab1}
              pageNumber={latarPage2 ? "3" : "2"}
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
                {latarPage3 ? (
                  <div style={{ marginBottom: 12 }}>
                    {renderAcademicParagraphs(latarPage3)}
                  </div>
                ) : null}

                <div id="sub_1_2" style={{ fontWeight: 700, marginBottom: 6, marginTop: latarPage3 ? 10 : 0 }}>1.2 Identifikasi Masalah</div>
                {proposalData?.bab1?.identifikasiMasalah && proposalData.bab1.identifikasiMasalah.length > 0 ? (
                  <div style={{ paddingLeft: "1.27cm", marginBottom: 10, lineHeight: 1.75 }}>
                    {proposalData.bab1.identifikasiMasalah.map((m: string, idx: number) => (
                      <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 3 }}>
                        <span style={{ minWidth: 18 }}>{idx + 1}.</span>
                        <span style={{ flex: 1, textAlign: "justify" }}>{m.replace(/^\d+\.\s*/, "")}</span>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div id="sub_1_3" style={{ fontWeight: 700, marginBottom: 6, marginTop: 10 }}>1.3 Rumusan Masalah</div>
                {proposalData?.bab1?.rumusanMasalah && proposalData.bab1.rumusanMasalah.length > 0 ? (
                  <div style={{ paddingLeft: "1.27cm", marginBottom: 10, lineHeight: 1.75 }}>
                    {proposalData.bab1.rumusanMasalah.map((r: string, idx: number) => (
                      <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 3 }}>
                        <span style={{ minWidth: 18 }}>{idx + 1}.</span>
                        <span style={{ flex: 1, textAlign: "justify" }}>{r.replace(/^\d+\.\s*/, "")}</span>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div id="sub_1_4" style={{ fontWeight: 700, marginBottom: 6, marginTop: 10 }}>1.4 Tujuan Penelitian</div>
                {proposalData?.bab1?.tujuanPenelitian && proposalData.bab1.tujuanPenelitian.length > 0 ? (
                  <div style={{ paddingLeft: "1.27cm", marginBottom: 10, lineHeight: 1.75 }}>
                    {proposalData.bab1.tujuanPenelitian.map((t: string, idx: number) => (
                      <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 3 }}>
                        <span style={{ minWidth: 18 }}>{idx + 1}.</span>
                        <span style={{ flex: 1, textAlign: "justify" }}>{t.replace(/^\d+\.\s*/, "")}</span>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div id="sub_1_5" style={{ fontWeight: 700, marginBottom: 6, marginTop: 10 }}>1.5 Manfaat Penelitian</div>
                <p style={{ textIndent: paragraphStyle === "indent" ? "1.27cm" : "0", marginBottom: 3, lineHeight: 1.75 }}>
                  <strong>1.5.1 Manfaat Teoretis:</strong> {proposalData?.bab1?.manfaatPenelitian?.teoretis || "Penelitian ini memberikan kontribusi empiris kuantitatif terhadap literatur pengalaman pengguna chatbot kesehatan mental pada populasi mahasiswa teknik informatika di Indonesia."}
                </p>
                <p style={{ textIndent: paragraphStyle === "indent" ? "1.27cm" : "0", marginBottom: 10, lineHeight: 1.75 }}>
                  <strong>1.5.2 Manfaat Praktis:</strong> {proposalData?.bab1?.manfaatPenelitian?.praktis || "Hasil penelitian dapat menjadi masukan bagi pengembang chatbot untuk meningkatkan kualitas interaksi, privasi, dan respons terhadap kebutuhan mahasiswa Informatika."}
                </p>

                {/* Custom sub-chapters for BAB 1 */}
                {customSubChapters
                  .filter((s) => s.chapter === "bab1" && !s.hidden)
                  .map((s) => (
                    <div key={s.id} id={s.id} style={{ marginTop: 10 }}>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>{s.title}</div>
                      {renderAcademicParagraphs(s.content)}
                    </div>
                  ))}
              </div>
            </A4Sheet>

            {/* ── PAGE 6: BAB II TINJAUAN PUSTAKA & MATRIKS (HALAMAN 3) ── */}
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
                <div style={{ textAlign: "center", fontSize: "14pt", fontWeight: 700, textTransform: "uppercase", marginBottom: 20 }}>
                  BAB II<br />TINJAUAN PUSTAKA & KERANGKA PEMIKIRAN
                </div>

                <div id="sub_2_1" style={{ fontWeight: 700, marginBottom: 8 }}>2.1 Landasan Teori & Variabel Riset</div>
                {renderAcademicParagraphs(proposalData?.bab2?.landasanTeori || "User Experience didefinisikan sebagai konstruk multidimensi yang mencakup acceptability, usability, usefulness, dan integration menurut Malik et al. [4]. Pengukuran dilakukan melalui skala Likert yang menghasilkan data numerik untuk analisis statistik.")}

                <div id="section_matrix" style={{ marginTop: 14, marginBottom: 14 }}>
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>2.2 Matriks Penelitian Terdahulu (State of the Art)</div>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9pt", margin: "8px 0" }}>
                    <thead>
                      <tr style={{ background: "#F8FAFC" }}>
                        <th style={{ border: "1px solid #334155", padding: "5px 6px", width: "5%", textAlign: "center", fontWeight: 700 }}>No</th>
                        <th style={{ border: "1px solid #334155", padding: "5px 6px", width: "22%", textAlign: "center", fontWeight: 700 }}>Penulis & Tahun</th>
                        <th style={{ border: "1px solid #334155", padding: "5px 6px", width: "30%", textAlign: "center", fontWeight: 700 }}>Judul Artikel & Publikasi</th>
                        <th style={{ border: "1px solid #334155", padding: "5px 6px", width: "20%", textAlign: "center", fontWeight: 700 }}>Variabel & Metode</th>
                        <th style={{ border: "1px solid #334155", padding: "5px 6px", width: "23%", textAlign: "center", fontWeight: 700 }}>Temuan Utama / Bukti</th>
                      </tr>
                    </thead>
                    <tbody>
                      {references.slice(0, 5).map((ref, idx) => {
                        const pubName = (ref.publication || "")
                          .replace(/\s*\(OpenAlex\)/gi, "")
                          .replace(/OpenAlex/gi, "Jurnal Ilmiah Terindeks")
                          .trim() || (ref.doi ? "Jurnal Ilmiah Nasional Terakreditasi" : "Publikasi Ilmiah Akademik");

                        return (
                          <tr key={ref.id}>
                            <td style={{ border: "1px solid #64748B", padding: "5px 6px", textAlign: "center" }}>{idx + 1}</td>
                            <td style={{ border: "1px solid #64748B", padding: "5px 6px" }}>{ref.authors} ({ref.year})</td>
                            <td style={{ border: "1px solid #64748B", padding: "5px 6px" }}>{ref.title}<br /><em>[{pubName}]</em></td>
                            <td style={{ border: "1px solid #64748B", padding: "5px 6px" }}>{ref.mappedVariables || "Variabel Riset"}<br />({ref.methodology || "Studi Empiris"})</td>
                            <td style={{ border: "1px solid #64748B", padding: "5px 6px" }}>{ref.keyFindings || "Temuan empiris relevan"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </A4Sheet>

            {/* ── PAGE 7: BAB II KERANGKA KONSEPTUAL & HIPOTESIS (HALAMAN 4) ── */}
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
                <div id="sub_2_2" style={{ fontWeight: 700, marginBottom: 8, marginTop: 0 }}>2.3 Kerangka Konseptual & Diagram Alur</div>
                {renderAcademicParagraphs(proposalData?.bab2?.kerangkaKonseptual || "Input berupa interaksi mahasiswa Informatika dengan chatbot; proses berupa pengisian kuesioner UX; output berupa skor domain acceptability, usability, usefulness, dan integration yang dianalisis secara deskriptif dan inferensial.")}

                <div id="sub_2_3" style={{ fontWeight: 700, marginBottom: 8, marginTop: 16 }}>2.4 Hipotesis Penelitian</div>
                {proposalData?.bab2?.hipotesis && proposalData.bab2.hipotesis.length > 0 ? (
                  <div style={{ paddingLeft: "1.27cm", marginBottom: 14, lineHeight: 1.8 }}>
                    {proposalData.bab2.hipotesis.map((h: string, idx: number) => (
                      <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
                        <span style={{ minWidth: 28, fontWeight: 600 }}>{h.match(/^H\d+:/) ? "" : `${idx + 1}.`}</span>
                        <span style={{ flex: 1, textAlign: "justify" }}>{h}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ paddingLeft: "1.27cm", marginBottom: 14, lineHeight: 1.8 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
                      <span style={{ minWidth: 28, fontWeight: 600 }}>H1:</span>
                      <span style={{ flex: 1, textAlign: "justify" }}>Terdapat perbedaan signifikan pada penilaian domain usability dibandingkan domain integration.</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
                      <span style={{ minWidth: 28, fontWeight: 600 }}>H0:</span>
                      <span style={{ flex: 1, textAlign: "justify" }}>Tidak terdapat perbedaan signifikan pada penilaian antar domain pengalaman pengguna.</span>
                    </div>
                  </div>
                )}

                {/* Custom sub-chapters for BAB 2 */}
                {customSubChapters
                  .filter((s) => s.chapter === "bab2" && !s.hidden)
                  .map((s) => (
                    <div key={s.id} id={s.id} style={{ marginTop: 14 }}>
                      <div style={{ fontWeight: 700, marginBottom: 6 }}>{s.title}</div>
                      {renderAcademicParagraphs(s.content)}
                    </div>
                  ))}
              </div>
            </A4Sheet>

            {/* ── PAGE 8: BAB III METODOLOGI PENELITIAN (HALAMAN 5) ── */}
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
                <div style={{ textAlign: "center", fontSize: "14pt", fontWeight: 700, textTransform: "uppercase", marginBottom: 20 }}>
                  BAB III<br />METODOLOGI PENELITIAN
                </div>

                <div id="sub_3_1" style={{ fontWeight: 700, marginBottom: 6 }}>3.1 Desain & Jenis Penelitian</div>
                {renderAcademicParagraphs(proposalData?.bab3?.desainPenelitian || "Penelitian ini menggunakan pendekatan kuantitatif dengan desain studi deskriptif eksploratif untuk mengukur domain UX pada chatbot kesehatan mental.")}

                <div id="sub_3_2" style={{ fontWeight: 700, marginBottom: 6, marginTop: 10 }}>3.2 Subjek dan Objek Penelitian</div>
                {renderAcademicParagraphs(proposalData?.bab3?.populasiSampel || "Populasi penelitian adalah mahasiswa aktif program studi S1 Informatika dengan teknik purposive sampling.")}

                <div id="sub_3_3" style={{ fontWeight: 700, marginBottom: 6, marginTop: 10 }}>3.3 Teknik Pengumpulan Data</div>
                {renderAcademicParagraphs(proposalData?.bab3?.teknikPengumpulanData || "Pengumpulan data dilakukan menggunakan kuesioner terstruktur dengan skala Likert 5 poin (1 = Sangat Tidak Setuju, 5 = Sangat Setuju).")}

                <div id="sub_3_4" style={{ fontWeight: 700, marginBottom: 6, marginTop: 10 }}>3.4 Teknik Analisis Data</div>
                {renderAcademicParagraphs(proposalData?.bab3?.teknikAnalisisData || "Data dianalisis menggunakan statistik deskriptif (mean, standard deviation) dan uji komparatif non-parametrik/parametrik untuk menguji signifikansi skor antar domain.")}

                {/* Custom sub-chapters for BAB 3 */}
                {customSubChapters
                  .filter((s) => s.chapter === "bab3" && !s.hidden)
                  .map((s) => (
                    <div key={s.id} id={s.id} style={{ marginTop: 10 }}>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>{s.title}</div>
                      {renderAcademicParagraphs(s.content)}
                    </div>
                  ))}
              </div>
            </A4Sheet>

            {/* ── PAGE 9: DAFTAR PUSTAKA (HALAMAN 6) ── */}
            <A4Sheet
              sheetId="sheet_references"
              isIncludedInPrint={pdfPageSelection.references}
              pageNumber="6"
              pageNumberPos={pageNumberPos}
              marginPreset={marginPreset}
            >
              <div
                id="section_references"
                contentEditable={isEditMode}
                suppressContentEditableWarning
                onBlur={triggerAutoSave}
                style={{ textAlign: "justify", outline: "none" }}
              >
                <div style={{ textAlign: "center", fontSize: "14pt", fontWeight: 700, textTransform: "uppercase", marginBottom: 20 }}>
                  DAFTAR PUSTAKA
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {citedReferencesList.length === 0 ? (
                    <p style={{ fontStyle: "italic", color: "#64748B", margin: "12px 0", textAlign: "center" }}>
                      (Belum ada rujukan yang disitasi di dalam naskah. Rujukan akan otomatis muncul di sini saat dikutip).
                    </p>
                  ) : (
                    citedReferencesList.map((r, idx) => {
                      const isNumbered = citationStyle === "IEEE" || citationStyle === "VANCOUVER";
                      const pubName =
                        (r.publication || "")
                          .replace(/\s*\(OpenAlex\)/gi, "")
                          .replace(/OpenAlex/gi, "Jurnal Ilmiah Terindeks")
                          .trim() ||
                        (r.doi ? "Jurnal Ilmiah Nasional Terakreditasi" : "Publikasi Ilmiah Akademik");

                      return (
                        <p
                          key={r.id || idx}
                          id={`ref-${isNumbered ? r.originalIndex : idx + 1}`}
                          onClick={(e) => handleJumpToCitationInText(r.originalIndex, r.authors, r.doi, e)}
                          style={{
                            textIndent: "-1.27cm",
                            paddingLeft: "1.27cm",
                            margin: 0,
                            lineHeight: 1.8,
                            scrollMarginTop: 80,
                            cursor: "pointer",
                            borderRadius: 4,
                            paddingTop: 3,
                            paddingBottom: 3,
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "rgba(99, 102, 241, 0.07)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                          }}
                          title="Klik rujukan ini untuk melompat kembali ke kalimat sitasi di naskah bab"
                        >
                          {isNumbered ? <strong>[{idx + 1}] </strong> : null}
                          {r.authors} ({r.year}). {r.title}. <em>{pubName}</em>.
                          {r.doi && r.doi !== "-" ? (
                            <a
                              href={r.doi.startsWith("http") ? r.doi : `https://doi.org/${r.doi}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: "#0284c7", textDecoration: "none", marginLeft: 4 }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              https://doi.org/{r.doi.replace(/^https?:\/\/doi\.org\//, "")}
                            </a>
                          ) : null}
                        </p>
                      );
                    })
                  )}
                </div>

              </div>
            </A4Sheet>

            {/* ── PAGE 8: LAMPIRAN (JIKA ADA) ── */}
            {appendixData && (
              <A4Sheet
                sheetId="sheet_appendix"
                isIncludedInPrint={pdfPageSelection.appendix}
                pageNumber="5"
                pageNumberPos={pageNumberPos}
                marginPreset={marginPreset}
              >
                <div
                  id="section_appendix"
                  contentEditable={isEditMode}
                  suppressContentEditableWarning
                  onBlur={triggerAutoSave}
                  style={{ textAlign: "justify", outline: "none" }}
                >
                  <div style={{ textAlign: "center", fontSize: "14pt", fontWeight: 700, textTransform: "uppercase", marginBottom: 24 }}>
                    LAMPIRAN
                  </div>
                  <div style={{ fontWeight: 700, marginBottom: 10, fontSize: "12pt" }}>{appendixData.title}</div>
                  <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>{appendixData.content}</div>
                </div>
              </A4Sheet>
            )}

          </div>

          {/* Bottom Canvas Info Bar */}
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
            <div suppressHydrationWarning>Page {getPageNumber(activeTab) || "1"} of 6 • Words: {wordCount.toLocaleString()} • Characters: {charCount.toLocaleString()}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span>🌐 Indonesian</span>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <button
                  type="button"
                  onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
                  style={{ border: "none", background: "transparent", cursor: "pointer", fontWeight: 700 }}
                >
                  -
                </button>
                <span>{zoomLevel}%</span>
                <button
                  type="button"
                  onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))}
                  style={{ border: "none", background: "transparent", cursor: "pointer", fontWeight: 700 }}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* ── RIGHT COLUMN: EMBEDDED AI ASSISTANT COMPANION PANEL ── */}
        {showAiAssistant && (
          <aside
            id="ai_companion_panel"
            className="no-print"
            style={{
              width: 320,
              minWidth: 320,
              background: "#FFFFFF",
              borderLeft: "1px solid #E2E8F0",
              display: "flex",
              flexDirection: "column",
              height: "calc(100vh - 105px)",
              position: "sticky",
              top: 105,
              zIndex: 20,
            }}
          >
            {/* Header */}
            <div style={{ padding: "14px 16px", borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Sparkles size={16} color="#4338CA" />
                <span style={{ fontSize: 13, fontWeight: 800, color: "#0F172A", letterSpacing: "0.02em" }}>
                  AI ASSISTANT
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAiAssistant(false)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "#94A3B8" }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Sub-Tabs: Chat, Tulis, Tinjau, Riset */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", padding: "4px 8px", borderBottom: "1px solid #F1F5F9", background: "#F8FAFC" }}>
              {[
                { id: "chat", label: "Chat" },
                { id: "tulis", label: "Tulis" },
                { id: "tinjau", label: "Tinjau" },
                { id: "riset", label: "Riset" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setAiActiveTab(tab.id as any)}
                  style={{
                    padding: "6px 0",
                    border: "none",
                    background: "transparent",
                    fontSize: 11.5,
                    fontWeight: aiActiveTab === tab.id ? 700 : 500,
                    color: aiActiveTab === tab.id ? "#4338CA" : "#64748B",
                    borderBottom: aiActiveTab === tab.id ? "2px solid #4338CA" : "2px solid transparent",
                    cursor: "pointer",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Chat Body & Quick Prompts */}
            <div style={{ flex: 1, overflowY: "auto", padding: "14px", display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Greeting Card */}
              <div style={{ background: "#F8FAFC", borderRadius: 10, padding: "12px 14px", border: "1px solid #E2E8F0" }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>
                  👋 Hai {profile?.namaLengkap ? profile.namaLengkap.split(" ")[0] : "Zeeetrea fimm"}!
                </div>
                <div style={{ fontSize: 11.5, color: "#64748B", lineHeight: 1.4 }}>
                  Saya siap membantu penulisan skripsi & proposal Anda.
                </div>
              </div>

              {/* SARAN CEPAT */}
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", marginBottom: 8, letterSpacing: "0.04em" }}>
                  SARAN CEPAT
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {[
                    { title: "Generate Outline Skripsi", desc: "Buat struktur skripsi otomatis", icon: Sparkles },
                    { title: "Generate Sub-Bab", desc: "Buat sub-bab dari topik tertentu", icon: FileEdit },
                    { title: "Cari Referensi", desc: "Cari jurnal dan referensi relevan", icon: Search },
                    { title: "Perbaiki Bahasa", desc: "Perbaiki tata bahasa dan ejaan", icon: CheckCheck },
                  ].map((s, idx) => {
                    const Icon = s.icon;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setAiInputPrompt(`Tolong ${s.title.toLowerCase()} untuk judul "${coverData.title}"`);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "8px 10px",
                          borderRadius: 8,
                          border: "1px solid #E2E8F0",
                          background: "#FFFFFF",
                          textAlign: "left",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <div style={{ width: 28, height: 28, borderRadius: 6, background: "#EEEAFE", display: "flex", alignItems: "center", justifyContent: "center", color: "#4338CA" }}>
                          <Icon size={14} />
                        </div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#0F172A" }}>{s.title}</div>
                          <div style={{ fontSize: 10.5, color: "#64748B" }}>{s.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Chat Messages */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {aiChatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    style={{
                      alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                      maxWidth: "92%",
                      padding: "10px 12px",
                      borderRadius: 10,
                      background: msg.sender === "user" ? "#4338CA" : "#F1F5F9",
                      color: msg.sender === "user" ? "#FFFFFF" : "#0F172A",
                      fontSize: 12,
                      lineHeight: 1.45,
                    }}
                  >
                    <div style={{ whiteSpace: "pre-wrap" }}>{msg.text}</div>

                    {/* Rujukan sitasi yang dipakai */}
                    {msg.usedCitations && msg.usedCitations.length > 0 && (
                      <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {msg.usedCitations.map((c, cIdx) => (
                          <span key={cIdx} style={{ fontSize: 10, background: "#E0E7FF", color: "#3730A3", padding: "2px 6px", borderRadius: 4 }}>
                            📚 {c}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Tombol aksi langsung ke naskah */}
                    {msg.sender === "ai" && msg.revisedContent && (
                      <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #CBD5E1", display: "flex", flexWrap: "wrap", gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => handleInsertAiDraftToDocument(msg.revisedContent!)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            background: "#4338CA",
                            color: "#FFFFFF",
                            border: "none",
                            borderRadius: 6,
                            padding: "4px 8px",
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          <PlusCircle size={12} />
                          <span>Sisipkan ke Naskah ({activeTab.toUpperCase()})</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(msg.revisedContent!);
                            setLastSavedTime("Draf AI disalin!");
                            setTimeout(() => setLastSavedTime(null), 2500);
                          }}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            background: "#E2E8F0",
                            color: "#334155",
                            border: "none",
                            borderRadius: 6,
                            padding: "4px 8px",
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          <Copy size={12} />
                          <span>Salin</span>
                        </button>
                      </div>
                    )}

                    <div style={{ fontSize: 9.5, opacity: 0.7, marginTop: 4, textAlign: "right" }}>{msg.time}</div>
                  </div>
                ))}
                {isAiThinking && (
                  <div style={{ alignSelf: "flex-start", padding: "8px 12px", borderRadius: 10, background: "#F1F5F9", fontSize: 11.5, color: "#64748B", display: "flex", alignItems: "center", gap: 6 }}>
                    <RefreshCw size={12} className="animate-spin" />
                    <span>Sedang merumuskan jawaban...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Input Box */}
            <div style={{ padding: "12px", borderTop: "1px solid #F1F5F9", background: "#FFFFFF" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#F8FAFC", border: "1px solid #CBD5E1", borderRadius: 10, padding: "6px 10px" }}>
                <button type="button" style={{ border: "none", background: "transparent", color: "#64748B", cursor: "pointer" }} title="Sisipkan Konteks">
                  <Paperclip size={14} />
                </button>
                <input
                  type="text"
                  placeholder="Ketik pertanyaan atau perintah..."
                  value={aiInputPrompt}
                  onChange={(e) => setAiInputPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendAiMessage()}
                  style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontSize: 12, color: "#0F172A" }}
                />
                <button
                  type="button"
                  onClick={handleSendAiMessage}
                  style={{ width: 28, height: 28, borderRadius: 6, background: "#4338CA", border: "none", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                >
                  <Send size={12} />
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          4. BOTTOM FLOATING ACTION QUICK BAR (DOCK RIBBON)
         ════════════════════════════════════════════════════════════════════════ */}
      <div
        id="floating_action_bar"
        className="floating-action-bar no-print"
        style={{
          position: "fixed",
          bottom: 16,
          left: "50%",
          transform: "translateX(-50%)",
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: 9999,
          padding: "6px 14px",
          display: "flex",
          alignItems: "center",
          gap: 6,
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.15)",
          zIndex: 35,
        }}
      >
        <button
          type="button"
          onClick={() => handleGenerateProposal()}
          style={{ background: "#F8FAFC", border: "none", borderRadius: 9999, padding: "6px 12px", fontSize: 12, fontWeight: 600, color: "#334155", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5 }}
        >
          <Sparkles size={13} color="#4338CA" />
          <span>Generate Outline</span>
        </button>

        <button
          type="button"
          onClick={() => setShowAddSubChapterModal(true)}
          style={{ background: "#F8FAFC", border: "none", borderRadius: 9999, padding: "6px 12px", fontSize: 12, fontWeight: 600, color: "#334155", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5 }}
        >
          <FileEdit size={13} color="#059669" />
          <span>Generate Sub-Bab</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("matrix")}
          style={{ background: "#F8FAFC", border: "none", borderRadius: 9999, padding: "6px 12px", fontSize: 12, fontWeight: 600, color: "#334155", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5 }}
        >
          <Search size={13} color="#2563EB" />
          <span>Cari Referensi</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setAiInputPrompt("Tolong perbaiki kalimat ini agar lebih baku secara akademis...");
            setShowAiAssistant(true);
          }}
          style={{ background: "#F8FAFC", border: "none", borderRadius: 9999, padding: "6px 12px", fontSize: 12, fontWeight: 600, color: "#334155", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5 }}
        >
          <Wand2 size={13} color="#D97706" />
          <span>Paraphrase</span>
        </button>

        <button
          type="button"
          onClick={handleDownloadDocx}
          style={{ background: "#F8FAFC", border: "none", borderRadius: 9999, padding: "6px 12px", fontSize: 12, fontWeight: 600, color: "#334155", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5 }}
        >
          <Download size={13} color="#0284C7" />
          <span>Export DOCX</span>
        </button>

        <button
          type="button"
          onClick={() => setShowPdfExportModal(true)}
          style={{ background: "#F8FAFC", border: "none", borderRadius: 9999, padding: "6px 12px", fontSize: 12, fontWeight: 600, color: "#334155", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5 }}
        >
          <Printer size={13} color="#DC2626" />
          <span>Export PDF</span>
        </button>
      </div>

      {/* ════ MODAL: TAMBAH SUB-BAB CEPAT & OTOMATIS (1-CLICK SMART PRESETS & AI) ════ */}
      {showAddSubChapterModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: 20,
          }}
        >
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 16,
              width: "100%",
              maxWidth: 680,
              padding: 24,
              border: "1px solid #E2E8F0",
              boxShadow: "0 20px 40px rgba(15, 23, 42, 0.2)",
              display: "flex",
              flexDirection: "column",
              maxHeight: "90vh",
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: "linear-gradient(135deg, #4338CA 0%, #6366F1 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFFFFF",
                  }}
                >
                  <Zap size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: "#0F172A" }}>
                    Tambah Sub-Bab Cepat & Otomatis
                  </h3>
                  <p style={{ fontSize: 12, color: "#64748B", margin: "2px 0 0" }}>
                    Pilih preset standar skripsi atau gunakan rekomendasi AI 1-klik tanpa repot atur penomoran manual.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddSubChapterModal(false)}
                style={{ background: "#F1F5F9", border: "none", borderRadius: 8, padding: "6px 8px", cursor: "pointer", color: "#64748B" }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Sub-Tabs: Presets (1-Click), Rekomendasi AI, Kustom */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 1fr 0.8fr",
                gap: 6,
                background: "#F8FAFC",
                padding: 4,
                borderRadius: 10,
                marginBottom: 16,
                border: "1px solid #E2E8F0",
              }}
            >
              {[
                { id: "presets", label: "⚡ 1-Click Preset Populer", icon: Zap },
                { id: "ai", label: "✨ Rekomendasi Pintar AI", icon: Sparkles },
                { id: "custom", label: "✍️ Tulis Kustom", icon: FileEdit },
              ].map((t) => {
                const isSelected = addSubModalTab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setAddSubModalTab(t.id as any);
                      if (t.id === "ai" && aiSuggestedSubsList.length === 0) {
                        handleGenerateAiSubSuggestions();
                      }
                    }}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "none",
                      background: isSelected ? "#FFFFFF" : "transparent",
                      color: isSelected ? "#4338CA" : "#64748B",
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: 12,
                      cursor: "pointer",
                      boxShadow: isSelected ? "0 2px 8px rgba(0,0,0,0.05)" : "none",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* TAB 1: 1-CLICK PRESETS */}
            {addSubModalTab === "presets" && (
              <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
                {/* Chapter filter pills */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                  {[
                    { id: "all", label: "Semua Bab" },
                    { id: "bab1", label: "BAB I Pendahuluan" },
                    { id: "bab2", label: "BAB II Kajian Pustaka" },
                    { id: "bab3", label: "BAB III Metodologi" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setPresetFilterChapter(f.id as any)}
                      style={{
                        padding: "5px 10px",
                        borderRadius: 20,
                        border: presetFilterChapter === f.id ? "1px solid #4338CA" : "1px solid #E2E8F0",
                        background: presetFilterChapter === f.id ? "#EEEAFE" : "#FFFFFF",
                        color: presetFilterChapter === f.id ? "#4338CA" : "#64748B",
                        fontSize: 11.5,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Grid Cards of Presets */}
                <div style={{ flex: 1, overflowY: "auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, paddingRight: 4, maxHeight: 360 }}>
                  {ACADEMIC_PRESET_ITEMS.filter(
                    (p) => presetFilterChapter === "all" || p.chapter === presetFilterChapter
                  ).map((preset) => (
                    <div
                      key={preset.id}
                      onClick={() => handleInsertPresetSubChapter(preset)}
                      style={{
                        padding: "12px 14px",
                        borderRadius: 12,
                        border: "1.5px solid #E2E8F0",
                        background: "#FAFAFA",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#4338CA";
                        e.currentTarget.style.background = "#FFFFFF";
                        e.currentTarget.style.boxShadow = "0 6px 16px rgba(67, 56, 202, 0.08)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#E2E8F0";
                        e.currentTarget.style.background = "#FAFAFA";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                          <span
                            style={{
                              fontSize: 10.5,
                              fontWeight: 800,
                              padding: "2px 7px",
                              borderRadius: 6,
                              background: "#EEEAFE",
                              color: "#4338CA",
                            }}
                          >
                            {preset.num}
                          </span>
                          <span style={{ fontSize: 10, color: "#94A3B8", fontWeight: 600 }}>{preset.badge}</span>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>
                          {preset.title}
                        </div>
                        <div style={{ fontSize: 11, color: "#64748B", lineHeight: 1.35 }}>
                          {preset.desc}
                        </div>
                      </div>

                      <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8, borderTop: "1px dashed #E2E8F0" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#4338CA" }}>+ Sisipkan 1-Klik</span>
                        <ArrowRight size={13} color="#4338CA" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: AI SMART RECOMMENDATIONS */}
            {addSubModalTab === "ai" && (
              <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ fontSize: 12, color: "#475569" }}>
                    Disesuaikan dengan judul riset: <strong>"{coverData.title}"</strong>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateAiSubSuggestions}
                    disabled={isAiSuggestingSubs}
                    style={{
                      background: "#EEEAFE",
                      border: "none",
                      borderRadius: 8,
                      padding: "5px 10px",
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: "#4338CA",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <RefreshCw size={12} className={isAiSuggestingSubs ? "animate-spin" : ""} />
                    <span>Regenerate Saran</span>
                  </button>
                </div>

                {isAiSuggestingSubs ? (
                  <div style={{ padding: 40, textAlign: "center", color: "#64748B" }}>
                    <RefreshCw size={24} className="animate-spin" style={{ margin: "0 auto 12px", color: "#4338CA" }} />
                    <div style={{ fontSize: 13, fontWeight: 600 }}>AI sedang menganalisis variabel & metodologi proposal...</div>
                  </div>
                ) : (
                  <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, maxHeight: 360 }}>
                    {aiSuggestedSubsList.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: "12px 14px",
                          borderRadius: 10,
                          border: "1px solid #E2E8F0",
                          background: "#FAFAFA",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 12,
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                            <span style={{ fontSize: 10.5, fontWeight: 800, padding: "2px 6px", borderRadius: 4, background: "#DCFCE7", color: "#166534" }}>
                              {item.chapter.toUpperCase()}
                            </span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{item.title}</span>
                          </div>
                          <div style={{ fontSize: 11, color: "#64748B" }}>{item.desc}</div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const newSub: CustomSubChapterItem = {
                              id: `sub_ai_${Date.now()}_${idx}`,
                              chapter: item.chapter,
                              level: "subbab",
                              prefix: item.chapter === "bab2" ? "2.X" : "3.X",
                              indentCm: 0,
                              title: item.title,
                              content: item.content,
                            };
                            setCustomSubChapters((prev) => [...prev, newSub]);
                            setShowAddSubChapterModal(false);
                            triggerAutoSave();
                          }}
                          style={{
                            background: "#4338CA",
                            color: "#FFFFFF",
                            border: "none",
                            borderRadius: 8,
                            padding: "6px 12px",
                            fontSize: 11.5,
                            fontWeight: 700,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}
                        >
                          + Masukkan
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: CUSTOM MANUAL */}
            {addSubModalTab === "custom" && (
              <form onSubmit={handleAddSubChapter} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>
                    Judul Sub-Bab Baru:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1.6 Batasan Masalah atau 2.5 Grand Theory"
                    value={newSubChapterTitle}
                    onChange={(e) => setNewSubChapterTitle(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13 }}
                  />
                  <span style={{ fontSize: 10.5, color: "#94A3B8", marginTop: 2, display: "block" }}>
                    *Penomoran dan indentasi margin A4 akan diatur otomatis sesuai standar akademik.
                  </span>
                </div>

                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>
                    Uraian Pembahasan Awal:
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tuliskan uraian pembahasan atau draft paragraf awal di sini..."
                    value={newSubChapterContent}
                    onChange={(e) => setNewSubChapterContent(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 12.5 }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
                  <button
                    type="button"
                    onClick={() => setShowAddSubChapterModal(false)}
                    style={{ background: "#F1F5F9", border: "1px solid #CBD5E1", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 600 }}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    style={{ background: "#4338CA", color: "#FFFFFF", border: "none", borderRadius: 8, padding: "7px 18px", fontSize: 12, fontWeight: 700 }}
                  >
                    Simpan Sub-Bab
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ════ MODAL: SISIPKAN SITASI ════ */}
      {showCitationPickerModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
          <div style={{ background: "#FFFFFF", borderRadius: 14, width: "100%", maxWidth: 560, padding: 22, border: "1px solid #CBD5E1", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "#0F172A" }}>Pilih Sitasi Referensi</h3>
                <span style={{ fontSize: 11, fontWeight: 700, background: "#EEF2FF", color: "#4338CA", padding: "2px 8px", borderRadius: 9999 }}>
                  Gaya: {citationStyle}
                </span>
              </div>
              <button onClick={() => setShowCitationPickerModal(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748B" }}>✕</button>
            </div>
            <p style={{ fontSize: 12, color: "#64748B", margin: "0 0 14px" }}>
              Klik sitasi untuk menyalin format in-text atau langsung sisipkan ke naskah sub-bab aktif ({activeTab.toUpperCase()}).
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 340, overflowY: "auto" }}>
              {references.length === 0 ? (
                <div style={{ padding: 20, textAlign: "center", color: "#64748B", fontSize: 13 }}>
                  Belum ada daftar referensi/jurnal approved.
                </div>
              ) : (
                references.map((ref, idx) => {
                  const normStyle = (citationStyle || "IEEE").toUpperCase();
                  const rawAuthor = (ref.authors || "Penulis").split(/;|\band\b|&/gi)[0].trim();
                  const primaryAuthor = rawAuthor.includes(",") ? rawAuthor.split(",")[0].trim() : (rawAuthor.split(" ").pop() || rawAuthor);
                  const year = ref.year || "2026";
                  const inTextCitation =
                    normStyle === "IEEE" || normStyle === "VANCOUVER"
                      ? `[${idx + 1}]`
                      : normStyle === "MLA"
                        ? `(${primaryAuthor})`
                        : normStyle === "CHICAGO"
                          ? `(${primaryAuthor} ${year})`
                          : `(${primaryAuthor}, ${year})`;

                  return (
                    <div
                      key={ref.id}
                      style={{
                        padding: "10px 14px",
                        borderRadius: 10,
                        border: "1px solid #E2E8F0",
                        background: "#F8FAFC",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                          <span style={{ fontSize: 11.5, fontWeight: 700, background: "#E0F2FE", color: "#0369A1", padding: "1px 7px", borderRadius: 5 }}>
                            {inTextCitation}
                          </span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#0F172A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {ref.title}
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: "#64748B" }}>
                          {ref.authors} ({ref.year}) • {ref.publication}
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                        <button
                          type="button"
                          onClick={() => {
                            handleInsertAiDraftToDocument(` ${inTextCitation} `);
                            setShowCitationPickerModal(false);
                          }}
                          style={{
                            background: "#4338CA",
                            color: "#FFFFFF",
                            border: "none",
                            borderRadius: 6,
                            padding: "5px 9px",
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          + Sisipkan
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(inTextCitation);
                            setLastSavedTime(`Sitasi ${inTextCitation} disalin!`);
                            setTimeout(() => setLastSavedTime(null), 2500);
                            setShowCitationPickerModal(false);
                          }}
                          style={{
                            background: "#E2E8F0",
                            color: "#334155",
                            border: "none",
                            borderRadius: 6,
                            padding: "5px 8px",
                            fontSize: 11,
                            cursor: "pointer",
                          }}
                        >
                          Salin
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════ FLOATING TYPO CORRECTION TOOLTIP ════ */}
      {showTypoTooltip && (
        <div
          style={{
            position: "fixed",
            left: Math.min(
              typeof window !== "undefined" ? window.innerWidth - 320 : 300,
              Math.max(20, showTypoTooltip.position.x)
            ),
            top: showTypoTooltip.position.y,
            background: "#FFFFFF",
            borderRadius: 12,
            border: "1.5px solid #EF4444",
            boxShadow: "0 10px 30px rgba(239, 68, 68, 0.25)",
            padding: "12px 16px",
            zIndex: 120,
            width: 290,
            fontFamily: "var(--font-body, 'Inter', sans-serif)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <ShieldAlert size={14} color="#DC2626" />
              <span style={{ fontSize: 11, fontWeight: 800, color: "#DC2626", textTransform: "uppercase" }}>
                Typo / Ejaan Terdeteksi
              </span>
            </div>
            <button
              onClick={() => setShowTypoTooltip(null)}
              style={{ border: "none", background: "transparent", cursor: "pointer", color: "#94A3B8" }}
            >
              ✕
            </button>
          </div>

          <div style={{ fontSize: 12.5, color: "#0F172A", marginBottom: 4 }}>
            Kata: <strong style={{ textDecoration: "line-through", color: "#DC2626" }}>{showTypoTooltip.word}</strong> ➔ <strong style={{ color: "#16A34A" }}>{showTypoTooltip.suggestion}</strong>
          </div>

          <div style={{ fontSize: 11, color: "#64748B", marginBottom: 10, lineHeight: 1.35 }}>
            {showTypoTooltip.reason}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              type="button"
              onClick={() => handleFixTypo(showTypoTooltip.word, showTypoTooltip.suggestion)}
              style={{
                flex: 1,
                background: "#16A34A",
                color: "#FFFFFF",
                border: "none",
                borderRadius: 6,
                padding: "6px 10px",
                fontSize: 11.5,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              ✓ Ganti "{showTypoTooltip.suggestion}"
            </button>
            <button
              type="button"
              onClick={() => setShowTypoTooltip(null)}
              style={{
                background: "#F1F5F9",
                color: "#64748B",
                border: "none",
                borderRadius: 6,
                padding: "6px 10px",
                fontSize: 11.5,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Abaikan
            </button>
          </div>
        </div>
      )}
      {/* ── MODAL PENGATURAN IDENTITAS MAHASISWA & KAMPUS ── */}
      {showIdentityModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 150,
            padding: 20,
          }}
        >
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 16,
              maxWidth: 680,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              border: "1px solid #E2E8F0",
              padding: 24,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, borderBottom: "1px solid #E2E8F0", paddingBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Building size={20} color="#4338CA" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#0F172A" }}>
                    Data Identitas Peneliti &amp; Kampus
                  </h3>
                  <p style={{ margin: 0, fontSize: 12, color: "#64748B" }}>
                    Data ini akan otomatis disinkronkan ke Halaman Sampul, Lembar Pengesahan, dan Ekspor Dokumen
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIdentityModal(false)}
                style={{ border: "none", background: "transparent", cursor: "pointer", color: "#94A3B8" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ gridColumn: "span 2" }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}>
                  Judul Proposal / Skripsi
                </label>
                <input
                  type="text"
                  value={coverData.title}
                  onChange={(e) => setCoverData({ ...coverData, title: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}>
                  Nama Lengkap Mahasiswa
                </label>
                <input
                  type="text"
                  value={coverData.author}
                  onChange={(e) => setCoverData({ ...coverData, author: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13 }}
                  placeholder="Contoh: Dinar Rahmawati"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}>
                  Nomor Induk Mahasiswa (NIM)
                </label>
                <input
                  type="text"
                  value={coverData.nim}
                  onChange={(e) => setCoverData({ ...coverData, nim: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13 }}
                  placeholder="Contoh: 1301213000"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}>
                  Perguruan Tinggi / Universitas
                </label>
                <input
                  type="text"
                  value={coverData.universitas}
                  onChange={(e) => setCoverData({ ...coverData, universitas: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13 }}
                  placeholder="Contoh: Universitas Telkom"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}>
                  Fakultas
                </label>
                <input
                  type="text"
                  value={coverData.fakultas}
                  onChange={(e) => setCoverData({ ...coverData, fakultas: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13 }}
                  placeholder="Contoh: Fakultas Informatika"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}>
                  Program Studi
                </label>
                <input
                  type="text"
                  value={coverData.prodi}
                  onChange={(e) => setCoverData({ ...coverData, prodi: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13 }}
                  placeholder="Contoh: S1 Informatika"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}>
                  Kota Institusi / Kampus
                </label>
                <input
                  type="text"
                  value={coverData.kota || ""}
                  onChange={(e) => setCoverData({ ...coverData, kota: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13 }}
                  placeholder="Contoh: Bandung"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}>
                  Tahun Akademik
                </label>
                <input
                  type="text"
                  value={coverData.year}
                  onChange={(e) => setCoverData({ ...coverData, year: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13 }}
                />
              </div>

              <div style={{ gridColumn: "span 2", borderTop: "1px dashed #E2E8F0", paddingTop: 12, marginTop: 6 }}>
                <div style={{ fontSize: 12.5, fontWeight: 800, color: "#4338CA", marginBottom: 8 }}>
                  Tempat &amp; Tanggal Persetujuan (Lembar Pengesahan)
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.5fr 1fr", gap: 8 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 2 }}>
                      Kota / Tempat
                    </label>
                    <input
                      type="text"
                      value={approvalData.kota || coverData.kota || ""}
                      onChange={(e) => setApprovalData({ ...approvalData, kota: e.target.value })}
                      placeholder="Bandung"
                      style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 12 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 2 }}>
                      Tanggal
                    </label>
                    <input
                      type="text"
                      value={approvalData.dateDay}
                      onChange={(e) => setApprovalData({ ...approvalData, dateDay: e.target.value })}
                      placeholder="2"
                      style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 12 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 2 }}>
                      Bulan
                    </label>
                    <input
                      type="text"
                      value={approvalData.dateMonth}
                      onChange={(e) => setApprovalData({ ...approvalData, dateMonth: e.target.value })}
                      placeholder="Oktober"
                      style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 12 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 2 }}>
                      Tahun
                    </label>
                    <input
                      type="text"
                      value={approvalData.dateYear}
                      onChange={(e) => setApprovalData({ ...approvalData, dateYear: e.target.value })}
                      placeholder="2026"
                      style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 12 }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ gridColumn: "span 2", borderTop: "1px dashed #E2E8F0", paddingTop: 12, marginTop: 6 }}>
                <div style={{ fontSize: 12.5, fontWeight: 800, color: "#4338CA", marginBottom: 8 }}>
                  Dewan Pembimbing &amp; Kaprodi (Lembar Pengesahan)
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "#475569", marginBottom: 3 }}>
                  Dosen Pembimbing 1
                </label>
                <input
                  type="text"
                  value={approvalData.pembimbing1}
                  onChange={(e) => setApprovalData({ ...approvalData, pembimbing1: e.target.value })}
                  style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 12 }}
                />
                <input
                  type="text"
                  value={approvalData.nipPembimbing1}
                  onChange={(e) => setApprovalData({ ...approvalData, nipPembimbing1: e.target.value })}
                  placeholder="NIP / NIDN"
                  style={{ width: "100%", padding: "5px 10px", borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 11.5, marginTop: 4 }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "#475569", marginBottom: 3 }}>
                  Dosen Pembimbing 2
                </label>
                <input
                  type="text"
                  value={approvalData.pembimbing2}
                  onChange={(e) => setApprovalData({ ...approvalData, pembimbing2: e.target.value })}
                  style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 12 }}
                />
                <input
                  type="text"
                  value={approvalData.nipPembimbing2}
                  onChange={(e) => setApprovalData({ ...approvalData, nipPembimbing2: e.target.value })}
                  placeholder="NIP / NIDN"
                  style={{ width: "100%", padding: "5px 10px", borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 11.5, marginTop: 4 }}
                />
              </div>

              <div style={{ gridColumn: "span 2" }}>
                <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "#475569", marginBottom: 3 }}>
                  Ketua Program Studi (Kaprodi)
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <input
                    type="text"
                    value={approvalData.kaprodi}
                    onChange={(e) => setApprovalData({ ...approvalData, kaprodi: e.target.value })}
                    style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 12 }}
                    placeholder="Nama Kaprodi & Gelar"
                  />
                  <input
                    type="text"
                    value={approvalData.nipKaprodi}
                    onChange={(e) => setApprovalData({ ...approvalData, nipKaprodi: e.target.value })}
                    style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 12 }}
                    placeholder="NIP Kaprodi"
                  />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20, borderTop: "1px solid #E2E8F0", paddingTop: 14 }}>
              <button
                type="button"
                onClick={() => setShowIdentityModal(false)}
                style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #CBD5E1", background: "#F8FAFC", fontSize: 12.5, fontWeight: 600, color: "#475569", cursor: "pointer" }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowIdentityModal(false);
                  triggerAutoSave();
                  // Simpan profil ke backend UserProfile jika ada field profile
                  if (coverData.author) {
                    api.profile.upsert({
                      namaLengkap: coverData.author,
                      nim: coverData.nim || "12345678",
                      universitas: coverData.universitas || "Universitas",
                      fakultas: coverData.fakultas || "Fakultas",
                      programStudi: coverData.prodi || "Program Studi",
                      kota: coverData.kota || "Bandung",
                    }).catch(() => { });
                  }
                }}
                style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "#4338CA", fontSize: 12.5, fontWeight: 700, color: "#FFFFFF", cursor: "pointer" }}
              >
                ✓ Simpan Identitas &amp; Update Cover
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ════ MODAL: PENGATURAN CETAK & EKSPOR PDF (A4 STANDAR WORD / SKRIPSI) ════ */}
      {showPdfExportModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.55)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: 20,
          }}
        >
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 16,
              width: "100%",
              maxWidth: 620,
              boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
              border: "1px solid #E2E8F0",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              maxHeight: "90vh",
            }}
          >
            {/* Modal Header */}
            <div style={{ padding: "18px 24px", borderBottom: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#F8FAFC" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Printer size={20} color="#DC2626" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#0F172A" }}>
                    Pengaturan Cetak &amp; Ekspor PDF (A4 Kertas Bersih)
                  </h3>
                  <p style={{ margin: 0, fontSize: 12, color: "#64748B" }}>
                    Pilih halaman yang ingin dicetak tanpa tampilan website / tombol toolbar
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPdfExportModal(false)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "#94A3B8" }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "20px 24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 18 }}>
              {/* Quick Preset Buttons */}
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: "#475569", textTransform: "uppercase", marginBottom: 8, letterSpacing: "0.03em" }}>
                  Pilihan Cepat Halaman:
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() =>
                      setPdfPageSelection({
                        cover: true,
                        approval: true,
                        abstract: true,
                        bab1: true,
                        bab2: true,
                        bab3: true,
                        references: true,
                        appendix: true,
                      })
                    }
                    style={{
                      padding: "6px 12px",
                      borderRadius: 8,
                      border: "1px solid #CBD5E1",
                      background: "#F1F5F9",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#334155",
                      cursor: "pointer",
                    }}
                  >
                    ✓ Pilih Semua Halaman
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setPdfPageSelection({
                        cover: false,
                        approval: false,
                        abstract: false,
                        bab1: true,
                        bab2: true,
                        bab3: true,
                        references: true,
                        appendix: false,
                      })
                    }
                    style={{
                      padding: "6px 12px",
                      borderRadius: 8,
                      border: "1px solid #CBD5E1",
                      background: "#F1F5F9",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#334155",
                      cursor: "pointer",
                    }}
                  >
                    📖 Hanya Naskah Utama (Bab 1-3 + Pustaka)
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setPdfPageSelection({
                        cover: true,
                        approval: true,
                        abstract: false,
                        bab1: false,
                        bab2: false,
                        bab3: false,
                        references: false,
                        appendix: false,
                      })
                    }
                    style={{
                      padding: "6px 12px",
                      borderRadius: 8,
                      border: "1px solid #CBD5E1",
                      background: "#F1F5F9",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#334155",
                      cursor: "pointer",
                    }}
                  >
                    ✍️ Cover &amp; Lembar Persetujuan
                  </button>
                </div>
              </div>

              {/* Checklist Selection of Pages */}
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: "#475569", textTransform: "uppercase", marginBottom: 8, letterSpacing: "0.03em" }}>
                  Daftar Lembar yang Akan Dicetak ke PDF:
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { key: "cover", label: "Halaman Sampul / Judul (Cover)", tag: "Cover" },
                    { key: "approval", label: "Lembar Persetujuan / Pengesahan", tag: "Hal. i" },
                    { key: "abstract", label: "Abstrak & Abstract (Bilingual)", tag: "Hal. ii" },
                    { key: "bab1", label: "BAB I: Pendahuluan", tag: "Hal. 1" },
                    { key: "bab2", label: "BAB II: Tinjauan Pustaka & Matriks", tag: "Hal. 2" },
                    { key: "bab3", label: "BAB III: Metodologi Penelitian", tag: "Hal. 3" },
                    { key: "references", label: "DAFTAR PUSTAKA", tag: "Hal. 4" },
                    { key: "appendix", label: "Lampiran Instrumen", tag: "Hal. 5" },
                  ].map((p) => {
                    const isChecked = (pdfPageSelection as any)[p.key];
                    return (
                      <label
                        key={p.key}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "10px 12px",
                          borderRadius: 8,
                          border: isChecked ? "1.5px solid #4338CA" : "1px solid #E2E8F0",
                          background: isChecked ? "#EEF2FF" : "#FFFFFF",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) =>
                              setPdfPageSelection((prev) => ({
                                ...prev,
                                [p.key]: e.target.checked,
                              }))
                            }
                            style={{ cursor: "pointer", accentColor: "#4338CA" }}
                          />
                          <span style={{ fontSize: 12.5, fontWeight: isChecked ? 700 : 500, color: isChecked ? "#1E1B4B" : "#475569" }}>
                            {p.label}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: 10.5,
                            fontWeight: 700,
                            padding: "2px 6px",
                            borderRadius: 4,
                            background: isChecked ? "#C7D2FE" : "#F1F5F9",
                            color: isChecked ? "#3730A3" : "#64748B",
                          }}
                        >
                          {p.tag}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Margin & Page Number Options */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, paddingTop: 10, borderTop: "1px dashed #E2E8F0" }}>
                <div>
                  <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    Preset Margin Kertas (A4):
                  </label>
                  <select
                    value={marginPreset}
                    onChange={(e) => setMarginPreset(e.target.value as any)}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: 8,
                      border: "1px solid #CBD5E1",
                      fontSize: 12,
                      background: "#FFFFFF",
                      color: "#334155",
                    }}
                  >
                    <option value="4333">4-3-3-3 cm (Kiri 4, Atas 3, Bawah 3, Kanan 3)</option>
                    <option value="4433">4-4-3-3 cm (Kiri 4, Atas 4, Bawah 3, Kanan 3)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    Posisi Nomor Halaman:
                  </label>
                  <select
                    value={pageNumberPos}
                    onChange={(e) => setPageNumberPos(e.target.value as any)}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: 8,
                      border: "1px solid #CBD5E1",
                      fontSize: 12,
                      background: "#FFFFFF",
                      color: "#334155",
                    }}
                  >
                    <option value="bottom-right">Kanan Bawah (Standar Skripsi)</option>
                    <option value="bottom-center">Tengah Bawah</option>
                    <option value="top-right">Kanan Atas</option>
                    <option value="bottom-left">Kiri Bawah</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div style={{ padding: "14px 24px", borderTop: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#F8FAFC" }}>
              <div style={{ fontSize: 11.5, color: "#64748B" }}>
                💡 Tip: Pilih printer <strong>&quot;Save as PDF&quot;</strong> pada dialog browser Anda.
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowPdfExportModal(false)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "1px solid #CBD5E1",
                    background: "#FFFFFF",
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: "#475569",
                    cursor: "pointer",
                  }}
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPdfExportModal(false);
                    setTimeout(() => {
                      window.print();
                    }, 200);
                  }}
                  style={{
                    padding: "8px 20px",
                    borderRadius: 8,
                    border: "none",
                    background: "#DC2626",
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: "#FFFFFF",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    boxShadow: "0 4px 12px rgba(220, 38, 38, 0.25)",
                  }}
                >
                  <Printer size={14} />
                  <span>🖨️ Cetak / Simpan PDF (A4)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════ GLOBAL PRINT STYLESHEET FOR PERFECT A4 EXPORT ════ */}
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
          /* Sembunyikan SEMUA elemen UI chrome website */
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
          /* Hilangkan background abu-abu dan padding pada canvas main */
          main {
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            display: block !important;
          }
          /* Tampilkan hanya area lembar naskah A4 */
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
          /* Pastikan paragraf panjang tidak terpotong */
          p, div {
            orphans: 3 !important;
            widows: 3 !important;
          }
          /* Hilangkan warna biru / ungu dan paksa warna teks hitam formal */
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

