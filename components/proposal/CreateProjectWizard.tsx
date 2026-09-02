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
  const [kelas, setKelas] = useState("");

  // ── Step 2: Topik ──
  const [hasTopic, setHasTopic] = useState<boolean | null>(null); // true = Tulis langsung, false = Brainstorm AI
  const [title, setTitle] = useState("");
  const [field, setField] = useState("");

  // Brainstorming State
  const [brainstormMinat, setBrainstormMinat] = useState("");
  const [brainstormKataKunci, setBrainstormKataKunci] = useState("");
  const [brainstormConstraints, setBrainstormConstraints] = useState("");
  const [brainstormingLoading, setBrainstormingLoading] = useState(false);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);

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

  const [hasExistingProfile, setHasExistingProfile] = useState(false);

  // Load user profile on open
  useEffect(() => {
    if (isOpen) {
      setErrorMsg("");
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

    try {
      setBrainstormingLoading(true);
      setErrorMsg("");
      const res = await api.projects.brainstormTopics({
        minat: brainstormMinat,
        kataKunci: brainstormKataKunci,
        constraints: brainstormConstraints,
        field: prodi || field || "Umum",
      });

      if (res.data && res.data.length > 0) {
        setCandidates(res.data);
      } else {
        setErrorMsg("AI belum dapat merumuskan topik. Silakan coba kata kunci lain.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal melakukan brainstorming AI");
    } finally {
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

      const approachConfig = {
        approachType,
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

      const commonNarrative = {
        background: narrativeBackground,
        purpose: narrativePurpose,
        scope: narrativeScope,
      };

      const res = await api.projects.create({
        title,
        description: narrativeBackground || `Proposal riset pendekatan ${approachType}`,
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
      <div
        style={{
          width: "100%",
          maxWidth: 720,
          maxHeight: "90vh",
          background: "#ffffff",
          borderRadius: 16,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
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
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>
                    Logo Institusi (URL Gambar)
                  </label>
                  <input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://.../logo.png"
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13 }}
                  />
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
                    <Check size={14} color="#16a34a" />
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

                  <button
                    onClick={handleRunBrainstorming}
                    disabled={brainstormingLoading}
                    style={{
                      width: "100%",
                      padding: "9px 14px",
                      borderRadius: 8,
                      background: "linear-gradient(135deg, #9333ea, #7c3aed)",
                      color: "#ffffff",
                      border: "none",
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: brainstormingLoading ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    {brainstormingLoading ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    <span>{brainstormingLoading ? "AI Sedang Menganalisis Celah Riset..." : "Hasilkan 4 Kandidat Judul"}</span>
                  </button>

                  {/* Hasil Kandidat Judul */}
                  {candidates.length > 0 && (
                    <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>
                        Pilih Salah Satu Kandidat Judul di Bawah:
                      </div>
                      {candidates.map((cand) => {
                        const isSelected = selectedCandidateId === cand.id;
                        return (
                          <div
                            key={cand.id}
                            onClick={() => handleSelectCandidate(cand)}
                            style={{
                              padding: 12,
                              borderRadius: 8,
                              border: isSelected ? "2px solid #00C988" : "1px solid #e2e8f0",
                              background: isSelected ? "#f0fdf4" : "#ffffff",
                              cursor: "pointer",
                              transition: "all 0.15s ease",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", lineHeight: 1.4 }}>
                                {cand.title}
                              </div>
                              <span style={{ fontSize: 10.5, fontWeight: 700, background: "#e0f2fe", color: "#0369a1", padding: "2px 6px", borderRadius: 4, flexShrink: 0 }}>
                                {cand.recommendedApproach || "KUANTITATIF"}
                              </span>
                            </div>
                            <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 4 }}>
                              <strong>Urgensi:</strong> {cand.researchGap || cand.coreProblem}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* ── SEKSI KOMBINASI AI & HUMAN (ADJUST & EDIT BEBAS) ── */}
                  {(title || candidates.length > 0) && (
                    <div
                      style={{
                        marginTop: 16,
                        background: "#f8fafc",
                        padding: 14,
                        borderRadius: 10,
                        border: "1.5px solid #00C988",
                        boxShadow: "0 2px 8px rgba(0, 201, 136, 0.08)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                        <label style={{ fontSize: 12.5, fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: 6 }}>
                          <span>✍️ Sesuaikan &amp; Kombinasikan Judul (AI + Ide Anda):</span>
                        </label>
                        <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 700, background: "#dcfce7", padding: "2px 8px", borderRadius: 12 }}>
                          Dapat Diedit Bebas
                        </span>
                      </div>

                      <textarea
                        rows={3}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Klik salah satu kandidat di atas atau ketik langsung untuk memadukan judul dengan ide Anda..."
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: 8,
                          border: "1px solid #cbd5e1",
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#0f172a",
                          lineHeight: 1.5,
                          background: "#ffffff",
                          outline: "none",
                        }}
                      />

                      {/* Quick Adjustment Chips */}
                      <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>Tambahkan Cepat:</span>
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
                              borderRadius: 6,
                              padding: "3px 8px",
                              fontSize: 11,
                              color: "#334155",
                              cursor: "pointer",
                              fontWeight: 500,
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#00C988")}
                            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#cbd5e1")}
                          >
                            + {addon.slice(0, 26)}...
                          </button>
                        ))}
                      </div>

                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 8 }}>
                        💡 <em>Tips: Anda dapat menggabungkan inspirasi dari AI dengan objek studi kasus, metode, atau variabel spesifik sesuai rencana penelitian Anda.</em>
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
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                  Latar Belakang Singkat (2-3 Kalimat)
                </label>
                <textarea
                  rows={3}
                  value={narrativeBackground}
                  onChange={(e) => setNarrativeBackground(e.target.value)}
                  placeholder="Jelaskan secara ringkas fenomena atau masalah nyata yang mendasari penelitian ini..."
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 12.5 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                  Tujuan Penelitian
                </label>
                <textarea
                  rows={2}
                  value={narrativePurpose}
                  onChange={(e) => setNarrativePurpose(e.target.value)}
                  placeholder="Contoh: Mengetahui tingkat pengaruh dukungan sosial terhadap kesehatan mental remaja..."
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 12.5 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                  Batasan Masalah (Opsional)
                </label>
                <input
                  type="text"
                  value={narrativeScope}
                  onChange={(e) => setNarrativeScope(e.target.value)}
                  placeholder="Contoh: Penelitian dibatasi pada remaja usia 15-18 tahun di wilayah X"
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 12.5 }}
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
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
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
                if (step === 2 && !title.trim()) {
                  setErrorMsg("Judul skripsi wajib ditentukan sebelum melanjutkan.");
                  return;
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
