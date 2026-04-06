import MailboxApp from "@/components/MailboxApp";
import { requireAuth } from "@/lib/auth";

export default async function SentPage() {
  await requireAuth();
  return <MailboxApp mailbox="sent" />;
}
