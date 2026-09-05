import { redirect } from "next/navigation";

export default function ExchangePage() {
  redirect("/admin-only/dashboard?tab=exchange");
}
