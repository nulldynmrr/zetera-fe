"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  Check,
  Gift,
  Coins,
  ArrowRight,
  ShieldCheck,
  X,
  Share2,
  Copy,
  CheckCheck,
  Award,
  Layers,
  Clock,
  TrendingUp,
  Percent,
  Zap,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { notify } from "@/lib/notification";

interface MitraRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function MitraRewardModal({ isOpen, onClose, onSuccess }: MitraRewardModalProps) {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"REDEEM" | "VOUCHERS" | "HISTORY">("REDEEM");
  const [redeemingPkgId, setRedeemingPkgId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const loadRewardProfile = async () => {
    try {
      setLoading(true);
      const res = await api.billing.getRewardProfile();
      if (res.success && res.data) {
        setProfile(res.data);
      }
    } catch (err: any) {
      console.error("Gagal memuat profil reward mitra:", err);
      notify.error("Gagal memuat profil reward mitra", err?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadRewardProfile();
    }
  }, [isOpen]);

  const handleRedeem = async (pkg: any) => {
    notify.confirm({
      title: "Tukarkan Diamond ke Paket?",
      message: `Tukarkan ${pkg.diamondsRequired.toLocaleString("id-ID")} Diamond untuk mengaktifkan paket "${pkg.name}" (+${pkg.creditsGranted} Koin)?`,
      confirmLabel: "Tukarkan Sekarang",
      onConfirm: async () => {
        try {
          setRedeemingPkgId(pkg.id);
          const res = await api.billing.redeemDiamonds(pkg.id);
          if (res.success) {
            notify.success("Penukaran Berhasil!", res.message);
            await refreshUser();
            await loadRewardProfile();
            if (onSuccess) onSuccess();
          } else {
            notify.error("Penukaran Gagal", res.message);
          }
        } catch (err: any) {
          notify.error("Gagal Menukar Diamond", err?.message || "Terjadi kesalahan saat memproses penukaran.");
        } finally {
          setRedeemingPkgId(null);
        }
      },
    });
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    notify.success("Kode Disalin", `Kode "${code}" siap dibagikan ke calon pengguna!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  if (!isOpen) return null;

  const diamonds = profile?.rewardDiamonds ?? user?.rewardDiamonds ?? 0;
  const partnerStatus = profile?.partnerStatus ?? user?.partnerStatus ?? "PARTNER";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(15, 23, 42, 0.7)",
        backdropFilter: "blur(6px)",
        padding: 16,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !redeemingPkgId) onClose();
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 860,
          background: "#ffffff",
          borderRadius: 20,
          border: "1px solid #e2e8f0",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          display: "flex",
          flexDirection: "column",
          maxHeight: "92vh",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div
          style={{
            padding: "20px 26px",
            borderBottom: "1px solid #f1f5f9",
            background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "linear-gradient(135deg, #6366F1 0%, #4338CA 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 14px rgba(99, 102, 241, 0.4)",
              }}
            >
              <Award size={24} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
                  Mitra Reward & Diamond Center
                </h3>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    background: "#059669",
                    color: "#ffffff",
                    padding: "2px 8px",
                    borderRadius: 9999,
                    letterSpacing: "0.04em",
                  }}
                >
                  STATUS: {partnerStatus.toUpperCase()} VERIFIED
                </span>
              </div>
              <p style={{ margin: "3px 0 0", fontSize: 12, color: "#94A3B8" }}>
                Kumpulkan Diamond dari voucher promosi yang Anda bagikan, dan tukarkan ke Paket Kredit AI gratis.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={Boolean(redeemingPkgId)}
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              border: "none",
              borderRadius: "50%",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#ffffff",
              transition: "background 0.2s",
            }}
          >
            <X size={17} />
          </button>
        </div>

        {/* Hero Balance Banner */}
        <div
          style={{
            padding: "18px 26px",
            background: "linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
            borderBottom: "1px solid #4338CA",
          }}
        >
          <div>
            <div style={{ fontSize: 11.5, color: "#C7D2FE", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
              <span>Saldo Diamond Komisi Anda</span>
              <span style={{ background: "#4338CA", padding: "1px 6px", borderRadius: 4, fontSize: 10 }}>1 Diamond = Rp 1</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 4 }}>
              <span style={{ fontSize: 26, fontWeight: 800, color: "#FDE047", letterSpacing: "0.02em" }}>
                💎 {diamonds.toLocaleString("id-ID")} Diamond
              </span>
              <span style={{ fontSize: 13, color: "#E0E7FF", fontWeight: 600 }}>
                ≈ Rp {diamonds.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setActiveTab("REDEEM")}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: 600,
                background: activeTab === "REDEEM" ? "#FDE047" : "rgba(255, 255, 255, 0.15)",
                color: activeTab === "REDEEM" ? "#1E1B4B" : "#ffffff",
                border: "none",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.15s ease",
              }}
            >
              <Zap size={14} />
              <span>Tukar ke Paket</span>
            </button>
            <button
              onClick={() => setActiveTab("VOUCHERS")}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: 600,
                background: activeTab === "VOUCHERS" ? "#FDE047" : "rgba(255, 255, 255, 0.15)",
                color: activeTab === "VOUCHERS" ? "#1E1B4B" : "#ffffff",
                border: "none",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.15s ease",
              }}
            >
              <Gift size={14} />
              <span>Voucher Anda ({profile?.assignedVouchers?.length || 0})</span>
            </button>
            <button
              onClick={() => setActiveTab("HISTORY")}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: 600,
                background: activeTab === "HISTORY" ? "#FDE047" : "rgba(255, 255, 255, 0.15)",
                color: activeTab === "HISTORY" ? "#1E1B4B" : "#ffffff",
                border: "none",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.15s ease",
              }}
            >
              <Clock size={14} />
              <span>Riwayat</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "20px 26px", overflowY: "auto", flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#64748B" }}>
              <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p style={{ fontSize: 13 }}>Memuat profil reward mitra...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: TUKAR DIAMOND KE PAKET KREDIT */}
              {activeTab === "REDEEM" && (
                <div>
                  <div style={{ marginBottom: 16 }}>
                    <h4 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "#0F172A" }}>
                      Katalog Penukaran Paket Kredit AI
                    </h4>
                    <p style={{ margin: 0, fontSize: 12.5, color: "#64748B" }}>
                      Gunakan saldo Diamond Anda untuk mengaktifkan paket koin riset tanpa perlu pembayaran uang tunai.
                    </p>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
                    {profile?.redeemablePackages?.map((pkg: any) => {
                      const isProcessing = redeemingPkgId === pkg.id;
                      const canRedeem = pkg.canRedeemFull;

                      return (
                        <div
                          key={pkg.id}
                          style={{
                            borderRadius: 12,
                            border: canRedeem ? "2px solid #6366F1" : "1px solid #E2E8F0",
                            background: canRedeem ? "#F8FAFC" : "#FFFFFF",
                            padding: "16px 18px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            gap: 12,
                            boxShadow: canRedeem ? "0 4px 12px rgba(99, 102, 241, 0.1)" : "none",
                          }}
                        >
                          <div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                              <span style={{ fontSize: 13.5, fontWeight: 700, color: "#0F172A" }}>
                                {pkg.name}
                              </span>
                              {pkg.badgeLabel && (
                                <span
                                  style={{
                                    fontSize: 10,
                                    fontWeight: 700,
                                    padding: "2px 6px",
                                    borderRadius: 4,
                                    background: "#EEF2FF",
                                    color: "#4338CA",
                                  }}
                                >
                                  {pkg.badgeLabel}
                                </span>
                              )}
                            </div>

                            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                              <span style={{ fontSize: 20, fontWeight: 800, color: "#059669" }}>
                                +{pkg.creditsGranted}
                              </span>
                              <span style={{ fontSize: 12, fontWeight: 600, color: "#64748B" }}>Koin AI</span>
                            </div>

                            <div style={{ marginTop: 8, fontSize: 12, color: "#334155" }}>
                              Dibutuhkan: <strong style={{ color: "#4338CA" }}>{pkg.diamondsRequired.toLocaleString("id-ID")} Diamond</strong>
                            </div>

                            {/* Progress bar jika saldo belum cukup */}
                            {!canRedeem && (
                              <div style={{ marginTop: 8 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "#64748B", marginBottom: 3 }}>
                                  <span>Progress Saldo</span>
                                  <span>{pkg.progressPercent}%</span>
                                </div>
                                <div style={{ height: 6, background: "#E2E8F0", borderRadius: 9999, overflow: "hidden" }}>
                                  <div style={{ width: `${pkg.progressPercent}%`, height: "100%", background: "#6366F1", borderRadius: 9999 }} />
                                </div>
                                <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 3 }}>
                                  Kurang {(pkg.diamondsRequired - diamonds).toLocaleString("id-ID")} Diamond lagi
                                </div>
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRedeem(pkg)}
                            disabled={!canRedeem || Boolean(redeemingPkgId)}
                            style={{
                              width: "100%",
                              padding: "9px 14px",
                              borderRadius: 8,
                              fontSize: 12,
                              fontWeight: 700,
                              background: canRedeem
                                ? "linear-gradient(135deg, #6366F1 0%, #4338CA 100%)"
                                : "#F1F5F9",
                              color: canRedeem ? "#FFFFFF" : "#94A3B8",
                              border: "none",
                              cursor: canRedeem && !redeemingPkgId ? "pointer" : "not-allowed",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 6,
                              boxShadow: canRedeem ? "0 3px 10px rgba(99, 102, 241, 0.3)" : "none",
                            }}
                          >
                            {isProcessing ? (
                              <>
                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Menukarkan...</span>
                              </>
                            ) : canRedeem ? (
                              <>
                                <Zap size={14} />
                                <span>Tukar Sekarang</span>
                              </>
                            ) : (
                              <span>Diamond Belum Cukup</span>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: VOUCHER MITRA ANDA */}
              {activeTab === "VOUCHERS" && (
                <div>
                  <div style={{ marginBottom: 16 }}>
                    <h4 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "#0F172A" }}>
                      Voucher Promosi Ditugaskan Admin Untuk Anda
                    </h4>
                    <p style={{ margin: 0, fontSize: 12.5, color: "#64748B" }}>
                      Bagikan kode voucher ini. Setiap ada pengguna yang membeli paket kredit dengan kode Anda, Anda otomatis memperoleh komisi Diamond!
                    </p>
                  </div>

                  {profile?.assignedVouchers?.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "30px 14px", background: "#F8FAFC", borderRadius: 12, border: "1px dashed #CBD5E1", color: "#64748B" }}>
                      <Gift size={28} color="#94A3B8" className="mx-auto mb-2" />
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>Belum ada voucher kampanye yang ditugaskan untuk Anda.</p>
                      <p style={{ margin: "4px 0 0", fontSize: 11.5, color: "#94A3B8" }}>Hubungi Admin Zetera untuk mendapatkan kode voucher mitra khusus.</p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {profile?.assignedVouchers?.map((v: any) => {
                        const isCopied = copiedCode === v.code;
                        return (
                          <div
                            key={v.id}
                            style={{
                              border: "1px solid #E2E8F0",
                              borderRadius: 12,
                              background: "#FFFFFF",
                              padding: "16px 20px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              flexWrap: "wrap",
                              gap: 14,
                            }}
                          >
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <span style={{ fontSize: 18, fontWeight: 800, color: "#4338CA", letterSpacing: "0.05em", background: "#EEF2FF", padding: "3px 10px", borderRadius: 6 }}>
                                  {v.code}
                                </span>
                                <span
                                  style={{
                                    fontSize: 11,
                                    fontWeight: 700,
                                    padding: "2px 8px",
                                    borderRadius: 9999,
                                    background: v.isActive ? "#DCFCE7" : "#F1F5F9",
                                    color: v.isActive ? "#16A34A" : "#64748B",
                                  }}
                                >
                                  {v.isActive ? "AKTIF" : "NONAKTIF"}
                                </span>
                              </div>

                              <div style={{ marginTop: 8, fontSize: 12.5, color: "#334155" }}>
                                {v.description || "Voucher promosi mitra resmi Zetera"}
                              </div>

                              <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 6, fontSize: 11.5, color: "#64748B" }}>
                                <span>
                                  Diskon Pembeli: <strong style={{ color: "#0F172A" }}>{v.discountType === "PERCENTAGE" ? `${v.discountValue}%` : `Rp ${Number(v.discountValue).toLocaleString("id-ID")}`}</strong>
                                </span>
                                <span>
                                  Komisi Anda: <strong style={{ color: "#059669" }}>💎 +{v.rewardDiamondAmount?.toLocaleString("id-ID") || 0} Diamond / klaim</strong>
                                </span>
                                <span>
                                  Total Diklaim: <strong style={{ color: "#0F172A" }}>{v.currentUsageCount || 0} orang</strong>
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleCopy(v.code)}
                              style={{
                                padding: "8px 16px",
                                borderRadius: 8,
                                fontSize: 12.5,
                                fontWeight: 600,
                                background: isCopied ? "#059669" : "#4338CA",
                                color: "#FFFFFF",
                                border: "none",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                transition: "all 0.15s ease",
                              }}
                            >
                              {isCopied ? <CheckCheck size={14} /> : <Copy size={14} />}
                              <span>{isCopied ? "Tersalin!" : "Salin Kode"}</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: RIWAYAT KOMISI & PENUKARAN */}
              {activeTab === "HISTORY" && (
                <div>
                  <div style={{ marginBottom: 14 }}>
                    <h4 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "#0F172A" }}>
                      Riwayat Aktivitas Komisi & Penukaran Diamond
                    </h4>
                    <p style={{ margin: 0, fontSize: 12.5, color: "#64748B" }}>
                      Log mutasi Diamond masuk dari klaim voucher pembeli dan penukaran paket kredit.
                    </p>
                  </div>

                  {profile?.rewardLogs?.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "30px 14px", background: "#F8FAFC", borderRadius: 12, border: "1px dashed #CBD5E1", color: "#64748B", fontSize: 13 }}>
                      Belum ada riwayat transaksi komisi atau penukaran Diamond.
                    </div>
                  ) : (
                    <div style={{ border: "1px solid #E2E8F0", borderRadius: 10, overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, textAlign: "left" }}>
                        <thead>
                          <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0", color: "#64748B", fontWeight: 600 }}>
                            <th style={{ padding: "10px 14px" }}>Tanggal</th>
                            <th style={{ padding: "10px 14px" }}>Aktivitas</th>
                            <th style={{ padding: "10px 14px" }}>Keterangan</th>
                            <th style={{ padding: "10px 14px", textAlign: "right" }}>Mutasi Diamond</th>
                          </tr>
                        </thead>
                        <tbody>
                          {profile?.rewardLogs?.map((log: any) => {
                            const isRedemption = log.category === "DIAMOND_REDEMPTION" || log.type === "DIAMOND_REDEMPTION";
                            return (
                              <tr key={log.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                                <td style={{ padding: "10px 14px", color: "#64748B", whiteSpace: "nowrap" }}>
                                  {new Date(log.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                                </td>
                                <td style={{ padding: "10px 14px" }}>
                                  <span
                                    style={{
                                      padding: "2px 8px",
                                      borderRadius: 4,
                                      fontSize: 10.5,
                                      fontWeight: 700,
                                      background: isRedemption ? "#EEF2FF" : "#FEF3C7",
                                      color: isRedemption ? "#4338CA" : "#D97706",
                                    }}
                                  >
                                    {isRedemption ? "TUKAR DIAMOND" : "KOMISI REWARD"}
                                  </span>
                                </td>
                                <td style={{ padding: "10px 14px", color: "#334155" }}>
                                  {log.description || "-"}
                                </td>
                                <td
                                  style={{
                                    padding: "10px 14px",
                                    textAlign: "right",
                                    fontWeight: 700,
                                    whiteSpace: "nowrap",
                                    color: isRedemption ? "#DC2626" : "#059669",
                                  }}
                                >
                                  {isRedemption
                                    ? `${log.diamondAmount || 0} Diamond`
                                    : `+${(log.diamondAmount || 0).toLocaleString("id-ID")} Diamond`}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "14px 26px",
            borderTop: "1px solid #E2E8F0",
            background: "#F8FAFC",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontSize: 11.5, color: "#64748B", display: "flex", alignItems: "center", gap: 6 }}>
            <ShieldCheck size={14} color="#059669" />
            <span>Sistem Poin Mitra Resmi Zetera Terenkripsi & Diaudit Real-Time</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "7px 18px",
              borderRadius: 8,
              fontSize: 12.5,
              fontWeight: 600,
              background: "#FFFFFF",
              color: "#334155",
              border: "1px solid #CBD5E1",
              cursor: "pointer",
            }}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
