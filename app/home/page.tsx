import MailboxApp from "@/components/MailboxApp";
import { requireAuth } from "@/lib/auth";

export default async function HomePage() {
  await requireAuth();
  return <MailboxApp mailbox="inbox" />;
}
