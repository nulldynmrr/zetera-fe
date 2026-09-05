import { redirect } from "next/navigation";

export default function PricingPage() {
  redirect("/admin-only/dashboard?tab=pricing");
}
