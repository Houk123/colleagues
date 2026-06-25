import { NextAuthGuard } from "@/features/auth/ui/NextAuthGuard";
import PortalPage from "@/screens/PortalPage";

export default async function Page({ params }: { params: Promise<{ portalSlug: string }> }) {
  const { portalSlug } = await params;
  return (
    <NextAuthGuard>
      <PortalPage portalSlug={portalSlug} />
    </NextAuthGuard>
  );
}
