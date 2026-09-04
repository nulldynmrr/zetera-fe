import React from "react";
import {
  Sparkles,
  X,
  FileEdit,
  Search,
  CheckCheck,
  PlusCircle,
  Copy,
  RefreshCw,
  Paperclip,
  Send,
} from "lucide-react";
import { AiChatMessage, TabKey } from "../types";

interface ProposalAiSidebarProps {
  showAiAssistant: boolean;
  setShowAiAssistant: (show: boolean) => void;
  aiActiveTab: "chat" | "tulis" | "tinjau" | "riset";
  setAiActiveTab: (tab: "chat" | "tulis" | "tinjau" | "riset") => void;
  profileName?: string;
  projectTitle?: string;
  aiInputPrompt: string;
  setAiInputPrompt: (prompt: string) => void;
  isAiThinking: boolean;
  aiChatMessages: AiChatMessage[];
  activeTab: TabKey;
  handleSendAiMessage: () => void;
  handleInsertAiDraftToDocument: (text: string) => void;
  setLastSavedTime: (msg: string | null) => void;
}

export function ProposalAiSidebar({
  showAiAssistant,
  setShowAiAssistant,
  aiActiveTab,
  setAiActiveTab,
  profileName,
  projectTitle,
  aiInputPrompt,
  setAiInputPrompt,
  isAiThinking,
  aiChatMessages,
  activeTab,
  handleSendAiMessage,
  handleInsertAiDraftToDocument,
  setLastSavedTime,
}: ProposalAiSidebarProps) {
  if (!showAiAssistant) return null;

  return (
    <aside
      id="ai_companion_panel"
      className="no-print"
      style={{
        width: 320,
        minWidth: 320,
        background: "#FFFFFF",
        borderLeft: "1px solid #E2E8F0",
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 105px)",
        position: "sticky",
        top: 105,
        zIndex: 20,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 16px",
          borderBottom: "1px solid #F1F5F9",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Sparkles size={16} color="#4338CA" />
          <span
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: "#0F172A",
              letterSpacing: "0.02em",
            }}
          >
            AI ASSISTANT
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowAiAssistant(false)}
          style={{ background: "transparent", border: "none", cursor: "pointer", color: "#94A3B8" }}
        >
          <X size={15} />
        </button>
      </div>

      {/* Sub-Tabs: Chat, Tulis, Tinjau, Riset */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          padding: "4px 8px",
          borderBottom: "1px solid #F1F5F9",
          background: "#F8FAFC",
        }}
      >
        {[
          { id: "chat", label: "Chat" },
          { id: "tulis", label: "Tulis" },
          { id: "tinjau", label: "Tinjau" },
          { id: "riset", label: "Riset" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setAiActiveTab(tab.id as any)}
            style={{
              padding: "6px 0",
              border: "none",
              background: "transparent",
              fontSize: 11.5,
              fontWeight: aiActiveTab === tab.id ? 700 : 500,
              color: aiActiveTab === tab.id ? "#4338CA" : "#64748B",
              borderBottom: aiActiveTab === tab.id ? "2px solid #4338CA" : "2px solid transparent",
              cursor: "pointer",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Chat Body & Quick Prompts */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "14px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {/* Greeting Card */}
        <div
          style={{
            background: "#F8FAFC",
            borderRadius: 10,
            padding: "12px 14px",
            border: "1px solid #E2E8F0",
          }}
        >
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>
            👋 Hai {profileName ? profileName.split(" ")[0] : "Rekan Peneliti"}!
          </div>
          <div style={{ fontSize: 11.5, color: "#64748B", lineHeight: 1.4 }}>
            Saya siap membantu penulisan skripsi & proposal Anda.
          </div>
        </div>

        {/* SARAN CEPAT */}
        <div>
          <div
            style={{
              fontSize: 10.5,
              fontWeight: 800,
              color: "#94A3B8",
              textTransform: "uppercase",
              marginBottom: 8,
              letterSpacing: "0.04em",
            }}
          >
            SARAN CEPAT
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { title: "Generate Outline Skripsi", desc: "Buat struktur skripsi otomatis", icon: Sparkles },
              { title: "Generate Sub-Bab", desc: "Buat sub-bab dari topik tertentu", icon: FileEdit },
              { title: "Cari Referensi", desc: "Cari jurnal dan referensi relevan", icon: Search },
              { title: "Perbaiki Bahasa", desc: "Perbaiki tata bahasa dan ejaan", icon: CheckCheck },
            ].map((s, idx) => {
              const Icon = s.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setAiInputPrompt(
                      `Tolong ${s.title.toLowerCase()} untuk judul "${projectTitle || "Topik Riset"}"`
                    );
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: "1px solid #E2E8F0",
                    background: "#FFFFFF",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      background: "#EEEAFE",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#4338CA",
                    }}
                  >
                    <Icon size={14} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#0F172A" }}>{s.title}</div>
                    <div style={{ fontSize: 10.5, color: "#64748B" }}>{s.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat Messages */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {aiChatMessages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                maxWidth: "92%",
                padding: "10px 12px",
                borderRadius: 10,
                background: msg.sender === "user" ? "#4338CA" : "#F1F5F9",
                color: msg.sender === "user" ? "#FFFFFF" : "#0F172A",
                fontSize: 12,
                lineHeight: 1.45,
              }}
            >
              <div style={{ whiteSpace: "pre-wrap" }}>{msg.text}</div>

              {/* Rujukan sitasi yang dipakai */}
              {msg.usedCitations && msg.usedCitations.length > 0 && (
                <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {msg.usedCitations.map((c, cIdx) => (
                    <span
                      key={cIdx}
                      style={{
                        fontSize: 10,
                        background: "#E0E7FF",
                        color: "#3730A3",
                        padding: "2px 6px",
                        borderRadius: 4,
                      }}
                    >
                      📚 {c}
                    </span>
                  ))}
                </div>
              )}

              {/* Tombol aksi langsung ke naskah */}
              {msg.sender === "ai" && msg.revisedContent && (
                <div
                  style={{
                    marginTop: 8,
                    paddingTop: 8,
                    borderTop: "1px solid #CBD5E1",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleInsertAiDraftToDocument(msg.revisedContent!)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      background: "#4338CA",
                      color: "#FFFFFF",
                      border: "none",
                      borderRadius: 6,
                      padding: "4px 8px",
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    <PlusCircle size={12} />
                    <span>Sisipkan ke Naskah ({activeTab.toUpperCase()})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(msg.revisedContent!);
                      setLastSavedTime("Draf AI disalin!");
                      setTimeout(() => setLastSavedTime(null), 2500);
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      background: "#E2E8F0",
                      color: "#334155",
                      border: "none",
                      borderRadius: 6,
                      padding: "4px 8px",
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <Copy size={12} />
                    <span>Salin</span>
                  </button>
                </div>
              )}

              <div style={{ fontSize: 9.5, opacity: 0.7, marginTop: 4, textAlign: "right" }}>
                {msg.time}
              </div>
            </div>
          ))}

          {isAiThinking && (
            <div
              style={{
                alignSelf: "flex-start",
                padding: "8px 12px",
                borderRadius: 10,
                background: "#F1F5F9",
                fontSize: 11.5,
                color: "#64748B",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <RefreshCw size={12} className="animate-spin" />
              <span>Sedang merumuskan jawaban...</span>
            </div>
          )}
        </div>
      </div>

      {/* Chat Input Box */}
      <div style={{ padding: "12px", borderTop: "1px solid #F1F5F9", background: "#FFFFFF" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "#F8FAFC",
            border: "1px solid #CBD5E1",
            borderRadius: 10,
            padding: "6px 10px",
          }}
        >
          <button
            type="button"
            style={{ border: "none", background: "transparent", color: "#64748B", cursor: "pointer" }}
            title="Sisipkan Konteks"
          >
            <Paperclip size={14} />
          </button>
          <input
            type="text"
            placeholder="Ketik pertanyaan atau perintah..."
            value={aiInputPrompt}
            onChange={(e) => setAiInputPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendAiMessage()}
            style={{
              flex: 1,
              border: "none",
              background: "transparent",
              outline: "none",
              fontSize: 12,
              color: "#0F172A",
            }}
          />
          <button
            type="button"
            onClick={handleSendAiMessage}
            disabled={isAiThinking || !aiInputPrompt.trim()}
            style={{
              border: "none",
              background: isAiThinking || !aiInputPrompt.trim() ? "#CBD5E1" : "#4338CA",
              color: "#FFFFFF",
              borderRadius: 6,
              width: 28,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: isAiThinking || !aiInputPrompt.trim() ? "not-allowed" : "pointer",
            }}
          >
            <Send size={13} />
          </button>
        </div>
      </div>
    </aside>
  );
}
