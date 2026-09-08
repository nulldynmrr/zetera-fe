"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShieldCheck,
  BarChart3,
  SlidersHorizontal,
  Layers,
  Cpu,
  Coins,
  Network,
  Activity,
  FileCode,
  BookOpen,
  LogOut,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Menu,
  X,
  CreditCard,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface NavItem {
  id: string;
  title: string;
  href: string;
  icon: any;
  badge?: string;
  badgeColor?: string;
}

interface NavCategory {
  category: string;
  items: NavItem[];
}

interface AdminLayoutProps {
  children: React.ReactNode;
  activeMenu?: "rules" | "subbab" | "dashboard" | "models" | "exchange" | "routing" | "logs" | "templates" | "research" | "pricing";
  title?: string;
  subtitle?: string;
  actionButton?: React.ReactNode;
}

export default function AdminLayout({
  children,
  activeMenu = "dashboard",
  title,
  subtitle,
  actionButton,
}: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navCategories: NavCategory[] = [
    {
      category: "Utama",
      items: [
        {
          id: "dashboard",
          title: "Executive Dashboard",
          href: "/admin-only/dashboard",
          icon: BarChart3,
        },
      ],
    },
    {
      category: "Sistem Aturan & Sub Bab",
      items: [
        {
          id: "rules",
          title: "Rules & Varian Riset",
          href: "/admin-only/rules",
          icon: SlidersHorizontal,
          badge: "Baru",
          badgeColor: "bg-emerald-100 text-emerald-800",
        },
        {
          id: "subbab",
          title: "Sub Bab & Output Spec",
          href: "/admin-only/subbab",
          icon: Layers,
          badge: "Baru",
          badgeColor: "bg-blue-100 text-blue-800",
        },
      ],
    },
    {
      category: "AI & Engine",
      items: [
        {
          id: "models",
          title: "Konfigurasi Model",
          href: "/admin-only/dashboard?tab=models",
          icon: Cpu,
        },
        {
          id: "exchange",
          title: "Master Kurs & Margin",
          href: "/admin-only/dashboard?tab=exchange",
          icon: Coins,
        },
        {
          id: "routing",
          title: "Routing Matrix",
          href: "/admin-only/dashboard?tab=routing",
          icon: Network,
        },
        {
          id: "logs",
          title: "AI Usage Logs",
          href: "/admin-only/dashboard?tab=logs",
          icon: Activity,
        },
      ],
    },
    {
      category: "Konten & Riset",
      items: [
        {
          id: "templates",
          title: "Template & LaTeX",
          href: "/admin-only/dashboard?tab=templates",
          icon: FileCode,
        },
        {
          id: "research",
          title: "Sistem & Jurnal Riset",
          href: "/admin-only/dashboard?tab=research",
          icon: BookOpen,
        },
        {
          id: "pricing",
          title: "Paket Kredit Riset",
          href: "/admin-only/dashboard?tab=pricing",
          icon: CreditCard,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#fefefe] flex flex-col font-body antialiased">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          >
            {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Link href="/admin-only/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#059669] text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <ShieldCheck size={18} />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-extrabold text-base tracking-tight text-slate-900">
                Zetera
              </span>
              <span className="text-xs font-semibold text-emerald-600">Admin</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                v2.5
              </span>
            </div>
          </Link>
        </div>

        {/* Right Header: User Info & Actions */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100/80 hover:bg-slate-200/70 rounded-full transition-colors"
          >
            <span>Buka Workspace</span>
            <ExternalLink size={12} />
          </Link>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
              {user?.name?.[0]?.toUpperCase() || "A"}
            </div>
            <span className="text-xs font-medium text-slate-700 hidden md:block">
              {user?.name || "Admin"}
            </span>
          </div>

          <button
            onClick={() => logout()}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
            title="Keluar"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Desktop */}
        <aside
          className={`
            fixed inset-y-0 left-0 top-14 z-30 w-64 bg-white border-r border-slate-200/80 p-3 flex flex-col justify-between
            transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:w-60 lg:flex-shrink-0
            ${mobileNavOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <div className="space-y-5 overflow-y-auto pr-1">
            {navCategories.map((cat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="px-2.5 text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
                  {cat.category}
                </div>
                <div className="space-y-0.5">
                  {cat.items.map((item) => {
                    const Icon = item.icon;
                    const isCurrent = activeMenu === item.id;

                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => setMobileNavOpen(false)}
                        className={`
                          w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-all
                          ${
                            isCurrent
                              ? "bg-emerald-50 text-emerald-800 font-semibold shadow-none"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          }
                        `}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon
                            size={16}
                            className={isCurrent ? "text-emerald-600" : "text-slate-400"}
                          />
                          <span className="truncate">{item.title}</span>
                        </div>

                        {item.badge && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                              item.badgeColor || "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Helper Box */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 mt-4 space-y-1">
            <div className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Sparkles size={12} className="text-emerald-600" />
              <span>Sistem Rules & Varian</span>
            </div>
            <p className="leading-snug">
              Atur prompt dan varian per jenis penelitian secara instan tanpa perlu coding.
            </p>
          </div>
        </aside>

        {/* Mobile backdrop */}
        {mobileNavOpen && (
          <div
            onClick={() => setMobileNavOpen(false)}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs z-20 lg:hidden"
          />
        )}

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto bg-[#fbfcfd] p-4 lg:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Page Header */}
            {(title || actionButton) && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/60">
                <div>
                  {title && (
                    <h1 className="font-display font-extrabold text-xl lg:text-2xl text-slate-900 tracking-tight">
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p className="text-xs lg:text-sm text-slate-500 mt-1 font-normal">
                      {subtitle}
                    </p>
                  )}
                </div>

                {actionButton && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {actionButton}
                  </div>
                )}
              </div>
            )}

            {/* Content Slot */}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
