"use client";

import React from "react";
import { toast } from "sonner";
import { AlertTriangle, Trash2 } from "lucide-react";

export { toast };

export const notify = {
  success: (message: string, description?: string) => {
    toast.success(message, { description, duration: 4000 });
  },
  error: (message: string, description?: string) => {
    toast.error(message, { description, duration: 5000 });
  },
  info: (message: string, description?: string) => {
    toast.info(message, { description, duration: 4000 });
  },
  warning: (message: string, description?: string) => {
    toast.warning(message, { description, duration: 4500 });
  },
  /**
   * Interactive confirmation prompt via rich notification or dialog.
   * Supports both callback style (onConfirm/onCancel) and Promise style (await notify.confirm(...)).
   * Accepts both `message` or `description`.
   */
  confirm: (options: {
    title?: string;
    message?: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isDestructive?: boolean;
    onConfirm?: () => void | Promise<void>;
    onCancel?: () => void;
  }): Promise<boolean> => {
    const {
      title = "Konfirmasi Tindakan",
      message,
      description,
      confirmLabel = "Ya, Lanjutkan",
      cancelLabel = "Batal",
      isDestructive = true,
      onConfirm,
      onCancel,
    } = options;

    const displayMessage = message || description || "Apakah Anda yakin ingin melanjutkan tindakan ini?";

    return new Promise<boolean>((resolve) => {
      let resolved = false;

      const handleConfirm = async () => {
        if (resolved) return;
        resolved = true;
        try {
          if (onConfirm) {
            await onConfirm();
          }
          resolve(true);
        } catch (err: any) {
          notify.error("Gagal memproses aksi", err?.message);
          resolve(false);
        }
      };

      const handleCancel = () => {
        if (resolved) return;
        resolved = true;
        if (onCancel) onCancel();
        resolve(false);
      };

      toast.custom(
        (t) => (
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 12,
              boxShadow: "0 10px 30px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.08)",
              border: isDestructive ? "1px solid #FECDD3" : "1px solid #E2E8F0",
              padding: "16px 18px",
              minWidth: 320,
              maxWidth: 420,
              fontFamily: "inherit",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 9999,
                  background: isDestructive ? "#FEE2E2" : "#EFF6FF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {isDestructive ? (
                  <Trash2 size={18} color="#DC2626" />
                ) : (
                  <AlertTriangle size={18} color="#2563EB" />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>
                  {title}
                </div>
                <div style={{ fontSize: 12.5, color: "#64748B", lineHeight: 1.45, marginBottom: 12 }}>
                  {displayMessage}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => {
                      toast.dismiss(t);
                      handleCancel();
                    }}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 6,
                      border: "1px solid #CBD5E1",
                      background: "#FFFFFF",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#475569",
                      cursor: "pointer",
                    }}
                  >
                    {cancelLabel}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      toast.dismiss(t);
                      await handleConfirm();
                    }}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 6,
                      border: "none",
                      background: isDestructive ? "#DC2626" : "#4338CA",
                      color: "#FFFFFF",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      boxShadow: isDestructive
                        ? "0 2px 8px rgba(220, 38, 38, 0.25)"
                        : "0 2px 8px rgba(67, 56, 202, 0.25)",
                    }}
                  >
                    {confirmLabel}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ),
        {
          duration: 15000,
          onDismiss: () => {
            if (!resolved) handleCancel();
          },
          onAutoClose: () => {
            if (!resolved) handleCancel();
          },
        }
      );
    });
  },
};
