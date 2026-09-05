"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  Connection,
  Edge,
  Node,
  Panel,
  MarkerType,
  applyNodeChanges,
  NodeChange,
  EdgeChange,
  applyEdgeChanges,
  PanOnScrollMode,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import {
  ArrowLeft,
  BookOpen,
  Plus,
  Network,
  Sparkles,
  Trash2,
  X,
  Layers,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  GitMerge,
  Gauge,
  FlaskConical,
  CheckCircle2,
  RefreshCw,
  Wand2,
  Undo2,
  Redo2,
  Lock,
  ChevronRight,
  ExternalLink,
  FileText,
  Quote,
  Eye,
  Download,
  Copy,
  Check,
  BookOpenCheck,
  FileCheck2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Languages,
} from "lucide-react";
import { toPng } from "html-to-image";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ProjectSidebar } from "@/components/ui/ProjectSidebar";
import { notify } from "@/lib/notification";
import { useRequireAuth } from "@/lib/auth-context";
import {
  api,
  getToken,
  type ResearchProject,
  type FrameworkNode,
  type NodeType,
  type NodeEvidenceStatus,
  type AiRelationRecommendation,
} from "@/lib/api-client";
import { isEnglishText, translateEnglishToIndonesian } from "@/lib/translate";
import { FrameworkNodeComponent, type CustomNodeData } from "./CustomNodes";
import { CustomFrameworkEdge } from "./CustomEdge";

const nodeTypes = {
  frameworkNode: FrameworkNodeComponent,
};

const edgeTypes = {
  frameworkEdge: CustomFrameworkEdge,
  default: CustomFrameworkEdge,
};

interface HistoryState {
  nodes: Node[];
  edges: Edge[];
}

function SidebarQuoteCardItem({
  mapping,
  onOpenSplitReader,
}: {
  mapping: any;
  onOpenSplitReader: (journalId: string, page: number, quote: string) => void;
}) {
  const isEn = isEnglishText(mapping.quote || "");
  const [showTranslated, setShowTranslated] = useState(false);
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async () => {
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
      const res = await translateEnglishToIndonesian(mapping.quote);
      setTranslatedText(res);
      setShowTranslated(true);
    } catch {
      // fallback
    } finally {
      setIsTranslating(false);
    }
  };

  const displayText = showTranslated && translatedText ? translatedText : mapping.quote;

  return (
    <div
      style={{
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: 8,
        padding: "10px 12px",
        fontSize: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 6, marginBottom: 6 }}>
        <span style={{ fontWeight: 700, color: "#0f172a", lineHeight: 1.3 }}>
          {mapping.journal?.title || "Artikel Jurnal Rujukan"}
        </span>
        <span style={{ fontSize: 10.5, background: "#e2e8f0", color: "#334155", fontWeight: 600, padding: "1px 6px", borderRadius: 4, whiteSpace: "nowrap" }}>
          Hal. {mapping.sourcePage || 1}
        </span>
      </div>

      {mapping.quote && (
        <blockquote
          style={{
            margin: "0 0 8px",
            padding: "6px 8px",
            background: "#ffffff",
            borderLeft: "3px solid #00C988",
            borderRadius: 4,
            color: "#334155",
            fontSize: 11.5,
            fontStyle: "italic",
            lineHeight: 1.5,
          }}
        >
          "{displayText}"
          {showTranslated && (
            <span
              style={{
                marginLeft: 6,
                fontSize: 9.5,
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
        </blockquote>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 6 }}>
        {isEn && (
          <button
            type="button"
            onClick={handleTranslate}
            title={showTranslated ? "Tampilkan Teks Asli (EN)" : "Terjemahkan ke Bahasa Indonesia (Non-AI / Library)"}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              background: showTranslated ? "#dcfce7" : "#ffffff",
              border: `1px solid ${showTranslated ? "#86efac" : "#cbd5e1"}`,
              borderRadius: 6,
              padding: "4px 8px",
              fontSize: 11,
              fontWeight: 700,
              color: showTranslated ? "#15803d" : "#475569",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            {isTranslating ? (
              <RefreshCw size={11} className="animate-spin" />
            ) : (
              <Languages size={12} />
            )}
            <span>{showTranslated ? "Teks Asli (EN)" : "Terjemahkan"}</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => onOpenSplitReader(mapping.journalId || mapping.journal?.id, mapping.sourcePage || 1, mapping.quote)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            background: "#ecfdf5",
            border: "1px solid #a7f3d0",
            borderRadius: 6,
            padding: "4px 8px",
            fontSize: 11,
            fontWeight: 700,
            color: "#059669",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          <Eye size={12} />
          <span>Buka Split Screen</span>
        </button>
      </div>
    </div>
  );
}

export default function FrameworkPage() {
  const params = useParams();
  const projectId = params?.id as string;

  const { user, isLoading } = useRequireAuth();

  const [project, setProject] = useState<ResearchProject | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // Auto-save status indicator ("saved" | "saving" | "idle")
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle">("saved");

  // Multi-Journal vs Single-Journal View Mode
  const [viewMode, setViewMode] = useState<"SYNTHESIS" | "SINGLE_JOURNAL">("SYNTHESIS");
  const [journalsList, setJournalsList] = useState<any[]>([]);
  const [selectedJournalId, setSelectedJournalId] = useState<string>("");
  const [generatingAi, setGeneratingAi] = useState(false);
  const [aiSummaryMsg, setAiSummaryMsg] = useState<string | null>(null);

  // React Flow state (Optimistic & Silent, NO blank flickering)
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // Interactive Graph Focus Highlight State (Click Node/Path -> Others Dim to Gray)
  const [focusedElement, setFocusedElement] = useState<{ type: "NODE" | "EDGE" | null; id: string | null }>({
    type: null,
    id: null,
  });

  const handleDeleteEdgeById = useCallback(
    async (edgeId: string, edgeLabel?: string) => {
      const confirmed = await notify.confirm({
        title: "Hapus Relasi",
        description: `Hapus relasi "${edgeLabel || "koneksi"}"?`,
        confirmLabel: "Hapus",
        cancelLabel: "Batal",
        isDestructive: true,
      });
      if (!confirmed) return;
      try {
        await api.framework.deleteEdge(projectId, edgeId);
        setEdges((eds) => {
          const nextEdges = eds.filter((e) => e.id !== edgeId);
          pushHistory(nodesRef.current, nextEdges);
          return nextEdges;
        });
        setFocusedElement({ type: null, id: null });
        setSaveStatus("saved");
        notify.success("Relasi berhasil dihapus");
      } catch (err: any) {
        console.error("Gagal menghapus edge:", err);
        notify.error("Gagal menghapus relasi: " + (err?.message || "Kesalahan server"));
      }
    },
    [projectId]
  );

  // Derived highlighted/dimmed nodes and edges for dynamic focus
  const { displayNodes, displayEdges } = useMemo(() => {
    if (!focusedElement.id) {
      return {
        displayNodes: nodes.map((n) => ({
          ...n,
          data: { ...n.data, isDimmed: false, isFocused: false },
        })),
        displayEdges: edges.map((e) => ({
          ...e,
          type: "frameworkEdge",
          animated: true,
          style: { stroke: "#00C988", strokeWidth: 2, opacity: 1 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#00C988" },
          labelStyle: { fill: "#0f172a", fontWeight: 600, fontSize: 11, opacity: 1 },
          labelBgStyle: { fill: "#ffffff", fillOpacity: 0.95 },
          data: {
            ...e.data,
            onDeleteEdge: handleDeleteEdgeById,
            isDimmed: false,
            isFocused: false,
          },
        })),
      };
    }

    const activeNodeIds = new Set<string>();
    const activeEdgeIds = new Set<string>();

    if (focusedElement.type === "NODE") {
      activeNodeIds.add(focusedElement.id);
      edges.forEach((e) => {
        if (e.source === focusedElement.id || e.target === focusedElement.id) {
          activeEdgeIds.add(e.id);
          activeNodeIds.add(e.source);
          activeNodeIds.add(e.target);
        }
      });
    } else if (focusedElement.type === "EDGE") {
      activeEdgeIds.add(focusedElement.id);
      const targetEdge = edges.find((e) => e.id === focusedElement.id);
      if (targetEdge) {
        activeNodeIds.add(targetEdge.source);
        activeNodeIds.add(targetEdge.target);
      }
    }

    const procNodes = nodes.map((n) => ({
      ...n,
      data: {
        ...n.data,
        isDimmed: !activeNodeIds.has(n.id),
        isFocused: n.id === focusedElement.id,
      },
    }));

    const procEdges = edges.map((e) => {
      const isActive = activeEdgeIds.has(e.id);
      const isCurrentFocused = focusedElement.type === "EDGE" && e.id === focusedElement.id;
      if (isActive) {
        return {
          ...e,
          type: "frameworkEdge",
          animated: true,
          style: { stroke: "#00C988", strokeWidth: 3, opacity: 1 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#00C988" },
          labelStyle: { fill: "#065f46", fontWeight: 700, fontSize: 11.5, opacity: 1 },
          labelBgStyle: { fill: "#ffffff", fillOpacity: 1 },
          data: {
            ...e.data,
            onDeleteEdge: handleDeleteEdgeById,
            isDimmed: false,
            isFocused: isCurrentFocused,
          },
        };
      } else {
        return {
          ...e,
          type: "frameworkEdge",
          animated: false,
          style: { stroke: "#cbd5e1", strokeWidth: 1.2, opacity: 0.18, strokeDasharray: "4 4" },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#e2e8f0" },
          labelStyle: { fill: "#94a3b8", fontWeight: 500, fontSize: 10, opacity: 0.2 },
          labelBgStyle: { fill: "#f8fafc", fillOpacity: 0.5 },
          data: {
            ...e.data,
            onDeleteEdge: handleDeleteEdgeById,
            isDimmed: true,
            isFocused: false,
          },
        };
      }
    });

    return { displayNodes: procNodes, displayEdges: procEdges };
  }, [nodes, edges, focusedElement, handleDeleteEdgeById]);

  // Ref to hold latest nodes for beforeunload / close auto-save
  const nodesRef = useRef<Node[]>([]);
  nodesRef.current = nodes;

  // ── UNDO / REDO HISTORY STACK ──
  const historyRef = useRef<HistoryState[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const updateUndoRedoAvailability = useCallback(() => {
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  }, []);

  const pushHistory = useCallback((newNodes: Node[], newEdges: Edge[]) => {
    const currentHist = historyRef.current.slice(0, historyIndexRef.current + 1);
    const nextState: HistoryState = {
      nodes: JSON.parse(JSON.stringify(newNodes)),
      edges: JSON.parse(JSON.stringify(newEdges)),
    };

    // Limit history to 30 actions
    if (currentHist.length > 30) {
      currentHist.shift();
    }

    historyRef.current = [...currentHist, nextState];
    historyIndexRef.current = historyRef.current.length - 1;
    updateUndoRedoAvailability();
  }, [updateUndoRedoAvailability]);

  // Selected node for sidebar editing
  const [selectedNode, setSelectedNode] = useState<FrameworkNode | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editType, setEditType] = useState<NodeType>("VARIABLE");
  const [editStatus, setEditStatus] = useState<NodeEvidenceStatus>("UNSUPPORTED");
  const [editDesc, setEditDesc] = useState("");
  const [updatingNode, setUpdatingNode] = useState(false);

  // Handle Open Node Details Sidebar (Explicitly opened via Three-Dots or Detail button)
  const handleOpenNodeDetail = useCallback(
    (nodeId: string, nodeData: any, position?: { x: number; y: number }) => {
      const found: any = {
        id: nodeId,
        projectId,
        label: nodeData.label,
        type: nodeData.type,
        status: nodeData.status,
        description: nodeData.description,
        positionX: position?.x ?? nodeData.positionX ?? 0,
        positionY: position?.y ?? nodeData.positionY ?? 0,
        data: nodeData,
        nodeMappings: nodeData.nodeMappings || [],
        createdAt: "",
        updatedAt: "",
      };
      setSelectedNode(found);
      setEditLabel(found.label);
      setEditType(found.type);
      setEditStatus(found.status);
      setEditDesc(found.description || "");
    },
    [projectId]
  );

  const handleDeleteNode = useCallback(
    async (targetNodeId?: string) => {
      const idToDelete = targetNodeId || selectedNode?.id;
      if (!idToDelete) return;
      const confirmed = await notify.confirm({
        title: "Hapus Node Kerangka",
        description: "Hapus node ini dari kanvas kerangka berpikir? Semua relasi yang terhubung juga akan dihapus.",
        confirmLabel: "Hapus",
        cancelLabel: "Batal",
        isDestructive: true,
      });
      if (!confirmed) return;
      try {
        await api.framework.deleteNode(projectId, idToDelete);
        setNodes((prev) => prev.filter((n) => n.id !== idToDelete));
        setEdges((prev) => prev.filter((e) => e.source !== idToDelete && e.target !== idToDelete));
        if (selectedNode?.id === idToDelete) {
          setSelectedNode(null);
        }
        notify.success("Node berhasil dihapus");
      } catch (err: any) {
        console.error("Gagal menghapus node:", err);
        notify.error("Gagal menghapus node: " + (err?.message || "Kesalahan server"));
      }
    },
    [projectId, selectedNode]
  );

  const handleClearNodeEvidence = useCallback(
    async (targetNodeId?: string) => {
      const idToClear = targetNodeId || selectedNode?.id;
      if (!idToClear) return;
      const confirmed = await notify.confirm({
        title: "Hapus Sebaran Bukti",
        description: "Hapus seluruh sebaran bukti jurnal pada node ini?",
        confirmLabel: "Hapus Bukti",
        cancelLabel: "Batal",
        isDestructive: true,
      });
      if (!confirmed) return;
      try {
        await api.framework.updateNode(projectId, idToClear, { status: "UNSUPPORTED" });
        setNodes((prev) =>
          prev.map((n) =>
            n.id === idToClear
              ? {
                ...n,
                data: {
                  ...n.data,
                  status: "UNSUPPORTED",
                  supportingCount: 0,
                  nodeMappings: [],
                  quote: "",
                },
              }
              : n
          )
        );
        if (selectedNode?.id === idToClear) {
          setSelectedNode((prev: any) =>
            prev
              ? {
                ...prev,
                status: "UNSUPPORTED",
                data: { ...prev.data, status: "UNSUPPORTED", nodeMappings: [] },
              }
              : null
          );
        }
        notify.success("Sebaran bukti berhasil dibersihkan");
      } catch (err: any) {
        console.error("Gagal menghapus sebaran jurnal:", err);
        notify.error("Gagal menghapus sebaran jurnal: " + (err?.message || "Kesalahan server"));
      }
    },
    [projectId, selectedNode]
  );

  // Add node modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNodeLabel, setNewNodeLabel] = useState("");
  const [newNodeType, setNewNodeType] = useState<NodeType>("VARIABLE");
  const [newNodeDesc, setNewNodeDesc] = useState("");
  const [creatingNode, setCreatingNode] = useState(false);

  // Quick Edge creation modal + AI Smart Recommendation
  const [pendingConnection, setPendingConnection] = useState<Connection | null>(null);
  const [relationLabel, setRelationLabel] = useState("Mempengaruhi Positif (+)");
  const [customRelation, setCustomRelation] = useState("");
  const [showEdgeModal, setShowEdgeModal] = useState(false);

  // AI Groq Recommendation State
  const [aiRecommendation, setAiRecommendation] = useState<AiRelationRecommendation | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Floating Guide State
  const [isGuideExpanded, setIsGuideExpanded] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsGuideExpanded(false);
    }, 30000);

    return () => clearTimeout(timer);
  }, []);

  // ── SILENT BACKGROUND AUTO-SAVE (Zero Blanking / Zero Flicker) ──
  const syncPositionsToDb = useCallback(
    async (currentNodes: Node[]) => {
      if (!projectId || currentNodes.length === 0) return;
      try {
        setSaveStatus("saving");
        const updates = currentNodes.map((n) => ({
          id: n.id,
          positionX: n.position.x,
          positionY: n.position.y,
        }));
        await api.framework.syncPositions(projectId, updates);
        setSaveStatus("saved");
      } catch (err) {
        console.error("Gagal auto-save posisi:", err);
        setSaveStatus("idle");
      }
    },
    [projectId]
  );

  // Synchronous Node Changes (100% fluid, no blanking)
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => {
        const next = applyNodeChanges(changes, nds);
        nodesRef.current = next;
        return next;
      });
    },
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    []
  );

  // Auto-save silently on node drag stop & record to history
  const onNodeDragStop = useCallback(
    (_event: any, node: Node) => {
      setNodes((currentNodes) => {
        const updated = currentNodes.map((n) =>
          n.id === node.id ? { ...n, position: node.position } : n
        );
        nodesRef.current = updated;
        pushHistory(updated, edges);
        syncPositionsToDb(updated);
        return updated;
      });
    },
    [syncPositionsToDb, edges, pushHistory]
  );

  // Auto-save on page exit/close
  useEffect(() => {
    const saveOnExit = () => {
      if (!projectId || nodesRef.current.length === 0) return;
      const updates = nodesRef.current.map((n) => ({
        id: n.id,
        positionX: n.position.x,
        positionY: n.position.y,
      }));

      const token = getToken();
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      fetch(`${baseUrl}/api/projects/${projectId}/framework/sync-positions`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ nodes: updates }),
        keepalive: true,
      });
    };

    window.addEventListener("beforeunload", saveOnExit);
    window.addEventListener("pagehide", saveOnExit);

    return () => {
      saveOnExit();
      window.removeEventListener("beforeunload", saveOnExit);
      window.removeEventListener("pagehide", saveOnExit);
    };
  }, [projectId]);

  // ── SPLIT SCREEN JOURNAL READER STATE ──
  const [splitReaderOpen, setSplitReaderOpen] = useState(false);
  const [splitJournal, setSplitJournal] = useState<any>(null);
  const [splitTargetPage, setSplitTargetPage] = useState<number>(1);
  const [splitTargetQuote, setSplitTargetQuote] = useState<string>("");
  const [splitLoading, setSplitLoading] = useState(false);
  const [splitViewTab, setSplitViewTab] = useState<"PDF" | "TEXT">("PDF");
  const journalsListRef = useRef<any[]>([]);
  const reactFlowInstanceRef = useRef<any>(null);

  // ── SKRIPSI DRAFT & EXPORT STATE ──
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [draftData, setDraftData] = useState<any>(null);
  const [generatingDraft, setGeneratingDraft] = useState(false);
  const [activeDraftTab, setActiveDraftTab] = useState<"ALL" | "BAB1" | "BAB2" | "BAB3">("ALL");
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [exportingPng, setExportingPng] = useState(false);

  const handleGenerateDraft = async () => {
    if (!projectId) return;
    try {
      setGeneratingDraft(true);
      setShowDraftModal(true);
      const res = await api.framework.generateDraft(projectId);
      if (res.success && res.data) {
        setDraftData(res.data);
        notify.success("Draf narasi skripsi berhasil disusun!");
      }
    } catch (err: any) {
      notify.error(err.message || "Gagal menyusun draf narasi skripsi");
    } finally {
      setGeneratingDraft(false);
    }
  };

  const handleExportPng = async () => {
    const viewportEl = document.querySelector(".react-flow__viewport") as HTMLElement;
    if (!viewportEl) {
      notify.warning("Kanvas diagram belum siap");
      return;
    }
    try {
      setExportingPng(true);
      const dataUrl = await toPng(viewportEl, {
        backgroundColor: "#ffffff",
        quality: 0.95,
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.download = `Kerangka-Pemikiran-${project?.title?.replace(/[^\w\s]/gi, "").slice(0, 30) || "Skripsi"}.png`;
      link.href = dataUrl;
      link.click();
      notify.success("Gambar diagram kerangka berhasil diunduh");
    } catch (err) {
      console.error("Gagal ekspor PNG:", err);
      notify.error("Gagal mengunduh gambar diagram");
    } finally {
      setExportingPng(false);
    }
  };

  const handleCopyDraftText = () => {
    if (!draftData) return;
    let fullText = `# ${draftData.judul || project?.title}\n\n`;

    if (draftData.bab1LatarBelakang) {
      fullText += `## ${draftData.bab1LatarBelakang.judulBagian}\n\n`;
      fullText += (draftData.bab1LatarBelakang.paragraf || []).join("\n\n") + "\n\n";
    }

    if (draftData.bab2KerangkaPemikiran) {
      fullText += `## ${draftData.bab2KerangkaPemikiran.judulBagian}\n\n`;
      fullText += (draftData.bab2KerangkaPemikiran.paragraf || []).join("\n\n") + "\n\n";
    }

    if (draftData.bab3HipotesisMetode) {
      fullText += `## ${draftData.bab3HipotesisMetode.judulBagian}\n\n`;
      if (draftData.bab3HipotesisMetode.hipotesis) {
        fullText += `### Rumusan Hipotesis:\n`;
        fullText += draftData.bab3HipotesisMetode.hipotesis.map((h: string) => `- ${h}`).join("\n") + "\n\n";
      }
      if (draftData.bab3HipotesisMetode.justifikasiMetode) {
        fullText += `### Pendekatan Metodologi:\n${draftData.bab3HipotesisMetode.justifikasiMetode}\n\n`;
      }
    }

    if (draftData.daftarPustakaRujukan && draftData.daftarPustakaRujukan.length > 0) {
      fullText += `## DAFTAR PUSTAKA\n\n`;
      fullText += draftData.daftarPustakaRujukan.map((dp: string) => `${dp}`).join("\n\n");
    }

    navigator.clipboard.writeText(fullText);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 3000);
  };

  // Auto-fit & auto-center canvas when split screen reader opens or closes
  useEffect(() => {
    if (reactFlowInstanceRef.current) {
      const timer = setTimeout(() => {
        reactFlowInstanceRef.current.fitView({ padding: 0.25, duration: 400 });
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [splitReaderOpen]);

  const handleOpenSplitReader = useCallback(
    async (journalId?: string, pageNumber: number = 1, quoteText: string = "") => {
      const list = journalsListRef.current;
      const targetJId = journalId || (list.length > 0 ? list[0].id : "");
      if (!targetJId || !projectId) return;

      setSplitTargetPage(pageNumber || 1);
      setSplitTargetQuote(quoteText || "");
      setSplitReaderOpen(true);

      try {
        setSplitLoading(true);
        const res = await api.journals.get(projectId, targetJId);
        setSplitJournal(res.data);
      } catch (err) {
        console.error("Gagal load detail jurnal untuk split reader:", err);
      } finally {
        setSplitLoading(false);
      }
    },
    [projectId]
  );

  // Auto-scroll inside Split Screen Reader to the targeted section / quote
  useEffect(() => {
    if (splitReaderOpen && splitJournal) {
      const timer = setTimeout(() => {
        // Find by matching page or quote
        let targetEl: HTMLElement | null = null;
        if (splitJournal?.rawExtraction?.sections) {
          const sIdx = splitJournal.rawExtraction.sections.findIndex(
            (s: any) => s.page === splitTargetPage || (splitTargetQuote && s.content?.toLowerCase().includes(splitTargetQuote.toLowerCase().slice(0, 30)))
          );
          if (sIdx !== -1) {
            targetEl = document.getElementById(`split-sec-${sIdx}`);
          }
        }
        if (!targetEl && splitTargetPage) {
          targetEl = document.getElementById(`split-sec-0`);
        }
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [splitReaderOpen, splitJournal, splitTargetPage, splitTargetQuote]);

  const [approvedJournalsCount, setApprovedJournalsCount] = useState<number>(0);

  // Initial Load Framework data from database (Only runs on initial page mount)
  const loadFramework = useCallback(async () => {
    if (!projectId) return;
    try {
      setInitialLoading(true);
      const [res, journalsRes] = await Promise.all([
        api.framework.get(projectId),
        api.journals.list(projectId),
      ]);
      setProject(res.data.project);

      const jList = journalsRes.data || [];
      journalsListRef.current = jList;
      const approvedCount = jList.filter((j) => j.status === "APPROVED").length;
      setApprovedJournalsCount(approvedCount);
      setJournalsList(jList);
      if (jList.length > 0 && !selectedJournalId) {
        setSelectedJournalId(jList[0].id);
      }

      const flowNodes: Node[] = res.data.nodes.map((n) => ({
        id: n.id,
        type: "frameworkNode",
        position: { x: n.positionX, y: n.positionY },
        data: {
          label: n.label,
          type: n.type,
          description: n.description || "",
          status: n.status,
          methodCoverage: n.methodCoverage || "",
          supportingCount: (n as any).nodeMappings?.length || 0,
          nodeMappings: (n as any).nodeMappings || [],
          quote: (n as any).nodeMappings?.[0]?.quote || (n as any).quote || (n as any).evidenceQuote || "",
          pageNumber: (n as any).nodeMappings?.[0]?.sourcePage || (n as any).pageNumber || 1,
          onOpenQuote: (jId: string, p: number, q: string) => handleOpenSplitReader(jId, p, q),
          onOpenDetail: () => handleOpenNodeDetail(n.id, n, { x: n.positionX, y: n.positionY }),
          onDeleteNode: () => handleDeleteNode(n.id),
          onClearEvidence: () => handleClearNodeEvidence(n.id),
        } as CustomNodeData,
      }));

      const flowEdges: Edge[] = res.data.edges.map((e) => ({
        id: e.id,
        source: e.sourceNodeId,
        target: e.targetNodeId,
        label: e.relationshipLabel || "",
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed, color: "#00C988" },
        style: { stroke: "#00C988", strokeWidth: 2 },
        labelStyle: { fill: "#0f172a", fontWeight: 600, fontSize: 11 },
        labelBgStyle: { fill: "#ffffff", fillOpacity: 0.95 },
        labelBgPadding: [4, 2] as [number, number],
        labelBgBorderRadius: 4,
      }));

      setNodes(flowNodes);
      nodesRef.current = flowNodes;
      setEdges(flowEdges);

      // Initial history point
      historyRef.current = [{
        nodes: JSON.parse(JSON.stringify(flowNodes)),
        edges: JSON.parse(JSON.stringify(flowEdges)),
      }];
      historyIndexRef.current = 0;
      updateUndoRedoAvailability();

      setSaveStatus("saved");
    } catch (err) {
      console.error("Gagal load framework:", err);
    } finally {
      setInitialLoading(false);
    }
  }, [projectId, updateUndoRedoAvailability, handleOpenSplitReader, handleDeleteNode, handleClearNodeEvidence]);

  // ── ROBOT-LIKE SEQUENTIAL SPAWNING ANIMATION ──
  const animateSpawn = useCallback((rawNodes: any[], rawEdges: any[]) => {
    const targetFlowNodes: Node[] = rawNodes.map((n) => ({
      id: n.id,
      type: "frameworkNode",
      position: { x: n.positionX, y: n.positionY },
      data: {
        label: n.label,
        type: n.type,
        description: n.description || "",
        status: n.status,
        methodCoverage: n.methodCoverage || "",
        supportingCount: (n as any).nodeMappings?.length || 1,
        nodeMappings: (n as any).nodeMappings || [],
        quote: (n as any).nodeMappings?.[0]?.quote || (n as any).evidenceQuote || (n as any).quote || "",
        pageNumber: (n as any).nodeMappings?.[0]?.sourcePage || (n as any).pageNumber || 1,
        onOpenQuote: (jId: string, p: number, q: string) => handleOpenSplitReader(jId, p, q),
        onOpenDetail: () => handleOpenNodeDetail(n.id, n, { x: n.positionX, y: n.positionY }),
        onDeleteNode: () => handleDeleteNode(n.id),
        onClearEvidence: () => handleClearNodeEvidence(n.id),
      } as CustomNodeData,
    }));

    const targetFlowEdges: Edge[] = rawEdges.map((e) => ({
      id: e.id,
      source: e.sourceNodeId,
      target: e.targetNodeId,
      label: e.relationshipLabel || "",
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed, color: "#00C988" },
      style: { stroke: "#00C988", strokeWidth: 2 },
      labelStyle: { fill: "#0f172a", fontWeight: 600, fontSize: 11 },
      labelBgStyle: { fill: "#ffffff", fillOpacity: 0.95 },
      labelBgPadding: [4, 2] as [number, number],
      labelBgBorderRadius: 4,
    }));

    setNodes([]);
    setEdges([]);

    targetFlowNodes.forEach((node, idx) => {
      setTimeout(() => {
        setNodes((prev) => {
          const next = [...prev, node];
          nodesRef.current = next;
          return next;
        });
      }, (idx + 1) * 200);
    });

    setTimeout(() => {
      setEdges(targetFlowEdges);
      pushHistory(targetFlowNodes, targetFlowEdges);
      syncPositionsToDb(targetFlowNodes);
      loadFramework();
    }, (targetFlowNodes.length + 1) * 200);
  }, [pushHistory, syncPositionsToDb, loadFramework]);

  const handleGenerateAi = async (overrideMode?: "SYNTHESIS" | "SINGLE_JOURNAL", overrideJournalId?: string) => {
    if (!projectId) return;
    const targetMode = overrideMode || viewMode;
    const targetJId = overrideJournalId || selectedJournalId;

    try {
      setGeneratingAi(true);
      const res = await api.framework.generateFromJournals(projectId, {
        mode: targetMode,
        journalId: targetMode === "SINGLE_JOURNAL" ? targetJId : undefined,
      });

      if (res.success && res.data) {
        if (res.data.summary) {
          setAiSummaryMsg(res.data.summary);
          setTimeout(() => setAiSummaryMsg(null), 8000);
        }
        animateSpawn(res.data.nodes, res.data.edges);
        notify.success("Kerangka berpikir AI berhasil dibangun!");
      }
    } catch (err: any) {
      notify.error(err.message || "Gagal membangun kerangka AI");
    } finally {
      setGeneratingAi(false);
    }
  };

  useEffect(() => {
    if (user && projectId) {
      loadFramework();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, projectId]);

  // ── UNDO & REDO HANDLERS ──
  const handleUndo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      const targetState = historyRef.current[historyIndexRef.current];
      if (targetState) {
        const restoredNodes = JSON.parse(JSON.stringify(targetState.nodes));
        const restoredEdges = JSON.parse(JSON.stringify(targetState.edges));
        setNodes(restoredNodes);
        nodesRef.current = restoredNodes;
        setEdges(restoredEdges);
        syncPositionsToDb(restoredNodes);
        updateUndoRedoAvailability();
      }
    }
  }, [syncPositionsToDb, updateUndoRedoAvailability]);

  const handleRedo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1;
      const targetState = historyRef.current[historyIndexRef.current];
      if (targetState) {
        const restoredNodes = JSON.parse(JSON.stringify(targetState.nodes));
        const restoredEdges = JSON.parse(JSON.stringify(targetState.edges));
        setNodes(restoredNodes);
        nodesRef.current = restoredNodes;
        setEdges(restoredEdges);
        syncPositionsToDb(restoredNodes);
        updateUndoRedoAvailability();
      }
    }
  }, [syncPositionsToDb, updateUndoRedoAvailability]);

  // Global Keyboard Shortcuts (Ctrl+Z, Ctrl+Y, Shift+1 Fit View, Zoom)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing inside input / textarea
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        handleRedo();
      } else if (e.shiftKey && (e.key === "1" || e.key === "!")) {
        // Figma Shortcut: Shift+1 -> Fit View
        e.preventDefault();
        reactFlowInstanceRef.current?.fitView({ padding: 0.25, duration: 600 });
      } else if ((e.ctrlKey || e.metaKey) && (e.key === "=" || e.key === "+")) {
        // Zoom In
        e.preventDefault();
        reactFlowInstanceRef.current?.zoomIn({ duration: 250 });
      } else if ((e.ctrlKey || e.metaKey) && e.key === "-") {
        // Zoom Out
        e.preventDefault();
        reactFlowInstanceRef.current?.zoomOut({ duration: 250 });
      } else if ((e.ctrlKey || e.metaKey) && e.key === "0") {
        // Reset Zoom
        e.preventDefault();
        reactFlowInstanceRef.current?.zoomTo(1, { duration: 350 });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Figma-like Double-Click on Node -> Smooth Focus Zoom to Read Quotes
  const onNodeDoubleClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (reactFlowInstanceRef.current) {
        reactFlowInstanceRef.current.setCenter(
          node.position.x + 140,
          node.position.y + 110,
          { zoom: 1.25, duration: 650 }
        );
      }
    },
    []
  );

  // Rapikan Pohon Hirarki Akademis Bebas Tabrakan (Hierarchical Tree Auto-Layout)
  const handleAutoTreeLayout = useCallback(() => {
    if (nodes.length === 0) return;

    const NODE_WIDTH = 320;
    const HORIZONTAL_PITCH = 520;
    const CENTER_X = 600;

    const roots: Node[] = [];
    const varXs: Node[] = [];
    const varYs: Node[] = [];
    const mediators: Node[] = [];
    const methods: Node[] = [];
    const gaps: Node[] = [];
    const others: Node[] = [];

    nodes.forEach((n) => {
      const type = String((n.data as any)?.type || "").toUpperCase();
      const label = String((n.data as any)?.label || "").toLowerCase();

      if (type === "CONCEPT" || type === "PROBLEM" || label.includes("masalah") || label.includes("urgensi") || label.includes("latar belakang") || label.includes("isu") || label.includes("transformasi")) {
        roots.push(n);
      } else if (type === "METHOD" || label.includes("metode") || label.includes("analisis") || label.includes("regresi") || label.includes("kualitatif")) {
        methods.push(n);
      } else if (type === "GAP" || label.includes("gap") || label.includes("limitasi") || label.includes("ruang riset") || label.includes("kebaruan")) {
        gaps.push(n);
      } else if (type === "VARIABLE" || type === "THEORY") {
        if (label.includes("(x") || label.includes("independen") || label.includes("faktor x") || label.includes("bebas") || label.includes("pemanfaatan") || label.includes("adopsi")) {
          varXs.push(n);
        } else if (label.includes("(y") || label.includes("dependen") || label.includes("faktor y") || label.includes("terikat") || label.includes("motivasi") || label.includes("capaian") || label.includes("perkembangan")) {
          varYs.push(n);
        } else if (label.includes("(z") || label.includes("(m") || label.includes("mediasi") || label.includes("teori")) {
          mediators.push(n);
        } else {
          if (varXs.length <= varYs.length) varXs.push(n);
          else varYs.push(n);
        }
      } else {
        others.push(n);
      }
    });

    const newPositions: Record<string, { x: number; y: number }> = {};

    // 1. Roots (Y: 60)
    if (roots.length === 1) {
      newPositions[roots[0].id] = { x: CENTER_X - NODE_WIDTH / 2, y: 60 };
    } else {
      const totalW = (roots.length - 1) * HORIZONTAL_PITCH;
      const startX = CENTER_X - totalW / 2 - NODE_WIDTH / 2;
      roots.forEach((n, idx) => {
        newPositions[n.id] = { x: startX + idx * HORIZONTAL_PITCH, y: 60 };
      });
    }

    // 2. Variables (Y: 680)
    const varLevel = [...varXs, ...mediators, ...varYs];
    if (varLevel.length === 1) {
      newPositions[varLevel[0].id] = { x: CENTER_X - NODE_WIDTH / 2, y: 680 };
    } else if (varXs.length === 1 && varYs.length === 1 && mediators.length === 0) {
      newPositions[varXs[0].id] = { x: CENTER_X - HORIZONTAL_PITCH / 2 - NODE_WIDTH / 2, y: 680 };
      newPositions[varYs[0].id] = { x: CENTER_X + HORIZONTAL_PITCH / 2 - NODE_WIDTH / 2, y: 680 };
    } else {
      const totalW = (varLevel.length - 1) * HORIZONTAL_PITCH;
      const startX = CENTER_X - totalW / 2 - NODE_WIDTH / 2;
      varLevel.forEach((n, idx) => {
        newPositions[n.id] = { x: startX + idx * HORIZONTAL_PITCH, y: 680 };
      });
    }

    // 3. Methods & Gaps (Y: 1360)
    const bottomLevel = [...methods, ...gaps];
    if (bottomLevel.length === 1) {
      newPositions[bottomLevel[0].id] = { x: CENTER_X - NODE_WIDTH / 2, y: 1360 };
    } else if (methods.length === 1 && gaps.length === 1) {
      newPositions[methods[0].id] = { x: CENTER_X - HORIZONTAL_PITCH / 2 - NODE_WIDTH / 2, y: 1360 };
      newPositions[gaps[0].id] = { x: CENTER_X + HORIZONTAL_PITCH / 2 - NODE_WIDTH / 2, y: 1360 };
    } else {
      const totalW = (bottomLevel.length - 1) * HORIZONTAL_PITCH;
      const startX = CENTER_X - totalW / 2 - NODE_WIDTH / 2;
      bottomLevel.forEach((n, idx) => {
        newPositions[n.id] = { x: startX + idx * HORIZONTAL_PITCH, y: 1360 };
      });
    }

    // 4. Others (Y: 2040)
    if (others.length > 0) {
      const totalW = (others.length - 1) * HORIZONTAL_PITCH;
      const startX = CENTER_X - totalW / 2 - NODE_WIDTH / 2;
      others.forEach((n, idx) => {
        newPositions[n.id] = { x: startX + idx * HORIZONTAL_PITCH, y: 2040 };
      });
    }

    // ── 5. MULTI-PASS COLLISION DETECTION & SEPARATION ──
    const placed = nodes.map((n) => ({
      id: n.id,
      x: newPositions[n.id]?.x ?? n.position.x,
      y: newPositions[n.id]?.y ?? n.position.y,
    }));

    for (let pass = 0; pass < 10; pass++) {
      for (let i = 0; i < placed.length; i++) {
        for (let j = i + 1; j < placed.length; j++) {
          const a = placed[i];
          const b = placed[j];
          const dx = Math.abs(a.x - b.x);
          const dy = Math.abs(a.y - b.y);

          if (dx < 480 && dy < 540) {
            if (dx < 480) {
              if (b.x >= a.x) {
                b.x = a.x + HORIZONTAL_PITCH;
              } else {
                a.x = b.x + HORIZONTAL_PITCH;
              }
            }
          }
        }
      }
    }

    const updatedNodes = nodes.map((n) => {
      const p = placed.find((item) => item.id === n.id);
      return {
        ...n,
        position: p ? { x: p.x, y: p.y } : (newPositions[n.id] || n.position),
      };
    });

    setNodes(updatedNodes);
    nodesRef.current = updatedNodes;
    pushHistory(updatedNodes, edges);
    syncPositionsToDb(updatedNodes);
    setTimeout(() => {
      reactFlowInstanceRef.current?.fitView({ padding: 0.2, duration: 600 });
    }, 100);
  }, [nodes, edges, pushHistory, syncPositionsToDb]);

  // Handle Node Click (Focus / Highlight this node & its connected relations; others dim to gray)
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setFocusedElement((prev) => {
        if (prev.type === "NODE" && prev.id === node.id) {
          return { type: null, id: null };
        }
        return { type: "NODE", id: node.id };
      });
    },
    []
  );

  // Save Node Details Update (Optimistic, No Blanking)
  const handleUpdateNode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNode) return;

    try {
      setUpdatingNode(true);
      await api.framework.updateNode(projectId, selectedNode.id, {
        label: editLabel,
        type: editType,
        status: editStatus,
        description: editDesc,
      });

      setNodes((nds) => {
        const updated = nds.map((n) =>
          n.id === selectedNode.id
            ? {
              ...n,
              data: {
                ...n.data,
                label: editLabel,
                type: editType,
                status: editStatus,
                description: editDesc,
              },
            }
            : n
        );
        nodesRef.current = updated;
        pushHistory(updated, edges);
        return updated;
      });

      setSelectedNode(null);
      setSaveStatus("saved");
      notify.success("Node berhasil diperbarui");
    } catch (err: any) {
      notify.error(err.message || "Gagal update node");
    } finally {
      setUpdatingNode(false);
    }
  };

  // Create Node (Optimistic, No Blanking)
  const handleCreateNode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeLabel.trim()) return;

    try {
      setCreatingNode(true);
      const positionX = 250 + Math.random() * 150;
      const positionY = 150 + Math.random() * 150;

      const res = await api.framework.createNode(projectId, {
        label: newNodeLabel,
        type: newNodeType,
        description: newNodeDesc,
        positionX,
        positionY,
      });

      const newNode: Node = {
        id: res.data.id,
        type: "frameworkNode",
        position: { x: res.data.positionX, y: res.data.positionY },
        data: {
          label: res.data.label,
          type: res.data.type,
          description: res.data.description || "",
          status: res.data.status,
          methodCoverage: "",
          supportingCount: 0,
        } as CustomNodeData,
      };

      setNodes((nds) => {
        const updated = [...nds, newNode];
        nodesRef.current = updated;
        pushHistory(updated, edges);
        return updated;
      });

      setNewNodeLabel("");
      setNewNodeDesc("");
      setShowAddModal(false);
      setSaveStatus("saved");
      notify.success("Node baru berhasil ditambahkan!");
    } catch (err: any) {
      notify.error(err.message || "Gagal membuat node");
    } finally {
      setCreatingNode(false);
    }
  };

  // Fetch AI Recommendation when connecting 2 nodes
  const fetchAiRelationRecommendation = useCallback(
    async (conn: Connection) => {
      if (!conn.source || !conn.target) return;
      try {
        setAiLoading(true);
        setAiRecommendation(null);

        const sourceNode = nodesRef.current.find((n) => n.id === conn.source);
        const targetNode = nodesRef.current.find((n) => n.id === conn.target);

        const res = await api.framework.recommendRelation(projectId, {
          sourceNodeId: conn.source,
          targetNodeId: conn.target,
          sourceLabel: (sourceNode?.data as any)?.label,
          sourceType: (sourceNode?.data as any)?.type,
          targetLabel: (targetNode?.data as any)?.label,
          targetType: (targetNode?.data as any)?.type,
        });

        if (res.data) {
          setAiRecommendation(res.data);
          if (res.data.recommendedRelation) {
            setRelationLabel(res.data.recommendedRelation);
          }
        }
      } catch (err) {
        console.warn("Gagal mengambil rekomendasi AI:", err);
      } finally {
        setAiLoading(false);
      }
    },
    [projectId]
  );

  // Handle Connecting 2 Nodes
  const onConnect = useCallback(
    (connection: Connection) => {
      setPendingConnection(connection);
      setRelationLabel("Mempengaruhi Positif (+)");
      setCustomRelation("");
      setShowEdgeModal(true);
      fetchAiRelationRecommendation(connection);
    },
    [fetchAiRelationRecommendation]
  );

  // Direct Apply Relationship function (1-click, Optimistic & Silent)
  const applyRelationship = async (selectedLabel: string) => {
    if (!pendingConnection || !pendingConnection.source || !pendingConnection.target) return;

    try {
      const res = await api.framework.createEdge(projectId, {
        sourceNodeId: pendingConnection.source,
        targetNodeId: pendingConnection.target,
        relationshipLabel: selectedLabel,
      });

      const newEdge: Edge = {
        id: res.data.id,
        source: pendingConnection.source,
        target: pendingConnection.target,
        label: selectedLabel,
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed, color: "#00C988" },
        style: { stroke: "#00C988", strokeWidth: 2 },
        labelStyle: { fill: "#0f172a", fontWeight: 600, fontSize: 11 },
        labelBgStyle: { fill: "#ffffff", fillOpacity: 0.95 },
        labelBgPadding: [4, 2] as [number, number],
        labelBgBorderRadius: 4,
      };

      setEdges((eds) => {
        const nextEdges = addEdge(newEdge, eds);
        pushHistory(nodesRef.current, nextEdges);
        return nextEdges;
      });

      setShowEdgeModal(false);
      setPendingConnection(null);
      setSaveStatus("saved");
      notify.success("Relasi berhasil dihubungkan!");
    } catch (err: any) {
      notify.error(err.message || "Gagal menghubungkan node");
    }
  };

  // Handle Edge Click (Focus / Highlight this relationship; others dim to gray)
  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    setFocusedElement((prev) => {
      if (prev.type === "EDGE" && prev.id === edge.id) {
        return { type: null, id: null };
      }
      return { type: "EDGE", id: edge.id };
    });
  }, []);

  // Handle Edge Double Click (Delete relationship)
  const onEdgeDoubleClick = useCallback(async (_: React.MouseEvent, edge: Edge) => {
    const confirmed = await notify.confirm({
      title: "Hapus Relasi",
      description: `Hapus relasi "${edge.label || "koneksi"}"?`,
      confirmLabel: "Hapus",
      cancelLabel: "Batal",
      isDestructive: true,
    });
    if (!confirmed) return;
    try {
      await api.framework.deleteEdge(projectId, edge.id);
      setEdges((eds) => {
        const nextEdges = eds.filter((e) => e.id !== edge.id);
        pushHistory(nodesRef.current, nextEdges);
        return nextEdges;
      });
      setFocusedElement({ type: null, id: null });
      setSaveStatus("saved");
      notify.success("Relasi berhasil dihapus");
    } catch (err: any) {
      notify.error(err.message || "Gagal menghapus edge");
    }
  }, [projectId, pushHistory]);

  // Handle Pane Click (Click on empty canvas background -> Reset focus highlight back to normal)
  const onPaneClick = useCallback(() => {
    setFocusedElement({ type: null, id: null });
  }, []);

  // Quick Template Generator (Optimistic, Silent without Blanking)
  const handleApplyTemplate = async () => {
    if (nodes.length > 0) {
      const confirmed = await notify.confirm({
        title: "Terapkan Template Kerangka",
        description: "Terapkan template kerangka awal? Ini akan menambahkan node standar ke kanvas.",
        confirmLabel: "Terapkan Template",
        cancelLabel: "Batal",
      });
      if (!confirmed) return;
    }

    try {
      const resX = await api.framework.createNode(projectId, {
        label: "Penggunaan AI Generatif (Variabel X)",
        type: "VARIABLE",
        description: "Intensitas dan frekuensi penggunaan tools AI oleh mahasiswa",
        positionX: 120,
        positionY: 220,
      });

      const resY = await api.framework.createNode(projectId, {
        label: "Produktivitas Belajar (Variabel Y)",
        type: "VARIABLE",
        description: "Efektivitas penyelesaian tugas dan pemahaman materi",
        positionX: 520,
        positionY: 220,
      });

      const resM = await api.framework.createNode(projectId, {
        label: "Metode: Survey Kuesioner Likert",
        type: "METHOD",
        description: "Pengambilan data kuantitatif dari sampel 200 responden mahasiswa",
        positionX: 320,
        positionY: 80,
      });

      const resG = await api.framework.createNode(projectId, {
        label: "Gap: Belum ada studi longitudinal efek jangka panjang",
        type: "GAP",
        description: "Inferred research gap dari telaah 5 literatur terkini",
        positionX: 320,
        positionY: 380,
      });

      const edgeRes = await api.framework.createEdge(projectId, {
        sourceNodeId: resX.data.id,
        targetNodeId: resY.data.id,
        relationshipLabel: "Mempengaruhi Positif (+)",
      });

      const templateNodes: Node[] = [
        {
          id: resX.data.id,
          type: "frameworkNode",
          position: { x: resX.data.positionX, y: resX.data.positionY },
          data: { label: resX.data.label, type: resX.data.type, description: resX.data.description, status: resX.data.status, methodCoverage: "", supportingCount: 0 } as CustomNodeData,
        },
        {
          id: resY.data.id,
          type: "frameworkNode",
          position: { x: resY.data.positionX, y: resY.data.positionY },
          data: { label: resY.data.label, type: resY.data.type, description: resY.data.description, status: resY.data.status, methodCoverage: "", supportingCount: 0 } as CustomNodeData,
        },
        {
          id: resM.data.id,
          type: "frameworkNode",
          position: { x: resM.data.positionX, y: resM.data.positionY },
          data: { label: resM.data.label, type: resM.data.type, description: resM.data.description, status: resM.data.status, methodCoverage: "", supportingCount: 0 } as CustomNodeData,
        },
        {
          id: resG.data.id,
          type: "frameworkNode",
          position: { x: resG.data.positionX, y: resG.data.positionY },
          data: { label: resG.data.label, type: resG.data.type, description: resG.data.description, status: resG.data.status, methodCoverage: "", supportingCount: 0 } as CustomNodeData,
        },
      ];

      const templateEdges: Edge[] = [
        {
          id: edgeRes.data.id,
          source: resX.data.id,
          target: resY.data.id,
          label: "Mempengaruhi Positif (+)",
          animated: true,
          markerEnd: { type: MarkerType.ArrowClosed, color: "#00C988" },
          style: { stroke: "#00C988", strokeWidth: 2 },
          labelStyle: { fill: "#0f172a", fontWeight: 600, fontSize: 11 },
          labelBgStyle: { fill: "#ffffff", fillOpacity: 0.95 },
          labelBgPadding: [4, 2] as [number, number],
          labelBgBorderRadius: 4,
        },
      ];

      setNodes((prev) => {
        const nextNodes = [...prev, ...templateNodes];
        nodesRef.current = nextNodes;
        return nextNodes;
      });

      setEdges((prev) => {
        const nextEdges = [...prev, ...templateEdges];
        pushHistory(nodesRef.current, nextEdges);
        return nextEdges;
      });

      setSaveStatus("saved");
      notify.success("Template kerangka awal berhasil diterapkan!");
    } catch (err: any) {
      notify.error(err.message || "Gagal menerapkan template");
    }
  };

  // Clean, structured relationship options
  const relationshipOptions = [
    {
      id: "Mempengaruhi Positif (+)",
      title: "Mempengaruhi Positif (+)",
      icon: TrendingUp,
      badge: "Kausalitas Naik",
      color: "#059669",
      bg: "#ecfdf5",
      border: "#a7f3d0",
    },
    {
      id: "Mempengaruhi Negatif (-)",
      title: "Mempengaruhi Negatif (-)",
      icon: TrendingDown,
      badge: "Kausalitas Turun",
      color: "#dc2626",
      bg: "#fef2f2",
      border: "#fecaca",
    },
    {
      id: "Saling Terkait / Berkorelasi",
      title: "Saling Terkait / Berkorelasi",
      icon: ArrowRightLeft,
      badge: "Hubungan Dua Arah",
      color: "#2563eb",
      bg: "#eff6ff",
      border: "#bfdbfe",
    },
    {
      id: "Dihubungkan Perantara (Mediasi)",
      title: "Dihubungkan Perantara (Mediasi)",
      icon: GitMerge,
      badge: "Jembatan Pengaruh",
      color: "#7c3aed",
      bg: "#faf5ff",
      border: "#e9d5ff",
    },
    {
      id: "Dikuatkan / Diperlemah (Moderasi)",
      title: "Dikuatkan / Diperlemah (Moderasi)",
      icon: Gauge,
      badge: "Faktor Pengubah",
      color: "#d97706",
      bg: "#fffbeb",
      border: "#fde68a",
    },
    {
      id: "Diuji Menggunakan Metode",
      title: "Diuji Menggunakan Metode",
      icon: FlaskConical,
      badge: "Instrumen Riset",
      color: "#0284c7",
      bg: "#f0f9ff",
      border: "#bae6fd",
    },
  ];

  if (isLoading || initialLoading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fefefe",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Network size={24} color="#00C988" />
          <span style={{ fontSize: 15, fontWeight: 600, color: "#334155" }}>
            Memuat Kanvas Research Framework...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "row", background: "#fefefe", overflow: "hidden" }}>
      {/* ── LEFT ICON SIDEBAR ── */}
      <ProjectSidebar
        projectId={projectId}
        approvedJournalsCount={approvedJournalsCount}
        totalNodesCount={nodes.length}
      />

      {/* ── RIGHT: FULL CANVAS AREA ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
        {/* ── TOP TOOLBAR HEADER (CLEAN & MINIMALIST) ── */}
        <header
          style={{
            height: 60,
            background: "#ffffff",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            zIndex: 20,
          }}
        >
          {/* Left: Back + Project Title */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Link
              href="/dashboard"
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#475569",
                textDecoration: "none",
                transition: "background 0.15s ease",
              }}
              title="Kembali ke Dashboard"
            >
              <ArrowLeft size={18} />
            </Link>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h1
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 15.5,
                    fontWeight: 700,
                    color: "#0f172a",
                    margin: 0,
                  }}
                >
                  {project?.title || "Research Framework"}
                </h1>
                {project?.field && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: 6,
                      background: "#e0f2fe",
                      color: "#0369a1",
                    }}
                  >
                    {project.field}
                  </span>
                )}
              </div>
              <span style={{ fontSize: 11.5, color: "#64748b" }}>
                Fase 7: Pemetaan Kerangka Berpikir & Node Variabel
              </span>
            </div>
          </div>

          {/* Right: Live Auto-Save & Node Count */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Live Auto-Save Indicator */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 10px",
                borderRadius: 9999,
                background: saveStatus === "saving" ? "#fffbeb" : "#f0fdf4",
                border: saveStatus === "saving" ? "1px solid #fde68a" : "1px solid #bbf7d0",
                color: saveStatus === "saving" ? "#b45309" : "#166534",
                fontSize: 11.5,
                fontWeight: 600,
              }}
            >
              {saveStatus === "saving" ? (
                <>
                  <RefreshCw size={12} className="animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={12} color="#059669" />
                  <span>Tersimpan</span>
                </>
              )}
            </div>

            {/* Quick Button: Unduh Diagram PNG */}
            <button
              type="button"
              onClick={handleExportPng}
              disabled={exportingPng || nodes.length === 0}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                background: "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: 8,
                padding: "6px 12px",
                fontSize: 12,
                fontWeight: 600,
                color: "#334155",
                cursor: exportingPng || nodes.length === 0 ? "not-allowed" : "pointer",
                transition: "all 0.15s ease",
              }}
              title="Unduh Diagram Kerangka Resolusi Tinggi (PNG)"
            >
              {exportingPng ? (
                <RefreshCw size={13} className="animate-spin" />
              ) : (
                <Download size={13} color="#00C988" />
              )}
              <span>{exportingPng ? "Mengekspor..." : "Unduh PNG"}</span>
            </button>

            {/* Quick Button: Mode Presentasi / Sidang */}
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("framework-canvas-area");
                if (el?.requestFullscreen) el.requestFullscreen();
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                background: "#faf5ff",
                border: "1px solid #ddd6fe",
                borderRadius: 8,
                padding: "6px 12px",
                fontSize: 12,
                fontWeight: 600,
                color: "#7c3aed",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              title="Mode Presentasi — tampilkan kanvas penuh layar untuk sidang"
            >
              <Eye size={13} />
              <span>Mode Sidang</span>
            </button>

            {/* Coming Soon: Simulasi Sidang */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                background: "#fff7ed",
                border: "1px dashed #fed7aa",
                borderRadius: 8,
                padding: "6px 12px",
                fontSize: 12,
                fontWeight: 600,
                color: "#c2410c",
                cursor: "default",
                opacity: 0.85,
              }}
              title="Simulasi Sidang — fitur ini sedang dalam pengembangan"
            >
              <Sparkles size={13} />
              <span>Simulasi Sidang</span>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  background: "#c2410c",
                  color: "#ffffff",
                  padding: "1px 5px",
                  borderRadius: 4,
                  letterSpacing: "0.04em",
                }}
              >
                SOON
              </span>
            </div>

            {/* Main Action: Masukkan Draf ke Proposal Skripsi (LaTeX & Cover) */}
            <Link
              href={`/projects/${projectId}/proposal`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "#00C988",
                border: "1px solid #00b077",
                borderRadius: 8,
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 700,
                color: "#ffffff",
                textDecoration: "none",
                boxShadow: "0 2px 8px rgba(0, 201, 136, 0.25)",
                transition: "all 0.15s ease",
              }}
              title="Masukkan Draf & Kerangka ke Proposal Skripsi (Generate Cover & Template LaTeX)"
            >
              <FileCheck2 size={14} />
              <span>Masukkan ke Proposal ↗</span>
            </Link>
          </div>

        </header>

        {/* ── CANVAS WORKSPACE ── */}
        <div id="framework-canvas-area" style={{ flex: 1, position: "relative", background: "#fefefe" }}>
          {/* ── PHASE 3 LOCK OVERLAY (ANTI-NGACAK) ── */}
          {approvedJournalsCount === 0 && nodes.length === 0 && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(255, 255, 255, 0.92)",
                backdropFilter: "blur(5px)",
                zIndex: 50,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: 24,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 16,
                  background: "#fee2e2",
                  border: "1px solid #fca5a5",
                  color: "#e11d48",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 14,
                  boxShadow: "0 4px 12px rgba(225, 29, 72, 0.12)",
                }}
              >
                <Lock size={28} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>
                Kanvas Terkunci: Wajib Selesaikan Telaah Jurnal (Fase 3)
              </h3>
              <p style={{ fontSize: 13, color: "#64748b", maxWidth: 460, margin: "0 0 20px", lineHeight: 1.5 }}>
                Agar skripsi memiliki landasan teoretis yang kuat, kanvas kerangka berpikir wajib dibangun dari artikel ilmiah yang telah Disetujui (Approved) pada Fase 3.
              </p>
              <Link href={`/projects/${projectId}/journals`} style={{ textDecoration: "none" }}>
                <Button variant="emerald" size="md">
                  Ke Fase 3: Telaah Jurnal & Literatur
                </Button>
              </Link>
            </div>
          )}

          {/* ── AI SUMMARY NOTIFICATION BANNER ── */}
          {aiSummaryMsg && (
            <div
              style={{
                position: "absolute",
                top: 16,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 40,
                background: "#0f172a",
                color: "#ffffff",
                padding: "10px 18px",
                borderRadius: 12,
                boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.3)",
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12.5,
                maxWidth: 650,
              }}
            >
              <Sparkles size={16} color="#00C988" style={{ flexShrink: 0 }} />
              <span>{aiSummaryMsg}</span>
            </div>
          )}

          {/* ── EMPTY CANVAS QUICK CTA ── */}
          {nodes.length === 0 && approvedJournalsCount > 0 && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 30,
                background: "#ffffff",
                border: "1.5px dashed #86efac",
                borderRadius: 16,
                padding: "28px 32px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                maxWidth: 420,
                boxShadow: "0 10px 30px -5px rgba(0, 201, 136, 0.12)",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: "#ecfdf5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#059669",
                }}
              >
                <Network size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 4px" }}>
                  Kanvas Kerangka Belum Terisi
                </h3>
                <p style={{ fontSize: 12.5, color: "#64748b", margin: 0, lineHeight: 1.5 }}>
                  AI Groq dapat secara otomatis menyintesis {approvedJournalsCount} artikel jurnal Anda menjadi peta konsep dan garis relasi.
                </p>
              </div>
              <Button
                variant="emerald"
                size="md"
                disabled={generatingAi}
                onClick={() => handleGenerateAi("SYNTHESIS")}
                icon={generatingAi ? <RefreshCw size={15} className="animate-spin" /> : <Sparkles size={15} />}
              >
                {generatingAi ? "AI Menggambar Diagram..." : "Bangun Kerangka Otomatis"}
              </Button>
            </div>
          )}

          <ReactFlow
            nodes={displayNodes}
            edges={displayEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onNodeDoubleClick={onNodeDoubleClick}
            onEdgeClick={onEdgeClick}
            onEdgeDoubleClick={onEdgeDoubleClick}
            onPaneClick={onPaneClick}
            onNodeDragStop={onNodeDragStop}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onInit={(instance) => {
              reactFlowInstanceRef.current = instance;
            }}
            fitView
            fitViewOptions={{ padding: 0.25, duration: 600 }}
            minZoom={0.2}
            maxZoom={2.5}
            panOnScroll={true}
            panOnScrollMode={PanOnScrollMode.Free}
            panOnScrollSpeed={1.1}
            zoomOnPinch={true}
            zoomOnScroll={false}
            panOnDrag={true}
            preventScrolling={true}
            selectionOnDrag={false}
            elevateNodesOnSelect={true}
            className="figma-canvas-viewport"
            style={{ background: "#f8fafc" }}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#cbd5e1" gap={24} size={1.2} />
            <Controls style={{ border: "1px solid #e2e8f0", boxShadow: "none" }} />

            {/* ── DYNAMIC FLOATING GUIDE / ICON DRIVER ── */}
            <Panel position="top-left" style={{ margin: 16 }}>
              {isGuideExpanded ? (
                <div
                  style={{
                    background: "#ffffff",
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 8px 24px -4px rgba(15, 23, 42, 0.12)",
                    maxWidth: 260,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <HelpCircle size={14} color="#00C988" />
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>
                        Panduan Kanvas
                      </span>
                    </div>
                    <button
                      onClick={() => setIsGuideExpanded(false)}
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        color: "#94a3b8",
                        padding: 0,
                      }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11.5, color: "#64748b", lineHeight: 1.6 }}>
                    <li>Klik <strong>⚡ Bangun Otomatis AI</strong> untuk menyusun kerangka.</li>
                    <li>Tarik garis antar handle untuk membuat relasi hipotesis.</li>
                    <li>Klik node untuk melihat <strong>Kutipan Bukti Jurnal</strong>.</li>
                    <li>Klik <strong>Buka Split</strong> untuk membuka naskah PDF asli.</li>
                  </ul>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsGuideExpanded(true)}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #cbd5e1",
                    borderRadius: 9999,
                    padding: "6px 12px",
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: "#475569",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  }}
                >
                  <HelpCircle size={13} color="#00C988" />
                  <span>Bantuan</span>
                </button>
              )}
            </Panel>
          </ReactFlow>
          {/* ── FLOATING FIGMA-LIKE BOTTOM DOCK MENU (RESPONSIVE & COLLISION-FREE) ── */}
          <div
            style={{
              position: "absolute",
              bottom: splitReaderOpen ? 14 : 20,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 35,
              display: "flex",
              alignItems: "center",
              gap: splitReaderOpen ? 4 : 6,
              padding: splitReaderOpen ? "4px 8px" : "6px 12px",
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(203, 213, 225, 0.9)",
              borderRadius: 9999,
              boxShadow: "0 14px 34px -4px rgba(15, 23, 42, 0.14), 0 4px 12px rgba(0, 0, 0, 0.04)",
              transition: "all 0.2s ease",
              maxWidth: splitReaderOpen ? "calc(100% - 16px)" : "calc(100% - 32px)",
              overflowX: "auto",
              scrollbarWidth: "none",
            }}
          >
            {/* Action: + Tambah Node Manual */}
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                background: "#0f172a",
                color: "#ffffff",
                border: "none",
                borderRadius: 9999,
                padding: splitReaderOpen ? "6px 10px" : "7px 14px",
                fontSize: splitReaderOpen ? 11.5 : 12.5,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(15, 23, 42, 0.2)",
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
              title="Tambah Node Manual ke Kerangka"
            >
              <Plus size={13} color="#00C988" />
              <span>{splitReaderOpen ? "Tambah" : "Tambah Node"}</span>
            </button>

            {/* Primary Action: ⚡ Bangun Otomatis AI */}
            <button
              type="button"
              onClick={() => handleGenerateAi()}
              disabled={generatingAi}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                background: "#00C988",
                color: "#ffffff",
                border: "none",
                borderRadius: 9999,
                padding: splitReaderOpen ? "6px 11px" : "7px 15px",
                fontSize: splitReaderOpen ? 11.5 : 12.5,
                fontWeight: 700,
                cursor: generatingAi ? "not-allowed" : "pointer",
                boxShadow: "0 2px 8px rgba(0, 201, 136, 0.25)",
                transition: "transform 0.15s ease, background 0.15s ease",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {generatingAi ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  <span>{splitReaderOpen ? "Menyusun..." : "AI Menyusun..."}</span>
                </>
              ) : (
                <>
                  <Sparkles size={13} />
                  <span>{splitReaderOpen ? "Bangun AI" : "Bangun Otomatis AI"}</span>
                </>
              )}
            </button>

            {/* Skripsi Draft Narrative Generator Button */}
            <button
              type="button"
              onClick={handleGenerateDraft}
              disabled={generatingDraft || nodes.length === 0}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                background: "#f1f5f9",
                color: "#0f172a",
                border: "1px solid #cbd5e1",
                borderRadius: 9999,
                padding: splitReaderOpen ? "6px 9px" : "7px 12px",
                fontSize: splitReaderOpen ? 11 : 12,
                fontWeight: 700,
                cursor: generatingDraft || nodes.length === 0 ? "not-allowed" : "pointer",
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
              title="Buat Draf Narasi Naskah Skripsi (Bab 1, Bab 2, Bab 3)"
            >
              {generatingDraft ? (
                <>
                  <RefreshCw size={12} className="animate-spin" />
                  <span>Menyusun...</span>
                </>
              ) : (
                <>
                  <BookOpenCheck size={13} color="#00C988" />
                  <span>{splitReaderOpen ? "Draf" : "Draf Skripsi"}</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div style={{ width: 1, height: 18, background: "#e2e8f0", margin: "0 1px", flexShrink: 0 }} />

            {/* Segmented Mode Switcher (Instant Non-Destructive Filtering) */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "#f1f5f9",
                padding: 2,
                borderRadius: 9999,
                gap: 2,
                flexShrink: 0,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setViewMode("SYNTHESIS");
                  setNodes((prevNodes) =>
                    prevNodes.map((n) => ({
                      ...n,
                      data: {
                        ...n.data,
                        filterJournalId: null,
                      },
                    }))
                  );
                }}
                style={{
                  background: viewMode === "SYNTHESIS" ? "#ffffff" : "transparent",
                  border: "none",
                  borderRadius: 9999,
                  padding: splitReaderOpen ? "5px 9px" : "5px 11px",
                  fontSize: splitReaderOpen ? 11 : 11.5,
                  fontWeight: viewMode === "SYNTHESIS" ? 700 : 500,
                  color: viewMode === "SYNTHESIS" ? "#00C988" : "#64748b",
                  cursor: "pointer",
                  boxShadow: viewMode === "SYNTHESIS" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  transition: "all 0.15s ease",
                  whiteSpace: "nowrap",
                }}
                title="Tampilkan Semua Bukti dari Seluruh Jurnal"
              >
                <Network size={12} />
                <span>{splitReaderOpen ? "Sintesis" : "Sintesis Multi-Jurnal"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setViewMode("SINGLE_JOURNAL");
                  const targetId = selectedJournalId || journalsList[0]?.id;
                  if (targetId) {
                    setSelectedJournalId(targetId);
                    setNodes((prevNodes) =>
                      prevNodes.map((n) => ({
                        ...n,
                        data: {
                          ...n.data,
                          filterJournalId: targetId,
                        },
                      }))
                    );
                  }
                }}
                disabled={journalsList.length === 0}
                style={{
                  background: viewMode === "SINGLE_JOURNAL" ? "#ffffff" : "transparent",
                  border: "none",
                  borderRadius: 9999,
                  padding: splitReaderOpen ? "5px 9px" : "5px 11px",
                  fontSize: splitReaderOpen ? 11 : 11.5,
                  fontWeight: viewMode === "SINGLE_JOURNAL" ? 700 : 500,
                  color: viewMode === "SINGLE_JOURNAL" ? "#0284c7" : "#64748b",
                  cursor: "pointer",
                  boxShadow: viewMode === "SINGLE_JOURNAL" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  transition: "all 0.15s ease",
                  whiteSpace: "nowrap",
                }}
                title="Filter Tampilan Khusus 1 Jurnal Spesifik"
              >
                <BookOpen size={12} />
                <span>{splitReaderOpen ? "1 Jurnal" : "Anatomi 1 Jurnal"}</span>
              </button>
            </div>

            {/* Journal Picker for Single Journal Mode */}
            {viewMode === "SINGLE_JOURNAL" && journalsList.length > 0 && (
              <select
                value={selectedJournalId}
                onChange={(e) => {
                  const targetId = e.target.value;
                  setSelectedJournalId(targetId);
                  setNodes((prevNodes) =>
                    prevNodes.map((n) => ({
                      ...n,
                      data: {
                        ...n.data,
                        filterJournalId: targetId,
                      },
                    }))
                  );
                }}
                style={{
                  height: 28,
                  padding: "0 8px",
                  borderRadius: 9999,
                  border: "1px solid #cbd5e1",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#0f172a",
                  maxWidth: splitReaderOpen ? 120 : 160,
                  outline: "none",
                  background: "#ffffff",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
                title="Pilih Jurnal untuk Memfilter Kutipan"
              >
                {journalsList.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title.slice(0, splitReaderOpen ? 16 : 24)}...
                  </option>
                ))}
              </select>
            )}

            {/* Divider */}
            <div style={{ width: 1, height: 18, background: "#e2e8f0", margin: "0 1px", flexShrink: 0 }} />

            {/* Auto Tree Layout Button */}
            <button
              type="button"
              onClick={handleAutoTreeLayout}
              disabled={nodes.length === 0}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                color: "#166534",
                borderRadius: 9999,
                padding: splitReaderOpen ? "5px 8px" : "6px 11px",
                fontSize: splitReaderOpen ? 11 : 11.5,
                fontWeight: 700,
                cursor: nodes.length === 0 ? "not-allowed" : "pointer",
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
              title="Atur Ulang Tata Letak Pohon Hirarki Akademis (Bebas Tabrakan)"
            >
              <Network size={12} color="#00C988" />
              <span>{splitReaderOpen ? "Rapikan" : "Rapihkan Node"}</span>
            </button>

            {/* Divider */}
            <div style={{ width: 1, height: 18, background: "#e2e8f0", margin: "0 1px", flexShrink: 0 }} />

            {/* Undo & Redo Quick Buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
              <button
                type="button"
                onClick={handleUndo}
                disabled={!canUndo}
                title="Undo (Ctrl+Z)"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 9999,
                  border: "none",
                  background: "transparent",
                  color: canUndo ? "#0f172a" : "#cbd5e1",
                  cursor: canUndo ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 0.15s ease",
                }}
              >
                <Undo2 size={13} />
              </button>

              <button
                type="button"
                onClick={handleRedo}
                disabled={!canRedo}
                title="Redo (Ctrl+Y)"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 9999,
                  border: "none",
                  background: "transparent",
                  color: canRedo ? "#0f172a" : "#cbd5e1",
                  cursor: canRedo ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 0.15s ease",
                }}
              >
                <Redo2 size={13} />
              </button>
            </div>

            {/* Divider */}
            <div style={{ width: 1, height: 18, background: "#e2e8f0", margin: "0 1px", flexShrink: 0 }} />

            {/* Figma Quick Zoom Controls */}
            <div style={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
              <button
                type="button"
                onClick={() => reactFlowInstanceRef.current?.zoomOut({ duration: 250 })}
                title="Zoom Out (Ctrl -)"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 9999,
                  border: "none",
                  background: "transparent",
                  color: "#475569",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ZoomOut size={13} />
              </button>

              <button
                type="button"
                onClick={() => reactFlowInstanceRef.current?.fitView({ padding: 0.25, duration: 600 })}
                title="Pusatkan Kanvas / Fit View (Shift+1)"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 9999,
                  border: "none",
                  background: "transparent",
                  color: "#475569",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Maximize2 size={12} />
              </button>

              <button
                type="button"
                onClick={() => reactFlowInstanceRef.current?.zoomIn({ duration: 250 })}
                title="Zoom In (Ctrl +)"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 9999,
                  border: "none",
                  background: "transparent",
                  color: "#475569",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ZoomIn size={13} />
              </button>
            </div>
          </div>

          {/* ── SIDEBAR DRAWER: EDIT NODE DETAILS ── */}
          {selectedNode && (
            <aside
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                bottom: 16,
                width: 350,
                background: "#ffffff",
                borderRadius: 14,
                border: "1px solid #cbd5e1",
                boxShadow: "0 12px 36px -6px rgba(15, 23, 42, 0.18), 0 4px 12px rgba(0, 0, 0, 0.06)",
                padding: 20,
                zIndex: 50,
                display: "flex",
                flexDirection: "column",
                boxSizing: "border-box",
                overflowY: "auto",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 16,
                    position: "sticky",
                    top: 0,
                    background: "#ffffff",
                    paddingBottom: 8,
                    zIndex: 2,
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Layers size={18} color="#00C988" />
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                      Detail Node
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedNode(null)}
                    style={{
                      background: "#f1f5f9",
                      border: "none",
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#64748b",
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>

                <form onSubmit={handleUpdateNode} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <Input
                    id="edit-node-label"
                    label="Nama / Label Node *"
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    required
                  />

                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>
                      Tipe Node
                    </label>
                    <select
                      value={editType}
                      onChange={(e) => setEditType(e.target.value as NodeType)}
                      style={{
                        height: 38,
                        padding: "0 12px",
                        borderRadius: 8,
                        border: "1px solid #cbd5e1",
                        fontSize: 13,
                        color: "#0f172a",
                        outline: "none",
                        background: "#ffffff",
                      }}
                    >
                      <option value="VARIABLE">Variabel Penelitian (X, Y, M)</option>
                      <option value="CONCEPT">Konsep Teoretis</option>
                      <option value="METHOD">Metodologi / Uji Analisis</option>
                      <option value="THEORY">Landasan Teori</option>
                      <option value="GAP">Research Gap</option>
                    </select>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>
                      Status Dukungan Bukti
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as NodeEvidenceStatus)}
                      style={{
                        height: 38,
                        padding: "0 12px",
                        borderRadius: 8,
                        border: "1px solid #cbd5e1",
                        fontSize: 13,
                        color: "#0f172a",
                        outline: "none",
                        background: "#ffffff",
                      }}
                    >
                      <option value="UNSUPPORTED">Belum Ada Bukti (Default)</option>
                      <option value="SUPPORTED">Didukung Jurnal (Hijau)</option>
                      <option value="CONTRADICTORY">Kontradiktif (Kuning)</option>
                      <option value="NEEDS_REVIEW">Perlu Review (Merah)</option>
                    </select>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>
                      Definisi Operasional / Catatan
                    </label>
                    <textarea
                      rows={3}
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      placeholder="Penjelasan variabel atau hipotesis yang diajukan..."
                      style={{
                        padding: "10px 12px",
                        borderRadius: 8,
                        border: "1px solid #cbd5e1",
                        fontSize: 13,
                        fontFamily: "var(--font-body)",
                        color: "#0f172a",
                        outline: "none",
                        resize: "vertical",
                        background: "#ffffff",
                      }}
                    />
                  </div>

                  <Button type="submit" disabled={updatingNode} variant="emerald" fullWidth>
                    {updatingNode ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>
                </form>

                {/* ── BUKTI JURNAL & KUTIPAN ASLI DARI ARTIKEL ── */}
                {(() => {
                  const mappings = (selectedNode as any)?.nodeMappings || (selectedNode as any)?.data?.nodeMappings || [];
                  if (mappings.length === 0) return null;

                  return (
                    <div style={{ marginTop: 18, borderTop: "1px solid #f1f5f9", paddingTop: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <BookOpen size={14} color="#00C988" />
                          <span style={{ fontSize: 12.5, fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                            Bukti Jurnal ({mappings.length})
                          </span>
                        </div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {mappings.map((m: any, idx: number) => (
                          <SidebarQuoteCardItem
                            key={m.id || idx}
                            mapping={m}
                            onOpenSplitReader={handleOpenSplitReader}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 14 }}>
                <button
                  type="button"
                  onClick={() => handleDeleteNode()}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1px solid #fecaca",
                    background: "#fff1f2",
                    color: "#be123c",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <Trash2 size={14} />
                  Hapus Node Ini
                </button>
              </div>
            </aside>
          )}
        </div>

        {/* ── MODAL: TAMBAH NODE BARU ── */}
        {showAddModal && (
          <div
            role="dialog"
            aria-modal="true"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 100,
              background: "rgba(15, 23, 42, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
            }}
            onClick={() => setShowAddModal(false)}
          >
            <div
              style={{
                width: "100%",
                maxWidth: 480,
                background: "#ffffff",
                borderRadius: 14,
                border: "1px solid #e2e8f0",
                boxShadow: "none",
                padding: 24,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <h2 style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                  Tambah Node Kerangka Berpikir
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  style={{
                    background: "#f1f5f9",
                    border: "none",
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <X size={14} />
                </button>
              </div>

              <form onSubmit={handleCreateNode} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <Input
                  id="new-node-label"
                  label="Nama / Label Node *"
                  placeholder="Contoh: Penggunaan AI Generatif (X)"
                  value={newNodeLabel}
                  onChange={(e) => setNewNodeLabel(e.target.value)}
                  required
                />

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>
                    Tipe Node
                  </label>
                  <select
                    value={newNodeType}
                    onChange={(e) => setNewNodeType(e.target.value as NodeType)}
                    style={{
                      height: 38,
                      padding: "0 12px",
                      borderRadius: 8,
                      border: "1px solid #cbd5e1",
                      fontSize: 13,
                      color: "#0f172a",
                      outline: "none",
                      background: "#ffffff",
                    }}
                  >
                    <option value="VARIABLE">Variabel Penelitian (X / Y / Mediator)</option>
                    <option value="CONCEPT">Konsep Teoretis</option>
                    <option value="METHOD">Metodologi / Analisis</option>
                    <option value="THEORY">Landasan Teori</option>
                    <option value="GAP">Research Gap (Kebaruan)</option>
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>
                    Definisi / Catatan (Opsional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Catatan konsep atau indikator yang diukur..."
                    value={newNodeDesc}
                    onChange={(e) => setNewNodeDesc(e.target.value)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: "1px solid #cbd5e1",
                      fontSize: 13,
                      fontFamily: "var(--font-body)",
                      outline: "none",
                      resize: "vertical",
                      background: "#ffffff",
                    }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
                  <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                    Batal
                  </Button>
                  <Button type="submit" disabled={creatingNode} variant="emerald">
                    {creatingNode ? "Menambahkan..." : "Tambah ke Kanvas"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── MODAL: QUICK-CLICK RELATION MODAL (SUPER FAST & 1-CLICK ACTION) ── */}
        {showEdgeModal && (
          <div
            role="dialog"
            aria-modal="true"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 100,
              background: "rgba(15, 23, 42, 0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: 460,
                background: "#ffffff",
                borderRadius: 16,
                padding: "20px 22px",
                border: "1px solid #e2e8f0",
                boxShadow: "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                  Pilih Hubungan Variabel
                </h3>
                <button
                  onClick={() => {
                    setShowEdgeModal(false);
                    setPendingConnection(null);
                  }}
                  style={{
                    background: "#f1f5f9",
                    border: "none",
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#64748b",
                  }}
                >
                  <X size={14} />
                </button>
              </div>

              {/* ── 1-CLICK AI QUICK ACTION BANNER ── */}
              {aiRecommendation && (
                <div
                  style={{
                    background: "#f0fdf4",
                    border: "1.5px solid #a7f3d0",
                    borderRadius: 10,
                    padding: "10px 14px",
                    marginBottom: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Wand2 size={16} color="#059669" />
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#047857", textTransform: "uppercase" }}>
                        Saran AI:
                      </span>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                        {aiRecommendation.recommendedRelation}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => applyRelationship(aiRecommendation.recommendedRelation)}
                    style={{
                      background: "#00C988",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: 8,
                      padding: "7px 12px",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    ✓ Terapkan
                  </button>
                </div>
              )}

              {aiLoading && !aiRecommendation && (
                <div
                  style={{
                    background: "#f8fafc",
                    borderRadius: 10,
                    padding: "8px 12px",
                    marginBottom: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 12,
                    color: "#64748b",
                  }}
                >
                  <RefreshCw size={13} className="animate-spin" color="#00C988" />
                  <span>AI sedang mencocokkan relasi terbaik...</span>
                </div>
              )}

              {/* ── QUICK CLICK MENU OPTIONS (1-CLICK) ── */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
                {relationshipOptions.map((opt) => {
                  const isSelected = relationLabel === opt.id && !customRelation;
                  const isAiPick = aiRecommendation?.recommendedRelation === opt.id;
                  const IconComponent = opt.icon;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setRelationLabel(opt.id);
                        setCustomRelation("");
                        applyRelationship(opt.id); // 1-Click direct connect
                      }}
                      style={{
                        padding: "9px 12px",
                        borderRadius: 10,
                        border: "1px solid",
                        borderColor: isSelected ? "#00C988" : isAiPick ? "#a7f3d0" : "#e2e8f0",
                        background: isSelected ? "#f0fdf4" : isAiPick ? "#fafdfb" : "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        transition: "all 0.1s ease",
                        textAlign: "left",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <div
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: 6,
                            background: opt.bg,
                            border: `1px solid ${opt.border}`,
                            color: opt.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <IconComponent size={14} />
                        </div>

                        <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
                          {opt.title}
                        </span>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {isAiPick && (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              padding: "2px 6px",
                              borderRadius: 4,
                              background: "#059669",
                              color: "#ffffff",
                            }}
                          >
                            ★ AI
                          </span>
                        )}
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            padding: "2px 6px",
                            borderRadius: 4,
                            background: opt.bg,
                            color: opt.color,
                          }}
                        >
                          {opt.badge}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom Input (Optional) */}
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  placeholder="Atau ketik kustom..."
                  value={customRelation}
                  onChange={(e) => setCustomRelation(e.target.value)}
                  style={{
                    flex: 1,
                    height: 36,
                    padding: "0 12px",
                    borderRadius: 8,
                    border: "1px solid #cbd5e1",
                    fontSize: 12.5,
                    outline: "none",
                    background: "#f8fafc",
                  }}
                />
                {customRelation.trim() && (
                  <Button
                    size="sm"
                    variant="emerald"
                    onClick={() => applyRelationship(customRelation.trim())}
                  >
                    Gunakan
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>{/* end left canvas area */}

      {/* ── SPLIT SCREEN JOURNAL DOCUMENT VIEWER ── */}
      {splitReaderOpen && (
        <aside
          style={{
            width: "48%",
            minWidth: 420,
            maxWidth: 680,
            height: "100%",
            background: "#ffffff",
            borderLeft: "1.5px solid #cbd5e1",
            display: "flex",
            flexDirection: "column",
            zIndex: 40,
            boxShadow: "-8px 0 24px rgba(0, 0, 0, 0.08)",
            animation: "slideInRight 0.25s ease",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid #e2e8f0",
              background: "#f8fafc",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, overflow: "hidden" }}>
              <button
                type="button"
                onClick={() => setSplitReaderOpen(false)}
                style={{
                  background: "#ffffff",
                  border: "1px solid #cbd5e1",
                  borderRadius: 8,
                  width: 30,
                  height: 30,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#0f172a",
                  flexShrink: 0,
                }}
                title="Tutup Split Screen"
              >
                <X size={15} />
              </button>

              <div style={{ overflow: "hidden" }}>
                <h4
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: "#0f172a",
                    margin: 0,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={splitJournal?.title || ""}
                >
                  {splitJournal?.title || "Memuat PDF Jurnal..."}
                </h4>
                {splitTargetPage ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#059669" }}>
                      Halaman {splitTargetPage}
                    </span>
                    {splitJournal?.authors && (
                      <span style={{ fontSize: 11, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        • {splitJournal.authors}
                      </span>
                    )}
                  </div>
                ) : null}
              </div>
            </div>

            {/* View Mode Toggle: [📄 PDF Asli] [📑 Teks Ekstraksi] */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
              <div style={{ display: "flex", background: "#e2e8f0", padding: 2, borderRadius: 6 }}>
                <button
                  type="button"
                  onClick={() => setSplitViewTab("PDF")}
                  style={{
                    padding: "3px 8px",
                    fontSize: 11,
                    fontWeight: splitViewTab === "PDF" ? 700 : 500,
                    borderRadius: 4,
                    border: "none",
                    background: splitViewTab === "PDF" ? "#ffffff" : "transparent",
                    color: splitViewTab === "PDF" ? "#0f172a" : "#64748b",
                    cursor: "pointer",
                  }}
                >
                  PDF Asli
                </button>
                <button
                  type="button"
                  onClick={() => setSplitViewTab("TEXT")}
                  style={{
                    padding: "3px 8px",
                    fontSize: 11,
                    fontWeight: splitViewTab === "TEXT" ? 700 : 500,
                    borderRadius: 4,
                    border: "none",
                    background: splitViewTab === "TEXT" ? "#ffffff" : "transparent",
                    color: splitViewTab === "TEXT" ? "#0f172a" : "#64748b",
                    cursor: "pointer",
                  }}
                >
                  Teks
                </button>
              </div>

              {splitJournal?.id && (
                <Link
                  href={`/projects/${projectId}/journals/${splitJournal.id}`}
                  target="_blank"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 3,
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#0284c7",
                    background: "#f0f9ff",
                    border: "1px solid #bae6fd",
                    padding: "4px 8px",
                    borderRadius: 6,
                    textDecoration: "none",
                  }}
                  title="Buka Tab Penuh"
                >
                  <ExternalLink size={11} />
                </Link>
              )}
            </div>
          </div>

          {/* Targeted Quote Evidence Banner with Quick Copy & Search Info */}
          {splitTargetQuote && (
            <div
              style={{
                padding: "8px 14px",
                background: "#f0fdf4",
                borderBottom: "1.5px solid #a7f3d0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                fontSize: 11.5,
                color: "#166534",
                lineHeight: 1.4,
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 7, overflow: "hidden" }}>
                <Sparkles size={14} color="#059669" style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                  <span style={{ fontWeight: 700, color: "#047857" }}>
                    Kutipan Bukti di Halaman {splitTargetPage}:
                  </span>{" "}
                  <span style={{ fontStyle: "italic", background: "#fef08a", color: "#854d0e", padding: "1px 4px", borderRadius: 3, fontWeight: 600 }}>
                    "{splitTargetQuote}"
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(splitTargetQuote);
                  notify.success("Kutipan disalin! Tekan Ctrl+F di PDF untuk mencari instan.");
                }}
                style={{
                  flexShrink: 0,
                  fontSize: 10.5,
                  fontWeight: 700,
                  background: "#ffffff",
                  border: "1px solid #a7f3d0",
                  color: "#059669",
                  borderRadius: 5,
                  padding: "3px 7px",
                  cursor: "pointer",
                }}
                title="Salin kalimat kutipan untuk Ctrl+F di PDF"
              >
                Salin
              </button>
            </div>
          )}

          {/* Split Content: Original PDF Embed (Default) vs Extracted Text */}
          <div style={{ flex: 1, position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
            {splitLoading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", gap: 10, color: "#64748b" }}>
                <RefreshCw size={18} className="animate-spin" color="#00C988" />
                <span>Memuat naskah PDF asli...</span>
              </div>
            ) : splitViewTab === "PDF" ? (
              (() => {
                const fileName = splitJournal?.fileKey || (splitJournal?.filePath ? splitJournal.filePath.split(/[/\\]/).pop() : null);
                const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

                // Extract clean search phrase from quote to trigger native PDF search highlight
                let searchPhrase = "";
                if (splitTargetQuote) {
                  searchPhrase = splitTargetQuote
                    .replace(/[^\w\s]/gi, " ")
                    .replace(/\s+/g, " ")
                    .trim()
                    .split(" ")
                    .filter((w: string) => w.length > 2)
                    .slice(0, 4)
                    .join(" ");
                }

                const searchParam = searchPhrase ? `&search=${encodeURIComponent(searchPhrase)}` : "";
                const pdfSrc = fileName
                  ? `${baseUrl}/uploads/${fileName}#page=${splitTargetPage || 1}${searchParam}&zoom=page-width`
                  : null;

                if (!pdfSrc) {
                  return (
                    <div style={{ padding: 24, textAlign: "center", color: "#64748b" }}>
                      <FileText size={32} color="#cbd5e1" style={{ margin: "0 auto 8px" }} />
                      <p style={{ fontWeight: 600, color: "#0f172a" }}>File PDF belum diunggah</p>
                      <p style={{ fontSize: 12 }}>Beralih ke tab "Teks" untuk melihat hasil ekstraksi.</p>
                    </div>
                  );
                }

                return (
                  <iframe
                    key={`${pdfSrc}-${splitTargetPage}-${searchPhrase}`}
                    src={pdfSrc}
                    style={{
                      width: "100%",
                      height: "100%",
                      border: "none",
                      background: "#525659",
                    }}
                    title="Naskah Asli Dokumen PDF"
                  />
                );
              })()
            ) : (
              /* Sub-Bab Text Sections Viewer */
              <div
                id="split-document-scroll-container"
                style={{
                  height: "100%",
                  overflowY: "auto",
                  padding: "16px 18px",
                  background: "#ffffff",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                {splitJournal?.rawExtraction?.sections && splitJournal.rawExtraction.sections.length > 0 ? (
                  splitJournal.rawExtraction.sections.map((sec: any, sIdx: number) => {
                    const isTargetPage = sec.page === splitTargetPage;
                    const textLower = (sec.content || "").toLowerCase();
                    const quoteLower = (splitTargetQuote || "").toLowerCase().slice(0, 30);
                    const hasMatchingQuote = quoteLower && textLower.includes(quoteLower);

                    return (
                      <div
                        key={sIdx}
                        id={`split-sec-${sIdx}`}
                        style={{
                          borderRadius: 8,
                          border: isTargetPage || hasMatchingQuote ? "2px solid #00C988" : "1px solid #e2e8f0",
                          background: hasMatchingQuote ? "#f0fdf4" : isTargetPage ? "#fafdfb" : "#ffffff",
                          boxShadow: hasMatchingQuote ? "0 0 16px rgba(0, 201, 136, 0.2)" : "none",
                          padding: 14,
                          transition: "all 0.2s ease",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>
                            {sec.heading || `Bagian ${sIdx + 1}`}
                          </span>
                          <span style={{ fontSize: 10, fontWeight: 600, background: isTargetPage ? "#00C988" : "#f1f5f9", color: isTargetPage ? "#ffffff" : "#475569", padding: "1px 6px", borderRadius: 4 }}>
                            Halaman {sec.page || 1}
                          </span>
                        </div>

                        {hasMatchingQuote && (
                          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#059669", color: "#ffffff", padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700, marginBottom: 8 }}>
                            <Sparkles size={11} />
                            <span>KUTIPAN TERPILIH DI NODE KERANGKA</span>
                          </div>
                        )}

                        <div style={{ fontSize: 12.5, color: "#334155", lineHeight: 1.65, whiteSpace: "pre-line" }}>
                          {(() => {
                            const rawContent = sec.content || "";
                            if (!splitTargetQuote || splitTargetQuote.trim().length < 5) return rawContent;
                            const qSnippet = splitTargetQuote.trim().slice(0, 35).toLowerCase();
                            const idx = rawContent.toLowerCase().indexOf(qSnippet);
                            if (idx === -1) return rawContent;
                            const matchLen = Math.min(splitTargetQuote.trim().length, rawContent.length - idx);
                            const before = rawContent.slice(0, idx);
                            const match = rawContent.slice(idx, idx + matchLen);
                            const after = rawContent.slice(idx + matchLen);
                            return (
                              <>
                                {before}
                                <mark style={{ background: "#fef08a", color: "#854d0e", fontWeight: 700, padding: "1px 4px", borderRadius: 3, border: "1px solid #eab308" }}>
                                  {match}
                                </mark>
                                {after}
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ padding: 16, color: "#64748b", fontSize: 13, lineHeight: 1.6 }}>
                    <p style={{ fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>Abstrak:</p>
                    <p>{splitJournal?.abstract || splitJournal?.fullText || "Teks lengkap dokumen sedang diproses."}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>
      )}

      {/* ── MODAL DIALOG: DRAF NASKAH SKRIPSI LENGKAP (BAB 1, 2, 3) ── */}
      {showDraftModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.55)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: 20,
          }}
          onClick={() => setShowDraftModal(false)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: 18,
              width: "100%",
              maxWidth: 860,
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.3)",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div
              style={{
                padding: "16px 22px",
                borderBottom: "1px solid #e2e8f0",
                background: "#f8fafc",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 14,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "#ecfdf5",
                    border: "1px solid #a7f3d0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#059669",
                    flexShrink: 0,
                  }}
                >
                  <BookOpenCheck size={20} />
                </div>
                <div style={{ overflow: "hidden" }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    Draf Narasi Naskah Skripsi
                  </h3>
                  <span style={{ fontSize: 11.5, color: "#64748b" }}>
                    Disintesis otomatis dari node kerangka & bukti kutipan jurnal
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                {draftData && (
                  <button
                    type="button"
                    onClick={handleCopyDraftText}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      background: copiedDraft ? "#059669" : "#00C988",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: 8,
                      padding: "8px 14px",
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {copiedDraft ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedDraft ? "Tersalin ke Clipboard!" : "Salin ke Word"}</span>
                  </button>
                )}

                <button
                  onClick={() => setShowDraftModal(false)}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #cbd5e1",
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#64748b",
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Sub-Header Tabs */}
            {draftData && (
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  padding: "10px 22px",
                  background: "#ffffff",
                  borderBottom: "1px solid #f1f5f9",
                  overflowX: "auto",
                }}
              >
                {[
                  { id: "ALL", label: "📄 Seluruh Naskah" },
                  { id: "BAB1", label: "Bab 1: Latar Belakang" },
                  { id: "BAB2", label: "Bab 2: Kerangka Pemikiran" },
                  { id: "BAB3", label: "Bab 3: Hipotesis & Metode" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveDraftTab(tab.id as any)}
                    style={{
                      fontSize: 12,
                      fontWeight: activeDraftTab === tab.id ? 700 : 500,
                      padding: "5px 12px",
                      borderRadius: 6,
                      border: "none",
                      background: activeDraftTab === tab.id ? "#0f172a" : "#f1f5f9",
                      color: activeDraftTab === tab.id ? "#ffffff" : "#475569",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            {/* Modal Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px", background: "#f8fafc" }}>
              {generatingDraft ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, gap: 14 }}>
                  <RefreshCw size={28} className="animate-spin" color="#00C988" />
                  <div style={{ textAlign: "center" }}>
                    <h4 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 4px" }}>
                      AI Sedang Menyusun Draf Narasi Skripsi...
                    </h4>
                    <p style={{ fontSize: 12.5, color: "#64748b", margin: 0 }}>
                      Menerapkan format sitasi akademik APA, sintesis landasan teori, dan perumusan hipotesis.
                    </p>
                  </div>
                </div>
              ) : draftData ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 780, margin: "0 auto" }}>
                  {/* Judul Riset Banner */}
                  <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "16px 20px" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#059669", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Judul Penelitian
                    </span>
                    <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", margin: "4px 0 0", lineHeight: 1.4 }}>
                      {draftData.judul || project?.title}
                    </h2>
                  </div>

                  {/* BAB 1 */}
                  {(activeDraftTab === "ALL" || activeDraftTab === "BAB1") && draftData.bab1LatarBelakang && (
                    <section style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "20px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, borderBottom: "1px solid #f1f5f9", paddingBottom: 10 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, background: "#ecfdf5", color: "#059669", padding: "2px 8px", borderRadius: 4 }}>
                          BAB 1
                        </span>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                          {draftData.bab1LatarBelakang.judulBagian}
                        </h3>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13.5, color: "#334155", lineHeight: 1.8, textAlign: "justify" }}>
                        {(draftData.bab1LatarBelakang.paragraf || []).map((p: string, pIdx: number) => (
                          <p key={pIdx} style={{ margin: 0, textIndent: "2em" }}>
                            {p}
                          </p>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* BAB 2 */}
                  {(activeDraftTab === "ALL" || activeDraftTab === "BAB2") && draftData.bab2KerangkaPemikiran && (
                    <section style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "20px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, borderBottom: "1px solid #f1f5f9", paddingBottom: 10 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, background: "#f0f9ff", color: "#0284c7", padding: "2px 8px", borderRadius: 4 }}>
                          BAB 2
                        </span>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                          {draftData.bab2KerangkaPemikiran.judulBagian}
                        </h3>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13.5, color: "#334155", lineHeight: 1.8, textAlign: "justify" }}>
                        {(draftData.bab2KerangkaPemikiran.paragraf || []).map((p: string, pIdx: number) => (
                          <p key={pIdx} style={{ margin: 0, textIndent: "2em" }}>
                            {p}
                          </p>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* BAB 3 */}
                  {(activeDraftTab === "ALL" || activeDraftTab === "BAB3") && draftData.bab3HipotesisMetode && (
                    <section style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "20px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, borderBottom: "1px solid #f1f5f9", paddingBottom: 10 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, background: "#fef3c7", color: "#b45309", padding: "2px 8px", borderRadius: 4 }}>
                          BAB 3
                        </span>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                          {draftData.bab3HipotesisMetode.judulBagian}
                        </h3>
                      </div>

                      {draftData.bab3HipotesisMetode.hipotesis && draftData.bab3HipotesisMetode.hipotesis.length > 0 && (
                        <div style={{ marginBottom: 16 }}>
                          <h4 style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>
                            Rumusan Hipotesis Penelitian:
                          </h4>
                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {draftData.bab3HipotesisMetode.hipotesis.map((h: string, hIdx: number) => (
                              <div key={hIdx} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#1e293b", fontWeight: 600 }}>
                                {h}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {draftData.bab3HipotesisMetode.justifikasiMetode && (
                        <div>
                          <h4 style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>
                            Pendekatan Metodologi:
                          </h4>
                          <p style={{ fontSize: 13.5, color: "#334155", lineHeight: 1.75, margin: 0, textAlign: "justify" }}>
                            {draftData.bab3HipotesisMetode.justifikasiMetode}
                          </p>
                        </div>
                      )}
                    </section>
                  )}

                  {/* DAFTAR PUSTAKA */}
                  {activeDraftTab === "ALL" && draftData.daftarPustakaRujukan && draftData.daftarPustakaRujukan.length > 0 && (
                    <section style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "20px 24px" }}>
                      <h3 style={{ fontSize: 14.5, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>
                        Daftar Pustaka Rujukan (APA Style)
                      </h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12.5, color: "#475569", lineHeight: 1.6 }}>
                        {draftData.daftarPustakaRujukan.map((refItem: string, rIdx: number) => (
                          <div key={rIdx} style={{ paddingLeft: "2em", textIndent: "-2em" }}>
                            {refItem}
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: 40, color: "#64748b" }}>
                  <p>Klik tombol di bawah untuk membuat draf naskah skripsi.</p>
                  <Button variant="emerald" onClick={handleGenerateDraft}>
                    Buat Draf Sekarang
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
