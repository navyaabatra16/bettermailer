"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import ComposeDock from "@/components/ComposeDock";
import {
  MAILBOX_META,
  type Email,
  type MailboxKey,
} from "@/lib/mailData";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function fuzzyScore(text: string, query: string) {
  const source = text.toLowerCase();
  const target = query.toLowerCase().trim();

  if (!target) return 1;
  if (source.includes(target)) return target.length * 4;

  let score = 0;
  let queryIndex = 0;
  let streak = 0;

  for (
    let index = 0;
    index < source.length && queryIndex < target.length;
    index += 1
  ) {
    if (source[index] === target[queryIndex]) {
      streak += 1;
      score += 1 + streak;
      queryIndex += 1;
    } else {
      streak = 0;
    }
  }

  return queryIndex === target.length ? score : 0;
}

function getEmailSearchScore(email: Email, query: string) {
  const fields = [
    email.sender,
    email.subject,
    email.snippet,
    email.fromEmail,
    email.toEmail,
    email.receivedBy,
  ];

  return fields.reduce((bestScore, field) => {
    if (!field) return bestScore;
    return Math.max(bestScore, fuzzyScore(field, query));
  }, 0);
}

const buttonStyle: CSSProperties = {
  width: 26,
  height: 26,
  border: "1px solid #e4e2dc",
  borderRadius: 6,
  background: "transparent",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#6b6860",
  fontSize: 11,
  flexShrink: 0,
  fontFamily: "var(--font-mono), monospace",
};

function MailReader({
  email,
  isOpen,
  width,
  onClose,
}: {
  email: Email | null;
  isOpen: boolean;
  width: number;
  onClose: () => void;
}) {
  if (!email) return null;

  return (
    <div
      style={{
        width: isOpen ? width : 0,
        flexShrink: 0,
        background: "#faf9f7",
        borderLeft: "1px solid #e4e2dc",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transition: "width 0.28s cubic-bezier(0.4,0,0.2,1)",
        fontFamily: "var(--font-mono), monospace",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "12px 16px",
          borderBottom: "1px solid #e4e2dc",
          flexShrink: 0,
          background: "#faf9f7",
        }}
      >
        <button onClick={onClose} style={buttonStyle}>
          X
        </button>
        <span
          style={{
            flex: 1,
            fontSize: 12,
            fontWeight: 600,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {email.subject}
        </span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 22px" }}>
        <div
          style={{
            fontFamily: "Georgia, serif",
            fontSize: 20,
            lineHeight: 1.3,
            color: "#1a1916",
            marginBottom: 14,
          }}
        >
          {email.subject}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 18,
            paddingBottom: 14,
            borderBottom: "1px solid #ede9e2",
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: email.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 700,
              color: "white",
              flexShrink: 0,
            }}
          >
            {getInitials(email.sender)}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>
              {email.direction === "sent" ? `To ${email.sender}` : email.sender}
            </div>
            <div style={{ fontSize: 10, color: "#a09e99" }}>
              {email.direction === "sent"
                ? `${email.fromEmail} -> ${email.toEmail ?? email.sender}`
                : email.fromEmail}
            </div>
          </div>
          <div style={{ marginLeft: "auto", fontSize: 10, color: "#a09e99" }}>
            {email.time}
          </div>
        </div>

        <div
          style={{
            fontSize: 13,
            lineHeight: 1.7,
            color: "#6b6860",
            whiteSpace: "pre-wrap",
          }}
        >
          {email.body}
        </div>
      </div>
    </div>
  );
}

function EmptyMailbox({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
      }}
    >
      <div style={{ maxWidth: 420, textAlign: "center" }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: "#1a1916" }}>
          {title}
        </h2>
        <p
          style={{
            marginTop: 8,
            fontSize: 14,
            lineHeight: 1.6,
            color: "#6b6860",
          }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

export default function MailboxApp({
  mailbox,
  userEmail,
}: {
  mailbox: MailboxKey;
  userEmail: string;
}) {
  const router = useRouter();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeEmailId, setActiveEmailId] = useState<string | null>(null);
  const [readerOpen, setReaderOpen] = useState(false);
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const mailboxMeta = MAILBOX_META[mailbox];

  useEffect(() => {
    if (!userEmail) {
      setEmails([]);
      setLoading(false);
      return;
    }

    let isCancelled = false;

    async function loadMailbox() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/mailbox?mailbox=${mailbox}&userEmail=${encodeURIComponent(
            userEmail,
          )}`,
        );
        const result = (await response.json()) as {
          emails?: Email[];
          error?: string;
        };

        if (!response.ok) {
          throw new Error(result.error ?? "Unable to load mailbox.");
        }

        if (!isCancelled) {
          setEmails(result.emails ?? []);
        }
      } catch (error) {
        if (!isCancelled) {
          setEmails([]);
          setError(
            error instanceof Error
              ? error.message
              : "Unable to load mailbox right now.",
          );
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadMailbox();

    function handleRefresh() {
      loadMailbox();
    }

    window.addEventListener("mailbox:refresh", handleRefresh);

    return () => {
      isCancelled = true;
      window.removeEventListener("mailbox:refresh", handleRefresh);
    };
  }, [mailbox, userEmail]);

  const filteredEmails = useMemo(() => {
    const normalizedQuery = searchQuery.trim();
    if (!normalizedQuery) return emails;

    return emails
      .map((email) => ({
        email,
        score: getEmailSearchScore(email, normalizedQuery),
      }))
      .filter((entry) => entry.score > 0)
      .sort((left, right) => right.score - left.score)
      .map((entry) => entry.email);
  }, [emails, searchQuery]);

  const activeEmail =
    filteredEmails.find((email) => email.id === activeEmailId) ?? null;

  const groupedEmails = useMemo(() => {
    const groups = new Map<string, Email[]>();

    for (const email of filteredEmails) {
      const currentGroup = groups.get(email.group) ?? [];
      currentGroup.push(email);
      groups.set(email.group, currentGroup);
    }

    return Array.from(groups.entries());
  }, [filteredEmails]);

  useEffect(() => {
    if (activeEmailId && !filteredEmails.some((email) => email.id === activeEmailId)) {
      setActiveEmailId(null);
      setReaderOpen(false);
    }
  }, [activeEmailId, filteredEmails]);

  function handleSignOut() {
    router.push("/logout");
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        background: "#f5f4f1",
        color: "#1a1916",
        fontFamily: "var(--font-mono), monospace",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 16px",
          background: "#faf9f7",
          borderBottom: "1px solid #e4e2dc",
          height: 52,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: "#1d4ed8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 600,
            color: "white",
            flexShrink: 0,
          }}
        >
          {getInitials(userEmail || "U")}
        </div>

        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#1a1916" }}>
            {userEmail || "Logged out"}
          </div>
          <div style={{ fontSize: 10, color: "#a09e99" }}>
            Single account mode
          </div>
        </div>

        <button
          onClick={() => setSidebarVisible((value) => !value)}
          title="Toggle sidebar"
          style={buttonStyle}
        >
          ||
        </button>
        <button onClick={handleSignOut} style={buttonStyle} title="Sign out">
          O
        </button>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <aside
          style={{
            width: sidebarVisible ? 240 : 0,
            flexShrink: 0,
            background: "#f0ede7",
            borderRight: "1px solid #e4e2dc",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            transition:
              "width 0.25s cubic-bezier(0.4,0,0.2,1), opacity 0.25s cubic-bezier(0.4,0,0.2,1)",
            opacity: sidebarVisible ? 1 : 0,
            pointerEvents: sidebarVisible ? "auto" : "none",
          }}
        >
          <div style={{ margin: "10px 12px" }}>
            <ComposeDock userEmail={userEmail} />
          </div>

          <input
            type="text"
            placeholder="Search mail..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            style={{
              margin: "0 12px 8px",
              padding: "6px 10px",
              background: "#faf9f7",
              border: "1px solid #e4e2dc",
              borderRadius: 6,
              fontFamily: "var(--font-mono), monospace",
              fontSize: 11,
              color: "#1a1916",
              outline: "none",
              flexShrink: 0,
            }}
          />

          <nav style={{ flex: 1, overflowY: "auto", padding: "4px 8px" }}>
            {(Object.entries(MAILBOX_META) as Array<
              [MailboxKey, (typeof MAILBOX_META)[MailboxKey]]
            >).map(([key, item]) => (
              <Link
                key={key}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "6px 8px",
                  borderRadius: 6,
                  fontSize: 11,
                  color: mailbox === key ? "#1a1916" : "#6b6860",
                  fontWeight: mailbox === key ? 600 : 400,
                  background: mailbox === key ? "#faf9f7" : "transparent",
                  border:
                    mailbox === key
                      ? "1px solid #e4e2dc"
                      : "1px solid transparent",
                  whiteSpace: "nowrap",
                  textDecoration: "none",
                }}
              >
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 3,
                    background: "#e4e2dc",
                    flexShrink: 0,
                  }}
                />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <header
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 16px",
              borderBottom: "1px solid #e4e2dc",
              background: "#faf9f7",
              flexShrink: 0,
              height: 52,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>
                {mailboxMeta.label}
              </div>
              <div style={{ fontSize: 10, color: "#a09e99" }}>
                {mailboxMeta.description}
              </div>
            </div>
          </header>

          {loading ? (
            <EmptyMailbox
              title="Loading mailbox"
              description="Fetching your email from the database."
            />
          ) : error ? (
            <EmptyMailbox title="Mailbox unavailable" description={error} />
          ) : filteredEmails.length === 0 ? (
            <EmptyMailbox
              title={`No ${mailboxMeta.label.toLowerCase()} emails yet`}
              description={`This ${mailboxMeta.label.toLowerCase()} mailbox is empty. New database-backed emails will appear here when they exist.`}
            />
          ) : (
            <div style={{ flex: 1, overflowY: "auto", background: "#faf9f7" }}>
              {groupedEmails.map(([group, groupEmails]) => (
                <section key={group}>
                  <div
                    style={{
                      padding: "10px 16px 6px",
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "#a09e99",
                    }}
                  >
                    {group}
                  </div>

                  {groupEmails.map((email) => (
                    <div
                      key={email.id}
                      onClick={() => {
                        setActiveEmailId(email.id);
                        setReaderOpen(true);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "11px 16px",
                        borderBottom: "1px solid #ede9e2",
                        cursor: "pointer",
                        background:
                          activeEmailId === email.id ? "#f0eeea" : "#faf9f7",
                        borderLeft:
                          activeEmailId === email.id
                            ? "2px solid #2d5be3"
                            : "2px solid transparent",
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: email.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          fontWeight: 700,
                          color: "white",
                          flexShrink: 0,
                        }}
                      >
                        {getInitials(email.sender)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#1a1916",
                          }}
                        >
                          {email.sender}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "#6b6860",
                            marginTop: 1,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {email.subject}
                        </div>
                        <div
                          style={{
                            fontSize: 10,
                            color: "#a09e99",
                            marginTop: 1,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {email.snippet}
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-end",
                          gap: 2,
                          flexShrink: 0,
                        }}
                      >
                        {email.receivedBy ? (
                          <div
                            style={{
                              fontSize: 9,
                              color: "#6b6860",
                              maxWidth: 180,
                              textAlign: "right",
                            }}
                          >
                            {email.receivedBy}
                          </div>
                        ) : null}
                        <div style={{ fontSize: 10, color: "#a09e99" }}>
                          {email.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </section>
              ))}
            </div>
          )}
        </main>

        <MailReader
          email={activeEmail}
          isOpen={readerOpen}
          width={420}
          onClose={() => {
            setReaderOpen(false);
            setActiveEmailId(null);
          }}
        />
      </div>
    </div>
  );
}
