"use client";

import Link from "next/link";
import { Button, AcademicMark, GraduationCapIcon } from "@/components/ui/Button";
import { GhostButton } from "@/components/ui/GhostButton";
import { EyebrowPill } from "@/components/ui/EyebrowPill";

// Floating pill nav — sticky top
function FloatingNav() {
  return (
    <nav
      aria-label="Main navigation"
      style={{
        position: "fixed",
        top: 20,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 18px",
        height: 54,
        borderRadius: "var(--radius-nav)",
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 4px 20px rgba(8, 48, 76, 0.06), 0 0 0 1px rgba(8, 48, 76, 0.08)",
        width: "calc(100% - 40px)",
        maxWidth: 780,
        boxSizing: "border-box",
      }}
    >
      {/* Wordmark */}
      <Link
        href="/"
        id="nav-logo"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          textDecoration: "none",
          flexShrink: 0,
        }}
      >
        <AcademicMark size={16} />
        <span
          style={{
            fontFamily: "var(--font-basier-circle)",
            fontSize: 18,
            fontWeight: 600,
            color: "var(--color-portrait-ink)",
            letterSpacing: "-0.03em",
          }}
        >
          Zetera
        </span>
      </Link>

      {/* Center announcement pill */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 12px",
            borderRadius: "9999px",
            background: "var(--color-sky-wash)",
            fontFamily: "var(--font-switzer)",
            fontSize: 12,
            fontWeight: 500,
            color: "var(--color-portrait-ink)",
            whiteSpace: "nowrap",
          }}
        >
          <span
            style={{
              background: "var(--color-mint-wash)",
              color: "#166534",
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "1px 6px",
              borderRadius: "9999px",
            }}
          >
            Academic AI
          </span>
          Workspace Riset & Skripsi Mahasiswa
        </span>
      </div>

      {/* Nav actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <GhostButton href="/login" id="nav-login">
          <span style={{ fontSize: 14, fontWeight: 500 }}>Masuk</span>
        </GhostButton>
        <Link href="/signup" style={{ textDecoration: "none" }}>
          <Button id="nav-signup" size="sm" variant="primary">
            Daftar Gratis
          </Button>
        </Link>
      </div>
    </nav>
  );
}

// Academic Paper Card in background
function AcademicPaperCard({
  accent,
  title,
  subtitle,
  tag,
  style,
}: {
  accent: string;
  title: string;
  subtitle: string;
  tag: string;
  style: React.CSSProperties;
}) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        background: "#ffffff",
        borderRadius: 18,
        boxShadow: "0 0 0 1px oklab(0 0 0 / 0.06), 0 12px 32px rgba(8, 48, 76, 0.07)",
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        userSelect: "none",
        pointerEvents: "none",
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--color-nautical-teal)",
            background: accent,
            padding: "2px 8px",
            borderRadius: 6,
          }}
        >
          {tag}
        </span>
        <span style={{ fontSize: 12 }}>📖</span>
      </div>
      <span
        style={{
          fontFamily: "var(--font-basier-circle)",
          fontSize: 13,
          fontWeight: 600,
          color: "var(--color-portrait-ink)",
          lineHeight: 1.3,
        }}
      >
        {title}
      </span>
      <span
        style={{
          fontFamily: "var(--font-switzer)",
          fontSize: 11,
          color: "var(--color-slate-helper)",
        }}
      >
        {subtitle}
      </span>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-white-canvas)",
        overflowX: "hidden",
      }}
    >
      <FloatingNav />

      {/* Hero */}
      <section
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "130px 24px 80px",
          textAlign: "center",
        }}
      >
        {/* Background Academic Cards */}
        <AcademicPaperCard
          style={{ width: 190, top: "16%", left: "4%", rotate: "-5deg" }}
          tag="Literature Review"
          title="Analisis Gap Metodologi"
          subtitle="12 Jurnal Terindeks Scopus"
          accent="var(--color-sky-wash)"
        />
        <AcademicPaperCard
          style={{ width: 180, top: "22%", right: "4%", rotate: "4deg" }}
          tag="Kerangka Berpikir"
          title="Variabel Independen X"
          subtitle="Validasi Bukti Empiris"
          accent="var(--color-mint-wash)"
        />
        <AcademicPaperCard
          style={{ width: 175, bottom: "20%", left: "3%", rotate: "3deg" }}
          tag="Synthesizer"
          title="Cross-Check 5 Jurnal"
          subtitle="Metode Kuantitatif vs Kualitatif"
          accent="var(--color-peach-wash)"
        />
        <AcademicPaperCard
          style={{ width: 170, bottom: "24%", right: "4%", rotate: "-4deg" }}
          tag="Research Gap"
          title="Peluang Kebaruan Riset"
          subtitle="Teridentifikasi Otomatis"
          accent="var(--color-mint-wash)"
        />

        {/* Content stack */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            maxWidth: 720,
          }}
        >
          {/* Eyebrow */}
          <div style={{ marginBottom: 20 }}>
            <EyebrowPill wash="sky">
              <GraduationCapIcon size={13} />
              Research & Academic Workspace
            </EyebrowPill>
          </div>

          {/* Display headline */}
          <h1
            style={{
              fontFamily: "var(--font-basier-circle)",
              fontSize: "clamp(42px, 6.5vw, 68px)",
              fontWeight: 600,
              lineHeight: 1.05,
              letterSpacing: "clamp(-1px, -0.04em, -3px)",
              color: "var(--color-portrait-ink)",
              margin: "0 0 24px",
              maxWidth: 680,
            }}
          >
            Satu tempat untuk memetakan{" "}
            <span
              style={{
                color: "var(--color-nautical-teal)",
                borderBottom: "3px solid var(--color-mint-wash)",
                paddingBottom: 2,
              }}
            >
              seluruh literatur
            </span>{" "}
            skripsimu.
          </h1>

          {/* Subtext */}
          <p
            style={{
              fontFamily: "var(--font-switzer)",
              fontSize: 18,
              fontWeight: 400,
              lineHeight: 1.6,
              color: "var(--color-graphite-body)",
              margin: "0 0 36px",
              maxWidth: 520,
            }}
          >
            Zetera mengingat, memvalidasi, dan menghubungkan setiap jurnal
            dengan kerangka berpikir penelitianmu — mulai dari tinjauan pustaka hingga proposal siap sidang.
          </p>

          {/* CTA group */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
            <Link href="/signup" style={{ textDecoration: "none" }}>
              <Button id="hero-signup-cta" size="lg" variant="primary">
                Mulai Riset Sekarang — Gratis
              </Button>
            </Link>
            <Link href="/login" style={{ textDecoration: "none" }}>
              <Button id="hero-login-link" size="lg" variant="secondary">
                Masuk ke Workspace →
              </Button>
            </Link>
          </div>

          {/* Trust note */}
          <p
            style={{
              fontFamily: "var(--font-switzer)",
              fontSize: 13,
              color: "var(--color-slate-helper)",
              margin: "24px 0 0",
              letterSpacing: "0.01em",
            }}
          >
            Didesain khusus untuk mahasiswa S1 & Peneliti Akademik
          </p>
        </div>
      </section>

      {/* Academic Feature Cards */}
      <section
        aria-label="Fitur utama"
        style={{
          maxWidth: "var(--page-max-width)",
          margin: "0 auto",
          padding: "0 24px 120px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: 24,
        }}
      >
        {[
          {
            wash: "#e8f1ff",
            icon: "📑",
            title: "Import & Bedah Jurnal",
            desc: "Upload PDF atau paste DOI — parsing metadata otomatis, abstrak, dan ekstraksi variabel.",
          },
          {
            wash: "#d7ffe2",
            icon: "🧠",
            title: "AI Analysis 2-Tier",
            desc: "Groq gratis untuk cek relevansi cepat, LLM berbayar untuk deep extraction metode & temuan.",
          },
          {
            wash: "#ffebd6",
            icon: "🗺️",
            title: "Visual Research Framework",
            desc: "Petakan variabel independen, dependen, dan metode dalam interactive node graph.",
          },
          {
            wash: "#e8f1ff",
            icon: "🔍",
            title: "Deteksi Research Gap",
            desc: "Temukan gap eksplisit dan inferensi lintas-jurnal untuk memperkuat kebaruan proposalmu.",
          },
        ].map((f) => (
          <div
            key={f.title}
            style={{
              borderRadius: "var(--radius-cards)",
              boxShadow: "var(--shadow-subtle-2)",
              padding: "28px 24px",
              background: "#fff",
              display: "flex",
              flexDirection: "column",
              gap: 14,
              border: "1px solid var(--color-mist-hairline)",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: f.wash,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
              }}
            >
              {f.icon}
            </div>
            <h3
              style={{
                fontFamily: "var(--font-basier-circle)",
                fontSize: 19,
                fontWeight: 600,
                color: "var(--color-portrait-ink)",
                letterSpacing: "-0.02em",
                margin: 0,
              }}
            >
              {f.title}
            </h3>
            <p
              style={{
                fontFamily: "var(--font-switzer)",
                fontSize: 14,
                lineHeight: 1.6,
                color: "var(--color-slate-helper)",
                margin: 0,
              }}
            >
              {f.desc}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
