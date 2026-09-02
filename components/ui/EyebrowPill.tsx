type Wash = "mint" | "sky" | "peach";

const washMap: Record<Wash, { bg: string; color: string }> = {
  mint: { bg: "var(--color-mint-wash)", color: "#166534" },
  sky: { bg: "var(--color-sky-wash)", color: "var(--color-portrait-ink)" },
  peach: { bg: "var(--color-peach-wash)", color: "#92400e" },
};

interface EyebrowPillProps {
  children: React.ReactNode;
  wash?: Wash;
}

export function EyebrowPill({ children, wash = "sky" }: EyebrowPillProps) {
  const { bg, color } = washMap[wash];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px",
        borderRadius: "9999px",
        background: bg,
        fontFamily: "var(--font-switzer)",
        fontSize: "var(--text-caption)",
        fontWeight: 600,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color,
        lineHeight: 1.5,
        userSelect: "none",
      }}
    >
      {children}
    </span>
  );
}
