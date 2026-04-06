import MailboxApp from "@/components/MailboxApp";
import { requireAuth } from "@/lib/auth";

export default async function AllMailPage() {
  await requireAuth();
  return <MailboxApp mailbox="all-mail" />;
}
