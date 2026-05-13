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
          { path: "discovery", element: <PlaceholderPage title="Traveller discovery" description="Verified companion browsing will use the traveller discovery endpoint and controlled filters." /> },
          { path: "inbox", element: <PlaceholderPage title="Traveller inbox" description="Inquiry messages will stay private, reviewed, and separated from public profile browsing." /> },
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
          { path: "dashboard", element: <PlaceholderPage title="Companion dashboard" description="Companion visibility, verification, and availability will stay controlled by reviewed state." /> },
          { path: "inbox", element: <PlaceholderPage title="Companion inbox" description="Inbound inquiries will show review status before routing or payment decisions." /> },
          { path: "plans", element: <PlaceholderPage title="Companion plans" description="Availability and city context will be editable without exposing unapproved public data." /> },
          { path: "profile", element: <AccountSettings /> },
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
