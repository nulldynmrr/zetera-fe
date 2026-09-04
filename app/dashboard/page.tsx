"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/notification";
import {
  LayoutDashboard,
  Network,
  BookOpen,
  Sparkles,
  Target,
  Plus,
  Search,
  Trash2,
  ArrowRight,
  Clock,
  Layers,
  CheckCircle2,
  TrendingUp,
  LogOut,
  GraduationCap,
  FolderGit2,
  FileText,
  Home,
  Shield,
} from "lucide-react";
import { AcademicMark, Button } from "@/components/ui/Button";
import { MvpMatrix } from "@/components/ui/MvpMatrix";
import { Input } from "@/components/ui/Input";
import { CreateProjectWizard } from "@/components/proposal/CreateProjectWizard";
import { useRequireAuth, useAuth } from "@/lib/auth-context";
import { api, type ResearchProject } from "@/lib/api-client";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useRequireAuth();
  const { logout } = useAuth();

  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "COMPLETED" | "ARCHIVED">("ALL");

  // Modal create project state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [field, setField] = useState("");
  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");


  // Load real projects from database + check onboarding
  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      const [res, onbRes] = await Promise.all([
        api.projects.list(),
        api.profile.checkOnboarding().catch(() => ({ isComplete: true })),
      ]);

      if (onbRes && !onbRes.isComplete) {
        router.push("/onboarding");
        return;
      }

      setProjects(res.data || []);
    } catch (err) {
      console.error("Gagal load projects:", err);
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  // Real computed stats from database
  const stats = useMemo(() => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter((p) => p.status === "ACTIVE").length;
    const completedProjects = projects.filter((p) => p.status === "COMPLETED").length;
    const totalJournals = projects.reduce((acc, curr) => acc + (curr._count?.journals || 0), 0);

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      totalJournals,
    };
  }, [projects]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.field && p.field.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus = statusFilter === "ALL" || p.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [projects, searchQuery, statusFilter]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Judul project wajib diisi");
      return;
    }

    try {
      setCreating(true);
      setErrorMsg("");
      const res = await api.projects.create({ title, description, field });
      setTitle("");
      setDescription("");
      setField("");
      setShowCreateModal(false);
      // Redirect to Tahap 2: Seleksi 5 Jurnal & Ekstraksi AI
      router.push(`/projects/${res.data.id}/screening`);
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal membuat project");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    notify.confirm({
      title: "Hapus Project Riset?",
      message: "Hapus project riset ini beserta seluruh jurnal, kerangka berpikir, dan draf naskah secara permanen?",
      confirmLabel: "Hapus Permanen",
      isDestructive: true,
      onConfirm: async () => {
        try {
          await api.projects.delete(id);
          setProjects((prev) => prev.filter((p) => p.id !== id));
          notify.success("Project Berhasil Dihapus", "Project riset telah dihapus dari workspace.");
        } catch (err: any) {
          notify.error("Gagal Menghapus Project", err.message || "Terjadi kesalahan");
        }
      },
    });
  };

  if (isLoading || !user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fefefe",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <AcademicMark size={22} />
          <span style={{ fontSize: 15, fontWeight: 500, color: "#64748b" }}>
            Memuat Workspace Riset Zetera...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fefefe",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* ── TOP NAVBAR (Flat Clean, No Shadow) ── */}
      <header
        style={{
          background: "#ffffff",
          borderBottom: "1px solid #e2e8f0",
          position: "sticky",
          top: 0,
          zIndex: 50,
          boxShadow: "none",
        }}
      >
        <div
          style={{
            maxWidth: 1380,
            margin: "0 auto",
            padding: "0 24px",
            height: 68,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo & Brand */}
          <Link
            href="/dashboard"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              textDecoration: "none",
            }}
          >
            <AcademicMark size={20} />
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 20,
                fontWeight: 700,
                color: "#0f172a",
                letterSpacing: "-0.03em",
              }}
            >
              Zetera
            </span>
          </Link>

          {/* Center Nav: Top-Level Clean IA */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              background: "#f8fafc",
              padding: "4px",
              borderRadius: "9999px",
              border: "1px solid #e2e8f0",
            }}
          >
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "7px 16px",
                borderRadius: "9999px",
                textDecoration: "none",
                color: "#475569",
                fontWeight: 500,
                fontSize: 13,
                transition: "all 0.15s ease",
              }}
            >
              <Home size={15} />
              Rumah
            </Link>

            <Link
              href="/dashboard"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "7px 16px",
                borderRadius: "9999px",
                textDecoration: "none",
                background: "var(--color-emerald-primary)",
                color: "#ffffff",
                fontWeight: 600,
                fontSize: 13,
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              }}
            >
              <FolderGit2 size={15} />
              Proyek Saya
            </Link>

            <Link
              href="/library"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "7px 16px",
                borderRadius: "9999px",
                textDecoration: "none",
                color: "#475569",
                fontWeight: 500,
                fontSize: 13,
                transition: "all 0.15s ease",
              }}
            >
              <BookOpen size={15} />
              Pustaka Template
            </Link>

            {user?.role === "ADMIN" && (
              <Link
                href="/admin-only"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "7px 16px",
                  borderRadius: "9999px",
                  textDecoration: "none",
                  color: "#0284c7",
                  background: "#e0f2fe",
                  fontWeight: 600,
                  fontSize: 13,
                  transition: "all 0.15s ease",
                }}
              >
                <Shield size={15} />
                Admin
              </Link>
            )}
          </nav>

          {/* Right Utility Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Button
              variant="emerald"
              size="sm"
              icon={<Plus size={15} />}
              onClick={() => setShowCreateModal(true)}
            >
              Project Baru
            </Button>

            <div
              style={{
                width: 1,
                height: 24,
                background: "#e2e8f0",
                margin: "0 4px",
              }}
            />

            {/* User Profile + Logout */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "#0f172a",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 14,
                  border: "1px solid #e2e8f0",
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", lineHeight: 1.2 }}>
                  {user.name}
                </span>
                <span style={{ fontSize: 11, color: "#64748b" }}>{user.email}</span>
              </div>

              <button
                onClick={logout}
                title="Keluar dari akun"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#94a3b8",
                  padding: 6,
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginLeft: 4,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN DASHBOARD BODY (Parent Background: #fefefe) ── */}
      <main
        style={{
          maxWidth: 1380,
          margin: "0 auto",
          padding: "32px 24px 60px",
          width: "100%",
          boxSizing: "border-box",
          background: "#fefefe",
        }}
      >
        {/* Welcome Section */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "2px 8px",
                borderRadius: 6,
                background: "#e0f2fe",
                color: "#0369a1",
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                border: "1px solid #bae6fd",
              }}
            >
              <GraduationCap size={13} />
              Academic Research Intelligence
            </span>
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 28,
              fontWeight: 800,
              color: "#0f172a",
              letterSpacing: "-0.03em",
              margin: 0,
            }}
          >
            Workspace Riset & Skripsi
          </h1>
          <p style={{ fontSize: 14, color: "#64748b", margin: "4px 0 0" }}>
            Sistem memori yang mengingat, memvalidasi, dan menghubungkan literatur jurnal dengan kerangka penelitianmu.
          </p>
        </div>

        {/* ── TOP DUAL-TONE GRADIENT STAT CARDS (Gradient Mesh, No Shadow) ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 18,
            marginBottom: 28,
          }}
        >
          {/* Stat 1: Total Projects (Cyan/Sky Mesh Gradient) */}
          <div
            style={{
              background: "var(--mesh-cyan)",
              border: "1px solid #bae6fd",
              borderRadius: 16,
              boxShadow: "none",
              padding: "20px 22px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "#0284c7",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FolderGit2 size={20} />
            </div>
            <div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>
                Total Project Riset
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  marginTop: 4,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 30,
                    fontWeight: 800,
                    color: "#0f172a",
                  }}
                >
                  {stats.totalProjects}
                </span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "3px 9px",
                    borderRadius: 6,
                    background: "#dcfce7",
                    border: "1px solid #86efac",
                    color: "#166534",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  <TrendingUp size={12} /> Database MySQL
                </span>
              </div>
            </div>
          </div>

          {/* Stat 2: Active Projects (Emerald/Mint Mesh Gradient) */}
          <div
            style={{
              background: "var(--mesh-mint)",
              border: "1px solid #bbf7d0",
              borderRadius: 16,
              boxShadow: "none",
              padding: "20px 22px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "#059669",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircle2 size={20} />
            </div>
            <div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>
                Project Aktif Berjalan
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  marginTop: 4,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 30,
                    fontWeight: 800,
                    color: "#0f172a",
                  }}
                >
                  {stats.activeProjects}
                </span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "3px 9px",
                    borderRadius: 6,
                    background: "#e0f2fe",
                    border: "1px solid #7dd3fc",
                    color: "#075985",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  Fase Berjalan
                </span>
              </div>
            </div>
          </div>

          {/* Stat 3: Total Journals (Purple Mesh Gradient) */}
          <div
            style={{
              background: "var(--mesh-purple)",
              border: "1px solid #e9d5ff",
              borderRadius: 16,
              boxShadow: "none",
              padding: "20px 22px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "#7c3aed",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <BookOpen size={20} />
            </div>
            <div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>
                Jurnal & Literatur Masuk
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  marginTop: 4,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 30,
                    fontWeight: 800,
                    color: "#0f172a",
                  }}
                >
                  {stats.totalJournals}
                </span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "3px 9px",
                    borderRadius: 6,
                    background: "#f3e8ff",
                    border: "1px solid #d8b4fe",
                    color: "#6b21a8",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  Siap Telaah
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 2-COLUMN LAYOUT: Projects List (Left) + Step-by-Step Blueprint Guide (Right) ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: 20,
            alignItems: "start",
          }}
        >
          {/* ── LEFT: REAL PROJECTS SECTION ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Header, Search & Filters */}
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 14,
                boxShadow: "none",
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 14,
              }}
            >
              {/* Search input */}
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  flex: 1,
                  minWidth: 260,
                }}
              >
                <Search size={16} style={{ position: "absolute", left: 12, color: "#94a3b8" }} />
                <input
                  type="text"
                  placeholder="Cari judul riset atau bidang ilmu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    height: 38,
                    padding: "0 12px 0 36px",
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    background: "#f8fafc",
                    fontSize: 13,
                    fontFamily: "var(--font-body)",
                    color: "#0f172a",
                    outline: "none",
                  }}
                />
              </div>

              {/* Status Filter Tabs */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {[
                  { id: "ALL", label: "Semua" },
                  { id: "ACTIVE", label: "Aktif" },
                  { id: "COMPLETED", label: "Selesai" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setStatusFilter(f.id as any)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 6,
                      border: "1px solid",
                      borderColor: statusFilter === f.id ? "#0f172a" : "#e2e8f0",
                      background: statusFilter === f.id ? "#0f172a" : "#ffffff",
                      color: statusFilter === f.id ? "#ffffff" : "#475569",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Projects Grid / Empty State */}
            {loadingProjects ? (
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 14,
                  boxShadow: "none",
                  padding: "50px 24px",
                  textAlign: "center",
                  color: "#64748b",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  <Clock size={18} />
                  <span>Memuat data dari database MySQL...</span>
                </div>
              </div>
            ) : filteredProjects.length === 0 ? (
              /* Professional Empty State */
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 14,
                  boxShadow: "none",
                  padding: "50px 24px",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 12,
                    background: "#f0f9ff",
                    border: "1px solid #e0f2fe",
                    color: "#0284c7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <BookOpen size={24} />
                </div>
                <div>
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 17,
                      fontWeight: 700,
                      color: "#0f172a",
                      margin: "0 0 6px",
                    }}
                  >
                    {searchQuery ? "Tidak ada project yang cocok" : "Belum Ada Project Riset"}
                  </h3>
                  <p
                    style={{
                      fontSize: 13,
                      color: "#64748b",
                      margin: 0,
                      maxWidth: 380,
                      lineHeight: 1.5,
                    }}
                  >
                    {searchQuery
                      ? "Coba kata kunci lain atau reset filter pencarianmu."
                      : "Mulai perjalanan skripsimu dengan membuat project pertama. Sistem akan memetakan variabel dan jurnal pendukungmu."}
                  </p>
                </div>

                {!searchQuery && (
                  <div style={{ marginTop: 4 }}>
                    <Button
                      variant="emerald"
                      onClick={() => setShowCreateModal(true)}
                      icon={<Plus size={16} />}
                    >
                      Buat Project Pertama
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              /* Real Project Cards Grid */
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
                  gap: 16,
                }}
              >
                {filteredProjects.map((proj: any) => {
                  const totalJournals = proj._count?.journals || 0;
                  const totalNodes = proj._count?.frameworkNodes || 0;

                  // ── Dynamic Phase Routing & Unlock Logic ──
                  let targetHref = `/projects/${proj.id}/journals`;
                  let actionLabel = "Telaah Jurnal";
                  let actionColor = "#0284c7";
                  let actionBg = "#f0f9ff";
                  let actionBorder = "#bae6fd";
                  let ActionIcon = BookOpen;

                  if (totalNodes > 0) {
                    targetHref = `/projects/${proj.id}/proposal`;
                    actionLabel = "Draft Proposal";
                    actionColor = "#059669";
                    actionBg = "#f0fdf4";
                    actionBorder = "#86efac";
                    ActionIcon = FileText;
                  } else if (totalJournals > 0) {
                    targetHref = `/projects/${proj.id}/framework`;
                    actionLabel = "Framework";
                    actionColor = "#7c3aed";
                    actionBg = "#faf5ff";
                    actionBorder = "#d8b4fe";
                    ActionIcon = Network;
                  }

                  return (
                    <div
                      key={proj.id}
                      style={{
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: 14,
                        boxShadow: "none",
                        padding: 20,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        gap: 14,
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 10,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              padding: "2px 8px",
                              borderRadius: 6,
                              background: "#e0f2fe",
                              color: "#0369a1",
                              border: "1px solid #bae6fd",
                            }}
                          >
                            {proj.field || "Umum"}
                          </span>

                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                padding: "2px 6px",
                                borderRadius: 4,
                                background: proj.status === "ACTIVE" ? "#dcfce7" : "#f1f5f9",
                                border: proj.status === "ACTIVE" ? "1px solid #bbf7d0" : "1px solid #e2e8f0",
                                color: proj.status === "ACTIVE" ? "#166534" : "#475569",
                              }}
                            >
                              {proj.status === "ACTIVE" ? "Aktif" : proj.status}
                            </span>

                            <button
                              title="Hapus Project"
                              onClick={(e) => handleDeleteProject(proj.id, e)}
                              style={{
                                background: "transparent",
                                border: "none",
                                cursor: "pointer",
                                color: "#94a3b8",
                                padding: 4,
                                borderRadius: 4,
                                display: "flex",
                                alignItems: "center",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                              onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        <Link
                          href={targetHref}
                          style={{ textDecoration: "none" }}
                        >
                          <h3
                            style={{
                              fontFamily: "var(--font-display)",
                              fontSize: 15,
                              fontWeight: 700,
                              color: "#0f172a",
                              margin: "0 0 6px",
                              lineHeight: 1.35,
                              cursor: "pointer",
                            }}
                          >
                            {proj.title}
                          </h3>
                        </Link>

                        {proj.description && (
                          <p
                            style={{
                              fontSize: 13,
                              color: "#64748b",
                              margin: 0,
                              lineHeight: 1.5,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {proj.description}
                          </p>
                        )}
                      </div>

                      <div
                        style={{
                          borderTop: "1px solid #f1f5f9",
                          paddingTop: 12,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Link
                            href={`/projects/${proj.id}/journals`}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                              fontSize: 12,
                              color: "#475569",
                              fontWeight: 600,
                              textDecoration: "none",
                              padding: "4px 8px",
                              borderRadius: 6,
                              background: "#f8fafc",
                              border: "1px solid #e2e8f0",
                            }}
                            title="Buka Library Jurnal"
                          >
                            <BookOpen size={13} color="#0284c7" />
                            <span>{totalJournals} Jurnal</span>
                          </Link>

                          {totalNodes > 0 && (
                            <Link
                              href={`/projects/${proj.id}/framework`}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                fontSize: 12,
                                color: "#6b21a8",
                                fontWeight: 600,
                                textDecoration: "none",
                                padding: "4px 7px",
                                borderRadius: 6,
                                background: "#faf5ff",
                                border: "1px solid #e9d5ff",
                              }}
                              title="Buka Kerangka Berpikir (Framework)"
                            >
                              <Network size={12} color="#7c3aed" />
                              <span>{totalNodes} Node</span>
                            </Link>
                          )}
                        </div>

                        <Link
                          href={targetHref}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            fontSize: 12,
                            fontWeight: 700,
                            color: actionColor,
                            textDecoration: "none",
                            padding: "5px 10px",
                            borderRadius: 7,
                            background: actionBg,
                            border: `1px solid ${actionBorder}`,
                            boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                            transition: "all 0.15s ease",
                          }}
                        >
                          <ActionIcon size={13} color={actionColor} />
                          <span>{actionLabel}</span>
                          <ArrowRight size={12} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── RIGHT: BLUEPRINT STEP-BY-STEP ROADMAP ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Roadmap Card */}
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 14,
                boxShadow: "none",
                padding: 20,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <Layers size={17} color="var(--color-emerald-dark)" />
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#0f172a",
                    margin: 0,
                  }}
                >
                  Panduan Alur Riset (Blueprint)
                </h3>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  {
                    step: "Fase 1",
                    title: "Topik & Masalah Riset",
                    desc: "Penentuan judul skripsi, rumusan masalah, dan fokus bidang riset.",
                    done: projects.length > 0,
                    active: projects.length === 0,
                  },
                  {
                    step: "Fase 2",
                    title: "Telaah Jurnal & AI Cross-Check",
                    desc: "Upload PDF/DOI & verifikasi relevansi disiplin ilmu otomatis via Groq AI.",
                    active: projects.length > 0,
                  },
                  {
                    step: "Fase 3",
                    title: "Kanvas Kerangka Berpikir",
                    desc: "Pemetaan variabel X-Y, metodologi riset, dan penghubungan bukti jurnal.",
                    upcoming: true,
                  },
                  {
                    step: "Fase 4",
                    title: "Research Gap & Draft Proposal",
                    desc: "Deteksi celah riset otomatis dan ekspor draf proposal skripsi DOCX.",
                    upcoming: true,
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      gap: 10,
                      padding: "8px 10px",
                      borderRadius: 8,
                      background: item.active
                        ? "#f0fdf4"
                        : item.done
                        ? "#f8fafc"
                        : "transparent",
                      border: item.active
                        ? "1px solid #bbf7d0"
                        : "1px solid #f1f5f9",
                    }}
                  >
                    <div style={{ marginTop: 2 }}>
                      {item.done ? (
                        <CheckCircle2 size={15} color="#059669" />
                      ) : item.active ? (
                        <Sparkles size={15} color="#00C988" />
                      ) : (
                        <Clock size={15} color="#94a3b8" />
                      )}
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: "1px 5px",
                            borderRadius: 4,
                            background: item.done
                              ? "#dcfce7"
                              : item.active
                              ? "#00C988"
                              : "#f1f5f9",
                            color: item.done
                              ? "#166534"
                              : item.active
                              ? "#ffffff"
                              : "#64748b",
                          }}
                        >
                          {item.step}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>
                          {item.title}
                        </span>
                      </div>
                      <p style={{ fontSize: 11, color: "#64748b", margin: "2px 0 0", lineHeight: 1.4 }}>
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── FOOTER (Flat, Background: #fefefe) ── */}
      <footer
        style={{
          borderTop: "1px solid #e2e8f0",
          background: "#fefefe",
          padding: "18px 0",
        }}
      >
        <div
          style={{
            maxWidth: 1380,
            margin: "0 auto",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
            fontSize: 12,
            color: "#64748b",
          }}
        >
          <span>© 2026 Zetera AI. Research Journal Intelligence & Workspace.</span>
          <div style={{ display: "flex", gap: 20 }}>
            <span style={{ color: "#64748b" }}>Dokumentasi Arsitektur</span>
            <span style={{ color: "#64748b" }}>MySQL Database</span>
            <span style={{ color: "#64748b" }}>Prisma ORM</span>
          </div>
        </div>
      </footer>

      {/* ── CREATE PROJECT WIZARD MODAL ── */}
      <CreateProjectWizard
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={(newProj) => {
          setProjects((prev) => [newProj, ...prev]);
        }}
      />
    </div>
  );
}
