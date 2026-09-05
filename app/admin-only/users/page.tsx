import { redirect } from "next/navigation";

export default function UsersPage() {
  redirect("/admin-only/dashboard?tab=users");
}
