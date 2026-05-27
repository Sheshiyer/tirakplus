import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type {
  AccountDataExportRequest,
  AccountDeletionRecord,
  AccountPrivacySettings,
  AccountResponse,
  AccountSafetyReportSummary,
  SafetyReportRequest,
} from "../../shared/contracts";
import { AccountApiError, AccountService } from "../api/account";
import { useAuth } from "../api/AuthContext";
import { Button } from "../components/ui/Button";
import { Checkbox } from "../components/ui/Checkbox";
import { FeedbackState } from "../components/ui/FeedbackState";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { SkeletonCard } from "../components/ui/Skeleton";
import { Textarea } from "../components/ui/Textarea";

type LoadState =
  | { status: "loading" }
  | { status: "ready"; account: AccountResponse }
  | { status: "error"; message: string };

const PRIVACY_LABELS: Array<{ key: keyof AccountPrivacySettings; label: string; description: string }> = [
  {
    key: "showEmailInAccount",
    label: "Show my email in this view",
    description: "Hide your email from the account header when other people glance at your screen.",
  },
  {
    key: "allowRoleSwitch",
    label: "Allow role switching",
    description: "Turn off to keep this account in a single role and prevent accidental switches.",
  },
  {
    key: "receiveSafetyUpdates",
    label: "Receive safety updates",
    description: "Tirak emails you when a safety report you filed moves into review or is resolved.",
  },
  {
    key: "receiveInquiryUpdates",
    label: "Receive inquiry updates",
    description: "Notifications when a companion responds, a plan changes, or a session is confirmed.",
  },
];

export function AccountSettings() {
  const { session, logout, switchRole, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });

  // Functional setState helper so callbacks from each card don't fight each
  // other's state. Without this, concurrent updates from two cards each capture
  // loadState.account at render time and spread their own stale copy on save.
  const patchAccount = (patch: Partial<AccountResponse>) =>
    setLoadState((prev) => {
      if (prev.status !== "ready") return prev;
      return { status: "ready", account: { ...prev.account, ...patch } };
    });

  // Load account once on mount.
  useEffect(() => {
    let cancelled = false;
    AccountService.getAccount()
      .then((account) => {
        if (!cancelled) setLoadState({ status: "ready", account });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setLoadState({
            status: "error",
            message: err instanceof Error ? err.message : "Account settings could not be loaded.",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleSwitchRole = async () => {
    if (session?.profile.role === "traveller") {
      await switchRole("companion");
      navigate("/companion");
    } else {
      await switchRole("traveller");
      navigate("/traveller");
    }
  };

  if (!session) return null;

  const currentRole = session.profile.role;
  const targetRole = currentRole === "traveller" ? "companion" : "traveller";
  // Respect the user's saved preferences from this point on.
  const privacy = loadState.status === "ready" ? loadState.account.privacy : null;
  const roleSwitchAllowed = privacy?.allowRoleSwitch ?? true;
  const emailVisible = privacy?.showEmailInAccount ?? true;

  return (
    <section className="account-page">
      <div className="account-heading">
        <p className="eyebrow">Account</p>
        <h1>Account and privacy</h1>
        <p>Manage access, visibility, notifications, and safety controls.</p>
      </div>

      <div className="account-panel">
        <div className="account-row">
          <div>
            <h2>Signed-in role</h2>
            <p>
              You are signed in as a <strong>{currentRole}</strong>. This account can open traveller and companion areas
              without another login.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={handleSwitchRole}
            disabled={isLoading || !roleSwitchAllowed}
            title={
              !roleSwitchAllowed
                ? "Role switching is off in your preferences below."
                : undefined
            }
          >
            {isLoading ? "Switching..." : !roleSwitchAllowed ? "Role switching off" : `Switch to ${targetRole}`}
          </Button>
        </div>

        {error && <p className="auth-error">{error.message}</p>}

        <div className="account-row account-row-last">
          <div>
            <h2>Private session</h2>
            <p>
              {emailVisible
                ? `Signed in as ${session.profile.email}. `
                : "Email hidden by your preferences. "}
              Verification documents, exact plan details, and payment prompts stay out of this account view.
            </p>
          </div>
          <Button variant="danger" onClick={handleLogout} disabled={isLoading}>
            {isLoading ? "Signing out..." : "Sign out"}
          </Button>
        </div>

        {loadState.status === "loading" && (
          <div className="account-controls-grid" aria-busy="true">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {loadState.status === "error" && (
          <FeedbackState
            variant="error"
            title="Account controls unavailable"
            description={loadState.message}
            actionLabel="Retry"
            onAction={() => window.location.reload()}
          />
        )}

        {loadState.status === "ready" && (
          <div className="account-controls-grid" aria-label="Privacy, notifications, data, and safety controls">
            <PreferencesCard
              initialPrivacy={loadState.account.privacy}
              onUpdated={(nextPrivacy) => patchAccount({ privacy: nextPrivacy })}
            />
            <DataExportCard
              initial={loadState.account.dataExport ?? null}
              onUpdated={(dataExport) => patchAccount({ dataExport })}
            />
            <DeletionCard
              initial={loadState.account.deletion ?? null}
              onUpdated={(deletion) => patchAccount({ deletion })}
            />
            <SafetyReportsCard
              initial={loadState.account.safetyReports ?? []}
              onUpdated={(safetyReports) => patchAccount({ safetyReports })}
            />
          </div>
        )}
      </div>
    </section>
  );
}

// ===== Preferences (4 toggles, one save button) =====

function PreferencesCard({
  initialPrivacy,
  onUpdated,
}: {
  initialPrivacy: AccountPrivacySettings;
  onUpdated: (next: AccountPrivacySettings) => void;
}) {
  const [draft, setDraft] = useState<AccountPrivacySettings>(initialPrivacy);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const dirty = useMemo(() => {
    return (Object.keys(draft) as Array<keyof AccountPrivacySettings>).some(
      (key) => draft[key] !== initialPrivacy[key],
    );
  }, [draft, initialPrivacy]);

  const save = async () => {
    setSaveState("saving");
    setErrorMessage(null);
    try {
      const result = await AccountService.updatePrivacy(draft);
      setDraft(result.account.privacy);
      onUpdated(result.account.privacy);
      setSaveState("saved");
      setTimeout(() => setSaveState((s) => (s === "saved" ? "idle" : s)), 1800);
    } catch (err) {
      setSaveState("error");
      setErrorMessage(err instanceof Error ? err.message : "Could not save preferences.");
    }
  };

  return (
    <article className="account-control-card account-control-preferences">
      <header>
        <span aria-hidden="true" />
        <div>
          <h3>Preferences</h3>
          <p>Toggle what is visible in this account view and which updates Tirak sends you.</p>
        </div>
      </header>
      <div className="account-control-body">
        <div className="choice-grid" role="group" aria-label="Preference toggles">
          {PRIVACY_LABELS.map(({ key, label, description }) => (
            <Checkbox
              key={key}
              label={label}
              helperText={description}
              checked={draft[key]}
              onChange={(event) => setDraft({ ...draft, [key]: event.target.checked })}
            />
          ))}
        </div>
        <div className="account-control-actions">
          <Button type="button" variant="primary" onClick={save} disabled={!dirty || saveState === "saving"}>
            {saveState === "saving" ? "Saving..." : saveState === "saved" ? "Saved" : "Save preferences"}
          </Button>
          {saveState === "error" && errorMessage && (
            <p className="account-control-status account-control-status-error">{errorMessage}</p>
          )}
        </div>
      </div>
    </article>
  );
}

// ===== Data export =====

function DataExportCard({
  initial,
  onUpdated,
}: {
  initial: AccountDataExportRequest | null;
  onUpdated: (next: AccountDataExportRequest | null) => void;
}) {
  const [record, setRecord] = useState<AccountDataExportRequest | null>(initial);
  const [actionState, setActionState] = useState<"idle" | "requesting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const request = async () => {
    setActionState("requesting");
    setErrorMessage(null);
    setMessage(null);
    try {
      const result = await AccountService.requestDataExport();
      setRecord(result.export);
      onUpdated(result.export);
      setMessage(result.message);
      setActionState("idle");
    } catch (err) {
      setActionState("error");
      setErrorMessage(err instanceof Error ? err.message : "Could not request a data export.");
    }
  };

  const status = record?.status;
  const isQueuedOrPreparing = status === "queued" || status === "preparing";

  return (
    <article className="account-control-card account-control-export">
      <header>
        <span aria-hidden="true" />
        <div>
          <h3>Data export</h3>
          <p>Receive a private archive of your profile, plans, and message history.</p>
        </div>
      </header>
      <div className="account-control-body">
        {record && (
          <p className="account-control-meta">
            Last requested {formatDateTime(record.requestedAt)} · status <strong>{prettyStatus(status ?? null)}</strong>
            {record.status === "ready" && record.expiresAt && (
              <> · download available until {formatDateTime(record.expiresAt)}</>
            )}
          </p>
        )}
        {!record && <p className="account-control-meta">You have not requested an export yet.</p>}
        <div className="account-control-actions">
          <Button
            type="button"
            variant="primary"
            onClick={request}
            disabled={actionState === "requesting" || isQueuedOrPreparing}
          >
            {actionState === "requesting"
              ? "Requesting..."
              : isQueuedOrPreparing
                ? "Export in progress"
                : record?.status === "ready"
                  ? "Request a fresh export"
                  : "Request export"}
          </Button>
          {message && <p className="account-control-status">{message}</p>}
          {actionState === "error" && errorMessage && (
            <p className="account-control-status account-control-status-error">{errorMessage}</p>
          )}
        </div>
      </div>
    </article>
  );
}

// ===== Account deletion (soft, 7d grace) =====

function DeletionCard({
  initial,
  onUpdated,
}: {
  initial: AccountDeletionRecord | null;
  onUpdated: (next: AccountDeletionRecord | null) => void;
}) {
  const [record, setRecord] = useState<AccountDeletionRecord | null>(initial);
  const [confirmText, setConfirmText] = useState("");
  const [reason, setReason] = useState("");
  const [actionState, setActionState] = useState<"idle" | "submitting" | "cancelling" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showForm, setShowForm] = useState(false);

  const pending = record?.status === "pending";

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (confirmText !== "DELETE") return;
    setActionState("submitting");
    setErrorMessage(null);
    setFieldErrors({});
    setStatusMessage(null);
    try {
      const result = await AccountService.requestDeletion({
        confirmation: confirmText,
        reason: reason.trim() || undefined,
      });
      setRecord(result.deletion);
      onUpdated(result.deletion);
      setStatusMessage(result.message);
      setShowForm(false);
      setConfirmText("");
      setReason("");
      setActionState("idle");
    } catch (err) {
      setActionState("error");
      if (err instanceof AccountApiError) {
        setFieldErrors(err.fieldErrors || {});
        setErrorMessage(err.message);
      } else {
        setErrorMessage(err instanceof Error ? err.message : "Could not submit deletion request.");
      }
    }
  };

  const cancel = async () => {
    setActionState("cancelling");
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      const result = await AccountService.cancelDeletion();
      setRecord(result.deletion);
      onUpdated(result.deletion);
      setStatusMessage(result.message);
      setActionState("idle");
    } catch (err) {
      setActionState("error");
      setErrorMessage(err instanceof Error ? err.message : "Could not cancel deletion request.");
    }
  };

  return (
    <article className="account-control-card account-control-deletion">
      <header>
        <span aria-hidden="true" />
        <div>
          <h3>Account deletion</h3>
          <p>Close this account with a seven-day grace window. Cancel anytime before the window closes.</p>
        </div>
      </header>
      <div className="account-control-body">
        {pending && record ? (
          <div className="account-deletion-pending">
            <p>
              Account scheduled to close on <strong>{formatDate(record.scheduledFor)}</strong>{" "}
              ({daysUntil(record.scheduledFor)} days from now). Your profile, inquiries, and saved companions stay
              paused until then.
            </p>
            <div className="account-control-actions">
              <Button type="button" variant="secondary" onClick={cancel} disabled={actionState === "cancelling"}>
                {actionState === "cancelling" ? "Cancelling..." : "Cancel deletion"}
              </Button>
              {statusMessage && <p className="account-control-status">{statusMessage}</p>}
              {actionState === "error" && errorMessage && (
                <p className="account-control-status account-control-status-error">{errorMessage}</p>
              )}
            </div>
          </div>
        ) : showForm ? (
          <form className="account-deletion-form" onSubmit={submit}>
            <p>
              Deleting your account starts a seven-day grace window. During those seven days you can sign in and cancel
              from this page. After that, your profile, inquiries, and saved companions are removed.
            </p>
            <Textarea
              label="Why are you leaving? (optional)"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              helperText="Helps Tirak improve. Visible only to internal review."
            />
            <Input
              label="Type DELETE in capital letters to confirm"
              value={confirmText}
              onChange={(event) => setConfirmText(event.target.value)}
              autoComplete="off"
              helperText="Exact match required."
              error={
                fieldErrors.confirmation ||
                (confirmText.length > 0 && confirmText !== "DELETE" ? "Type DELETE exactly." : undefined)
              }
            />
            <div className="account-control-actions">
              <Button
                type="submit"
                variant="danger"
                disabled={confirmText !== "DELETE" || actionState === "submitting"}
              >
                {actionState === "submitting" ? "Submitting..." : "Delete account"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowForm(false);
                  setConfirmText("");
                  setReason("");
                  setErrorMessage(null);
                }}
                disabled={actionState === "submitting"}
              >
                Keep account
              </Button>
              {actionState === "error" && errorMessage && (
                <p className="account-control-status account-control-status-error">{errorMessage}</p>
              )}
            </div>
          </form>
        ) : (
          <div className="account-control-actions">
            <Button type="button" variant="danger" onClick={() => setShowForm(true)}>
              Delete my account
            </Button>
            {statusMessage && <p className="account-control-status">{statusMessage}</p>}
          </div>
        )}
      </div>
    </article>
  );
}

// ===== Safety reports =====

const SAFETY_TARGET_OPTIONS = [
  { value: "profile", label: "A profile" },
  { value: "inquiry", label: "An inquiry" },
  { value: "payment", label: "A payment" },
  { value: "account", label: "An account behaviour" },
  { value: "other", label: "Something else" },
];

const SAFETY_REASON_OPTIONS = [
  { value: "privacy", label: "Privacy concern" },
  { value: "unsafe_request", label: "Unsafe request" },
  { value: "payment_pressure", label: "Payment pressure" },
  { value: "profile_accuracy", label: "Profile accuracy" },
  { value: "other", label: "Other" },
];

function SafetyReportsCard({
  initial,
  onUpdated,
}: {
  initial: AccountSafetyReportSummary[];
  onUpdated: (next: AccountSafetyReportSummary[]) => void;
}) {
  const [reports, setReports] = useState<AccountSafetyReportSummary[]>(initial);
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<SafetyReportRequest>({
    targetType: "profile",
    reasonCategory: "privacy",
    summary: "",
    contactAllowed: true,
  });
  const [actionState, setActionState] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setActionState("submitting");
    setErrorMessage(null);
    setFieldErrors({});
    setStatusMessage(null);
    try {
      const response = await AccountService.submitSafetyReport(draft);
      // Refresh the list from the server so we get the canonical summary shape.
      const list = await AccountService.listSafetyReports();
      setReports(list.reports);
      onUpdated(list.reports);
      setStatusMessage(`${response.nextStep} (Report ID: ${response.reportId.slice(0, 12)}…)`);
      setShowForm(false);
      setDraft({ targetType: "profile", reasonCategory: "privacy", summary: "", contactAllowed: true });
      setActionState("idle");
    } catch (err) {
      if (err instanceof AccountApiError) {
        setFieldErrors(err.fieldErrors || {});
        setErrorMessage(err.message);
      } else {
        setErrorMessage(err instanceof Error ? err.message : "Could not submit report.");
      }
      setActionState("error");
    }
  };

  return (
    <article className="account-control-card account-control-safety">
      <header>
        <span aria-hidden="true" />
        <div>
          <h3>Safety reports</h3>
          <p>Submit a private safety report or review reports you have already filed.</p>
        </div>
      </header>
      <div className="account-control-body">
        {reports.length === 0 ? (
          <p className="account-control-meta">No safety reports filed from this account yet.</p>
        ) : (
          <ul className="account-safety-list" aria-label="Past safety reports">
            {reports.map((report) => (
              <li key={report.id}>
                <p className="meta">
                  {formatDateTime(report.submittedAt)} · {report.reasonCategory.replace(/_/g, " ")} · {report.status.replace(/_/g, " ")}
                </p>
                <p>{report.summary}</p>
              </li>
            ))}
          </ul>
        )}

        {showForm ? (
          <form className="account-safety-form" onSubmit={submit}>
            <Select
              label="What is the report about?"
              value={draft.targetType}
              options={SAFETY_TARGET_OPTIONS}
              onChange={(event) =>
                setDraft({ ...draft, targetType: event.target.value as SafetyReportRequest["targetType"] })
              }
            />
            <Select
              label="Reason"
              value={draft.reasonCategory}
              options={SAFETY_REASON_OPTIONS}
              onChange={(event) =>
                setDraft({ ...draft, reasonCategory: event.target.value as SafetyReportRequest["reasonCategory"] })
              }
            />
            <Textarea
              label="What happened?"
              value={draft.summary}
              error={fieldErrors.summary}
              helperText="Concrete details help review act faster. Stays private to Tirak's safety team."
              onChange={(event) => setDraft({ ...draft, summary: event.target.value })}
            />
            <Checkbox
              label="Tirak may contact me about this report"
              checked={draft.contactAllowed}
              onChange={(event) => setDraft({ ...draft, contactAllowed: event.target.checked })}
            />
            <div className="account-control-actions">
              <Button type="submit" variant="primary" disabled={actionState === "submitting"}>
                {actionState === "submitting" ? "Submitting..." : "Submit report"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowForm(false)}
                disabled={actionState === "submitting"}
              >
                Cancel
              </Button>
              {actionState === "error" && errorMessage && (
                <p className="account-control-status account-control-status-error">{errorMessage}</p>
              )}
            </div>
          </form>
        ) : (
          <div className="account-control-actions">
            <Button type="button" variant="secondary" onClick={() => setShowForm(true)}>
              New safety report
            </Button>
            {statusMessage && <p className="account-control-status">{statusMessage}</p>}
          </div>
        )}
      </div>
    </article>
  );
}

// ===== formatting helpers =====

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function daysUntil(iso: string): number {
  try {
    const target = new Date(iso).getTime();
    const now = Date.now();
    return Math.max(0, Math.ceil((target - now) / (1000 * 60 * 60 * 24)));
  } catch {
    return 0;
  }
}

function prettyStatus(status: string | null): string {
  if (!status) return "—";
  return status.replace(/_/g, " ");
}
