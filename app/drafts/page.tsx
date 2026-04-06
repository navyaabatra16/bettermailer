import MailboxApp from "@/components/MailboxApp";
import { requireAuth } from "@/lib/auth";

export default async function DraftsPage() {
  await requireAuth();
  return <MailboxApp mailbox="drafts" />;
}
