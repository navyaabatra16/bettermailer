import MailboxApp from "@/components/MailboxApp";
import { getSessionUserEmail, requireAuth } from "@/lib/auth";

export default async function SpamPage() {
  await requireAuth();
  const userEmail = (await getSessionUserEmail()) ?? "";
  return <MailboxApp mailbox="spam" userEmail={userEmail} />;
}
