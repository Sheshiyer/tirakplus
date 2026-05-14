import {
  cities,
  companionDraftProfile,
  companionInquiries,
  companionOptions,
  companionProfiles,
  companionReviewStates,
  companions,
  discoveryFilterOptions,
  entryPaths,
  experiences,
  safetyContent,
  travellerInquiries,
} from "./staged-data";
import type {
  AccountPrivacySettings,
  AccountResponse,
  AvailabilityWindow,
  CitySlug,
  CompanionDraftProfile,
  CompanionInquirySummary,
  CompanionOptionSet,
  CompanionProfile,
  CompanionReviewStateCard,
  DiscoveryFilterModel,
  ExperienceSlug,
  ExperienceSummary,
  HomeEntryPath,
  SafetyContent,
  SafetyReportRequest,
  SafetyReportResponse,
  Session,
  TravellerInquiryDetail,
} from "../shared/contracts";

export type ExperienceFilter = {
  city?: string | null;
  category?: string | null;
};

export type StagedDataProvider = ReturnType<typeof createStagedDataProvider>;

const defaultPrivacy: AccountPrivacySettings = {
  showEmailInAccount: true,
  allowRoleSwitch: true,
  receiveSafetyUpdates: true,
  receiveInquiryUpdates: true,
};

export function createStagedDataProvider() {
  return {
    getHome() {
      return {
        brand: {
          name: "Tirak Plus",
          promise: "Private Thailand companion concierge for reviewed adult travellers.",
        },
        cities,
        highlights: ["Verified visibility", "Private inquiries", "Provider approval before payments"],
        entryPaths,
      };
    },

    listExperiences(filter: ExperienceFilter): ExperienceSummary[] {
      return experiences.filter((item) => {
        const cityMatches = filter.city ? item.city === filter.city : true;
        const categoryMatches = filter.category ? item.slug === filter.category : true;
        return cityMatches && categoryMatches;
      });
    },

    listCities() {
      return cities;
    },

    listEntryPaths(): HomeEntryPath[] {
      return entryPaths;
    },

    listCompanionPreviews() {
      return companions;
    },

    getDiscoveryFilterOptions(): DiscoveryFilterModel {
      return discoveryFilterOptions;
    },

    getCompanionProfile(id: string): CompanionProfile | undefined {
      return companionProfiles.find((item) => item.id === id);
    },

    listTravellerInquiries(): TravellerInquiryDetail[] {
      return travellerInquiries;
    },

    getTravellerInquiry(id: string): TravellerInquiryDetail | undefined {
      return travellerInquiries.find((item) => item.id === id);
    },

    getCompanionDraftProfile(): CompanionDraftProfile {
      return companionDraftProfile;
    },

    getCompanionOptions(): CompanionOptionSet {
      return companionOptions;
    },

    listCompanionReviewStates(): readonly CompanionReviewStateCard[] {
      return companionReviewStates;
    },

    listCompanionInquiries(): CompanionInquirySummary[] {
      return companionInquiries;
    },

    getSafetyContent(): SafetyContent {
      return safetyContent;
    },

    createSafetyReport(payload: SafetyReportRequest): SafetyReportResponse {
      return {
        reportId: `safe_${crypto.randomUUID()}`,
        status: "submitted",
        nextStep:
          payload.contactAllowed
            ? "Tirak will review the report and may contact the signed-in account for safe follow-up."
            : "Tirak will review the report without using it for follow-up contact.",
      };
    },

    getAccount(session: Session): AccountResponse {
      return {
        profile: session.profile,
        privacy: defaultPrivacy,
        safetyState: {
          reportingAvailable: true,
          paymentComplianceGate: "active",
          note: "Payment creation remains disabled until provider and jurisdiction approval is recorded.",
        },
      };
    },

    updateAccountPrivacy(session: Session, privacy: Partial<AccountPrivacySettings>): AccountResponse {
      return {
        ...this.getAccount(session),
        privacy: {
          ...defaultPrivacy,
          ...sanitizeAccountPrivacy(privacy),
        },
      };
    },
  };
}

export function isProviderCity(value: unknown): value is CitySlug {
  return value === "bangkok" || value === "phuket" || value === "koh-samui" || value === "koh-phangan";
}

export function isProviderExperience(value: unknown): value is ExperienceSlug {
  return (
    value === "nightlife" ||
    value === "island-explorer" ||
    value === "muay-thai-night" ||
    value === "private-dining" ||
    value === "local-guidance"
  );
}

export function isProviderAvailabilityWindow(value: unknown): value is AvailabilityWindow {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const item = value as AvailabilityWindow;
  return (
    typeof item.id === "string" &&
    isProviderCity(item.city) &&
    typeof item.label === "string" &&
    (item.status === "available" || item.status === "tentative" || item.status === "hidden") &&
    typeof item.note === "string"
  );
}

function sanitizeAccountPrivacy(privacy: Partial<AccountPrivacySettings>): Partial<AccountPrivacySettings> {
  return {
    ...(typeof privacy.showEmailInAccount === "boolean" ? { showEmailInAccount: privacy.showEmailInAccount } : {}),
    ...(typeof privacy.allowRoleSwitch === "boolean" ? { allowRoleSwitch: privacy.allowRoleSwitch } : {}),
    ...(typeof privacy.receiveSafetyUpdates === "boolean" ? { receiveSafetyUpdates: privacy.receiveSafetyUpdates } : {}),
    ...(typeof privacy.receiveInquiryUpdates === "boolean" ? { receiveInquiryUpdates: privacy.receiveInquiryUpdates } : {}),
  };
}
