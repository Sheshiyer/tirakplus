import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { TravellerInquiryListResponse } from "../../shared/contracts";
import { BookingService } from "../api/booking";
import { Button } from "../components/ui/Button";
import { FeedbackState } from "../components/ui/FeedbackState";
import { SkeletonCard } from "../components/ui/Skeleton";

const POLL_INTERVAL_MS = 5000;

type LoadState =
  | { status: "loading"; data?: undefined; message?: undefined }
  | { status: "ready"; data: TravellerInquiryListResponse; message?: undefined }
  | { status: "error"; data?: undefined; message: string };

export function TravellerInquiriesPage() {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const isPollingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    BookingService.listTravellerInquiries()
      .then((data) => {
        if (!cancelled) setState({ status: "ready", data });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            status: "error",
            message: error instanceof Error ? error.message : "Inquiries could not be loaded.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // H2.T7 — Poll every 5s while at least one inquiry is in "routed" state
  // (awaiting companion accept/decline). Stops automatically when no routed
  // inquiries remain. Skips the fetch when the tab is hidden. Polling failures
  // are swallowed silently (best-effort refresh, not user-facing).
  //
  // hasPending is derived via useMemo so the effect keys on a boolean instead of
  // the full state object. When polling is in steady state (hasPending stays
  // true across successful polls) the effect doesn't re-run and the interval
  // keeps ticking on its original 5s cadence — eliminating the clock-reset
  // drift caused by re-keying on every successful poll's setState.
  const hasPending = useMemo(
    () => state.status === "ready" && state.data.results.some((r) => r.status === "routed"),
    [state],
  );

  useEffect(() => {
    if (!hasPending) return;

    let cancelled = false;
    const interval = setInterval(async () => {
      if (document.hidden) return;
      if (isPollingRef.current) return; // skip if previous fetch still in flight
      isPollingRef.current = true;
      try {
        const data = await BookingService.listTravellerInquiries();
        if (!cancelled) setState({ status: "ready", data });
      } catch {
        // best-effort — polling failures are not user-facing
      } finally {
        isPollingRef.current = false;
      }
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [hasPending]);

  return (
    <section className="inquiry-page" aria-labelledby="inquiries-title">
      <div className="inquiry-heading">
        <p className="eyebrow">Inbox</p>
        <h1 id="inquiries-title">Open inquiries</h1>
        <p>Review open requests, timing, and next steps in one place.</p>
      </div>

      {state.status === "loading" && (
        <div className="inquiry-card-list">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {state.status === "error" && (
        <FeedbackState
          variant="error"
          title="Inbox is unavailable"
          description={state.message}
        />
      )}

      {state.status === "ready" && (
        state.data.results.length === 0 ? (
          <FeedbackState
            title={state.data.emptyState.title}
            description={state.data.emptyState.description}
            actionLabel="Open discovery"
            onAction={() => window.location.assign("/traveller/discovery")}
          />
        ) : (
          <div className="inquiry-card-list">
            {state.data.results.map((inquiry) => {
              // Pass I.T8 — server enriches `unreadMessageCount` for
              // matched bookings only; treat as `undefined | number`
              // and only render the badge when > 0.
              const unread = inquiry.unreadMessageCount ?? 0;
              return (
                <article key={inquiry.id} className="inquiry-summary-card">
                  <div>
                    <p className="meta">{inquiry.status.replace("_", " ")}</p>
                    <h2>
                      {inquiry.companionDisplayName}
                      {unread > 0 ? (
                        <span
                          className="inbox-unread-badge"
                          aria-label={`${unread} unread message${unread === 1 ? "" : "s"}`}
                        >
                          {unread}
                        </span>
                      ) : null}
                    </h2>
                    <p>{inquiry.nextStep}</p>
                  </div>
                  <div className="inquiry-summary-meta">
                    <span>{inquiry.city.replace("-", " ")}</span>
                    <span>{inquiry.experience.replace(/-/g, " ")}</span>
                  </div>
                  <Button as={Link} to={`/traveller/inbox/${inquiry.id}`} variant="secondary">
                    Open thread
                  </Button>
                </article>
              );
            })}
          </div>
        )
      )}
    </section>
  );
}
