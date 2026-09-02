"use client";

import Link from "next/link";
import { ArrowLeft, Settings } from "lucide-react";
import { useRequireAuth } from "@/lib/auth-context";

export default function SettingsPage() {
  const { user } = useRequireAuth();

  return (
    <div style={{ minHeight: "100vh", background: "#fefefe", padding: "40px 24px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#64748b", textDecoration: "none", marginBottom: 20, fontSize: 13, fontWeight: 600 }}>
          <ArrowLeft size={16} /> Kembali ke Dashboard
        </Link>
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <Settings size={22} color="#00C988" />
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", margin: 0 }}>
              Pengaturan Akun & API
            </h1>
          </div>
          <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>
            Pengaturan profil pengguna ({user?.email || "User"}) dan integrasi Groq AI.
          </p>
        </div>
      </div>
    </div>
  );
}
