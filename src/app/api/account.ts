// account.ts — Client class for Pass E AccountSettings.
//
// Mirrors the CompanionService pattern (apiRequest envelope, typed error
// surface) so AccountSettings.tsx can use it the same way other pages
// use CompanionService.

import type {
  AccountDataExportRequest,
  AccountDataExportCreateResponse,
  AccountDeletionCreateRequest,
  AccountDeletionResponse,
  AccountPrivacyUpdateRequest,
  AccountPrivacyUpdateResponse,
  AccountResponse,
  AccountSafetyReportListResponse,
  SafetyReportRequest,
  SafetyReportResponse,
} from "../../shared/contracts";
import { csrfHeaders } from "./csrf";

type ApiEnvelope<T> = {
  data: T;
  requestId: string;
};

type ApiFailure = {
  code?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
};

export class AccountApiError extends Error {
  status: number;
  code?: string;
  fieldErrors?: Record<string, string>;

  constructor(message: string, status: number, code?: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = "AccountApiError";
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...csrfHeaders(init.headers),
    },
  });

  const payload = await readJson<ApiEnvelope<T> | ApiFailure>(response);
  if (!response.ok) {
    const failure = payload as ApiFailure;
    throw new AccountApiError(
      failure.message || "Request failed.",
      response.status,
      failure.code,
      failure.fieldErrors,
    );
  }

  if (!("data" in payload)) {
    throw new AccountApiError("Malformed API response.", response.status);
  }

  return payload.data;
}

async function readJson<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    return {} as T;
  }
}

export const AccountService = {
  /** Bundled fetch — privacy + dataExport + deletion + safetyReports in one round trip. */
  getAccount(): Promise<AccountResponse> {
    return apiRequest<AccountResponse>("/api/account");
  },

  /** Patch any subset of the 4 privacy toggles. */
  updatePrivacy(payload: AccountPrivacyUpdateRequest): Promise<AccountPrivacyUpdateResponse> {
    return apiRequest<AccountPrivacyUpdateResponse>("/api/account/privacy", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  /** Request data export. Idempotent — returns existing active request if any. */
  requestDataExport(): Promise<AccountDataExportCreateResponse> {
    return apiRequest<AccountDataExportCreateResponse>("/api/account/data-export", {
      method: "POST",
      body: JSON.stringify({}),
    });
  },

  /** Latest data export record, or null if never requested. */
  getDataExport(): Promise<AccountDataExportRequest | null> {
    return apiRequest<AccountDataExportRequest | null>("/api/account/data-export");
  },

  /** Soft-delete request. Requires payload.confirmation === "DELETE". */
  requestDeletion(payload: AccountDeletionCreateRequest): Promise<AccountDeletionResponse> {
    return apiRequest<AccountDeletionResponse>("/api/account/deletion", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /** Cancel pending deletion. Safe to call when no request exists. */
  cancelDeletion(): Promise<AccountDeletionResponse> {
    return apiRequest<AccountDeletionResponse>("/api/account/deletion", {
      method: "DELETE",
    });
  },

  /** List safety reports submitted by this account. */
  listSafetyReports(): Promise<AccountSafetyReportListResponse> {
    return apiRequest<AccountSafetyReportListResponse>("/api/account/safety-reports");
  },

  /** Submit a new safety report. */
  submitSafetyReport(payload: SafetyReportRequest): Promise<SafetyReportResponse> {
    return apiRequest<SafetyReportResponse>("/api/safety/reports", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
