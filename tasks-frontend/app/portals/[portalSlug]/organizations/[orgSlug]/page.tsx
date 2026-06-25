import { NextAuthGuard } from "@/features/auth/ui/NextAuthGuard";
import OrganizationPage from "@/screens/OrganizationPage";

export default async function Page({ params }: { params: Promise<{ portalSlug: string; orgSlug: string }> }) {
  const { portalSlug, orgSlug } = await params;
  return (
    <NextAuthGuard>
      <OrganizationPage portalSlug={portalSlug} orgSlug={orgSlug} />
    </NextAuthGuard>
  );
}
