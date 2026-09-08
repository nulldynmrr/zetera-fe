"use client";

import React, { useState } from "react";
import {
  Check,
  ChevronUp,
  ChevronDown,
  Search,
  SlidersHorizontal,
  X,
  GripVertical,
  Plus,
  ShieldAlert,
} from "lucide-react";
import { Rule } from "@/lib/api-client";

export interface SelectedRuleItem {
  ruleId: string;
  order: number;
  isRequired: boolean;
  rule?: Rule;
}

interface RuleMappingPickerProps {
  availableRules: Rule[];
  selectedRules: SelectedRuleItem[];
  onChange: (items: SelectedRuleItem[]) => void;
}

export const RuleMappingPicker: React.FC<RuleMappingPickerProps> = ({
  availableRules = [],
  selectedRules = [],
  onChange,
}) => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const selectedRuleIds = new Set(selectedRules.map((s) => s.ruleId));

  const handleToggleRule = (rule: Rule) => {
    if (selectedRuleIds.has(rule.id)) {
      // Remove
      const filtered = selectedRules
        .filter((s) => s.ruleId !== rule.id)
        .map((s, idx) => ({ ...s, order: idx + 1 }));
      onChange(filtered);
    } else {
      // Add to end
      const newItem: SelectedRuleItem = {
        ruleId: rule.id,
        order: selectedRules.length + 1,
        isRequired: true,
        rule,
      };
      onChange([...selectedRules, newItem]);
    }
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const newItems = [...selectedRules];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    const reordered = newItems.map((item, idx) => ({
      ...item,
      order: idx + 1,
    }));
    onChange(reordered);
  };

  const handleToggleRequired = (ruleId: string) => {
    const updated = selectedRules.map((item) =>
      item.ruleId === ruleId ? { ...item, isRequired: !item.isRequired } : item
    );
    onChange(updated);
  };

  const filteredRules = availableRules.filter((r) => {
    const matchesCategory = categoryFilter === "ALL" || r.category === categoryFilter;
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.slug.toLowerCase().includes(search.toLowerCase()) ||
      (r.description || "").toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-4 font-body">
      {/* 1. Active Selected Rules (Ordered) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
            <SlidersHorizontal size={13} className="text-emerald-600" />
            <span>Rules Terpasang ({selectedRules.length})</span>
          </label>
          <span className="text-[11px] text-slate-400">
            Urutan menentukan hierarki instruksi sistem
          </span>
        </div>

        {selectedRules.length > 0 ? (
          <div className="space-y-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
            {selectedRules.map((item, idx) => {
              const rule = item.rule || availableRules.find((r) => r.id === item.ruleId);
              if (!rule) return null;

              return (
                <div
                  key={rule.id}
                  className="flex items-center justify-between gap-3 p-2.5 bg-white rounded-lg border border-slate-200 shadow-none text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 truncate">
                        {rule.name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {rule.slug} • {rule.category}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Wajib Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleRequired(rule.id)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-colors ${
                        item.isRequired
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-500 border-slate-200"
                      }`}
                    >
                      {item.isRequired ? "Wajib" : "Opsional"}
                    </button>

                    {/* Up & Down Order Buttons */}
                    <div className="flex items-center">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMove(idx, "up")}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                        title="Geser ke atas"
                      >
                        <ChevronUp size={13} />
                      </button>
                      <button
                        type="button"
                        disabled={idx === selectedRules.length - 1}
                        onClick={() => handleMove(idx, "down")}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                        title="Geser ke bawah"
                      >
                        <ChevronDown size={13} />
                      </button>
                    </div>

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => handleToggleRule(rule)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      title="Lepas Rule"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-400 bg-slate-50/50">
            Belum ada Rule yang dipasang ke sub-bab ini. Pilih dari daftar di bawah.
          </div>
        )}
      </div>

      {/* 2. Rule Catalogue / Picker */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-bold text-slate-900 uppercase tracking-wide">
            Katalog Rules Tersedia
          </label>

          {/* Filter tabs */}
          <div className="flex items-center gap-1">
            {["ALL", "WRITING_STYLE", "STRUCTURAL", "CITATION"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors ${
                  categoryFilter === cat
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat === "ALL" ? "Semua" : cat === "WRITING_STYLE" ? "Style" : cat === "STRUCTURAL" ? "Struktur" : "Sitasi"}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari rule berdasarkan nama atau slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* List of Available Rules */}
        <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
          {filteredRules.map((rule) => {
            const isSelected = selectedRuleIds.has(rule.id);

            return (
              <div
                key={rule.id}
                onClick={() => handleToggleRule(rule)}
                className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-50/40 text-emerald-950"
                    : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                }`}
              >
                <div className="min-w-0 flex-1 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs truncate">{rule.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                      {rule.slug}
                    </span>
                  </div>
                  {rule.description && (
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {rule.description}
                    </p>
                  )}
                </div>

                <div className="flex-shrink-0">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                      isSelected
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {isSelected && <Check size={12} />}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RuleMappingPicker;
