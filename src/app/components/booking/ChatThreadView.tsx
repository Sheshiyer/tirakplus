// ChatThreadView.tsx — Pass I.T5.
//
// Self-contained chat surface for a single booking thread. Both
// TravellerInquiryDetailPage (T6) and CompanionInquiryDetailPage (T7)
// compose this component; the parent owns the routing + booking detail
// fetch, and passes in the small slice of context this view needs
// (inquiryId for API calls, viewerRole for bubble alignment, and
// bookingStatus for composer gating).
//
// This view owns:
//   - initial GET /api/plans/:id/messages
//   - 5s polling while booking is in a matched-and-not-terminal state,
//     using the H2.T8 / H3.T7 useMemo(hasPending) + useRef(isPolling)
//     pattern so the interval keys on a stable boolean and overlapping
//     fetches can never queue up
//   - optimistic send + server reconciliation by id
//   - auto mark-read on mount + when poll surfaces a new other-party
//     message, gated on document.hasFocus() + !document.hidden so the
//     unread badge persists for a background tab
//   - smart scroll-to-bottom that preserves manual scroll-up to read
//     history
//   - composer enable/disable + per-state hint when the booking is not
//     in a matched state
//
// What this view deliberately does NOT do:
//   - know about routing (parent passes inquiryId)
//   - fetch the booking record itself (parent owns that — we just need
//     bookingStatus as a prop)
//   - render the unread badge on the page header (T8 scope — inboxes
//     and TopNav surface that separately)

import { useEffect, useMemo, useRef, useState } from "react";
import type {
  ChatAuthorRole,
  ChatMessage,
  InquiryStatus,
} from "../../../shared/contracts";
import { BookingApiError, BookingService } from "../../api/booking";

export type ChatThreadViewProps = {
  inquiryId: string;
  /** "traveller" or "companion" — drives own/other bubble alignment. */
  viewerRole: ChatAuthorRole;
  /** Composer is enabled only when status ∈ MATCHED_STATUSES. */
  bookingStatus: InquiryStatus;
  className?: string;
};

// Mirrors the worker's allowlist for who can POST to the thread.
// Anything outside this list renders the composer disabled with a hint.
// Pre-`accepted` states (draft/submitted/under_review/routed) and the
// terminal-non-success states (declined/cancelled) are intentionally
// excluded; both parties only see a chat surface once they're matched.
const MATCHED_STATUSES: InquiryStatus[] = [
  "accepted",
  "date_pending",
  "date_proposed",
  "date_confirmed",
  "payment_held",
  "session_scheduled",
  "session_live",
  "session_completed",
  "review_pending",
  "review_completed",
];

// Cadence mirrors the inbox / detail-page polls in H2.T8 / H3.T7 / H6.T7.
// 5s is the floor where "real-time enough" meets "doesn't burn KV reads".
const POLL_INTERVAL_MS = 5000;

// How close to the bottom (in pixels) the user has to be for a new
// incoming message to trigger auto-scroll. ~80px ≈ one message + meta,
// so a user reading the second-to-last message is still treated as "at
// the bottom" and gets auto-scrolled; anyone scrolled up to read older
// history is left where they were.
const SCROLL_BOTTOM_THRESHOLD_PX = 80;

const MAX_MESSAGE_LENGTH = 2000;

// "14 June, 18:32" in Asia/Bangkok local time. Same Intl pattern as
// ConfirmPlanView / SessionItinerary / email.ts — Thailand is UTC+7
// year-round so en-GB + timeZone is deterministic.
const messageTimestampFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Bangkok",
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function formatMessageTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return messageTimestampFormatter.format(date);
}

// Optimistic IDs are prefixed so the reconciliation step can identify
// the synthetic record without re-comparing by content+author.
const OPTIMISTIC_ID_PREFIX = "local_";

function makeOptimisticId(): string {
  // crypto.randomUUID is available in every browser this app supports
  // (matches the BookingService / consent.ts assumption). The prefix is
  // the part that makes reconciliation easy; the UUID just avoids
  // collisions if a user mashes the send button.
  const uuid =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}_${Math.random().toString(36).slice(2)}`;
  return `${OPTIMISTIC_ID_PREFIX}${uuid}`;
}

// Per-state copy for the disabled composer. Spec lists routed/declined/
// cancelled/expired explicitly; "expired" is not an InquiryStatus value
// (only AccountDataExportStatus has it) so it falls through to the
// catch-all hint along with any other not-yet-matched state.
function disabledComposerHint(status: InquiryStatus): string {
  switch (status) {
    case "routed":
      return "Waiting for the companion to accept.";
    case "declined":
      return "This inquiry was declined — messaging closed.";
    case "cancelled":
      return "This inquiry was cancelled — messaging closed.";
    default:
      return "Messaging not available in this state.";
  }
}

function viewerSelfLabel(role: ChatAuthorRole): string {
  return role === "traveller" ? "Traveller" : "You";
}

export function ChatThreadView(props: ChatThreadViewProps) {
  const { inquiryId, viewerRole, bookingStatus, className } = props;

  const canPost = MATCHED_STATUSES.includes(bookingStatus);

  // --- Thread state ----------------------------------------------------
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [lastReadAt, setLastReadAt] = useState<string | undefined>(undefined);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- Composer state --------------------------------------------------
  const [draft, setDraft] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);
  const [sendError, setSendError] = useState<string | null>(null);

  // --- Polling + mark-read coordination --------------------------------
  // isPollingRef guards against overlapping in-flight polls. Using the
  // same useRef pattern as TravellerInquiryDetailPage so behaviour
  // matches what reviewers already know.
  const isPollingRef = useRef<boolean>(false);
  // isMarkingReadRef prevents the auto-mark-read effect from firing
  // multiple concurrent requests if the dependencies churn while one is
  // in flight.
  const isMarkingReadRef = useRef<boolean>(false);

  // --- Scroll affordance -----------------------------------------------
  const scrollRef = useRef<HTMLDivElement>(null);
  // True iff the user is "at the bottom" of the scroll container — only
  // when this is true do we auto-scroll on new messages.
  const isAtBottomRef = useRef<boolean>(true);

  // Initial fetch on mount (and whenever inquiryId changes). On error we
  // surface a placeholder; polling won't start until canPost is true so
  // the error path keeps the surface readable without retry storms.
  //
  // P2.T7 fix: gate the initial fetch on canPost. The server returns 409
  // THREAD_LOCKED for bookings outside MATCHED_STATUSES (routed/submitted),
  // so an unconditional mount fetch logged a 409 console error on every
  // detail page for a not-yet-matched booking. When the booking later
  // advances into a matched state, canPost flips true and this effect
  // re-fires to load the thread.
  useEffect(() => {
    if (!canPost) {
      setMessages([]);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    BookingService.getMessages(inquiryId)
      .then((response) => {
        if (cancelled) return;
        setMessages(response.messages);
        setUnreadCount(response.unreadCount);
        setLastReadAt(response.lastReadAt);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err instanceof BookingApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Thread could not be loaded.";
        setError(message);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [inquiryId, canPost]);

  // 5s polling — only while the booking is in a matched state. Skips
  // when the tab is hidden so a backgrounded page doesn't burn API
  // budget. Polling failures are silent; the next successful poll will
  // self-heal the view.
  useEffect(() => {
    if (!canPost) return;

    let cancelled = false;
    const interval = setInterval(async () => {
      if (document.hidden) return;
      if (isPollingRef.current) return;
      isPollingRef.current = true;
      try {
        const response = await BookingService.getMessages(inquiryId);
        if (cancelled) return;
        setMessages(response.messages);
        setUnreadCount(response.unreadCount);
        setLastReadAt(response.lastReadAt);
      } catch {
        // best-effort
      } finally {
        isPollingRef.current = false;
      }
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [canPost, inquiryId]);

  // hasNewOtherPartyMessage drives the auto-mark-read effect. We compute
  // it via useMemo against the messages list so the effect only fires
  // when a render actually contains an unread other-party message.
  const hasNewOtherPartyMessage = useMemo(() => {
    if (messages.length === 0) return false;
    const lastReadTime = lastReadAt ? Date.parse(lastReadAt) : 0;
    return messages.some(
      (m) =>
        m.authorRole !== viewerRole &&
        !m.id.startsWith(OPTIMISTIC_ID_PREFIX) &&
        Date.parse(m.createdAt) > lastReadTime,
    );
  }, [messages, lastReadAt, viewerRole]);

  // Auto mark-read: only when the tab is visible AND the window has
  // focus. We deliberately don't mark-read while hidden so the unread
  // badge persists for the user who isn't actively looking.
  useEffect(() => {
    if (loading) return;
    if (!hasNewOtherPartyMessage) return;
    if (typeof document === "undefined") return;
    if (document.hidden) return;
    if (typeof document.hasFocus === "function" && !document.hasFocus()) return;
    if (isMarkingReadRef.current) return;

    let cancelled = false;
    isMarkingReadRef.current = true;
    BookingService.markThreadRead(inquiryId)
      .then((response) => {
        if (cancelled) return;
        setLastReadAt(response.lastReadAt);
        setUnreadCount(0);
      })
      .catch(() => {
        // best-effort — next mount or next other-party message retries
      })
      .finally(() => {
        isMarkingReadRef.current = false;
      });

    return () => {
      cancelled = true;
    };
  }, [hasNewOtherPartyMessage, inquiryId, loading]);

  // Track whether the user is parked at (or near) the bottom of the
  // scroll container. We sample on scroll instead of on every render so
  // the predicate stays cheap.
  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    const onScroll = () => {
      const distanceFromBottom =
        node.scrollHeight - node.scrollTop - node.clientHeight;
      isAtBottomRef.current = distanceFromBottom <= SCROLL_BOTTOM_THRESHOLD_PX;
    };
    node.addEventListener("scroll", onScroll, { passive: true });
    // Initialise once so a fresh-mounted thread starts pinned to bottom.
    isAtBottomRef.current = true;
    return () => node.removeEventListener("scroll", onScroll);
  }, []);

  // Auto-scroll to bottom when message count changes — but only if the
  // user is already near the bottom. Preserves manual scroll-up to read
  // history.
  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    if (!isAtBottomRef.current) return;
    // requestAnimationFrame so the DOM has applied the new message
    // before we measure scrollHeight.
    const raf = requestAnimationFrame(() => {
      node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
    });
    return () => cancelAnimationFrame(raf);
  }, [messages.length]);

  const trimmedDraft = draft.trim();
  const canSend =
    canPost &&
    !sending &&
    trimmedDraft.length >= 1 &&
    trimmedDraft.length <= MAX_MESSAGE_LENGTH;

  const submitMessage = async () => {
    if (!canSend) return;

    const content = trimmedDraft;
    const optimisticId = makeOptimisticId();
    const optimistic: ChatMessage = {
      id: optimisticId,
      threadId: inquiryId,
      authorRole: viewerRole,
      authorLabel: viewerSelfLabel(viewerRole),
      content,
      createdAt: new Date().toISOString(),
    };

    // Snapshot the previous draft so we can restore it on failure.
    const previousDraft = draft;

    setSending(true);
    setSendError(null);
    setDraft("");
    setMessages((prev) => [...prev, optimistic]);
    // A send is implicitly a read: the user is clearly looking at the
    // thread. Force the next-render auto-scroll to fire by pinning the
    // at-bottom flag.
    isAtBottomRef.current = true;

    try {
      const response = await BookingService.sendMessage(inquiryId, { content });
      // Reconcile: replace the optimistic record with the server one,
      // keyed by the optimistic id we just inserted.
      setMessages((prev) =>
        prev.map((m) => (m.id === optimisticId ? response.message : m)),
      );
    } catch (err) {
      // Roll back the optimistic insert + restore the draft so the user
      // can edit and retry without losing what they typed.
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      setDraft(previousDraft);
      const message =
        err instanceof BookingApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Message could not be sent. Try again.";
      setSendError(message);
    } finally {
      setSending(false);
    }
  };

  const onComposerKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    // Enter sends, Shift+Enter inserts a newline. Mirrors the muscle
    // memory every chat app trains.
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submitMessage();
    }
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submitMessage();
  };

  const wrapperClass = ["chat-thread-view", className].filter(Boolean).join(" ");

  return (
    <section className={wrapperClass} aria-label="Booking thread">
      <header className="chat-thread-header">
        <p className="eyebrow">Private thread</p>
        {unreadCount > 0 ? (
          <span className="chat-thread-unread-pill" aria-label={`${unreadCount} unread`}>
            {unreadCount} new
          </span>
        ) : null}
      </header>

      <div ref={scrollRef} className="chat-thread-scroll" role="log" aria-live="polite">
        {loading ? (
          <p className="chat-thread-loading">Loading messages…</p>
        ) : error ? (
          <p className="chat-thread-error" role="alert">{error}</p>
        ) : messages.length === 0 ? (
          <div className="chat-thread-empty">
            <svg
              aria-hidden="true"
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
            >
              <path
                d="M8 11.5C8 9.567 9.567 8 11.5 8h17C30.433 8 32 9.567 32 11.5v13c0 1.933-1.567 3.5-3.5 3.5H17l-6 5v-5h-.5C9.567 28 8 26.433 8 24.5v-13Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
            <p className="chat-thread-empty-title">No messages yet.</p>
            <p className="chat-thread-empty-body">
              Start the conversation — both of you are matched.
            </p>
          </div>
        ) : (
          <ul className="chat-thread-list">
            {messages.map((message) => {
              const own = message.authorRole === viewerRole;
              const bubbleClass = [
                "chat-message",
                own ? "chat-message-own" : "chat-message-other",
              ].join(" ");
              return (
                <li key={message.id} className={bubbleClass}>
                  <p className="chat-message-content">{message.content}</p>
                  <p className="chat-message-meta">
                    <span className="chat-message-author">{message.authorLabel}</span>
                    <span className="chat-message-dot" aria-hidden="true">·</span>
                    <span className="chat-message-time">
                      {formatMessageTimestamp(message.createdAt)}
                    </span>
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <form className="chat-thread-composer" onSubmit={onSubmit}>
        <textarea
          className="chat-thread-composer-input"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onComposerKeyDown}
          placeholder={canPost ? "Write a message…" : "Messaging is unavailable right now."}
          maxLength={MAX_MESSAGE_LENGTH}
          rows={1}
          disabled={!canPost || sending}
          aria-label="Write a message"
        />
        <button
          type="submit"
          className="button coral chat-thread-send"
          disabled={!canSend}
          aria-label="Send message"
        >
          {sending ? "Sending…" : "Send"}
        </button>
      </form>

      {sendError ? (
        <p className="chat-thread-error chat-thread-send-error" role="alert">
          {sendError}
        </p>
      ) : null}

      {!canPost ? (
        <p className="chat-thread-disabled-hint">
          {disabledComposerHint(bookingStatus)}
        </p>
      ) : null}
    </section>
  );
}
