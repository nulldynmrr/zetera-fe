"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  RotateCcw,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  CheckCircle2,
  ListTree,
  FileText,
  Info,
  Layers,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProjectSidebar } from "@/components/ui/ProjectSidebar";
import { useRequireAuth } from "@/lib/auth-context";
import { api, type ResearchProject } from "@/lib/api-client";

interface SubChapter {
  id: string;
  itemId: string;
  title: string;
  depth: number;
}

interface BabStructure {
  babNumber: number;
  roman: string;
  title: string;
  subChapters: SubChapter[];
}

function getApproachBasedBabs(approachType?: string, title?: string): BabStructure[] {
  const isQual = approachType === "QUALITATIVE";

  if (isQual) {
    return [
      {
        babNumber: 1,
        roman: "BAB I",
        title: "Pendahuluan",
        subChapters: [
          { id: "1.1", itemId: "1.1", title: "Latar Belakang", depth: 2 },
          { id: "1.2", itemId: "1.2", title: "Identifikasi Masalah", depth: 2 },
          { id: "1.3", itemId: "1.3", title: "Rumusan Masalah", depth: 2 },
          { id: "1.4", itemId: "1.4", title: "Batasan Masalah", depth: 2 },
          { id: "1.5", itemId: "1.5", title: "Tujuan Penelitian", depth: 2 },
          { id: "1.6", itemId: "1.6", title: "Manfaat Penelitian", depth: 2 },
          { id: "1.7", itemId: "1.7", title: "Sistematika Penulisan", depth: 2 },
        ],
      },
      {
        babNumber: 2,
        roman: "BAB II",
        title: "Tinjauan Pustaka / Landasan Teori",
        subChapters: [
          { id: "2.1", itemId: "2.1", title: "Landasan Teori", depth: 2 },
          { id: "2.2", itemId: "2.2", title: "Penelitian Terdahulu", depth: 2 },
          { id: "2.3", itemId: "2.3", title: "Kerangka Berpikir", depth: 2 },
        ],
      },
      {
        babNumber: 3,
        roman: "BAB III",
        title: "Metodologi Penelitian",
        subChapters: [
          { id: "3.1", itemId: "3.1", title: "Jenis/Pendekatan Penelitian", depth: 2 },
          { id: "3.2", itemId: "3.2", title: "Objek/Subjek dan Lokasi Penelitian", depth: 2 },
          { id: "3.3", itemId: "3.3", title: "Subjek Penelitian atau Informan", depth: 2 },
          { id: "3.4", itemId: "3.4", title: "Teknik Pengumpulan Data", depth: 2 },
          { id: "3.5", itemId: "3.5", title: "Instrumen Penelitian", depth: 2 },
          { id: "3.6", itemId: "3.6", title: "Teknik Analisis Data", depth: 2 },
          { id: "3.7", itemId: "3.7", title: "Uji Keabsahan Data", depth: 2 },
        ],
      },
      {
        babNumber: 4,
        roman: "BAB IV",
        title: "Hasil dan Pembahasan",
        subChapters: [
          { id: "4.1", itemId: "4.1", title: "Gambaran Umum & Konteks Penelitian", depth: 2 },
          { id: "4.2", itemId: "4.2", title: "Temuan Lapangan & Analisis Tema", depth: 2 },
          { id: "4.3", itemId: "4.3", title: "Pembahasan & Konfirmasi Teori", depth: 2 },
        ],
      },
      {
        babNumber: 5,
        roman: "BAB V",
        title: "Kesimpulan dan Saran",
        subChapters: [
          { id: "5.1", itemId: "5.1", title: "Kesimpulan", depth: 2 },
          { id: "5.2", itemId: "5.2", title: "Implikasi Praktis & Saran Penelitian Lanjutan", depth: 2 },
        ],
      },
    ];
  }

  return [
    {
      babNumber: 1,
      roman: "BAB I",
      title: "Pendahuluan",
      subChapters: [
        { id: "1.1", itemId: "1.1", title: "Latar Belakang", depth: 2 },
        { id: "1.2", itemId: "1.2", title: "Identifikasi Masalah", depth: 2 },
        { id: "1.3", itemId: "1.3", title: "Rumusan Masalah", depth: 2 },
        { id: "1.4", itemId: "1.4", title: "Batasan Masalah", depth: 2 },
        { id: "1.5", itemId: "1.5", title: "Tujuan Penelitian", depth: 2 },
        { id: "1.6", itemId: "1.6", title: "Manfaat Penelitian", depth: 2 },
        { id: "1.7", itemId: "1.7", title: "Sistematika Penulisan", depth: 2 },
      ],
    },
    {
      babNumber: 2,
      roman: "BAB II",
      title: "Tinjauan Pustaka / Landasan Teori",
      subChapters: [
        { id: "2.1", itemId: "2.1", title: "Landasan Teori", depth: 2 },
        { id: "2.2", itemId: "2.2", title: "Penelitian Terdahulu", depth: 2 },
        { id: "2.3", itemId: "2.3", title: "Kerangka Berpikir", depth: 2 },
        { id: "2.4", itemId: "2.4", title: "Hipotesis Penelitian", depth: 2 },
      ],
    },
    {
      babNumber: 3,
      roman: "BAB III",
      title: "Metodologi Penelitian",
      subChapters: [
        { id: "3.1", itemId: "3.1", title: "Jenis/Pendekatan Penelitian", depth: 2 },
        { id: "3.2", itemId: "3.2", title: "Objek/Subjek dan Lokasi Penelitian", depth: 2 },
        { id: "3.3", itemId: "3.3", title: "Populasi dan Sampel", depth: 2 },
        { id: "3.4", itemId: "3.4", title: "Teknik Pengumpulan Data", depth: 2 },
        { id: "3.5", itemId: "3.5", title: "Instrumen Penelitian", depth: 2 },
        { id: "3.6", itemId: "3.6", title: "Definisi Operasional Variabel", depth: 2 },
        { id: "3.7", itemId: "3.7", title: "Teknik Analisis Data", depth: 2 },
        { id: "3.8", itemId: "3.8", title: "Uji Validitas dan Reliabilitas", depth: 2 },
      ],
    },
    {
      babNumber: 4,
      roman: "BAB IV",
      title: "Hasil dan Pembahasan",
      subChapters: [
        { id: "4.1", itemId: "4.1", title: "Hasil Pengumpulan & Karakteristik Data", depth: 2 },
        { id: "4.2", itemId: "4.2", title: "Hasil Eksperimen & Pengujian Model", depth: 2 },
        { id: "4.3", itemId: "4.3", title: "Analisis & Pembahasan Temuan", depth: 2 },
      ],
    },
    {
      babNumber: 5,
      roman: "BAB V",
      title: "Kesimpulan dan Saran",
      subChapters: [
        { id: "5.1", itemId: "5.1", title: "Kesimpulan", depth: 2 },
        { id: "5.2", itemId: "5.2", title: "Saran & Pengembangan Riset Selanjutnya", depth: 2 },
      ],
    },
  ];
}

export default function CustomBabSetupPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;
  const { user } = useRequireAuth();

  const [project, setProject] = useState<ResearchProject | null>(null);
  const [isCustomEnabled, setIsCustomEnabled] = useState(true);
  const [babs, setBabs] = useState<BabStructure[]>(getApproachBasedBabs("QUANTITATIVE"));
  const [expandedBabs, setExpandedBabs] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: false,
    5: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [suggestingBab, setSuggestingBab] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadOutlineSetup = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const pRes = await api.projects.get(projectId);
      let fetchedProject: ResearchProject | null = null;
      if (pRes.success) {
        fetchedProject = pRes.data;
        setProject(pRes.data);
      }

      const res = await api.projects.customOutline.get(projectId);
      if (res.success && res.data?.customOutline && Array.isArray(res.data.customOutline) && res.data.customOutline.length > 0) {
        const normalized = res.data.customOutline.map((b: any) => ({
          ...b,
          subChapters: Array.isArray(b.subChapters) ? b.subChapters : [],
        }));
        setBabs(normalized);
        setIsCustomEnabled(true);
      } else {
        const defaultList = getApproachBasedBabs(fetchedProject?.approachType || undefined, fetchedProject?.title || undefined);
        const normalized = defaultList.map((b: any) => ({
          ...b,
          subChapters: Array.isArray(b.subChapters) ? b.subChapters : [],
        }));
        setBabs(normalized);
        setIsCustomEnabled(true);
      }
    } catch (err) {
      console.error("Gagal memuat struktur bab:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadOutlineSetup();
  }, [loadOutlineSetup]);

  const toggleBab = (babNum: number) => {
    setExpandedBabs((prev) => ({ ...prev, [babNum]: !prev[babNum] }));
  };

  const handleSubChapterChange = (babNum: number, subIndex: number, newTitle: string) => {
    setBabs((prev) =>
      prev.map((b) => {
        if (b.babNumber !== babNum) return b;
        const newSubs = [...(b.subChapters || [])];
        newSubs[subIndex] = { ...newSubs[subIndex], title: newTitle };
        return { ...b, subChapters: newSubs };
      })
    );
  };

  const handleAddSubChapter = (babNum: number) => {
    setBabs((prev) =>
      prev.map((b) => {
        if (b.babNumber !== babNum) return b;
        const currentSubs = b.subChapters || [];
        // Cari nomor sub-bab utama tertinggi di bab ini (misal 2.1, 2.2, 2.3 -> max = 3)
        let maxIndex = 0;
        currentSubs.forEach((sub) => {
          const parts = sub.itemId.split(".");
          if (parts.length === 2 && parseInt(parts[0], 10) === babNum) {
            const num = parseInt(parts[1], 10);
            if (!isNaN(num) && num > maxIndex) maxIndex = num;
          }
        });
        const nextNum = maxIndex > 0 ? maxIndex + 1 : currentSubs.length + 1;
        const newId = `${babNum}.${nextNum}`;
        return {
          ...b,
          subChapters: [
            ...currentSubs,
            { id: newId, itemId: newId, title: `Sub-bab Baru ${nextNum}`, depth: 2 },
          ],
        };
      })
    );
  };

  const handleAddChildSubChapter = (babNum: number, parentIndex: number) => {
    setBabs((prev) =>
      prev.map((b) => {
        if (b.babNumber !== babNum) return b;
        const currentSubs = b.subChapters || [];
        const parent = currentSubs[parentIndex];
        if (!parent) return b;

        // Ambil prefix utama, misal "2.2"
        const parentPrefix = parent.itemId;
        let maxChildNum = 0;
        let insertIndex = parentIndex;

        currentSubs.forEach((sub, sIdx) => {
          if (sub.itemId.startsWith(parentPrefix + ".")) {
            const childSuffix = sub.itemId.slice(parentPrefix.length + 1);
            const num = parseInt(childSuffix, 10);
            if (!isNaN(num) && num > maxChildNum) maxChildNum = num;
            insertIndex = Math.max(insertIndex, sIdx);
          }
        });

        const nextChildNum = maxChildNum + 1;
        const newChildId = `${parentPrefix}.${nextChildNum}`;
        const newChild: SubChapter = {
          id: newChildId,
          itemId: newChildId,
          title: `Sub-sub ${parent.title} ${nextChildNum}`,
          depth: 3,
        };

        const newSubs = [...currentSubs];
        newSubs.splice(insertIndex + 1, 0, newChild);
        return { ...b, subChapters: newSubs };
      })
    );
  };

  const handleDeleteSubChapter = (babNum: number, subIndex: number) => {
    setBabs((prev) =>
      prev.map((b) => {
        if (b.babNumber !== babNum) return b;
        const newSubs = (b.subChapters || []).filter((_, idx) => idx !== subIndex);
        return { ...b, subChapters: newSubs };
      })
    );
  };

  const handleResetBab = (babNum: number) => {
    const defaultList = getApproachBasedBabs(project?.approachType || undefined, project?.title || undefined);
    const defaultBab = defaultList.find((b: BabStructure) => b.babNumber === babNum);
    if (!defaultBab) return;
    setBabs((prev) =>
      prev.map((b) => (b.babNumber === babNum ? JSON.parse(JSON.stringify(defaultBab)) : b))
    );
  };

  const handleAiSuggest = async (babNum: number) => {
    setSuggestingBab(babNum);
    try {
      const currentBab = babs.find((b) => b.babNumber === babNum);
      const res = await api.projects.customOutline.suggest(projectId, {
        babNumber: babNum,
        currentOutline: currentBab?.subChapters || [],
      });
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setBabs((prev) =>
          prev.map((b) => {
            if (b.babNumber !== babNum) return b;
            const newSubs: SubChapter[] = res.data.map((item, idx) => ({
              id: item.itemId || `${babNum}.${idx + 1}`,
              itemId: item.itemId || `${babNum}.${idx + 1}`,
              title: item.title,
              depth: (item.itemId?.split(".").length || 2),
            }));
            return { ...b, subChapters: newSubs };
          })
        );
        setMessage(`AI berhasil menyarankan ${res.data.length} sub-bab untuk BAB ${babNum}`);
        setTimeout(() => setMessage(null), 4000);
      }
    } catch (err: any) {
      console.error("AI suggestion failed:", err);
    } finally {
      setSuggestingBab(null);
    }
  };

  const handleSaveAndProceed = async () => {
    setSaving(true);
    try {
      const sanitized = babs.map((b) => ({
        ...b,
        subChapters: Array.isArray(b.subChapters) ? b.subChapters : [],
      }));
      const res = await api.projects.customOutline.save(projectId, sanitized);
      if (res.success) {
        // Redirect to Outline Blueprint
        router.push(`/projects/${projectId}/outline`);
      }
    } catch (err: any) {
      console.error("Gagal menyimpan struktur bab:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
        <ProjectSidebar activeTab="outline" projectId={projectId} />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#64748b" }}>
            <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span>Memuat struktur bab & Daftar Isi...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <ProjectSidebar activeTab="outline" projectId={projectId} />

      <main style={{ flex: 1, padding: "28px 36px", overflowY: "auto" }}>
        {/* Back Navigation Button */}
        <div style={{ marginBottom: 16 }}>
          <Link href={`/projects/${projectId}/outline`} style={{ textDecoration: "none" }}>
            <button
              type="button"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                fontWeight: 600,
                color: "#475569",
                background: "#ffffff",
                border: "1px solid #cbd5e1",
                padding: "7px 14px",
                borderRadius: 8,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#059669";
                e.currentTarget.style.borderColor = "#a7f3d0";
                e.currentTarget.style.background = "#ecfdf5";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#475569";
                e.currentTarget.style.borderColor = "#cbd5e1";
                e.currentTarget.style.background = "#ffffff";
              }}
            >
              <ArrowLeft size={15} />
              <span>Kembali ke Outline Blueprint</span>
            </button>
          </Link>
        </div>

        {/* Header Hero Card */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: 16,
            border: "1px solid #e2e8f0",
            padding: "20px 24px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "#ecfdf5",
                  color: "#059669",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <ListTree size={20} />
              </div>
              <div>
                <h1 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                  Susun Struktur Bab &amp; Daftar Isi
                </h1>
                <p style={{ fontSize: 12.5, color: "#64748b", margin: "2px 0 0" }}>
                  Ketik manual atau gunakan <strong>✨ Sarankan AI</strong> untuk menyesuaikan sub-bab dengan topik skripsi Anda.
                </p>
              </div>
            </div>

            {/* Actions: Back & Save */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Link href={`/projects/${projectId}/outline`} style={{ textDecoration: "none" }}>
                <Button variant="secondary" size="md" style={{ gap: 6 }}>
                  <ArrowLeft size={15} /> Batal
                </Button>
              </Link>
              <Button
                onClick={handleSaveAndProceed}
                disabled={saving}
                variant="primary"
                size="md"
                style={{ gap: 8, padding: "9px 20px" }}
              >
                {saving ? "Menyimpan..." : "✓ Simpan & Buka Outline"}
                <ArrowRight size={15} />
              </Button>
            </div>
          </div>

          {/* Feedback banner */}
          {message && (
            <div
              style={{
                marginTop: 16,
                padding: "10px 16px",
                borderRadius: 8,
                background: "#ecfdf5",
                border: "1px solid #a7f3d0",
                color: "#065f46",
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <CheckCircle2 size={16} color="#059669" />
              {message}
            </div>
          )}

          {/* Project Topic Reference Note */}
          <div
            style={{
              marginTop: 18,
              padding: "12px 16px",
              borderRadius: 10,
              background: "#f8fafc",
              border: "1px solid #f1f5f9",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, color: "#059669", background: "#ecfdf5", padding: "3px 8px", borderRadius: 6 }}>
              FOKUS RISET
            </span>
            <span style={{ fontSize: 13, color: "#334155", fontWeight: 600 }}>
              {project?.title || "Proposal Skripsi"}
            </span>
            <span style={{ fontSize: 12, color: "#94a3b8", marginLeft: "auto" }}>
              Pendekatan: <strong>{project?.approachType || "QUANTITATIVE"}</strong>
            </span>
          </div>
        </div>

        {/* Tree Editor List of Babs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {babs.map((bab) => {
            const isExpanded = expandedBabs[bab.babNumber] !== false;
            const isSuggesting = suggestingBab === bab.babNumber;

            return (
              <div
                key={bab.babNumber}
                style={{
                  background: "#ffffff",
                  borderRadius: 14,
                  border: "1px solid #e2e8f0",
                  overflow: "hidden",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.02)",
                }}
              >
                {/* BAB Card Header */}
                <div
                  onClick={() => toggleBab(bab.babNumber)}
                  style={{
                    padding: "14px 20px",
                    background: isExpanded ? "#f8fafc" : "#ffffff",
                    borderBottom: isExpanded ? "1px solid #e2e8f0" : "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span
                      style={{
                        fontSize: 11.5,
                        fontWeight: 700,
                        background: "#0f172a",
                        color: "#ffffff",
                        padding: "3px 10px",
                        borderRadius: 6,
                        letterSpacing: "0.04em",
                      }}
                    >
                      {bab.roman}
                    </span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
                      {bab.roman} {bab.title}
                    </span>
                    <span style={{ fontSize: 12, color: "#94a3b8" }}>
                      ({(bab.subChapters || []).length} sub-bab)
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {isExpanded ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#64748b" />}
                  </div>
                </div>

                {/* Sub-Chapters Input Fields */}
                {isExpanded && (
                  <div style={{ padding: "18px 20px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {(bab.subChapters || []).map((sub, idx) => {
                        const isSubSub = sub.depth === 3 || sub.itemId.split(".").length > 2;

                        return (
                          <div
                            key={sub.id || idx}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              marginLeft: isSubSub ? 28 : 0,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 12,
                                fontWeight: 700,
                                color: isSubSub ? "#0284c7" : "#475569",
                                width: isSubSub ? 45 : 36,
                                textAlign: "right",
                                flexShrink: 0,
                              }}
                            >
                              {sub.itemId}
                            </span>
                            <input
                              type="text"
                              value={sub.title}
                              onChange={(e) => handleSubChapterChange(bab.babNumber, idx, e.target.value)}
                              placeholder="Ketik judul sub-bab..."
                              style={{
                                flex: 1,
                                padding: "9px 14px",
                                borderRadius: 8,
                                border: "1px solid #cbd5e1",
                                background: isSubSub ? "#f0f9ff" : "#ffffff",
                                fontSize: 13.5,
                                color: "#0f172a",
                                outline: "none",
                                transition: "all 0.15s",
                              }}
                              onFocus={(e) => (e.target.style.borderColor = "#00C988")}
                              onBlur={(e) => (e.target.style.borderColor = "#cbd5e1")}
                            />
                            {!isSubSub && (
                              <button
                                type="button"
                                onClick={() => handleAddChildSubChapter(bab.babNumber, idx)}
                                title={`Tambah anakan/sub-sub bab di bawah ${sub.itemId} (misal ${sub.itemId}.1)`}
                                style={{
                                  background: "#f0f9ff",
                                  border: "1px solid #bae6fd",
                                  color: "#0284c7",
                                  fontSize: 11.5,
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  padding: "5px 9px",
                                  borderRadius: 6,
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 3,
                                  whiteSpace: "nowrap",
                                  transition: "all 0.15s",
                                }}
                              >
                                <Plus size={12} />
                                + Anakan
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteSubChapter(bab.babNumber, idx)}
                              title="Hapus sub-bab"
                              style={{
                                background: "none",
                                border: "none",
                                color: "#94a3b8",
                                cursor: "pointer",
                                padding: 6,
                                borderRadius: 6,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "color 0.15s",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                              onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Bab Action Buttons */}
                    <div
                      style={{
                        marginTop: 18,
                        paddingTop: 14,
                        borderTop: "1px solid #f1f5f9",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        onClick={() => handleAddSubChapter(bab.babNumber)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 12.5,
                          fontWeight: 600,
                          color: "#059669",
                          background: "#ecfdf5",
                          border: "1px solid #a7f3d0",
                          padding: "6px 14px",
                          borderRadius: 8,
                          cursor: "pointer",
                        }}
                      >
                        <Plus size={14} />
                        Tambah sub-bab
                      </button>

                      <button
                        onClick={() => handleAiSuggest(bab.babNumber)}
                        disabled={isSuggesting}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 12.5,
                          fontWeight: 600,
                          color: "#7c3aed",
                          background: "#f5f3ff",
                          border: "1px solid #ddd6fe",
                          padding: "6px 14px",
                          borderRadius: 8,
                          cursor: isSuggesting ? "wait" : "pointer",
                          opacity: isSuggesting ? 0.6 : 1,
                        }}
                      >
                        <Sparkles size={14} />
                        {isSuggesting ? "AI sedang menyusun..." : "Sarankan AI"}
                      </button>

                      <button
                        onClick={() => handleResetBab(bab.babNumber)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 12.5,
                          fontWeight: 500,
                          color: "#64748b",
                          background: "transparent",
                          border: "none",
                          padding: "6px 10px",
                          borderRadius: 8,
                          cursor: "pointer",
                          marginLeft: "auto",
                        }}
                      >
                        <RotateCcw size={13} />
                        Reset bab ini
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Floating Save Bar */}
        <div
          style={{
            marginTop: 32,
            padding: "18px 24px",
            background: "#ffffff",
            borderRadius: 14,
            border: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Info size={16} color="#64748b" />
            <span style={{ fontSize: 13, color: "#64748b" }}>
              Struktur Daftar Isi ini akan menjadi scaffold di tahap <strong>Research Blueprint</strong> dan <strong>Proposal Editor</strong>.
            </span>
          </div>

          <Button
            onClick={handleSaveAndProceed}
            disabled={saving}
            variant="primary"
            size="lg"
            style={{ gap: 8 }}
          >
            {saving ? "Menyimpan..." : "Simpan & Masuk ke Research Outline →"}
          </Button>
        </div>
      </main>
    </div>
  );
}
