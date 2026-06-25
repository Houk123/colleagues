import { NextAuthGuard } from "@/features/auth/ui/NextAuthGuard";
import PortalSettingsPage from "@/screens/PortalSettingsPage";

export default async function Page({ params }: { params: Promise<{ portalSlug: string }> }) {
  const { portalSlug } = await params;
  return (
    <NextAuthGuard>
      <PortalSettingsPage portalSlug={portalSlug} />
    </NextAuthGuard>
  );
}
