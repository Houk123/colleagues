import AcceptInvitePage from "@/screens/AcceptInvitePage";

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <AcceptInvitePage token={token} />;
}
