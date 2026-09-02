"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Building2, MapPin, Check, Sparkles } from "lucide-react";
import { searchUniversities, UniversityItem } from "@/lib/universities-data";

interface UniversityAutocompleteProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onSelectCity?: (city: string) => void;
  placeholder?: string;
  required?: boolean;
}

export function UniversityAutocomplete({
  id = "universitas",
  label = "Universitas / Institut",
  value,
  onChange,
  onSelectCity,
  placeholder = "Ketik atau cari nama universitas...",
  required = false,
}: UniversityAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<UniversityItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    const fetchMatches = async () => {
      setIsSearching(true);
      try {
        const results = await searchUniversities(value);
        if (active) {
          setSuggestions(results);
        }
      } catch (e) {
        if (active) setSuggestions([]);
      } finally {
        if (active) setIsSearching(false);
      }
    };

    if (isOpen) {
      const timeoutId = setTimeout(fetchMatches, 150);
      return () => {
        active = false;
        clearTimeout(timeoutId);
      };
    }
  }, [value, isOpen]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: UniversityItem) => {
    onChange(item.name);
    if (item.city && onSelectCity) {
      onSelectCity(item.city);
    }
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} style={{ position: "relative", display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <label
          htmlFor={id}
          style={{
            fontSize: 12.5,
            fontWeight: 600,
            color: "#0f172a",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>{label} {required && <span style={{ color: "#ef4444" }}>*</span>}</span>
          <span style={{ fontSize: 11, fontWeight: 500, color: "#64748b" }}>
            (Pilih dari daftar atau ketik manual)
          </span>
        </label>
      )}

      <div style={{ position: "relative" }}>
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
          style={{
            width: "100%",
            padding: "10px 36px 10px 14px",
            borderRadius: 8,
            border: "1px solid #cbd5e1",
            fontFamily: "var(--font-body)",
            fontSize: 13.5,
            color: "#0f172a",
            outline: "none",
            boxSizing: "border-box",
            background: "#ffffff",
            transition: "border-color 0.15s ease",
          }}
        />

        <div
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: "#94a3b8",
            display: "flex",
            alignItems: "center",
            pointerEvents: "none",
          }}
        >
          <Search size={16} />
        </div>
      </div>

      {/* Autocomplete Dropdown List */}
      {isOpen && suggestions.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 60,
            marginTop: 4,
            maxHeight: 240,
            overflowY: "auto",
            background: "#ffffff",
            borderRadius: 10,
            border: "1px solid #cbd5e1",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            padding: "6px 0",
          }}
        >
          <div
            style={{
              padding: "4px 12px 6px",
              fontSize: 11,
              fontWeight: 700,
              color: "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              borderBottom: "1px solid #f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>Rekomendasi Kampus Terdaftar</span>
            {isSearching && <span style={{ color: "#00C988" }}>Mencari...</span>}
          </div>

          {suggestions.map((item, idx) => {
            const isSelected = item.name.toLowerCase() === value.trim().toLowerCase();
            return (
              <div
                key={idx}
                onClick={() => handleSelect(item)}
                style={{
                  padding: "9px 14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: isSelected ? "#f0fdf4" : "transparent",
                  borderLeft: isSelected ? "3px solid #00C988" : "3px solid transparent",
                  transition: "background 0.1s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = "#f8fafc";
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = "transparent";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Building2 size={15} color={isSelected ? "#00C988" : "#64748b"} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
                      {item.name}
                    </div>
                    {item.city && (
                      <div style={{ fontSize: 11.5, color: "#64748b", display: "flex", alignItems: "center", gap: 4, marginTop: 1 }}>
                        <MapPin size={11} />
                        <span>{item.city}{item.province ? `, ${item.province}` : ""}</span>
                      </div>
                    )}
                  </div>
                </div>

                {isSelected && <Check size={16} color="#00C988" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
