"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  Check,
  Zap,
  CreditCard,
  QrCode,
  Building,
  ShieldCheck,
  X,
  Clock,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  Gift,
  Tag,
  Copy,
  CheckCheck,
  Percent,
  Users,
} from "lucide-react";
import { api, type CreditPackageItem } from "@/lib/api-client";
import { notify } from "@/lib/notification";

interface CreditTopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newTotalCredits: number) => void;
  requiredCredits?: number;
  currentBalance?: number;
}

export function CreditTopupModal({
  isOpen,
  onClose,
  onSuccess,
  requiredCredits,
  currentBalance = 0,
}: CreditTopupModalProps) {
  const [packages, setPackages] = useState<CreditPackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPkgId, setSelectedPkgId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"QRIS" | "VA_BCA" | "VA_MANDIRI" | "SIMULATION">("SIMULATION");
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"PACKAGES" | "REFERRAL" | "HISTORY">("PACKAGES");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Voucher / Promo State
  const [voucherCodeInput, setVoucherCodeInput] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [validatingVoucher, setValidatingVoucher] = useState(false);
  const [voucherFeedback, setVoucherFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Referral State
  const [referralInfo, setReferralInfo] = useState<any>(null);
  const [loadingReferral, setLoadingReferral] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchPackages = async () => {
      try {
        setLoading(true);
        const res = await api.billing.getPackages();
        if (res.success && res.data) {
          setPackages(res.data);
          if (res.data.length > 0) {
            const recommended =
              res.data.find(
                (p) =>
                  p.badgeLabel?.toLowerCase().includes("populer") ||
                  p.badgeLabel?.toLowerCase().includes("rekomendasi") ||
                  p.badgeLabel?.toLowerCase().includes("terpopuler")
              ) || res.data[0];
            setSelectedPkgId(recommended.id);
          }
        }
      } catch (err: any) {
        console.error("Gagal memuat paket kredit:", err);
        notify.error("Gagal memuat daftar paket harga dari server");
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
    loadReferral();
  }, [isOpen]);

  const loadTransactions = async (categoryFilter?: string) => {
    try {
      setLoadingTransactions(true);
      const cat = categoryFilter !== undefined ? categoryFilter : selectedCategory;
      const categoryParam = cat === "ALL" ? undefined : cat;
      const res = await api.billing.getTransactions(1, 30, categoryParam);
      if (res.success && res.data) {
        setTransactions(res.data);
      }
    } catch (err) {
      console.error("Gagal memuat riwayat transaksi:", err);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const loadReferral = async () => {
    try {
      setLoadingReferral(true);
      const res = await api.billing.getReferral();
      if (res.success && res.data) {
        setReferralInfo(res.data);
      }
    } catch (err) {
      console.warn("Gagal memuat info referral:", err);
    } finally {
      setLoadingReferral(false);
    }
  };

  const handleApplyVoucher = async () => {
    if (!voucherCodeInput.trim()) {
      setVoucherFeedback({ type: "error", message: "Masukkan kode voucher promo terlebih dahulu." });
      return;
    }

    try {
      setValidatingVoucher(true);
      setVoucherFeedback(null);
      const res = await api.billing.validateVoucher(voucherCodeInput.trim(), selectedPkgId || undefined);
      if (res.success) {
        setAppliedVoucher(res);
        setVoucherFeedback({
          type: "success",
          message: `Voucher "${res.voucher.code}" berhasil diterapkan! Hemat Rp ${res.calculation.discountAmount.toLocaleString("id-ID")}${res.calculation.bonusCredits > 0 ? ` +${res.calculation.bonusCredits} Koin` : ""}.`,
        });
      }
    } catch (err: any) {
      setAppliedVoucher(null);
      setVoucherFeedback({ type: "error", message: err.message || "Kode voucher tidak valid atau sudah kedaluwarsa." });
    } finally {
      setValidatingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCodeInput("");
    setVoucherFeedback(null);
  };

  const handleCheckout = async () => {
    if (!selectedPkgId) {
      notify.error("Silakan pilih paket kredit terlebih dahulu.");
      return;
    }

    try {
      setSubmitting(true);
      const voucherToPass = appliedVoucher ? appliedVoucher.voucher.code : (voucherCodeInput.trim() || undefined);
      const res = await api.billing.checkout(selectedPkgId, paymentMethod, voucherToPass);
      if (res.success) {
        notify.success(res.message);
        if (onSuccess) {
          onSuccess(res.data.totalCredits);
        }
        onClose();
      } else {
        notify.error(res.message || "Transaksi gagal diproses.");
      }
    } catch (err: any) {
      notify.error(err.message || "Terjadi kesalahan saat memproses pembelian paket.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const selectedPkg = packages.find((p) => p.id === selectedPkgId);

  // Kalkulasi harga final
  let basePrice = selectedPkg ? (selectedPkg.priceDiscount ?? selectedPkg.priceNormal) : 0;
  if (selectedPkg?.firstMonthDiscountPrice) {
    basePrice = selectedPkg.firstMonthDiscountPrice;
  }
  const discountAmount = appliedVoucher?.calculation?.discountAmount || 0;
  const bonusCredits = appliedVoucher?.calculation?.bonusCredits || 0;
  const finalPriceToPay = Math.max(0, basePrice - discountAmount);
  const finalCreditsGranted = (selectedPkg?.creditsGranted || 0) + bonusCredits;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(6px)",
        padding: 16,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 820,
          background: "#ffffff",
          borderRadius: 18,
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
            padding: "18px 24px",
            borderBottom: "1px solid #f1f5f9",
            background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: "linear-gradient(135deg, #00C988 0%, #059669 100%)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(0, 201, 136, 0.25)",
              }}
            >
              <Zap size={22} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#0f172a" }}>
                  Top Up Saldo Kredit Riset
                </h3>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    background: "#ecfdf5",
                    color: "#059669",
                    padding: "2px 8px",
                    borderRadius: 9999,
                    border: "1px solid #a7f3d0",
                  }}
                >
                  Saldo: {currentBalance.toLocaleString("id-ID")} Koin
                </span>
              </div>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "#64748b" }}>
                Pilih paket resmi dari Admin atau gunakan voucher promo untuk melanjutkan riset.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "#f1f5f9",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#64748b",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Insufficient Balance Notice */}
        {requiredCredits !== undefined && requiredCredits > currentBalance && (
          <div
            style={{
              background: "#fffbeb",
              borderBottom: "1px solid #fef3c7",
              padding: "10px 24px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 12,
              color: "#92400e",
            }}
          >
            <AlertCircle size={16} color="#d97706" />
            <div>
              <strong>Kredit Anda Kurang:</strong> Diperlukan minimal <strong>{requiredCredits} koin</strong> untuk aksi ini.
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", padding: "0 24px" }}>
          <button
            type="button"
            onClick={() => setActiveTab("PACKAGES")}
            style={{
              padding: "10px 16px",
              fontSize: 13,
              fontWeight: activeTab === "PACKAGES" ? 700 : 500,
              color: activeTab === "PACKAGES" ? "#00C988" : "#64748b",
              background: "transparent",
              border: "none",
              borderBottom: activeTab === "PACKAGES" ? "2px solid #00C988" : "2px solid transparent",
              cursor: "pointer",
            }}
          >
            Pilih Paket Kredit
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("REFERRAL");
              loadReferral();
            }}
            style={{
              padding: "10px 16px",
              fontSize: 13,
              fontWeight: activeTab === "REFERRAL" ? 700 : 500,
              color: activeTab === "REFERRAL" ? "#00C988" : "#64748b",
              background: "transparent",
              border: "none",
              borderBottom: activeTab === "REFERRAL" ? "2px solid #00C988" : "2px solid transparent",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Gift size={14} />
            <span>Bagikan &amp; Dapat Koin (+20)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("HISTORY");
              loadTransactions();
            }}
            style={{
              padding: "10px 16px",
              fontSize: 13,
              fontWeight: activeTab === "HISTORY" ? 700 : 500,
              color: activeTab === "HISTORY" ? "#00C988" : "#64748b",
              background: "transparent",
              border: "none",
              borderBottom: activeTab === "HISTORY" ? "2px solid #00C988" : "2px solid transparent",
              cursor: "pointer",
            }}
          >
            Riwayat Transaksi
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "18px 24px", overflowY: "auto", flex: 1 }}>
          {activeTab === "PACKAGES" ? (
            loading ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#64748b", fontSize: 13 }}>
                Memuat paket harga aktif...
              </div>
            ) : packages.length === 0 ? (
              <div style={{ textAlign: "center", padding: "30px 0", color: "#64748b" }}>
                Belum ada paket kredit aktif yang dibuat oleh Admin.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* List Paket Card Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: 12,
                  }}
                >
                  {packages.map((pkg) => {
                    const isSelected = selectedPkgId === pkg.id;
                    const effectivePrice = pkg.firstMonthDiscountPrice ?? (pkg.priceDiscount ?? pkg.priceNormal);
                    const hasDiscount = effectivePrice < pkg.priceNormal;

                    const remainingClaimQuota =
                      pkg.discountClaimLimit !== null && pkg.discountClaimLimit !== undefined
                        ? Math.max(0, pkg.discountClaimLimit - (pkg.discountClaimCount || 0))
                        : null;

                    return (
                      <div
                        key={pkg.id}
                        onClick={() => setSelectedPkgId(pkg.id)}
                        style={{
                          border: isSelected ? "2px solid #00C988" : "1.5px solid #e2e8f0",
                          borderRadius: 14,
                          padding: 14,
                          cursor: "pointer",
                          background: isSelected ? "#f0fdf4" : "#ffffff",
                          position: "relative",
                          transition: "all 0.15s ease",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          boxShadow: isSelected ? "0 4px 14px rgba(0, 201, 136, 0.15)" : "none",
                        }}
                      >
                        {/* Badge Promosi */}
                        {pkg.badgeLabel && (
                          <span
                            style={{
                              position: "absolute",
                              top: -9,
                              right: 12,
                              background: isSelected ? "#059669" : "#4338ca",
                              color: "#ffffff",
                              fontSize: 9.5,
                              fontWeight: 800,
                              padding: "2px 7px",
                              borderRadius: 9999,
                            }}
                          >
                            {pkg.badgeLabel}
                          </span>
                        )}

                        <div>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                textTransform: "uppercase",
                                color: isSelected ? "#059669" : "#64748b",
                              }}
                            >
                              {pkg.type === "SUBSCRIPTION" ? "Langganan" : "Sekali Beli"}
                            </span>
                            {isSelected && <Check size={16} color="#059669" strokeWidth={3} />}
                          </div>

                          <div style={{ fontSize: 14.5, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>
                            {pkg.name}
                          </div>

                          {/* Harga */}
                          <div style={{ display: "flex", alignItems: "baseline", gap: 6, margin: "8px 0" }}>
                            <span style={{ fontSize: 20, fontWeight: 800, color: "#0f172a" }}>
                              Rp {effectivePrice.toLocaleString("id-ID")}
                            </span>
                            {hasDiscount && (
                              <span style={{ fontSize: 11.5, color: "#94a3b8", textDecoration: "line-through" }}>
                                Rp {pkg.priceNormal.toLocaleString("id-ID")}
                              </span>
                            )}
                          </div>

                          {/* Promo Bulan Pertama & Kuota */}
                          {pkg.firstMonthDiscountPrice && (
                            <div
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: "#b45309",
                                background: "#fef3c7",
                                padding: "3px 7px",
                                borderRadius: 6,
                                marginBottom: 6,
                              }}
                            >
                              🔥 Khusus Bulan Pertama
                            </div>
                          )}

                          {remainingClaimQuota !== null && (
                            <div
                              style={{
                                fontSize: 10.5,
                                color: "#0369a1",
                                background: "#e0f2fe",
                                padding: "2px 7px",
                                borderRadius: 6,
                                marginBottom: 6,
                              }}
                            >
                              ⚡ Sisa kuota diskon: {remainingClaimQuota} orang
                            </div>
                          )}

                          {/* Kuota Kredit */}
                          <div
                            style={{
                              padding: "6px 8px",
                              background: isSelected ? "#dcfce7" : "#f8fafc",
                              borderRadius: 7,
                              fontSize: 11.5,
                              color: "#0f172a",
                              fontWeight: 600,
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <Sparkles size={13} color="#00C988" />
                            <span>
                              Mendapatkan <strong>{pkg.creditsGranted.toLocaleString("id-ID")} Kredit</strong>
                            </span>
                          </div>
                        </div>

                        <div style={{ marginTop: 10, paddingTop: 8, borderTop: "1px dashed #e2e8f0" }}>
                          <span style={{ fontSize: 10.5, color: isSelected ? "#047857" : "#64748b" }}>
                            ~Rp {Math.round(effectivePrice / pkg.creditsGranted).toLocaleString("id-ID")} / koin
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Input Kode Voucher / Referral Promo */}
                <div
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: 12,
                    padding: "14px 18px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 700, color: "#334155" }}>
                    <Tag size={14} color="#4338ca" />
                    <span>Punya Kode Voucher / Referral Kampus?</span>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      type="text"
                      placeholder="Masukkan kode promo (misal: ZET-xxxx atau PROMO20)"
                      value={voucherCodeInput}
                      onChange={(e) => setVoucherCodeInput(e.target.value.toUpperCase())}
                      style={{
                        flex: 1,
                        background: "#ffffff",
                        border: "1px solid #cbd5e1",
                        borderRadius: 8,
                        padding: "7px 12px",
                        fontSize: 12.5,
                        textTransform: "uppercase",
                        fontWeight: 600,
                        color: "#0f172a",
                      }}
                    />
                    {appliedVoucher ? (
                      <button
                        type="button"
                        onClick={handleRemoveVoucher}
                        style={{
                          background: "#fee2e2",
                          color: "#b91c1c",
                          border: "none",
                          borderRadius: 8,
                          padding: "7px 14px",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Hapus
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleApplyVoucher}
                        disabled={validatingVoucher || !voucherCodeInput.trim()}
                        style={{
                          background: "#4338ca",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: 8,
                          padding: "7px 16px",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: validatingVoucher ? "wait" : "pointer",
                        }}
                      >
                        {validatingVoucher ? "Memeriksa..." : "Terapkan"}
                      </button>
                    )}
                  </div>

                  {voucherFeedback && (
                    <div
                      style={{
                        fontSize: 11.5,
                        fontWeight: 600,
                        color: voucherFeedback.type === "success" ? "#15803d" : "#b91c1c",
                      }}
                    >
                      {voucherFeedback.message}
                    </div>
                  )}
                </div>

                {/* Pilihan Metode Pembayaran */}
                {selectedPkg && (
                  <div
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: 12,
                      padding: "12px 18px",
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 8 }}>
                      Pilih Metode Pembayaran:
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {[
                        { id: "SIMULATION", label: "⚡ Bayar Instan (Simulasi)", icon: Zap },
                        { id: "QRIS", label: "QRIS", icon: QrCode },
                        { id: "VA_BCA", label: "BCA VA", icon: Building },
                        { id: "VA_MANDIRI", label: "Mandiri VA", icon: Building },
                      ].map((m) => {
                        const isMActive = paymentMethod === m.id;
                        const Icon = m.icon;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setPaymentMethod(m.id as any)}
                            style={{
                              padding: "6px 12px",
                              borderRadius: 8,
                              fontSize: 11.5,
                              fontWeight: isMActive ? 700 : 500,
                              background: isMActive ? "#ffffff" : "#f1f5f9",
                              border: isMActive ? "1.5px solid #00C988" : "1px solid #cbd5e1",
                              color: isMActive ? "#047857" : "#475569",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <Icon size={13} />
                            <span>{m.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          ) : activeTab === "REFERRAL" ? (
            /* TAB REFERRAL SHARE-TO-EARN */
            <div style={{ display: "flex", flexDirection: "column", gap: 18, padding: "8px 0" }}>
              <div
                style={{
                  background: "linear-gradient(135deg, #4338ca 0%, #312e81 100%)",
                  borderRadius: 14,
                  padding: "20px 24px",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#a5b4fc" }}>
                    Program Share &amp; Earn
                  </div>
                  <h4 style={{ margin: "4px 0 6px", fontSize: 18, fontWeight: 800 }}>
                    Undang Teman, Dapatkan +20 Koin Gratis!
                  </h4>
                  <p style={{ margin: 0, fontSize: 12.5, color: "#e0e7ff", maxWidth: 480 }}>
                    Temanmu mendapatkan <strong>Diskon 15% + 10 Koin Bonus</strong> saat mendaftar/top-up. Dan kamu otomatis menerima <strong>+20 Koin Kredit</strong> ke akunmu!
                  </p>
                </div>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Gift size={24} />
                </div>
              </div>

              {referralInfo ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "16px 18px" }}>
                    <span style={{ fontSize: 11.5, color: "#64748b", display: "block", marginBottom: 6 }}>
                      Kode Referral Unik Anda:
                    </span>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", letterSpacing: "0.05em" }}>
                        {referralInfo.referralCode}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(referralInfo.referralCode);
                          setCopiedCode(true);
                          notify.success("Kode referral berhasil disalin!");
                          setTimeout(() => setCopiedCode(false), 2000);
                        }}
                        style={{
                          background: copiedCode ? "#dcfce7" : "#ffffff",
                          color: copiedCode ? "#15803d" : "#4338ca",
                          border: "1px solid #cbd5e1",
                          borderRadius: 8,
                          padding: "6px 12px",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        {copiedCode ? <CheckCheck size={14} /> : <Copy size={14} />}
                        <span>{copiedCode ? "Tersalin" : "Salin Kode"}</span>
                      </button>
                    </div>
                  </div>

                  <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "16px 18px" }}>
                    <span style={{ fontSize: 11.5, color: "#64748b", display: "block", marginBottom: 6 }}>
                      Statistik Referral Anda:
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
                          {referralInfo.totalReferred} Orang
                        </div>
                        <span style={{ fontSize: 11, color: "#64748b" }}>Teman Bergabung</span>
                      </div>
                      <div style={{ borderLeft: "1px solid #cbd5e1", paddingLeft: 20 }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: "#16a34a" }}>
                          +{referralInfo.totalCoinsEarned} Koin
                        </div>
                        <span style={{ fontSize: 11, color: "#64748b" }}>Total Reward Didapat</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "20px 0", color: "#64748b" }}>
                  Memuat informasi referral...
                </div>
              )}
            </div>
          ) : (
            /* TAB RIWAYAT TRANSAKSI / AUDIT LEDGER */
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Category Filter Pills */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                {[
                  { id: "ALL", label: "Semua Transaksi" },
                  { id: "REGULAR_PURCHASE", label: "🛒 Beli Biasa" },
                  { id: "PROMO_PURCHASE", label: "🏷️ Promo / Voucher" },
                  { id: "REWARD_EARNED", label: "🎁 Komisi Mitra" },
                  { id: "DIAMOND_REDEMPTION", label: "💎 Tukar Diamond" },
                  { id: "AI_USAGE", label: "⚡ Pemakaian AI" },
                ].map((pill) => {
                  const isCatActive = selectedCategory === pill.id;
                  return (
                    <button
                      key={pill.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(pill.id);
                        loadTransactions(pill.id);
                      }}
                      style={{
                        padding: "5px 12px",
                        borderRadius: 20,
                        fontSize: 11.5,
                        fontWeight: isCatActive ? 700 : 500,
                        background: isCatActive ? "#00C988" : "#f1f5f9",
                        color: isCatActive ? "#ffffff" : "#475569",
                        border: isCatActive ? "1px solid #00C988" : "1px solid #e2e8f0",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {pill.label}
                    </button>
                  );
                })}
              </div>

              {loadingTransactions ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#64748b", fontSize: 13 }}>
                  Memuat riwayat transaksi...
                </div>
              ) : transactions.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "36px 16px",
                    background: "#f8fafc",
                    borderRadius: 12,
                    border: "1px dashed #cbd5e1",
                    color: "#64748b",
                    fontSize: 13,
                  }}
                >
                  Tidak ada catatan aktivitas untuk filter kategori ini.
                </div>
              ) : (
                <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, textAlign: "left" }}>
                    <thead>
                      <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#64748b" }}>
                        <th style={{ padding: "10px 14px" }}>Waktu</th>
                        <th style={{ padding: "10px 14px" }}>Kategori</th>
                        <th style={{ padding: "10px 14px" }}>Keterangan</th>
                        <th style={{ padding: "10px 14px", textAlign: "right" }}>Kredit AI</th>
                        <th style={{ padding: "10px 14px", textAlign: "right" }}>Diamond Reward</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((t) => {
                        const isPos = t.amount > 0;
                        const hasDiamond = t.diamondAmount !== null && t.diamondAmount !== undefined && t.diamondAmount !== 0;
                        const isDiamondPos = (t.diamondAmount || 0) > 0;

                        return (
                          <tr key={t.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                            <td style={{ padding: "10px 14px", color: "#64748b", whiteSpace: "nowrap" }}>
                              <div style={{ fontWeight: 600, color: "#334155" }}>
                                {new Date(t.createdAt).toLocaleDateString("id-ID")}
                              </div>
                              <div style={{ fontSize: 10.5, color: "#94a3b8" }}>
                                {new Date(t.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                              </div>
                            </td>

                            <td style={{ padding: "10px 14px" }}>
                              {t.category === "REGULAR_PURCHASE" ? (
                                <span style={{ padding: "3px 8px", borderRadius: 6, fontSize: 10.5, fontWeight: 700, background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", whiteSpace: "nowrap" }}>
                                  🛒 Beli Biasa
                                </span>
                              ) : t.category === "PROMO_PURCHASE" ? (
                                <span style={{ padding: "3px 8px", borderRadius: 6, fontSize: 10.5, fontWeight: 700, background: "#f5f3ff", color: "#6d28d9", border: "1px solid #ddd6fe", whiteSpace: "nowrap" }}>
                                  🏷️ Diskon Promo
                                </span>
                              ) : t.category === "REWARD_EARNED" ? (
                                <span style={{ padding: "3px 8px", borderRadius: 6, fontSize: 10.5, fontWeight: 700, background: "#ecfdf5", color: "#047857", border: "1px solid #a7f3d0", whiteSpace: "nowrap" }}>
                                  🎁 Komisi Mitra
                                </span>
                              ) : t.category === "DIAMOND_REDEMPTION" ? (
                                <span style={{ padding: "3px 8px", borderRadius: 6, fontSize: 10.5, fontWeight: 700, background: "#fffbeb", color: "#b45309", border: "1px solid #fde68a", whiteSpace: "nowrap" }}>
                                  💎 Tukar Diamond
                                </span>
                              ) : t.category === "AI_USAGE" ? (
                                <span style={{ padding: "3px 8px", borderRadius: 6, fontSize: 10.5, fontWeight: 600, background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", whiteSpace: "nowrap" }}>
                                  ⚡ Pakai AI
                                </span>
                              ) : t.category === "REFUND" ? (
                                <span style={{ padding: "3px 8px", borderRadius: 6, fontSize: 10.5, fontWeight: 700, background: "#fff7ed", color: "#c2410c", border: "1px solid #ffedd5", whiteSpace: "nowrap" }}>
                                  ↩️ Refund
                                </span>
                              ) : (
                                <span
                                  style={{
                                    padding: "3px 7px",
                                    borderRadius: 6,
                                    fontSize: 10.5,
                                    fontWeight: 600,
                                    background: isPos ? "#dcfce7" : "#fee2e2",
                                    color: isPos ? "#166534" : "#991b1b",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {t.type}
                                </span>
                              )}
                            </td>

                            <td style={{ padding: "10px 14px", color: "#334155", maxWidth: 260 }}>
                              <div style={{ fontWeight: 500, lineHeight: 1.3 }}>{t.description || "-"}</div>
                            </td>

                            <td
                              style={{
                                padding: "10px 14px",
                                textAlign: "right",
                                fontWeight: 700,
                                whiteSpace: "nowrap",
                                color: t.amount === 0 ? "#94a3b8" : isPos ? "#059669" : "#dc2626",
                              }}
                            >
                              {t.amount === 0 ? "0 Koin" : isPos ? `+${t.amount} Koin` : `${t.amount} Koin`}
                            </td>

                            <td style={{ padding: "10px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                              {hasDiamond ? (
                                <span
                                  style={{
                                    fontWeight: 800,
                                    fontSize: 11.5,
                                    color: isDiamondPos ? "#059669" : "#b45309",
                                  }}
                                >
                                  {isDiamondPos ? `+${t.diamondAmount.toLocaleString("id-ID")} 💎` : `${t.diamondAmount.toLocaleString("id-ID")} 💎`}
                                </span>
                              ) : (
                                <span style={{ color: "#cbd5e1" }}>-</span>
                              )}
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
        </div>

        {/* Footer Checkout */}
        {activeTab === "PACKAGES" && selectedPkg && (
          <div
            style={{
              padding: "14px 24px",
              borderTop: "1px solid #e2e8f0",
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <div>
              <div style={{ fontSize: 11, color: "#64748b" }}>
                Total Bayar {discountAmount > 0 ? `(Diskon Rp ${discountAmount.toLocaleString("id-ID")})` : ""}:
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
                  Rp {finalPriceToPay.toLocaleString("id-ID")}
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#059669" }}>
                  +{finalCreditsGranted} Koin
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: "#64748b",
                  background: "transparent",
                  border: "1px solid #cbd5e1",
                  cursor: "pointer",
                }}
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={submitting}
                style={{
                  padding: "8px 20px",
                  borderRadius: 8,
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: "#ffffff",
                  background: "linear-gradient(135deg, #00C988 0%, #059669 100%)",
                  border: "none",
                  cursor: submitting ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 4px 12px rgba(0, 201, 136, 0.3)",
                }}
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <CreditCard size={15} />
                    <span>Bayar Sekarang</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
