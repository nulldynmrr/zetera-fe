"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  BookOpen,
  Layers,
  FileText,
  User,
  Building,
  GraduationCap,
  Hash,
  X,
  Zap,
  HelpCircle,
  BarChart2,
  Users,
  Compass,
  RefreshCw,
  Check,
  Upload,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";
import { api, type ResearchProject } from "@/lib/api-client";

interface CreateProjectWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (project: ResearchProject) => void;
}

export function CreateProjectWizard({ isOpen, onClose, onSuccess }: CreateProjectWizardProps) {
  const router = useRouter();

  // Wizard Steps: 1: Identitas -> 2: Topik (Direct / AI Brainstorm) -> 3: Pendekatan -> 4: Narasi -> 5: Selesai
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ── Step 1: Identitas ──
  const [nama, setNama] = useState("");
  const [prodi, setProdi] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [showManualUrl, setShowManualUrl] = useState(false);
  const [kelas, setKelas] = useState("");

  const getFullImageUrl = (url?: string | null) => {
    if (!url) return "";
    if (url.startsWith("http") || url.startsWith("blob:") || url.startsWith("data:")) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant local preview
    const localUrl = URL.createObjectURL(file);
    setLogoPreview(localUrl);

    try {
      setUploadingLogo(true);
      setErrorMsg("");
      const res = await api.upload.image(file);
      if (res.success && res.data?.url) {
        setLogoUrl(res.data.url);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal mengunggah gambar logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  // ── Step 2: Topik ──
  const [hasTopic, setHasTopic] = useState<boolean | null>(null); // true = Tulis langsung, false = Brainstorm AI
  const [title, setTitle] = useState("");
  const [field, setField] = useState("");

  // Brainstorming State
  const [brainstormMinat, setBrainstormMinat] = useState("");
  const [brainstormKataKunci, setBrainstormKataKunci] = useState("");
  const [brainstormMasalah, setBrainstormMasalah] = useState("");
  const [brainstormConstraints, setBrainstormConstraints] = useState("");
  const [brainstormingLoading, setBrainstormingLoading] = useState(false);
  const [brainstormStage, setBrainstormStage] = useState(0);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);

  const BRAINSTORM_STAGES = [
    { title: "Analisis Konteks & Bidang Keilmuan", desc: `Menyelaraskan topik '${brainstormMinat || prodi || "riset"}' dengan standar proposal skripsi...` },
    { title: "Deteksi Research Gap & Kebaruan", desc: "Memindai tren publikasi & celah orisinalitas riset terkini..." },
    { title: "Formulasi Variabel & Metodologi", desc: "Menentukan variabel X/Y dan pendekatan metodologis terarah..." },
    { title: "Finalisasi 4 Kandidat Judul Eksklusif", desc: "Menyusun draf judul bernilai akademik tinggi siap diajukan..." },
  ];

  // ── Step 3: Pendekatan Riset (QUANTITATIVE / QUALITATIVE / MIXED) ──
  const [approachType, setApproachType] = useState<"QUANTITATIVE" | "QUALITATIVE" | "MIXED">("QUANTITATIVE");

  // Kuantitatif fields
  const [quantVarX, setQuantVarX] = useState("");
  const [quantVarY, setQuantVarY] = useState("");
  const [quantHypothesis, setQuantHypothesis] = useState("");
  const [quantPopulation, setQuantPopulation] = useState("");

  // Kualitatif fields
  const [qualFocus, setQualFocus] = useState("");
  const [qualInformants, setQualInformants] = useState("");
  const [qualDataMethod, setQualDataMethod] = useState("");

  // ── Step 4: Narasi Umum ──
  const [narrativeBackground, setNarrativeBackground] = useState("");
  const [narrativePurpose, setNarrativePurpose] = useState("");
  const [narrativeScope, setNarrativeScope] = useState("");
  const [refiningNarrative, setRefiningNarrative] = useState(false);

  const [hasExistingProfile, setHasExistingProfile] = useState(false);

  const canGoBack =
    (step > 1 && !(step === 2 && hasExistingProfile && hasTopic === null)) ||
    (step === 1 && hasExistingProfile);

  const handleBack = () => {
    setErrorMsg("");
    if (step === 1 && hasExistingProfile) {
      setStep(2);
      return;
    }
    if (step === 2 && hasTopic !== null) {
      setHasTopic(null);
      return;
    }
    if (step === 2 && hasExistingProfile) {
      return;
    }
    setStep((prev) => prev - 1);
  };

  // Load user profile on open
  useEffect(() => {
    if (isOpen) {
      setErrorMsg("");
      setHasTopic(null);
      api.profile
        .get()
        .then((res) => {
          if (res.data && res.data.namaLengkap) {
            setNama(res.data.namaLengkap || "");
            setProdi(res.data.programStudi || "");
            setLogoUrl(res.data.logoUrl || "");
            setField(res.data.programStudi || "");
            setHasExistingProfile(true);
            // Skip redundant identity step, jump straight to Topic creation
            setStep(2);
          } else {
            setHasExistingProfile(false);
            setStep(1);
          }
        })
        .catch(() => {
          setStep(1);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // ── Action: Run Brainstorming AI ──
  const handleRunBrainstorming = async () => {
    if (!brainstormMinat.trim()) {
      setErrorMsg("Masukkan bidang minat atau kata kunci topik riset Anda.");
      return;
    }

    setBrainstormingLoading(true);
    setBrainstormStage(0);
    setErrorMsg("");
    setCandidates([]);
    setSelectedCandidateId(null);

    const stageTimer = setInterval(() => {
      setBrainstormStage((prev) => (prev < 3 ? prev + 1 : prev));
    }, 1100);

    try {
      const res = await api.projects.brainstormTopics({
        minat: brainstormMinat,
        kataKunci: brainstormKataKunci,
        masalahDitemukan: brainstormMasalah,
        constraints: brainstormConstraints,
        field: prodi || field || "Umum",
      });

      clearInterval(stageTimer);
      setBrainstormStage(3);
      await new Promise((resolve) => setTimeout(resolve, 350));

      if (res.data && res.data.length > 0) {
        setCandidates(res.data);
      } else {
        setErrorMsg("AI belum dapat merumuskan topik. Silakan coba kata kunci lain.");
      }
    } catch (err: any) {
      clearInterval(stageTimer);
      setErrorMsg(err.message || "Gagal melakukan brainstorming AI");
    } finally {
      clearInterval(stageTimer);
      setBrainstormingLoading(false);
    }
  };

  // ── Action: Select Candidate ──
  const handleSelectCandidate = (cand: any) => {
    setSelectedCandidateId(cand.id);
    setTitle(cand.title);
    if (cand.recommendedApproach) {
      setApproachType(cand.recommendedApproach);
    }
    if (cand.potentialVariables && cand.potentialVariables.length >= 2) {
      setQuantVarX(cand.potentialVariables[0] || "");
      setQuantVarY(cand.potentialVariables[1] || "");
    }
    if (cand.coreProblem) {
      setQualFocus(cand.coreProblem);
    }
    // Hubungkan masalah yang ditemukan langsung ke latar belakang
    if (brainstormMasalah && !narrativeBackground) {
      setNarrativeBackground(`Penelitian ini dilatarbelakangi oleh fenomena permasalahan empiris: ${brainstormMasalah}. Diperlukan kajian ilmiah terstruktur untuk menganalisis akar masalah serta merumuskan rekomendasi solutif.`);
    } else if (cand.researchGap && !narrativeBackground) {
      setNarrativeBackground(cand.researchGap);
    }
  };

  // ── Action: AI Refine Narasi Umum (Latar Belakang, Tujuan, Batasan) ──
  const handleRefineNarrative = async () => {
    try {
      setRefiningNarrative(true);
      setErrorMsg("");

      const currentApproachConfig = {
        approachType,
        variableX: quantVarX,
        variableY: quantVarY,
        focusIssue: qualFocus,
        quantitative:
          approachType === "QUANTITATIVE" || approachType === "MIXED"
            ? {
              variableX: quantVarX,
              variableY: quantVarY,
              hypothesis: quantHypothesis,
              population: quantPopulation,
            }
            : null,
        qualitative:
          approachType === "QUALITATIVE" || approachType === "MIXED"
            ? {
              focus: qualFocus,
              informants: qualInformants,
              dataMethod: qualDataMethod,
            }
            : null,
      };

      const res = await api.projects.refineNarrative({
        title,
        field: prodi || field || "Umum",
        approachType,
        approachConfig: currentApproachConfig,
        currentBackground: narrativeBackground,
        currentPurpose: narrativePurpose,
        currentScope: narrativeScope,
      });

      if (res.data) {
        if (res.data.background) setNarrativeBackground(res.data.background);
        if (res.data.purpose) setNarrativePurpose(res.data.purpose);
        if (res.data.scope) setNarrativeScope(res.data.scope);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menyempurnakan narasi dengan AI");
    } finally {
      setRefiningNarrative(false);
    }
  };

  // ── Action: Submit Final Project ──
  const handleFinalSubmit = async () => {
    if (!title.trim()) {
      setErrorMsg("Judul skripsi wajib ditentukan");
      setStep(2);
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");

      let finalBg = narrativeBackground;
      let finalPurpose = narrativePurpose;
      let finalScope = narrativeScope;

      const approachConfig = {
        approachType,
        variableX: quantVarX,
        variableY: quantVarY,
        focusIssue: qualFocus,
        quantitative:
          approachType === "QUANTITATIVE" || approachType === "MIXED"
            ? {
              variableX: quantVarX,
              variableY: quantVarY,
              hypothesis: quantHypothesis,
              population: quantPopulation,
            }
            : null,
        qualitative:
          approachType === "QUALITATIVE" || approachType === "MIXED"
            ? {
              focus: qualFocus,
              informants: qualInformants,
              dataMethod: qualDataMethod,
            }
            : null,
      };

      // Auto-refine jika user mengetik terlalu pendek / ngasal (< 15 karakter)
      if (finalBg.trim().length < 15 || !finalPurpose.trim()) {
        try {
          const refineRes = await api.projects.refineNarrative({
            title,
            field: prodi || field || "Umum",
            approachType,
            approachConfig,
            currentBackground: finalBg,
            currentPurpose: finalPurpose,
            currentScope: finalScope,
          });
          if (refineRes.data) {
            finalBg = refineRes.data.background || finalBg;
            finalPurpose = refineRes.data.purpose || finalPurpose;
            finalScope = refineRes.data.scope || finalScope;
          }
        } catch (_) { }
      }

      const commonNarrative = {
        background: finalBg,
        purpose: finalPurpose,
        scope: finalScope,
      };

      const res = await api.projects.create({
        title,
        description: finalBg || `Proposal riset pendekatan ${approachType}`,
        field: prodi || field || "Umum",
        nama,
        logoUrl,
        prodi,
        kelas,
        approachType,
        approachConfig,
        commonNarrative,
      });

      if (onSuccess) {
        onSuccess(res.data);
      }
      onClose();

      // Redirect langsung ke ruang screening literatur proposal
      router.push(`/projects/${res.data.id}/template`);
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal membuat proyek proposal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 150,
        background: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
      onClick={onClose}
    >
      <style>{`
        @keyframes aiCardEntrance {
          0% { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div
        style={{
          width: "100%",
          maxWidth: 720,
          maxHeight: "90vh",
          background: "#ffffff",
          borderRadius: 14,
          border: "1px solid #e2e8f0",
          boxShadow: "none",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          fontFamily: "var(--font-poppins, 'Poppins', sans-serif)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── HEADER & STEPPER ── */}
        <div
          style={{
            padding: "20px 24px 16px",
            borderBottom: "1px solid #e2e8f0",
            background: "#fafafa",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 2px" }}>
                Buat Proposal Riset Baru
              </h2>
              <span style={{ fontSize: 12, color: "#64748b" }}>
                Panduan komprehensif penentuan topik, pendekatan, dan struktur proposal
              </span>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "#f1f5f9",
                border: "none",
                borderRadius: 8,
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#64748b",
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Stepper Indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {(hasExistingProfile
              ? [
                { num: 2, label: "Topik & Judul" },
                { num: 3, label: "Pendekatan" },
                { num: 4, label: "Narasi Umum" },
              ]
              : [
                { num: 1, label: "Identitas" },
                { num: 2, label: "Topik & Judul" },
                { num: 3, label: "Pendekatan" },
                { num: 4, label: "Narasi Umum" },
              ]
            ).map((s, idx) => {
              const isActive = step === s.num;
              const isDone = step > s.num;
              return (
                <div
                  key={s.num}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 10px",
                    borderRadius: 8,
                    background: isActive ? "#e0f2fe" : isDone ? "#f0fdf4" : "#f1f5f9",
                    border: isActive ? "1px solid #7dd3fc" : isDone ? "1px solid #86efac" : "1px solid transparent",
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 700,
                      background: isActive ? "#0284c7" : isDone ? "#16a34a" : "#94a3b8",
                      color: "#ffffff",
                    }}
                  >
                    {isDone ? "✓" : idx + 1}
                  </div>
                  <span
                    style={{
                      fontSize: 11.5,
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? "#0369a1" : isDone ? "#15803d" : "#64748b",
                    }}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── BODY CONTENT PER STEP ── */}
        <div style={{ padding: 24, overflowY: "auto", flex: 1 }}>
          {errorMsg && (
            <div
              style={{
                marginBottom: 16,
                padding: "10px 14px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 8,
                color: "#b91c1c",
                fontSize: 12.5,
              }}
            >
              {errorMsg}
            </div>
          )}

          {/* ──── STEP 1: SETUP IDENTITAS ──── */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.5 }}>
                Identitas ini akan disematkan pada lembar cover naskah proposal dan ekspor PDF/Word.
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>
                    Nama Lengkap Mahasiswa
                  </label>
                  <input
                    type="text"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Nama mahasiswa..."
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13 }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>
                    Program Studi / Jurusan
                  </label>
                  <input
                    type="text"
                    value={prodi}
                    onChange={(e) => {
                      setProdi(e.target.value);
                      setField(e.target.value);
                    }}
                    placeholder="Contoh: S1 Informatika, S1 Psikologi..."
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13 }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>
                    Kelas / Kode Paralel
                  </label>
                  <input
                    type="text"
                    value={kelas}
                    onChange={(e) => setKelas(e.target.value)}
                    placeholder="Contoh: IF-45-02 / Reguler A"
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13 }}
                  />
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>
                      Logo Institusi
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowManualUrl(!showManualUrl)}
                      style={{
                        background: "none",
                        border: "none",
                        fontSize: 11,
                        color: "#0284c7",
                        cursor: "pointer",
                        textDecoration: "underline",
                        padding: 0,
                      }}
                    >
                      {showManualUrl ? "Sembunyikan URL" : "Edit URL"}
                    </button>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {/* Logo Preview Thumbnail */}
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 10,
                        background: "#f8fafc",
                        border: "1.5px solid #e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        flexShrink: 0,
                      }}
                    >
                      {logoPreview || logoUrl ? (
                        <img
                          src={logoPreview || getFullImageUrl(logoUrl)}
                          alt="Logo Institusi"
                          style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }}
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <ImageIcon size={22} color="#94a3b8" />
                      )}
                    </div>

                    {/* Logo Actions */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <label
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "7px 12px",
                            borderRadius: 8,
                            background: "#ffffff",
                            border: "1px solid #cbd5e1",
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#334155",
                            cursor: uploadingLogo ? "not-allowed" : "pointer",
                            transition: "all 0.15s",
                          }}
                        >
                          {uploadingLogo ? (
                            <RefreshCw size={13} className="animate-spin" />
                          ) : (
                            <Upload size={13} />
                          )}
                          <span>{uploadingLogo ? "Mengunggah..." : (logoPreview || logoUrl) ? "Ganti Logo" : "Unggah Logo"}</span>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/svg+xml,image/webp"
                            onChange={handleLogoUpload}
                            disabled={uploadingLogo}
                            style={{ display: "none" }}
                          />
                        </label>

                        {(logoPreview || logoUrl) && (
                          <button
                            type="button"
                            onClick={() => {
                              setLogoUrl("");
                              setLogoPreview(null);
                            }}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              padding: "7px 10px",
                              borderRadius: 8,
                              background: "#fef2f2",
                              border: "1px solid #fecaca",
                              fontSize: 12,
                              fontWeight: 600,
                              color: "#ef4444",
                              cursor: "pointer",
                            }}
                          >
                            <Trash2 size={13} />
                            <span>Hapus</span>
                          </button>
                        )}
                      </div>
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>
                        PNG / JPG transparan (disarankan)
                      </span>
                    </div>
                  </div>

                  {showManualUrl && (
                    <div style={{ marginTop: 8 }}>
                      <input
                        type="text"
                        value={logoUrl}
                        onChange={(e) => {
                          setLogoUrl(e.target.value);
                          setLogoPreview(null);
                        }}
                        placeholder="URL Logo (https://... atau /uploads/...)"
                        style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 12 }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ──── STEP 2: CEK TOPIK & BRAINSTORMING AI ──── */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {/* Compact Active Identity Banner */}
              {hasExistingProfile && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 14px",
                    borderRadius: 10,
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    fontSize: 12.5,
                    color: "#166534",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {(logoPreview || logoUrl) ? (
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 4,
                          background: "#ffffff",
                          border: "1px solid #bbf7d0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                          flexShrink: 0,
                        }}
                      >
                        <img
                          src={logoPreview || getFullImageUrl(logoUrl)}
                          alt="Logo"
                          style={{ width: "100%", height: "100%", objectFit: "contain", padding: 1 }}
                        />
                      </div>
                    ) : (
                      <Check size={14} color="#16a34a" />
                    )}
                    <span>
                      Identitas Peneliti: <strong>{nama}</strong> {prodi ? `• ${prodi}` : ""} {kelas ? `• Kelas ${kelas}` : ""}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#0284c7",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                  >
                    Ubah
                  </button>
                </div>
              )}

              {hasTopic === null && (
                <div style={{ textAlign: "center", padding: "20px 10px" }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>
                    Apakah Anda sudah memiliki Topik atau Judul Skripsi?
                  </h3>
                  <p style={{ fontSize: 12.5, color: "#64748b", marginBottom: 20 }}>
                    Pilih jalur penentuan topik yang paling sesuai dengan kesiapan Anda saat ini:
                  </p>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div
                      onClick={() => setHasTopic(true)}
                      style={{
                        padding: 20,
                        borderRadius: 12,
                        border: "1.5px solid #cbd5e1",
                        background: "#ffffff",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#0284c7")}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#cbd5e1")}
                    >
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: "#f0f9ff", color: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                        <FileText size={20} />
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>
                        Sudah Punya Judul
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>
                        Tulis atau tempel judul yang telah disetujui dosen pembimbing.
                      </div>
                    </div>

                    <div
                      onClick={() => setHasTopic(false)}
                      style={{
                        padding: 20,
                        borderRadius: 12,
                        border: "1.5px solid #c084fc",
                        background: "#faf5ff",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#9333ea")}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#c084fc")}
                    >
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: "#f3e8ff", color: "#9333ea", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                        <Sparkles size={20} />
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#581c87", marginBottom: 4 }}>
                        Brainstorming AI
                      </div>
                      <div style={{ fontSize: 12, color: "#7e22ce" }}>
                        AI merumuskan 4 kandidat judul bernas dari minat & kata kunci Anda.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Branch A: Input Langsung */}
              {hasTopic === true && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                      Tuliskan Judul Skripsi / Proposal Anda
                    </label>
                    <button
                      onClick={() => setHasTopic(null)}
                      style={{ background: "none", border: "none", color: "#0284c7", fontSize: 11.5, cursor: "pointer" }}
                    >
                      Ubah ke Brainstorming AI
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Analisis Pengaruh Dukungan Sosial Terhadap Kesehatan Mental Remaja di Wilayah Perkotaan..."
                    style={{ width: "100%", padding: "12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13.5, lineHeight: 1.5 }}
                  />
                </div>
              )}

              {/* Branch B: Brainstorming AI */}
              {hasTopic === false && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Sparkles size={16} color="#9333ea" />
                      <span style={{ fontSize: 13.5, fontWeight: 800, color: "#581c87" }}>
                        Brainstorming Judul Skripsi
                      </span>
                    </div>
                    <button
                      onClick={() => setHasTopic(null)}
                      style={{ background: "none", border: "none", color: "#64748b", fontSize: 11.5, cursor: "pointer" }}
                    >
                      Batal
                    </button>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>
                        Bidang Minat / Ketertarikan
                      </label>
                      <input
                        type="text"
                        value={brainstormMinat}
                        onChange={(e) => setBrainstormMinat(e.target.value)}
                        placeholder="Contoh: AI, Psikologi Remaja, Fintech..."
                        style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 12.5 }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>
                        Kata Kunci / Objek Riset
                      </label>
                      <input
                        type="text"
                        value={brainstormKataKunci}
                        onChange={(e) => setBrainstormKataKunci(e.target.value)}
                        placeholder="Contoh: Kesehatan Mental, MHC-SF, LLM..."
                        style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 12.5 }}
                      />
                    </div>
                  </div>

                  {/* Field Tambahan: Masalah yang Sudah Ditemukan (Opsional) */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                      <label style={{ fontSize: 11.5, fontWeight: 700, color: "#334155" }}>
                        Masalah / Fenomena yang Sudah Ditemukan (Opsional)
                      </label>
                    </div>
                    <textarea
                      rows={2}
                      value={brainstormMasalah}
                      onChange={(e) => setBrainstormMasalah(e.target.value)}
                      placeholder="Contoh: Rendahnya retensi pengguna pada platform X, tingginya tingkat kecemasan akademik, lambatnya deteksi anomali pada data sensor..."
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: 6,
                        border: "1px solid #cbd5e1",
                        fontSize: 12.5,
                        outline: "none",
                        fontFamily: "inherit",
                        lineHeight: 1.45,
                        resize: "vertical",
                      }}
                    />
                  </div>

                  <button
                    onClick={handleRunBrainstorming}
                    disabled={brainstormingLoading}
                    style={{
                      width: "100%",
                      padding: "10px 16px",
                      borderRadius: 8,
                      background: brainstormingLoading ? "#6d28d9" : "#7c3aed",
                      color: "#ffffff",
                      border: "none",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: brainstormingLoading ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      boxShadow: "none",
                      transition: "background-color 0.15s ease",
                      fontFamily: "var(--font-poppins, 'Poppins', sans-serif)",
                    }}
                  >
                    {brainstormingLoading ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>{BRAINSTORM_STAGES[brainstormStage]?.title || "AI Sedang Menganalisis..."}...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={15} />
                        <span>{candidates.length > 0 ? "Hasilkan Ulang Kandidat Judul" : "Hasilkan 4 Kandidat Judul"}</span>
                      </>
                    )}
                  </button>

                  {/* ── LIVE AI PROCESSING ── */}
                  {brainstormingLoading && (
                    <div
                      style={{
                        marginTop: 16,
                        borderRadius: 10,
                        background: "#faf5ff",
                        border: "1px solid #e9d5ff",
                        boxShadow: "none",
                        padding: "16px 18px",
                        fontFamily: "var(--font-poppins, 'Poppins', sans-serif)",
                      }}
                    >
                      {/* Header */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 6,
                              background: "#f3e8ff",
                              border: "1px solid #d8b4fe",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#7c3aed",
                            }}
                          >
                            <Sparkles size={15} />
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#4c1d95" }}>
                              Brainstorming AI
                            </div>
                            <div style={{ fontSize: 11, color: "#6b7280" }}>
                              Menganalisis topik dan merumuskan kandidat judul skripsi
                            </div>
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            background: "#ffffff",
                            border: "1px solid #e9d5ff",
                            padding: "3px 10px",
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 500,
                            color: "#7c3aed",
                          }}
                        >
                          <RefreshCw size={11} className="animate-spin" />
                          <span>Memproses...</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, fontWeight: 500, color: "#6b7280", marginBottom: 6 }}>
                          <span>Langkah {brainstormStage + 1} dari 4: {BRAINSTORM_STAGES[brainstormStage]?.title}</span>
                          <span style={{ color: "#7c3aed", fontWeight: 600 }}>{Math.round(((brainstormStage + 1) / 4) * 100)}%</span>
                        </div>
                        <div style={{ height: 4, borderRadius: 2, background: "#e9d5ff", overflow: "hidden" }}>
                          <div
                            style={{
                              height: "100%",
                              width: `${((brainstormStage + 1) / 4) * 100}%`,
                              background: "#7c3aed",
                              borderRadius: 2,
                              transition: "width 0.4s ease",
                            }}
                          />
                        </div>
                      </div>

                      {/* Steps List */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {BRAINSTORM_STAGES.map((stg, i) => {
                          const isDone = brainstormStage > i;
                          const isCurrent = brainstormStage === i;
                          return (
                            <div
                              key={i}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                padding: "7px 10px",
                                borderRadius: 6,
                                background: isCurrent ? "#ffffff" : isDone ? "rgba(255, 255, 255, 0.6)" : "transparent",
                                border: isCurrent ? "1px solid #d8b4fe" : "1px solid transparent",
                                transition: "all 0.2s ease",
                              }}
                            >
                              <div
                                style={{
                                  width: 18,
                                  height: 18,
                                  borderRadius: "50%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: 10,
                                  fontWeight: 600,
                                  background: isDone ? "#10b981" : isCurrent ? "#7c3aed" : "#e2e8f0",
                                  color: isDone || isCurrent ? "#ffffff" : "#64748b",
                                  flexShrink: 0,
                                }}
                              >
                                {isDone ? "✓" : isCurrent ? <RefreshCw size={9} className="animate-spin" /> : i + 1}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                  style={{
                                    fontSize: 11.5,
                                    fontWeight: isCurrent ? 600 : 500,
                                    color: isCurrent ? "#4c1d95" : isDone ? "#15803d" : "#94a3b8",
                                  }}
                                >
                                  {stg.title}
                                </div>
                                {isCurrent && (
                                  <div style={{ fontSize: 10.5, color: "#6b7280", marginTop: 2 }}>
                                    {stg.desc}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ── HASIL KANDIDAT JUDUL ── */}
                  {candidates.length > 0 && (
                    <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
                      {/* Header */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "8px 12px",
                          borderRadius: 8,
                          background: "#faf5ff",
                          border: "1px solid #e9d5ff",
                          boxShadow: "none",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Sparkles size={14} color="#7c3aed" />
                          <span style={{ fontSize: 12.5, fontWeight: 600, color: "#4c1d95" }}>
                            4 Rekomendasi Judul Hasil AI
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRunBrainstorming}
                          disabled={brainstormingLoading}
                          style={{
                            background: "#ffffff",
                            border: "1px solid #d8b4fe",
                            borderRadius: 6,
                            padding: "4px 8px",
                            fontSize: 11,
                            fontWeight: 500,
                            color: "#7c3aed",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            boxShadow: "none",
                          }}
                        >
                          <RefreshCw size={11} />
                          <span>Hasilkan Ulang</span>
                        </button>
                      </div>

                      {/* Candidate Cards */}
                      {candidates.map((cand, idx) => {
                        const isSelected = selectedCandidateId === cand.id;
                        const tierLabels = [
                          { label: "Rekomendasi Utama", bg: "#f3e8ff", color: "#6d28d9", border: "#e9d5ff" },
                          { label: "Novelty Gap", bg: "#eff6ff", color: "#1d4ed8", border: "#dbeafe" },
                          { label: "Metodologi Terarah", bg: "#f0fdf4", color: "#15803d", border: "#dcfce7" },
                          { label: "Relevansi Praktis", bg: "#fef3c7", color: "#92400e", border: "#fde68a" },
                        ];
                        const tier = tierLabels[idx % tierLabels.length];

                        return (
                          <div
                            key={cand.id}
                            onClick={() => handleSelectCandidate(cand)}
                            style={{
                              padding: "12px 14px",
                              borderRadius: 8,
                              border: isSelected ? "2px solid #7c3aed" : "1px solid #e2e8f0",
                              background: isSelected ? "#faf5ff" : "#ffffff",
                              cursor: "pointer",
                              transition: "border-color 0.15s ease",
                              boxShadow: "none",
                              animation: "aiCardEntrance 0.3s ease forwards",
                              animationDelay: `${idx * 60}ms`,
                              fontFamily: "var(--font-poppins, 'Poppins', sans-serif)",
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) e.currentTarget.style.borderColor = "#c4b5fd";
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) e.currentTarget.style.borderColor = "#e2e8f0";
                            }}
                          >
                            {/* Top Badges Row */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                                <span
                                  style={{
                                    fontSize: 10.5,
                                    fontWeight: 600,
                                    background: tier.bg,
                                    color: tier.color,
                                    border: `1px solid ${tier.border}`,
                                    padding: "2px 8px",
                                    borderRadius: 4,
                                  }}
                                >
                                  {tier.label}
                                </span>
                                <span
                                  style={{
                                    fontSize: 10.5,
                                    fontWeight: 500,
                                    background: "#f1f5f9",
                                    color: "#475569",
                                    padding: "2px 6px",
                                    borderRadius: 4,
                                  }}
                                >
                                  {cand.recommendedApproach === "QUANTITATIVE"
                                    ? "Kuantitatif"
                                    : cand.recommendedApproach === "QUALITATIVE"
                                      ? "Kualitatif"
                                      : "Campuran"}
                                </span>
                                {cand.feasibility && (
                                  <span style={{ fontSize: 10.5, color: "#64748b", background: "#f8fafc", padding: "2px 6px", borderRadius: 4, border: "1px solid #f1f5f9" }}>
                                    Kelayakan: {cand.feasibility.replace(/\s*\(.*?\)/, "")}
                                  </span>
                                )}
                              </div>

                              {isSelected && (
                                <span
                                  style={{
                                    fontSize: 11,
                                    fontWeight: 600,
                                    color: "#7c3aed",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 3,
                                  }}
                                >
                                  <Check size={12} />
                                  <span>Terpilih</span>
                                </span>
                              )}
                            </div>

                            {/* Judul */}
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", lineHeight: 1.45, marginBottom: 6 }}>
                              {cand.title}
                            </div>

                            {/* Urgensi & Celah Riset */}
                            <div style={{ fontSize: 11.5, color: "#64748b", lineHeight: 1.4 }}>
                              <span style={{ fontWeight: 600, color: "#475569" }}>Celah Riset: </span>
                              {cand.researchGap || cand.coreProblem}
                            </div>

                            {/* Potential Variables */}
                            {cand.potentialVariables && cand.potentialVariables.length > 0 && (
                              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                                <span style={{ fontSize: 10.5, fontWeight: 500, color: "#94a3b8" }}>Variabel:</span>
                                {cand.potentialVariables.map((v: string, vIdx: number) => (
                                  <span
                                    key={vIdx}
                                    style={{
                                      fontSize: 10.5,
                                      background: "#f8fafc",
                                      border: "1px solid #e2e8f0",
                                      color: "#475569",
                                      padding: "1px 6px",
                                      borderRadius: 4,
                                    }}
                                  >
                                    {v}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* ── SEKSI KOMBINASI AI & HUMAN ── */}
                  {(title || candidates.length > 0) && (
                    <div
                      style={{
                        marginTop: 16,
                        background: "#fafafa",
                        padding: 14,
                        borderRadius: 8,
                        border: "1px solid #e2e8f0",
                        boxShadow: "none",
                        fontFamily: "var(--font-poppins, 'Poppins', sans-serif)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>
                          Sesuaikan Judul Proposal
                        </label>
                        <span style={{ fontSize: 10.5, color: "#6d28d9", fontWeight: 600, background: "#f3e8ff", padding: "2px 8px", borderRadius: 4 }}>
                          Dapat Diedit Bebas
                        </span>
                      </div>

                      <textarea
                        rows={3}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Pilih salah satu kandidat di atas atau sesuaikan judul sesuai kebutuhan riset Anda..."
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: 6,
                          border: "1px solid #cbd5e1",
                          fontSize: 12.5,
                          fontWeight: 500,
                          color: "#0f172a",
                          lineHeight: 1.5,
                          background: "#ffffff",
                          outline: "none",
                          fontFamily: "inherit",
                        }}
                      />

                      {/* Quick Adjustment Chips */}
                      <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 11, color: "#64748b", fontWeight: 500 }}>Tambahkan Cepat:</span>
                        {[
                          ": Studi Kasus pada Mahasiswa Informatika",
                          " Berbasis Machine Learning",
                          " Menggunakan Algoritma Klasifikasi",
                          ": Tinjauan Empiris & Eksplanatori",
                        ].map((addon, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              if (!title.includes(addon.trim())) {
                                setTitle((prev) => (prev.trim() ? `${prev.trim()}${addon}` : addon.replace(/^:\s*/, "")));
                              }
                            }}
                            style={{
                              background: "#ffffff",
                              border: "1px solid #cbd5e1",
                              borderRadius: 4,
                              padding: "3px 8px",
                              fontSize: 11,
                              color: "#334155",
                              cursor: "pointer",
                              fontWeight: 500,
                              fontFamily: "inherit",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#7c3aed")}
                            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#cbd5e1")}
                          >
                            + {addon.slice(0, 26)}...
                          </button>
                        ))}
                      </div>

                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 8 }}>
                        Tips: Anda dapat menggabungkan inspirasi AI dengan variabel atau studi kasus spesifik sesuai rencana penelitian Anda.
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

          {/* ──── STEP 3: PILIH PENDEKATAN RISET ──── */}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 6 }}>
                  Pilih Pendekatan Metodologi Riset
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  {[
                    { type: "QUANTITATIVE", label: "Kuantitatif", desc: "Variabel X/Y & Hipotesis", icon: BarChart2 },
                    { type: "QUALITATIVE", label: "Kualitatif", desc: "Fokus & Informan Kunci", icon: Users },
                    { type: "MIXED", label: "Campuran", desc: "Kombinasi Kuant-Kual", icon: Compass },
                  ].map((app) => (
                    <div
                      key={app.type}
                      onClick={() => setApproachType(app.type as any)}
                      style={{
                        padding: "12px 10px",
                        borderRadius: 10,
                        border: approachType === app.type ? "2px solid #00C988" : "1px solid #e2e8f0",
                        background: approachType === app.type ? "#f0fdf4" : "#ffffff",
                        cursor: "pointer",
                        textAlign: "center",
                      }}
                    >
                      <app.icon size={20} color={approachType === app.type ? "#00C988" : "#64748b"} style={{ margin: "0 auto 6px" }} />
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{app.label}</div>
                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{app.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Dinamis Berdasarkan Pendekatan */}
              {(approachType === "QUANTITATIVE" || approachType === "MIXED") && (
                <div style={{ background: "#f8fafc", padding: 14, borderRadius: 10, border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>Variabel Kuantitatif:</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>Variabel Independen (X)</label>
                      <input
                        type="text"
                        value={quantVarX}
                        onChange={(e) => setQuantVarX(e.target.value)}
                        placeholder="Contoh: Dukungan Sosial"
                        style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 12.5 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>Variabel Dependen (Y)</label>
                      <input
                        type="text"
                        value={quantVarY}
                        onChange={(e) => setQuantVarY(e.target.value)}
                        placeholder="Contoh: Kesehatan Mental Remaja"
                        style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 12.5 }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>Hipotesis Penelitian Awal (Opsional)</label>
                    <input
                      type="text"
                      value={quantHypothesis}
                      onChange={(e) => setQuantHypothesis(e.target.value)}
                      placeholder="Contoh: Terdapat pengaruh positif signifikan antara X terhadap Y"
                      style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 12.5 }}
                    />
                  </div>
                </div>
              )}

              {(approachType === "QUALITATIVE" || approachType === "MIXED") && (
                <div style={{ background: "#f8fafc", padding: 14, borderRadius: 10, border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>Fokus Kualitatif:</div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>Fokus Masalah / Fenomena</label>
                    <input
                      type="text"
                      value={qualFocus}
                      onChange={(e) => setQualFocus(e.target.value)}
                      placeholder="Contoh: Dinamika interaksi sosial remaja di lingkungan keluarga"
                      style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 12.5 }}
                    />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>Informan Kunci / Subjek</label>
                      <input
                        type="text"
                        value={qualInformants}
                        onChange={(e) => setQualInformants(e.target.value)}
                        placeholder="Contoh: Remaja, Orang Tua, Guru BK"
                        style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 12.5 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>Teknik Pengumpulan Data</label>
                      <input
                        type="text"
                        value={qualDataMethod}
                        onChange={(e) => setQualDataMethod(e.target.value)}
                        placeholder="Wawancara Mendalam, Observasi"
                        style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 12.5 }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ──── STEP 4: NARASI UMUM ──── */}
          {step === 4 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Header Info & Auto-Refine Action */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  background: "#faf5ff",
                  border: "1px solid #e9d5ff",
                  borderRadius: 8,
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#4c1d95" }}>
                    Penyelarasan Narasi & Filter Literatur
                  </div>
                  <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
                    Variabel, tujuan, dan batasan ini akan menjadi filter cerdas penapisan jurnal dan pembuatan outline.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRefineNarrative}
                  disabled={refiningNarrative}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: "#7c3aed",
                    color: "#ffffff",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: 6,
                    fontSize: 11.5,
                    fontWeight: 600,
                    cursor: refiningNarrative ? "not-allowed" : "pointer",
                    fontFamily: "inherit",
                    whiteSpace: "nowrap",
                    opacity: refiningNarrative ? 0.7 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!refiningNarrative) e.currentTarget.style.background = "#6d28d9";
                  }}
                  onMouseLeave={(e) => {
                    if (!refiningNarrative) e.currentTarget.style.background = "#7c3aed";
                  }}
                >
                  {refiningNarrative ? (
                    <RefreshCw size={12} className="animate-spin" />
                  ) : (
                    <Sparkles size={12} />
                  )}
                  <span>{refiningNarrative ? "Menyempurnakan..." : "Sempurnakan dengan AI"}</span>
                </button>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>
                    Latar Belakang Singkat (2-3 Kalimat)
                  </label>
                  {narrativeBackground && (
                    <span style={{ fontSize: 10.5, color: "#6b7280" }}>
                      {narrativeBackground.length} karakter
                    </span>
                  )}
                </div>
                <textarea
                  rows={3}
                  value={narrativeBackground}
                  onChange={(e) => setNarrativeBackground(e.target.value)}
                  placeholder="Jelaskan secara ringkas fenomena atau masalah nyata yang mendasari penelitian ini (atau klik 'Sempurnakan dengan AI')..."
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 6,
                    border: "1px solid #cbd5e1",
                    fontSize: 12.5,
                    outline: "none",
                    fontFamily: "inherit",
                    lineHeight: 1.5,
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", display: "block", marginBottom: 4 }}>
                  Tujuan Penelitian
                </label>
                <textarea
                  rows={3}
                  value={narrativePurpose}
                  onChange={(e) => setNarrativePurpose(e.target.value)}
                  placeholder="Contoh: 1. Menganalisis pengaruh variabel X terhadap Y&#10;2. Menguji signifikansi hubungan..."
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 6,
                    border: "1px solid #cbd5e1",
                    fontSize: 12.5,
                    outline: "none",
                    fontFamily: "inherit",
                    lineHeight: 1.5,
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", display: "block", marginBottom: 4 }}>
                  Batasan Masalah (Opsional)
                </label>
                <input
                  type="text"
                  value={narrativeScope}
                  onChange={(e) => setNarrativeScope(e.target.value)}
                  placeholder="Contoh: Dibatasi pada populasi mahasiswa angkatan 2022-2024 di perguruan tinggi X"
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 6,
                    border: "1px solid #cbd5e1",
                    fontSize: 12.5,
                    outline: "none",
                    fontFamily: "inherit",
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── FOOTER ACTIONS ── */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #e2e8f0",
            background: "#fafafa",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {canGoBack ? (
            <button
              onClick={handleBack}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 8,
                background: "#ffffff",
                border: "1px solid #cbd5e1",
                fontSize: 12.5,
                fontWeight: 600,
                color: "#475569",
                cursor: "pointer",
              }}
            >
              <ArrowLeft size={14} />
              <span>Kembali</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              onClick={() => {
                if (step === 2) {
                  if (hasTopic === null) {
                    setErrorMsg("Silakan pilih 'Sudah Punya Judul' atau 'Brainstorming AI' terlebih dahulu.");
                    return;
                  }
                  if (!title.trim()) {
                    setErrorMsg("Judul skripsi wajib ditentukan sebelum melanjutkan.");
                    return;
                  }
                }
                setErrorMsg("");
                setStep(step + 1);
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                borderRadius: 8,
                background: "#00C988",
                border: "none",
                fontSize: 12.5,
                fontWeight: 700,
                color: "#ffffff",
                cursor: "pointer",
              }}
            >
              <span>Lanjut</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={handleFinalSubmit}
              disabled={loading}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 20px",
                borderRadius: 8,
                background: "linear-gradient(135deg, #00C988, #059669)",
                border: "none",
                fontSize: 13,
                fontWeight: 700,
                color: "#ffffff",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={15} />}
              <span>{loading ? "Menyiapkan Workspace..." : "Mulai Riset Proposal"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
