export type MailboxKey =
  | "inbox"
  | "sent"
  | "all-mail"
  | "drafts"
  | "spam"
  | "trash";

export interface Email {
  id: string;
  group: string;
  sender: string;
  subject: string;
  snippet: string;
  time: string;
  color: string;
  fromEmail: string;
  body: string;
  direction: "received" | "sent";
  toEmail?: string;
  receivedBy?: string;
  createdAt: string;
}

export const MAILBOX_META: Record<
  MailboxKey,
  { label: string; description: string; href: string }
> = {
  inbox: {
    label: "Inbox",
    description: "New messages sent to your account",
    href: "/home",
  },
  sent: {
    label: "Sent",
    description: "Messages you have sent",
    href: "/sent",
  },
  "all-mail": {
    label: "All Mail",
    description: "Every email stored for your account",
    href: "/all-mail",
  },
  drafts: {
    label: "Drafts",
    description: "Drafts saved for later",
    href: "/drafts",
  },
  spam: {
    label: "Spam",
    description: "Suspicious messages filtered out",
    href: "/spam",
  },
  trash: {
    label: "Trash",
    description: "Deleted emails kept temporarily",
    href: "/trash",
  },
};
