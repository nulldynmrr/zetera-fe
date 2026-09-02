"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api-client";
import { AcademicMark, Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { UniversityAutocomplete } from "@/components/ui/UniversityAutocomplete";
import {
  GraduationCap,
  Building2,
  Image as ImageIcon,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  ShieldCheck,
  Upload,
} from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [namaLengkap, setNamaLengkap] = useState("");
  const [nim, setNim] = useState("");
  const [programStudi, setProgramStudi] = useState("");
  const [fakultas, setFakultas] = useState("");
  const [universitas, setUniversitas] = useState("");
  const [kota, setKota] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const getFullImageUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith("http") || url.startsWith("blob:") || url.startsWith("data:")) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user?.name && !namaLengkap) {
      setNamaLengkap(user.name);
    }

    api.profile
      .get()
      .then((res) => {
        if (res.success && res.data) {
          const d = res.data;
          setNamaLengkap(d.namaLengkap || user?.name || "");
          setNim(d.nim || "");
          setProgramStudi(d.programStudi || "");
          setFakultas(d.fakultas || "");
          setUniversitas(d.universitas || "");
          setKota(d.kota || "");
          if (d.logoUrl) setLogoUrl(d.logoUrl);

          // If fully completed, do not show onboarding again - redirect directly to dashboard
          if (d.namaLengkap && d.nim && d.programStudi && d.fakultas && d.universitas) {
            router.replace("/dashboard");
            return;
          }

          // Otherwise, automatically advance to first unfilled step
          if (!d.namaLengkap || !d.nim) {
            setStep(1);
          } else if (!d.programStudi || !d.fakultas) {
            setStep(2);
          } else if (!d.universitas) {
            setStep(3);
          } else {
            setStep(4);
          }
        }
      })
      .catch(() => {});
  }, [user, authLoading, router]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant local preview
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    try {
      setUploadingLogo(true);
      setError(null);
      const res = await api.upload.image(file);
      if (res.success && res.data?.url) {
        setLogoUrl(res.data.url);
      }
    } catch (err: any) {
      setError(err.message || "Gagal mengunggah logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleComplete = async () => {
    if (!namaLengkap.trim() || !nim.trim()) {
      setError("Nama lengkap dan NIM wajib diisi");
      setStep(1);
      return;
    }
    if (!programStudi.trim() || !fakultas.trim()) {
      setError("Program studi dan fakultas wajib diisi");
      setStep(2);
      return;
    }
    if (!universitas.trim()) {
      setError("Nama universitas/institut wajib diisi");
      setStep(3);
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await api.profile.upsert({
        namaLengkap: namaLengkap.trim(),
        nim: nim.trim(),
        programStudi: programStudi.trim(),
        fakultas: fakultas.trim(),
        universitas: universitas.trim(),
        kota: kota.trim(),
        logoUrl: logoUrl || null,
      });

      try {
        await api.templates.seed();
      } catch (e) {}

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan profil onboarding");
      setSaving(false);
    }
  };

  const stepList = [
    { num: 1, label: "Mahasiswa", icon: GraduationCap },
    { num: 2, label: "Program Studi", icon: BookOpen },
    { num: 3, label: "Kampus", icon: Building2 },
    { num: 4, label: "Logo & Selesai", icon: ImageIcon },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--mesh-cyan)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 580, textAlign: "center", marginBottom: 24 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <AcademicMark size={20} />
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 18,
              fontWeight: 800,
              color: "#0f172a",
              letterSpacing: "-0.02em",
            }}
          >
            Zetera Research
          </span>
        </div>

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 24,
            fontWeight: 800,
            color: "#0f172a",
            margin: "0 0 6px",
            letterSpacing: "-0.02em",
          }}
        >
          Setup Profil & Template Proposal
        </h1>
        <p style={{ fontSize: 13.5, color: "#64748b", margin: 0, lineHeight: 1.5 }}>
          Lengkapi identitas almamater Anda. Data ini otomatis digunakan untuk Cover proposal DOCX dan memuat template proposal akademik yang sesuai.
        </p>
      </div>

      <div
        className="card-fluento"
        style={{
          width: "100%",
          maxWidth: 580,
          background: "#ffffff",
          borderRadius: 16,
          border: "1px solid #e2e8f0",
          padding: "32px 36px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, position: "relative" }}>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 20,
              right: 20,
              height: 2,
              background: "#f1f5f9",
              transform: "translateY(-50%)",
              zIndex: 0,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 20,
              width: `${((step - 1) / (stepList.length - 1)) * 90}%`,
              height: 2,
              background: "#00C988",
              transform: "translateY(-50%)",
              zIndex: 0,
              transition: "width 0.25s ease",
            }}
          />

          {stepList.map((s) => {
            const Icon = s.icon;
            const isDone = step > s.num;
            const isCurrent = step === s.num;

            return (
              <div
                key={s.num}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  zIndex: 1,
                  background: "#ffffff",
                  padding: "0 4px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setStep(s.num)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    border: isCurrent
                      ? "2px solid #00C988"
                      : isDone
                      ? "2px solid #00C988"
                      : "2px solid #e2e8f0",
                    background: isCurrent ? "#e6f9f2" : isDone ? "#00C988" : "#ffffff",
                    color: isCurrent ? "#059669" : isDone ? "#ffffff" : "#94a3b8",
                  }}
                >
                  {isDone ? <CheckCircle2 size={18} /> : <Icon size={16} />}
                </button>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: isCurrent ? 700 : 500,
                    color: isCurrent ? "#059669" : "#64748b",
                  }}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {error && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              background: "#fff1f2",
              border: "1px solid #fecdd3",
              color: "#be123c",
              fontSize: 12.5,
              fontWeight: 600,
              marginBottom: 20,
            }}
          >
            {error}
          </div>
        )}

        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 4px" }}>
                Identitas Mahasiswa
              </h2>
              <p style={{ fontSize: 12.5, color: "#64748b", margin: 0 }}>
                Nama dan NIM Anda akan dicetak resmi pada halaman Cover dan Lembar Persetujuan proposal.
              </p>
            </div>

            <Input
              id="nama-lengkap"
              label="Nama Lengkap Sesuai KTM"
              required
              placeholder="Contoh: Nexta Pratama"
              value={namaLengkap}
              onChange={(e) => setNamaLengkap(e.target.value)}
            />

            <Input
              id="nim"
              label="Nomor Induk Mahasiswa (NIM)"
              required
              placeholder="Contoh: 1301213000"
              value={nim}
              onChange={(e) => setNim(e.target.value)}
            />
          </div>
        )}

        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 4px" }}>
                Program Studi & Role Riset
              </h2>
              <p style={{ fontSize: 12.5, color: "#64748b", margin: 0 }}>
                Menentukan template proposal default yang otomatis dimuat (misal: struktur Proposal Tugas Akhir Informatika FIF).
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
                Program Studi <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <select
                value={programStudi}
                onChange={(e) => setProgramStudi(e.target.value)}
                style={{
                  height: 42,
                  padding: "0 14px",
                  borderRadius: 10,
                  border: "1px solid #cbd5e1",
                  fontSize: 13.5,
                  color: "#0f172a",
                  outline: "none",
                  background: "#ffffff",
                }}
              >
                <option value="S1 Informatika">S1 Informatika</option>
                <option value="S1 Rekayasa Perangkat Lunak">S1 Rekayasa Perangkat Lunak</option>
                <option value="S1 Teknologi Informasi">S1 Teknologi Informasi</option>
                <option value="S1 Sains Data">S1 Sains Data</option>
                <option value="S1 Sistem Informasi">S1 Sistem Informasi</option>
                <option value="S1 Teknik Elektro">S1 Teknik Elektro</option>
                <option value="Lainnya">Program Studi Lainnya (Dapat Disesuaikan)</option>
              </select>
            </div>

            <Input
              id="fakultas"
              label="Fakultas"
              required
              placeholder="Contoh: Fakultas Informatika (FIF)"
              value={fakultas}
              onChange={(e) => setFakultas(e.target.value)}
            />

            <div
              style={{
                padding: "12px 14px",
                borderRadius: 10,
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                color: "#166534",
                fontSize: 12,
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
                lineHeight: 1.45,
              }}
            >
              <ShieldCheck size={16} color="#059669" style={{ flexShrink: 0, marginTop: 2 }} />
              <span>
                Format naskah proposal dan lembar sampul akademik akan disesuaikan secara dinamis dengan program studi dan panduan universitas Anda.
              </span>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 4px" }}>
                Institusi & Kota Kampus
              </h2>
              <p style={{ fontSize: 12.5, color: "#64748b", margin: 0 }}>
                Nama universitas/institut dan kota tempat Anda menempuh studi. Anda dapat mencari dari rekomendasi resmi atau mengetik manual.
              </p>
            </div>

            <UniversityAutocomplete
              id="universitas"
              label="Universitas / Institut"
              placeholder="Ketik atau cari nama universitas (contoh: Universitas Indonesia, ITB, dll)..."
              value={universitas}
              onChange={(val) => setUniversitas(val)}
              onSelectCity={(city) => {
                if (!kota || kota.trim() === "") {
                  setKota(city);
                }
              }}
              required
            />

            <Input
              id="kota"
              label="Kota Institusi"
              placeholder="Contoh: Bandung, Jakarta, Yogyakarta, dll"
              value={kota}
              onChange={(e) => setKota(e.target.value)}
            />
          </div>
        )}

        {step === 4 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 4px" }}>
                Logo Institusi & Konfirmasi
              </h2>
              <p style={{ fontSize: 12.5, color: "#64748b", margin: 0 }}>
                Logo resmi institusi akan ditempatkan di tengah halaman Cover proposal.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: 16,
                borderRadius: 12,
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 10,
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                {previewUrl || logoUrl ? (
                  <img
                    src={previewUrl || getFullImageUrl(logoUrl) || ""}
                    alt="Logo"
                    style={{ width: "100%", height: "100%", objectFit: "contain", padding: 6 }}
                    onError={() => {
                      // Fallback if image path fails to load
                      setPreviewUrl(null);
                    }}
                  />
                ) : (
                  <ImageIcon size={28} color="#94a3b8" />
                )}
              </div>

              <div style={{ flex: 1 }}>
                <label
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 14px",
                    borderRadius: 8,
                    background: "#ffffff",
                    border: "1px solid #cbd5e1",
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: "#334155",
                    cursor: "pointer",
                  }}
                >
                  <Upload size={14} />
                  <span>{uploadingLogo ? "Mengunggah..." : "Unggah Logo (PNG/JPG)"}</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                    style={{ display: "none" }}
                  />
                </label>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 6 }}>
                  Format transparan PNG disarankan untuk hasil cetak Cover terbaik.
                </div>
              </div>
            </div>

            <div
              style={{
                padding: "12px 16px",
                borderRadius: 12,
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                fontSize: 12.5,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Ringkasan Profil
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b" }}>Nama & NIM:</span>
                <span style={{ fontWeight: 600, color: "#0f172a" }}>{namaLengkap} ({nim})</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b" }}>Program Studi:</span>
                <span style={{ fontWeight: 600, color: "#0f172a" }}>{programStudi}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b" }}>Fakultas / Kampus:</span>
                <span style={{ fontWeight: 600, color: "#0f172a" }}>{fakultas}, {universitas}</span>
              </div>
            </div>
          </div>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 32,
            paddingTop: 20,
            borderTop: "1px solid #f1f5f9",
          }}
        >
          {step > 1 ? (
            <Button
              variant="secondary"
              size="sm"
              icon={<ArrowLeft size={14} />}
              onClick={() => setStep(step - 1)}
            >
              Kembali
            </Button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <Button
              variant="emerald"
              size="sm"
              icon={<ArrowRight size={14} />}
              onClick={() => {
                if (step === 1 && (!namaLengkap.trim() || !nim.trim())) {
                  setError("Nama dan NIM wajib diisi terlebih dahulu");
                  return;
                }
                setError(null);
                setStep(step + 1);
              }}
            >
              Lanjut
            </Button>
          ) : (
            <Button
              variant="emerald"
              size="md"
              disabled={saving}
              onClick={handleComplete}
              icon={<CheckCircle2 size={16} />}
            >
              {saving ? "Menyimpan & Menyiapkan..." : "Selesai & Masuk Dashboard"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
