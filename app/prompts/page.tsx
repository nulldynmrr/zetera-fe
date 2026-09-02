"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api, AiSkillPrompt } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import {
  Sparkles,
  BookOpen,
  Code2,
  Tag,
  Search,
  Plus,
  Edit3,
  Check,
  Copy,
  ChevronRight,
  ArrowLeft,
  ShieldCheck,
  Layers,
  FileText,
  Trash2,
  X,
  ListOrdered,
  RefreshCw,
  Cpu,
} from "lucide-react";

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<AiSkillPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Edit/Create Modal State
  const [editingPrompt, setEditingPrompt] = useState<AiSkillPrompt | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    title: "",
    category: "SUBCHAPTER",
    tags: "",
    description: "",
    systemPrompt: "",
    recipeSteps: [] as string[],
    isActive: true,
  });
  const [newStepText, setNewStepText] = useState("");

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      const res = await api.prompts.list();
      if (res.success) {
        setPrompts(res.data);
      }
    } catch (err: any) {
      console.error("Gagal memuat prompt library:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrompts();
  }, []);

  const categories = [
    { id: "ALL", label: "Semua Skill & Prompt", icon: Layers, count: prompts.length },
    { id: "SUBCHAPTER", label: "Sub-bab Outline (19 Resep)", icon: ListOrdered, count: prompts.filter(p => p.category === "SUBCHAPTER").length },
    { id: "OUTLINE", label: "Blueprint Architect", icon: Cpu, count: prompts.filter(p => p.category === "OUTLINE").length },
    { id: "PROPOSAL", label: "Proposal Academic Drafter", icon: FileText, count: prompts.filter(p => p.category === "PROPOSAL").length },
    { id: "SCREENING", label: "Screening Jurnal", icon: ShieldCheck, count: prompts.filter(p => p.category === "SCREENING").length },
    { id: "LITERATURE", label: "Literature Knowledge Engine", icon: BookOpen, count: prompts.filter(p => p.category === "LITERATURE").length },
  ];

  // Extract all unique tags
  const allTags = Array.from(
    new Set(
      prompts.flatMap(p => Array.isArray(p.tags) ? p.tags : [])
    )
  ).filter(Boolean);

  // Filtered list
  const filteredPrompts = prompts.filter((p) => {
    if (selectedCategory !== "ALL" && p.category !== selectedCategory) return false;
    if (selectedTag) {
      const pTags = Array.isArray(p.tags) ? p.tags : [];
      if (!pTags.includes(selectedTag)) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchCode = p.code.toLowerCase().includes(q);
      const matchDesc = (p.description || "").toLowerCase().includes(q);
      const matchTags = (Array.isArray(p.tags) ? p.tags : []).some(t => t.toLowerCase().includes(q));
      if (!matchTitle && !matchCode && !matchDesc && !matchTags) return false;
    }
    return true;
  });

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleOpenEdit = (prompt: AiSkillPrompt) => {
    setEditingPrompt(prompt);
    setIsCreating(false);
    setFormData({
      code: prompt.code,
      title: prompt.title,
      category: prompt.category,
      tags: (Array.isArray(prompt.tags) ? prompt.tags : []).join(", "),
      description: prompt.description || "",
      systemPrompt: prompt.systemPrompt || "",
      recipeSteps: Array.isArray(prompt.recipeSteps) ? [...prompt.recipeSteps] : [],
      isActive: prompt.isActive,
    });
  };

  const handleOpenCreate = () => {
    setEditingPrompt(null);
    setIsCreating(true);
    setFormData({
      code: "CUSTOM_SKILL_" + Math.random().toString(36).substring(2, 6).toUpperCase(),
      title: "",
      category: "SUBCHAPTER",
      tags: "kustom, riset",
      description: "",
      systemPrompt: "",
      recipeSteps: [],
      isActive: true,
    });
  };

  const handleAddStep = () => {
    if (!newStepText.trim()) return;
    setFormData({
      ...formData,
      recipeSteps: [...formData.recipeSteps, newStepText.trim()],
    });
    setNewStepText("");
  };

  const handleRemoveStep = (idx: number) => {
    setFormData({
      ...formData,
      recipeSteps: formData.recipeSteps.filter((_, i) => i !== idx),
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const tagArray = formData.tags.split(",").map(t => t.trim().toLowerCase()).filter(Boolean);
      
      if (isCreating) {
        await api.prompts.create({
          code: formData.code,
          title: formData.title,
          category: formData.category,
          tags: tagArray,
          description: formData.description,
          systemPrompt: formData.systemPrompt,
          recipeSteps: formData.recipeSteps,
          isActive: formData.isActive,
        });
      } else if (editingPrompt) {
        await api.prompts.update(editingPrompt.id, {
          title: formData.title,
          category: formData.category,
          tags: tagArray,
          description: formData.description,
          systemPrompt: formData.systemPrompt,
          recipeSteps: formData.recipeSteps,
          isActive: formData.isActive,
        });
      }

      await fetchPrompts();
      setEditingPrompt(null);
      setIsCreating(false);
    } catch (err: any) {
      alert("Gagal menyimpan prompt: " + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", flexDirection: "column" }}>
      {/* Top Header */}
      <header
        style={{
          height: 64,
          background: "#ffffff",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 28px",
          position: "sticky",
          top: 0,
          zIndex: 30,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Link
            href="/dashboard"
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#475569",
              textDecoration: "none",
            }}
            title="Kembali ke Dashboard"
          >
            <ArrowLeft size={18} />
          </Link>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b" }}>
              <Link href="/dashboard" style={{ color: "#64748b", textDecoration: "none" }}>Dashboard</Link>
              <ChevronRight size={13} />
              <Link href="/library/templates" style={{ color: "#64748b", textDecoration: "none" }}>Library</Link>
              <ChevronRight size={13} />
              <span style={{ color: "#0f172a", fontWeight: 600 }}>Skill & Prompt Catalog</span>
            </div>
            <h1 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
              <span>AI Prompt & Skill Library</span>
              <span style={{ fontSize: 11, background: "#ecfdf5", color: "#059669", padding: "1px 6px", borderRadius: 4, fontWeight: 700, border: "1px solid #a7f3d0" }}>
                Database Driven
              </span>
            </h1>
          </div>
        </div>

        {/* Action Header Tabs */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", background: "#f1f5f9", padding: 3, borderRadius: 8, border: "1px solid #e2e8f0" }}>
            <Link
              href="/library/templates"
              style={{
                padding: "5px 12px",
                fontSize: 12,
                fontWeight: 600,
                color: "#64748b",
                textDecoration: "none",
                borderRadius: 6,
              }}
            >
              Proposal Templates
            </Link>
            <div
              style={{
                padding: "5px 12px",
                fontSize: 12,
                fontWeight: 700,
                color: "#0f172a",
                background: "#ffffff",
                borderRadius: 6,
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              }}
            >
              AI Skill Prompts ({prompts.length})
            </div>
          </div>

          <Button
            variant="emerald"
            size="sm"
            icon={<Plus size={14} />}
            onClick={handleOpenCreate}
          >
            Tambah Skill Baru
          </Button>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: 1240, margin: "0 auto", padding: "28px 24px 80px", width: "100%" }}>
        {/* Banner */}
        <div
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            borderRadius: 16,
            padding: "24px 28px",
            color: "#ffffff",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 4px 20px rgba(15,23,42,0.12)",
          }}
        >
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.4)", padding: "4px 10px", borderRadius: 20, fontSize: 12, color: "#34d399", fontWeight: 600, marginBottom: 8 }}>
              <Sparkles size={14} /> Knowledge Engine & Blueprint Modeling
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 6px" }}>
              Katalog Prompt & Pemodelan Sub-bab AI
            </h2>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: 0, maxWidth: 720, lineHeight: 1.5 }}>
              Seluruh prompt, resep terstruktur 8-langkah per sub-bab, instruksi penulisan proposal, dan evaluasi literatur tersimpan dinamis di database. Anda dapat menyesuaikan panduan akademis secara real-time tanpa mengubah kode backend.
            </p>
          </div>

          <button
            onClick={fetchPrompts}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#ffffff",
              padding: "8px 14px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Sync Database
          </button>
        </div>

        {/* Filter Toolbar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
          {/* Search & Top Controls */}
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Search size={16} color="#94a3b8" style={{ position: "absolute", left: 14, top: 11 }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari berdasarkan judul, kode (misal: SUBCHAPTER_1_1), deskripsi, atau kata kunci..."
                style={{
                  width: "100%",
                  height: 38,
                  paddingLeft: 38,
                  paddingRight: 14,
                  borderRadius: 10,
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  fontSize: 13,
                  color: "#0f172a",
                  outline: "none",
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  style={{ position: "absolute", right: 10, top: 10, background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {selectedTag && (
              <button
                onClick={() => setSelectedTag(null)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 8,
                  background: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                  color: "#059669",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <span>Tag: #{selectedTag}</span>
                <X size={13} />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 14px",
                    borderRadius: 8,
                    fontSize: 12.5,
                    fontWeight: isSelected ? 700 : 500,
                    background: isSelected ? "#0f172a" : "#ffffff",
                    color: isSelected ? "#ffffff" : "#475569",
                    border: `1px solid ${isSelected ? "#0f172a" : "#e2e8f0"}`,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <Icon size={14} color={isSelected ? "#34d399" : "#64748b"} />
                  <span>{cat.label}</span>
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      padding: "1px 6px",
                      borderRadius: 10,
                      background: isSelected ? "rgba(255,255,255,0.2)" : "#f1f5f9",
                      color: isSelected ? "#ffffff" : "#64748b",
                    }}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Popular Tag Cloud */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", paddingTop: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginRight: 4 }}>
              Tag Populer:
            </span>
            {allTags.slice(0, 12).map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTag(selectedTag === t ? null : t)}
                style={{
                  fontSize: 11,
                  padding: "2px 8px",
                  borderRadius: 6,
                  background: selectedTag === t ? "#10b981" : "#ffffff",
                  color: selectedTag === t ? "#ffffff" : "#64748b",
                  border: `1px solid ${selectedTag === t ? "#10b981" : "#e2e8f0"}`,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <Tag size={10} />
                <span>#{t}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Prompts Cards Grid */}
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0" }}>
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredPrompts.length === 0 ? (
          <div
            style={{
              padding: "60px 20px",
              textAlign: "center",
              background: "#ffffff",
              borderRadius: 16,
              border: "1px solid #e2e8f0",
            }}
          >
            <Code2 size={36} color="#94a3b8" style={{ margin: "0 auto 12px" }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 4px" }}>
              Tidak ada prompt yang cocok
            </h3>
            <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
              Coba gunakan kata kunci pencarian lain atau bersihkan filter tag.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
              gap: 18,
            }}
          >
            {filteredPrompts.map((p) => {
              const tags = Array.isArray(p.tags) ? p.tags : [];
              const recipeSteps = Array.isArray(p.recipeSteps) ? p.recipeSteps : [];

              return (
                <div
                  key={p.id}
                  style={{
                    background: "#ffffff",
                    borderRadius: 14,
                    border: "1px solid #e2e8f0",
                    padding: 20,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: 14,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {/* Top Row: Category & Badges */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span
                          style={{
                            fontSize: 10.5,
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: 6,
                            background: p.category === "SUBCHAPTER" ? "#eff6ff" : p.category === "PROPOSAL" ? "#faf5ff" : "#ecfdf5",
                            color: p.category === "SUBCHAPTER" ? "#1d4ed8" : p.category === "PROPOSAL" ? "#7e22ce" : "#059669",
                            border: `1px solid ${p.category === "SUBCHAPTER" ? "#bfdbfe" : p.category === "PROPOSAL" ? "#e9d5ff" : "#a7f3d0"}`,
                          }}
                        >
                          {p.category}
                        </span>

                        <span style={{ fontSize: 10.5, color: "#94a3b8", fontFamily: "monospace" }}>
                          v{p.version}
                        </span>
                      </div>

                      <button
                        onClick={() => handleCopyCode(p.code)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 11,
                          fontFamily: "monospace",
                          color: copiedCode === p.code ? "#059669" : "#64748b",
                          background: copiedCode === p.code ? "#ecfdf5" : "#f1f5f9",
                          border: "1px solid #e2e8f0",
                          padding: "2px 6px",
                          borderRadius: 6,
                          cursor: "pointer",
                        }}
                        title="Salin identifier kode"
                      >
                        {copiedCode === p.code ? <Check size={11} /> : <Copy size={11} />}
                        <span>{p.code}</span>
                      </button>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 4px" }}>
                        {p.title}
                      </h3>
                      <p style={{ fontSize: 12.5, color: "#64748b", margin: 0, lineHeight: 1.45 }}>
                        {p.description || "Resep panduan riset dan instruksi akademis."}
                      </p>
                    </div>

                    {/* Step-by-Step Recipe Preview */}
                    {recipeSteps.length > 0 && (
                      <div style={{ background: "#f8fafc", borderRadius: 8, padding: 10, border: "1px solid #f1f5f9" }}>
                        <div style={{ fontSize: 10.5, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                          Resep Standar ({recipeSteps.length} Langkah):
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 110, overflowY: "auto" }}>
                          {recipeSteps.map((step, sIdx) => (
                            <div key={sIdx} style={{ fontSize: 11.5, color: "#334155", display: "flex", gap: 6, lineHeight: 1.35 }}>
                              <span style={{ color: "#10b981", fontWeight: 700, fontFamily: "monospace", flexShrink: 0 }}>
                                {sIdx + 1}.
                              </span>
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tags List */}
                    {tags.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, paddingTop: 2 }}>
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            onClick={() => setSelectedTag(tag)}
                            style={{
                              fontSize: 10.5,
                              padding: "2px 6px",
                              borderRadius: 4,
                              background: "#f1f5f9",
                              color: "#475569",
                              cursor: "pointer",
                            }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions Bottom Row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingTop: 10,
                      borderTop: "1px solid #f1f5f9",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {p.isSystem ? (
                        <span style={{ fontSize: 10.5, color: "#0369a1", background: "#e0f2fe", padding: "2px 6px", borderRadius: 4, fontWeight: 600 }}>
                          System Core
                        </span>
                      ) : (
                        <span style={{ fontSize: 10.5, color: "#7e22ce", background: "#f3e8ff", padding: "2px 6px", borderRadius: 4, fontWeight: 600 }}>
                          Custom Skill
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleOpenEdit(p)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "5px 12px",
                        borderRadius: 6,
                        background: "#f8fafc",
                        border: "1px solid #cbd5e1",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#0f172a",
                        cursor: "pointer",
                      }}
                    >
                      <Edit3 size={12} />
                      <span>Edit Prompt & Resep</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Edit / Create Modal */}
      {(editingPrompt || isCreating) && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: 20,
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: 16,
              maxWidth: 760,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: 28,
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e2e8f0", paddingBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                  {isCreating ? "Tambah Skill Prompt Baru" : `Edit Prompt: ${formData.title || formData.code}`}
                </h3>
                <span style={{ fontSize: 12, color: "#64748b" }}>
                  Identifier: <code style={{ color: "#059669", fontWeight: 700 }}>{formData.code}</code>
                </span>
              </div>
              <button
                onClick={() => { setEditingPrompt(null); setIsCreating(false); }}
                style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Row 0: Code Identifier (Locked on Edit) */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>
                    Kode Identifier Pemanggilan di Code
                  </label>
                  {!isCreating ? (
                    <span style={{ fontSize: 11, background: "#ecfdf5", color: "#059669", padding: "2px 8px", borderRadius: 6, fontWeight: 700, border: "1px solid #a7f3d0" }}>
                      🔒 Terkunci (Terhubung ke Backend)
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, color: "#64748b" }}>
                      Format UPPERCASE (Contoh: CUSTOM_METODOLOGI_AI)
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  required
                  disabled={!isCreating}
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s+/g, "_") })}
                  placeholder="Contoh: SUBCHAPTER_1_1"
                  style={{
                    width: "100%",
                    height: 38,
                    padding: "0 12px",
                    borderRadius: 8,
                    border: "1px solid #cbd5e1",
                    fontSize: 13,
                    fontFamily: "monospace",
                    fontWeight: 700,
                    background: !isCreating ? "#f1f5f9" : "#ffffff",
                    color: !isCreating ? "#64748b" : "#0f172a",
                    cursor: !isCreating ? "not-allowed" : "text",
                  }}
                />
              </div>

              {/* Row 1: Title & Category */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 180px", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                    Judul Skill / Sub-bab
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Contoh: BAB 1.1: Latar Belakang (Piramida Terbalik)"
                    style={{ width: "100%", height: 38, padding: "0 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13 }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                    Kategori
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: "100%", height: 38, padding: "0 8px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13, background: "#ffffff" }}
                  >
                    <option value="SUBCHAPTER">Sub-bab Outline</option>
                    <option value="OUTLINE">Blueprint Architect</option>
                    <option value="PROPOSAL">Proposal Drafter</option>
                    <option value="SCREENING">Screening Jurnal</option>
                    <option value="LITERATURE">Literature Search</option>
                    <option value="CUSTOM">Custom Skill</option>
                  </select>
                </div>
              </div>

              {/* Tags & Description */}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                  Tagging (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="bab1, latar_belakang, piramida_terbalik, 8_langkah, gap"
                  style={{ width: "100%", height: 38, padding: "0 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                  Deskripsi / Tujuan Akademis
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Uraian singkat tujuan instruksional dan peran akademik prompt ini..."
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13, fontFamily: "inherit" }}
                />
              </div>

              {/* Step-by-Step Recipe Builder */}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                  Resep Butir Langkah Baku ({formData.recipeSteps.length} Butir)
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8, maxHeight: 180, overflowY: "auto" }}>
                  {formData.recipeSteps.map((step, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, background: "#f8fafc", padding: "6px 10px", borderRadius: 6, border: "1px solid #e2e8f0" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#10b981", width: 20 }}>{idx + 1}.</span>
                      <span style={{ fontSize: 12, color: "#1e293b", flex: 1 }}>{step}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveStep(idx)}
                        style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    value={newStepText}
                    onChange={(e) => setNewStepText(e.target.value)}
                    placeholder="Ketik butir instruksi langkah baru..."
                    style={{ flex: 1, height: 36, padding: "0 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 12.5 }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddStep();
                      }
                    }}
                  />
                  <Button type="button" size="sm" variant="secondary" onClick={handleAddStep}>
                    + Tambah Butir
                  </Button>
                </div>
              </div>

              {/* System Prompt Code Box */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>
                    System Prompt Template (AI Instructions)
                  </label>
                  <span style={{ fontSize: 11, color: "#64748b" }}>
                    Gunakan variabel: <code style={{ color: "#059669" }}>{"{{TOPIC}}"}</code>, <code style={{ color: "#059669" }}>{"{{PRODI}}"}</code>
                  </span>
                </div>
                <textarea
                  rows={6}
                  required
                  value={formData.systemPrompt}
                  onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid #cbd5e1",
                    fontSize: 12.5,
                    fontFamily: "monospace",
                    background: "#0f172a",
                    color: "#f8fafc",
                    lineHeight: 1.45,
                  }}
                />
              </div>

              {/* Bottom Buttons */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10, paddingTop: 10, borderTop: "1px solid #e2e8f0" }}>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => { setEditingPrompt(null); setIsCreating(false); }}
                >
                  Batal
                </Button>

                <Button
                  type="submit"
                  variant="emerald"
                  disabled={saving}
                >
                  {saving ? "Menyimpan ke Database..." : "Simpan Perubahan ke Database"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
