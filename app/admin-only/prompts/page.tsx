import { redirect } from "next/navigation";

export default function PromptsPage() {
  redirect("/admin-only/dashboard?tab=prompts");
}
