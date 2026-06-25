import { NextAuthGuard } from "@/features/auth/ui/NextAuthGuard";
import PortalsPage from "@/screens/PortalsPage";

export const metadata = {
  title: "Мои порталы — Коллеги",
};

export default function Page() {
  return (
    <NextAuthGuard>
      <PortalsPage />
    </NextAuthGuard>
  );
}
