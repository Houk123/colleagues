import { NextAuthGuard } from "@/features/auth/ui/NextAuthGuard";
import PortalRequestsPage from "@/screens/PortalRequestsPage";

export const metadata = {
  title: "Запросы на вступление — Коллеги",
};

export default function Page() {
  return (
    <NextAuthGuard>
      <PortalRequestsPage />
    </NextAuthGuard>
  );
}
