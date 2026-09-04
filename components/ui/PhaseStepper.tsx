"use client";

import Link from "next/link";
import { CheckCircle2, Lock, Sparkles, BookOpen, Network, FileEdit, ArrowRight } from "lucide-react";
import { notify } from "@/lib/notification";

export interface PhaseStep {
  id: number;
  name: string;
  title: string;
  description: string;
  href: string;
  status: "COMPLETED" | "ACTIVE" | "LOCKED";
  lockReason?: string;
  badge?: string;
}

interface PhaseStepperProps {
  projectId: string;
  currentPhase: number;
  approvedJournalsCount: number;
  totalNodesCount: number;
}

export function PhaseStepper({
  projectId,
  currentPhase,
  approvedJournalsCount,
  totalNodesCount,
}: PhaseStepperProps) {
  const isPhase2Unlocked = true; // Phase 1 is done upon project creation
  const isPhase3Unlocked = approvedJournalsCount > 0;
  const isPhase4Unlocked = isPhase3Unlocked && totalNodesCount > 0;

  const phases: PhaseStep[] = [
    {
      id: 1,
      name: "Fase 1",
      title: "Topik & Masalah",
      description: "Penentuan judul & fokus riset skripsi",
      href: `/dashboard`,
      status: "COMPLETED",
      badge: "Selesai",
    },
    {
      id: 2,
      name: "Fase 2",
      title: "Telaah Jurnal & AI Cross-Check",
      description: "Upload & verifikasi relevansi disiplin ilmu",
      href: `/projects/${projectId}/journals`,
      status: currentPhase === 2 ? "ACTIVE" : approvedJournalsCount > 0 ? "COMPLETED" : "ACTIVE",
      badge: approvedJournalsCount > 0 ? `${approvedJournalsCount} Disetujui` : "Wajib ≥ 1 Jurnal",
    },
    {
      id: 3,
      name: "Fase 3",
      title: "Kanvas Kerangka Berpikir",
      description: "Pemetaan variabel X-Y & metodologi",
      href: `/projects/${projectId}/framework`,
      status: !isPhase3Unlocked ? "LOCKED" : currentPhase === 3 ? "ACTIVE" : totalNodesCount > 0 ? "COMPLETED" : "ACTIVE",
      lockReason: "Gembok: Selesaikan telaah minimal 1 jurnal yang Disetujui (Approved) pada Fase 2.",
      badge: totalNodesCount > 0 ? `${totalNodesCount} Node` : isPhase3Unlocked ? "Terbuka" : "Terkunci",
    },
    {
      id: 4,
      name: "Fase 4",
      title: "Research Gap & Draft Proposal",
      description: "Ekspor otomatis dokumen proposal DOCX",
      href: `/projects/${projectId}/proposal`,
      status: !isPhase4Unlocked ? "LOCKED" : currentPhase === 4 ? "ACTIVE" : "ACTIVE",
      lockReason: "Gembok: Susun kerangka berpikir di kanvas (Fase 3) terlebih dahulu.",
      badge: isPhase4Unlocked ? "Siap Tulis" : "Terkunci",
    },
  ];

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: 14,
        padding: "16px 20px",
        marginBottom: 20,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
          gap: 12,
        }}
      >
        {phases.map((phase, idx) => {
          const isCurrent = currentPhase === phase.id;
          const isLocked = phase.status === "LOCKED";
          const isCompleted = phase.status === "COMPLETED";

          const cardContent = (
            <div
              style={{
                height: "100%",
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid",
                borderColor: isCurrent
                  ? "#00C988"
                  : isLocked
                    ? "#e2e8f0"
                    : isCompleted
                      ? "#bbf7d0"
                      : "#e2e8f0",
                background: isCurrent
                  ? "#f0fdf4"
                  : isLocked
                    ? "#f8fafc"
                    : isCompleted
                      ? "#f0fdf4"
                      : "#ffffff",
                opacity: isLocked ? 0.65 : 1,
                cursor: isLocked ? "not-allowed" : "pointer",
                transition: "all 0.15s ease",
                display: "flex",
                flexDirection: "column",
                gap: 6,
                position: "relative",
              }}
              title={isLocked ? phase.lockReason : `Buka ${phase.title}`}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {isCompleted ? (
                    <CheckCircle2 size={15} color="#059669" />
                  ) : isLocked ? (
                    <Lock size={15} color="#94a3b8" />
                  ) : (
                    <span
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        background: "#00C988",
                        color: "#ffffff",
                        fontSize: 10,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {phase.id}
                    </span>
                  )}
                  <span style={{ fontSize: 11, fontWeight: 700, color: isLocked ? "#64748b" : "#0f172a" }}>
                    {phase.name}
                  </span>
                </div>

                {phase.badge && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 6px",
                      borderRadius: 4,
                      background: isLocked
                        ? "#e2e8f0"
                        : isCompleted || isCurrent
                          ? "#dcfce7"
                          : "#f1f5f9",
                      color: isLocked
                        ? "#64748b"
                        : isCompleted || isCurrent
                          ? "#15803d"
                          : "#475569",
                    }}
                  >
                    {phase.badge}
                  </span>
                )}
              </div>

              <div style={{ fontSize: 13, fontWeight: 700, color: isLocked ? "#64748b" : "#0f172a" }}>
                {phase.title}
              </div>

              <div style={{ fontSize: 11, color: isLocked ? "#94a3b8" : "#64748b", lineHeight: 1.35 }}>
                {phase.description}
              </div>

              {isLocked && (
                <div style={{ fontSize: 10.5, color: "#e11d48", fontWeight: 600, marginTop: 2, display: "flex", alignItems: "center", gap: 3 }}>
                  <Lock size={10} />
                  <span>{phase.lockReason}</span>
                </div>
              )}
            </div>
          );

          if (isLocked) {
            return (
              <div key={phase.id} onClick={() => notify.info("Fase Belum Terbuka", phase.lockReason)}>
                {cardContent}
              </div>
            );
          }

          return (
            <Link key={phase.id} href={phase.href} style={{ textDecoration: "none" }}>
              {cardContent}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
