"use client";

import { memo, useState } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react";
import { Trash2 } from "lucide-react";

export interface CustomEdgeData {
  onDeleteEdge?: (edgeId: string, label?: string) => void;
  isDimmed?: boolean;
  isFocused?: boolean;
  [key: string]: any;
}

export const CustomFrameworkEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  data,
}: EdgeProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const edgeData = (data || {}) as CustomEdgeData;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const isDimmed = Boolean(edgeData.isDimmed);
  const isFocused = Boolean(edgeData.isFocused);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (edgeData.onDeleteEdge) {
      edgeData.onDeleteEdge(id, typeof label === "string" ? label : undefined);
    }
  };

  return (
    <>
      {/* 1. Base Visible Edge Line */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: isDimmed
            ? "#cbd5e1"
            : isFocused || isHovered
            ? "#00C988"
            : "#00C988",
          strokeWidth: isFocused ? 3 : isHovered ? 2.8 : 2,
          opacity: isDimmed ? (isHovered ? 0.6 : 0.2) : 1,
          strokeDasharray: isDimmed ? "4 4" : undefined,
          transition: "stroke 0.2s ease, stroke-width 0.2s ease, opacity 0.2s ease",
        }}
      />

      {/* 2. Invisible Wider Path for Easy Mouse Hover Detection */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={24}
        className="react-flow__edge-interaction"
        style={{ cursor: "pointer" }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />

      {/* 3. Center Label & Hover Delete Button in EdgeLabelRenderer */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
            zIndex: isHovered || isFocused ? 100 : 10,
            display: "flex",
            alignItems: "center",
            gap: 4,
            transition: "all 0.15s ease",
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Label Badge */}
          {label && (
            <div
              style={{
                background: isDimmed ? "#f8fafc" : "#ffffff",
                border: `1px solid ${isDimmed ? "#e2e8f0" : isFocused || isHovered ? "#00C988" : "#cbd5e1"}`,
                boxShadow: isFocused || isHovered
                  ? "0 4px 12px -2px rgba(0, 201, 136, 0.25)"
                  : "0 1px 3px rgba(0,0,0,0.06)",
                padding: "3px 8px",
                borderRadius: 6,
                fontSize: 10.5,
                fontWeight: 600,
                color: isDimmed ? "#94a3b8" : isFocused || isHovered ? "#065f46" : "#1e293b",
                opacity: isDimmed ? (isHovered ? 0.8 : 0.25) : 1,
                whiteSpace: "nowrap",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {label}
            </div>
          )}

          {/* 🔴 Tombol Hapus Merah: Muncul saat Hover atau Focused */}
          {(isHovered || isFocused) && (
            <button
              type="button"
              onClick={handleDelete}
              title="Hapus Relasi Ini"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "#fee2e2",
                border: "1.5px solid #ef4444",
                color: "#dc2626",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(239, 68, 68, 0.35)",
                padding: 0,
                transition: "all 0.15s ease",
                transform: "scale(1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#ef4444";
                e.currentTarget.style.color = "#ffffff";
                e.currentTarget.style.transform = "scale(1.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#fee2e2";
                e.currentTarget.style.color = "#dc2626";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <Trash2 size={11} />
            </button>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
});

CustomFrameworkEdge.displayName = "CustomFrameworkEdge";
