"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import RuleCard from "@/components/admin/rules/RuleCard";
import { api, Rule, RuleVariant } from "@/lib/api-client";
import {
  Plus,
  Search,
  SlidersHorizontal,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  X,
  Code,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminRulesPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  // Modal State: Create / Edit Rule
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [ruleForm, setRuleForm] = useState({
    slug: "",
    name: "",
    category: "WRITING_STYLE",
    description: "",
    systemPrompt: "",
  });
  const [savingRule, setSavingRule] = useState(false);

  // Modal State: Add / Edit Variant
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [activeRuleForVariant, setActiveRuleForVariant] = useState<Rule | null>(null);
  const [editingVariant, setEditingVariant] = useState<RuleVariant | null>(null);
  const [variantForm, setVariantForm] = useState({
    researchApproach: "KUANTITATIF",
    systemPrompt: "",
  });
  const [savingVariant, setSavingVariant] = useState(false);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await api.rules.list();
      if (res.success) {
        setRules(res.data);
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal memuat daftar rules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  // Filter Rules
  const filteredRules = rules.filter((r) => {
    const matchesCategory = categoryFilter === "ALL" || r.category === categoryFilter;
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.slug.toLowerCase().includes(search.toLowerCase()) ||
      (r.description || "").toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Open Create Rule Modal
  const handleOpenCreateRule = () => {
    setEditingRule(null);
    setRuleForm({
      slug: "",
      name: "",
      category: "WRITING_STYLE",
      description: "",
      systemPrompt: "",
    });
    setShowRuleModal(true);
  };

  // Open Edit Rule Modal
  const handleOpenEditRule = (rule: Rule) => {
    setEditingRule(rule);
    setRuleForm({
      slug: rule.slug,
      name: rule.name,
      category: rule.category,
      description: rule.description || "",
      systemPrompt: rule.systemPrompt,
    });
    setShowRuleModal(true);
  };

  // Save Rule (Create / Update)
  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleForm.slug.trim() || !ruleForm.name.trim() || !ruleForm.systemPrompt.trim()) {
      toast.error("Nama, slug, dan prompt wajib diisi");
      return;
    }

    setSavingRule(true);
    try {
      if (editingRule) {
        await api.rules.update(editingRule.id, ruleForm);
        toast.success(`Rule "${ruleForm.name}" berhasil diperbarui`);
      } else {
        await api.rules.create(ruleForm);
        toast.success(`Rule "${ruleForm.name}" berhasil dibuat`);
      }
      setShowRuleModal(false);
      fetchRules();
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan rule");
    } finally {
      setSavingRule(false);
    }
  };

  // Delete Rule
  const handleDeleteRule = async (rule: Rule) => {
    if (!confirm(`Hapus rule "${rule.name}"? Pemasangan rule ini pada sub-bab akan ikut terlepas.`)) {
      return;
    }

    try {
      await api.rules.delete(rule.id);
      toast.success("Rule berhasil dihapus");
      fetchRules();
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus rule");
    }
  };

  // Open Add Variant Modal
  const handleOpenAddVariant = (rule: Rule) => {
    setActiveRuleForVariant(rule);
    setEditingVariant(null);
    setVariantForm({
      researchApproach: "KUANTITATIF",
      systemPrompt: rule.systemPrompt || "",
    });
    setShowVariantModal(true);
  };

  // Open Edit Variant Modal
  const handleOpenEditVariant = (rule: Rule, variant: RuleVariant) => {
    setActiveRuleForVariant(rule);
    setEditingVariant(variant);
    setVariantForm({
      researchApproach: variant.researchApproach,
      systemPrompt: variant.systemPrompt,
    });
    setShowVariantModal(true);
  };

  // Save Variant
  const handleSaveVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRuleForVariant) return;

    setSavingVariant(true);
    try {
      await api.rules.upsertVariant(activeRuleForVariant.id, variantForm);
      toast.success(`Varian ${variantForm.researchApproach} berhasil disimpan`);
      setShowVariantModal(false);
      fetchRules();
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan varian");
    } finally {
      setSavingVariant(false);
    }
  };

  // Delete Variant
  const handleDeleteVariant = async (rule: Rule, variantId: string) => {
    if (!confirm("Hapus varian pendekatan ini?")) return;

    try {
      await api.rules.deleteVariant(rule.id, variantId);
      toast.success("Varian berhasil dihapus");
      fetchRules();
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus varian");
    }
  };

  // Compute Stats
  const totalRules = rules.length;
  const writingCount = rules.filter((r) => r.category === "WRITING_STYLE").length;
  const structCount = rules.filter((r) => r.category === "STRUCTURAL").length;
  const citeCount = rules.filter((r) => r.category === "CITATION").length;
  const totalVariants = rules.reduce((acc, r) => acc + (r.variants?.length || 0), 0);

  return (
    <AdminLayout
      activeMenu="rules"
      title="Manajemen Rules & Varian Riset"
      subtitle="Kelola resep prompt reusable dan variasikan instruksi AI per jenis penelitian (Kuantitatif, Kualitatif, Eksperimen, dll)."
      actionButton={
        <button
          onClick={handleOpenCreateRule}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#059669] hover:bg-[#047857] rounded-full shadow-sm transition-all"
        >
          <Plus size={15} />
          <span>Buat Rule Baru</span>
        </button>
      }
    >
      {/* Stat Bar (Fluento Clean Dual-Tone) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card-fluento p-4 bg-white">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Rules
          </div>
          <div className="font-display font-extrabold text-2xl text-slate-900 mt-1">
            {totalRules}
          </div>
        </div>

        <div className="card-fluento p-4 bg-white">
          <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
            Writing Style
          </div>
          <div className="font-display font-extrabold text-2xl text-emerald-700 mt-1">
            {writingCount}
          </div>
        </div>

        <div className="card-fluento p-4 bg-white">
          <div className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">
            Struktural
          </div>
          <div className="font-display font-extrabold text-2xl text-blue-700 mt-1">
            {structCount}
          </div>
        </div>

        <div className="card-fluento p-4 bg-white">
          <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">
            Varian Riset
          </div>
          <div className="font-display font-extrabold text-2xl text-amber-700 mt-1">
            {totalVariants}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="card-fluento p-4 bg-white space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "ALL", label: "Semua Kategori" },
              { id: "WRITING_STYLE", label: "Writing Style" },
              { id: "STRUCTURAL", label: "Struktural" },
              { id: "CITATION", label: "Sitasi & Kutipan" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCategoryFilter(tab.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  categoryFilter === tab.id
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative sm:w-72">
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari rule berdasarkan nama/slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Rule Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 space-y-2">
          <RefreshCw size={24} className="animate-spin mx-auto text-emerald-600" />
          <p className="text-xs">Memuat daftar rules...</p>
        </div>
      ) : filteredRules.length > 0 ? (
        <div className="space-y-3">
          {filteredRules.map((rule) => (
            <RuleCard
              key={rule.id}
              rule={rule}
              onEdit={handleOpenEditRule}
              onDelete={handleDeleteRule}
              onAddVariant={handleOpenAddVariant}
              onEditVariant={handleOpenEditVariant}
              onDeleteVariant={handleDeleteVariant}
            />
          ))}
        </div>
      ) : (
        <div className="card-fluento p-12 text-center text-slate-400 bg-white space-y-2">
          <SlidersHorizontal size={28} className="mx-auto text-slate-300" />
          <p className="text-sm font-semibold text-slate-700">Tidak ada Rule yang cocok</p>
          <p className="text-xs text-slate-400">
            Coba ubah kata kunci pencarian atau buat rule baru.
          </p>
        </div>
      )}

      {/* ── Modal: Buat / Edit Rule ── */}
      {showRuleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-display font-bold text-base text-slate-900">
                {editingRule ? "Edit Rule" : "Buat Rule Baru"}
              </h3>
              <button
                onClick={() => setShowRuleModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Rule</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Anti AI-Slop & Bahasa Baku"
                  value={ruleForm.name}
                  onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Slug (Identifier Unik)</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingRule}
                    placeholder="wiriting-ai-slop"
                    value={ruleForm.slug}
                    onChange={(e) => setRuleForm({ ...ruleForm, slug: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 font-mono disabled:bg-slate-50"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kategori</label>
                  <select
                    value={ruleForm.category}
                    onChange={(e) => setRuleForm({ ...ruleForm, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 font-sans"
                  >
                    <option value="WRITING_STYLE">WRITING_STYLE (Gaya Penulisan)</option>
                    <option value="STRUCTURAL">STRUCTURAL (Struktur Dokumen)</option>
                    <option value="CITATION">CITATION (Kebijakan Sitasi)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Deskripsi Singkat (Opsional)</label>
                <input
                  type="text"
                  placeholder="Penjelasan tujuan aturan ini..."
                  value={ruleForm.description}
                  onChange={(e) => setRuleForm({ ...ruleForm, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 font-sans"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Base System Prompt</label>
                <textarea
                  rows={6}
                  required
                  placeholder="Instruksi sistem yang akan disuntikkan ke AI saat generate naskah..."
                  value={ruleForm.systemPrompt}
                  onChange={(e) => setRuleForm({ ...ruleForm, systemPrompt: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 font-mono text-xs leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRuleModal(false)}
                  className="px-4 py-2 rounded-full text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingRule}
                  className="px-5 py-2 rounded-full bg-[#059669] hover:bg-[#047857] text-white font-semibold disabled:opacity-50"
                >
                  {savingRule ? "Menyimpan..." : "Simpan Rule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Tambah / Edit Varian Riset ── */}
      {showVariantModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-display font-bold text-base text-slate-900">
                  {editingVariant ? "Edit Varian Riset" : "Tambah Varian Riset"}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Rule: {activeRuleForVariant?.name}
                </p>
              </div>
              <button
                onClick={() => setShowVariantModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveVariant} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Jenis Pendekatan Penelitian
                </label>
                <select
                  disabled={!!editingVariant}
                  value={variantForm.researchApproach}
                  onChange={(e) =>
                    setVariantForm({ ...variantForm, researchApproach: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 font-sans disabled:bg-slate-50"
                >
                  <option value="KUANTITATIF">KUANTITATIF (Statistik, Hipotesis, Regresi)</option>
                  <option value="KUALITATIF">KUALITATIF (Induktif, Wawancara, Reduksi Data)</option>
                  <option value="EKSPERIMEN">EKSPERIMEN (Benchmark Algoritma, Telemetri, Latensi)</option>
                  <option value="CAMPURAN">CAMPURAN (Mixed Methods Explanatory / Exploratory)</option>
                  <option value="DESKRIPTIF">DESKRIPTIF (Pemetaan Fakta Lapangan)</option>
                  <option value="EMPIRIS">EMPIRIS (Observasi Lapangan Riil)</option>
                  <option value="GENERIC">GENERIC (Fallback Umum)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Instruksi Prompt Spesifik untuk Pendekatan Ini
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="Tuliskan instruksi prompt khusus yang relevan dengan metode penelitian ini..."
                  value={variantForm.systemPrompt}
                  onChange={(e) =>
                    setVariantForm({ ...variantForm, systemPrompt: e.target.value })
                  }
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 font-mono text-xs leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowVariantModal(false)}
                  className="px-4 py-2 rounded-full text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingVariant}
                  className="px-5 py-2 rounded-full bg-[#059669] hover:bg-[#047857] text-white font-semibold disabled:opacity-50"
                >
                  {savingVariant ? "Menyimpan..." : "Simpan Varian"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
