// Auth group layout — white canvas, no main nav
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-white-canvas)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {children}
    </div>
  );
}
