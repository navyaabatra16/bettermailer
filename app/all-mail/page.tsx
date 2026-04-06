import MailboxApp from "@/components/MailboxApp";
import { getSessionUserEmail, requireAuth } from "@/lib/auth";

export default async function AllMailPage() {
  await requireAuth();
  const userEmail = (await getSessionUserEmail()) ?? "";
  return <MailboxApp mailbox="all-mail" userEmail={userEmail} />;
}
