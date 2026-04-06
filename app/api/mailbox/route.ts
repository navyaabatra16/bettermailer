import { NextResponse } from "next/server";
import { getMailboxEmailsForUser } from "@/lib/mailbox";
import { type MailboxKey } from "@/lib/mailData";

const ALLOWED_MAILBOXES = new Set<MailboxKey>([
  "inbox",
  "sent",
  "all-mail",
  "drafts",
  "spam",
  "trash",
]);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mailbox = searchParams.get("mailbox") as MailboxKey | null;
    const userEmail = searchParams.get("userEmail") ?? "";

    if (!mailbox || !ALLOWED_MAILBOXES.has(mailbox)) {
      return NextResponse.json(
        { error: "Invalid mailbox." },
        { status: 400 },
      );
    }

    if (!userEmail.trim()) {
      return NextResponse.json(
        { error: "User email is required." },
        { status: 400 },
      );
    }

    const emails = await getMailboxEmailsForUser(userEmail, mailbox);

    return NextResponse.json({ emails });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to load mailbox right now.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
