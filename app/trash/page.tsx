import MailboxApp from "@/components/MailboxApp";
import { getSessionUserEmail, requireAuth } from "@/lib/auth";

export default async function TrashPage() {
  await requireAuth();
  const userEmail = (await getSessionUserEmail()) ?? "";
  return <MailboxApp mailbox="trash" userEmail={userEmail} />;
}
