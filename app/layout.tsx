import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zetera — Research Journal Intelligence",
  description:
    "Workspace riset cerdas yang mengingat, memvalidasi, dan menghubungkan setiap jurnal dengan kerangka penelitianmu.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="h-full">
      <body className="min-h-full flex flex-col antialiased">
        <AuthProvider>{children}</AuthProvider>
        <Toaster
          richColors
          position="top-right"
          closeButton
          offset={88}
          gap={10}
          toastOptions={{
            style: {
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08)",
            },
          }}
        />
      </body>
    </html>
  );
}
