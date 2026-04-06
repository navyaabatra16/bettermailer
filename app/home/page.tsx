import MailboxApp from "@/components/MailboxApp";
import { getSessionUserEmail, requireAuth } from "@/lib/auth";

export default async function HomePage() {
  await requireAuth();
  const userEmail = (await getSessionUserEmail()) ?? "";
  return <MailboxApp mailbox="inbox" userEmail={userEmail} />;
}
