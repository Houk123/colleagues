import { NextAuthGuard } from "@/features/auth/ui/NextAuthGuard";
import JoinPortalPage from "@/screens/JoinPortalPage";

export const metadata = {
  title: "Вступить в портал — Коллеги",
};

export default function Page() {
  return (
    <NextAuthGuard>
      <JoinPortalPage />
    </NextAuthGuard>
  );
}
