"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Button, AcademicMark } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EyebrowPill } from "@/components/ui/EyebrowPill";
import { useAuth } from "@/lib/auth-context";

function AcademicBadge({
  style,
  tag,
  title,
  wash,
}: {
  style: React.CSSProperties;
  tag: string;
  title: string;
  wash: string;
}) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        borderRadius: 16,
        background: "#ffffff",
        boxShadow: "0 0 0 1px oklab(0 0 0 / 0.06), 0 10px 28px rgba(8, 48, 76, 0.06)",
        padding: "14px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        userSelect: "none",
        pointerEvents: "none",
        ...style,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-switzer)",
          fontSize: 10,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--color-nautical-teal)",
          background: wash,
          padding: "2px 6px",
          borderRadius: 4,
          alignSelf: "flex-start",
        }}
      >
        {tag}
      </span>
      <span
        style={{
          fontFamily: "var(--font-basier-circle)",
          fontSize: 13,
          fontWeight: 600,
          color: "var(--color-portrait-ink)",
        }}
      >
        {title}
      </span>
    </div>
  );
}

export default function SignupPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function set(field: string, val: string) {
    setForm((prev) => ({ ...prev, [field]: val }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Nama lengkap wajib diisi";
    if (!form.email) e.email = "Email wajib diisi";
    else if (!/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) e.email = "Format email tidak valid";
    if (!form.password) e.password = "Password wajib diisi";
    else if (form.password.length < 8) e.password = "Minimal 8 karakter";
    if (!form.confirm) e.confirm = "Konfirmasi password wajib diisi";
    else if (form.confirm !== form.password) e.confirm = "Password tidak cocok";
    return e;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      await register(form.name, form.email, form.password);
    } catch (err: any) {
      setErrors({ general: err.message || "Gagal membuat akun. Silakan coba lagi." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--color-white-canvas)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative academic badges */}
      <AcademicBadge
        style={{ width: 170, top: "10%", left: "4%", rotate: "-6deg", opacity: 0.85 }}
        tag="Project Skripsi"
        title="Manajemen Literatur"
        wash="var(--color-sky-wash)"
      />
      <AcademicBadge
        style={{ width: 160, top: "15%", right: "5%", rotate: "5deg", opacity: 0.85 }}
        tag="Node Graph"
        title="Kerangka Berpikir"
        wash="var(--color-mint-wash)"
      />
      <AcademicBadge
        style={{ width: 170, bottom: "12%", left: "6%", rotate: "4deg", opacity: 0.8 }}
        tag="Research Gap"
        title="Kebaruan Penelitian"
        wash="var(--color-peach-wash)"
      />
      <AcademicBadge
        style={{ width: 160, bottom: "16%", right: "6%", rotate: "-3deg", opacity: 0.8 }}
        tag="Evidence Hub"
        title="Kutipan Terverifikasi"
        wash="var(--color-mint-wash)"
      />

      {/* Signup Card */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 440,
          background: "var(--color-white-canvas)",
          borderRadius: "var(--radius-cards)",
          boxShadow: "0 10px 40px rgba(8, 48, 76, 0.08), 0 0 0 1px rgba(8, 48, 76, 0.06)",
          padding: "40px 36px 36px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 26 }}>
          <AcademicMark size={18} />
          <span
            style={{
              fontFamily: "var(--font-basier-circle)",
              fontSize: 20,
              fontWeight: 600,
              color: "var(--color-portrait-ink)",
              letterSpacing: "-0.03em",
            }}
          >
            Zetera
          </span>
        </div>

        <div style={{ marginBottom: 14 }}>
          <EyebrowPill wash="mint">Mulai Riset Akademik</EyebrowPill>
        </div>

        <h1
          style={{
            fontFamily: "var(--font-basier-circle)",
            fontSize: 28,
            fontWeight: 600,
            lineHeight: 1.15,
            letterSpacing: "-0.4px",
            color: "var(--color-portrait-ink)",
            margin: "0 0 8px",
          }}
        >
          Buat akun
          <br />
          workspace riset.
        </h1>
        <p
          style={{
            fontFamily: "var(--font-switzer)",
            fontSize: 14,
            color: "var(--color-slate-helper)",
            margin: "0 0 24px",
            lineHeight: 1.5,
          }}
        >
          Kelola jurnal, temukan gap, susun proposal — semuanya di satu tempat.
        </p>

        {errors.general && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "var(--radius-inputs)",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#991b1b",
              fontSize: 13,
              fontFamily: "var(--font-switzer)",
              marginBottom: 16,
            }}
          >
            {errors.general}
          </div>
        )}

        <form
          id="signup-form"
          onSubmit={handleSubmit}
          noValidate
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          <Input
            id="signup-name"
            type="text"
            label="Nama Lengkap / Gelar"
            placeholder="Ahmad Fauzi, S.Kom."
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            error={errors.name}
            autoComplete="name"
          />
          <Input
            id="signup-email"
            type="email"
            label="Email"
            placeholder="mahasiswa@kampus.ac.id"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            error={errors.email}
            autoComplete="email"
          />
          <Input
            id="signup-password"
            type={showPassword ? "text" : "password"}
            label="Password"
            placeholder="Min. 8 karakter"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            error={errors.password}
            autoComplete="new-password"
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: "transparent",
                  border: "none",
                  padding: 4,
                  cursor: "pointer",
                  color: "#64748b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  outline: "none",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#0f172a")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
                title={showPassword ? "Sembunyikan password" : "Lihat password"}
                aria-label={showPassword ? "Sembunyikan password" : "Lihat password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />
          <Input
            id="signup-confirm"
            type={showConfirm ? "text" : "password"}
            label="Konfirmasi Password"
            placeholder="Ulangi password"
            value={form.confirm}
            onChange={(e) => set("confirm", e.target.value)}
            error={errors.confirm}
            autoComplete="new-password"
            rightElement={
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                style={{
                  background: "transparent",
                  border: "none",
                  padding: 4,
                  cursor: "pointer",
                  color: "#64748b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  outline: "none",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#0f172a")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
                title={showConfirm ? "Sembunyikan konfirmasi password" : "Lihat konfirmasi password"}
                aria-label={showConfirm ? "Sembunyikan konfirmasi password" : "Lihat konfirmasi password"}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />

          <div style={{ marginTop: 6 }}>
            <Button id="signup-submit" type="submit" fullWidth disabled={loading} variant="primary">
              {loading ? "Mendaftarkan akun..." : "Buat Akun Workspace"}
            </Button>
          </div>
        </form>

        <p
          style={{
            fontFamily: "var(--font-switzer)",
            fontSize: 12,
            color: "var(--color-slate-helper)",
            textAlign: "center",
            margin: "16px 0",
            lineHeight: 1.5,
          }}
        >
          Dengan mendaftar, kamu menyetujui integritas akademik &{" "}
          <Link href="/terms" style={{ color: "var(--color-portrait-ink)", textDecoration: "none" }}>
            Ketentuan Layanan
          </Link>
          .
        </p>

        <div
          style={{ display: "flex", alignItems: "center", gap: 12, margin: "8px 0 20px" }}
        >
          <div style={{ flex: 1, height: 1, background: "var(--color-ash-divider)" }} />
          <span style={{ fontFamily: "var(--font-switzer)", fontSize: 12, color: "var(--color-slate-helper)" }}>
            atau
          </span>
          <div style={{ flex: 1, height: 1, background: "var(--color-ash-divider)" }} />
        </div>

        <p
          style={{
            fontFamily: "var(--font-switzer)",
            fontSize: 14,
            color: "var(--color-slate-helper)",
            textAlign: "center",
            margin: 0,
          }}
        >
          Sudah punya akun?{" "}
          <Link
            id="go-to-login"
            href="/login"
            style={{
              color: "var(--color-portrait-ink)",
              fontWeight: 600,
              textDecoration: "none",
              borderBottom: "1.5px solid var(--color-portrait-ink)",
              paddingBottom: 1,
            }}
          >
            Masuk
          </Link>
        </p>
      </div>
    </main>
  );
}
