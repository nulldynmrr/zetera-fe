"use client";

import React, { useState, useMemo } from "react";
import {
  Cpu,
  Zap,
  ShieldCheck,
  Search,
  MoreVertical,
  Plus,
  Trash2,
  RefreshCw,
  Check,
  RotateCw,
  Table as TableIcon,
  LayoutGrid,
  ArrowRightLeft,
  Sliders,
  Sparkles,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

export interface FeatureRoutingData {
  id: string;
  code: string;
  label: string;
  description?: string;
  baseCreditCost: number;
  isActive: boolean;
  routing?: {
    id?: string;
    featureId?: string;
    primaryModelId?: string;
    fallbackModelId?: string | null;
    primaryModel?: any;
    fallbackModel?: any;
  } | null;
}

export interface AiModelOption {
  id: string;
  routerLabel: string;
  modelName: string;
  isFreeTier: boolean;
  rpmLimit?: number;
  priceInputPer1M?: number;
  priceOutputPer1M?: number;
  keyPoolCount?: number;
  apiKeyMasked?: string;
  isActive?: boolean;
}

interface FeatureRoutingCanvasProps {
  features: FeatureRoutingData[];
  aiModels: AiModelOption[];
  onUpdateRouting: (
    featureId: string,
    primaryModelId: string,
    fallbackModelId: string | null,
    baseCreditCost: number
  ) => Promise<void>;
  onTestModel?: (model: any) => Promise<void>;
  isTestingModelId?: string | null;
  testStatusMap?: Record<string, { ok: boolean; msg: string }>;
}

export default function FeatureRoutingCanvas({
  features,
  aiModels,
  onUpdateRouting,
  onTestModel,
  isTestingModelId,
  testStatusMap = {},
}: FeatureRoutingCanvasProps) {
  const [viewMode, setViewMode] = useState<"MODELS" | "TABLE">("MODELS");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSubTab, setActiveSubTab] = useState<Record<string, "PRIMARY" | "FALLBACK">>({});
  const [openFeatureMenuId, setOpenFeatureMenuId] = useState<string | null>(null);
  const [editingCreditId, setEditingCreditId] = useState<string | null>(null);
  const [tempCredit, setTempCredit] = useState<number>(0);
  const [isAddingFeatureModelId, setIsAddingFeatureModelId] = useState<string | null>(null);
  const [draggedFeatureId, setDraggedFeatureId] = useState<string | null>(null);
  const [dragOverModelId, setDragOverModelId] = useState<string | null>(null);

  // Filter features based on search
  const filteredFeatures = useMemo(() => {
    if (!searchQuery.trim()) return features;
    const q = searchQuery.toLowerCase();
    return features.filter(
      (f) =>
        f.label.toLowerCase().includes(q) ||
        f.code.toLowerCase().includes(q) ||
        (f.description && f.description.toLowerCase().includes(q))
    );
  }, [features, searchQuery]);

  // Group features by Model
  const modelFeatureMap = useMemo(() => {
    const map: Record<
      string,
      { primary: FeatureRoutingData[]; fallback: FeatureRoutingData[] }
    > = {};

    aiModels.forEach((m) => {
      map[m.id] = { primary: [], fallback: [] };
    });

    filteredFeatures.forEach((feat) => {
      const pId = feat.routing?.primaryModelId;
      const fId = feat.routing?.fallbackModelId;

      if (pId && map[pId]) {
        map[pId].primary.push(feat);
      }
      if (fId && map[fId]) {
        map[fId].fallback.push(feat);
      }
    });

    return map;
  }, [aiModels, filteredFeatures]);

  // Features missing Primary or Fallback
  const unassignedFeatures = useMemo(() => {
    const missingPrimary = features.filter((f) => !f.routing?.primaryModelId);
    const missingFallback = features.filter(
      (f) => f.routing?.primaryModelId && !f.routing?.fallbackModelId
    );
    return { missingPrimary, missingFallback };
  }, [features]);

  // Drag and Drop
  const handleDragStart = (e: React.DragEvent, featureId: string) => {
    e.dataTransfer.setData("text/plain", featureId);
    setDraggedFeatureId(featureId);
  };

  const handleDragOver = (e: React.DragEvent, modelId: string) => {
    e.preventDefault();
    if (dragOverModelId !== modelId) {
      setDragOverModelId(modelId);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetModelId: string) => {
    e.preventDefault();
    setDragOverModelId(null);
    const featureId = e.dataTransfer.getData("text/plain") || draggedFeatureId;
    setDraggedFeatureId(null);

    if (!featureId) return;

    const feature = features.find((f) => f.id === featureId);
    if (!feature) return;

    const currentFallback = feature.routing?.fallbackModelId || null;
    const newFallback = currentFallback === targetModelId ? null : currentFallback;

    await onUpdateRouting(featureId, targetModelId, newFallback, feature.baseCreditCost);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* ── Topbar (Clean, matching user reference image) ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          paddingBottom: 4,
        }}
      >
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#0F0F14" }}>
            Feature-to-Model Routing Matrix
          </h2>
          <p style={{ fontSize: 13, color: "#71717A", margin: "3px 0 0" }}>
            Tentukan model AI primer dan fallback per fitur riset skripsi (Dual-Tier Free & Paid)
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Search Box */}
          <div style={{ position: "relative", width: 220 }}>
            <Search
              size={14}
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94A3B8",
              }}
            />
            <input
              type="text"
              placeholder="Cari fitur skripsi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "6px 10px 6px 30px",
                borderRadius: 8,
                border: "1px solid #E4E4E9",
                fontSize: 12,
                background: "#FFFFFF",
                outline: "none",
                color: "#0F0F14",
              }}
            />
          </div>

          {/* View Mode Toggle */}
          <div
            style={{
              display: "flex",
              background: "#F4F4F5",
              padding: 3,
              borderRadius: 8,
              border: "1px solid #E4E4E9",
            }}
          >
            <button
              onClick={() => setViewMode("MODELS")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "5px 11px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                background: viewMode === "MODELS" ? "#FFFFFF" : "transparent",
                color: viewMode === "MODELS" ? "#0F0F14" : "#71717A",
                boxShadow: viewMode === "MODELS" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
              }}
            >
              <LayoutGrid size={13} />
              4 Model Hub
            </button>
            <button
              onClick={() => setViewMode("TABLE")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "5px 11px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                background: viewMode === "TABLE" ? "#FFFFFF" : "transparent",
                color: viewMode === "TABLE" ? "#0F0F14" : "#71717A",
                boxShadow: viewMode === "TABLE" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
              }}
            >
              <TableIcon size={13} />
              Tabel Matriks
            </button>
          </div>
        </div>
      </div>

      {/* ── View 1: 4 Model Hubs (Model-Centric Architecture) ── */}
      {viewMode === "MODELS" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 16,
              alignItems: "start",
            }}
          >
            {aiModels.map((model) => {
              const data = modelFeatureMap[model.id] || { primary: [], fallback: [] };
              const isGroq = model.routerLabel.toLowerCase().includes("groq");
              const keyPoolCount = model.keyPoolCount || 1;
              const currentTab = activeSubTab[model.id] || "PRIMARY";
              const isDragOver = dragOverModelId === model.id;

              return (
                <div
                  key={model.id}
                  onDragOver={(e) => handleDragOver(e, model.id)}
                  onDragLeave={() => setDragOverModelId(null)}
                  onDrop={(e) => handleDrop(e, model.id)}
                  style={{
                    background: isDragOver ? "#F0FDF4" : "#FFFFFF",
                    border: isDragOver
                      ? "2px dashed #10B981"
                      : model.isFreeTier
                        ? "1px solid #DCFCE7"
                        : "1px solid #E4E4E9",
                    borderRadius: 14,
                    padding: "16px",
                    boxShadow: isDragOver
                      ? "0 0 0 3px rgba(16,185,129,0.15)"
                      : "0 2px 8px rgba(0,0,0,0.03)",
                    transition: "all 0.15s ease",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  {/* ── Model Header ── */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: model.isFreeTier ? "#DCFCE7" : "#EEF2FF",
                          color: model.isFreeTier ? "#16A34A" : "#4F46E5",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Cpu size={16} />
                      </div>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0F0F14", lineHeight: 1.2 }}>
                          {model.routerLabel}
                        </div>
                        <div style={{ fontSize: 11, fontFamily: "monospace", color: "#64748B" }}>
                          {model.modelName}
                        </div>
                      </div>
                    </div>

                    {/* Test Ping Button */}
                    {onTestModel && (
                      <button
                        onClick={() => onTestModel(model)}
                        disabled={isTestingModelId === model.id}
                        title="Uji koneksi API"
                        style={{
                          border: "1px solid #E2E8F0",
                          background: "#F8FAFC",
                          borderRadius: 6,
                          padding: "4px 8px",
                          fontSize: 11,
                          color: "#475569",
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <RefreshCw
                          size={11}
                          className={isTestingModelId === model.id ? "animate-spin" : ""}
                        />
                        {isTestingModelId === model.id ? "..." : "Ping"}
                      </button>
                    )}
                  </div>

                  {/* Model Badges */}
                  <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                    {model.isFreeTier ? (
                      <span
                        style={{
                          background: "#DCFCE7",
                          color: "#16A34A",
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "2px 7px",
                          borderRadius: 4,
                        }}
                      >
                        FREE $0
                      </span>
                    ) : (
                      <span
                        style={{
                          background: "#EEF2FF",
                          color: "#4F46E5",
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "2px 7px",
                          borderRadius: 4,
                        }}
                      >
                        PAID (${model.priceInputPer1M || 0.2}/1M)
                      </span>
                    )}

                    <span
                      style={{
                        background: "#F1F5F9",
                        color: "#475569",
                        fontSize: 10,
                        fontWeight: 600,
                        padding: "2px 7px",
                        borderRadius: 4,
                      }}
                    >
                      RPM: {model.rpmLimit || 60}
                    </span>

                    {isGroq && keyPoolCount > 1 && (
                      <span
                        title={`${keyPoolCount} Groq API Keys aktif (Auto Round-Robin & 429 Failover)`}
                        style={{
                          background: "#FEF3C7",
                          color: "#92400E",
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "2px 7px",
                          borderRadius: 4,
                          display: "flex",
                          alignItems: "center",
                          gap: 3,
                        }}
                      >
                        <RotateCw size={9} />
                        Pool: {keyPoolCount} Keys
                      </span>
                    )}
                  </div>

                  {/* ── Segmented Tab: Primer vs Cadangan ── */}
                  <div
                    style={{
                      display: "flex",
                      background: "#F4F4F5",
                      padding: 3,
                      borderRadius: 8,
                      border: "1px solid #E4E4E9",
                    }}
                  >
                    <button
                      onClick={() =>
                        setActiveSubTab((prev) => ({ ...prev, [model.id]: "PRIMARY" }))
                      }
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 5,
                        padding: "5px 8px",
                        borderRadius: 6,
                        fontSize: 11.5,
                        fontWeight: 600,
                        border: "none",
                        cursor: "pointer",
                        background: currentTab === "PRIMARY" ? "#FFFFFF" : "transparent",
                        color: currentTab === "PRIMARY" ? "#0F0F14" : "#71717A",
                        boxShadow: currentTab === "PRIMARY" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                      }}
                    >
                      <Zap size={12} color={currentTab === "PRIMARY" ? "#EAB308" : "#94A3B8"} />
                      Primer ({data.primary.length})
                    </button>
                    <button
                      onClick={() =>
                        setActiveSubTab((prev) => ({ ...prev, [model.id]: "FALLBACK" }))
                      }
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 5,
                        padding: "5px 8px",
                        borderRadius: 6,
                        fontSize: 11.5,
                        fontWeight: 600,
                        border: "none",
                        cursor: "pointer",
                        background: currentTab === "FALLBACK" ? "#FFFFFF" : "transparent",
                        color: currentTab === "FALLBACK" ? "#0F0F14" : "#71717A",
                        boxShadow: currentTab === "FALLBACK" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                      }}
                    >
                      <ShieldCheck size={12} color={currentTab === "FALLBACK" ? "#16A34A" : "#94A3B8"} />
                      Cadangan ({data.fallback.length})
                    </button>
                  </div>

                  {/* ── Feature List for this Model ── */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 7, minHeight: 120 }}>
                    {(currentTab === "PRIMARY" ? data.primary : data.fallback).length === 0 ? (
                      <div
                        style={{
                          padding: "24px 10px",
                          textAlign: "center",
                          fontSize: 11.5,
                          color: "#94A3B8",
                          border: "1px dashed #E2E8F0",
                          borderRadius: 8,
                          background: "#F8FAFC",
                        }}
                      >
                        {currentTab === "PRIMARY"
                          ? "Belum ada fitur yang memakai model ini sebagai Primer"
                          : "Belum ada fitur yang memakai model ini sebagai Cadangan"}
                      </div>
                    ) : (
                      (currentTab === "PRIMARY" ? data.primary : data.fallback).map((feat) => {
                        const fallbackModelObj = feat.routing?.fallbackModelId
                          ? aiModels.find((m) => m.id === feat.routing?.fallbackModelId)
                          : null;
                        const primaryModelObj = feat.routing?.primaryModelId
                          ? aiModels.find((m) => m.id === feat.routing?.primaryModelId)
                          : null;

                        return (
                          <div
                            key={feat.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, feat.id)}
                            style={{
                              background: "#FFFFFF",
                              border: "1px solid #E2E8F0",
                              borderRadius: 8,
                              padding: "9px 11px",
                              boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                              cursor: "grab",
                              display: "flex",
                              flexDirection: "column",
                              gap: 5,
                              transition: "border-color 0.15s ease",
                            }}
                            onMouseEnter={(e) =>
                              ((e.currentTarget as HTMLElement).style.borderColor = "#94A3B8")
                            }
                            onMouseLeave={(e) =>
                              ((e.currentTarget as HTMLElement).style.borderColor = "#E2E8F0")
                            }
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                                justifyContent: "space-between",
                                gap: 6,
                              }}
                            >
                              <div>
                                <div
                                  style={{
                                    fontSize: 12.5,
                                    fontWeight: 600,
                                    color: "#0F0F14",
                                    lineHeight: 1.3,
                                  }}
                                >
                                  {feat.label}
                                </div>
                                <div
                                  style={{
                                    fontSize: 10,
                                    fontFamily: "monospace",
                                    color: "#64748B",
                                    marginTop: 1,
                                  }}
                                >
                                  {feat.code}
                                </div>
                              </div>

                              {/* Context Menu Button */}
                              <div style={{ position: "relative" }}>
                                <button
                                  onClick={() =>
                                    setOpenFeatureMenuId(
                                      openFeatureMenuId === feat.id ? null : feat.id
                                    )
                                  }
                                  style={{
                                    border: "none",
                                    background: "transparent",
                                    cursor: "pointer",
                                    padding: 2,
                                    color: "#94A3B8",
                                  }}
                                >
                                  <MoreVertical size={13} />
                                </button>

                                {/* Dropdown Menu */}
                                {openFeatureMenuId === feat.id && (
                                  <div
                                    style={{
                                      position: "absolute",
                                      right: 0,
                                      top: 22,
                                      zIndex: 50,
                                      width: 220,
                                      background: "#FFFFFF",
                                      border: "1px solid #E2E8F0",
                                      borderRadius: 8,
                                      boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
                                      padding: 6,
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: 3,
                                    }}
                                  >
                                    <div
                                      style={{
                                        fontSize: 10,
                                        fontWeight: 700,
                                        color: "#94A3B8",
                                        padding: "4px 8px",
                                        textTransform: "uppercase",
                                      }}
                                    >
                                      Ubah Model Primer
                                    </div>
                                    {aiModels.map((m) => (
                                      <button
                                        key={m.id}
                                        onClick={async () => {
                                          setOpenFeatureMenuId(null);
                                          const newFallback =
                                            feat.routing?.fallbackModelId === m.id
                                              ? null
                                              : feat.routing?.fallbackModelId || null;
                                          await onUpdateRouting(
                                            feat.id,
                                            m.id,
                                            newFallback,
                                            feat.baseCreditCost
                                          );
                                        }}
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "space-between",
                                          padding: "5px 8px",
                                          border: "none",
                                          borderRadius: 5,
                                          background:
                                            feat.routing?.primaryModelId === m.id
                                              ? "#F0FDF4"
                                              : "transparent",
                                          fontSize: 11.5,
                                          color: "#0F0F14",
                                          cursor: "pointer",
                                          textAlign: "left",
                                        }}
                                      >
                                        <span>{m.routerLabel}</span>
                                        {feat.routing?.primaryModelId === m.id && (
                                          <Check size={12} color="#16A34A" />
                                        )}
                                      </button>
                                    ))}

                                    <div
                                      style={{
                                        fontSize: 10,
                                        fontWeight: 700,
                                        color: "#94A3B8",
                                        padding: "6px 8px 2px",
                                        borderTop: "1px solid #F1F5F9",
                                        textTransform: "uppercase",
                                        marginTop: 3,
                                      }}
                                    >
                                      Ubah Model Cadangan
                                    </div>
                                    <button
                                      onClick={async () => {
                                        setOpenFeatureMenuId(null);
                                        await onUpdateRouting(
                                          feat.id,
                                          feat.routing?.primaryModelId || model.id,
                                          null,
                                          feat.baseCreditCost
                                        );
                                      }}
                                      style={{
                                        padding: "5px 8px",
                                        border: "none",
                                        borderRadius: 5,
                                        background: !feat.routing?.fallbackModelId
                                          ? "#F1F5F9"
                                          : "transparent",
                                        fontSize: 11.5,
                                        color: "#64748B",
                                        cursor: "pointer",
                                        textAlign: "left",
                                      }}
                                    >
                                      (Tanpa Cadangan)
                                    </button>
                                    {aiModels
                                      .filter((m) => m.id !== feat.routing?.primaryModelId)
                                      .map((m) => (
                                        <button
                                          key={m.id}
                                          onClick={async () => {
                                            setOpenFeatureMenuId(null);
                                            await onUpdateRouting(
                                              feat.id,
                                              feat.routing?.primaryModelId || model.id,
                                              m.id,
                                              feat.baseCreditCost
                                            );
                                          }}
                                          style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            padding: "5px 8px",
                                            border: "none",
                                            borderRadius: 5,
                                            background:
                                              feat.routing?.fallbackModelId === m.id
                                                ? "#F0FDF4"
                                                : "transparent",
                                            fontSize: 11.5,
                                            color: "#0F0F14",
                                            cursor: "pointer",
                                            textAlign: "left",
                                          }}
                                        >
                                          <span>{m.routerLabel}</span>
                                          {feat.routing?.fallbackModelId === m.id && (
                                            <Check size={12} color="#16A34A" />
                                          )}
                                        </button>
                                      ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Pills / Badges */}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                fontSize: 10.5,
                                color: "#64748B",
                                marginTop: 2,
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                <span
                                  style={{
                                    background: "#F1F5F9",
                                    padding: "1px 6px",
                                    borderRadius: 4,
                                    fontWeight: 600,
                                  }}
                                >
                                  {feat.baseCreditCost} Kredit
                                </span>

                                {currentTab === "PRIMARY" && fallbackModelObj && (
                                  <span
                                    style={{
                                      background: "#ECFDF5",
                                      color: "#059669",
                                      padding: "1px 6px",
                                      borderRadius: 4,
                                      fontWeight: 600,
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 3,
                                    }}
                                  >
                                    <ShieldCheck size={10} />
                                    Cad: {fallbackModelObj.routerLabel.split(" ")[0]}
                                  </span>
                                )}

                                {currentTab === "FALLBACK" && primaryModelObj && (
                                  <span
                                    style={{
                                      background: "#FEF3C7",
                                      color: "#92400E",
                                      padding: "1px 6px",
                                      borderRadius: 4,
                                      fontWeight: 600,
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 3,
                                    }}
                                  >
                                    <Zap size={10} />
                                    Primer: {primaryModelObj.routerLabel.split(" ")[0]}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* ── Quick Add Feature to this Model ── */}
                  <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: 8 }}>
                    {isAddingFeatureModelId === model.id ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <select
                          autoFocus
                          onChange={async (e) => {
                            const fId = e.target.value;
                            if (!fId) return;
                            setIsAddingFeatureModelId(null);
                            const feature = features.find((f) => f.id === fId);
                            if (!feature) return;

                            if (currentTab === "PRIMARY") {
                              const newFallback =
                                feature.routing?.fallbackModelId === model.id
                                  ? null
                                  : feature.routing?.fallbackModelId || null;
                              await onUpdateRouting(
                                fId,
                                model.id,
                                newFallback,
                                feature.baseCreditCost
                              );
                            } else {
                              // Add as fallback
                              if (feature.routing?.primaryModelId === model.id) {
                                alert("Model cadangan tidak boleh sama dengan model primer.");
                                return;
                              }
                              await onUpdateRouting(
                                fId,
                                feature.routing?.primaryModelId || aiModels[0].id,
                                model.id,
                                feature.baseCreditCost
                              );
                            }
                          }}
                          style={{
                            width: "100%",
                            padding: "6px 8px",
                            borderRadius: 6,
                            border: "1px solid #E2E8F0",
                            fontSize: 12,
                            background: "#FFFFFF",
                            outline: "none",
                          }}
                        >
                          <option value="">Pilih fitur untuk dihubungkan...</option>
                          {features
                            .filter((f) =>
                              currentTab === "PRIMARY"
                                ? f.routing?.primaryModelId !== model.id
                                : f.routing?.fallbackModelId !== model.id
                            )
                            .map((f) => (
                              <option key={f.id} value={f.id}>
                                {f.label} ({f.code})
                              </option>
                            ))}
                        </select>
                        <button
                          onClick={() => setIsAddingFeatureModelId(null)}
                          style={{
                            border: "none",
                            background: "transparent",
                            fontSize: 11,
                            color: "#94A3B8",
                            cursor: "pointer",
                            alignSelf: "flex-end",
                          }}
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsAddingFeatureModelId(model.id)}
                        style={{
                          width: "100%",
                          padding: "6px",
                          borderRadius: 6,
                          border: "1px dashed #CBD5E1",
                          background: "transparent",
                          fontSize: 11.5,
                          fontWeight: 600,
                          color: "#64748B",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 5,
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor = "#94A3B8";
                          (e.currentTarget as HTMLElement).style.color = "#0F0F14";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor = "#CBD5E1";
                          (e.currentTarget as HTMLElement).style.color = "#64748B";
                        }}
                      >
                        <Plus size={13} />
                        Hubungkan Fitur ke {currentTab === "PRIMARY" ? "Primer" : "Cadangan"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Section Bawah: Deteksi Fitur yang Belum Ada Cadangan atau Belum Terhubung ── */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E4E4E9",
              borderRadius: 14,
              padding: "16px 20px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background:
                      unassignedFeatures.missingFallback.length > 0 ||
                        unassignedFeatures.missingPrimary.length > 0
                        ? "#FEF3C7"
                        : "#F0FDF4",
                    color:
                      unassignedFeatures.missingFallback.length > 0 ||
                        unassignedFeatures.missingPrimary.length > 0
                        ? "#B45309"
                        : "#16A34A",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {unassignedFeatures.missingFallback.length > 0 ||
                    unassignedFeatures.missingPrimary.length > 0 ? (
                    <ShieldAlert size={17} />
                  ) : (
                    <CheckCircle2 size={17} />
                  )}
                </div>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: "#0F0F14" }}>
                    Status Kesiapan & Deteksi Cadangan (Fallback)
                  </h3>
                  <p style={{ fontSize: 12, color: "#71717A", margin: "2px 0 0" }}>
                    Deteksi otomatis fitur riset yang belum memiliki model cadangan atau belum dikaitkan ke API primer
                  </p>
                </div>
              </div>

              {/* Summary Badges */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {unassignedFeatures.missingPrimary.length > 0 ? (
                  <span
                    style={{
                      background: "#FEE2E2",
                      color: "#B91C1C",
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "3px 9px",
                      borderRadius: 9999,
                    }}
                  >
                    ⚠️ {unassignedFeatures.missingPrimary.length} Tanpa Primer
                  </span>
                ) : (
                  <span
                    style={{
                      background: "#DCFCE7",
                      color: "#16A34A",
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "3px 9px",
                      borderRadius: 9999,
                    }}
                  >
                    ✓ 100% Fitur Punya Primer
                  </span>
                )}

                {unassignedFeatures.missingFallback.length > 0 ? (
                  <span
                    style={{
                      background: "#FEF3C7",
                      color: "#92400E",
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "3px 9px",
                      borderRadius: 9999,
                    }}
                  >
                    {unassignedFeatures.missingFallback.length} Belum Ada Cadangan
                  </span>
                ) : (
                  <span
                    style={{
                      background: "#DCFCE7",
                      color: "#16A34A",
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "3px 9px",
                      borderRadius: 9999,
                    }}
                  >
                    ✓ 100% Fitur Terlindungi Cadangan
                  </span>
                )}
              </div>
            </div>

            {/* If there are features missing fallback */}
            {unassignedFeatures.missingFallback.length > 0 && (
              <div
                style={{
                  background: "#FFFBEB",
                  border: "1px solid #FDE68A",
                  borderRadius: 10,
                  padding: "12px 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div style={{ fontSize: 12, color: "#92400E", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                  <span>Daftar {unassignedFeatures.missingFallback.length} Fitur Tanpa Cadangan (Pilih model cadangan untuk memproteksi fitur):</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
                  {unassignedFeatures.missingFallback.map((feat) => {
                    const primaryModelObj = aiModels.find((m) => m.id === feat.routing?.primaryModelId);
                    return (
                      <div
                        key={feat.id}
                        style={{
                          background: "#FFFFFF",
                          border: "1px solid #FCD34D",
                          borderRadius: 8,
                          padding: "10px 12px",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 6 }}>
                          <div>
                            <div style={{ fontSize: 12.5, fontWeight: 700, color: "#0F0F14", lineHeight: 1.2 }}>
                              {feat.label}
                            </div>
                            <div style={{ fontSize: 10.5, fontFamily: "monospace", color: "#64748B" }}>
                              {feat.code}
                            </div>
                          </div>
                          <span
                            style={{
                              background: "#FEF3C7",
                              color: "#92400E",
                              fontSize: 9.5,
                              fontWeight: 700,
                              padding: "2px 6px",
                              borderRadius: 4,
                              whiteSpace: "nowrap",
                            }}
                          >
                            Tanpa Backup
                          </span>
                        </div>

                        <div style={{ fontSize: 11, color: "#71717A", display: "flex", alignItems: "center", gap: 4 }}>
                          <span>Model Primer:</span>
                          <strong style={{ color: "#0F0F14" }}>{primaryModelObj?.routerLabel || "None"}</strong>
                        </div>

                        {/* Dropdown to assign Cadangan instantly */}
                        <select
                          value=""
                          onChange={async (e) => {
                            const fallbackId = e.target.value;
                            if (!fallbackId) return;
                            await onUpdateRouting(
                              feat.id,
                              feat.routing?.primaryModelId || aiModels[0].id,
                              fallbackId,
                              feat.baseCreditCost
                            );
                          }}
                          style={{
                            width: "100%",
                            padding: "5px 8px",
                            borderRadius: 6,
                            border: "1px solid #CBD5E1",
                            fontSize: 11.5,
                            background: "#F8FAFC",
                            color: "#0F0F14",
                            cursor: "pointer",
                            outline: "none",
                          }}
                        >
                          <option value="">+ Pasang Model Cadangan...</option>
                          {aiModels
                            .filter((m) => m.id !== feat.routing?.primaryModelId)
                            .map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.routerLabel} ({m.isFreeTier ? "FREE" : "PAID"})
                              </option>
                            ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* If there are features missing Primary (if any) */}
            {unassignedFeatures.missingPrimary.length > 0 && (
              <div
                style={{
                  background: "#FEF2F2",
                  border: "1px solid #FECACA",
                  borderRadius: 10,
                  padding: "12px 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div style={{ fontSize: 12, color: "#991B1B", fontWeight: 600 }}>
                  ⚠️ Fitur Belum Terhubung ke Model Primer (Fitur tidak dapat dijalankan):
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
                  {unassignedFeatures.missingPrimary.map((feat) => (
                    <div
                      key={feat.id}
                      style={{
                        background: "#FFFFFF",
                        border: "1px solid #FCA5A5",
                        borderRadius: 8,
                        padding: "10px 12px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: "#0F0F14" }}>
                          {feat.label}
                        </div>
                        <div style={{ fontSize: 10.5, fontFamily: "monospace", color: "#64748B" }}>
                          {feat.code}
                        </div>
                      </div>
                      <select
                        value=""
                        onChange={async (e) => {
                          const primaryId = e.target.value;
                          if (!primaryId) return;
                          await onUpdateRouting(feat.id, primaryId, null, feat.baseCreditCost);
                        }}
                        style={{
                          width: "100%",
                          padding: "5px 8px",
                          borderRadius: 6,
                          border: "1px solid #CBD5E1",
                          fontSize: 11.5,
                          background: "#F8FAFC",
                          color: "#0F0F14",
                          cursor: "pointer",
                          outline: "none",
                        }}
                      >
                        <option value="">+ Hubungkan ke Model Primer...</option>
                        {aiModels.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.routerLabel}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── View 2: Compact Matrix Table ── */}
      {viewMode === "TABLE" && (
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E4E4E9",
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0", color: "#475569", fontWeight: 600 }}>
                  <th style={{ padding: "12px 18px" }}>Fitur Riset Skripsi</th>
                  <th style={{ padding: "12px 14px" }}>Kode Sistem</th>
                  <th style={{ padding: "12px 14px" }}>Primary Model</th>
                  <th style={{ padding: "12px 14px" }}>Cadangan (Fallback) Model</th>
                  <th style={{ padding: "12px 14px" }}>Flat Credit</th>
                  <th style={{ padding: "12px 18px" }}>Tier</th>
                </tr>
              </thead>
              <tbody>
                {filteredFeatures.map((feat) => {
                  const currentPrimary = feat.routing?.primaryModelId || "";
                  const currentFallback = feat.routing?.fallbackModelId || "";
                  const primaryObj = aiModels.find((m) => m.id === currentPrimary);

                  return (
                    <tr key={feat.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                      <td style={{ padding: "12px 18px", fontWeight: 600, color: "#0F0F14" }}>
                        {feat.label}
                        <div style={{ fontSize: 11, fontWeight: 400, color: "#71717A" }}>
                          {feat.description}
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px", fontFamily: "monospace", fontSize: 11.5, color: "#64748B" }}>
                        {feat.code}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <select
                          value={currentPrimary}
                          onChange={(e) =>
                            onUpdateRouting(feat.id, e.target.value, currentFallback || null, feat.baseCreditCost)
                          }
                          style={{
                            background: "#F8FAFC",
                            border: "1px solid #E2E8F0",
                            borderRadius: 6,
                            padding: "5px 8px",
                            fontSize: 12,
                            color: "#0F0F14",
                            outline: "none",
                            cursor: "pointer",
                          }}
                        >
                          {aiModels.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.routerLabel} ({m.modelName}) {m.isFreeTier ? "[FREE]" : ""}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <select
                          value={currentFallback || ""}
                          onChange={(e) =>
                            onUpdateRouting(feat.id, currentPrimary, e.target.value || null, feat.baseCreditCost)
                          }
                          style={{
                            background: "#F8FAFC",
                            border: "1px solid #E2E8F0",
                            borderRadius: 6,
                            padding: "5px 8px",
                            fontSize: 12,
                            color: currentFallback ? "#0F0F14" : "#94A3B8",
                            outline: "none",
                            cursor: "pointer",
                          }}
                        >
                          <option value="">(Tanpa Cadangan)</option>
                          {aiModels
                            .filter((m) => m.id !== currentPrimary)
                            .map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.routerLabel}
                              </option>
                            ))}
                        </select>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <input
                          type="number"
                          min={0}
                          defaultValue={feat.baseCreditCost}
                          onBlur={(e) =>
                            onUpdateRouting(
                              feat.id,
                              currentPrimary,
                              currentFallback || null,
                              Number(e.target.value) || 0
                            )
                          }
                          style={{
                            width: 55,
                            background: "#F8FAFC",
                            border: "1px solid #E2E8F0",
                            borderRadius: 6,
                            padding: "4px 6px",
                            fontSize: 12,
                            textAlign: "center",
                          }}
                        />
                      </td>
                      <td style={{ padding: "12px 18px" }}>
                        {primaryObj?.isFreeTier ? (
                          <span
                            style={{
                              background: "#DCFCE7",
                              color: "#16A34A",
                              fontSize: 11,
                              fontWeight: 600,
                              padding: "2px 8px",
                              borderRadius: 9999,
                            }}
                          >
                            FREE $0
                          </span>
                        ) : (
                          <span
                            style={{
                              background: "#EEF2FF",
                              color: "#4F46E5",
                              fontSize: 11,
                              fontWeight: 600,
                              padding: "2px 8px",
                              borderRadius: 9999,
                            }}
                          >
                            PAID
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
