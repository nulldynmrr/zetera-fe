"use client";

import { memo, useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import {
  Network,
  BookOpen,
  Target,
  FlaskConical,
  GraduationCap,
  Sparkles,
  AlertCircle,
  CheckCircle2, Trash2,
  HelpCircle,
  FileText,
  MoreVertical,
  Languages,
  RefreshCw,
} from "lucide-react";
import type { NodeType, NodeEvidenceStatus } from "@/lib/api-client";
import { isEnglishText, translateEnglishToIndonesian } from "@/lib/translate";

export interface CustomNodeData {
  label: string;
  type: NodeType;
  description?: string;
  status: NodeEvidenceStatus;
  methodCoverage?: string;
  supportingCount?: number;
  [key: string]: any;
}

const typeConfigs: Record<
  NodeType,
  { label: string; bg: string; border: string; text: string; icon: any }
> = {
  VARIABLE: {
    label: "Variabel",
    bg: "#eff6ff",
    border: "#bfdbfe",
    text: "#1d4ed8",
    icon: Network,
  },
  CONCEPT: {
    label: "Konsep",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    text: "#15803d",
    icon: FileText,
  },
  METHOD: {
    label: "Metodologi",
    bg: "#faf5ff",
    border: "#e9d5ff",
    text: "#7e22ce",
    icon: FlaskConical,
  },
  THEORY: {
    label: "Landasan Teori",
    bg: "#fefce8",
    border: "#fef08a",
    text: "#a16207",
    icon: GraduationCap,
  },
  GAP: {
    label: "Research Gap",
    bg: "#fff1f2",
    border: "#fecdd3",
    text: "#be123c",
    icon: Target,
  },
  PROBLEM: {
    label: "Masalah Riset",
    bg: "#fff7ed",
    border: "#fed7aa",
    text: "#c2410c",
    icon: AlertCircle,
  },
};

const statusConfigs: Record<
  NodeEvidenceStatus,
  { label: string; bg: string; text: string; icon: any }
> = {
  UNSUPPORTED: {
    label: "Belum Ada Bukti",
    bg: "#f1f5f9",
    text: "#64748b",
    icon: HelpCircle,
  },
  SUPPORTED: {
    label: "Didukung Bukti",
    bg: "#dcfce7",
    text: "#166534",
    icon: CheckCircle2,
  },
  CONTRADICTORY: {
    label: "Kontradiktif",
    bg: "#fef3c7",
    text: "#92400e",
    icon: AlertCircle,
  },
  NEEDS_REVIEW: {
    label: "Perlu Review",
    bg: "#fee2e2",
    text: "#991b1b",
    icon: Sparkles,
  },
};

export const FrameworkNodeComponent = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as CustomNodeData;
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const nodeType = nodeData.type || "VARIABLE";
  const nodeStatus = nodeData.status || "UNSUPPORTED";

  const typeConfig = typeConfigs[nodeType] || typeConfigs.VARIABLE;
  const statusConfig = statusConfigs[nodeStatus] || statusConfigs.UNSUPPORTED;

  const TypeIcon = typeConfig.icon;
  const StatusIcon = statusConfig.icon;

  const isGap = nodeType === "GAP";
  const isDimmed = Boolean(nodeData.isDimmed);
  const isFocused = Boolean(nodeData.isFocused) || selected;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: "#ffffff",
        borderRadius: 14,
        padding: "14px 16px",
        position: "relative",
        minWidth: 260,
        maxWidth: 320,
        opacity: isDimmed ? (isHovered ? 0.65 : 0.22) : 1,
        filter: isDimmed ? "grayscale(95%)" : "none",
        border: isFocused
          ? "2.5px solid #00C988"
          : isDimmed
          ? "1px solid #e2e8f0"
          : isGap
          ? "2px dashed #f43f5e"
          : "1px solid #cbd5e1",
        boxShadow: isFocused
          ? "0 0 0 4px rgba(0, 201, 136, 0.22), 0 12px 28px -6px rgba(0, 201, 136, 0.25)"
          : "none",
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        fontFamily: "var(--font-body)",
        cursor: "pointer",
        transform: isFocused
          ? isHovered ? "scale(1.05)" : "scale(1.02)"
          : isDimmed
          ? "scale(0.97)"
          : isHovered
          ? "scale(1.04)"
          : "scale(1)",
        zIndex: isFocused ? 20 : isDimmed ? 1 : 5,
      }}
    >
      {/* Handles */}
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: isDimmed ? "#94a3b8" : "#00C988",
          width: 8,
          height: 8,
          border: "none",
          transition: "background 0.2s ease",
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: isDimmed ? "#94a3b8" : "#00C988",
          width: 8,
          height: 8,
          border: "none",
          transition: "background 0.2s ease",
        }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{
          background: isDimmed ? "#94a3b8" : "#00C988",
          width: 8,
          height: 8,
          border: "none",
          transition: "background 0.2s ease",
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{
          background: isDimmed ? "#94a3b8" : "#00C988",
          width: 8,
          height: 8,
          border: "none",
          transition: "background 0.2s ease",
        }}
      />

      {/* Type & Status Row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 6,
          marginBottom: 10,
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "2px 7px",
            borderRadius: 6,
            background: typeConfig.bg,
            color: typeConfig.text,
            fontSize: 10,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          <TypeIcon size={11} />
          {typeConfig.label}
        </span>

        {/* Only show badge if NOT SUPPORTED (e.g. UNSUPPORTED, NEEDS_REVIEW, CONTRADICTORY) */}
        {nodeData.status && nodeData.status !== "SUPPORTED" && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 3,
              padding: "2px 6px",
              borderRadius: 4,
              background: statusConfig.bg,
              color: statusConfig.text,
              fontSize: 10,
              fontWeight: 600,
            }}
          >
            <StatusIcon size={11} />
            {statusConfig.label}
          </span>
        )}
      </div>

      {/* Label */}
      <h4
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 13.5,
          fontWeight: 700,
          color: "#0f172a",
          margin: "0 0 6px",
          lineHeight: 1.35,
        }}
      >
        {nodeData.label}
      </h4>

      {/* Verbatim Quote Snippets from Journal Evidence (Multi-Quote & Journal Filter Support) */}
      {(() => {
        const mappings = nodeData.nodeMappings || [];
        const rawQuotes: Array<{ quote: string; page: number; journalId?: string; journalTitle?: string }> = [];

        if (mappings.length > 0) {
          mappings.forEach((m: any) => {
            if (m.quote && !rawQuotes.some((q) => q.quote === m.quote)) {
              rawQuotes.push({
                quote: m.quote,
                page: m.sourcePage || 1,
                journalId: m.journalId || m.journal?.id,
                journalTitle: m.journal?.title,
              });
            }
          });
        }

        // Fallback to single quote if mappings empty
        if (rawQuotes.length === 0 && (nodeData.quote || nodeData.evidenceQuote)) {
          rawQuotes.push({
            quote: nodeData.quote || nodeData.evidenceQuote || "",
            page: nodeData.pageNumber || 1,
            journalId: nodeData.journalId,
          });
        }

        // Filtering by selected journal if filterJournalId is active
        const isFilterActive = Boolean(nodeData.filterJournalId);
        const filteredQuotes = isFilterActive
          ? rawQuotes.filter((q) => !q.journalId || q.journalId === nodeData.filterJournalId)
          : rawQuotes;

        if (rawQuotes.length === 0) return null;

        if (isFilterActive && filteredQuotes.length === 0) {
          return (
            <div
              style={{
                margin: "6px 0 8px",
                padding: "6px 8px",
                borderRadius: 6,
                background: "#f8fafc",
                border: "1px dashed #cbd5e1",
                fontSize: 10.5,
                color: "#94a3b8",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <HelpCircle size={12} color="#94a3b8" />
              <span>Tidak ada kutipan langsung pada artikel ini</span>
            </div>
          );
        }

function QuoteCardItem({
  qItem,
  isFilterActive,
  onOpenQuote,
}: {
  qItem: { quote: string; page: number; journalId?: string; journalTitle?: string };
  isFilterActive: boolean;
  onOpenQuote?: (journalId: string, page: number, quote: string) => void;
}) {
  const isEn = isEnglishText(qItem.quote);
  const [showTranslated, setShowTranslated] = useState(false);
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showTranslated) {
      setShowTranslated(false);
      return;
    }
    if (translatedText) {
      setShowTranslated(true);
      return;
    }
    setIsTranslating(true);
    try {
      const res = await translateEnglishToIndonesian(qItem.quote);
      setTranslatedText(res);
      setShowTranslated(true);
    } catch {
      // fallback
    } finally {
      setIsTranslating(false);
    }
  };

  const displayText = showTranslated && translatedText ? translatedText : qItem.quote;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        if (onOpenQuote) {
          onOpenQuote(qItem.journalId || "", qItem.page, qItem.quote);
        }
      }}
      style={{
        background: isFilterActive ? "#eff6ff" : "#f0fdf4",
        border: `1px solid ${isFilterActive ? "#bfdbfe" : "#bbf7d0"}`,
        borderLeft: `3.5px solid ${isFilterActive ? "#3b82f6" : "#00C988"}`,
        padding: "6px 9px",
        borderRadius: "0 8px 8px 0",
        fontSize: 11,
        color: isFilterActive ? "#1e40af" : "#166534",
        lineHeight: 1.35,
        cursor: "pointer",
        transition: "all 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = isFilterActive ? "#dbeafe" : "#dcfce7";
        e.currentTarget.style.transform = "translateX(2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = isFilterActive ? "#eff6ff" : "#f0fdf4";
        e.currentTarget.style.transform = "translateX(0)";
      }}
      title="🔍 Klik untuk Buka di Jurnal Asli (Split Screen)"
    >
      <div
        style={{
          fontStyle: "italic",
          fontWeight: 500,
          fontSize: 11,
          lineHeight: 1.45,
          color: isFilterActive ? "#1e40af" : "#166534",
          wordBreak: "break-word",
        }}
      >
        "{displayText}"
        {showTranslated && (
          <span
            style={{
              marginLeft: 5,
              fontSize: 9,
              fontStyle: "normal",
              fontWeight: 700,
              background: "#dcfce7",
              color: "#166534",
              padding: "1px 5px",
              borderRadius: 4,
              border: "1px solid #86efac",
            }}
          >
            🇮🇩 ID
          </span>
        )}
      </div>

      <div
        style={{
          fontSize: 9.5,
          color: isFilterActive ? "#2563eb" : "#059669",
          fontWeight: 700,
          marginTop: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 6,
        }}
      >
        <span>📄 Hal. {qItem.page}</span>

        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          {/* Fitur Icon Translate untuk teks berbahasa Inggris */}
          {isEn && (
            <button
              type="button"
              onClick={handleTranslate}
              title={showTranslated ? "Tampilkan Naskah Asli (EN)" : "Terjemahkan ke Bahasa Indonesia (Non-AI / Library)"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
                background: showTranslated ? "#dcfce7" : "#ffffff",
                border: `1px solid ${showTranslated ? "#86efac" : "#bbf7d0"}`,
                borderRadius: 4,
                padding: "2px 5px",
                fontSize: 9,
                fontWeight: 700,
                color: showTranslated ? "#15803d" : "#059669",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {isTranslating ? (
                <RefreshCw size={9} className="animate-spin" />
              ) : (
                <Languages size={10} />
              )}
              <span>{showTranslated ? "Asli (EN)" : "Translate"}</span>
            </button>
          )}

          <span style={{ fontSize: 9, opacity: 0.85 }}>Buka Split ↗</span>
        </div>
      </div>
    </div>
  );
}

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, margin: "6px 0 8px", maxHeight: 380, overflowY: "auto" }}>
            {filteredQuotes.map((qItem, qIdx) => (
              <QuoteCardItem
                key={qIdx}
                qItem={qItem}
                isFilterActive={isFilterActive}
                onOpenQuote={nodeData.onOpenQuote}
              />
            ))}
          </div>
        );
      })()}

      {/* Footer Info / Evidence count */}
      <div
        style={{
          borderTop: "1px solid #f1f5f9",
          paddingTop: 6,
          marginTop: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 11,
          color: "#94a3b8",
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <BookOpen size={12} color="#00C988" />
          <strong style={{ color: "#334155" }}>
            {nodeData.supportingCount || (nodeData.nodeMappings?.length) || 0}
          </strong>{" "}
          Bukti Jurnal
        </span>

        <span
          onClick={(e) => {
            e.stopPropagation();
            if (nodeData.onOpenDetail) nodeData.onOpenDetail();
          }}
          style={{ fontSize: 10, fontWeight: 700, color: "#059669", cursor: "pointer" }}
        >
          Detail →
        </span>
      </div>

      {/* ── TITIK TIGA (THREE-DOTS) MENU BUTTON & DROPDOWN: POJOK KANAN ATAS ── */}
      <div style={{ position: "absolute", top: 8, right: 8, zIndex: 30 }}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu((prev) => !prev);
          }}
          style={{
            background: showMenu ? "#f1f5f9" : "transparent",
            border: "none",
            borderRadius: 6,
            width: 26,
            height: 26,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: showMenu ? "#0f172a" : "#94a3b8",
            cursor: "pointer",
            padding: 0,
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#f1f5f9";
            e.currentTarget.style.color = "#0f172a";
          }}
          onMouseLeave={(e) => {
            if (!showMenu) {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#94a3b8";
            }
          }}
          title="Menu Opsi Node"
        >
          <MoreVertical size={16} />
        </button>

        {showMenu && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              top: 30,
              right: 0,
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
              padding: "4px",
              minWidth: 190,
              zIndex: 50,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <button
              type="button"
              onClick={() => {
                setShowMenu(false);
                if (nodeData.onOpenDetail) nodeData.onOpenDetail();
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                width: "100%",
                padding: "6px 10px",
                borderRadius: 6,
                border: "none",
                background: "transparent",
                fontSize: 11.5,
                fontWeight: 600,
                color: "#1e293b",
                cursor: "pointer",
                textAlign: "left",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <FileText size={13} color="#059669" />
              <span>Detail & Edit Node</span>
            </button>

            {Boolean(nodeData.supportingCount || nodeData.nodeMappings?.length) && (
              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  if (nodeData.onClearEvidence) {
                    nodeData.onClearEvidence();
                  } else if (nodeData.onOpenDetail) {
                    nodeData.onOpenDetail();
                  }
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  width: "100%",
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: "none",
                  background: "transparent",
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: "#d97706",
                  cursor: "pointer",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#fffbeb")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <BookOpen size={13} color="#d97706" />
                <span>Hapus Sebaran Jurnal</span>
              </button>
            )}

            <div style={{ height: 1, background: "#f1f5f9", margin: "2px 0" }} />

            <button
              type="button"
              onClick={() => {
                setShowMenu(false);
                if (nodeData.onDeleteNode) {
                  nodeData.onDeleteNode();
                } else if (nodeData.onOpenDetail) {
                  nodeData.onOpenDetail();
                }
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                width: "100%",
                padding: "6px 10px",
                borderRadius: 6,
                border: "none",
                background: "transparent",
                fontSize: 11.5,
                fontWeight: 600,
                color: "#be123c",
                cursor: "pointer",
                textAlign: "left",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#fff1f2")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <Trash2 size={13} color="#be123c" />
              <span>Hapus Node</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

FrameworkNodeComponent.displayName = "FrameworkNodeComponent";
