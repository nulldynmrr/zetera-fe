"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { api } from "@/lib/api-client";
import {
  BookOpen,
  Network,
  FileEdit,
  Lock,
  CheckCircle2,
  LayoutDashboard,
  Layers,
  Sparkles,
  ChevronRight,
  FileText,
  ListTree,
} from "lucide-react";

interface ProjectSidebarProps {
  projectId: string;
  approvedJournalsCount?: number;
  totalNodesCount?: number;
  activeTab?: string;
  citationStyleSelected?: boolean;
}

export function ProjectSidebar({
  projectId,
  approvedJournalsCount = 0,
  totalNodesCount = 0,
  citationStyleSelected,
}: ProjectSidebarProps) {
  const pathname = usePathname();
  const [hoveredPhase, setHoveredPhase] = useState<number | null>(null);
  const [hasCitationStyle, setHasCitationStyle] = useState<boolean>(Boolean(citationStyleSelected));

  useEffect(() => {
    if (citationStyleSelected !== undefined) {
      setHasCitationStyle(Boolean(citationStyleSelected));
      return;
    }
    if (projectId) {
      api.projects
        .get(projectId)
        .then((res) => {
          if (res.data?.citationStyle) {
            setHasCitationStyle(true);
          }
        })
        .catch(() => {});
    }
  }, [projectId, citationStyleSelected]);

  const phases = [
    {
      id: 1,
      phaseNum: "F1",
      label: "Topik & Judul",
      subtitle: "Penentuan judul & fokus riset skripsi",
      icon: Layers,
      href: `/dashboard`,
      unlocked: true,
      done: true,
      active: false,
      badgeText: "Selesai",
      color: "#059669",
      bgLight: "#ecfdf5",
      borderColor: "#a7f3d0",
    },
    {
      id: 2,
      phaseNum: "F2",
      label: "Template & Sitasi",
      subtitle: "Pilih gaya sitasi sesuai panduan kampus",
      icon: FileText,
      href: `/projects/${projectId}/template`,
      unlocked: true,
      done: hasCitationStyle,
      active: pathname?.includes("/template"),
      badgeText: hasCitationStyle ? "Terpilih" : "Pilih Gaya",
      color: "#b45309",
      bgLight: "#fffbeb",
      borderColor: "#fde68a",
    },
    {
      id: 3,
      phaseNum: "F3",
      label: "Telaah Jurnal",
      subtitle: "Cari jurnal acuan, upload PDF & rekomendasi AI",
      icon: BookOpen,
      href: `/projects/${projectId}/journals`,
      unlocked: true,
      done: approvedJournalsCount > 0,
      active:
        (pathname?.includes("/journals") && !pathname?.includes("/journals/")) ||
        pathname?.includes("/screening"),
      badgeText: approvedJournalsCount > 0 ? `${approvedJournalsCount} Jurnal` : "Pilih Jurnal",
      color: "#059669",
      bgLight: "#ecfdf5",
      borderColor: "#00C988",
    },
    {
      id: 4,
      phaseNum: "F4",
      label: "Research Blueprint",
      subtitle: "Instruksi riset konkret & bukti literatur terpusat",
      icon: Layers,
      href: `/projects/${projectId}/outline`,
      unlocked: true,
      done: false,
      active: pathname?.includes("/outline") && !pathname?.includes("/outline/setup"),
      badgeText: "Mulai Riset",
      color: "#7c3aed",
      bgLight: "#faf5ff",
      borderColor: "#ddd6fe",
    },
    {
      id: 5,
      phaseNum: "F5",
      label: "Daftar Isi (Custom BAB)",
      subtitle: "Susun dan finalisasi kerangka bab skripsi",
      icon: ListTree,
      href: `/projects/${projectId}/outline/setup`,
      unlocked: true,
      done: false,
      active: pathname?.includes("/outline/setup"),
      badgeText: "Struktur Bab",
      color: "#0284c7",
      bgLight: "#f0f9ff",
      borderColor: "#bae6fd",
    },
    {
      id: 6,
      phaseNum: "F6",
      label: "Draft Proposal",
      subtitle: "Research Gap otomatis & ekspor dokumen DOCX",
      icon: FileEdit,
      href: `/projects/${projectId}/proposal`,
      unlocked: true,
      done: false,
      active: pathname?.includes("/proposal"),
      badgeText: "Tulis Proposal",
      color: "#0284c7",
      bgLight: "#f0f9ff",
      borderColor: "#bae6fd",
    },
    {
      id: 7,
      phaseNum: "F7",
      label: "Kanvas Kerangka",
      subtitle: "Pemetaan variabel X-Y & metodologi riset",
      icon: Network,
      href: `/projects/${projectId}/framework`,
      unlocked: true,
      done: totalNodesCount > 0,
      active: pathname?.includes("/framework"),
      badgeText: totalNodesCount > 0 ? `${totalNodesCount} Node` : "Siap",
      color: "#0369a1",
      bgLight: "#f0f9ff",
      borderColor: "#bae6fd",
    },
  ];

  return (
    <aside
      style={{
        width: 72,
        minHeight: "100vh",
        background: "#ffffff",
        borderRight: "1px solid #e2e8f0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 14,
        paddingBottom: 16,
        gap: 0,
        flexShrink: 0,
        position: "sticky",
        top: 0,
        height: "100vh",
        zIndex: 50,
        boxShadow: "1px 0 3px rgba(0,0,0,0.02)",
      }}
    >
      {/* ── LOGO BRAND ── */}
      <Link
        href="/dashboard"
        title="Kembali ke Dashboard"
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          background: "linear-gradient(135deg, #00C988 0%, #059669 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
          textDecoration: "none",
          flexShrink: 0,
          boxShadow: "0 4px 12px rgba(0,201,136,0.25)",
          transition: "transform 0.15s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <span style={{ fontSize: 18, fontWeight: 900, color: "#ffffff", letterSpacing: "-0.05em" }}>Z</span>
      </Link>

      {/* ── DIVIDER ── */}
      <div style={{ width: 36, height: 1, background: "#f1f5f9", marginBottom: 12 }} />

      {/* ── PHASE NAV ITEMS ── */}
      <nav style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, flex: 1, width: "100%" }}>
        {phases.map((phase) => {
          const Icon = phase.icon;
          const isActive = phase.active;
          const isLocked = !phase.unlocked;
          const isDone = phase.done;
          const isHovered = hoveredPhase === phase.id;

          const buttonNode = (
            <div
              onMouseEnter={() => setHoveredPhase(phase.id)}
              onMouseLeave={() => setHoveredPhase(null)}
              style={{
                position: "relative",
                width: 48,
                height: 48,
                borderRadius: 14,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: isActive
                  ? "#ecfdf5"
                  : isLocked
                  ? "#f8fafc"
                  : isHovered
                  ? phase.bgLight
                  : "#f8fafc",
                border: isActive
                  ? "2px solid #00C988"
                  : isLocked
                  ? "1px dashed #cbd5e1"
                  : isHovered
                  ? `1.5px solid ${phase.borderColor}`
                  : "1px solid #e2e8f0",
                cursor: isLocked ? "not-allowed" : "pointer",
                transition: "all 0.18s ease",
                boxShadow: "none",
              }}
            >
              {/* Phase Icon */}
              <Icon
                size={20}
                color={
                  isActive
                    ? "#00C988"
                    : isLocked
                    ? "#94a3b8"
                    : phase.color
                }
                strokeWidth={isActive ? 2.3 : 2}
              />

              {/* Phase Step Tag (F1, F2, F3, F4) */}
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  color: isActive ? "#065f46" : isLocked ? "#94a3b8" : "#475569",
                  lineHeight: 1,
                  marginTop: 2,
                  letterSpacing: "0.02em",
                }}
              >
                {phase.phaseNum}
              </span>

              {/* Lock Badge (Clearly visible Amber/Rose pill on top right) */}
              {isLocked && (
                <div
                  style={{
                    position: "absolute",
                    top: -5,
                    right: -5,
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: "#f43f5e",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid #ffffff",
                    boxShadow: "0 2px 5px rgba(244,63,94,0.35)",
                  }}
                >
                  <Lock size={9} color="#ffffff" strokeWidth={2.5} />
                </div>
              )}

              {/* Done Check Badge */}
              {isDone && !isLocked && !isActive && (
                <div
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -4,
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: "#059669",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid #ffffff",
                    boxShadow: "0 2px 5px rgba(5,150,105,0.3)",
                  }}
                >
                  <CheckCircle2 size={10} color="#ffffff" strokeWidth={2.5} />
                </div>
              )}

              {/* Active Pulse Dot on Left */}
              {isActive && (
                <div
                  style={{
                    position: "absolute",
                    left: -12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 4,
                    height: 24,
                    borderRadius: "0 4px 4px 0",
                    background: "#00C988",
                  }}
                />
              )}
            </div>
          );

          return (
            <div key={phase.id} style={{ position: "relative", width: "100%", display: "flex", justifyContent: "center" }}>
              {isLocked || !phase.href ? (
                <div style={{ textDecoration: "none" }}>{buttonNode}</div>
              ) : (
                <Link href={phase.href} style={{ textDecoration: "none" }}>
                  {buttonNode}
                </Link>
              )}

              {/* ── HIGH-CONTRAST INTERACTIVE HOVER POPOVER / TOOLTIP ── */}
              {isHovered && (
                <div
                  style={{
                    position: "absolute",
                    left: 78,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "#0f172a",
                    color: "#ffffff",
                    borderRadius: 12,
                    padding: "12px 16px",
                    width: 250,
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)",
                    zIndex: 100,
                    pointerEvents: "none",
                    border: "1px solid #334155",
                    animation: "fadeIn 0.15s ease",
                  }}
                >
                  {/* Popover Header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "#00C988", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Fase {phase.id}
                    </span>
                    {isLocked ? (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 3,
                          fontSize: 10,
                          fontWeight: 700,
                          color: "#fecdd3",
                          background: "#881337",
                          padding: "2px 6px",
                          borderRadius: 6,
                        }}
                      >
                        <Lock size={9} /> Terkunci
                      </span>
                    ) : isDone ? (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 3,
                          fontSize: 10,
                          fontWeight: 700,
                          color: "#bbf7d0",
                          background: "#14532d",
                          padding: "2px 6px",
                          borderRadius: 6,
                        }}
                      >
                        <CheckCircle2 size={9} /> Selesai
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: "#93c5fd",
                          background: "#1e3a8a",
                          padding: "2px 6px",
                          borderRadius: 6,
                        }}
                      >
                        Aktif
                      </span>
                    )}
                  </div>

                  {/* Title & Subtitle */}
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#ffffff", marginBottom: 3 }}>
                    {phase.label}
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.4 }}>
                    {phase.subtitle}
                  </div>

                  {/* Lock Requirement explanation */}
                  {isLocked && (phase as any).lockReason && (
                    <div
                      style={{
                        marginTop: 8,
                        paddingTop: 8,
                        borderTop: "1px solid #334155",
                        fontSize: 11,
                        color: "#fda4af",
                        lineHeight: 1.35,
                      }}
                    >
                      <strong style={{ color: "#fb7185" }}>Gembok:</strong> {(phase as any).lockReason}
                    </div>
                  )}

                  {/* Status Badge detail */}
                  {!isLocked && (
                    <div
                      style={{
                        marginTop: 8,
                        paddingTop: 8,
                        borderTop: "1px solid #334155",
                        fontSize: 11,
                        color: "#cbd5e1",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Sparkles size={11} color="#00C988" />
                      <span>Status: {phase.badgeText}</span>
                    </div>
                  )}

                  {/* Little arrow */}
                  <div
                    style={{
                      position: "absolute",
                      left: -6,
                      top: "50%",
                      transform: "translateY(-50%) rotate(45deg)",
                      width: 12,
                      height: 12,
                      background: "#0f172a",
                      borderLeft: "1px solid #334155",
                      borderBottom: "1px solid #334155",
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* ── BOTTOM ICON / SHORTCUT ── */}
      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <div style={{ width: 36, height: 1, background: "#f1f5f9" }} />
        <Link
          href="/dashboard"
          title="Dashboard Semua Proyek"
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#64748b",
            textDecoration: "none",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#f1f5f9";
            e.currentTarget.style.color = "#0f172a";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#f8fafc";
            e.currentTarget.style.color = "#64748b";
          }}
        >
          <LayoutDashboard size={17} />
        </Link>
      </div>
    </aside>
  );
}
