"use client";

import React, { useState } from "react";
import {
  SlidersHorizontal,
  Layers,
  ChevronDown,
  ChevronUp,
  Plus,
  Pencil,
  Trash2,
  Copy,
  Check,
  Sparkles,
  BookOpen,
  Code,
  Tag,
} from "lucide-react";
import { Rule, RuleVariant } from "@/lib/api-client";
import { toast } from "sonner";

interface RuleCardProps {
  rule: Rule;
  onEdit: (rule: Rule) => void;
  onDelete: (rule: Rule) => void;
  onAddVariant: (rule: Rule) => void;
  onEditVariant: (rule: Rule, variant: RuleVariant) => void;
  onDeleteVariant: (rule: Rule, variantId: string) => void;
}

export const RuleCard: React.FC<RuleCardProps> = ({
  rule,
  onEdit,
  onDelete,
  onAddVariant,
  onEditVariant,
  onDeleteVariant,
}) => {
  const [expandedPrompt, setExpandedPrompt] = useState(false);
  const [expandedVariants, setExpandedVariants] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Prompt disalin ke clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const categoryStyles: Record<string, { label: string; badge: string }> = {
    WRITING_STYLE: {
      label: "Writing Style",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    STRUCTURAL: {
      label: "Struktural",
      badge: "bg-blue-50 text-blue-700 border-blue-200",
    },
    CITATION: {
      label: "Sitasi & Kutipan",
      badge: "bg-purple-50 text-purple-700 border-purple-200",
    },
  };

  const cat = categoryStyles[rule.category] || {
    label: rule.category,
    badge: "bg-slate-100 text-slate-700 border-slate-200",
  };

  const variants = rule.variants || [];

  return (
    <div className="card-fluento p-5 transition-all bg-white hover:border-slate-300">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="space-y-1.5 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display font-bold text-base text-slate-900 tracking-tight">
              {rule.name}
            </h3>

            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cat.badge}`}
            >
              {cat.label}
            </span>

            {rule.isSystem && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                Sistem
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{rule.slug}</span>
            <span>•</span>
            <span className="text-slate-500 font-sans">
              Dipasang di <strong className="text-slate-800">{rule._count?.mappings ?? 0}</strong> sub-bab
            </span>
          </div>

          {rule.description && (
            <p className="text-xs text-slate-600 leading-relaxed pt-1">{rule.description}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => onEdit(rule)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Edit Rule"
          >
            <Pencil size={15} />
          </button>
          {!rule.isSystem && (
            <button
              onClick={() => onDelete(rule)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Hapus Rule"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>

      {/* System Prompt Box */}
      <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
            <Code size={13} className="text-slate-400" />
            <span>Base System Prompt</span>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopyPrompt(rule.systemPrompt)}
              className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-900 transition-colors"
            >
              {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
              <span>{copied ? "Tersalin" : "Salin"}</span>
            </button>

            <button
              onClick={() => setExpandedPrompt(!expandedPrompt)}
              className="inline-flex items-center gap-0.5 text-[11px] text-emerald-600 font-semibold hover:text-emerald-700"
            >
              <span>{expandedPrompt ? "Tutup" : "Lihat Prompt"}</span>
              {expandedPrompt ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>
        </div>

        {expandedPrompt && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs font-mono text-slate-700 whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed">
            {rule.systemPrompt}
          </div>
        )}
      </div>

      {/* Research Approach Variants Section */}
      <div className="mt-3 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setExpandedVariants(!expandedVariants)}
            className="flex items-center gap-2 text-xs font-semibold text-slate-800 hover:text-emerald-700 transition-colors"
          >
            <Sparkles size={14} className="text-amber-500" />
            <span>Varian Pendekatan Riset</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
              {variants.length} Varian
            </span>
            {expandedVariants ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          <button
            onClick={() => onAddVariant(rule)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-full transition-colors"
          >
            <Plus size={12} />
            <span>Tambah Varian</span>
          </button>
        </div>

        {expandedVariants && (
          <div className="mt-3 space-y-2 pt-1">
            {variants.length > 0 ? (
              variants.map((v) => (
                <div
                  key={v.id}
                  className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-3 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[11px] px-2 py-0.5 rounded bg-white text-slate-800 border border-slate-200 tracking-wide font-mono">
                      {v.researchApproach}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditVariant(rule, v)}
                        className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                        title="Edit Varian"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        onClick={() => onDeleteVariant(rule, v.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Hapus Varian"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  <p className="text-slate-600 font-mono text-[11px] whitespace-pre-wrap leading-relaxed line-clamp-3 bg-white p-2 rounded border border-slate-100">
                    {v.systemPrompt}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic py-1">
                Belum ada varian spesifik (akan menggunakan base system prompt untuk semua jenis penelitian).
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RuleCard;
