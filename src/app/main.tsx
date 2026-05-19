import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { PublicShell } from "./shells/PublicShell";
import { TravellerShell } from "./shells/TravellerShell";
import { CompanionShell } from "./shells/CompanionShell";
import { MuseChatPage } from "./pages/MuseChatPage";
import { PublicHome } from "./pages/PublicHome";
import { PublicDiscoveryPage } from "./pages/PublicDiscoveryPage";
import { PublicPaymentsPage } from "./pages/PublicPaymentsPage";
import { PublicSafetyPage } from "./pages/PublicSafetyPage";
import { CityOverviewPage } from "./pages/CityOverviewPage";
import { ExperiencePage } from "./pages/ExperiencePage";
import { AuthStart } from "./pages/AuthStart";
import { AuthVerify } from "./pages/AuthVerify";
import { AccountSettings } from "./pages/AccountSettings";
import { TravellerDashboardPage } from "./pages/TravellerDashboardPage";
import { TravellerDiscovery } from "./pages/TravellerDiscovery";
import { CompanionProfilePage } from "./pages/CompanionProfilePage";
import { InquiryCreatePage } from "./pages/InquiryCreatePage";
import { TravellerInquiriesPage } from "./pages/TravellerInquiriesPage";
import { TravellerInquiryDetailPage } from "./pages/TravellerInquiryDetailPage";
import { TravellerSessionsPage } from "./pages/TravellerSessionsPage";
import { TravellerSessionDetailPage } from "./pages/TravellerSessionDetailPage";
import { CompanionDashboardPage } from "./pages/CompanionDashboardPage";
import { CompanionOnboardingPage } from "./pages/CompanionOnboardingPage";
import { CompanionProfileManagerPage } from "./pages/CompanionProfileManagerPage";
import { CompanionAvailabilityPage } from "./pages/CompanionAvailabilityPage";
import { CompanionInboxPage } from "./pages/CompanionInboxPage";
import { CompanionInquiryDetailPage } from "./pages/CompanionInquiryDetailPage";
import { CompanionSafetyPage } from "./pages/CompanionSafetyPage";
import { AuthProvider } from "./api/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import "./styles.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicShell />,
    children: [
      { index: true, element: <MuseChatPage /> },
      { path: "overview", element: <PublicHome /> },
      { path: "cities/phuket", element: <CityOverviewPage citySlug="phuket" /> },
      { path: "cities/koh-samui", element: <CityOverviewPage citySlug="koh-samui" /> },
      { path: "cities/koh-phangan", element: <CityOverviewPage citySlug="koh-phangan" /> },
      { path: "experiences/nightlife", element: <ExperiencePage experienceSlug="nightlife" /> },
      { path: "experiences/island-explorer", element: <ExperiencePage experienceSlug="island-explorer" /> },
      { path: "experiences/muay-thai-night", element: <ExperiencePage experienceSlug="muay-thai-night" /> },
      { path: "experiences/private-dining", element: <ExperiencePage experienceSlug="private-dining" /> },
      { path: "experiences/local-guidance", element: <ExperiencePage experienceSlug="local-guidance" /> },
      { path: "discovery", element: <PublicDiscoveryPage /> },
      { path: "safety", element: <PublicSafetyPage /> },
      { path: "payments", element: <PublicPaymentsPage /> },
      { path: "auth/login", element: <AuthStart /> },
      { path: "auth/verify", element: <AuthVerify /> },
    ],
  },
  {
    path: "/traveller",
    element: <ProtectedRoute allowedRoles={["traveller"]} />,
    children: [
      {
        element: <TravellerShell />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", element: <TravellerDashboardPage /> },
          { path: "discovery", element: <TravellerDiscovery /> },
          { path: "companions/:companionId", element: <CompanionProfilePage /> },
          { path: "companions/:companionId/inquire", element: <InquiryCreatePage /> },
          { path: "inbox", element: <TravellerInquiriesPage /> },
          { path: "inbox/:inquiryId", element: <TravellerInquiryDetailPage /> },
          { path: "inquiries/:inquiryId", element: <TravellerInquiryDetailPage /> },
          { path: "plans", element: <TravellerSessionsPage /> },
          { path: "plans/:sessionId", element: <TravellerSessionDetailPage /> },
          { path: "account", element: <AccountSettings /> },
        ]
      }
    ],
  },
  {
    path: "/companion",
    element: <ProtectedRoute allowedRoles={["companion"]} />,
    children: [
      {
        element: <CompanionShell />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", element: <CompanionDashboardPage /> },
          { path: "onboarding", element: <CompanionOnboardingPage /> },
          { path: "inbox", element: <CompanionInboxPage /> },
          { path: "inbox/:inquiryId", element: <CompanionInquiryDetailPage /> },
          { path: "plans", element: <CompanionAvailabilityPage /> },
          { path: "profile", element: <CompanionProfileManagerPage /> },
          { path: "safety", element: <CompanionSafetyPage /> },
          { path: "account", element: <AccountSettings /> },
        ]
      }
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
