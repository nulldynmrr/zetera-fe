"use client";

import React from "react";
import { FileText, BookOpen, ListOrdered, Table, Quote, ShieldCheck, HelpCircle } from "lucide-react";
import { OutputSpec } from "@/lib/api-client";

interface OutputSpecFormProps {
  value: Partial<OutputSpec>;
  onChange: (value: Partial<OutputSpec>) => void;
}

export const OutputSpecForm: React.FC<OutputSpecFormProps> = ({ value, onChange }) => {
  const formatStyles = [
    {
      id: "PARAGRAPH",
      title: "Paragraf Mengalir",
      desc: "Paragraf naratif akademis EYD piramida terbalik.",
      icon: FileText,
      example: "Latar Belakang, Landasan Teori",
    },
    {
      id: "ROADMAP",
      title: "Roadmap Dokumen",
      desc: "Heading BAB Kapital tebal + Paragraf menjorok.",
      icon: BookOpen,
      example: "Sistematika Penulisan Skripsi",
    },
    {
      id: "NUMBERED_LIST",
      title: "Butir Bernomor & Pengantar",
      desc: "1 kalimat pengantar akademis + butir poin 1., 2.",
      icon: ListOrdered,
      example: "Rumusan Masalah, Tujuan, Manfaat",
    },
    {
      id: "TABLE",
      title: "Matriks / Tabel",
      desc: "Tabel komparatif berkolom.",
      icon: Table,
      example: "Penelitian Terdahulu, Operasionalisasi",
    },
  ];

  const citationPolicies = [
    {
      id: "REQUIRED",
      label: "Wajib Sitasi Empiris",
      desc: "Wajib menyematkan rujukan kurung siku [1], [2] ke jurnal pool terverifikasi.",
      badge: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      id: "OPTIONAL",
      label: "Opsional / Fleksibel",
      desc: "Sitasi diperbolehkan jika ada bukti empiris pendukung, namun tidak dipaksa.",
      badge: "bg-slate-100 text-slate-700 border-slate-200",
    },
    {
      id: "NONE",
      label: "Bebas Sitasi (Strictly No Citations)",
      desc: "Mutlak dilarang menyertakan rujukan pustaka. Murni alur operasional peneliti.",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
  ];

  return (
    <div className="space-y-5 font-body">
      {/* 1. Format Style Selection */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center justify-between">
          <span>Gaya Tampilan Dokumen (Format Style)</span>
          <span className="text-[11px] font-normal text-slate-400">
            Menentukan tata letak di web & ekspor DOCX/PDF
          </span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {formatStyles.map((item) => {
            const Icon = item.icon;
            const isSelected = (value.formatStyle || "PARAGRAPH") === item.id;

            return (
              <div
                key={item.id}
                onClick={() => onChange({ ...value, formatStyle: item.id })}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? "border-emerald-600 bg-emerald-50/40 shadow-none ring-1 ring-emerald-500/20"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className={`p-2 rounded-lg flex-shrink-0 ${
                      isSelected ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <Icon size={16} />
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-semibold text-xs text-slate-900">{item.title}</div>
                    <p className="text-[11px] text-slate-500 leading-tight">{item.desc}</p>
                    <div className="text-[10px] text-emerald-700 font-medium pt-1">
                      Contoh: {item.example}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Citation Policy Selection */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-900 uppercase tracking-wide">
          Kebijakan Sitasi (Citation Policy)
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {citationPolicies.map((pol) => {
            const isSelected = (value.citationPolicy || "OPTIONAL") === pol.id;

            return (
              <div
                key={pol.id}
                onClick={() => onChange({ ...value, citationPolicy: pol.id })}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? "border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-500/20"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-900">{pol.label}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">{pol.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Render Template / Custom Example */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-900 uppercase tracking-wide">
            Template Format Khusus / Pratinjau (Opsional)
          </label>
          <span className="text-[11px] text-slate-400 font-normal">
            Bisa diedit fleksibel per institusi
          </span>
        </div>
        <textarea
          rows={4}
          value={value.renderTemplate || ""}
          onChange={(e) => onChange({ ...value, renderTemplate: e.target.value })}
          placeholder="Tuliskan contoh struktur draft atau placeholder pola format untuk sub-bab ini..."
          className="w-full p-3 text-xs font-mono rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-500 leading-relaxed text-slate-800"
        />
      </div>
    </div>
  );
};

export default OutputSpecForm;
