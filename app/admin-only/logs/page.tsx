import { redirect } from "next/navigation";

export default function LogsPage() {
  redirect("/admin-only/dashboard?tab=logs");
}
