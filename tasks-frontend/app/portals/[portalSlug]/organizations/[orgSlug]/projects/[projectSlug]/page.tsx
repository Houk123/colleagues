import { NextAuthGuard } from "@/features/auth/ui/NextAuthGuard";
import ProjectPage from "@/screens/ProjectPage";

export default async function Page({ params }: { params: Promise<{ portalSlug: string; orgSlug: string; projectSlug: string }> }) {
  const { portalSlug, orgSlug, projectSlug } = await params;
  return (
    <NextAuthGuard>
      <ProjectPage portalSlug={portalSlug} orgSlug={orgSlug} projectSlug={projectSlug} />
    </NextAuthGuard>
  );
}
