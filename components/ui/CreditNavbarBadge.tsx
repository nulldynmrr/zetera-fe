"use client";

import { useState } from "react";
import { Sparkles, Plus, Award } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { CreditTopupModal } from "./CreditTopupModal";
import { MitraRewardModal } from "./MitraRewardModal";

interface CreditNavbarBadgeProps {
  requiredCredits?: number;
}

export function CreditNavbarBadge({ requiredCredits }: CreditNavbarBadgeProps) {
  const { user, refreshUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);

  const credits = user?.credits ?? 0;
  const isZero = credits === 0;
  const isPartner = Boolean(
    user?.isRewardPartner ||
    user?.partnerStatus ||
    (user?.rewardDiamonds && user.rewardDiamonds > 0)
  );

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      {/* ── Menu Khusus Mitra / Reward (Hanya Muncul untuk User Berstatus Mitra / Punya Diamond) ── */}
      {isPartner && (
        <button
          type="button"
          onClick={() => setShowRewardModal(true)}
          title="Klaim reward mitra & tukar Diamond ke paket kredit AI"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 12px",
            borderRadius: 9999,
            background: "linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)",
            border: "1px solid #C7D2FE",
            color: "#4338CA",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.15s ease",
            boxShadow: "0 1px 3px rgba(99, 102, 241, 0.15)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <span style={{ fontSize: 13 }}>💎</span>
          <span>{(user?.rewardDiamonds || 0).toLocaleString("id-ID")} Diamond</span>
          <span
            style={{
              background: "#4338CA",
              color: "#ffffff",
              borderRadius: 4,
              padding: "1px 5px",
              fontSize: 9.5,
              fontWeight: 800,
              letterSpacing: "0.03em",
              marginLeft: 2,
            }}
          >
            REWARD
          </span>
        </button>
      )}

      {/* ── Badge Saldo Kredit AI Utama ── */}
      <button
        type="button"
        onClick={() => setShowModal(true)}
        title="Klik untuk melihat paket kredit riset & top up saldo"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 11px",
          borderRadius: 9999,
          background: isZero
            ? "#fef2f2"
            : "linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)",
          border: isZero ? "1px solid #fecaca" : "1px solid #a7f3d0",
          color: isZero ? "#b91c1c" : "#047857",
          fontSize: 12,
          fontWeight: 700,
          cursor: "pointer",
          transition: "all 0.15s ease",
          boxShadow: isZero ? "none" : "0 1px 3px rgba(0, 201, 136, 0.1)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: isZero ? "#ef4444" : "#00C988",
            color: "#ffffff",
          }}
        >
          <Sparkles size={11} />
        </span>

        <span>{credits.toLocaleString("id-ID")} Kredit</span>

        <span
          style={{
            background: isZero ? "#dc2626" : "#059669",
            color: "#ffffff",
            borderRadius: 4,
            padding: "1px 4px",
            fontSize: 10,
            fontWeight: 800,
            display: "inline-flex",
            alignItems: "center",
            marginLeft: 2,
          }}
        >
          <Plus size={10} strokeWidth={3} />
        </span>
      </button>

      <CreditTopupModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        currentBalance={credits}
        requiredCredits={requiredCredits}
        onSuccess={async () => {
          await refreshUser();
        }}
      />

      <MitraRewardModal
        isOpen={showRewardModal}
        onClose={() => setShowRewardModal(false)}
        onSuccess={async () => {
          await refreshUser();
        }}
      />
    </div>
  );
}
