import { redirect } from "next/navigation";

export default function RoutingPage() {
  redirect("/admin-only/dashboard?tab=routing");
}
