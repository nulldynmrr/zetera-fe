"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import RuleMappingPicker, { SelectedRuleItem } from "@/components/admin/subbab/RuleMappingPicker";
import OutputSpecForm from "@/components/admin/subbab/OutputSpecForm";
import { api, SubBab, Rule, OutputSpec } from "@/lib/api-client";
import {
  Layers,
  SlidersHorizontal,
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  FileText,
  ListOrdered,
  Table,
  CheckCircle2,
  RefreshCw,
  X,
  Sparkles,
  Settings2,
  Tag,
  ChevronDown,
  ChevronUp,
  BookOpenCheck,
} from "lucide-react";
import { toast } from "sonner";
import { getSubBabSynonyms } from "@/lib/subbab-dictionary";

export default function AdminSubBabPage() {
  const [subBabs, setSubBabs] = useState<SubBab[]>([]);
  const [availableRules, setAvailableRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [babFilter, setBabFilter] = useState<string>("ALL");
  const [viewingSynonymsFor, setViewingSynonymsFor] = useState<string | null>(null);

  // Modal State: Setup Rules & Output Spec
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [activeSubBab, setActiveSubBab] = useState<SubBab | null>(null);
  const [setupTab, setSetupTab] = useState<"RULES" | "OUTPUT_SPEC" | "SYNONYMS">("RULES");
  const [selectedRules, setSelectedRules] = useState<SelectedRuleItem[]>([]);
  const [outputSpecState, setOutputSpecState] = useState<Partial<OutputSpec>>({
    formatStyle: "PARAGRAPH",
    citationPolicy: "OPTIONAL",
    renderTemplate: "",
  });
  const [savingSetup, setSavingSetup] = useState(false);

  // Modal State: Create SubBab
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    tag: "",
    title: "",
    bab: 1,
    order: 1,
    formatStyle: "PARAGRAPH",
    citationPolicy: "OPTIONAL",
  });
  const [creatingSubBab, setCreatingSubBab] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subRes, rulesRes] = await Promise.all([
        api.subbab.list(),
        api.rules.list(),
      ]);

      if (subRes.success) setSubBabs(subRes.data);
      if (rulesRes.success) setAvailableRules(rulesRes.data);
    } catch (err: any) {
      toast.error(err.message || "Gagal memuat data sub-bab");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter SubBabs
  const filteredSubBabs = subBabs.filter((s) => {
    if (babFilter === "ALL") return true;
    return String(s.bab) === babFilter;
  });

  // Open Setup Modal
  const handleOpenSetup = (subBab: SubBab) => {
    setActiveSubBab(subBab);
    setSetupTab("RULES");

    // Initialize selected rules
    const items: SelectedRuleItem[] = (subBab.mappings || []).map((m) => ({
      ruleId: m.ruleId,
      order: m.order,
      isRequired: m.isRequired,
      rule: m.rule,
    }));
    setSelectedRules(items);

    // Initialize output spec
    setOutputSpecState({
      formatStyle: subBab.outputSpec?.formatStyle || "PARAGRAPH",
      citationPolicy: subBab.outputSpec?.citationPolicy || "OPTIONAL",
      renderTemplate: subBab.outputSpec?.renderTemplate || "",
    });

    setShowSetupModal(true);
  };

  // Save Setup (Both Rules & OutputSpec)
  const handleSaveSetup = async () => {
    if (!activeSubBab) return;

    setSavingSetup(true);
    try {
      // 1. Simpan Rule Mappings
      const rulesPayload = selectedRules.map((s, idx) => ({
        ruleId: s.ruleId,
        order: idx + 1,
        isRequired: s.isRequired,
      }));

      await api.subbab.setRules(activeSubBab.id, rulesPayload);

      // 2. Simpan Output Spec
      await api.subbab.updateOutputSpec(activeSubBab.id, outputSpecState);

      toast.success(`Konfigurasi "${activeSubBab.title}" berhasil disimpan!`);
      setShowSetupModal(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan konfigurasi sub-bab");
    } finally {
      setSavingSetup(false);
    }
  };

  // Create SubBab Submit
  const handleCreateSubBab = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.tag.trim() || !createForm.title.trim()) {
      toast.error("Tag dan judul wajib diisi");
      return;
    }

    setCreatingSubBab(true);
    try {
      await api.subbab.create({
        tag: createForm.tag,
        title: createForm.title,
        bab: createForm.bab,
        order: createForm.order,
        outputSpec: {
          formatStyle: createForm.formatStyle,
          citationPolicy: createForm.citationPolicy,
        },
      });

      toast.success(`Sub-bab "${createForm.title}" berhasil dibuat`);
      setShowCreateModal(false);
      setCreateForm({
        tag: "",
        title: "",
        bab: 1,
        order: 1,
        formatStyle: "PARAGRAPH",
        citationPolicy: "OPTIONAL",
      });
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Gagal membuat sub-bab");
    } finally {
      setCreatingSubBab(false);
    }
  };

  // Delete SubBab
  const handleDeleteSubBab = async (subBab: SubBab) => {
    if (!confirm(`Hapus sub-bab "${subBab.title}"?`)) return;

    try {
      await api.subbab.delete(subBab.id);
      toast.success("Sub-bab berhasil dihapus");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus sub-bab");
    }
  };

  // Helper icons for formatStyle
  const getFormatIcon = (format?: string) => {
    switch (format?.toUpperCase()) {
      case "ROADMAP":
        return <BookOpen size={13} className="text-emerald-600" />;
      case "NUMBERED_LIST":
      case "LIST":
        return <ListOrdered size={13} className="text-blue-600" />;
      case "TABLE":
        return <Table size={13} className="text-purple-600" />;
      case "PARAGRAPH":
      default:
        return <FileText size={13} className="text-slate-600" />;
    }
  };

  const getBabLabel = (bab: number) => {
    if (bab === 0) return "Kelengkapan Dokumen";
    if (bab === 1) return "Bab I — Pendahuluan";
    if (bab === 2) return "Bab II — Tinjauan Pustaka";
    if (bab === 3) return "Bab III — Metodologi";
    return `Bab ${bab}`;
  };

  return (
    <AdminLayout
      activeMenu="subbab"
      title="Manajemen Sub Bab & Output Spec"
      subtitle="Atur daftar sub-bab skripsi, pasang Rules (N:N) yang relevan, dan tentukan layout format output tanpa perlu coding."
      actionButton={
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#059669] hover:bg-[#047857] rounded-full shadow-sm transition-all"
        >
          <Plus size={15} />
          <span>Tambah Sub Bab</span>
        </button>
      }
    >
      {/* Stat Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="card-fluento p-3.5 bg-white">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Sub-bab
          </div>
          <div className="font-display font-extrabold text-xl text-slate-900 mt-0.5">
            {subBabs.length}
          </div>
        </div>

        <div className="card-fluento p-3.5 bg-white">
          <div className="text-[10px] font-semibold text-purple-700 uppercase tracking-wider">
            Dokumen (0)
          </div>
          <div className="font-display font-extrabold text-xl text-purple-700 mt-0.5">
            {subBabs.filter((s) => s.bab === 0).length}
          </div>
        </div>

        <div className="card-fluento p-3.5 bg-white">
          <div className="text-[10px] font-semibold text-blue-700 uppercase tracking-wider">
            Bab I
          </div>
          <div className="font-display font-extrabold text-xl text-blue-700 mt-0.5">
            {subBabs.filter((s) => s.bab === 1).length}
          </div>
        </div>

        <div className="card-fluento p-3.5 bg-white">
          <div className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">
            Bab II
          </div>
          <div className="font-display font-extrabold text-xl text-emerald-700 mt-0.5">
            {subBabs.filter((s) => s.bab === 2).length}
          </div>
        </div>

        <div className="card-fluento p-3.5 bg-white">
          <div className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider">
            Bab III
          </div>
          <div className="font-display font-extrabold text-xl text-amber-700 mt-0.5">
            {subBabs.filter((s) => s.bab === 3).length}
          </div>
        </div>
      </div>

      {/* Chapter Filter Bar */}
      <div className="card-fluento p-3 bg-white">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "ALL", label: "Semua Bab" },
            { id: "0", label: "Dokumen (0)" },
            { id: "1", label: "Bab I — Pendahuluan" },
            { id: "2", label: "Bab II — Pustaka" },
            { id: "3", label: "Bab III — Metodologi" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setBabFilter(tab.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                babFilter === tab.id
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* SubBabs List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 space-y-2">
          <RefreshCw size={24} className="animate-spin mx-auto text-emerald-600" />
          <p className="text-xs">Memuat daftar sub-bab...</p>
        </div>
      ) : filteredSubBabs.length > 0 ? (
        <div className="space-y-3">
          {filteredSubBabs.map((sub) => {
            const formatStyle = sub.outputSpec?.formatStyle || "PARAGRAPH";
            const citationPolicy = sub.outputSpec?.citationPolicy || "OPTIONAL";
            const mappings = sub.mappings || [];

            const synonyms = getSubBabSynonyms(sub.tag) || getSubBabSynonyms(sub.title) || [];

            return (
              <div
                key={sub.id}
                className="card-fluento p-4 bg-white hover:border-slate-300 transition-all space-y-3"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {getBabLabel(sub.bab)}
                      </span>
                      <h3 className="font-display font-bold text-sm text-slate-900">
                        {sub.title}
                      </h3>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono">
                        #{sub.tag}
                      </span>

                      {/* Sinonim & Variasi Tagging Badge */}
                      {synonyms.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setViewingSynonymsFor(viewingSynonymsFor === sub.id ? null : sub.id)}
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full transition-all cursor-pointer border ${
                            viewingSynonymsFor === sub.id
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100"
                          }`}
                          title="Klik untuk melihat semua sinonim dan variasi nama yang dikenali sistem"
                        >
                          <Tag size={11} className={viewingSynonymsFor === sub.id ? "text-white" : "text-emerald-600"} />
                          <span>+{synonyms.length} Sinonim</span>
                          {viewingSynonymsFor === sub.id ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                        </button>
                      )}
                    </div>

                    {/* Output Spec Badges */}
                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {getFormatIcon(formatStyle)}
                        <span>Format: {formatStyle}</span>
                      </span>

                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                          citationPolicy === "REQUIRED"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : citationPolicy === "NONE"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        Sitasi: {citationPolicy}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0 pt-1 sm:pt-0">
                    <button
                      onClick={() => handleOpenSetup(sub)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-full transition-colors"
                    >
                      <Settings2 size={13} />
                      <span>Setup Rules & Output</span>
                    </button>

                    <button
                      onClick={() => handleDeleteSubBab(sub)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Hapus Sub-bab"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Expandable Synonyms Panel */}
                {viewingSynonymsFor === sub.id && synonyms.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-50/70 via-slate-50 to-white border border-emerald-200/80 text-xs space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-semibold text-emerald-950">
                        <Sparkles size={13} className="text-emerald-600" />
                        <span>Variasi Nama & Sinonim Terpetakan (Kamus Sub-Bab)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setViewingSynonymsFor(null)}
                        className="text-[11px] text-slate-400 hover:text-slate-700 underline"
                      >
                        Tutup
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Pengguna bebas menamai sub-bab mereka secara bervariasi. Sistem Zetera otomatis memetakan seluruh nama di bawah ini ke konfigurasi Rules & Output Spec ini:
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-600 text-white font-bold text-[11px] shadow-xs">
                        <span>{sub.tag}</span>
                        <span className="text-[9px] opacity-80 font-normal">(Default Utama)</span>
                      </span>
                      {synonyms.map((syn, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:border-emerald-300 text-slate-700 text-[11px] font-medium shadow-2xs transition-colors"
                        >
                          {syn}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rules Attached Tags */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-[11px] font-medium text-slate-400 mr-1 flex items-center gap-1">
                    <SlidersHorizontal size={11} />
                    Rules ({mappings.length}):
                  </span>
                  {mappings.length > 0 ? (
                    mappings.map((m) => (
                      <span
                        key={m.id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-50 text-slate-700 border border-slate-200/80"
                      >
                        <span>{m.rule?.name || m.ruleId}</span>
                        {m.isRequired && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Wajib" />
                        )}
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">
                      Belum ada Rules dipasang.
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card-fluento p-12 text-center text-slate-400 bg-white space-y-2">
          <Layers size={28} className="mx-auto text-slate-300" />
          <p className="text-sm font-semibold text-slate-700">Tidak ada Sub-bab</p>
        </div>
      )}

      {/* ── Modal: Setup Rules & Output Spec ── */}
      {showSetupModal && activeSubBab && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-6 space-y-4 shadow-xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-shrink-0">
              <div>
                <h3 className="font-display font-bold text-base text-slate-900">
                  Setup Sub-bab: {activeSubBab.title}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Tag: #{activeSubBab.tag} • {getBabLabel(activeSubBab.bab)}
                </p>
              </div>
              <button
                onClick={() => setShowSetupModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => setSetupTab("RULES")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  setupTab === "RULES"
                    ? "bg-[#059669] text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                1. Pasang Rules ({selectedRules.length})
              </button>

              <button
                type="button"
                onClick={() => setSetupTab("OUTPUT_SPEC")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  setupTab === "OUTPUT_SPEC"
                    ? "bg-[#059669] text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                2. Output Spec & Format ({outputSpecState.formatStyle})
              </button>

              <button
                type="button"
                onClick={() => setSetupTab("SYNONYMS")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  setupTab === "SYNONYMS"
                    ? "bg-[#059669] text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                3. Kamus Sinonim & Tagging ({getSubBabSynonyms(activeSubBab.tag).length})
              </button>
            </div>

            {/* Modal Content Scrollable */}
            <div className="flex-1 overflow-y-auto pr-1 py-1">
              {setupTab === "RULES" ? (
                <RuleMappingPicker
                  availableRules={availableRules}
                  selectedRules={selectedRules}
                  onChange={setSelectedRules}
                />
              ) : setupTab === "OUTPUT_SPEC" ? (
                <OutputSpecForm
                  value={outputSpecState}
                  onChange={setOutputSpecState}
                />
              ) : (
                <div className="space-y-4 p-2">
                  <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs space-y-2">
                    <div className="flex items-center gap-2 font-bold text-emerald-950">
                      <BookOpenCheck size={16} className="text-emerald-600" />
                      <span>Pemetaan Fleksibel Variasi Judul Sub-Bab Mahasiswa</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      Mahasiswa atau pengguna sering kali menggunakan variasi penamaan yang berbeda-beda untuk sub-bab yang sama. 
                      Sistem Zetera secara otomatis mencocokkan variasi nama berikut dengan sub-bab ini sehingga Rules (N:N) dan Output Spec tetap berjalan presisi tanpa membatasi kreativitas judul pengguna.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="font-bold text-xs text-slate-800 block">
                      Tag Default / Utama (System Canonical)
                    </label>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-mono font-bold">
                      <span>#{activeSubBab.tag}</span>
                      <span className="text-[10px] text-emerald-400 font-sans font-normal">(Primary Tag)</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-bold text-xs text-slate-800 block">
                      Daftar Variasi & Sinonim yang Otomatis Dipetakan ({getSubBabSynonyms(activeSubBab.tag).length} Variasi)
                    </label>
                    <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                      {getSubBabSynonyms(activeSubBab.tag).length > 0 ? (
                        getSubBabSynonyms(activeSubBab.tag).map((syn, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs font-medium shadow-2xs"
                          >
                            {syn}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">
                          Belum ada variasi khusus yang didaftarkan untuk tag ini.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowSetupModal(false)}
                className="px-4 py-2 rounded-full text-xs text-slate-600 hover:bg-slate-100 font-medium"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={savingSetup}
                onClick={handleSaveSetup}
                className="px-5 py-2 rounded-full text-xs bg-[#059669] hover:bg-[#047857] text-white font-semibold shadow-sm disabled:opacity-50"
              >
                {savingSetup ? "Menyimpan..." : "Simpan Konfigurasi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Tambah Sub Bab Baru ── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-display font-bold text-base text-slate-900">
                Tambah Sub-bab Baru
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubBab} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Judul Sub-bab</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Manfaat Penelitian"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tag (Slug)</label>
                  <input
                    type="text"
                    required
                    placeholder="manfaat_penelitian"
                    value={createForm.tag}
                    onChange={(e) => setCreateForm({ ...createForm, tag: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Bab</label>
                  <select
                    value={createForm.bab}
                    onChange={(e) => setCreateForm({ ...createForm, bab: parseInt(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 font-sans"
                  >
                    <option value={0}>Dokumen (0)</option>
                    <option value={1}>Bab I (Pendahuluan)</option>
                    <option value={2}>Bab II (Pustaka)</option>
                    <option value={3}>Bab III (Metodologi)</option>
                    <option value={4}>Bab IV (Hasil)</option>
                    <option value={5}>Bab V (Penutup)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Format Layout</label>
                  <select
                    value={createForm.formatStyle}
                    onChange={(e) => setCreateForm({ ...createForm, formatStyle: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 font-sans"
                  >
                    <option value="PARAGRAPH">PARAGRAPH</option>
                    <option value="ROADMAP">ROADMAP</option>
                    <option value="NUMBERED_LIST">NUMBERED_LIST</option>
                    <option value="TABLE">TABLE</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kebijakan Sitasi</label>
                  <select
                    value={createForm.citationPolicy}
                    onChange={(e) => setCreateForm({ ...createForm, citationPolicy: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 font-sans"
                  >
                    <option value="OPTIONAL">OPTIONAL</option>
                    <option value="REQUIRED">REQUIRED</option>
                    <option value="NONE">NONE</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-full text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={creatingSubBab}
                  className="px-5 py-2 rounded-full bg-[#059669] hover:bg-[#047857] text-white font-semibold disabled:opacity-50"
                >
                  {creatingSubBab ? "Menyimpan..." : "Buat Sub-bab"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
