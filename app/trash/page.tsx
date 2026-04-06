import MailboxApp from "@/components/MailboxApp";
import { requireAuth } from "@/lib/auth";

export default async function TrashPage() {
  await requireAuth();
  return <MailboxApp mailbox="trash" />;
}
