"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Image as ImageIcon,
  Grid,
  GitPullRequest,
  UploadCloud,
  X,
  Plus,
  Trash2,
  Check,
  RotateCcw,
  Layers,
  ArrowRight,
  ArrowDown,
  Split,
  Combine,
  Square,
  Circle,
  Diamond,
  Database,
  MoveDown,
  MoveRight,
  CornerDownRight,
  Table as TableIcon,
  Columns,
  Rows,
  Sparkles,
  Maximize2,
  Minimize2,
  Smartphone,
  Monitor,
  Box,
  Wand2,
} from "lucide-react";
import { getToken, TOKEN_KEY } from "@/lib/api-client";

interface CustomSubChapter {
  id: string;
  chapter: string;
  title: string;
  content: string;
}

interface InsertMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "table" | "diagram" | "image";
  activeTabKey: string;
  customSubChapters?: CustomSubChapter[];
  onInsertContent: (targetField: string, markdownSnippet: string) => void;
}

// ── Table Cell Interface ──
interface TableCellData {
  text: string;
  colSpan: number;
  rowSpan: number;
  mergedInto?: { r: number; c: number };
}

// ── Flowchart Node Interface (Canva-style Position & Size) ──
type FlowShapeType = "terminator" | "process" | "decision" | "data" | "connector" | "database";

interface FlowNode {
  id: string;
  type: FlowShapeType;
  text: string;
  subtext?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  arrowToNext?: "down" | "right" | "none";
  arrowLabel?: string;
}

export function InsertMediaModal({
  isOpen,
  onClose,
  initialTab = "table",
  activeTabKey,
  customSubChapters = [],
  onInsertContent,
}: InsertMediaModalProps) {
  const [activeTab, setActiveTab] = useState<"table" | "diagram" | "image">(initialTab);

  // Sync initial tab when modal opens or initialTab prop changes
  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Determine default target destination based on active tab
  const getDefaultTarget = () => {
    if (activeTabKey === "bab3") return "bab3.desainPenelitian";
    if (activeTabKey === "bab1") return "bab1.latarBelakang";
    return "bab2.kerangkaKonseptual";
  };

  const [targetField, setTargetField] = useState<string>(getDefaultTarget());

  // ── 1. STATE UNGGAH GAMBAR ──
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [imageCaption, setImageCaption] = useState<string>("Gambar 2.1: Diagram Alur Kerangka Penelitian");
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ── 2. STATE TABEL BUILDER (RESIZABLE COLUMNS + MERGE CELLS) ──
  const [tableCaption, setTableCaption] = useState<string>("Tabel 3.1: Matriks Instrumen Penelitian");
  const [selectedCell, setSelectedCell] = useState<{ section: "header" | "body"; r: number; c: number } | null>(null);

  // Grid hover picker state (Docs style 8x8)
  const [hoverGrid, setHoverGrid] = useState<{ rows: number; cols: number }>({ rows: 0, cols: 0 });
  const [showGridPicker, setShowGridPicker] = useState<boolean>(false);

  // Column widths state (in percentage summing to 100%)
  const [colWidths, setColWidths] = useState<number[]>([10, 35, 35, 20]);
  const isResizingCol = useRef<{ colIdx: number; startX: number; startWidths: number[]; tableWidth: number } | null>(null);

  const [headerRows, setHeaderRows] = useState<TableCellData[][]>([
    [
      { text: "No", colSpan: 1, rowSpan: 1 },
      { text: "Variabel Penelitian", colSpan: 1, rowSpan: 1 },
      { text: "Indikator Empiris", colSpan: 1, rowSpan: 1 },
      { text: "Skala Pengukuran", colSpan: 1, rowSpan: 1 },
    ],
  ]);

  const [bodyRows, setBodyRows] = useState<TableCellData[][]>([
    [
      { text: "1", colSpan: 1, rowSpan: 1 },
      { text: "Kemudahan Penggunaan (X1)", colSpan: 1, rowSpan: 1 },
      { text: "Navigasi jelas dan responsif", colSpan: 1, rowSpan: 1 },
      { text: "Likert 1-5", colSpan: 1, rowSpan: 1 },
    ],
    [
      { text: "2", colSpan: 1, rowSpan: 1 },
      { text: "Kemudahan Penggunaan (X1)", colSpan: 1, rowSpan: 1 },
      { text: "Waktu muat halaman cepat", colSpan: 1, rowSpan: 1 },
      { text: "Likert 1-5", colSpan: 1, rowSpan: 1 },
    ],
    [
      { text: "3", colSpan: 1, rowSpan: 1 },
      { text: "Kualitas Informasi (X2)", colSpan: 1, rowSpan: 1 },
      { text: "Akurasi penyajian data", colSpan: 1, rowSpan: 1 },
      { text: "Likert 1-5", colSpan: 1, rowSpan: 1 },
    ],
    [
      { text: "4", colSpan: 1, rowSpan: 1 },
      { text: "Kepuasan Pengguna (Y)", colSpan: 1, rowSpan: 1 },
      { text: "Pengguna merekomendasikan sistem", colSpan: 1, rowSpan: 1 },
      { text: "Likert 1-5", colSpan: 1, rowSpan: 1 },
    ],
  ]);

  // Column Drag & Drop Resizing Logic
  const handleStartColResize = (colIdx: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const tableEl = (e.currentTarget.closest("table") as HTMLElement) || (e.currentTarget.parentElement?.parentElement as HTMLElement);
    const tableWidth = tableEl ? tableEl.getBoundingClientRect().width : 700;

    isResizingCol.current = {
      colIdx,
      startX: e.clientX,
      startWidths: [...colWidths],
      tableWidth,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isResizingCol.current) return;
      const { colIdx: c, startX, startWidths, tableWidth: tW } = isResizingCol.current;
      const deltaPx = moveEvent.clientX - startX;
      const deltaPercent = (deltaPx / tW) * 100;

      const newWidths = [...startWidths];
      const nextC = c + 1 < newWidths.length ? c + 1 : null;
      const minPct = 5;

      if (nextC !== null) {
        const combined = startWidths[c] + startWidths[nextC];
        let newCur = Math.max(minPct, Math.min(combined - minPct, startWidths[c] + deltaPercent));
        let newNext = combined - newCur;

        newWidths[c] = Math.round(newCur * 10) / 10;
        newWidths[nextC] = Math.round(newNext * 10) / 10;
      } else {
        newWidths[c] = Math.max(minPct, Math.round((startWidths[c] + deltaPercent) * 10) / 10);
      }

      setColWidths(newWidths);
    };

    const handleMouseUp = () => {
      isResizingCol.current = null;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // Handle Docs-style Grid Picker Create Table
  const handleCreateGridTable = (cols: number, rows: number) => {
    const newHeaders: TableCellData[][] = [
      new Array(cols).fill(null).map((_, i) => ({ text: `Kolom ${i + 1}`, colSpan: 1, rowSpan: 1 })),
    ];
    const newBody: TableCellData[][] = [];
    for (let r = 0; r < rows; r++) {
      newBody.push(
        new Array(cols).fill(null).map(() => ({ text: "-", colSpan: 1, rowSpan: 1 }))
      );
    }
    setHeaderRows(newHeaders);
    setBodyRows(newBody);
    setShowGridPicker(false);
    setSelectedCell(null);

    // Recompute equal column percentages
    const equalWidth = Math.round((100 / cols) * 10) / 10;
    setColWidths(new Array(cols).fill(equalWidth));
  };

  // Preset Tables
  const handleSelectTablePreset = (type: "instrumen" | "jadwal" | "komparasi") => {
    if (type === "instrumen") {
      setTableCaption("Tabel 3.1: Matriks Kisi-Kisi Instrumen Penelitian");
      setColWidths([10, 35, 35, 20]);
      setHeaderRows([
        [
          { text: "No", colSpan: 1, rowSpan: 1 },
          { text: "Variabel", colSpan: 1, rowSpan: 1 },
          { text: "Indikator", colSpan: 1, rowSpan: 1 },
          { text: "Skala Pengukuran", colSpan: 1, rowSpan: 1 },
        ],
      ]);
      setBodyRows([
        [
          { text: "1", colSpan: 1, rowSpan: 1 },
          { text: "Kemudahan Penggunaan (X1)", colSpan: 1, rowSpan: 1 },
          { text: "Navigasi jelas dan responsif", colSpan: 1, rowSpan: 1 },
          { text: "Likert 1-5", colSpan: 1, rowSpan: 1 },
        ],
        [
          { text: "2", colSpan: 1, rowSpan: 1 },
          { text: "Kualitas Informasi (X2)", colSpan: 1, rowSpan: 1 },
          { text: "Akurasi penyajian data", colSpan: 1, rowSpan: 1 },
          { text: "Likert 1-5", colSpan: 1, rowSpan: 1 },
        ],
        [
          { text: "3", colSpan: 1, rowSpan: 1 },
          { text: "Kepuasan Pengguna (Y)", colSpan: 1, rowSpan: 1 },
          { text: "Pengguna merekomendasikan sistem", colSpan: 1, rowSpan: 1 },
          { text: "Likert 1-5", colSpan: 1, rowSpan: 1 },
        ],
      ]);
    } else if (type === "jadwal") {
      setTableCaption("Tabel 3.2: Jadwal Rencana Pelaksanaan Penelitian");
      setColWidths([8, 44, 12, 12, 12, 12]);
      setHeaderRows([
        [
          { text: "No", colSpan: 1, rowSpan: 2 },
          { text: "Tahapan Kegiatan", colSpan: 1, rowSpan: 2 },
          { text: "Bulan Pelaksanaan", colSpan: 4, rowSpan: 1 },
        ],
        [
          { text: "Bulan 1", colSpan: 1, rowSpan: 1 },
          { text: "Bulan 2", colSpan: 1, rowSpan: 1 },
          { text: "Bulan 3", colSpan: 1, rowSpan: 1 },
          { text: "Bulan 4", colSpan: 1, rowSpan: 1 },
        ],
      ]);
      setBodyRows([
        [
          { text: "1", colSpan: 1, rowSpan: 1 },
          { text: "Studi Literatur & Penyusunan Proposal", colSpan: 1, rowSpan: 1 },
          { text: "V", colSpan: 1, rowSpan: 1 },
          { text: "-", colSpan: 1, rowSpan: 1 },
          { text: "-", colSpan: 1, rowSpan: 1 },
          { text: "-", colSpan: 1, rowSpan: 1 },
        ],
        [
          { text: "2", colSpan: 1, rowSpan: 1 },
          { text: "Pengumpulan Data Lapangan", colSpan: 1, rowSpan: 1 },
          { text: "-", colSpan: 1, rowSpan: 1 },
          { text: "V", colSpan: 1, rowSpan: 1 },
          { text: "V", colSpan: 1, rowSpan: 1 },
          { text: "-", colSpan: 1, rowSpan: 1 },
        ],
        [
          { text: "3", colSpan: 1, rowSpan: 1 },
          { text: "Analisis Data & Penulisan Laporan", colSpan: 1, rowSpan: 1 },
          { text: "-", colSpan: 1, rowSpan: 1 },
          { text: "-", colSpan: 1, rowSpan: 1 },
          { text: "V", colSpan: 1, rowSpan: 1 },
          { text: "V", colSpan: 1, rowSpan: 1 },
        ],
      ]);
    } else if (type === "komparasi") {
      setTableCaption("Tabel 2.1: Matriks Perbandingan Penelitian Terdahulu");
      setColWidths([8, 23, 23, 23, 23]);
      setHeaderRows([
        [
          { text: "No", colSpan: 1, rowSpan: 1 },
          { text: "Peneliti & Tahun", colSpan: 1, rowSpan: 1 },
          { text: "Metode / Algoritma", colSpan: 1, rowSpan: 1 },
          { text: "Kelebihan", colSpan: 1, rowSpan: 1 },
          { text: "Hasil / Akurasi", colSpan: 1, rowSpan: 1 },
        ],
      ]);
      setBodyRows([
        [
          { text: "1", colSpan: 1, rowSpan: 1 },
          { text: "Rahman dkk. (2023)", colSpan: 1, rowSpan: 1 },
          { text: "Support Vector Machine", colSpan: 1, rowSpan: 1 },
          { text: "Cepat pada dataset terstruktur", colSpan: 1, rowSpan: 1 },
          { text: "Akurasi 86.5%", colSpan: 1, rowSpan: 1 },
        ],
        [
          { text: "2", colSpan: 1, rowSpan: 1 },
          { text: "Pratama (2024)", colSpan: 1, rowSpan: 1 },
          { text: "Random Forest Classifier", colSpan: 1, rowSpan: 1 },
          { text: "Stabil terhadap noise", colSpan: 1, rowSpan: 1 },
          { text: "Akurasi 90.2%", colSpan: 1, rowSpan: 1 },
        ],
      ]);
    }
    setSelectedCell(null);
  };

  // Merge Column Right (Colspan + 1)
  const handleMergeColspan = () => {
    if (!selectedCell) return;
    const { section, r, c } = selectedCell;
    const rows = section === "header" ? [...headerRows] : [...bodyRows];
    const currentRow = [...rows[r]];
    const cell = currentRow[c];
    if (!cell || c + cell.colSpan >= currentRow.length) return;

    const nextCell = currentRow[c + cell.colSpan];
    if (!nextCell || nextCell.mergedInto) return;

    cell.colSpan = cell.colSpan + nextCell.colSpan;
    nextCell.mergedInto = { r, c };

    if (section === "header") setHeaderRows(rows);
    else setBodyRows(rows);
  };

  // Merge Row Down (Rowspan + 1)
  const handleMergeRowspan = () => {
    if (!selectedCell) return;
    const { section, r, c } = selectedCell;
    const rows = section === "header" ? [...headerRows] : [...bodyRows];
    if (r + 1 >= rows.length) return;

    const cell = rows[r][c];
    const nextRowCell = rows[r + cell.rowSpan]?.[c];
    if (!cell || !nextRowCell || nextRowCell.mergedInto) return;

    cell.rowSpan = cell.rowSpan + nextRowCell.rowSpan;
    nextRowCell.mergedInto = { r, c };

    if (section === "header") setHeaderRows(rows);
    else setBodyRows(rows);
  };

  // Split / Unmerge Cell
  const handleUnmerge = () => {
    if (!selectedCell) return;
    const { section, r, c } = selectedCell;
    const rows = section === "header" ? [...headerRows] : [...bodyRows];
    const cell = rows[r]?.[c];
    if (!cell) return;

    for (let ri = 0; ri < rows.length; ri++) {
      for (let ci = 0; ci < rows[ri].length; ci++) {
        const item = rows[ri][ci];
        if (item.mergedInto && item.mergedInto.r === r && item.mergedInto.c === c) {
          delete item.mergedInto;
        }
      }
    }
    cell.colSpan = 1;
    cell.rowSpan = 1;

    if (section === "header") setHeaderRows(rows);
    else setBodyRows(rows);
  };

  // Add Column
  const handleAddColumn = () => {
    const newHeaders = headerRows.map((row, rIdx) => [
      ...row,
      { text: `Kolom ${row.length + 1}`, colSpan: 1, rowSpan: 1 },
    ]);
    const newBody = bodyRows.map((row) => [
      ...row,
      { text: "-", colSpan: 1, rowSpan: 1 },
    ]);
    setHeaderRows(newHeaders);
    setBodyRows(newBody);

    // Adjust column widths
    const totalCols = (newHeaders[0] || []).length;
    const equalWidth = Math.round((100 / totalCols) * 10) / 10;
    setColWidths(new Array(totalCols).fill(equalWidth));
  };

  // Add Row
  const handleAddRow = () => {
    const cols = headerRows[0]?.length || 4;
    const newRow: TableCellData[] = new Array(cols)
      .fill(null)
      .map(() => ({ text: "-", colSpan: 1, rowSpan: 1 }));
    setBodyRows([...bodyRows, newRow]);
  };

  // Delete Row
  const handleDeleteRow = () => {
    if (bodyRows.length <= 1) return;
    setBodyRows(bodyRows.slice(0, -1));
  };

  // Update Cell Text
  const handleUpdateCellText = (section: "header" | "body", r: number, c: number, text: string) => {
    if (section === "header") {
      const updated = [...headerRows];
      updated[r][c].text = text;
      setHeaderRows(updated);
    } else {
      const updated = [...bodyRows];
      updated[r][c].text = text;
      setBodyRows(updated);
    }
  };

  // Insert Table to Proposal Sub-bab
  const handleInsertTable = () => {
    let htmlTableSnippet = `\n\n<table border="1" cellpadding="6" cellspacing="0" data-caption="${tableCaption}" style="width: 100%; border-collapse: collapse; border: 1px solid #000000; font-family: 'Times New Roman', serif; font-size: 11pt;">\n`;

    // Add colgroup with custom column widths
    if (colWidths.length > 0) {
      htmlTableSnippet += `  <colgroup>\n`;
      colWidths.forEach((w) => {
        htmlTableSnippet += `    <col style="width: ${w}%;" />\n`;
      });
      htmlTableSnippet += `  </colgroup>\n`;
    }

    htmlTableSnippet += `  <thead>\n`;
    for (const row of headerRows) {
      htmlTableSnippet += `    <tr>\n`;
      row.forEach((cell, cIdx) => {
        if (!cell.mergedInto) {
          const cs = cell.colSpan > 1 ? ` colspan="${cell.colSpan}"` : "";
          const rs = cell.rowSpan > 1 ? ` rowspan="${cell.rowSpan}"` : "";
          const widthStyle = colWidths[cIdx] ? ` width: ${colWidths[cIdx]}%;` : "";
          htmlTableSnippet += `      <th${cs}${rs} style="border: 1px solid #000000; padding: 6px 8px; font-weight: bold; text-align: center; background-color: #F8FAFC;${widthStyle}">${cell.text}</th>\n`;
        }
      });
      htmlTableSnippet += `    </tr>\n`;
    }
    htmlTableSnippet += `  </thead>\n  <tbody>\n`;
    for (const row of bodyRows) {
      htmlTableSnippet += `    <tr>\n`;
      row.forEach((cell, cIdx) => {
        if (!cell.mergedInto) {
          const cs = cell.colSpan > 1 ? ` colspan="${cell.colSpan}"` : "";
          const rs = cell.rowSpan > 1 ? ` rowspan="${cell.rowSpan}"` : "";
          const widthStyle = colWidths[cIdx] ? ` width: ${colWidths[cIdx]}%;` : "";
          htmlTableSnippet += `      <td${cs}${rs} style="border: 1px solid #000000; padding: 6px 8px; text-align: left;${widthStyle}">${cell.text}</td>\n`;
        }
      });
      htmlTableSnippet += `    </tr>\n`;
    }
    htmlTableSnippet += `  </tbody>\n</table>\n\n`;

    onInsertContent(targetField, htmlTableSnippet);
    onClose();
  };

  // ── 3. STATE STUDIO FLOWCHART (CANVA-STYLE FREEFORM DRAG & DROP + AUTO-TIDY) ──
  const [diagramCaption, setDiagramCaption] = useState<string>("Gambar 3.1: Diagram Alur Metodologi Penelitian");
  const [canvasRatio, setCanvasRatio] = useState<"portrait" | "landscape" | "square">("portrait");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>("n1");

  // Get current canvas dimensions based on ratio
  const getCanvasDimensions = () => {
    if (canvasRatio === "landscape") return { w: 780, h: 460 };
    if (canvasRatio === "square") return { w: 600, h: 600 };
    return { w: 560, h: 700 }; // portrait
  };

  const [flowNodes, setFlowNodes] = useState<FlowNode[]>([
    { id: "n1", type: "terminator", text: "Mulai Penelitian", x: 150, y: 40, width: 260, height: 44, arrowToNext: "down" },
    { id: "n2", type: "process", text: "Identifikasi Masalah & Studi Literatur", subtext: "Eksplorasi jurnal IEEE/Scopus", x: 150, y: 130, width: 260, height: 48, arrowToNext: "down" },
    { id: "n3", type: "data", text: "Pengumpulan Data Lapangan", subtext: "Kuesioner & dataset empiris", x: 150, y: 225, width: 260, height: 48, arrowToNext: "down" },
    { id: "n4", type: "decision", text: "Apakah Data Valid & Lengkap?", x: 150, y: 320, width: 260, height: 56, arrowToNext: "down", arrowLabel: "Ya" },
    { id: "n5", type: "process", text: "Pelatihan & Evaluasi Model", x: 150, y: 420, width: 260, height: 44, arrowToNext: "down" },
    { id: "n6", type: "terminator", text: "Selesai (Penarikan Kesimpulan)", x: 150, y: 510, width: 260, height: 44, arrowToNext: "none" },
  ]);

  // Canva Drag & Drop State
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Mouse Down on Shape
  const handleNodeMouseDown = (nodeId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedNodeId(nodeId);
    setDraggingNodeId(nodeId);

    const node = flowNodes.find((n) => n.id === nodeId);
    if (node && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const { w: svgW, h: svgH } = getCanvasDimensions();
      const scaleX = svgW / rect.width;
      const scaleY = svgH / rect.height;

      const clickX = (e.clientX - rect.left) * scaleX;
      const clickY = (e.clientY - rect.top) * scaleY;

      dragOffset.current = {
        x: clickX - node.x,
        y: clickY - node.y,
      };
    }
  };

  // Mouse Move on Canvas
  const handleCanvasMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!draggingNodeId || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const { w: svgW, h: svgH } = getCanvasDimensions();
    const scaleX = svgW / rect.width;
    const scaleY = svgH / rect.height;

    const curX = (e.clientX - rect.left) * scaleX - dragOffset.current.x;
    const curY = (e.clientY - rect.top) * scaleY - dragOffset.current.y;

    setFlowNodes((prev) =>
      prev.map((n) => {
        if (n.id !== draggingNodeId) return n;
        const clampedX = Math.max(10, Math.min(svgW - n.width - 10, Math.round(curX)));
        const clampedY = Math.max(10, Math.min(svgH - n.height - 10, Math.round(curY)));
        return { ...n, x: clampedX, y: clampedY };
      })
    );
  };

  // Mouse Up on Canvas
  const handleCanvasMouseUp = () => {
    setDraggingNodeId(null);
  };

  // ✨ Auto-Tidy / Rapikan Otomatis (Canva-like Smart Alignment)
  const handleAutoTidy = () => {
    const { w: svgW, h: svgH } = getCanvasDimensions();
    const count = flowNodes.length;
    if (count === 0) return;

    if (canvasRatio === "landscape" && count <= 5) {
      // Horizontal symmetrical flow for landscape
      const nodeW = Math.min(150, Math.floor((svgW - 80 - (count - 1) * 30) / count));
      const nodeH = 46;
      const totalW = count * nodeW + (count - 1) * 30;
      const startX = Math.max(25, Math.floor((svgW - totalW) / 2));
      const midY = Math.floor((svgH - nodeH) / 2);

      setFlowNodes((prev) =>
        prev.map((n, idx) => ({
          ...n,
          x: startX + idx * (nodeW + 30),
          y: midY,
          width: nodeW,
          height: nodeH,
          arrowToNext: idx < count - 1 ? "right" : "none",
        }))
      );
    } else {
      // Symmetrical vertical flow
      const nodeW = Math.min(260, svgW - 80);
      const nodeH = 46;
      const startY = 36;
      const usableH = svgH - 72;
      const gap = count > 1 ? Math.min(50, Math.max(20, Math.floor((usableH - count * nodeH) / (count - 1)))) : 30;
      const centerX = Math.floor((svgW - nodeW) / 2);

      setFlowNodes((prev) =>
        prev.map((n, idx) => ({
          ...n,
          x: centerX,
          y: startY + idx * (nodeH + gap),
          width: nodeW,
          height: nodeH,
          arrowToNext: idx < count - 1 ? "down" : "none",
        }))
      );
    }
  };

  // Add Flowchart Shape Node
  const handleAddFlowNode = (type: FlowShapeType) => {
    const id = `node_${Date.now()}`;
    const defaultLabels: Record<FlowShapeType, string> = {
      terminator: "Mulai / Selesai",
      process: "Langkah / Proses Baru",
      decision: "Kondisi Keputusan?",
      data: "Input / Output Data",
      connector: "Konektor (A)",
      database: "Penyimpanan Database",
    };

    const { w: svgW, h: svgH } = getCanvasDimensions();
    const nodeW = 240;
    const nodeH = type === "decision" ? 54 : 46;

    // Place near center or below last node
    const lastNode = flowNodes[flowNodes.length - 1];
    const newY = lastNode ? Math.min(svgH - nodeH - 15, lastNode.y + lastNode.height + 25) : 50;
    const newX = Math.floor((svgW - nodeW) / 2);

    setFlowNodes([
      ...flowNodes,
      {
        id,
        type,
        text: defaultLabels[type],
        x: newX,
        y: newY,
        width: nodeW,
        height: nodeH,
        arrowToNext: "down",
      },
    ]);
    setSelectedNodeId(id);
  };

  // Delete Flow Node
  const handleDeleteFlowNode = (id: string) => {
    if (flowNodes.length <= 1) return;
    setFlowNodes(flowNodes.filter((n) => n.id !== id));
    if (selectedNodeId === id) setSelectedNodeId(flowNodes[0]?.id || null);
  };

  // Load Template Flowchart
  const handleLoadFlowTemplate = (template: "skripsi" | "ptk" | "sdlc") => {
    const { w: svgW, h: svgH } = getCanvasDimensions();
    const cx = Math.floor((svgW - 260) / 2);

    if (template === "skripsi") {
      setDiagramCaption("Gambar 3.1: Diagram Alur Metodologi Penelitian");
      setFlowNodes([
        { id: "n1", type: "terminator", text: "Mulai Penelitian", x: cx, y: 35, width: 260, height: 44, arrowToNext: "down" },
        { id: "n2", type: "process", text: "Studi Literatur & Perumusan Masalah", x: cx, y: 110, width: 260, height: 46, arrowToNext: "down" },
        { id: "n3", type: "data", text: "Pengumpulan Data & Sampling", x: cx, y: 190, width: 260, height: 46, arrowToNext: "down" },
        { id: "n4", type: "decision", text: "Uji Validitas & Reliabilitas Lolos?", x: cx, y: 270, width: 260, height: 54, arrowToNext: "down", arrowLabel: "Ya" },
        { id: "n5", type: "process", text: "Analisis Data & Pengujian Hipotesis", x: cx, y: 360, width: 260, height: 46, arrowToNext: "down" },
        { id: "n6", type: "terminator", text: "Selesai (Penarikan Kesimpulan)", x: cx, y: 440, width: 260, height: 44, arrowToNext: "none" },
      ]);
    } else if (template === "ptk") {
      setDiagramCaption("Gambar 3.2: Bagan Siklus Penelitian Tindakan Kelas (PTK)");
      setFlowNodes([
        { id: "p1", type: "terminator", text: "Kondisi Awal (Pra-Siklus)", x: cx, y: 35, width: 260, height: 44, arrowToNext: "down" },
        { id: "p2", type: "process", text: "Perencanaan Tindakan (Siklus I)", x: cx, y: 110, width: 260, height: 46, arrowToNext: "down" },
        { id: "p3", type: "process", text: "Pelaksanaan & Observasi Kelas", x: cx, y: 190, width: 260, height: 46, arrowToNext: "down" },
        { id: "p4", type: "process", text: "Refleksi Awal", x: cx, y: 270, width: 260, height: 46, arrowToNext: "down" },
        { id: "p5", type: "decision", text: "Kriteria Ketuntasan Tercapai?", x: cx, y: 350, width: 260, height: 54, arrowToNext: "down", arrowLabel: "Tercapai" },
        { id: "p6", type: "terminator", text: "Selesai (Tindakan Berhasil)", x: cx, y: 440, width: 260, height: 44, arrowToNext: "none" },
      ]);
    } else if (template === "sdlc") {
      setDiagramCaption("Gambar 3.3: Diagram Alur Pengembangan Sistem (SDLC)");
      setFlowNodes([
        { id: "s1", type: "terminator", text: "Mulai Proyek", x: cx, y: 35, width: 260, height: 44, arrowToNext: "down" },
        { id: "s2", type: "process", text: "Analisis Kebutuhan Sistem", x: cx, y: 110, width: 260, height: 46, arrowToNext: "down" },
        { id: "s3", type: "database", text: "Perancangan Basis Data & Arsitektur", x: cx, y: 190, width: 260, height: 46, arrowToNext: "down" },
        { id: "s4", type: "process", text: "Pengkodean / Implementasi Aplikasi", x: cx, y: 270, width: 260, height: 46, arrowToNext: "down" },
        { id: "s5", type: "decision", text: "Pengujian Blackbox & UAT Lolos?", x: cx, y: 350, width: 260, height: 54, arrowToNext: "down", arrowLabel: "Lolos" },
        { id: "s6", type: "terminator", text: "Selesai & Penerapan Sistem", x: cx, y: 440, width: 260, height: 44, arrowToNext: "none" },
      ]);
    }
  };

  // Render SVG String for Export / Insert (Formal Academic: Border Hitam, Isi Putih)
  const generateAcademicFlowchartSvg = (): string => {
    const { w: svgW, h: svgH } = getCanvasDimensions();

    const shapesSvg = flowNodes.map((node, idx) => {
      const { x, y, width: boxW, height: boxH } = node;
      const midX = x + boxW / 2;
      const midY = y + boxH / 2;

      let shapeCode = "";

      if (node.type === "terminator") {
        shapeCode = `<rect x="${x}" y="${y}" width="${boxW}" height="${boxH}" rx="22" fill="#FFFFFF" stroke="#000000" stroke-width="2" />`;
      } else if (node.type === "process") {
        shapeCode = `<rect x="${x}" y="${y}" width="${boxW}" height="${boxH}" rx="3" fill="#FFFFFF" stroke="#000000" stroke-width="2" />`;
      } else if (node.type === "decision") {
        shapeCode = `<polygon points="${midX},${y} ${x + boxW},${midY} ${midX},${y + boxH} ${x},${midY}" fill="#FFFFFF" stroke="#000000" stroke-width="2" />`;
      } else if (node.type === "data") {
        const skew = 18;
        shapeCode = `<polygon points="${x + skew},${y} ${x + boxW},${y} ${x + boxW - skew},${y + boxH} ${x},${y + boxH}" fill="#FFFFFF" stroke="#000000" stroke-width="2" />`;
      } else if (node.type === "database") {
        shapeCode = `
          <path d="M ${x} ${y + 10} A ${boxW / 2} 10 0 0 1 ${x + boxW} ${y + 10} V ${y + boxH - 10} A ${boxW / 2} 10 0 0 1 ${x} ${y + boxH - 10} Z" fill="#FFFFFF" stroke="#000000" stroke-width="2" />
          <ellipse cx="${midX}" cy="${y + 10}" rx="${boxW / 2}" ry="8" fill="#FFFFFF" stroke="#000000" stroke-width="2" />
        `;
      } else {
        const r = boxH / 2;
        shapeCode = `<circle cx="${midX}" cy="${midY}" r="${r}" fill="#FFFFFF" stroke="#000000" stroke-width="2" />`;
      }

      // Text inside shape
      const textCode = node.subtext
        ? `
        <text x="${midX}" y="${midY - 4}" font-size="12" font-weight="bold" text-anchor="middle" fill="#000000">${node.text}</text>
        <text x="${midX}" y="${midY + 13}" font-size="10" fill="#333333" text-anchor="middle">${node.subtext}</text>
      `
        : `
        <text x="${midX}" y="${midY + 4}" font-size="12.5" font-weight="bold" text-anchor="middle" fill="#000000">${node.text}</text>
      `;

      // Smart Connecting Arrow to Next Node
      let arrowCode = "";
      if (idx < flowNodes.length - 1 && node.arrowToNext !== "none") {
        const nextNode = flowNodes[idx + 1];
        if (node.arrowToNext === "right" || (canvasRatio === "landscape" && node.arrowToNext !== "down")) {
          // Horizontal arrow
          const startAx = x + boxW;
          const startAy = midY;
          const endAx = nextNode ? nextNode.x - 6 : startAx + 30;
          const endAy = nextNode ? nextNode.y + nextNode.height / 2 : startAy;
          arrowCode = `
            <line x1="${startAx}" y1="${startAy}" x2="${endAx}" y2="${endAy}" stroke="#000000" stroke-width="2" marker-end="url(#arrow)" />
            ${node.arrowLabel ? `<text x="${(startAx + endAx) / 2}" y="${(startAy + endAy) / 2 - 6}" font-size="10.5" font-weight="bold" text-anchor="middle" fill="#000000">${node.arrowLabel}</text>` : ""}
          `;
        } else {
          // Vertical arrow
          const startAx = midX;
          const startAy = y + boxH;
          const endAx = nextNode ? nextNode.x + nextNode.width / 2 : midX;
          const endAy = nextNode ? nextNode.y - 6 : startAy + 30;
          arrowCode = `
            <line x1="${startAx}" y1="${startAy}" x2="${endAx}" y2="${endAy}" stroke="#000000" stroke-width="2" marker-end="url(#arrow)" />
            ${node.arrowLabel ? `<text x="${(startAx + endAx) / 2 + 10}" y="${(startAy + endAy) / 2 + 3}" font-size="10.5" font-weight="bold" fill="#000000">${node.arrowLabel}</text>` : ""}
          `;
        }
      }

      return `<g id="${node.id}">${shapeCode}${textCode}${arrowCode}</g>`;
    });

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgW} ${svgH}" width="${svgW}" height="${svgH}" style="background:#FFFFFF; font-family:'Times New Roman', serif;">
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#000000" />
        </marker>
      </defs>
      ${shapesSvg.join("")}
    </svg>`;
  };

  // Convert SVG to Data URL / PNG
  const renderSvgToDataUrl = async (svgString: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = 2;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(blobURL);
          resolve("data:image/svg+xml;utf8," + encodeURIComponent(svgString));
          return;
        }
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(blobURL);
        resolve(canvas.toDataURL("image/png"));
      };

      img.onerror = () => {
        URL.revokeObjectURL(blobURL);
        resolve("data:image/svg+xml;utf8," + encodeURIComponent(svgString));
      };

      img.src = blobURL;
    });
  };

  // Handle Insert Diagram
  const handleInsertDiagram = async () => {
    try {
      setUploading(true);
      const svgString = generateAcademicFlowchartSvg();
      const dataUrl = await renderSvgToDataUrl(svgString);

      const blob = await fetch(dataUrl).then((r) => r.blob());
      const file = new File([blob], "flowchart-riset.png", { type: "image/png" });

      const token =
        getToken() ||
        (typeof window !== "undefined"
          ? localStorage.getItem(TOKEN_KEY) || localStorage.getItem("token")
          : "");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`${apiUrl}/api/upload/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      let finalUrl = dataUrl;
      if (res.ok) {
        const json = await res.json();
        if (json.data?.url) finalUrl = json.data.url;
      }

      const mdSnippet = `![${diagramCaption}](${finalUrl})`;
      onInsertContent(targetField, mdSnippet);
      onClose();
    } catch (err) {
      console.warn("Gagal upload flowchart, fallback dataUrl:", err);
      const svgString = generateAcademicFlowchartSvg();
      const dataUrl = await renderSvgToDataUrl(svgString);
      const mdSnippet = `![${diagramCaption}](${dataUrl})`;
      onInsertContent(targetField, mdSnippet);
      onClose();
    } finally {
      setUploading(false);
    }
  };

  // Handle Insert Uploaded Image
  const handleInsertUploadedImage = async () => {
    if (!uploadedFile) {
      setUploadError("Silakan pilih file gambar terlebih dahulu.");
      return;
    }

    try {
      setUploading(true);
      setUploadError("");

      const token =
        getToken() ||
        (typeof window !== "undefined"
          ? localStorage.getItem(TOKEN_KEY) || localStorage.getItem("token")
          : "");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      const formData = new FormData();
      formData.append("image", uploadedFile);

      const res = await fetch(`${apiUrl}/api/upload/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || "Gagal mengunggah file gambar.");
      }

      const json = await res.json();
      const serverUrl = json.data?.url;

      const mdSnippet = `![${imageCaption}](${serverUrl})`;
      onInsertContent(targetField, mdSnippet);
      onClose();
    } catch (err: any) {
      setUploadError(err.message || "Terjadi kesalahan saat mengunggah gambar.");
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  const { w: currentCanvasW, h: currentCanvasH } = getCanvasDimensions();
  const selectedNode = flowNodes.find((n) => n.id === selectedNodeId);

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#FFFFFF",
          borderRadius: 14,
          width: "100%",
          maxWidth: 960,
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          border: "1px solid #E2E8F0",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
        }}
      >
        {/* Header Modal */}
        <div
          style={{
            padding: "12px 18px",
            borderBottom: "1px solid #E2E8F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#F8FAFC",
          }}
        >
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "#0F172A" }}>
              Studio Sisipkan Media & Format Akademik
            </h3>
            <p style={{ fontSize: 11.5, color: "#64748B", margin: "2px 0 0" }}>
              Tabel Word resizable, Canva-style Flowchart Studio, & Unggah Ilustrasi (Border formal hitam & teks Times New Roman)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              padding: 6,
              borderRadius: 6,
              color: "#64748B",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector & Target Subchapter */}
        <div
          style={{
            padding: "8px 18px",
            background: "#FFFFFF",
            borderBottom: "1px solid #F1F5F9",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", gap: 4, background: "#F1F5F9", padding: 3, borderRadius: 8 }}>
            <button
              type="button"
              onClick={() => setActiveTab("table")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 6,
                border: "none",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                background: activeTab === "table" ? "#FFFFFF" : "transparent",
                color: activeTab === "table" ? "#0F172A" : "#64748B",
                boxShadow: activeTab === "table" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              }}
            >
              <TableIcon size={14} />
              <span>Tabel (Word Resizable & Merge)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("diagram")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 6,
                border: "none",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                background: activeTab === "diagram" ? "#FFFFFF" : "transparent",
                color: activeTab === "diagram" ? "#0F172A" : "#64748B",
                boxShadow: activeTab === "diagram" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              }}
            >
              <GitPullRequest size={14} />
              <span>Flowchart Studio (Canva Style)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("image")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 6,
                border: "none",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                background: activeTab === "image" ? "#FFFFFF" : "transparent",
                color: activeTab === "image" ? "#0F172A" : "#64748B",
                boxShadow: activeTab === "image" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              }}
            >
              <ImageIcon size={14} />
              <span>Unggah Gambar</span>
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11.5, color: "#64748B", fontWeight: 600 }}>Tujuan Sub-bab:</span>
            <select
              value={targetField}
              onChange={(e) => setTargetField(e.target.value)}
              style={{
                padding: "5px 8px",
                borderRadius: 6,
                border: "1px solid #CBD5E1",
                fontSize: 11.5,
                color: "#1E293B",
                fontWeight: 600,
                background: "#F8FAFC",
              }}
            >
              <option value="bab1.latarBelakang">1.1 Latar Belakang</option>
              <option value="bab2.landasanTeori">2.1 Landasan Teori</option>
              <option value="bab2.kerangkaKonseptual">2.3 Kerangka Konseptual</option>
              <option value="bab3.desainPenelitian">3.1 Desain Penelitian</option>
              <option value="bab3.teknikPengumpulanData">3.3 Teknik Pengumpulan Data</option>
              <option value="bab3.teknikAnalisisData">3.4 Teknik Analisis Data</option>
              {customSubChapters.map((s) => (
                <option key={s.id} value={`custom.${s.id}`}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "16px 20px", overflowY: "auto", flex: 1 }}>
          {/* ─────────────────────────────────────────────────────────────
              TAB 1: TABEL (RESIZABLE COLUMNS + MERGE CELLS)
              ───────────────────────────────────────────────────────────── */}
          {activeTab === "table" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Top Controls: Preset Buttons + Docs Grid Picker Button */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: "#334155" }}>Preset:</span>
                  {[
                    { id: "instrumen", label: "Matriks Instrumen" },
                    { id: "jadwal", label: "Jadwal (2-Level)" },
                    { id: "komparasi", label: "Penelitian Terdahulu" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectTablePreset(p.id as any)}
                      style={{
                        padding: "4px 8px",
                        borderRadius: 6,
                        border: "1px solid #CBD5E1",
                        background: "#F8FAFC",
                        color: "#334155",
                        fontSize: 11.5,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Google Docs Style Grid Selector Dropdown Button */}
                <div style={{ position: "relative" }}>
                  <button
                    type="button"
                    onClick={() => setShowGridPicker(!showGridPicker)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "5px 10px",
                      borderRadius: 6,
                      border: "1px solid #CBD5E1",
                      background: showGridPicker ? "#EFF6FF" : "#FFFFFF",
                      color: showGridPicker ? "#2563EB" : "#334155",
                      fontSize: 11.5,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <Grid size={13} />
                    <span>Ukuran Grid (Docs)</span>
                  </button>

                  {/* 8x8 Grid Hover Flyout */}
                  {showGridPicker && (
                    <div
                      style={{
                        position: "absolute",
                        right: 0,
                        top: "115%",
                        background: "#FFFFFF",
                        border: "1px solid #CBD5E1",
                        borderRadius: 8,
                        boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
                        padding: 10,
                        zIndex: 100,
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 6, textAlign: "center" }}>
                        {hoverGrid.cols > 0 && hoverGrid.rows > 0
                          ? `${hoverGrid.cols} x ${hoverGrid.rows} Sel`
                          : "Arahkan kursor untuk memilih ukuran"}
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(8, 18px)",
                          gap: 3,
                        }}
                        onMouseLeave={() => setHoverGrid({ rows: 0, cols: 0 })}
                      >
                        {Array.from({ length: 8 }).map((_, r) =>
                          Array.from({ length: 8 }).map((_, c) => {
                            const isHovered = r < hoverGrid.rows && c < hoverGrid.cols;
                            return (
                              <div
                                key={`${r}-${c}`}
                                onMouseEnter={() => setHoverGrid({ rows: r + 1, cols: c + 1 })}
                                onClick={() => handleCreateGridTable(c + 1, r + 1)}
                                style={{
                                  width: 18,
                                  height: 18,
                                  border: "1px solid #CBD5E1",
                                  borderRadius: 2,
                                  background: isHovered ? "#93C5FD" : "#F8FAFC",
                                  cursor: "pointer",
                                }}
                              />
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Caption Input */}
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "#334155", display: "block", marginBottom: 3 }}>
                  Judul & Nomor Tabel:
                </label>
                <input
                  type="text"
                  value={tableCaption}
                  onChange={(e) => setTableCaption(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    borderRadius: 6,
                    border: "1px solid #CBD5E1",
                    fontSize: 12.5,
                    fontFamily: "Times New Roman, serif",
                  }}
                />
              </div>

              {/* Table Toolbar (Merge & Structure) */}
              <div
                style={{
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  borderRadius: 6,
                  padding: "6px 10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#64748B", fontWeight: 600 }}>
                  <span>{selectedCell ? `Sel: [R${selectedCell.r + 1}:C${selectedCell.c + 1}]` : "Pilih sel untuk aksi"}</span>
                  <span style={{ color: "#94A3B8" }}>•</span>
                  <span style={{ color: "#2563EB", fontWeight: 500 }}>💡 Tarik pembatas kolom di header untuk mengubah lebar</span>
                </div>

                {/* Pure Icon Buttons */}
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <button
                    type="button"
                    disabled={!selectedCell}
                    onClick={handleMergeColspan}
                    title="Gabung Kolom ke Kanan (Merge Colspan)"
                    style={{
                      padding: 6,
                      borderRadius: 4,
                      border: "1px solid #CBD5E1",
                      background: selectedCell ? "#FFFFFF" : "#F1F5F9",
                      color: selectedCell ? "#0F172A" : "#94A3B8",
                      cursor: selectedCell ? "pointer" : "not-allowed",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Combine size={15} />
                  </button>

                  <button
                    type="button"
                    disabled={!selectedCell}
                    onClick={handleMergeRowspan}
                    title="Gabung Baris ke Bawah (Merge Rowspan)"
                    style={{
                      padding: 6,
                      borderRadius: 4,
                      border: "1px solid #CBD5E1",
                      background: selectedCell ? "#FFFFFF" : "#F1F5F9",
                      color: selectedCell ? "#0F172A" : "#94A3B8",
                      cursor: selectedCell ? "pointer" : "not-allowed",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <ArrowDown size={15} />
                  </button>

                  <button
                    type="button"
                    disabled={!selectedCell}
                    onClick={handleUnmerge}
                    title="Pisahkan Sel (Split / Unmerge)"
                    style={{
                      padding: 6,
                      borderRadius: 4,
                      border: "1px solid #CBD5E1",
                      background: selectedCell ? "#FFFFFF" : "#F1F5F9",
                      color: selectedCell ? "#DC2626" : "#94A3B8",
                      cursor: selectedCell ? "pointer" : "not-allowed",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Split size={15} />
                  </button>

                  <div style={{ width: 1, height: 18, background: "#CBD5E1", margin: "0 2px" }} />

                  <button
                    type="button"
                    onClick={handleAddColumn}
                    title="Tambah Kolom"
                    style={{
                      padding: 6,
                      borderRadius: 4,
                      border: "1px solid #CBD5E1",
                      background: "#FFFFFF",
                      color: "#0F172A",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Columns size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={handleAddRow}
                    title="Tambah Baris"
                    style={{
                      padding: 6,
                      borderRadius: 4,
                      border: "1px solid #CBD5E1",
                      background: "#FFFFFF",
                      color: "#0F172A",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Rows size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={handleDeleteRow}
                    title="Hapus Baris Terakhir"
                    style={{
                      padding: 6,
                      borderRadius: 4,
                      border: "1px solid #CBD5E1",
                      background: "#FFFFFF",
                      color: "#DC2626",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Table Live Grid with Draggable Resizer Handles */}
              <div
                style={{
                  overflowX: "auto",
                  border: "1px solid #000000",
                  borderRadius: 4,
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "Times New Roman, serif" }}>
                  <colgroup>
                    {colWidths.map((w, idx) => (
                      <col key={idx} style={{ width: `${w}%` }} />
                    ))}
                  </colgroup>
                  <thead>
                    {headerRows.map((hRow, rIdx) => (
                      <tr key={rIdx} style={{ background: "#F8FAFC" }}>
                        {hRow.map((cell, cIdx) => {
                          if (cell.mergedInto) return null;
                          const isSelected =
                            selectedCell?.section === "header" &&
                            selectedCell.r === rIdx &&
                            selectedCell.c === cIdx;
                          return (
                            <th
                              key={cIdx}
                              colSpan={cell.colSpan}
                              rowSpan={cell.rowSpan}
                              onClick={() => setSelectedCell({ section: "header", r: rIdx, c: cIdx })}
                              style={{
                                position: "relative",
                                border: "1px solid #000000",
                                padding: "7px 10px",
                                textAlign: "center",
                                fontWeight: "bold",
                                background: isSelected ? "#DBEAFE" : "#FFFFFF",
                                color: "#000000",
                                outline: isSelected ? "2px solid #2563EB" : "none",
                                userSelect: "none",
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
                                <input
                                  type="text"
                                  value={cell.text}
                                  onChange={(e) => handleUpdateCellText("header", rIdx, cIdx, e.target.value)}
                                  style={{
                                    width: "100%",
                                    border: "none",
                                    background: "transparent",
                                    textAlign: "center",
                                    fontWeight: "bold",
                                    fontFamily: "Times New Roman, serif",
                                    fontSize: 12,
                                    outline: "none",
                                  }}
                                />
                                <span style={{ fontSize: 9.5, color: "#94A3B8", fontWeight: 500, flexShrink: 0 }}>
                                  {colWidths[cIdx] ? `${colWidths[cIdx]}%` : ""}
                                </span>
                              </div>

                              {/* Column resize divider handle */}
                              {cIdx < colWidths.length - 1 && (
                                <div
                                  onMouseDown={(e) => handleStartColResize(cIdx, e)}
                                  title={`Lebar Kolom: ${colWidths[cIdx]}%. Tarik untuk mengubah lebar`}
                                  style={{
                                    position: "absolute",
                                    right: -4,
                                    top: 0,
                                    bottom: 0,
                                    width: 8,
                                    cursor: "col-resize",
                                    zIndex: 20,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <div style={{ width: 2, height: "70%", background: "#64748B", borderRadius: 1 }} />
                                </div>
                              )}
                            </th>
                          );
                        })}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {bodyRows.map((bRow, rIdx) => (
                      <tr key={rIdx}>
                        {bRow.map((cell, cIdx) => {
                          if (cell.mergedInto) return null;
                          const isSelected =
                            selectedCell?.section === "body" &&
                            selectedCell.r === rIdx &&
                            selectedCell.c === cIdx;
                          return (
                            <td
                              key={cIdx}
                              colSpan={cell.colSpan}
                              rowSpan={cell.rowSpan}
                              onClick={() => setSelectedCell({ section: "body", r: rIdx, c: cIdx })}
                              style={{
                                border: "1px solid #000000",
                                padding: "6px 8px",
                                background: isSelected ? "#EFF6FF" : "#FFFFFF",
                                outline: isSelected ? "2px solid #2563EB" : "none",
                              }}
                            >
                              <input
                                type="text"
                                value={cell.text}
                                onChange={(e) => handleUpdateCellText("body", rIdx, cIdx, e.target.value)}
                                style={{
                                  width: "100%",
                                  border: "none",
                                  background: "transparent",
                                  fontFamily: "Times New Roman, serif",
                                  fontSize: 12,
                                  outline: "none",
                                }}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Action Submit */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 6 }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 6,
                    border: "1px solid #CBD5E1",
                    background: "#FFFFFF",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleInsertTable}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 6,
                    border: "none",
                    background: "#0F172A",
                    color: "#FFFFFF",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Check size={14} />
                  <span>Sisipkan Tabel ke Proposal</span>
                </button>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 2: FLOWCHART STUDIO (CANVA STYLE FREEFORM + AUTO TIDY)
              ───────────────────────────────────────────────────────────── */}
          {activeTab === "diagram" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Top Studio Control Bar: Aspect Ratio + Auto-Tidy + Presets */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 8,
                  padding: "8px 12px",
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  borderRadius: 8,
                }}
              >
                {/* Aspect Ratio Switcher */}
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#475569", marginRight: 4 }}>Kanvas:</span>
                  {[
                    { id: "portrait", label: "Portrait 3:4", icon: Smartphone },
                    { id: "landscape", label: "Landscape 16:9", icon: Monitor },
                    { id: "square", label: "Persegi 1:1", icon: Box },
                  ].map((r) => {
                    const Icon = r.icon;
                    const isActive = canvasRatio === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setCanvasRatio(r.id as any)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "4px 8px",
                          borderRadius: 6,
                          border: isActive ? "1.5px solid #2563EB" : "1px solid #CBD5E1",
                          background: isActive ? "#EFF6FF" : "#FFFFFF",
                          color: isActive ? "#2563EB" : "#475569",
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        <Icon size={12} />
                        <span>{r.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Prominent Auto-Tidy Button */}
                <button
                  type="button"
                  onClick={handleAutoTidy}
                  title="Rapikan posisi shapes otomatis simetris di tengah"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 12px",
                    borderRadius: 6,
                    border: "1px solid #C7D2FE",
                    background: "#EEF2FF",
                    color: "#4338CA",
                    fontSize: 11.5,
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 1px 2px rgba(99, 102, 241, 0.12)",
                    transition: "all 0.15s ease",
                  }}
                >
                  <Sparkles size={14} color="#6366F1" />
                  <span>✨ Rapikan Otomatis (Auto-Tidy)</span>
                </button>

                {/* Preset Templates */}
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>Template:</span>
                  {[
                    { id: "skripsi", label: "Skripsi Umum" },
                    { id: "ptk", label: "PTK (Siklus)" },
                    { id: "sdlc", label: "SDLC Sistem" },
                  ].map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => handleLoadFlowTemplate(tpl.id as any)}
                      style={{
                        padding: "3px 7px",
                        borderRadius: 5,
                        border: "1px solid #CBD5E1",
                        background: "#FFFFFF",
                        color: "#334155",
                        fontSize: 10.5,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add Shape Palette Buttons */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>Tambah Simbol:</span>
                <button
                  type="button"
                  onClick={() => handleAddFlowNode("terminator")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "4px 8px",
                    borderRadius: 6,
                    border: "1px solid #0F172A",
                    background: "#FFFFFF",
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <Circle size={12} /> Mulai/Selesai
                </button>
                <button
                  type="button"
                  onClick={() => handleAddFlowNode("process")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "4px 8px",
                    borderRadius: 6,
                    border: "1px solid #0F172A",
                    background: "#FFFFFF",
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <Square size={12} /> Proses (Kotak)
                </button>
                <button
                  type="button"
                  onClick={() => handleAddFlowNode("decision")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "4px 8px",
                    borderRadius: 6,
                    border: "1px solid #0F172A",
                    background: "#FFFFFF",
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <Diamond size={12} /> Keputusan (Ketupat)
                </button>
                <button
                  type="button"
                  onClick={() => handleAddFlowNode("data")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "4px 8px",
                    borderRadius: 6,
                    border: "1px solid #0F172A",
                    background: "#FFFFFF",
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <Layers size={12} /> Data I/O
                </button>
                <button
                  type="button"
                  onClick={() => handleAddFlowNode("database")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "4px 8px",
                    borderRadius: 6,
                    border: "1px solid #0F172A",
                    background: "#FFFFFF",
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <Database size={12} /> Database
                </button>
              </div>

              {/* Caption Input */}
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "#334155", display: "block", marginBottom: 3 }}>
                  Judul & Nomor Gambar:
                </label>
                <input
                  type="text"
                  value={diagramCaption}
                  onChange={(e) => setDiagramCaption(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "6px 10px",
                    borderRadius: 6,
                    border: "1px solid #CBD5E1",
                    fontSize: 12,
                    fontFamily: "Times New Roman, serif",
                  }}
                />
              </div>

              {/* 2-Column Canvas Layout: Left Interactive Canvas, Right Inspector */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 12, alignItems: "start" }}>
                {/* Left: Canva-Style Interactive SVG Canvas */}
                <div
                  style={{
                    background: "#F1F5F9",
                    borderRadius: 8,
                    border: "1px solid #CBD5E1",
                    padding: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "auto",
                    maxHeight: 420,
                    position: "relative",
                  }}
                >
                  <svg
                    ref={svgRef}
                    viewBox={`0 0 ${currentCanvasW} ${currentCanvasH}`}
                    width={currentCanvasW}
                    height={currentCanvasH}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    onMouseLeave={handleCanvasMouseUp}
                    style={{
                      background: "#FFFFFF",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      border: "1px solid #000000",
                      userSelect: "none",
                      fontFamily: "Times New Roman, serif",
                      cursor: draggingNodeId ? "grabbing" : "default",
                    }}
                  >
                    <defs>
                      <marker id="arrow-interactive" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 1 L 10 5 L 0 9 z" fill="#000000" />
                      </marker>
                    </defs>

                    {/* Connecting Arrows */}
                    {flowNodes.map((node, idx) => {
                      if (idx >= flowNodes.length - 1 || node.arrowToNext === "none") return null;
                      const nextNode = flowNodes[idx + 1];
                      const midX = node.x + node.width / 2;
                      const midY = node.y + node.height / 2;

                      if (node.arrowToNext === "right" || (canvasRatio === "landscape" && node.arrowToNext !== "down")) {
                        const sX = node.x + node.width;
                        const sY = midY;
                        const eX = nextNode ? nextNode.x - 6 : sX + 30;
                        const eY = nextNode ? nextNode.y + nextNode.height / 2 : sY;
                        return (
                          <g key={`arrow_${node.id}`}>
                            <line x1={sX} y1={sY} x2={eX} y2={eY} stroke="#000000" strokeWidth="2" markerEnd="url(#arrow-interactive)" />
                            {node.arrowLabel && (
                              <text x={(sX + eX) / 2} y={(sY + eY) / 2 - 6} fontSize="10" fontWeight="bold" textAnchor="middle" fill="#000000">
                                {node.arrowLabel}
                              </text>
                            )}
                          </g>
                        );
                      }

                      const sX = midX;
                      const sY = node.y + node.height;
                      const eX = nextNode ? nextNode.x + nextNode.width / 2 : midX;
                      const eY = nextNode ? nextNode.y - 6 : sY + 30;
                      return (
                        <g key={`arrow_${node.id}`}>
                          <line x1={sX} y1={sY} x2={eX} y2={eY} stroke="#000000" strokeWidth="2" markerEnd="url(#arrow-interactive)" />
                          {node.arrowLabel && (
                            <text x={(sX + eX) / 2 + 8} y={(sY + eY) / 2 + 3} fontSize="10" fontWeight="bold" fill="#000000">
                              {node.arrowLabel}
                            </text>
                          )}
                        </g>
                      );
                    })}

                    {/* Node Shapes (Freeform Draggable) */}
                    {flowNodes.map((node) => {
                      const isSelected = selectedNodeId === node.id;
                      const midX = node.x + node.width / 2;
                      const midY = node.y + node.height / 2;

                      return (
                        <g
                          key={node.id}
                          onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
                          style={{ cursor: "grab" }}
                        >
                          {/* Canva Selection Ring & Handles */}
                          {isSelected && (
                            <rect
                              x={node.x - 4}
                              y={node.y - 4}
                              width={node.width + 8}
                              height={node.height + 8}
                              fill="none"
                              stroke="#2563EB"
                              strokeWidth="1.5"
                              strokeDasharray="3 3"
                              rx="4"
                            />
                          )}

                          {/* Primary Academic Shape */}
                          {node.type === "terminator" && (
                            <rect x={node.x} y={node.y} width={node.width} height={node.height} rx="22" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
                          )}
                          {node.type === "process" && (
                            <rect x={node.x} y={node.y} width={node.width} height={node.height} rx="3" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
                          )}
                          {node.type === "decision" && (
                            <polygon
                              points={`${midX},${node.y} ${node.x + node.width},${midY} ${midX},${node.y + node.height} ${node.x},${midY}`}
                              fill="#FFFFFF"
                              stroke="#000000"
                              strokeWidth="2"
                            />
                          )}
                          {node.type === "data" && (
                            <polygon
                              points={`${node.x + 18},${node.y} ${node.x + node.width},${node.y} ${node.x + node.width - 18},${node.y + node.height} ${node.x},${node.y + node.height}`}
                              fill="#FFFFFF"
                              stroke="#000000"
                              strokeWidth="2"
                            />
                          )}
                          {node.type === "database" && (
                            <>
                              <path
                                d={`M ${node.x} ${node.y + 10} A ${node.width / 2} 10 0 0 1 ${node.x + node.width} ${node.y + 10} V ${node.y + node.height - 10} A ${node.width / 2} 10 0 0 1 ${node.x} ${node.y + node.height - 10} Z`}
                                fill="#FFFFFF"
                                stroke="#000000"
                                strokeWidth="2"
                              />
                              <ellipse cx={midX} cy={node.y + 10} rx={node.width / 2} ry="8" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
                            </>
                          )}
                          {node.type === "connector" && (
                            <circle cx={midX} cy={midY} r={node.height / 2} fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
                          )}

                          {/* Node Text */}
                          {node.subtext ? (
                            <>
                              <text x={midX} y={midY - 4} fontSize="12" fontWeight="bold" textAnchor="middle" fill="#000000">
                                {node.text}
                              </text>
                              <text x={midX} y={midY + 13} fontSize="10" fill="#333333" textAnchor="middle">
                                {node.subtext}
                              </text>
                            </>
                          ) : (
                            <text x={midX} y={midY + 4} fontSize="12.5" fontWeight="bold" textAnchor="middle" fill="#000000">
                              {node.text}
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Right: Shape Property Inspector */}
                <div
                  style={{
                    background: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    borderRadius: 8,
                    padding: 12,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    maxHeight: 420,
                    overflowY: "auto",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#0F172A" }}>Properti Simbol</span>
                    {selectedNode && flowNodes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteFlowNode(selectedNode.id)}
                        title="Hapus Simbol"
                        style={{ border: "none", background: "transparent", color: "#EF4444", cursor: "pointer", padding: 2 }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  {selectedNode ? (
                    <>
                      <div>
                        <label style={{ fontSize: 10.5, fontWeight: 700, color: "#64748B", display: "block", marginBottom: 3 }}>
                          Tipe Bentuk:
                        </label>
                        <select
                          value={selectedNode.type}
                          onChange={(e) => {
                            setFlowNodes((prev) =>
                              prev.map((n) => (n.id === selectedNode.id ? { ...n, type: e.target.value as any } : n))
                            );
                          }}
                          style={{
                            width: "100%",
                            padding: "4px 8px",
                            borderRadius: 4,
                            border: "1px solid #CBD5E1",
                            fontSize: 11,
                            fontWeight: 600,
                            background: "#FFFFFF",
                          }}
                        >
                          <option value="terminator">Terminator (Mulai/Selesai)</option>
                          <option value="process">Proses (Persegi Panjang)</option>
                          <option value="decision">Keputusan (Belah Ketupat)</option>
                          <option value="data">Data I/O (Jajar Genjang)</option>
                          <option value="database">Database (Silinder)</option>
                          <option value="connector">Konektor (Lingkaran)</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: 10.5, fontWeight: 700, color: "#64748B", display: "block", marginBottom: 3 }}>
                          Teks Judul:
                        </label>
                        <input
                          type="text"
                          value={selectedNode.text}
                          onChange={(e) => {
                            setFlowNodes((prev) =>
                              prev.map((n) => (n.id === selectedNode.id ? { ...n, text: e.target.value } : n))
                            );
                          }}
                          style={{
                            width: "100%",
                            padding: "5px 8px",
                            borderRadius: 4,
                            border: "1px solid #CBD5E1",
                            fontSize: 11.5,
                            fontWeight: 600,
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: 10.5, fontWeight: 700, color: "#64748B", display: "block", marginBottom: 3 }}>
                          Subteks / Keterangan Tambahan:
                        </label>
                        <input
                          type="text"
                          value={selectedNode.subtext || ""}
                          placeholder="Opsional (misal: Sumber data)"
                          onChange={(e) => {
                            setFlowNodes((prev) =>
                              prev.map((n) => (n.id === selectedNode.id ? { ...n, subtext: e.target.value } : n))
                            );
                          }}
                          style={{
                            width: "100%",
                            padding: "4px 8px",
                            borderRadius: 4,
                            border: "1px solid #CBD5E1",
                            fontSize: 11,
                          }}
                        />
                      </div>

                      {selectedNode.type === "decision" && (
                        <div>
                          <label style={{ fontSize: 10.5, fontWeight: 700, color: "#64748B", display: "block", marginBottom: 3 }}>
                            Label Panah:
                          </label>
                          <input
                            type="text"
                            value={selectedNode.arrowLabel || ""}
                            placeholder="Ya / Tidak / Lolos"
                            onChange={(e) => {
                              setFlowNodes((prev) =>
                                prev.map((n) => (n.id === selectedNode.id ? { ...n, arrowLabel: e.target.value } : n))
                              );
                            }}
                            style={{
                              width: "100%",
                              padding: "4px 8px",
                              borderRadius: 4,
                              border: "1px solid #CBD5E1",
                              fontSize: 11,
                            }}
                          />
                        </div>
                      )}

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                        <div>
                          <label style={{ fontSize: 10, color: "#64748B" }}>Lebar (px):</label>
                          <input
                            type="number"
                            value={selectedNode.width}
                            onChange={(e) => {
                              const val = Math.max(80, parseInt(e.target.value) || 200);
                              setFlowNodes((prev) =>
                                prev.map((n) => (n.id === selectedNode.id ? { ...n, width: val } : n))
                              );
                            }}
                            style={{ width: "100%", padding: "3px 6px", fontSize: 11, borderRadius: 4, border: "1px solid #CBD5E1" }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 10, color: "#64748B" }}>Arah Panah:</label>
                          <select
                            value={selectedNode.arrowToNext || "down"}
                            onChange={(e) => {
                              setFlowNodes((prev) =>
                                prev.map((n) => (n.id === selectedNode.id ? { ...n, arrowToNext: e.target.value as any } : n))
                              );
                            }}
                            style={{ width: "100%", padding: "3px 6px", fontSize: 11, borderRadius: 4, border: "1px solid #CBD5E1" }}
                          >
                            <option value="down">Ke Bawah</option>
                            <option value="right">Ke Kanan</option>
                            <option value="none">Tanpa Panah</option>
                          </select>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div style={{ fontSize: 11, color: "#94A3B8", textAlign: "center", padding: "20px 0" }}>
                      Klik salah satu simbol pada kanvas untuk mengedit properti
                    </div>
                  )}
                </div>
              </div>

              {/* Action Submit */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 6,
                    border: "1px solid #CBD5E1",
                    background: "#FFFFFF",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={uploading}
                  onClick={handleInsertDiagram}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 6,
                    border: "none",
                    background: "#0F172A",
                    color: "#FFFFFF",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: uploading ? "wait" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Check size={14} />
                  <span>{uploading ? "Memproses Diagram..." : "Sisipkan Diagram ke Proposal"}</span>
                </button>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 3: UNGGAH GAMBAR SENDIRI
              ───────────────────────────────────────────────────────────── */}
          {activeTab === "image" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: "2px dashed #CBD5E1",
                  borderRadius: 10,
                  padding: "36px 20px",
                  textAlign: "center",
                  background: "#F8FAFC",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <UploadCloud size={38} color="#64748B" style={{ margin: "0 auto 10px" }} />
                <p style={{ fontSize: 13, fontWeight: 600, color: "#1E293B", margin: 0 }}>
                  {uploadedFile ? uploadedFile.name : "Klik atau seret file gambar ke sini"}
                </p>
                <p style={{ fontSize: 11, color: "#64748B", margin: "4px 0 0" }}>
                  Mendukung PNG, JPG, JPEG, WEBP (Maksimal 5 MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setUploadedFile(file);
                      setPreviewUrl(URL.createObjectURL(file));
                    }
                  }}
                  style={{ display: "none" }}
                />
              </div>

              {previewUrl && (
                <div style={{ textAlign: "center", padding: 10, background: "#F1F5F9", borderRadius: 8 }}>
                  <img
                    src={previewUrl}
                    alt="Pratinjau Gambar"
                    style={{ maxHeight: 220, maxWidth: "100%", borderRadius: 6, objectFit: "contain", border: "1px solid #CBD5E1" }}
                  />
                </div>
              )}

              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "#334155", display: "block", marginBottom: 3 }}>
                  Keterangan Gambar (Caption):
                </label>
                <input
                  type="text"
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    borderRadius: 6,
                    border: "1px solid #CBD5E1",
                    fontSize: 12.5,
                    fontFamily: "Times New Roman, serif",
                  }}
                />
              </div>

              {uploadError && (
                <div style={{ padding: "8px 12px", borderRadius: 6, background: "#FEF2F2", border: "1px solid #FCA5A5", color: "#DC2626", fontSize: 11.5 }}>
                  {uploadError}
                </div>
              )}

              {/* Action Submit */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 6 }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 6,
                    border: "1px solid #CBD5E1",
                    background: "#FFFFFF",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={uploading || !uploadedFile}
                  onClick={handleInsertUploadedImage}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 6,
                    border: "none",
                    background: "#0F172A",
                    color: "#FFFFFF",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: uploading || !uploadedFile ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Check size={14} />
                  <span>{uploading ? "Mengunggah Gambar..." : "Sisipkan Gambar ke Proposal"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
