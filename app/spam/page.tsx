import MailboxApp from "@/components/MailboxApp";
import { requireAuth } from "@/lib/auth";

export default async function SpamPage() {
  await requireAuth();
  return <MailboxApp mailbox="spam" />;
}
