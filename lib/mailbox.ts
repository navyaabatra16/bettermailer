import "server-only";

import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/app/src/db";
import { emails } from "@/app/src/db/schema";
import { type Email, type MailboxKey } from "@/lib/mailData";

function getAvatarColor(input: string) {
  const palette = [
    "#2563eb",
    "#0f766e",
    "#7c3aed",
    "#c2410c",
    "#0891b2",
    "#7c2d12",
    "#4f46e5",
    "#be123c",
  ];

  const hash = Array.from(input).reduce((total, character) => {
    return total + character.charCodeAt(0);
  }, 0);

  return palette[hash % palette.length];
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatGroup(date: Date) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const differenceInDays = Math.floor(
    (startOfToday.getTime() - startOfDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (differenceInDays <= 0) {
    return "Today";
  }

  if (differenceInDays === 1) {
    return "Yesterday";
  }

  if (differenceInDays < 7) {
    return "This Week";
  }

  return "Earlier";
}

function toMailboxEmail(record: typeof emails.$inferSelect): Email {
  const createdAt = new Date(record.createdAt);
  const sender =
    record.direction === "sent"
      ? record.recipientEmail || record.senderName
      : record.senderName;

  return {
    id: record.id,
    group: formatGroup(createdAt),
    sender,
    subject: record.subject,
    snippet: record.snippet,
    time: formatTime(createdAt),
    color: getAvatarColor(record.senderEmail || sender),
    fromEmail: record.senderEmail,
    body: record.body,
    direction:
      record.direction === "sent" ? "sent" : "received",
    toEmail: record.recipientEmail ?? undefined,
    receivedBy:
      record.direction === "received" ? record.ownerEmail : undefined,
    createdAt: record.createdAt.toISOString(),
  };
}

export async function getMailboxEmailsForUser(
  ownerEmail: string,
  mailbox: MailboxKey,
) {
  const db = getDb();
  const normalizedEmail = ownerEmail.trim().toLowerCase();

  const rows =
    mailbox === "all-mail"
      ? await db
          .select()
          .from(emails)
          .where(eq(emails.ownerEmail, normalizedEmail))
          .orderBy(desc(emails.createdAt))
      : await db
          .select()
          .from(emails)
          .where(
            and(
              eq(emails.ownerEmail, normalizedEmail),
              eq(emails.mailbox, mailbox),
            ),
          )
          .orderBy(desc(emails.createdAt));

  return rows.map(toMailboxEmail);
}

export async function createSentEmail(input: {
  ownerEmail: string;
  recipientEmail: string;
  subject: string;
  body: string;
}) {
  const db = getDb();
  const ownerEmail = input.ownerEmail.trim().toLowerCase();
  const recipientEmail = input.recipientEmail.trim().toLowerCase();
  const subject = input.subject.trim();
  const body = input.body.trim();

  await db.insert(emails).values({
    ownerEmail,
    mailbox: "sent",
    direction: "sent",
    senderName: recipientEmail,
    senderEmail: ownerEmail,
    recipientEmail,
    subject,
    body,
    snippet: body.slice(0, 180),
  });
}
