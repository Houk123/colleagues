import { NextAuthGuard } from "@/features/auth/ui/NextAuthGuard";
import TaskPage from "@/screens/TaskPage";

export default async function Page({ params }: { params: Promise<{ portalSlug: string; orgSlug: string; projectSlug: string; taskId: string }> }) {
  const { portalSlug, orgSlug, projectSlug, taskId } = await params;
  return (
    <NextAuthGuard>
      <TaskPage portalSlug={portalSlug} orgSlug={orgSlug} projectSlug={projectSlug} taskId={taskId} />
    </NextAuthGuard>
  );
}
