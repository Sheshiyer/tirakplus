/**
 * MuseAssistedTextarea — the inquiry composer's message field with a live,
 * one-shot Muse-assist affordance.
 *
 * P2.T4 (2026-05-28). Self-contained + controlled (value/onChange). The page
 * (T5) drops this in; it owns no booking state beyond a transient draft
 * suggestion + assist status.
 *
 * Design contract:
 * - The textarea is ALWAYS usable. Muse-assist is additive, never a gate —
 *   any Muse error degrades gracefully to a plain composer (the user keeps
 *   typing their own message).
 * - "Ask Muse to help" fires a single fresh MuseService.chat (no
 *   conversationId — each click is a clean one-shot draft) seeded with the
 *   companion + experience + scheduled-for context, then renders the reply
 *   in a suggestion card below the field with Use / Try again / Dismiss.
 * - "Use this message" OVERWRITES the textarea (v1 choice — simpler than a
 *   merge; the user edits afterward if they want to keep prior text) and
 *   clamps to maxLength.
 *
 * Mirrors MuseChatPage's call shape: MuseService.chat({ message,
 * clientContext }) with clientContext fields drawn from MuseClientContext.
 */
import { useId, useState } from "react";
import type { ExperienceSlug } from "../../../../shared/contracts";
import { MuseApiError, MuseService } from "../../../api/muse";

export type MuseAssistedTextareaProps = {
  value: string;
  onChange: (next: string) => void;
  // Context for seeding Muse's draft:
  companionName: string;
  companionId: string;
  experience: ExperienceSlug | null;
  scheduledForLabel: string | null; // human "Sat 14 Jun, 19:00" or null
  maxLength?: number; // default 500
  disabled?: boolean;
};

type AssistState = "idle" | "drafting" | "ready" | "error";

// Human label per experience slug, used to seed Muse with natural language
// instead of the kebab slug.
const EXPERIENCE_LABEL: Record<ExperienceSlug, string> = {
  nightlife: "night out",
  "island-explorer": "island day",
  "muay-thai-night": "Muay Thai evening",
  "private-dining": "private dinner",
  "local-guidance": "local guidance day",
};

// Light heuristic: strip a single leading conversational preamble line that
// LLMs sometimes prepend ("Sure! Here's a draft:", "Here's a message:") plus
// surrounding quote marks. Intentionally conservative — if the output is
// messy beyond this, the user edits it in the textarea.
const PREAMBLE_PATTERN =
  /^(sure[!,.]?\s*)?(here(['’]s| is)|here you go|of course|certainly|happy to help)[^\n:]*:?\s*\n+/i;

function cleanSuggestion(raw: string): string {
  let text = raw.trim();
  text = text.replace(PREAMBLE_PATTERN, "").trim();
  // Strip a wrapping pair of straight or smart quotes if Muse quoted the draft.
  if (text.length >= 2) {
    const first = text[0];
    const last = text[text.length - 1];
    const pairs: Record<string, string> = { '"': '"', "“": "”", "'": "'", "‘": "’" };
    if (pairs[first] && pairs[first] === last) {
      text = text.slice(1, -1).trim();
    }
  }
  return text;
}

const SparkleIcon = (
  <svg viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path
      d="M9 2.2 10.4 6 14.2 7.4 10.4 8.8 9 12.6 7.6 8.8 3.8 7.4 7.6 6 9 2.2Z"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    <path d="M14 11.4v2.4M12.8 12.6h2.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

export function MuseAssistedTextarea({
  value,
  onChange,
  companionName,
  companionId,
  experience,
  scheduledForLabel,
  maxLength = 500,
  disabled = false,
}: MuseAssistedTextareaProps) {
  const textareaId = useId();
  const helperId = useId();

  const [assistState, setAssistState] = useState<AssistState>("idle");
  const [suggestion, setSuggestion] = useState<string | null>(null);

  const length = value.length;
  const isOverLimit = length >= maxLength;
  const isNearLimit = length > 450;
  const isDrafting = assistState === "drafting";
  const controlsDisabled = disabled || isDrafting;

  async function requestDraft() {
    if (controlsDisabled) return;

    setAssistState("drafting");
    setSuggestion(null);

    const experienceLabel = experience ? EXPERIENCE_LABEL[experience] : "experience";
    const whenClause = scheduledForLabel ? `on ${scheduledForLabel}` : "";
    const instruction =
      `Draft a short, warm, respectful first-contact message (2-4 sentences, ` +
      `under 400 characters) I can send to ${companionName} about a ` +
      `${experienceLabel} ${whenClause}. Return ONLY the message text, no preamble.`.replace(
        /\s+/g,
        " ",
      ).trim();

    // Mirror MuseChatPage's clientContext shape. Browser timezone resolved
    // defensively (some embedded runtimes lack Intl).
    let timezone: string | undefined;
    try {
      timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      timezone = undefined;
    }

    try {
      const response = await MuseService.chat({
        message: instruction,
        clientContext: {
          timezone,
          source: "floating-trigger",
          routeKind: "traveller-inquiry",
          roleIntent: "traveller",
          companionId,
          experience: experience ?? undefined,
        },
      });
      const drafted = cleanSuggestion(response.reply.content);
      if (!drafted) {
        setAssistState("error");
        return;
      }
      setSuggestion(drafted);
      setAssistState("ready");
    } catch (caught) {
      // MuseApiError or any throw → graceful degradation. We never surface a
      // blocking error; the textarea stays fully usable.
      void (caught instanceof MuseApiError);
      setSuggestion(null);
      setAssistState("error");
    }
  }

  function handleUseSuggestion() {
    if (!suggestion) return;
    const next = suggestion.length > maxLength ? suggestion.slice(0, maxLength) : suggestion;
    onChange(next);
    setSuggestion(null);
    setAssistState("idle");
  }

  function handleDismiss() {
    setSuggestion(null);
    setAssistState("idle");
  }

  return (
    <div className="composer-muse-field field">
      <label htmlFor={textareaId} className="field-label composer-muse-field__label">
        Your message
      </label>
      <p id={helperId} className="composer-muse-field__helper">
        Muse can help you craft a respectful, clear message.
      </p>

      <div className="composer-muse-field__control">
        <textarea
          id={textareaId}
          className="field-input field-textarea composer-muse-field__textarea"
          value={value}
          maxLength={maxLength}
          disabled={disabled}
          rows={6}
          placeholder="Share a little about what you're hoping for, and a respectful hello."
          aria-describedby={helperId}
          onChange={(event) => onChange(event.target.value)}
        />
        <div
          className={
            "composer-muse-field__count" +
            (isOverLimit ? " is-over-limit" : isNearLimit ? " is-near-limit" : "")
          }
          aria-live="polite"
        >
          {length}/{maxLength}
        </div>
      </div>

      <div className="composer-muse-field__assist-row">
        <button
          type="button"
          className="composer-muse-assist-button"
          onClick={() => void requestDraft()}
          disabled={controlsDisabled}
          aria-busy={isDrafting}
        >
          <span className="composer-muse-assist-button__icon" aria-hidden="true">
            {SparkleIcon}
          </span>
          <span>{isDrafting ? "Muse is drafting…" : "Ask Muse to help"}</span>
        </button>

        {assistState === "error" ? (
          <p className="composer-muse-field__note" role="status">
            Muse is paused — write your own message.
          </p>
        ) : null}
      </div>

      {assistState === "ready" && suggestion ? (
        <div className="composer-muse-suggestion" role="group" aria-label="Muse suggestion">
          <p className="composer-muse-suggestion__eyebrow">
            <span className="composer-muse-suggestion__icon" aria-hidden="true">
              {SparkleIcon}
            </span>
            Muse drafted this
          </p>
          <p className="composer-muse-suggestion__text">{suggestion}</p>
          <div className="composer-muse-suggestion__actions">
            <button
              type="button"
              className="composer-muse-suggestion__use"
              onClick={handleUseSuggestion}
            >
              Use this message
            </button>
            <button
              type="button"
              className="composer-muse-suggestion__secondary"
              onClick={() => void requestDraft()}
            >
              Try again
            </button>
            <button
              type="button"
              className="composer-muse-suggestion__secondary"
              onClick={handleDismiss}
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
