"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, RefreshCw, Eye, EyeOff } from "lucide-react";
import { api, setToken } from "@/lib/api-client";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError("Email dan kata sandi wajib diisi");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.auth.login({ email: email.trim(), password });

      // Validasi hak akses Admin
      if (res.user?.role !== "ADMIN") {
        setError("Akses ditolak: Akun ini terdaftar sebagai Pengguna biasa (USER), bukan Administrator sistem.");
        setLoading(false);
        return;
      }

      setToken(res.token);
      window.location.href = "/admin-only/dashboard";
    } catch (err: any) {
      setError(err?.message || "Gagal masuk. Periksa kembali email dan password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(145deg, #f0fdf4 0%, #f8fafc 45%, #eff6ff 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        fontFamily: "var(--font-body)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#ffffff",
          borderRadius: 20,
          boxShadow: "0 20px 45px -12px rgba(15, 23, 42, 0.08)",
          border: "1px solid #e2e8f0",
          overflow: "hidden",
        }}
      >
        {/* Header Branding (Light Mode) */}
        <div
          style={{
            padding: "36px 32px 20px",
            textAlign: "center",
            background: "#ffffff",
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: "#ecfdf5",
              border: "1px solid #a7f3d0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              color: "#059669",
              boxShadow: "0 2px 8px rgba(0, 201, 136, 0.12)",
            }}
          >
            <ShieldCheck size={28} />
          </div>

          <h1
            style={{
              fontSize: 22,
              fontWeight: 800,
              margin: "0 0 6px",
              color: "#0f172a",
              fontFamily: "var(--font-display)",
              letterSpacing: "-0.015em",
            }}
          >
            Zetera Admin Portal
          </h1>
          <p style={{ fontSize: 13, color: "#64748b", margin: 0, lineHeight: 1.5 }}>
            Masuk untuk mengelola API keys database, pengguna, dan konfigurasi sistem.
          </p>
        </div>

        {/* Form Body */}
        <div style={{ padding: "10px 32px 36px" }}>
          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                background: "#fff1f2",
                border: "1px solid #fecdd3",
                borderRadius: 10,
                padding: "12px 14px",
                marginBottom: 20,
                color: "#be123c",
                fontSize: 12.5,
                lineHeight: 1.5,
              }}
            >
              <AlertCircle size={17} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#334155",
                  marginBottom: 6,
                }}
              >
                Email Administrator
              </label>
              <div style={{ position: "relative" }}>
                <Mail
                  size={16}
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94a3b8",
                  }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@zetera.id"
                  required
                  style={{
                    width: "100%",
                    padding: "10px 14px 10px 40px",
                    borderRadius: 10,
                    border: "1px solid #cbd5e1",
                    fontSize: 13.5,
                    color: "#0f172a",
                    outline: "none",
                    background: "#ffffff",
                    transition: "border-color 0.15s ease",
                  }}
                />
              </div>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#334155",
                  marginBottom: 6,
                }}
              >
                Kata Sandi
              </label>
              <div style={{ position: "relative" }}>
                <Lock
                  size={16}
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94a3b8",
                  }}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  style={{
                    width: "100%",
                    padding: "10px 42px 10px 40px",
                    borderRadius: 10,
                    border: "1px solid #cbd5e1",
                    fontSize: 13.5,
                    color: "#0f172a",
                    outline: "none",
                    background: "#ffffff",
                    transition: "border-color 0.15s ease",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    padding: 4,
                    cursor: "pointer",
                    color: "#94a3b8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    outline: "none",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#0f172a")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
                  title={showPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                background: "#0f172a",
                color: "#ffffff",
                border: "none",
                borderRadius: 10,
                padding: "12px",
                fontSize: 13.5,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 4px 12px rgba(15, 23, 42, 0.15)",
                marginTop: 4,
                transition: "all 0.15s ease",
              }}
            >
              {loading ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>Memverifikasi Hak Akses...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Admin Console</span>
                  <ArrowRight size={15} color="#00C988" />
                </>
              )}
            </button>
          </form>

          <div
            style={{
              marginTop: 24,
              paddingTop: 18,
              borderTop: "1px solid #f1f5f9",
              textAlign: "center",
              fontSize: 12.5,
              color: "#64748b",
            }}
          >
            Bukan Administrator?{" "}
            <Link
              href="/login"
              style={{ color: "#00C988", fontWeight: 700, textDecoration: "none" }}
            >
              Masuk ke Workspace Mahasiswa
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
