import { redirect } from "next/navigation";

export default function SubchaptersPage() {
  redirect("/admin-only/dashboard?tab=subchapters");
}
