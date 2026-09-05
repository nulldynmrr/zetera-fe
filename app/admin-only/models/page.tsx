import { redirect } from "next/navigation";

export default function ModelsPage() {
  redirect("/admin-only/dashboard?tab=models");
}
