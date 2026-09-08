"use client";

import React from "react";
import { BookOpen, ListOrdered, FileText, Table as TableIcon } from "lucide-react";

interface SubBabRendererProps {
  content: string;
  formatStyle?: "PARAGRAPH" | "ROADMAP" | "LIST" | "NUMBERED_LIST" | "TABLE" | string;
  citationPolicy?: "REQUIRED" | "OPTIONAL" | "NONE" | string;
  title?: string;
  subChapterTag?: string;
  className?: string;
}

export const SubBabRenderer: React.FC<SubBabRendererProps> = ({
  content,
  formatStyle = "PARAGRAPH",
  citationPolicy = "OPTIONAL",
  title,
  className = "",
}) => {
  const normStyle = (formatStyle || "PARAGRAPH").toUpperCase();

  // 1. Render Format ROADMAP (Sistematika Penulisan)
  if (normStyle === "ROADMAP") {
    const rawLines = (content || "").split("\n").map((l) => l.trim()).filter(Boolean);
    let intro = "";
    const chapters: Array<{ heading: string; body: string }> = [];
    let currentChapter: { heading: string; body: string } | null = null;

    for (const line of rawLines) {
      const isBabHeading = /^(BAB\s+[IVXLCDM\d]+[:\s\-\.]*.*?)(?:[\:\-]\s*|$)/i.test(line);

      if (isBabHeading && !line.toLowerCase().includes("berisikan") && !line.toLowerCase().includes("pada bab ini")) {
        if (currentChapter) chapters.push(currentChapter);
        currentChapter = { heading: line.toUpperCase(), body: "" };
      } else if (currentChapter) {
        currentChapter.body = currentChapter.body ? `${currentChapter.body} ${line}` : line;
      } else {
        intro = intro ? `${intro} ${line}` : line;
      }
    }
    if (currentChapter) chapters.push(currentChapter);

    return (
      <div className={`space-y-4 font-body ${className}`}>
        {/* Style Badge */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <BookOpen className="w-3.5 h-3.5" />
            Roadmap Dokumen (Heading Kapital & Indentasi Menjorok)
          </span>
          {citationPolicy === "NONE" && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
              Tanpa Sitasi
            </span>
          )}
        </div>

        {/* Intro Sentence */}
        {intro && (
          <p className="text-sm text-slate-700 leading-relaxed font-normal">
            {intro}
          </p>
        )}

        {/* Roadmap Chapters List */}
        <div className="space-y-4 pt-1">
          {chapters.length > 0 ? (
            chapters.map((ch, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-none hover:border-slate-300 transition-colors"
              >
                <div className="font-display font-bold text-xs tracking-wide text-slate-900 mb-1.5 pb-1 border-b border-slate-100">
                  {ch.heading}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed pl-3 border-l-2 border-emerald-500/50">
                  {ch.body}
                </p>
              </div>
            ))
          ) : (
            <div className="whitespace-pre-line text-sm text-slate-700 leading-relaxed pl-4 border-l-2 border-emerald-500">
              {content}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. Render Format NUMBERED_LIST / LIST (Identifikasi, Rumusan, Tujuan, Manfaat)
  if (normStyle === "LIST" || normStyle === "NUMBERED_LIST") {
    const rawLines = (content || "").split("\n").map((l) => l.trim()).filter(Boolean);
    let intro = "";
    const items: string[] = [];

    for (const line of rawLines) {
      const match = line.match(/^(\d+[\.\)]|[-•*])\s*(.*)$/);
      if (match) {
        items.push(match[2].trim());
      } else if (items.length === 0) {
        intro = intro ? `${intro} ${line}` : line;
      } else if (items.length > 0) {
        items[items.length - 1] += ` ${line}`;
      }
    }

    return (
      <div className={`space-y-3.5 font-body ${className}`}>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <ListOrdered className="w-3.5 h-3.5" />
            Butir Bernomor & Pengantar
          </span>
          {citationPolicy === "NONE" && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
              Tanpa Sitasi
            </span>
          )}
        </div>

        {intro && (
          <p className="text-sm text-slate-700 leading-relaxed font-normal">
            {intro}
          </p>
        )}

        {items.length > 0 ? (
          <ol className="space-y-2.5 pt-1">
            {items.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 text-sm text-slate-700 leading-relaxed rounded-lg p-2.5 bg-slate-50/70 border border-slate-100"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center mt-0.5">
                  {idx + 1}
                </span>
                <span className="flex-1">{item}</span>
              </li>
            ))}
          </ol>
        ) : (
          <div className="whitespace-pre-line text-sm text-slate-700 leading-relaxed">
            {content}
          </div>
        )}
      </div>
    );
  }

  // 3. Render Format TABLE (Penelitian Terdahulu / Matriks)
  if (normStyle === "TABLE") {
    return (
      <div className={`space-y-3 font-body ${className}`}>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <TableIcon className="w-3.5 h-3.5" />
            Matriks Komparatif / Tabel
          </span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 overflow-x-auto text-sm leading-relaxed text-slate-700">
          <div className="whitespace-pre-line font-mono text-xs">{content}</div>
        </div>
      </div>
    );
  }

  // 4. Default: PARAGRAPH (Latar Belakang piramida terbalik)
  const paragraphs = (content || "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  return (
    <div className={`space-y-3.5 font-body ${className}`}>
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          <FileText className="w-3.5 h-3.5" />
          Paragraf Mengalir
        </span>
        {citationPolicy === "REQUIRED" && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
            Wajib Sitasi [n]
          </span>
        )}
      </div>

      <div className="space-y-3 pt-1">
        {paragraphs.length > 0 ? (
          paragraphs.map((p, idx) => (
            <p
              key={idx}
              className="text-sm text-slate-800 leading-relaxed text-justify tracking-normal"
            >
              {p}
            </p>
          ))
        ) : (
          <p className="text-sm text-slate-400 italic">Belum ada konten draf yang dihasilkan.</p>
        )}
      </div>
    </div>
  );
};

export default SubBabRenderer;
