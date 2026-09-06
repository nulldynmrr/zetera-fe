"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, ArrowLeft, Home } from "lucide-react";

export default function ProposalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Proposal Page Error:", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0F172A",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          background: "#1E293B",
          borderRadius: 20,
          border: "1px solid #334155",
          padding: "36px 32px",
          textAlign: "center",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: "rgba(239, 68, 68, 0.12)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            color: "#EF4444",
          }}
        >
          <AlertTriangle size={28} />
        </div>

        <h2
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: "#F8FAFC",
            margin: "0 0 8px",
          }}
        >
          Studio Proposal Mengalami Kendala
        </h2>

        <p
          style={{
            fontSize: 13.5,
            color: "#94A3B8",
            lineHeight: 1.6,
            margin: "0 0 20px",
          }}
        >
          {error?.message && !error.message.includes("digest")
            ? error.message
            : "Terjadi kesalahan saat memuat draf atau data proyek. Periksa koneksi backend atau muat ulang halaman."}
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <button
            type="button"
            onClick={() => reset()}
            style={{
              width: "100%",
              padding: "11px 20px",
              background: "#059669",
              color: "#FFFFFF",
              border: "none",
              borderRadius: 10,
              fontSize: 13.5,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: "0 4px 12px rgba(5, 150, 105, 0.3)",
              transition: "all 0.15s ease",
            }}
          >
            <RefreshCw size={16} />
            <span>Coba Muat Ulang Halaman</span>
          </button>

          <Link
            href="/dashboard"
            style={{
              width: "100%",
              padding: "10px 20px",
              background: "#334155",
              color: "#E2E8F0",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxSizing: "border-box",
            }}
          >
            <Home size={15} />
            <span>Kembali ke Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
