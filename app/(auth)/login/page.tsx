"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, AcademicMark } from "@/components/ui/Button";
import { GhostButton } from "@/components/ui/GhostButton";
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

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const e: { email?: string; password?: string } = {};
    if (!email) e.email = "Email wajib diisi";
    else if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) e.email = "Format email tidak valid";
    if (!password) e.password = "Password wajib diisi";
    else if (password.length < 8) e.password = "Minimal 8 karakter";
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
      await login(email, password);
    } catch (err: any) {
      setErrors({ general: err.message || "Gagal masuk. Periksa email dan password." });
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
      {/* Decorative academic cards — background only */}
      <AcademicBadge
        style={{ width: 170, top: "14%", left: "5%", rotate: "-5deg", opacity: 0.85 }}
        tag="Literature Map"
        title="15 Jurnal Disintesis"
        wash="var(--color-mint-wash)"
      />
      <AcademicBadge
        style={{ width: 160, top: "20%", right: "6%", rotate: "4deg", opacity: 0.85 }}
        tag="Framework"
        title="4 Variabel Penelitian"
        wash="var(--color-sky-wash)"
      />
      <AcademicBadge
        style={{ width: 170, bottom: "16%", left: "7%", rotate: "3deg", opacity: 0.8 }}
        tag="Research Gap"
        title="Gap Metodologi Ditemukan"
        wash="var(--color-peach-wash)"
      />
      <AcademicBadge
        style={{ width: 160, bottom: "18%", right: "7%", rotate: "-4deg", opacity: 0.8 }}
        tag="Review AI"
        title="Ekstraksi Bukti Empiris"
        wash="var(--color-mint-wash)"
      />

      {/* Login Card */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 420,
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
          <EyebrowPill wash="sky">Academic Workspace</EyebrowPill>
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
          Selamat datang
          <br />
          kembali.
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
          Lanjutkan telaah literatur dan penyusunan proposalmu.
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
          id="login-form"
          onSubmit={handleSubmit}
          noValidate
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          <Input
            id="login-email"
            type="email"
            label="Email Institusi / Pribadi"
            placeholder="mahasiswa@kampus.ac.id"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            autoComplete="email"
          />
          <Input
            id="login-password"
            type="password"
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            autoComplete="current-password"
          />

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: -4 }}>
            <GhostButton href="/forgot-password" size="sm" id="forgot-password-link">
              <span style={{ fontSize: 13, color: "var(--color-slate-helper)" }}>
                Lupa password?
              </span>
            </GhostButton>
          </div>

          <div style={{ marginTop: 6 }}>
            <Button id="login-submit" type="submit" fullWidth disabled={loading} variant="primary">
              {loading ? "Menghubungkan..." : "Masuk ke Workspace"}
            </Button>
          </div>
        </form>

        <div
          style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0" }}
        >
          <div style={{ flex: 1, height: 1, background: "var(--color-ash-divider)" }} />
          <span
            style={{
              fontFamily: "var(--font-switzer)",
              fontSize: 12,
              color: "var(--color-slate-helper)",
            }}
          >
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
          Belum punya akun?{" "}
          <Link
            id="go-to-signup"
            href="/signup"
            style={{
              color: "var(--color-portrait-ink)",
              fontWeight: 600,
              textDecoration: "none",
              borderBottom: "1.5px solid var(--color-portrait-ink)",
              paddingBottom: 1,
            }}
          >
            Daftar gratis
          </Link>
        </p>
      </div>
    </main>
  );
}
