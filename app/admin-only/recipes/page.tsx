import { redirect } from "next/navigation";

export default function RecipesPage() {
  redirect("/admin-only/dashboard?tab=subchapters");
}
