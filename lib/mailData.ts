export type MailboxKey = "inbox" | "sent" | "all-mail" | "drafts" | "spam" | "trash";

export interface AIInsight {
  summary: string;
  importance: number;
  dates: string[];
  label: "Low" | "Medium" | "High";
}

export interface Email {
  id: number;
  group: string;
  sender: string;
  subject: string;
  snippet: string;
  time: string;
  color: string;
  fromEmail: string;
  body: string;
  ai: AIInsight;
  direction: "received" | "sent";
  toName?: string;
  toEmail?: string;
  receivedBy?: string;
}

export const ACCOUNTS = [
  {
    id: 0,
    name: "Sushant N.",
    email: "sushant@example.com",
    initials: "SN",
    gradient: "linear-gradient(135deg,#2d5be3,#7c3aed)",
    unread: 99,
  },
  {
    id: 1,
    name: "Sushant Work",
    email: "sushant.n@company.io",
    initials: "SW",
    gradient: "linear-gradient(135deg,#0f766e,#0891b2)",
    unread: 5,
  },
  {
    id: 2,
    name: "S. Nair",
    email: "s.nair.personal@gmail.com",
    initials: "SP",
    gradient: "linear-gradient(135deg,#b45309,#d97706)",
    unread: 0,
  },
] as const;

export const VIEWS = [
  { label: "Inbox", badge: "99+" },
  { label: "GitHub", badge: "21" },
  { label: "Calendar", badge: null },
  { label: "Labels", badge: "4" },
  { label: "Promotions", badge: "12" },
  { label: "Social", badge: "3" },
] as const;

export const FILTER_CHIPS = [
  "Categories",
  "Labels",
  "Is unread",
  "Show archived",
  "Hide calendar events",
] as const;

export const MAILBOX_META: Record<
  MailboxKey,
  { label: string; description: string; href: string }
> = {
  inbox: {
    label: "Inbox",
    description: "Priority mail waiting for you",
    href: "/home",
  },
  sent: {
    label: "Sent",
    description: "Messages you have already sent",
    href: "/sent",
  },
  "all-mail": {
    label: "All Mail",
    description: "All received mail across your accounts",
    href: "/all-mail",
  },
  drafts: {
    label: "Drafts",
    description: "Unfinished emails saved for later editing and sending",
    href: "/drafts",
  },
  spam: {
    label: "Spam",
    description: "Suspicious and filtered messages kept out of your inbox",
    href: "/spam",
  },
  trash: {
    label: "Trash",
    description: "Recently deleted mail before permanent removal",
    href: "/trash",
  },
};

export const INBOX_EMAILS: Email[] = [
  {
    id: 1,
    group: "Today",
    sender: "GitHub",
    subject: "Your pull request was merged",
    snippet: "bettermailer-fork opened 2 hours ago by sushant",
    time: "10:24 AM",
    color: "#24292e",
    fromEmail: "noreply@github.com",
    receivedBy: "sushant.n@company.io",
    body: `<p>Hi Sushant,</p><p>Your pull request <strong>#47 - feat: AI summary tooltip</strong> in <code>bettermailer-fork</code> has been successfully merged into <code>main</code>.</p><p>The changes are now live and will be deployed in the next release cycle. Thanks for your contribution.</p><p>- The GitHub Team</p>`,
    direction: "received",
    ai: {
      summary:
        "GitHub confirms your pull request #47 was merged into main on bettermailer-fork.",
      importance: 45,
      dates: [],
      label: "Low",
    },
  },
  {
    id: 2,
    group: "Today",
    sender: "Vercel",
    subject: "Deployment succeeded",
    snippet: "Your latest push to main is now live on Vercel.",
    time: "9:47 AM",
    color: "#000000",
    fromEmail: "notifications@vercel.com",
    receivedBy: "sushant.n@company.io",
    body: `<p>Hello Sushant,</p><p>Your deployment to <strong>bettermailer.vercel.app</strong> succeeded at <strong>9:47 AM today</strong>.</p><p>Build duration: 43s. Region: iad1. Branch: main.</p>`,
    direction: "received",
    ai: {
      summary:
        "Vercel reports a successful deployment of your project to production at 9:47 AM today.",
      importance: 55,
      dates: ["Deployed: Today, 9:47 AM"],
      label: "Medium",
    },
  },
  {
    id: 3,
    group: "Today",
    sender: "Notion",
    subject: "Weekly digest",
    snippet: "Here's what happened in your workspace this week.",
    time: "8:02 AM",
    color: "#000000",
    fromEmail: "mail@notion.so",
    receivedBy: "sushant@example.com",
    body: `<p>Hi Sushant,</p><p>3 pages updated and 2 comments were added by teammates.</p><p>Week of Apr 1-7, 2026.</p>`,
    direction: "received",
    ai: {
      summary:
        "Notion weekly digest showing 3 page updates and 2 new comments from your workspace.",
      importance: 20,
      dates: ["Week of: Apr 1-7, 2026"],
      label: "Low",
    },
  },
  {
    id: 4,
    group: "Yesterday",
    sender: "UPES University",
    subject: "Important: fee deadline reminder",
    snippet: "Please note that the last date for fee payment is approaching.",
    time: "Yesterday",
    color: "#8b1a1a",
    fromEmail: "fees@upes.ac.in",
    receivedBy: "s.nair.personal@gmail.com",
    body: `<p>Dear Student,</p><p>The <strong>last date for fee payment is April 10, 2026</strong>. Late payments incur a penalty of <strong>Rs.500 per day</strong>.</p><p>Please log in to the student portal to complete your payment.</p>`,
    direction: "received",
    ai: {
      summary:
        "UPES University fee payment deadline is April 10, 2026, with a daily late penalty.",
      importance: 92,
      dates: ["Fee deadline: April 10, 2026", "Late penalty: Rs.500/day"],
      label: "High",
    },
  },
  {
    id: 5,
    group: "Yesterday",
    sender: "Google",
    subject: "New sign-in on Chrome",
    snippet: "We noticed a new sign-in to your Google Account.",
    time: "Yesterday",
    color: "#4285f4",
    fromEmail: "no-reply@accounts.google.com",
    receivedBy: "sushant@example.com",
    body: `<p>Hi Sushant,</p><p>New sign-in detected: Chrome on Windows 11, Madurai, Tamil Nadu, April 3, 2026 at 4:12 PM IST.</p>`,
    direction: "received",
    ai: {
      summary:
        "Google security alert for a new Chrome sign-in from Madurai on April 3, 2026.",
      importance: 75,
      dates: ["Sign-in: April 3, 2026 at 4:12 PM IST"],
      label: "High",
    },
  },
  {
    id: 6,
    group: "Yesterday",
    sender: "Stripe",
    subject: "Your invoice is ready",
    snippet: "Invoice #0042 for $29.00 is now available in your dashboard.",
    time: "Yesterday",
    color: "#635bff",
    fromEmail: "receipts@stripe.com",
    receivedBy: "sushant.n@company.io",
    body: `<p>Hi Sushant,</p><p>Invoice <strong>#0042</strong> for <strong>$29.00</strong> is ready. Billing period: March 1-31, 2026. Due date: April 15, 2026.</p>`,
    direction: "received",
    ai: {
      summary:
        "Stripe invoice #0042 for $29.00 is ready and due on April 15, 2026.",
      importance: 60,
      dates: ["Billing period: Mar 1-31, 2026", "Due date: April 15, 2026"],
      label: "Medium",
    },
  },
];

export const ALL_MAIL_EMAILS: Email[] = [
  ...INBOX_EMAILS,
  {
    id: 7,
    group: "Earlier",
    sender: "Figma",
    subject: "Comment thread resolved",
    snippet: "Riya marked the dashboard polish thread as resolved.",
    time: "Mar 30",
    color: "#111111",
    fromEmail: "notifications@figma.com",
    receivedBy: "sushant@example.com",
    body: `<p>Hi Sushant,</p><p>Riya resolved the comment thread on <strong>Bettermail Landing Refresh</strong>.</p><p>The file is ready for the next review pass.</p>`,
    direction: "received",
    ai: {
      summary:
        "Figma reports that the dashboard polish comment thread was resolved by Riya.",
      importance: 28,
      dates: ["Resolved: March 30, 2026"],
      label: "Low",
    },
  },
  {
    id: 8,
    group: "Earlier",
    sender: "Linear",
    subject: "Issue assigned to you",
    snippet: "BM-118 Improve sent mailbox filters was assigned to you.",
    time: "Mar 28",
    color: "#4f46e5",
    fromEmail: "notifications@linear.app",
    receivedBy: "sushant.n@company.io",
    body: `<p>Hello Sushant,</p><p><strong>BM-118</strong> has been assigned to you: Improve sent mailbox filters.</p><p>Priority: Medium. Sprint: April polish.</p>`,
    direction: "received",
    ai: {
      summary:
        "Linear assigned BM-118 to you for sent mailbox filter improvements.",
      importance: 48,
      dates: ["Assigned: March 28, 2026"],
      label: "Medium",
    },
  },
];

export const SENT_EMAILS: Email[] = [
  {
    id: 101,
    group: "Today",
    sender: "Riya Shah",
    subject: "Re: Bettermail homepage revisions",
    snippet: "I pushed the mailbox spacing cleanup and the empty state copy.",
    time: "11:18 AM",
    color: "#c2410c",
    fromEmail: "sushant@example.com",
    toName: "Riya Shah",
    toEmail: "riya@studio.dev",
    body: `<p>Hi Riya,</p><p>I pushed the mailbox spacing cleanup and updated the empty state copy for the homepage.</p><p>Please review the hover state on desktop when you get a chance.</p><p>Thanks,<br/>Sushant</p>`,
    direction: "sent",
    ai: {
      summary:
        "You sent Riya an update about homepage spacing cleanup and the hover-state review.",
      importance: 40,
      dates: [],
      label: "Low",
    },
  },
  {
    id: 102,
    group: "Yesterday",
    sender: "Aman Verma",
    subject: "Interview availability",
    snippet: "Wednesday after 2 PM IST works for me.",
    time: "Yesterday",
    color: "#0f766e",
    fromEmail: "sushant@example.com",
    toName: "Aman Verma",
    toEmail: "aman.verma@example.com",
    body: `<p>Hi Aman,</p><p>Wednesday after 2 PM IST works for me. Please send over the meeting link once the slot is confirmed.</p><p>Regards,<br/>Sushant</p>`,
    direction: "sent",
    ai: {
      summary:
        "You confirmed interview availability for Wednesday after 2 PM IST.",
      importance: 58,
      dates: ["Availability: Wednesday after 2 PM IST"],
      label: "Medium",
    },
  },
  {
    id: 103,
    group: "Earlier",
    sender: "Product Team",
    subject: "Template approval for release emails",
    snippet: "Sharing the final template copy for your sign-off.",
    time: "Mar 29",
    color: "#1d4ed8",
    fromEmail: "sushant.n@company.io",
    toName: "Product Team",
    toEmail: "product@company.io",
    body: `<p>Hello team,</p><p>Sharing the final template copy for the release emails. I adjusted the CTA wording and shortened the intro paragraph.</p><p>If there are no objections, I will mark this ready for launch.</p><p>- Sushant</p>`,
    direction: "sent",
    ai: {
      summary:
        "You shared the final release email template copy with the product team for approval.",
      importance: 63,
      dates: ["Sent: March 29, 2026"],
      label: "Medium",
    },
  },
];

export const SPAM_EMAILS: Email[] = [
  {
    id: 201,
    group: "Today",
    sender: "Crypto Growth Lab",
    subject: "Earn Rs.50,000 daily from home",
    snippet: "Limited-time passive income blueprint unlocked for your account.",
    time: "1:14 PM",
    color: "#7c2d12",
    fromEmail: "alerts@cryptogrowth-lab.biz",
    receivedBy: "sushant@example.com",
    body: `<p>Hello Winner,</p><p>Your account has been shortlisted for a guaranteed earnings program. Deposit once today to unlock daily returns.</p><p>Reply immediately to reserve your slot.</p>`,
    direction: "received",
    ai: {
      summary:
        "A suspicious get-rich-quick message promising guaranteed returns was filtered as spam.",
      importance: 81,
      dates: ["Filtered: Today, 1:14 PM"],
      label: "High",
    },
  },
  {
    id: 202,
    group: "Yesterday",
    sender: "Microsoft Security Team",
    subject: "Urgent password expiration notice",
    snippet: "Your mailbox will be suspended unless you verify within 30 minutes.",
    time: "Yesterday",
    color: "#374151",
    fromEmail: "security-check@micr0soft-support.net",
    receivedBy: "sushant.n@company.io",
    body: `<p>Dear User,</p><p>Your company mailbox is about to expire. Verify your password within 30 minutes to avoid data loss.</p><p><a href="#">Click here to keep access</a></p>`,
    direction: "received",
    ai: {
      summary:
        "A phishing-style account warning using a spoofed sender domain was moved to spam.",
      importance: 94,
      dates: ["Flagged: Yesterday"],
      label: "High",
    },
  },
  {
    id: 203,
    group: "Earlier",
    sender: "Lucky Draw Center",
    subject: "Congratulations, you won a new iPhone",
    snippet: "Pay the courier fee today to claim your device.",
    time: "Mar 27",
    color: "#9333ea",
    fromEmail: "claim@lucky-draw-center.cc",
    receivedBy: "s.nair.personal@gmail.com",
    body: `<p>Congratulations!</p><p>Your email was selected in our monthly draw. Send the handling charge today to receive your prize.</p>`,
    direction: "received",
    ai: {
      summary:
        "A prize scam asking for a handling fee was classified as spam.",
      importance: 88,
      dates: ["Received: March 27, 2026"],
      label: "High",
    },
  },
];

export const DRAFT_EMAILS: Email[] = [
  {
    id: 151,
    group: "Today",
    sender: "Aman Sharma",
    subject: "Follow-up on product demo",
    snippet: "I wanted to share the revised talking points before tomorrow's discussion.",
    time: "11:18 AM",
    color: "#2563eb",
    fromEmail: "sushant@example.com",
    toName: "Aman Sharma",
    toEmail: "aman.sharma@example.com",
    body: `<p>Hi Aman,</p><p>I wanted to share the revised talking points before tomorrow's discussion.</p><p>Please let me know if there is anything specific you want me to cover during the demo.</p><p>Best,<br/>Sushant</p>`,
    direction: "sent",
    ai: {
      summary:
        "A saved draft for Aman about revised talking points ahead of tomorrow's demo.",
      importance: 52,
      dates: ["Last edited: Today, 11:18 AM"],
      label: "Medium",
    },
  },
  {
    id: 152,
    group: "Today",
    sender: "Hiring Team",
    subject: "Thank you after the interview",
    snippet: "Thank you for the thoughtful conversation today. I enjoyed learning more about the role and team.",
    time: "9:42 AM",
    color: "#7c3aed",
    fromEmail: "sushant@example.com",
    toName: "Hiring Team",
    toEmail: "hiring@company.io",
    body: `<p>Hello team,</p><p>Thank you for the thoughtful conversation today. I enjoyed learning more about the role and team.</p><p>I appreciate your time and look forward to hearing about the next steps.</p><p>Regards,<br/>Sushant</p>`,
    direction: "sent",
    ai: {
      summary:
        "A thank-you email draft after an interview is saved and ready for final review.",
      importance: 61,
      dates: ["Ready to send: Today"],
      label: "Medium",
    },
  },
  {
    id: 153,
    group: "This Week",
    sender: "Design Review Group",
    subject: "Meeting notes and next steps",
    snippet: "Sharing the summary of our discussion along with the proposed timeline for the next milestone.",
    time: "Thursday",
    color: "#0f766e",
    fromEmail: "sushant.n@company.io",
    toName: "Design Review Group",
    toEmail: "design-review@company.io",
    body: `<p>Hello everyone,</p><p>Sharing the summary of our discussion along with the proposed timeline for the next milestone.</p><p>I still need to add the final attachment before sending this out.</p><p>Thanks,<br/>Sushant</p>`,
    direction: "sent",
    ai: {
      summary:
        "A draft recap email for the design review group still needs one attachment before sending.",
      importance: 47,
      dates: ["Edited: Thursday"],
      label: "Medium",
    },
  },
  {
    id: 154,
    group: "This Week",
    sender: "HR Department",
    subject: "Leave request clarification",
    snippet: "I am writing to clarify the dates mentioned in my earlier leave application.",
    time: "Tuesday",
    color: "#ea580c",
    fromEmail: "sushant@example.com",
    toName: "HR Department",
    toEmail: "hr@example.com",
    body: `<p>Hello,</p><p>I am writing to clarify the dates mentioned in my earlier leave application.</p><p>I want to confirm the final wording before I send this message.</p><p>Regards,<br/>Sushant</p>`,
    direction: "sent",
    ai: {
      summary:
        "A leave clarification draft is saved and waiting for final wording.",
      importance: 44,
      dates: ["Edited: Tuesday"],
      label: "Medium",
    },
  },
];

export const TRASH_EMAILS: Email[] = [
  {
    id: 301,
    group: "Today",
    sender: "Dev Community",
    subject: "April meetup reminder",
    snippet: "Final reminder for tonight's local frontend meetup.",
    time: "12:06 PM",
    color: "#2563eb",
    fromEmail: "events@devcommunity.io",
    receivedBy: "sushant@example.com",
    body: `<p>Hi Sushant,</p><p>This is a reminder that the local frontend meetup starts tonight at 7:00 PM. You deleted this message earlier.</p>`,
    direction: "received",
    ai: {
      summary:
        "A meetup reminder you deleted is currently sitting in trash.",
      importance: 18,
      dates: ["Deleted: Today, 12:06 PM"],
      label: "Low",
    },
  },
  {
    id: 302,
    group: "Yesterday",
    sender: "Swiggy",
    subject: "Your receipt from last order",
    snippet: "Receipt for your order from Burger Yard is attached.",
    time: "Yesterday",
    color: "#ea580c",
    fromEmail: "receipts@swiggy.in",
    receivedBy: "s.nair.personal@gmail.com",
    body: `<p>Hello,</p><p>Your receipt for order #7841 from Burger Yard is attached for reference.</p>`,
    direction: "received",
    ai: {
      summary:
        "A food order receipt was deleted and moved to trash.",
      importance: 12,
      dates: ["Deleted: Yesterday"],
      label: "Low",
    },
  },
  {
    id: 303,
    group: "Earlier",
    sender: "Old Recruiter Thread",
    subject: "Checking back on your application",
    snippet: "Following up in case you are still exploring roles this quarter.",
    time: "Mar 25",
    color: "#0f766e",
    fromEmail: "talent@hireloop.io",
    receivedBy: "sushant@example.com",
    body: `<p>Hi Sushant,</p><p>Just checking whether you are still exploring engineering roles this quarter.</p><p>Happy to reconnect if timing is better now.</p>`,
    direction: "received",
    ai: {
      summary:
        "An older recruiter follow-up thread was deleted and remains in trash.",
      importance: 24,
      dates: ["Deleted: March 25, 2026"],
      label: "Low",
    },
  },
];

export function getMailboxEmails(mailbox: MailboxKey): Email[] {
  if (mailbox === "sent") return SENT_EMAILS;
  if (mailbox === "all-mail") return ALL_MAIL_EMAILS;
  if (mailbox === "drafts") return DRAFT_EMAILS;
  if (mailbox === "spam") return SPAM_EMAILS;
  if (mailbox === "trash") return TRASH_EMAILS;
  return INBOX_EMAILS;
}
