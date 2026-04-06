import MailboxApp from "@/components/MailboxApp";
import { getSessionUserEmail, requireAuth } from "@/lib/auth";

export default async function DraftsPage() {
  await requireAuth();
  const userEmail = (await getSessionUserEmail()) ?? "";
  return <MailboxApp mailbox="drafts" userEmail={userEmail} />;
}
