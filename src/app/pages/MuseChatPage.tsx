import { FormEvent, PointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../api/AuthContext";
import { MuseApiError, MuseService, museTranscriptStorageKey } from "../api/muse";
import { isCitySlug, isExperienceSlug } from "../api/traveller";
import { MuseChartPanel } from "../components/muse/MuseChartPanel";
import { MusePoseImage } from "../components/muse/MusePoseImage";
import { AssetRegistry } from "../registry/assets";
import type { CSSProperties } from "react";
import type {
  MuseChartSignature,
  MuseChatMessage,
  MuseChatResponse,
  MuseClientContext,
  MuseConversationStage,
  MuseProfileSignals,
  MuseRoleIntent,
  MuseRouteKind,
  MuseTranscriptSnapshot,
} from "../../shared/contracts";

const initialMuseMessage: MuseChatMessage = {
  id: "muse_intro",
  role: "muse",
  content:
    "I am Muse. Give me the city, the mood, and the boundary. I will tune the path before anything is shown.",
  createdAt: new Date(0).toISOString(),
};

const openingPrompts = [
  "I arrive in Bangkok this weekend and want something private but warm.",
  "Help me find the right mood before I choose profiles.",
  "I am a companion and need help writing my profile.",
];

const openingChart = {
  title: "Muse signal",
  tagline: "Private Thailand, tuned to your rhythm.",
  summary: "Start with mood, timing, boundary, and city fit. Muse keeps the private read quiet.",
  axes: [
    { label: "Mood", value: "unread", tone: "rose" },
    { label: "Pace", value: "ask first", tone: "lavender" },
    { label: "Boundary", value: "private", tone: "green" },
    { label: "Path", value: "open", tone: "pearl" },
  ],
  cues: ["Share birth context when ready", "Name the first city", "Say what stays off-limits"],
  nextPrompt: "Tell Muse the city, mood, and boundary.",
} satisfies MuseChartSignature;

type MuseRouteContext = {
  clientContext: MuseClientContext;
  returnPath?: string;
  returnLabel?: string;
};

const routeKindLabels: Record<MuseRouteKind, string> = {
  "muse-entry": "Opening",
  "traveller-dashboard": "Board",
  "traveller-discovery": "Discovery",
  "traveller-profile": "Profile",
  "traveller-inquiry": "Inbox",
  "traveller-plan": "Plans",
  "traveller-safety": "Safety",
  "companion-dashboard": "Board",
  "companion-onboarding": "Onboarding",
  "companion-profile": "Profile",
  "companion-inbox": "Inbox",
  "companion-plan": "Availability",
  "companion-safety": "Safety",
  account: "Account",
  public: "Tirak Plus",
};

const stageLabels: Record<MuseConversationStage, string> = {
  arrival: "Opening",
  birth_context: "Birth details",
  travel_context: "City and timing",
  desire_mapping: "Mood",
  safety_boundaries: "Boundaries",
  recommendation_ready: "Ready",
};

function isMuseRouteKind(value: string | null): value is MuseRouteKind {
  return Boolean(value && value in routeKindLabels);
}

function isMuseRoleIntent(value: string | null): value is MuseRoleIntent {
  return value === "traveller" || value === "companion" || value === "unknown";
}

function safeRoutePath(value: string | null): string | undefined {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/api/")) return undefined;
  return value.slice(0, 240);
}

function safeLabel(value: string | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.replace(/[^\w\s-]/g, "").trim();
  return trimmed.length > 0 ? trimmed.slice(0, 32) : undefined;
}

function safeIdentifier(value: string | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  return /^[a-zA-Z0-9_-]{2,80}$/.test(trimmed) ? trimmed : undefined;
}

function routeKindForPath(pathname: string): MuseRouteKind {
  if (pathname.startsWith("/traveller/discovery")) return "traveller-discovery";
  if (pathname.startsWith("/traveller/companions")) return "traveller-profile";
  if (pathname.startsWith("/traveller/inbox") || pathname.startsWith("/traveller/inquiries")) return "traveller-inquiry";
  if (pathname.startsWith("/traveller/plans")) return "traveller-plan";
  if (pathname.startsWith("/traveller/safety")) return "traveller-safety";
  if (pathname.startsWith("/traveller/account")) return "account";
  if (pathname.startsWith("/traveller")) return "traveller-dashboard";
  if (pathname.startsWith("/companion/onboarding")) return "companion-onboarding";
  if (pathname.startsWith("/companion/profile")) return "companion-profile";
  if (pathname.startsWith("/companion/inbox")) return "companion-inbox";
  if (pathname.startsWith("/companion/plans")) return "companion-plan";
  if (pathname.startsWith("/companion/safety")) return "companion-safety";
  if (pathname.startsWith("/companion/account")) return "account";
  if (pathname.startsWith("/companion")) return "companion-dashboard";
  if (pathname === "/") return "muse-entry";
  return "public";
}

function roleIntentForRoute(kind: MuseRouteKind): MuseRoleIntent {
  if (kind.startsWith("traveller")) return "traveller";
  if (kind.startsWith("companion")) return "companion";
  return "unknown";
}

function buildMuseRouteContext(searchParams: URLSearchParams, timezone: string): MuseRouteContext {
  const returnPath = safeRoutePath(searchParams.get("from"));
  const inferredKind = routeKindForPath(returnPath ?? "/");
  const requestedKind = searchParams.get("kind");
  const requestedRole = searchParams.get("role");
  const companionId = safeIdentifier(searchParams.get("companion"));
  const inquiryId = safeIdentifier(searchParams.get("inquiry"));
  const planId = safeIdentifier(searchParams.get("plan"));
  const routeKind = isMuseRouteKind(requestedKind) ? requestedKind : inferredKind;
  const routeLabel = safeLabel(searchParams.get("label")) ?? routeKindLabels[routeKind];
  const roleIntent = isMuseRoleIntent(requestedRole) ? requestedRole : roleIntentForRoute(routeKind);
  const city = searchParams.get("city");
  const experience = searchParams.get("experience");

  return {
    clientContext: {
      timezone,
      route: returnPath ?? "/",
      source: searchParams.get("source") === "floating" ? "floating-trigger" : "muse-entry",
      routeKind,
      routeLabel,
      roleIntent,
      ...(isCitySlug(city) ? { city } : {}),
      ...(isExperienceSlug(experience) ? { experience } : {}),
      ...(companionId ? { companionId } : {}),
      ...(inquiryId ? { inquiryId } : {}),
      ...(planId ? { planId } : {}),
    },
    returnPath,
    returnLabel: returnPath ? routeLabel : undefined,
  };
}

/**
 * Persist the current Muse transcript to localStorage so the conversation
 * survives auth interstitials. After a successful useAuth().verify(), the
 * stored snapshot is adopted into the user's account via
 * MuseService.adopt() — see AuthContext for the adoption trigger.
 */
function persistMuseTranscript(snapshot: MuseTranscriptSnapshot): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      museTranscriptStorageKey(snapshot.conversationId),
      JSON.stringify(snapshot),
    );
    // Index of pending conversation IDs so AuthContext can find them on
    // verify() without scanning every localStorage key.
    const indexKey = "museTranscript:pendingIds";
    const raw = window.localStorage.getItem(indexKey);
    const ids = new Set<string>(raw ? (JSON.parse(raw) as string[]) : []);
    ids.add(snapshot.conversationId);
    window.localStorage.setItem(indexKey, JSON.stringify([...ids]));
  } catch {
    // Quota exceeded or storage disabled — drop silently; transcript is
    // still in component state for the active session.
  }
}

function restoreMuseTranscript(conversationId: string | undefined): MuseTranscriptSnapshot | null {
  if (typeof window === "undefined" || !conversationId) return null;
  try {
    const raw = window.localStorage.getItem(museTranscriptStorageKey(conversationId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MuseTranscriptSnapshot;
    if (parsed?.conversationId !== conversationId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function MuseChatPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { session } = useAuth();
  const [messages, setMessages] = useState<MuseChatMessage[]>([initialMuseMessage]);
  const [message, setMessage] = useState("");
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [stage, setStage] = useState<MuseConversationStage>("arrival");
  const [suggestedPrompts, setSuggestedPrompts] = useState(openingPrompts);
  const [lastResponse, setLastResponse] = useState<MuseChatResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isChatActive, setIsChatActive] = useState(false);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const timezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);
  const routeContext = useMemo(() => buildMuseRouteContext(searchParams, timezone), [searchParams, timezone]);
  const isFocusedMuse = isChatActive || Boolean(routeContext.returnPath);
  const stageLabel = stageLabels[stage];
  const museStatus = isSending
    ? "Reading"
    : lastResponse?.agentMode === "external"
    ? "Live read"
    : lastResponse?.agentMode === "staged"
    ? "Guided read"
    : "Ready";
  const handoffAction =
    lastResponse?.nextAction && lastResponse.nextAction.kind !== "continue" ? lastResponse.nextAction : null;
  const activeChart = lastResponse?.chart ?? openingChart;
  const shouldSimulateMuseError = searchParams.get("qa") === "muse-error";

  useEffect(() => {
    if (isChatActive) return;
    const step = 100 / 60;
    const id = window.setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(id);
          return 100;
        }
        return Math.min(p + step, 100);
      });
    }, 50);
    return () => clearInterval(id);
  }, [isChatActive]);

  const sceneStyle = {
    "--muse-parallax-x": `${parallax.x}px`,
    "--muse-parallax-y": `${parallax.y}px`,
  } as CSSProperties;

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    if (event.pointerType === "touch") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 18;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 12;
    setParallax({ x, y });
  }

  useEffect(() => {
    if (!isChatActive) return;
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: "smooth" });
  }, [isChatActive, messages, isSending]);

  // Persist transcript to localStorage while the user is anonymous so the
  // conversation survives the auth interstitial. AuthContext picks this up
  // on verify() success and calls MuseService.adopt().
  useEffect(() => {
    if (!conversationId) return;
    if (session) return; // Signed-in users don't need the local copy.
    if (messages.length <= 1) return; // Only the initial Muse greeting — nothing meaningful to persist.
    const snapshot: MuseTranscriptSnapshot = {
      conversationId,
      stage,
      messages,
      profileSignals: lastResponse?.profileSignals as MuseProfileSignals | undefined,
      clientContext: routeContext.clientContext,
      capturedAt: new Date().toISOString(),
    };
    persistMuseTranscript(snapshot);
  }, [conversationId, session, messages, stage, lastResponse?.profileSignals, routeContext.clientContext]);

  // On mount: if the URL carries a `?resume=<convId>` (set after the auth
  // round-trip), restore the transcript from localStorage so the user lands
  // back inside their pre-auth thread instead of an empty Muse welcome.
  // If localStorage has already been cleared by adoption, fall back to
  // GET /api/muse/conversations/:id.
  useEffect(() => {
    const resumeId = searchParams.get("resume");
    if (!resumeId) return;

    function applySnapshot(restored: MuseTranscriptSnapshot) {
      setConversationId(restored.conversationId);
      setStage(restored.stage);
      setMessages(restored.messages);
      setIsChatActive(true);
    }

    const local = restoreMuseTranscript(resumeId);
    if (local) {
      applySnapshot(local);
      return;
    }
    // Fall back to server-side adopted thread.
    MuseService.getConversation(resumeId)
      .then((res) => applySnapshot(res.conversation))
      .catch(() => {
        // Silent — user lands on the normal Muse welcome.
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function sendMuseMessage(value: string) {
    const trimmed = value.trim();
    if (!trimmed || isSending) return;

    const userMessage: MuseChatMessage = {
      id: `local_${crypto.randomUUID()}`,
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    setMessages((current) => [...current, userMessage]);
    setIsChatActive(true);
    setMessage("");
    setError(null);
    setIsSending(true);

    try {
      if (shouldSimulateMuseError) {
        throw new MuseApiError("Muse is paused. You can keep using Tirak Plus.", 503, "MUSE_QA_ERROR");
      }
      const response = await MuseService.chat({
        conversationId,
        message: trimmed,
        stage,
        profileSignals: lastResponse?.profileSignals,
        clientContext: routeContext.clientContext,
      });
      setConversationId(response.conversationId);
      setStage(response.stage);
      setSuggestedPrompts(response.suggestedPrompts);
      setLastResponse(response);
      setMessages((current) => [...current, response.reply]);
    } catch (caught) {
      const apiError =
        caught instanceof MuseApiError && caught.status >= 500
          ? "Muse is paused. You can keep using Tirak Plus."
          : caught instanceof MuseApiError
          ? caught.message
          : "Muse paused. Try again in a moment.";
      setError(apiError);
    } finally {
      setIsSending(false);
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMuseMessage(message);
  }

  function handleCloseChat() {
    setMessages([initialMuseMessage]);
    setMessage("");
    setConversationId(undefined);
    setStage("arrival");
    setSuggestedPrompts(openingPrompts);
    setLastResponse(null);
    setError(null);
    setIsSending(false);
    setProgress(0);
    setParallax({ x: 0, y: 0 });
    setIsChatActive(false);
    navigate("/", { replace: true });
  }

  return (
    <section
      className="muse-entry-page"
      data-chat-active={isFocusedMuse ? "true" : "false"}
      data-secure-ready={progress >= 100 ? "true" : "false"}
      data-muse-stage={stage}
      data-muse-source={routeContext.clientContext.source}
      data-muse-route-kind={routeContext.clientContext.routeKind}
      data-muse-agent-mode={lastResponse?.agentMode ?? "none"}
      data-muse-fallback={error ? "true" : "false"}
      data-testid="muse-entry"
      aria-labelledby="muse-title"
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setParallax({ x: 0, y: 0 })}
      style={sceneStyle}
    >
      <img className="muse-scene-backdrop" src={AssetRegistry.muse.scene.backdrop} alt="" aria-hidden="true" />
      <div className="muse-scene-vignette" aria-hidden="true" />
      <div className="muse-scene-ambient" aria-hidden="true" />

      <div className="muse-entry-shell">
        <header className="muse-entry-brand" aria-label="Muse">
          {/* "Tirak Plus" eyebrow + Muse-mark image removed 2026-05-26 —
              both are already shown in the top nav; rendering them here
              again duplicates the brand on the landing surface. */}
          <h1 id="muse-title">Muse</h1>
          <p>Private Thailand, tuned to your rhythm.</p>
        </header>

        <div className="muse-entry-copy">
          <p className="muse-entry-subtitle">Private Thailand. Your itinerary stays discreet.</p>
          <div className="muse-signal-card" aria-label="Muse privacy promises">
            <span>Private by design</span>
            <span>Secure channel</span>
            <span>Zero intrusion</span>
          </div>
        </div>

        <MusePoseImage variant="splash" label="Muse in the private welcome pose" className="muse-entry-character" />
        <img
          className="muse-entry-character-mobile"
          src={AssetRegistry.muse.scene.mobilePortrait}
          srcSet={`${AssetRegistry.muse.scene.mobilePortrait} 903w, ${AssetRegistry.muse.scene.tabletPortrait} 1180w, ${AssetRegistry.muse.scene.desktopPortrait} 1500w`}
          sizes="(min-width: 1024px) 36vw, (min-width: 640px) 46vw, 78vw"
          alt=""
          aria-hidden="true"
        />

        <aside className="muse-secure-card" aria-label="Secure channel status">
          <p className="eyebrow muse-status-label" aria-live="polite">
            <span>Initializing Muse</span>
            <i aria-hidden="true" />
            <i aria-hidden="true" />
            <i aria-hidden="true" />
          </p>
          <div className="muse-orbit-map" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="muse-progress-row">
            <span>Private channel ready</span>
            <strong>{lastResponse?.agentMode === "external" ? "Live" : museStatus}</strong>
          </div>
          <div className="muse-progress-track" aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </div>
          {progress < 100 && (
            <p className="muse-progress-note">
              {progress < 40
                ? "Tuning the frequency..."
                : progress < 75
                ? "Locking in privacy anchors..."
                : "Almost there, tuning to your boundaries..."}
            </p>
          )}
        </aside>

        <div className="muse-chat-panel" aria-label="Muse chat">
          <div className="muse-chat-header" data-testid="muse-chat-panel">
            <div>
              <p className="eyebrow">Muse</p>
              <h2>{isChatActive ? "Private thread" : "Muse"}</h2>
            </div>
            <div className="muse-chat-header-actions">
              <span data-testid="muse-stage">{stageLabel}</span>
              <button
                className="muse-chat-close"
                type="button"
                onClick={handleCloseChat}
                aria-label="Close Muse chat and return home"
                data-testid="muse-chat-close"
              >
                <span aria-hidden="true" />
              </button>
            </div>
          </div>

          {routeContext.returnPath ? (
            <div className="muse-route-pill" data-testid="muse-route-context">
              <span>Opened from {routeContext.returnLabel}</span>
              <Link to={routeContext.returnPath}>Return</Link>
            </div>
          ) : null}

          <div className="muse-transcript" aria-live="polite" ref={transcriptRef}>
            {messages.map((item) => (
              <article className={`muse-message muse-message-${item.role}`} key={item.id}>
                <p>{item.content}</p>
              </article>
            ))}
            {isSending ? (
              <article className="muse-message muse-message-muse muse-message-thinking">
                <p>Muse is reading the room.</p>
              </article>
            ) : null}
          </div>

          {handoffAction || routeContext.returnPath ? (
            <div className="muse-handoff-card" data-testid="muse-handoff">
              {handoffAction ? <Link to={handoffAction.href}>{handoffAction.label}</Link> : null}
              {routeContext.returnPath ? <Link to={routeContext.returnPath}>Back to {routeContext.returnLabel}</Link> : null}
            </div>
          ) : null}

          <div className="muse-suggestions" aria-label="Suggested replies">
            {suggestedPrompts.map((prompt) => (
              <button type="button" key={prompt} onClick={() => void sendMuseMessage(prompt)} disabled={isSending}>
                {prompt}
              </button>
            ))}
          </div>

          <form className="muse-entry-form" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Tell Muse what you are looking for..."
              aria-label="Message Muse"
              maxLength={1200}
            />
            <button type="submit" disabled={isSending || message.trim().length === 0}>
              Send
            </button>
          </form>
          {error ? (
            <div className="muse-fallback-card" role="status" data-testid="muse-fallback">
              <p>{error}</p>
              <div>
                {routeContext.returnPath ? <Link to={routeContext.returnPath}>Return to {routeContext.returnLabel}</Link> : null}
                <Link to="/discovery">Open discovery</Link>
                <Link to="/safety">Open safety</Link>
              </div>
            </div>
          ) : null}
        </div>

        

        <aside className="muse-context-panel" aria-label="Muse context state">
          <p className="eyebrow">Your thread</p>
          <MuseChartPanel chart={activeChart} compact className="muse-context-chart" />
          <dl>
            <div>
              <dt>Focus</dt>
              <dd>{stageLabel}</dd>
            </div>
            <div>
              <dt>Privacy</dt>
              <dd>Profiles stay private until fit and boundaries are clear.</dd>
            </div>
            <div>
              <dt>Next</dt>
              <dd>{lastResponse?.nextAction?.label ?? "Continue with Muse"}</dd>
            </div>
          </dl>
          <Link to="/safety">Safety and privacy</Link>
        </aside>
      </div>

      
    </section>
  );
}
