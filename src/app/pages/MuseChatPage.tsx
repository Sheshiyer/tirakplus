import { FormEvent, PointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MuseApiError, MuseService } from "../api/muse";
import { MuseChartPanel } from "../components/muse/MuseChartPanel";
import { MusePoseImage } from "../components/muse/MusePoseImage";
import { AssetRegistry } from "../registry/assets";
import type { CSSProperties } from "react";
import type { MuseChartSignature, MuseChatMessage, MuseChatResponse, MuseConversationStage } from "../../shared/contracts";

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
  title: "Muse chart",
  tagline: "Private Thailand, tuned to your rhythm.",
  summary: "Start with mood, timing, boundary, and city fit. Muse keeps the private read quiet.",
  axes: [
    { label: "Mood", value: "unread", tone: "rose" },
    { label: "Pace", value: "ask first", tone: "lavender" },
    { label: "Boundary", value: "private", tone: "green" },
    { label: "Route", value: "open", tone: "pearl" },
  ],
  cues: ["Share birth context when ready", "Name the first city", "Say what should stay off-limits"],
  nextPrompt: "Tell Muse the city, mood, and boundary.",
} satisfies MuseChartSignature;

export function MuseChatPage() {
  const [messages, setMessages] = useState<MuseChatMessage[]>([initialMuseMessage]);
  const [message, setMessage] = useState("");
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [stage, setStage] = useState<MuseConversationStage>("arrival");
  const [suggestedPrompts, setSuggestedPrompts] = useState(openingPrompts);
  const [lastResponse, setLastResponse] = useState<MuseChatResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isChatActive, setIsChatActive] = useState(false);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const timezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);
  const museStatus = isSending ? "Reading" : lastResponse ? "Ready" : "Tuning";

  const sceneStyle = {
    "--muse-parallax-x": `${parallax.x}px`,
    "--muse-parallax-y": `${parallax.y}px`,
  } as CSSProperties;

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    if (event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 18;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 12;
    setParallax({ x, y });
  }

  useEffect(() => {
    if (!isChatActive) return;
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: "smooth" });
  }, [isChatActive, messages, isSending]);

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
      const response = await MuseService.chat({
        conversationId,
        message: trimmed,
        stage,
        clientContext: {
          timezone,
          route: "/",
        },
      });
      setConversationId(response.conversationId);
      setStage(response.stage);
      setSuggestedPrompts(response.suggestedPrompts);
      setLastResponse(response);
      setMessages((current) => [...current, response.reply]);
    } catch (caught) {
      const apiError = caught instanceof MuseApiError ? caught.message : "Muse paused. Try again in a moment.";
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

  return (
    <section
      className="muse-entry-page"
      data-chat-active={isChatActive ? "true" : "false"}
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
          <p className="eyebrow">Tirak Plus</p>
          <img className="muse-mark" src={AssetRegistry.brand.museMark} alt="" aria-hidden="true" />
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
        <img className="muse-entry-character-mobile" src={AssetRegistry.muse.scene.foreground} alt="" aria-hidden="true" />

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
            <span>Secure channel established</span>
            <strong>{lastResponse?.agentMode === "external" ? "Live" : museStatus}</strong>
          </div>
          <div className="muse-progress-track" aria-hidden="true">
            <span />
          </div>
        </aside>

        <div className="muse-chat-panel" aria-label="Muse chat">
          <div className="muse-chat-header">
            <div>
              <p className="eyebrow">Muse</p>
              <h2>{isChatActive ? "Private thread" : "Muse"}</h2>
            </div>
            <span>{stage.replaceAll("_", " ")}</span>
          </div>

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
          {error ? <p className="muse-error">{error}</p> : null}
        </div>

        <MuseChartPanel chart={lastResponse?.chart ?? openingChart} compact className="muse-entry-chart" />

        <aside className="muse-routing-panel" aria-label="Muse routing state">
          <p className="eyebrow">Current routing</p>
          <dl>
            <div>
              <dt>Stage</dt>
              <dd>{stage.replaceAll("_", " ")}</dd>
            </div>
            <div>
              <dt>Privacy</dt>
              <dd>No public profile browsing before fit and boundaries are understood.</dd>
            </div>
            <div>
              <dt>Next</dt>
              <dd>{lastResponse?.nextAction?.label ?? "Continue with Muse"}</dd>
            </div>
          </dl>
          <Link to="/overview">Open classic overview</Link>
        </aside>
      </div>

      <footer className="muse-trust-rail" aria-label="Muse trust assurances">
        <span>Private by design</span>
        <span>Thailand, curated</span>
        <span>Discreet guidance</span>
        <span>From Muse to you</span>
      </footer>
    </section>
  );
}
