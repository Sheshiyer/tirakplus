import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "tp-install-dismissed";

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari exposes this non-standard flag when launched from the home screen.
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [iosHint, setIosHint] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (isStandalone()) return;

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      // A real install prompt supersedes the iOS manual-instructions fallback.
      setIosHint(false);
      setDeferred(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setDeferred(null);
      setIosHint(false);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    // iOS never fires beforeinstallprompt, so offer manual instructions instead.
    if (isIos()) setIosHint(true);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // sessionStorage may be unavailable (private mode); dismissing for the render is enough.
    }
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  };

  if (dismissed) return null;
  if (!deferred && !iosHint) return null;

  return (
    <div className="install-prompt" role="dialog" aria-label="Add Tirak Plus to your home screen">
      <div className="install-prompt__body">
        <p className="install-prompt__title">Add Tirak Plus to your home screen</p>
        {deferred ? (
          <p className="install-prompt__text">Install for a full-screen, app-like experience.</p>
        ) : (
          <p className="install-prompt__text">
            Tap the Share button, then choose <strong>Add to Home Screen</strong>.
          </p>
        )}
      </div>
      <div className="install-prompt__actions">
        {deferred ? (
          <button type="button" className="install-prompt__install" onClick={install}>
            Install
          </button>
        ) : null}
        <button
          type="button"
          className="install-prompt__dismiss"
          onClick={dismiss}
          aria-label="Dismiss install prompt"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
