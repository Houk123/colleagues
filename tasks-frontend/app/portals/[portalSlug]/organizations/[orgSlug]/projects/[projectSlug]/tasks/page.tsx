import TasksBoardPage from "@/screens/TasksBoardPage";

export default function Page({
  params,
}: {
  params: { portalSlug: string; orgSlug: string; projectSlug: string };
}) {
  return <TasksBoardPage {...params} />;
}
