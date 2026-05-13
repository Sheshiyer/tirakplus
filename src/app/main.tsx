import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { PublicShell } from "./shells/PublicShell";
import { TravellerShell } from "./shells/TravellerShell";
import { CompanionShell } from "./shells/CompanionShell";
import { PublicHome } from "./pages/PublicHome";
import { CityOverviewPage } from "./pages/CityOverviewPage";
import { ExperiencePage } from "./pages/ExperiencePage";
import { AuthStart } from "./pages/AuthStart";
import { AuthVerify } from "./pages/AuthVerify";
import { AccountSettings } from "./pages/AccountSettings";
import { TravellerDiscovery } from "./pages/TravellerDiscovery";
import { CompanionProfilePage } from "./pages/CompanionProfilePage";
import { InquiryCreatePage } from "./pages/InquiryCreatePage";
import { TravellerInquiriesPage } from "./pages/TravellerInquiriesPage";
import { TravellerInquiryDetailPage } from "./pages/TravellerInquiryDetailPage";
import { CompanionDashboardPage } from "./pages/CompanionDashboardPage";
import { CompanionOnboardingPage } from "./pages/CompanionOnboardingPage";
import { CompanionProfileManagerPage } from "./pages/CompanionProfileManagerPage";
import { CompanionAvailabilityPage } from "./pages/CompanionAvailabilityPage";
import { CompanionInboxPage } from "./pages/CompanionInboxPage";
import { CompanionSafetyPage } from "./pages/CompanionSafetyPage";
import { AuthProvider } from "./api/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import "./styles.css";

function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <section className="placeholder-page">
      <p className="eyebrow">Staged route</p>
      <h1>{title}</h1>
      <p>{description}</p>
    </section>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicShell />,
    children: [
      { index: true, element: <PublicHome /> },
      { path: "cities/phuket", element: <CityOverviewPage citySlug="phuket" /> },
      { path: "cities/koh-samui", element: <CityOverviewPage citySlug="koh-samui" /> },
      { path: "cities/koh-phangan", element: <CityOverviewPage citySlug="koh-phangan" /> },
      { path: "experiences/nightlife", element: <ExperiencePage experienceSlug="nightlife" /> },
      { path: "experiences/island-explorer", element: <ExperiencePage experienceSlug="island-explorer" /> },
      { path: "experiences/muay-thai-night", element: <ExperiencePage experienceSlug="muay-thai-night" /> },
      { path: "experiences/private-dining", element: <ExperiencePage experienceSlug="private-dining" /> },
      { path: "experiences/local-guidance", element: <ExperiencePage experienceSlug="local-guidance" /> },
      { path: "discovery", element: <PlaceholderPage title="Public discovery" description="Discovery is routed through staged API contracts before profile browsing expands." /> },
      { path: "safety", element: <PlaceholderPage title="Safety information" description="Safety guidance stays visible before any inquiry or payment state." /> },
      { path: "payments", element: <PlaceholderPage title="Payment provider status" description="Payment rails remain disabled until written provider approval exists." /> },
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
          { index: true, element: <Navigate to="discovery" replace /> },
          { path: "discovery", element: <TravellerDiscovery /> },
          { path: "companions/:companionId", element: <CompanionProfilePage /> },
          { path: "companions/:companionId/inquire", element: <InquiryCreatePage /> },
          { path: "inbox", element: <TravellerInquiriesPage /> },
          { path: "inbox/:inquiryId", element: <TravellerInquiryDetailPage /> },
          { path: "inquiries/:inquiryId", element: <TravellerInquiryDetailPage /> },
          { path: "plans", element: <PlaceholderPage title="Traveller plans" description="Planning surfaces will connect city context, experience intent, and inquiry status." /> },
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
