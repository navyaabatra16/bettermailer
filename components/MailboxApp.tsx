"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
} from "react";
import {
  ACCOUNTS,
  FILTER_CHIPS,
  MAILBOX_META,
  getMailboxEmails,
  type Email,
  type MailboxKey,
} from "@/lib/mailData";
import ComposeDock from "@/components/ComposeDock";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function importanceColor(value: number): string {
  if (value >= 70) return "#e05a3a";
  if (value >= 40) return "#d48c12";
  return "#3a8a5a";
}

function fuzzyScore(text: string, query: string): number {
  const source = text.toLowerCase();
  const target = query.toLowerCase().trim();

  if (!target) return 1;
  if (source.includes(target)) return target.length * 4;

  let score = 0;
  let queryIndex = 0;
  let streak = 0;

  for (let index = 0; index < source.length && queryIndex < target.length; index += 1) {
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

function getEmailSearchScore(email: Email, query: string): number {
  const fields = [
    email.sender,
    email.subject,
    email.snippet,
    email.fromEmail,
    email.toEmail,
    email.toName,
    email.receivedBy,
    email.ai.summary,
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
  fontFamily: "var(--font-geist-mono), monospace",
};

const sectionTitleStyle: CSSProperties = {
  fontSize: 9,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#a09e99",
  padding: "8px 6px 4px",
};

interface TooltipState {
  email: Email;
  x: number;
  y: number;
}

function AITooltip({ state }: { state: TooltipState | null }) {
  if (!state) return null;

  const { email, x, y } = state;
  const importance = email.ai.importance;
  const color = importanceColor(importance);
  const tooltipWidth = 280;
  const tooltipHeight = 200;

  let left = x + 14;
  let top = y + 10;

  if (typeof window !== "undefined") {
    if (left + tooltipWidth > window.innerWidth - 12) left = x - tooltipWidth - 10;
    if (top + tooltipHeight > window.innerHeight - 12) top = y - tooltipHeight - 10;
  }

  return (
    <div
      style={{
        position: "fixed",
        left,
        top,
        zIndex: 1000,
        background: "#1a1916",
        color: "#f5f4f1",
        borderRadius: 10,
        padding: "12px 14px",
        width: tooltipWidth,
        fontSize: 11,
        lineHeight: 1.5,
        pointerEvents: "none",
        boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
        fontFamily: "var(--font-geist-mono), monospace",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          paddingBottom: 7,
        }}
      >
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: "#7c9dff",
            textTransform: "uppercase",
          }}
        >
          AI Summary
        </span>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.55)" }}>
          {email.direction === "sent" ? `To ${email.sender}` : `From ${email.sender}`}
        </span>
      </div>

      <p style={{ color: "rgba(255,255,255,0.85)", marginBottom: 9 }}>
        {email.ai.summary}
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          marginBottom: 7,
        }}
      >
        <span
          style={{
            fontSize: 9,
            color: "rgba(255,255,255,0.5)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            width: 60,
            flexShrink: 0,
          }}
        >
          Importance
        </span>
        <div
          style={{
            flex: 1,
            height: 4,
            background: "rgba(255,255,255,0.12)",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${importance}%`,
              height: "100%",
              background: color,
              borderRadius: 2,
            }}
          />
        </div>
        <span style={{ fontSize: 10, fontWeight: 600, color }}>{email.ai.label}</span>
      </div>

      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", marginBottom: 4 }}>
        {email.direction === "sent"
          ? `Sent by ${email.fromEmail} at ${email.time}`
          : `${email.fromEmail} at ${email.time}`}
      </div>

      {email.ai.dates.length > 0 && (
        <div style={{ fontSize: 10, color: "#7dd3c8" }}>
          {email.ai.dates.map((date) => (
            <div key={date}>{date}</div>
          ))}
        </div>
      )}
    </div>
  );
}

function AccountDropdown({
  activeId,
  isOpen,
  onSwitch,
  onClose,
}: {
  activeId: number;
  isOpen: boolean;
  onSwitch: (id: number) => void;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        position: "absolute",
        top: 48,
        left: 8,
        width: 280,
        background: "#faf9f7",
        border: "1px solid #e4e2dc",
        borderRadius: 10,
        boxShadow: "0 8px 28px rgba(0,0,0,0.13)",
        zIndex: 200,
        overflow: "hidden",
        fontFamily: "var(--font-geist-mono), monospace",
        opacity: isOpen ? 1 : 0,
        transform: isOpen ? "translateY(0)" : "translateY(-8px)",
        pointerEvents: isOpen ? "auto" : "none",
        transition: "opacity 0.25s cubic-bezier(0.4,0,0.2,1), transform 0.25s cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      <div
        style={{
          padding: "10px 14px 8px",
          fontSize: 9,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "#a09e99",
        }}
      >
        Accounts
      </div>

      {ACCOUNTS.map((account) => {
        const isActive = account.id === activeId;

        return (
          <div
            key={account.id}
            onClick={() => onSwitch(account.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 14px",
              cursor: "pointer",
              background: isActive ? "#f0eeea" : "transparent",
              margin: "0 4px",
              borderRadius: 6,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: account.gradient,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 600,
                color: "white",
                flexShrink: 0,
              }}
            >
              {account.initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  color: "#1a1916",
                }}
              >
                {account.name}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "#a09e99",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {account.email}
              </div>
            </div>
            {isActive ? (
              <span style={{ fontSize: 10, fontWeight: 700, color: "#2d5be3" }}>Active</span>
            ) : (
              <span
                style={{
                  fontSize: 9,
                  background: "#e8e4dc",
                  borderRadius: 8,
                  padding: "1px 5px",
                  color: "#6b6860",
                }}
              >
                {account.unread > 0 ? `${account.unread} new` : ""}
              </span>
            )}
          </div>
        );
      })}

      <div style={{ height: 1, background: "#e4e2dc", margin: "6px 0" }} />
      <div
        onClick={onClose}
        style={{ padding: "8px 14px 12px", fontSize: 11, color: "#6b6860", cursor: "pointer" }}
      >
        Manage accounts
      </div>
    </div>
  );
}

function EmailRow({
  email,
  isActive,
  showReceivedBy,
  onClick,
  onMouseEnter,
  onMouseMove,
  onMouseLeave,
}: {
  email: Email;
  isActive: boolean;
  showReceivedBy?: boolean;
  onClick: () => void;
  onMouseEnter: (event: ReactMouseEvent<HTMLDivElement>) => void;
  onMouseMove: (event: ReactMouseEvent<HTMLDivElement>) => void;
  onMouseLeave: () => void;
}) {
  return (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "11px 16px",
        borderBottom: "1px solid #ede9e2",
        cursor: "pointer",
        background: isActive ? "#f0eeea" : "#faf9f7",
        borderLeft: isActive ? "2px solid #2d5be3" : "2px solid transparent",
        fontFamily: "var(--font-geist-mono), monospace",
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
        <div style={{ fontSize: 12, fontWeight: 600, color: "#1a1916" }}>{email.sender}</div>
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
        {showReceivedBy && email.receivedBy ? (
          <div style={{ fontSize: 9, color: "#6b6860", maxWidth: 160, textAlign: "right" }}>
            {email.receivedBy}
          </div>
        ) : null}
        <div style={{ fontSize: 10, color: "#a09e99" }}>{email.time}</div>
      </div>
    </div>
  );
}

function MailReader({
  email,
  isOpen,
  isFullPage,
  onClose,
  onToggleFullPage,
  width,
}: {
  email: Email | null;
  isOpen: boolean;
  isFullPage: boolean;
  onClose: () => void;
  onToggleFullPage: () => void;
  width: number;
}) {
  if (!email) return null;

  const style: CSSProperties = isFullPage
    ? {
        position: "fixed",
        inset: 0,
        width: "100%",
        zIndex: 200,
        background: "#faf9f7",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: "var(--font-geist-mono), monospace",
      }
    : {
        width: isOpen ? width : 0,
        flexShrink: 0,
        background: "#faf9f7",
        borderLeft: "1px solid #e4e2dc",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transition: "width 0.28s cubic-bezier(0.4,0,0.2,1)",
        fontFamily: "var(--font-geist-mono), monospace",
      };

  return (
    <div style={style}>
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
        <button onClick={onToggleFullPage} title={isFullPage ? "Collapse" : "Expand"} style={buttonStyle}>
          {isFullPage ? "[]" : "[ ]"}
        </button>
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
          <div style={{ marginLeft: "auto", fontSize: 10, color: "#a09e99" }}>{email.time}</div>
        </div>

        <div
          style={{ fontSize: 13, lineHeight: 1.7, color: "#6b6860" }}
          dangerouslySetInnerHTML={{ __html: email.body }}
        />
      </div>
    </div>
  );
}

export default function MailboxApp({ mailbox }: { mailbox: MailboxKey }) {
  const [activeAccountId, setActiveAccountId] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeEmailId, setActiveEmailId] = useState<number | null>(null);
  const [readerOpen, setReaderOpen] = useState(false);
  const [readerFullPage, setReaderFullPage] = useState(false);
  const [readerWidth, setReaderWidth] = useState(420);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sidebarResizingRef = useRef(false);
  const sidebarStartXRef = useRef(0);
  const sidebarStartWidthRef = useRef(0);
  const readerResizingRef = useRef(false);
  const readerStartXRef = useRef(0);
  const readerStartWidthRef = useRef(0);
  const accountBarRef = useRef<HTMLDivElement>(null);

  const activeAccount = ACCOUNTS[activeAccountId];
  const mailboxMeta = MAILBOX_META[mailbox];
  const emails = useMemo(() => getMailboxEmails(mailbox), [mailbox]);
  const filteredEmails = useMemo(() => {
    const normalizedQuery = searchQuery.trim();
    if (!normalizedQuery) return emails;

    return emails
      .map((email) => ({ email, score: getEmailSearchScore(email, normalizedQuery) }))
      .filter((entry) => entry.score > 0)
      .sort((left, right) => right.score - left.score)
      .map((entry) => entry.email);
  }, [emails, searchQuery]);
  const activeEmail = filteredEmails.find((email) => email.id === activeEmailId) ?? null;
  const groups = useMemo(
    () => Array.from(new Set(filteredEmails.map((email) => email.group))),
    [filteredEmails]
  );

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (accountBarRef.current && !accountBarRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    function handleMove(event: MouseEvent) {
      if (sidebarResizingRef.current) {
        const nextWidth = Math.max(
          160,
          Math.min(400, sidebarStartWidthRef.current + (event.clientX - sidebarStartXRef.current))
        );
        setSidebarWidth(nextWidth);
      }

      if (readerResizingRef.current) {
        const nextWidth = Math.max(
          280,
          Math.min(
            window.innerWidth * 0.75,
            readerStartWidthRef.current + (readerStartXRef.current - event.clientX)
          )
        );
        setReaderWidth(nextWidth);
      }
    }

    function handleUp() {
      sidebarResizingRef.current = false;
      readerResizingRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleUp);

    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleUp);
    };
  }, []);

  const handleEmailHover = useCallback((email: Email, event: ReactMouseEvent<HTMLDivElement>) => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      setTooltip({ email, x: event.clientX, y: event.clientY });
    }, 350);
  }, []);

  const handleEmailMove = useCallback(
    (email: Email, event: ReactMouseEvent<HTMLDivElement>) => {
      if (tooltip) setTooltip({ email, x: event.clientX, y: event.clientY });
    },
    [tooltip]
  );

  const handleEmailLeave = useCallback(() => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setTooltip(null);
  }, []);

  const handleEmailClick = useCallback((email: Email) => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setTooltip(null);
    setActiveEmailId(email.id);
    setReaderOpen(true);
    setReaderFullPage(false);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        background: "#f5f4f1",
        color: "#1a1916",
        fontFamily: "var(--font-geist-mono), monospace",
        flexDirection: "column",
      }}
    >
      <div
        ref={accountBarRef}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 16px",
          background: "#faf9f7",
          borderBottom: "1px solid #e4e2dc",
          height: 52,
          flexShrink: 0,
          zIndex: 50,
          position: "relative",
        }}
      >
        <button
          onClick={() => setDropdownOpen((value) => !value)}
          style={{ border: "none", background: "none", padding: 0, cursor: "pointer", flexShrink: 0 }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: activeAccount.gradient,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 600,
              color: "white",
              boxShadow: dropdownOpen ? "0 0 0 2px #2d5be3" : "none",
            }}
          >
            {activeAccount.initials}
          </div>
        </button>

        <button
          onClick={() => setDropdownOpen((value) => !value)}
          style={{
            flex: 1,
            border: "none",
            background: "none",
            cursor: "pointer",
            textAlign: "left",
            padding: 0,
            minWidth: 0,
            fontFamily: "var(--font-geist-mono), monospace",
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: "#1a1916" }}>{activeAccount.name}</div>
          <div style={{ fontSize: 10, color: "#a09e99" }}>{activeAccount.email}</div>
        </button>

        <button onClick={() => setSidebarVisible((value) => !value)} title="Toggle sidebar" style={buttonStyle}>
          ||
        </button>

        <AccountDropdown
          activeId={activeAccountId}
          isOpen={dropdownOpen}
          onSwitch={(id) => {
            setActiveAccountId(id);
            setDropdownOpen(false);
          }}
          onClose={() => setDropdownOpen(false)}
        />
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <aside
          style={{
            width: sidebarVisible ? sidebarWidth : 0,
            flexShrink: 0,
            background: "#f0ede7",
            borderRight: "1px solid #e4e2dc",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            transition: "width 0.25s cubic-bezier(0.4,0,0.2,1), opacity 0.25s cubic-bezier(0.4,0,0.2,1)",
            opacity: sidebarVisible ? 1 : 0,
            pointerEvents: sidebarVisible ? "auto" : "none",
          }}
        >
          <div style={{ margin: "10px 12px" }}>
            <ComposeDock />
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
              fontFamily: "var(--font-geist-mono), monospace",
              fontSize: 11,
              color: "#1a1916",
              outline: "none",
              flexShrink: 0,
            }}
          />

          <nav style={{ flex: 1, overflowY: "auto", padding: "4px 8px" }}>
            <div style={sectionTitleStyle}>Mail</div>
            {(Object.entries(MAILBOX_META) as Array<[MailboxKey, (typeof MAILBOX_META)[MailboxKey]]>).map(
              ([key, item]) => (
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
                    border: mailbox === key ? "1px solid #e4e2dc" : "1px solid transparent",
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
              )
            )}
          </nav>
        </aside>

        <div
          onMouseDown={(event) => {
            if (!sidebarVisible) return;
            sidebarResizingRef.current = true;
            sidebarStartXRef.current = event.clientX;
            sidebarStartWidthRef.current = sidebarWidth;
            document.body.style.cursor = "col-resize";
            document.body.style.userSelect = "none";
          }}
          style={{ width: 4, cursor: "col-resize", background: "transparent", flexShrink: 0, zIndex: 10 }}
        />

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
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  whiteSpace: "nowrap",
                }}
              >
                <span
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 4,
                    background: "#e4e2dc",
                    display: "inline-block",
                  }}
                />
                {mailboxMeta.label}
              </div>
              <div style={{ fontSize: 10, color: "#a09e99", marginTop: 2 }}>{mailboxMeta.description}</div>
            </div>

            <input
              type="text"
              placeholder={`Search ${mailboxMeta.label.toLowerCase()}...`}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              style={{
                flex: 1,
                padding: "5px 10px",
                background: "#f5f4f1",
                border: "1px solid #e4e2dc",
                borderRadius: 6,
                fontFamily: "var(--font-geist-mono), monospace",
                fontSize: 11,
                outline: "none",
                color: "#1a1916",
              }}
            />

            {["AI", "Auto label", "Add tag"].map((label) => (
              <button
                key={label}
                style={{
                  padding: "5px 10px",
                  fontFamily: "var(--font-geist-mono), monospace",
                  fontSize: 10,
                  border: "1px solid #e4e2dc",
                  borderRadius: 6,
                  background: label === "AI" ? "#eef1fd" : "transparent",
                  borderColor: label === "AI" ? "#c4cefc" : "#e4e2dc",
                  color: label === "AI" ? "#2d5be3" : "#6b6860",
                  fontWeight: label === "AI" ? 600 : 400,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </button>
            ))}
          </header>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              borderBottom: "1px solid #e4e2dc",
              flexWrap: "wrap",
              flexShrink: 0,
            }}
          >
            {FILTER_CHIPS.map((chip) => (
              <span
                key={chip}
                style={{
                  fontSize: 10,
                  border: "1px solid #e4e2dc",
                  borderRadius: 20,
                  padding: "3px 10px",
                  color: "#6b6860",
                  background: "#faf9f7",
                }}
              >
                {chip}
              </span>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            {filteredEmails.length === 0 ? (
              <div
                style={{
                  padding: "40px 24px",
                  color: "#6b6860",
                  fontSize: 12,
                  lineHeight: 1.6,
                }}
              >
                No mails matched &quot;{searchQuery.trim()}&quot; in {mailboxMeta.label}.
              </div>
            ) : (
              groups.map((group) => (
                <div key={group}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "6px 16px",
                      fontSize: 10,
                      fontWeight: 600,
                      color: "#a09e99",
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      borderBottom: "1px solid #ede9e2",
                      background: "#f5f4f1",
                      position: "sticky",
                      top: 0,
                      zIndex: 5,
                    }}
                  >
                    {group}
                    <div style={{ flex: 1, height: 1, background: "#ede9e2" }} />
                  </div>

                  {filteredEmails.filter((email) => email.group === group).map((email) => (
                    <EmailRow
                      key={email.id}
                      email={email}
                      isActive={activeEmailId === email.id}
                      showReceivedBy={mailbox === "all-mail"}
                      onClick={() => handleEmailClick(email)}
                      onMouseEnter={(event) => handleEmailHover(email, event)}
                      onMouseMove={(event) => handleEmailMove(email, event)}
                      onMouseLeave={handleEmailLeave}
                    />
                  ))}
                </div>
              ))
            )}
          </div>
        </main>

        <div
          onMouseDown={(event) => {
            if (!readerOpen || readerFullPage) return;
            readerResizingRef.current = true;
            readerStartXRef.current = event.clientX;
            readerStartWidthRef.current = readerWidth;
            document.body.style.cursor = "col-resize";
            document.body.style.userSelect = "none";
          }}
          style={{ width: 4, cursor: "col-resize", background: "transparent", flexShrink: 0 }}
        />

        <MailReader
          email={activeEmail}
          isOpen={readerOpen}
          isFullPage={readerFullPage}
          width={readerWidth}
          onClose={() => {
            setReaderOpen(false);
            setReaderFullPage(false);
            setActiveEmailId(null);
          }}
          onToggleFullPage={() => setReaderFullPage((value) => !value)}
        />
      </div>

      <AITooltip state={tooltip} />
    </div>
  );
}
