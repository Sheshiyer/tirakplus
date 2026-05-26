import { FormEvent, useRef, useState } from "react";
import { useAuth } from "../../api/AuthContext";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import type { UserRole } from "../../../shared/contracts";

type MuseInlineAuthProps = {
  /** Role to register the new account under if the user signs up from
   *  inside the chat. Pulled from clientContext.roleIntent /
   *  lastResponse.roleIntent in the parent. Defaults to "traveller". */
  role?: Extract<UserRole, "traveller" | "companion">;
  /** Initial email if Muse already collected it earlier in the thread. */
  initialEmail?: string;
  /** Called after the verify() succeeds (and AuthContext fires the
   *  pending-transcript adoption). The parent can append a Muse
   *  message confirming the user is signed in. */
  onAuthenticated: (email: string) => void;
};

type Stage = "email" | "otp" | "done";

/**
 * In-chat OTP login widget. Lives inside the Muse chat panel so the
 * sign-in happens WITHOUT leaving the conversation. Same wire
 * (POST /api/auth/start, POST /api/auth/verify) as the standalone
 * /auth/start + /auth/verify pages — just embedded inline.
 *
 * State machine:
 *   email → POST /auth/start → otp → POST /auth/verify → done
 *
 * On done, onAuthenticated() is called so the parent can append a
 * Muse-spoken confirmation message and continue the thread.
 */
export function MuseInlineAuth({ role = "traveller", initialEmail = "", onAuthenticated }: MuseInlineAuthProps) {
  const { login, verify, isLoading } = useAuth();
  const [stage, setStage] = useState<Stage>("email");
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent">("idle");
  const codeInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Enter a valid email address.");
      return;
    }
    try {
      await login(trimmed);
      setEmail(trimmed);
      setStage("otp");
      // Focus the first OTP cell once the next render mounts it.
      window.setTimeout(() => codeInputRefs.current[0]?.focus(), 0);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not send code. Try again.");
    }
  }

  function handleCodeChange(index: number, value: string) {
    if (value.length > 1) {
      // Paste path
      const pasted = value.slice(0, 6).split("");
      const next = [...code];
      for (let i = 0; i < pasted.length && index + i < 6; i++) {
        next[index + i] = pasted[i];
      }
      setCode(next);
      const nextIndex = Math.min(index + pasted.length, 5);
      codeInputRefs.current[nextIndex]?.focus();
      return;
    }
    const next = [...code];
    next[index] = value;
    setCode(next);
    if (value !== "" && index < 5) codeInputRefs.current[index + 1]?.focus();
  }

  function handleCodeKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && code[index] === "" && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    }
  }

  async function handleCodeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const full = code.join("");
    if (!/^\d{6}$/.test(full)) {
      setError("Enter the six digit code from your email.");
      return;
    }
    try {
      await verify(email, full, role);
      setStage("done");
      onAuthenticated(email);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "That code did not match. Try again.");
      setCode(["", "", "", "", "", ""]);
      codeInputRefs.current[0]?.focus();
    }
  }

  async function handleResend() {
    if (resendState === "sending" || !email) return;
    setResendState("sending");
    setError(null);
    try {
      await login(email);
      setResendState("sent");
      window.setTimeout(() => setResendState("idle"), 4000);
    } catch {
      setResendState("idle");
      setError("Could not resend. Try again in a moment.");
    }
  }

  if (stage === "done") return null;

  return (
    <div className="muse-inline-auth" role="region" aria-label="Sign in inside Muse chat" data-stage={stage}>
      {stage === "email" ? (
        <form className="muse-inline-auth-form" onSubmit={handleEmailSubmit}>
          <p className="muse-inline-auth-eyebrow">Continue privately</p>
          <p className="muse-inline-auth-prompt">
            Share your email and I will send a 6-digit code to keep this thread tied to you.
          </p>
          <div className="muse-inline-auth-row">
            <Input
              label="Email address"
              labelVisible={false}
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="muse-inline-auth-input"
              required
              disabled={isLoading}
            />
            <Button type="submit" variant="primary" disabled={isLoading || email.trim().length === 0}>
              {isLoading ? "Sending…" : "Send code"}
            </Button>
          </div>
          {error ? <p className="muse-inline-auth-error">{error}</p> : null}
        </form>
      ) : (
        <form className="muse-inline-auth-form" onSubmit={handleCodeSubmit}>
          <p className="muse-inline-auth-eyebrow">Code sent</p>
          <p className="muse-inline-auth-prompt">
            I sent a 6-digit code to <strong>{email}</strong>. Drop it in below.
          </p>
          <div className="muse-inline-auth-code-grid" role="group" aria-label="Six digit code">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  codeInputRefs.current[index] = el;
                }}
                className="muse-inline-auth-code-cell"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={digit}
                onChange={(event) => handleCodeChange(index, event.target.value)}
                onKeyDown={(event) => handleCodeKeyDown(index, event)}
                aria-label={`Digit ${index + 1}`}
                disabled={isLoading}
              />
            ))}
          </div>
          <div className="muse-inline-auth-actions">
            <Button type="submit" variant="primary" disabled={isLoading || code.join("").length !== 6}>
              {isLoading ? "Verifying…" : "Verify and continue"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleResend}
              disabled={isLoading || resendState === "sending"}
              className="muse-inline-auth-resend"
            >
              {resendState === "sending"
                ? "Resending…"
                : resendState === "sent"
                ? "Sent — check inbox"
                : "Resend code"}
            </Button>
          </div>
          {error ? <p className="muse-inline-auth-error">{error}</p> : null}
        </form>
      )}
    </div>
  );
}
