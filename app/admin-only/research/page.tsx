import { redirect } from "next/navigation";

export default function ResearchPage() {
  redirect("/admin-only/dashboard?tab=research");
}
